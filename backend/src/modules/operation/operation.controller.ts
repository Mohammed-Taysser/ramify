import { Request, Response } from 'express';
import { Prisma } from 'prisma/generated';

import operationService from './operation.service';
import {
  CreateOperationInput,
  GetOperationByIdParams,
  GetOperationsListQuery,
  UpdateOperationInput,
} from './operation.validator';

import prisma from '@/apps/prisma';
import { AuthenticatedRequest } from '@/types/import';
import { BadRequestError, NotFoundError } from '@/utils/errors.utils';
import { sendPaginatedResponse, sendSuccessResponse } from '@/utils/response.utils';

async function getOperations(request: Request, response: Response) {
  const authenticatedRequest = request as unknown as AuthenticatedRequest<
    unknown,
    unknown,
    unknown,
    GetOperationsListQuery
  >;

  const query = authenticatedRequest.parsedQuery;

  const skip = (query.page - 1) * query.limit;

  const filters: Prisma.OperationWhereInput = {};

  if (query.operationType) {
    filters.operationType = {
      in: query.operationType,
    };
  }

  const [data, total] = await Promise.all([
    prisma.operation.findMany({
      skip,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.operation.count({
      where: filters,
    }),
  ]);

  sendPaginatedResponse({
    response,
    message: 'All operations',
    data,
    metadata: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  });
}

async function getOperationsList(request: Request, response: Response) {
  const authenticatedRequest = request as unknown as AuthenticatedRequest<
    unknown,
    unknown,
    unknown,
    GetOperationsListQuery
  >;

  const query = authenticatedRequest.parsedQuery;

  const filters: Prisma.OperationWhereInput = {};

  if (query.operationType) {
    filters.operationType = {
      in: query.operationType,
    };
  }

  const operations = await prisma.operation.findMany({
    select: {
      id: true,
      operationType: true,
    },
    where: filters,
  });

  sendSuccessResponse({ response, message: 'Operations list', data: operations });
}

async function getOperationById(request: Request, response: Response) {
  const authenticatedRequest = request as unknown as AuthenticatedRequest<
    GetOperationByIdParams,
    unknown,
    unknown,
    unknown
  >;

  const { params } = authenticatedRequest;

  const operation = await prisma.operation.findUnique({
    where: { id: params.operationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!operation) {
    throw new NotFoundError('Operation not found');
  }

  sendSuccessResponse({
    response,
    message: 'Operation found',
    data: operation,
  });
}

async function createOperation(request: Request, response: Response) {
  const authenticatedRequest = request as unknown as AuthenticatedRequest<
    unknown,
    unknown,
    CreateOperationInput,
    unknown
  >;

  const { body, user } = authenticatedRequest;

  let beforeValue: number;
  let discussionId: number;

  if (body.parentId === null || body.parentId === undefined) {
    // Root operation: get starting value from discussion
    if (!body.discussionId) {
      throw new BadRequestError('discussionId is required for root operations');
    }

    const discussion = await prisma.discussion.findUnique({
      where: { id: body.discussionId },
    });

    if (!discussion) {
      throw new NotFoundError('Discussion not found');
    }

    beforeValue = discussion.startingValue;
    discussionId = discussion.id;
  } else {
    // Child operation: get value from parent
    const parentOperation = await prisma.operation.findUnique({
      where: { id: body.parentId },
    });

    if (!parentOperation) {
      throw new NotFoundError('Parent operation not found');
    }

    beforeValue = parentOperation.afterValue;
    discussionId = parentOperation.discussionId;
  }

  // Check if discussion is ended
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    select: { isEnded: true },
  });

  if (discussion?.isEnded) {
    throw new BadRequestError('Cannot add operation to an ended discussion');
  }

  // Validate division by zero
  if (body.operation === 'DIVIDE' && body.value === 0) {
    throw new BadRequestError('Cannot divide by zero');
  }

  // Calculate afterValue based on operation type
  let afterValue = beforeValue;
  switch (body.operation) {
    case 'ADD':
      afterValue = beforeValue + body.value;
      break;
    case 'SUBTRACT':
      afterValue = beforeValue - body.value;
      break;
    case 'MULTIPLY':
      afterValue = beforeValue * body.value;
      break;
    case 'DIVIDE':
      afterValue = beforeValue / body.value;
      break;
  }

  const operation = await prisma.operation.create({
    data: {
      discussionId,
      parentId: body.parentId || null,
      title: body.title || `${body.operation} ${body.value}`,
      operationType: body.operation,
      value: body.value,
      beforeValue,
      afterValue,
      createdBy: user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  sendSuccessResponse({
    response,
    message: 'Operation created',
    data: operation,
    statusCode: 201,
  });
}

/**
 * Update an existing operation and recalculate all descendants
 * Uses transaction to ensure atomic updates
 */
const updateOperation = async (request: Request, response: Response): Promise<void> => {
  const { operationId } = request.params as unknown as { operationId: string };
  const body = request.body as UpdateOperationInput;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch current operation with discussion
    const operation = await tx.operation.findUnique({
      where: { id: Number(operationId) },
      include: { discussion: true },
    });

    if (!operation) {
      throw new NotFoundError('Operation not found');
    }

    // 2. Check if discussion is ended
    if (operation.discussion.isEnded) {
      throw new BadRequestError('Cannot update operation in ended discussion');
    }

    // 3. Determine new values (use provided or keep existing)
    const newValue = body.value ?? operation.value;
    const newType = body.operationType ?? operation.operationType;
    const newTitle = body.title ?? operation.title;

    // 4. Validate division by zero
    if (newType === 'DIVIDE' && newValue === 0) {
      throw new BadRequestError('Cannot divide by zero');
    }

    // 5. Get parent's afterValue (or discussion starting value for root ops)
    const parent = operation.parentId
      ? await tx.operation.findUnique({
          where: { id: operation.parentId },
          select: { afterValue: true },
        })
      : { afterValue: operation.discussion.startingValue };

    if (!parent) {
      throw new NotFoundError('Parent operation not found');
    }

    // 6. Calculate new afterValue for this operation
    const newAfterValue = operationService.calculateOperation(parent.afterValue, newType, newValue);

    // 7. Update the operation itself
    const updatedOperation = await tx.operation.update({
      where: { id: Number(operationId) },
      data: {
        value: newValue,
        operationType: newType,
        title: newTitle,
        beforeValue: parent.afterValue,
        afterValue: newAfterValue,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 8. Recalculate all descendants
    const affectedCount = await operationService.recalculateOperationTree(Number(operationId), tx);

    return { operation: updatedOperation, affectedCount };
  });

  sendSuccessResponse({
    response,
    message: `Operation updated. ${result.affectedCount} descendant(s) recalculated.`,
    statusCode: 200,
    data: result.operation,
  });
};

const operationController = {
  createOperation,
  updateOperation,
  getOperationById,
  getOperations,
  getOperationsList,
};

export default operationController;

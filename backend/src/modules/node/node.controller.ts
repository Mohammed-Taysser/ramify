import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

import { CreateNodeInput, GetNodeByIdParams, GetNodesListQuery } from './node.validator';

import prisma from '@/apps/prisma';
import { AuthenticatedRequest } from '@/types/import';
import { NotFoundError } from '@/utils/errors.utils';
import { sendPaginatedResponse, sendSuccessResponse } from '@/utils/response.utils';

async function getNodes(request: Request, response: Response) {
  const authenticatedRequest = request as unknown as AuthenticatedRequest<
    unknown,
    unknown,
    unknown,
    GetNodesListQuery
  >;

  const query = authenticatedRequest.parsedQuery;

  const skip = (query.page - 1) * query.limit;

  const filters: Prisma.NodeWhereInput = {};

  if (query.operation) {
    filters.operation = {
      in: query.operation,
    };
  }

  const [data, total] = await Promise.all([
    prisma.node.findMany({
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
    prisma.node.count({
      where: filters,
    }),
  ]);

  sendPaginatedResponse({
    response,
    message: 'All nodes',
    data,
    metadata: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  });
}

async function getNodesList(request: Request, response: Response) {
  const authenticatedRequest = request as unknown as AuthenticatedRequest<
    unknown,
    unknown,
    unknown,
    GetNodesListQuery
  >;

  const query = authenticatedRequest.parsedQuery;

  const filters: Prisma.NodeWhereInput = {};

  if (query.operation) {
    filters.operation = {
      in: query.operation,
    };
  }

  const nodes = await prisma.node.findMany({
    select: {
      id: true,
      operation: true,
    },
    where: filters,
  });

  sendSuccessResponse({ response, message: 'Nodes list', data: nodes });
}

async function getNodeById(request: Request, response: Response) {
  const authenticatedRequest = request as unknown as AuthenticatedRequest<
    GetNodeByIdParams,
    unknown,
    unknown,
    unknown
  >;

  const { params } = authenticatedRequest;

  const node = await prisma.node.findUnique({
    where: { id: params.nodeId },
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

  if (!node) {
    throw new NotFoundError('Node not found');
  }

  sendSuccessResponse({
    response,
    message: 'Node found',
    data: node,
  });
}

async function createNode(request: Request, response: Response) {
  const authenticatedRequest = request as unknown as AuthenticatedRequest<
    unknown,
    unknown,
    CreateNodeInput,
    unknown
  >;

  const { body, user } = authenticatedRequest;

  const parentNode = await prisma.node.findUnique({
    where: { id: body.parentId },
  });

  if (!parentNode) {
    throw new NotFoundError('Parent node not found');
  }

  if (body.operation === 'START' || body.operation === 'END') {
    return response.status(400).json({ error: 'Invalid operation' });
  }

  if (body.operation === 'DIVIDE' && body.value === 0) {
    return response.status(400).json({ error: 'cannot divide by zero' });
  }

  let nodeValue = 0;

  switch (body.operation) {
    case 'ADD':
      nodeValue = parentNode.totals + body.value;
      break;
    case 'SUBTRACT':
      nodeValue = parentNode.totals - body.value;
      break;
    case 'MULTIPLY':
      nodeValue = parentNode.totals * body.value;
      break;
    case 'DIVIDE':
      nodeValue = parentNode.totals / body.value;
      break;
  }

  const node = await prisma.node.create({
    data: {
      treeId: parentNode.treeId,
      parentId: parentNode.id,
      operation: body.operation,
      totals: nodeValue,
      createdBy: user.id,
      value: body.value,
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
    message: 'Node created',
    data: node,
    statusCode: 201,
  });
}

const nodeController = {
  createNode,
  getNodeById,
  getNodes,
  getNodesList,
};

export default nodeController;

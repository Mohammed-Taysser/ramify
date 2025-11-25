import { OPERATION_TYPE } from 'prisma/generated';
import { z } from 'zod';

import { zodParseEnumList } from '@/utils/zod-utils';
import { basePaginationSchema } from '@/validations/base.validation';

// Custom validation for decimal numbers
const decimalNumber = z
  .number()
  .or(z.string().transform((val) => Number.parseFloat(val)))
  .refine((val) => !Number.isNaN(val) && Number.isFinite(val), {
    message: 'Value must be a valid finite number',
  })
  .refine((val) => Math.abs(val) <= Number.MAX_SAFE_INTEGER, {
    message: 'Value exceeds safe number range',
  })
  .transform(Number);

const getOperationsListSchema = {
  query: basePaginationSchema.extend({
    operationType: zodParseEnumList<OPERATION_TYPE>(Object.values(OPERATION_TYPE)).optional(),
  }),
};

const getOperationByIdSchema = {
  params: z.object({
    operationId: z.coerce.number().positive().int(),
  }),
};

const createOperationSchema = {
  body: z
    .object({
      operation: z.enum(OPERATION_TYPE),
      value: decimalNumber,
      parentId: z.coerce.number().positive().int().nullable().optional(),
      discussionId: z.coerce.number().positive().int().optional(),
      title: z.string().min(1).max(200).optional(),
    })
    .refine((data) => data.parentId !== null || data.discussionId !== undefined, {
      message: 'Either parentId or discussionId must be provided',
    }),
};

const updateOperationSchema = {
  params: z.object({
    operationId: z.coerce.number().positive().int(),
  }),
  body: z
    .object({
      value: decimalNumber.optional(),
      operationType: z.enum(OPERATION_TYPE).optional(),
      title: z.string().min(1).max(200).optional(),
    })
    .refine(
      (data) => {
        return (
          data.value !== undefined || data.operationType !== undefined || data.title !== undefined
        );
      },
      {
        message: 'At least one field (value, operationType, or title) must be provided',
      }
    ),
};

type CreateOperationInput = z.infer<typeof createOperationSchema.body>;
type UpdateOperationInput = z.infer<typeof updateOperationSchema.body>;
type GetOperationsListQuery = z.infer<typeof getOperationsListSchema.query>;
type GetOperationByIdParams = z.infer<typeof getOperationByIdSchema.params>;

const operationValidator = {
  createOperationSchema,
  updateOperationSchema,
  getOperationsListSchema,
  getOperationByIdSchema,
};

export type {
  CreateOperationInput,
  GetOperationByIdParams,
  GetOperationsListQuery,
  UpdateOperationInput,
};

export default operationValidator;

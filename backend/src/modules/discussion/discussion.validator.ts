import { z } from 'zod';

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

const getDiscussionsListSchema = {
  query: basePaginationSchema.extend({
    title: z.string().trim().min(3).max(100).optional(),
    userId: z.coerce.number().positive().int().optional(),
  }),
};

const getDiscussionByIdSchema = {
  params: z.object({
    discussionId: z.coerce.number().positive().int(),
  }),
};

const createDiscussionSchema = {
  body: z.object({
    title: z.string().trim().min(3).max(100),
    startingValue: decimalNumber,
  }),
};

const updateDiscussionSchema = {
  body: z.object({
    title: z.string().trim().min(5).max(100).optional(),
  }),
};

type CreateDiscussionInput = z.infer<typeof createDiscussionSchema.body>;
type UpdateDiscussionInput = z.infer<typeof updateDiscussionSchema.body>;
type GetDiscussionsListQuery = z.infer<typeof getDiscussionsListSchema.query>;
type GetDiscussionByIdParams = z.infer<typeof getDiscussionByIdSchema.params>;

const discussionValidator = {
  createDiscussionSchema,
  updateDiscussionSchema,
  getDiscussionsListSchema,
  getDiscussionByIdSchema,
};

export type {
  CreateDiscussionInput,
  GetDiscussionByIdParams,
  GetDiscussionsListQuery,
  UpdateDiscussionInput,
};

export default discussionValidator;

import { OPERATION } from '@prisma/client';
import { z } from 'zod';

import { zodParseEnumList } from '@/utils/zod-utils';
import { basePaginationSchema } from '@/validations/base.validation';

const getNodesListSchema = {
  query: basePaginationSchema.extend({
    operation: zodParseEnumList<OPERATION>(Object.values(OPERATION)).optional(),
  }),
};

const getNodeByIdSchema = {
  params: z.object({
    nodeId: z.coerce.number().min(1).max(100),
  }),
};

const createNodeSchema = {
  body: z.object({
    operation: z.enum(Object.values(OPERATION)),
    value: z.coerce.number(),
    parentId: z.coerce.number(),
  }),
};

type CreateNodeInput = z.infer<typeof createNodeSchema.body>;
type GetNodesListQuery = z.infer<typeof getNodesListSchema.query>;
type GetNodeByIdParams = z.infer<typeof getNodeByIdSchema.params>;

const nodeValidator = {
  createNodeSchema,
  getNodesListSchema,
  getNodeByIdSchema,
};

export type { CreateNodeInput, GetNodeByIdParams, GetNodesListQuery };

export default nodeValidator;

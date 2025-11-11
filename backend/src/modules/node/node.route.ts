import { Router } from 'express';

import controller from './node.controller';
import validator from './node.validator';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const nodeRouter = Router();

nodeRouter.get('/list', validateRequest(validator.getNodesListSchema), controller.getNodesList);
nodeRouter.get('/', validateRequest(validator.getNodesListSchema), controller.getNodes);

nodeRouter.get('/:nodeId', validateRequest(validator.getNodeByIdSchema), controller.getNodeById);

nodeRouter.post(
  '/',
  authenticateMiddleware,
  validateRequest(validator.createNodeSchema),
  controller.createNode
);

export default nodeRouter;

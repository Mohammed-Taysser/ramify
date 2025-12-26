import { Router } from 'express';

import controller from './operation.controller';
import validator from './operation.validator';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import { creationRateLimiter } from '@/middleware/rate-limit.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const operationRoutes = Router();

operationRoutes.get(
  '/all',
  authenticateMiddleware,
  validateRequest(validator.getOperationsListSchema),
  controller.getOperationsList
);

operationRoutes.get(
  '/',
  authenticateMiddleware,
  validateRequest(validator.getOperationsListSchema),
  controller.getOperations
);

operationRoutes.get(
  '/:operationId',
  authenticateMiddleware,
  validateRequest(validator.getOperationByIdSchema),
  controller.getOperationById
);

operationRoutes.post(
  '/',
  creationRateLimiter,
  authenticateMiddleware,
  validateRequest(validator.createOperationSchema),
  controller.createOperation
);

operationRoutes.patch(
  '/:operationId',
  authenticateMiddleware,
  validateRequest(validator.updateOperationSchema),
  controller.updateOperation
);

operationRoutes.delete(
  '/:operationId',
  authenticateMiddleware,
  validateRequest(validator.getOperationByIdSchema),
  controller.deleteOperation
);

export default operationRoutes;

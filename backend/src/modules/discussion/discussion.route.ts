import { Router } from 'express';

import controller from './discussion.controller';
import validator from './discussion.validator';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import { creationRateLimiter } from '@/middleware/rate-limit.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const discussionRoutes = Router();

discussionRoutes.get(
  '/all',
  authenticateMiddleware,
  validateRequest(validator.getDiscussionsListSchema),
  controller.getDiscussionsList
);

discussionRoutes.get(
  '/',
  authenticateMiddleware,
  validateRequest(validator.getDiscussionsListSchema),
  controller.getDiscussions
);

discussionRoutes.get(
  '/:discussionId',
  authenticateMiddleware,
  validateRequest(validator.getDiscussionByIdSchema),
  controller.getDiscussionById
);

discussionRoutes.post(
  '/',
  creationRateLimiter,
  authenticateMiddleware,
  validateRequest(validator.createDiscussionSchema),
  controller.createDiscussion
);

discussionRoutes.patch(
  '/:discussionId',
  authenticateMiddleware,
  validateRequest(validator.updateDiscussionSchema),
  controller.updateDiscussion
);

discussionRoutes.post(
  '/:discussionId/end',
  authenticateMiddleware,
  validateRequest(validator.getDiscussionByIdSchema),
  controller.endDiscussion
);

discussionRoutes.delete(
  '/:discussionId',
  authenticateMiddleware,
  validateRequest(validator.getDiscussionByIdSchema),
  controller.deleteDiscussion
);

export default discussionRoutes;

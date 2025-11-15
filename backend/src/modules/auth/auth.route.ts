import { Router } from 'express';

import controller from './auth.controller';
import validator from './auth.validator';

import validateRequest from '@/middleware/validate-request.middleware';

const authRoutes = Router();

authRoutes.post('/register', validateRequest(validator.registerSchema), controller.register);
authRoutes.post('/login', validateRequest(validator.loginSchema), controller.login);
authRoutes.post(
  '/refresh-token',
  validateRequest(validator.refreshTokenSchema),
  controller.refreshToken
);

export default authRoutes;

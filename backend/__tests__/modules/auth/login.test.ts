import ENDPOINTS from '@test/constants/endpoint.constant';
import {
  expectError,
  expectSuccess,
  expectValidationError,
  request,
} from '@test/helpers/supertest-utils';
import { createTestUser } from '@test/helpers/test-utils';

import CONFIG from '@/apps/config';

describe('POST /api/auth/login', () => {
  describe('successful login', () => {
    it('should login with valid credentials', async () => {
      const password = CONFIG.SEED_USER_PASSWORD;
      const user = await createTestUser({ password });

      const response = await request().post(ENDPOINTS.auth.login).send({
        email: user.email,
        password: password,
      });

      const body = expectSuccess(response);
      expect(body.data).toHaveProperty('accessToken');
      expect(body.data).toHaveProperty('refreshToken');
      expect(body.data.user).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
      });
      expect(body.data.user).not.toHaveProperty('password');
    });
  });

  describe('validation errors', () => {
    it('should reject missing fields', async () => {
      const response = await request().post(ENDPOINTS.auth.login).send({});

      expectValidationError(response);
    });

    it('should reject invalid email format', async () => {
      const response = await request().post(ENDPOINTS.auth.login).send({
        email: 'invalid-email',
        password: CONFIG.SEED_USER_PASSWORD,
      });

      expectValidationError(response);
    });
  });

  describe('authentication errors', () => {
    it('should reject non-existent email', async () => {
      const response = await request().post(ENDPOINTS.auth.login).send({
        email: 'nonexistent@example.com',
        password: CONFIG.SEED_USER_PASSWORD,
      });

      expectError(response, 400, 'Invalid credentials');
    });

    it('should reject incorrect password', async () => {
      const user = await createTestUser({ password: CONFIG.SEED_USER_PASSWORD });

      const response = await request().post(ENDPOINTS.auth.login).send({
        email: user.email,
        password: 'WrongPassword123!',
      });

      expectError(response, 400, 'Invalid credentials');
    });
  });
});

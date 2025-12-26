import ENDPOINTS from '@test/constants/endpoint.constant';
import {
  expectError,
  expectSuccess,
  expectValidationError,
  request,
} from '@test/helpers/supertest-utils';
import { createTestUser } from '@test/helpers/test-utils';

import CONFIG from '@/apps/config';

describe('POST /api/auth/register', () => {
  describe('successful registration', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        name: 'New User',
        email: `newuser-${Date.now()}@example.com`,
        password: CONFIG.SEED_USER_PASSWORD,
      };

      const response = await request().post(ENDPOINTS.auth.register).send(userData);

      const body = expectSuccess(response, 201);
      expect(body.data).toHaveProperty('accessToken');
      expect(body.data).toHaveProperty('refreshToken');
      expect(body.data.user).toMatchObject({
        name: userData.name,
        email: userData.email,
      });
      expect(body.data.user).not.toHaveProperty('password');
    });
  });

  describe('validation errors', () => {
    it('should reject missing required fields', async () => {
      const response = await request().post(ENDPOINTS.auth.register).send({});

      expectValidationError(response);
    });

    it('should reject invalid email format', async () => {
      const response = await request().post(ENDPOINTS.auth.register).send({
        name: 'Test User',
        email: 'invalid-email',
        password: CONFIG.SEED_USER_PASSWORD,
      });

      expectValidationError(response);
    });

    it('should reject weak password', async () => {
      const response = await request()
        .post(ENDPOINTS.auth.register)
        .send({
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          password: 123,
        });

      expectValidationError(response);
    });
  });

  describe('conflict errors', () => {
    it('should reject registration with existing email', async () => {
      const existingUser = await createTestUser();

      const response = await request().post(ENDPOINTS.auth.register).send({
        name: 'Another User',
        email: existingUser.email,
        password: CONFIG.SEED_USER_PASSWORD,
      });

      expectError(response, 409, 'Email already registered');
    });
  });
});

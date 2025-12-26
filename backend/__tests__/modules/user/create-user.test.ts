import ENDPOINTS from '@test/constants/endpoint.constant';
import {
  authenticatedRequest,
  expectError,
  expectSuccess,
  expectValidationError,
  request,
} from '@test/helpers/supertest-utils';
import { createTestUser, generateAuthToken } from '@test/helpers/test-utils';

import CONFIG from '@/apps/config';

describe('POST /api/users', () => {
  it('should create a new user with valid data', async () => {
    const admin = await createTestUser();
    const authToken = generateAuthToken(admin.id, admin.email).accessToken;

    const userData = {
      name: 'New User',
      email: `newuser${Date.now()}@example.com`,
      password: CONFIG.SEED_USER_PASSWORD,
    };

    const response = await authenticatedRequest('post', ENDPOINTS.user, authToken).send(userData);

    const body = expectSuccess(response, 201);
    expect(body.data).toHaveProperty('id');
    expect(body.data.name).toBe(userData.name);
    expect(body.data.email).toBe(userData.email);
    expect(body.data).not.toHaveProperty('password');
  });

  it('should reject missing required fields', async () => {
    const admin = await createTestUser();
    const authToken = generateAuthToken(admin.id, admin.email).accessToken;

    const response = await authenticatedRequest('post', ENDPOINTS.user, authToken);

    expectValidationError(response);
  });

  it('should reject duplicate email', async () => {
    const admin = await createTestUser();
    const authToken = generateAuthToken(admin.id, admin.email).accessToken;
    const existingUser = await createTestUser();

    const response = await authenticatedRequest('post', ENDPOINTS.user, authToken).send({
      name: 'Duplicate User',
      email: existingUser.email,
      password: CONFIG.SEED_USER_PASSWORD,
    });

    expectError(response, 409, 'Email already registered');
  });

  it('should require authentication', async () => {
    const response = await request()
      .post(ENDPOINTS.user)
      .send({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: CONFIG.SEED_USER_PASSWORD,
      });

    expectError(response, 401);
  });
});

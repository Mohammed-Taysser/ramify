import ENDPOINTS from '@test/constants/endpoint.constant';
import {
  expectError,
  expectSuccess,
  expectValidationError,
  request,
} from '@test/helpers/supertest-utils';
import { createTestUser, generateAuthToken } from '@test/helpers/test-utils';

describe('PATCH /api/user/me', () => {
  it('should update current user profile', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;

    const updatedName = 'Updated Name';
    const response = await request()
      .patch(`${ENDPOINTS.user}/me`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: updatedName });

    const body = expectSuccess(response);
    expect(body.data.name).toBe(updatedName);
    expect(body.data.email).toBe(user.email);
  });

  it('should reject invalid email format', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;

    const response = await request()
      .patch(`${ENDPOINTS.user}/me`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ email: 'invalid-email' });

    expectValidationError(response);
  });

  it('should prevent email conflict', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const authToken = generateAuthToken(user1.id, user1.email).accessToken;

    const response = await request()
      .patch(`${ENDPOINTS.user}/me`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ email: user2.email });

    expectError(response, 409, 'Email already registered');
  });

  it('should require authentication', async () => {
    const response = await request().patch(`${ENDPOINTS.user}/me`).send({ name: 'New Name' });

    expectError(response, 401);
  });
});

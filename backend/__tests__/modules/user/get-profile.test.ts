import ENDPOINTS from '@test/constants/endpoint.constant';
import { expectError, expectSuccess, request } from '@test/helpers/supertest-utils';
import { createTestUser, generateAuthToken } from '@test/helpers/test-utils';

describe('GET /api/user/me', () => {
  it('should return current user profile', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;

    const response = await request()
      .get(`${ENDPOINTS.user}/me`)
      .set('Authorization', `Bearer ${authToken}`);

    const body = expectSuccess(response);
    expect(body.data.id).toBe(user.id);
    expect(body.data.email).toBe(user.email);
    expect(body.data.name).toBe(user.name);
    expect(body.data).not.toHaveProperty('password');
  });

  it('should require authentication', async () => {
    const response = await request().get(`${ENDPOINTS.user}/me`);

    expectError(response, 401);
  });
});

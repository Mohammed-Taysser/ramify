import ENDPOINTS from '@test/constants/endpoint.constant';
import { expectError, expectSuccess, request } from '@test/helpers/supertest-utils';
import { createTestUser, generateAuthToken } from '@test/helpers/test-utils';

describe('POST /api/auth/switch-user', () => {
  it('should switch to another user', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const authToken = generateAuthToken(user1.id, user1.email).accessToken;

    const response = await request()
      .post(ENDPOINTS.auth.switchUser)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: user2.id });

    const body = expectSuccess(response);
    expect(body.data.user.id).toBe(user2.id);
    expect(body.data.user.email).toBe(user2.email);
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.refreshToken).toBeDefined();
    expect(body.data.user.password).toBeUndefined();
  });

  it('should return 400 if user not found', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;

    const response = await request()
      .post(ENDPOINTS.auth.switchUser)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: 999999 });

    expectError(response, 400, 'User not found');
  });
});

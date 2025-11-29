import ENDPOINTS from '@test/constants/endpoint.constant';
import {
  authenticatedRequest,
  expectError,
  expectSuccess,
  request,
} from '@test/helpers/supertest-utils';
import { createTestUser, generateAuthToken } from '@test/helpers/test-utils';

describe('DELETE /api/users/:userId', () => {
  it('should delete a user', async () => {
    const admin = await createTestUser();
    const authToken = generateAuthToken(admin.id, admin.email).accessToken;
    const user = await createTestUser();

    const response = await authenticatedRequest(
      'delete',
      `${ENDPOINTS.user}/${user.id}`,
      authToken
    );

    const body = expectSuccess(response);
    expect(body.data.id).toBe(user.id);
    expect(body.data.email).toBe(user.email);
  });

  it('should return 404 for non-existent user', async () => {
    const admin = await createTestUser();
    const authToken = generateAuthToken(admin.id, admin.email).accessToken;

    const response = await authenticatedRequest('delete', `${ENDPOINTS.user}/999999`, authToken);

    expectError(response, 404, 'User not found');
  });

  it('should require authentication', async () => {
    const user = await createTestUser();

    const response = await request().delete(`${ENDPOINTS.user}/${user.id}`);

    expectError(response, 401);
  });
});

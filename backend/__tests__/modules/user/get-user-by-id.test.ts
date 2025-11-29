import ENDPOINTS from '@test/constants/endpoint.constant';
import { expectError, expectSuccess, request } from '@test/helpers/supertest-utils';
import { createTestUser } from '@test/helpers/test-utils';

describe('GET /api/users/:userId', () => {
  it('should return user details by ID', async () => {
    const user = await createTestUser();

    const response = await request().get(`${ENDPOINTS.user}/${user.id}`);

    const body = expectSuccess(response);
    expect(body.data.id).toBe(user.id);
    expect(body.data.name).toBe(user.name);
    expect(body.data.email).toBe(user.email);
    expect(body.data).not.toHaveProperty('password');
  });

  it('should return 404 for non-existent user', async () => {
    const response = await request().get(`${ENDPOINTS.user}/999999`);

    expectError(response, 404, 'User not found');
  });
});

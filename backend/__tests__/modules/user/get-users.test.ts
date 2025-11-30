import ENDPOINTS from '@test/constants/endpoint.constant';
import { expectSuccess, request } from '@test/helpers/supertest-utils';
import { createTestUser } from '@test/helpers/test-utils';

describe('GET /api/users/all', () => {
  it('should return list of users', async () => {
    await createTestUser({ name: 'User 1' });
    await createTestUser({ name: 'User 2' });

    const response = await request().get(`${ENDPOINTS.user}/all`);

    const body = expectSuccess(response);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('should filter users by name', async () => {
    const uniqueName = `TestUser${Date.now()}`;
    await createTestUser({ name: uniqueName });

    const response = await request().get(`${ENDPOINTS.user}/all`).query({ name: uniqueName });

    const body = expectSuccess(response);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    const foundUser = body.data.find((u: { name: string }) => u.name === uniqueName);
    expect(foundUser).toBeDefined();
  });

  it('should filter users by email', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    await createTestUser({ email: uniqueEmail });

    const response = await request().get(`${ENDPOINTS.user}/all`).query({ email: uniqueEmail });

    const body = expectSuccess(response);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    const foundUser = body.data.find((u: { email: string }) => u.email === uniqueEmail);
    expect(foundUser).toBeDefined();
  });
});

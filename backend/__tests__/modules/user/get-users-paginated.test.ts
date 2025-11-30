import { randomUUID } from 'node:crypto';

import ENDPOINTS from '@test/constants/endpoint.constant';
import { authenticatedRequest, expectSuccess } from '@test/helpers/supertest-utils';
import { createTestUser, generateAuthToken } from '@test/helpers/test-utils';

describe('GET /api/user (paginated)', () => {
  it('should return paginated users with metadata', async () => {
    const admin = await createTestUser();
    const authToken = generateAuthToken(admin.id, admin.email).accessToken;
    await createTestUser();
    await createTestUser();

    const response = await authenticatedRequest('get', ENDPOINTS.user, authToken).query({
      page: 1,
      limit: 10,
    });

    const body = expectSuccess(response);
    expect(body.data).toHaveProperty('data');
    expect(body.data).toHaveProperty('metadata');
    expect(body.data.metadata).toHaveProperty('total');
    expect(body.data.metadata).toHaveProperty('page', 1);
    expect(body.data.metadata).toHaveProperty('limit', 10);
    expect(body.data.metadata).toHaveProperty('totalPages');
  });

  it('should filter paginated users by name', async () => {
    const admin = await createTestUser();
    const authToken = generateAuthToken(admin.id, admin.email).accessToken;
    await createTestUser({ name: 'Specific Name' });

    const response = await authenticatedRequest('get', ENDPOINTS.user, authToken).query({
      name: 'Specific',
      page: 1,
      limit: 10,
    });

    const body = expectSuccess(response);
    expect(body.data).toHaveProperty('data');
    expect(body.data).toHaveProperty('metadata');
  });

  it('should filter paginated users by email', async () => {
    const admin = await createTestUser();
    const authToken = generateAuthToken(admin.id, admin.email).accessToken;
    await createTestUser({ email: `specific${randomUUID()}@example.com` });

    const response = await authenticatedRequest('get', ENDPOINTS.user, authToken).query({
      email: 'specific',
      page: 1,
      limit: 10,
    });

    const body = expectSuccess(response);
    expect(body.data).toHaveProperty('data');
  });

  it('should filter paginated users by date range', async () => {
    const admin = await createTestUser();
    const authToken = generateAuthToken(admin.id, admin.email).accessToken;

    const startDate = new Date('2020-01-01').toISOString();
    const endDate = new Date().toISOString();

    const response = await authenticatedRequest('get', ENDPOINTS.user, authToken).query({
      'createdAt[startDate]': startDate,
      'createdAt[endDate]': endDate,
      page: 1,
      limit: 10,
    });

    const body = expectSuccess(response);
    expect(body.data).toHaveProperty('data');
    expect(body.data).toHaveProperty('metadata');
  });
});

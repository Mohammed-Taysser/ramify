import ENDPOINTS from '@test/constants/endpoint.constant';
import { authenticatedRequest, expectSuccess } from '@test/helpers/supertest-utils';
import { createTestOperation, createTestUser, generateAuthToken } from '@test/helpers/test-utils';

describe('GET /api/operation/all', () => {
  it('should return list of operations', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;
    await createTestOperation({ createdBy: user.id });
    await createTestOperation({ createdBy: user.id });

    const response = await authenticatedRequest('get', `${ENDPOINTS.operation}/all`, authToken);

    const body = expectSuccess(response);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    expect(body.data[0]).toHaveProperty('id');
    expect(body.data[0]).toHaveProperty('operationType');
  });

  it('should filter operations by operation type', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;
    await createTestOperation({ operationType: 'ADD', createdBy: user.id });
    await createTestOperation({ operationType: 'SUBTRACT', createdBy: user.id });

    const response = await authenticatedRequest(
      'get',
      `${ENDPOINTS.operation}/all?operationType=ADD`,
      authToken
    );

    const body = expectSuccess(response);
    expect(Array.isArray(body.data)).toBe(true);
    // All operations should be of type ADD
    body.data.forEach((op: { operationType: string }) => {
      expect(['ADD']).toContain(op.operationType);
    });
  });
});

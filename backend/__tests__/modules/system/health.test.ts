import { expectSuccess, request } from '@test/helpers/supertest-utils';

describe('GET /api/health', () => {
  it('should return health status', async () => {
    const response = await request().get('/api/health');

    const body = expectSuccess(response);
    expect(body.data).toHaveProperty('systemHealth', 'HEALTHY');
    expect(body.data).toHaveProperty('uptime');
  });
});

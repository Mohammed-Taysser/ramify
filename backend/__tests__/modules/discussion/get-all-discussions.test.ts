import ENDPOINTS from '@test/constants/endpoint.constant';
import { expectSuccess, request } from '@test/helpers/supertest-utils';
import { createTestDiscussion, createTestUser } from '@test/helpers/test-utils';

describe('GET /api/discussion/all', () => {
  it('should return all discussions', async () => {
    const user = await createTestUser();
    await createTestDiscussion({ createdBy: user.id, title: 'Discussion 1' });
    await createTestDiscussion({ createdBy: user.id, title: 'Discussion 2' });

    const response = await request().get(`${ENDPOINTS.discussion}/all`);

    const body = expectSuccess(response);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    expect(body.data[0]).toHaveProperty('id');
    expect(body.data[0]).toHaveProperty('title');
  });

  it('should filter by title', async () => {
    const user = await createTestUser();
    const uniqueTitle = `Unique Title ${Date.now()}`;
    await createTestDiscussion({ createdBy: user.id, title: uniqueTitle });

    const response = await request()
      .get(`${ENDPOINTS.discussion}/all`)
      .query({ title: uniqueTitle });

    const body = expectSuccess(response);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data[0].title).toBe(uniqueTitle);
  });

  it('should filter by userId', async () => {
    const user = await createTestUser();
    await createTestDiscussion({ createdBy: user.id, title: 'User Discussion' });

    const response = await request().get(`${ENDPOINTS.discussion}/all`).query({ userId: user.id });

    const body = expectSuccess(response);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
  });
});

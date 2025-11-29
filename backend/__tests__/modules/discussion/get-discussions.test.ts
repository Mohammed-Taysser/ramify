import ENDPOINTS from '@test/constants/endpoint.constant';
import { expectError, expectSuccess, request } from '@test/helpers/supertest-utils';
import { createTestDiscussion, createTestUser } from '@test/helpers/test-utils';

describe('GET /api/discussion/list', () => {
  it('should return list of discussions', async () => {
    const user = await createTestUser();
    await createTestDiscussion({ createdBy: user.id, title: 'Discussion 1' });
    await createTestDiscussion({ createdBy: user.id, title: 'Discussion 2' });

    const response = await request().get(`${ENDPOINTS.discussion}/list`);

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
      .get(`${ENDPOINTS.discussion}/list`)
      .query({ title: uniqueTitle });

    const body = expectSuccess(response);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data[0].title).toBe(uniqueTitle);
  });
});

describe('GET /api/discussion/:discussionId', () => {
  it('should return discussion details', async () => {
    const user = await createTestUser();
    const discussion = await createTestDiscussion({ createdBy: user.id });

    const response = await request().get(`${ENDPOINTS.discussion}/${discussion.id}`);

    const body = expectSuccess(response);
    expect(body.data.id).toBe(discussion.id);
    expect(body.data.title).toBe(discussion.title);
    expect(body.data).toHaveProperty('user');
    expect(body.data).toHaveProperty('operations');
  });

  it('should return 404 for non-existent discussion', async () => {
    const response = await request().get(`${ENDPOINTS.discussion}/999999`);

    expectError(response, 404, 'Discussion not found');
  });
});

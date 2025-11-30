import ENDPOINTS from '@test/constants/endpoint.constant';
import { expectError, expectSuccess, request } from '@test/helpers/supertest-utils';
import { createTestDiscussion, createTestUser } from '@test/helpers/test-utils';

describe('GET /api/discussion/all', () => {
  it('should return list of discussions', async () => {
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

describe('GET /api/discussion (paginated)', () => {
  it('should return paginated discussions with metadata', async () => {
    const user = await createTestUser();
    await createTestDiscussion({ createdBy: user.id });
    await createTestDiscussion({ createdBy: user.id });

    const response = await request().get(ENDPOINTS.discussion).query({ page: 1, limit: 10 });

    const body = expectSuccess(response);
    expect(body.data).toHaveProperty('data');
    expect(body.data).toHaveProperty('metadata');
    expect(body.data.metadata).toHaveProperty('total');
    expect(body.data.metadata).toHaveProperty('page', 1);
    expect(body.data.metadata).toHaveProperty('limit', 10);
    expect(body.data.metadata).toHaveProperty('totalPages');
  });

  it('should filter paginated discussions by title', async () => {
    const user = await createTestUser();
    const title = `Paginated ${Date.now()}`;
    await createTestDiscussion({ createdBy: user.id, title });

    const response = await request().get(ENDPOINTS.discussion).query({ title, page: 1, limit: 10 });

    const body = expectSuccess(response);
    expect(body.data).toHaveProperty('data');
    expect(body.data).toHaveProperty('metadata');
  });

  it('should filter paginated discussions by userId', async () => {
    const user = await createTestUser();
    await createTestDiscussion({ createdBy: user.id });

    const response = await request()
      .get(ENDPOINTS.discussion)
      .query({ userId: user.id, page: 1, limit: 10 });

    const body = expectSuccess(response);
    expect(body.data).toHaveProperty('data');
    expect(body.data).toHaveProperty('metadata');
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

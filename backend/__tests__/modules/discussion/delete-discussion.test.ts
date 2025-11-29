import ENDPOINTS from '@test/constants/endpoint.constant';
import { expectError, expectSuccess, request } from '@test/helpers/supertest-utils';
import { createTestDiscussion, createTestUser, generateAuthToken } from '@test/helpers/test-utils';

describe('DELETE /api/discussion/:discussionId', () => {
  it('should delete a discussion', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;
    const discussion = await createTestDiscussion({ createdBy: user.id });

    const response = await request()
      .delete(`${ENDPOINTS.discussion}/${discussion.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    const body = expectSuccess(response);
    expect(body.data.id).toBe(discussion.id);
    expect(body.data.title).toBe(discussion.title);
  });

  it('should return 404 for non-existent discussion', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;

    const response = await request()
      .delete(`${ENDPOINTS.discussion}/999999`)
      .set('Authorization', `Bearer ${authToken}`);

    expectError(response, 404, 'Discussion not found');
  });

  it('should require authentication', async () => {
    const user = await createTestUser();
    const discussion = await createTestDiscussion({ createdBy: user.id });

    const response = await request().delete(`${ENDPOINTS.discussion}/${discussion.id}`);

    expectError(response, 401);
  });
});

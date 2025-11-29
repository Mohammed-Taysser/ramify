import ENDPOINTS from '@test/constants/endpoint.constant';
import { expectError, expectSuccess, request } from '@test/helpers/supertest-utils';
import { createTestDiscussion, createTestUser, generateAuthToken } from '@test/helpers/test-utils';

describe('POST /api/discussion/:discussionId/end', () => {
  it('should end a discussion', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;
    const discussion = await createTestDiscussion({ createdBy: user.id, isEnded: false });

    const response = await request()
      .post(`${ENDPOINTS.discussion}/${discussion.id}/end`)
      .set('Authorization', `Bearer ${authToken}`);

    const body = expectSuccess(response);
    expect(body.data.isEnded).toBe(true);
    expect(body.data.endedAt).toBeDefined();
  });

  it('should fail if discussion is already ended', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;
    const discussion = await createTestDiscussion({ createdBy: user.id, isEnded: true });

    const response = await request()
      .post(`${ENDPOINTS.discussion}/${discussion.id}/end`)
      .set('Authorization', `Bearer ${authToken}`);

    expectError(response, 400, 'Discussion is already ended');
  });

  it('should return 404 for non-existent discussion', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;

    const response = await request()
      .post(`${ENDPOINTS.discussion}/999999/end`)
      .set('Authorization', `Bearer ${authToken}`);

    expectError(response, 404, 'Discussion not found');
  });
});

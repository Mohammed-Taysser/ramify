import ENDPOINTS from '@test/constants/endpoint.constant';
import { authenticatedRequest, expectError, expectSuccess } from '@test/helpers/supertest-utils';
import {
  createTestDiscussion,
  createTestOperation,
  createTestUser,
  generateAuthToken,
} from '@test/helpers/test-utils';

describe('GET /api/operation/:id', () => {
  describe('successful requests', () => {
    it('should return operation by ID', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({ createdBy: user.id });
      const operation = await createTestOperation({
        discussionId: discussion.id,
        createdBy: user.id,
        operationType: 'ADD',
        value: 25,
      });

      const response = await authenticatedRequest(
        'get',
        `${ENDPOINTS.operation}/${operation.id}`,
        authToken
      );

      const body = expectSuccess(response);
      expect(body.data).toMatchObject({
        id: operation.id,
        operationType: 'ADD',
        value: 25,
      });
    });

    it('should include user information in response', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({ createdBy: user.id });
      const operation = await createTestOperation({
        discussionId: discussion.id,
        createdBy: user.id,
        operationType: 'ADD',
        value: 10,
      });

      const response = await authenticatedRequest(
        'get',
        `${ENDPOINTS.operation}/${operation.id}`,
        authToken
      );

      const body = expectSuccess(response);
      expect(body.data.user).toBeDefined();
      expect(body.data.user.id).toBe(user.id);
    });
  });

  describe('error handling', () => {
    it('should return 404 for non-existent operation', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const response = await authenticatedRequest('get', `${ENDPOINTS.operation}/99999`, authToken);

      expectError(response, 404);
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid operation ID', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const response = await authenticatedRequest(
        'get',
        `${ENDPOINTS.operation}/invalid`,
        authToken
      );

      expect(response.status).toBe(400);
    });
  });

  describe('authentication', () => {
    it('should require authentication', async () => {
      const user = await createTestUser();
      const discussion = await createTestDiscussion({ createdBy: user.id });
      const operation = await createTestOperation({
        discussionId: discussion.id,
        createdBy: user.id,
      });

      const response = await authenticatedRequest(
        'get',
        `${ENDPOINTS.operation}/${operation.id}`,
        ''
      );

      expect(response.status).toBe(401);
    });
  });
});

import { Operation, OPERATION_TYPE } from '@prisma';
import ENDPOINTS from '@test/constants/endpoint.constant';
import { authenticatedRequest, expectSuccess } from '@test/helpers/supertest-utils';
import {
  createTestDiscussion,
  createTestOperation,
  createTestUser,
  generateAuthToken,
} from '@test/helpers/test-utils';

describe('GET /api/operation', () => {
  describe('successful requests', () => {
    it('should return paginated operations', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({ createdBy: user.id });
      await createTestOperation({ discussionId: discussion.id, createdBy: user.id });
      await createTestOperation({ discussionId: discussion.id, createdBy: user.id });

      const response = await authenticatedRequest('get', ENDPOINTS.operation, authToken).query({
        page: 1,
        limit: 10,
      });

      const body = expectSuccess(response);
      expect(body.data.data).toBeInstanceOf(Array);
      expect(body.data.data.length).toBeGreaterThanOrEqual(2);
      expect(body.data.metadata).toHaveProperty('total');
      expect(body.data.metadata).toHaveProperty('page', 1);
    });

    it('should filter by operation type', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({ createdBy: user.id });
      await createTestOperation({
        discussionId: discussion.id,
        operationType: OPERATION_TYPE.ADD,
        createdBy: user.id,
      });
      await createTestOperation({
        discussionId: discussion.id,
        operationType: OPERATION_TYPE.MULTIPLY,
        createdBy: user.id,
      });

      const response = await authenticatedRequest('get', ENDPOINTS.operation, authToken).query({
        operationType: OPERATION_TYPE.ADD,
      });

      const body = expectSuccess(response);
      expect(body.data.data.length).toBeGreaterThanOrEqual(1);
      // Check that all returned operations are ADD type
      body.data.data.forEach((op: Operation) => {
        expect(op.operationType).toBe(OPERATION_TYPE.ADD);
      });
    });

    it('should filter by discussion ID', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion1 = await createTestDiscussion({ createdBy: user.id });
      const discussion2 = await createTestDiscussion({ createdBy: user.id });

      const op1 = await createTestOperation({ discussionId: discussion1.id, createdBy: user.id });
      await createTestOperation({ discussionId: discussion2.id, createdBy: user.id });

      const response = await authenticatedRequest('get', ENDPOINTS.operation, authToken).query({
        discussionId: discussion1.id,
      });

      const body = expectSuccess(response);
      expect(body.data.data.length).toBeGreaterThanOrEqual(1);
      // Check that the operation we created for discussion1 is in the results
      const foundOp = body.data.data.find((op: Operation) => op.id === op1.id);
      expect(foundOp).toBeDefined();
      expect(foundOp.discussionId).toBe(discussion1.id);
    });
  });

  describe('authentication', () => {
    it('should require authentication', async () => {
      const response = await authenticatedRequest('get', ENDPOINTS.operation, '');

      expect(response.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const response = await authenticatedRequest('get', ENDPOINTS.operation, 'invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('validation', () => {
    it('should validate page number', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const response = await authenticatedRequest('get', ENDPOINTS.operation, authToken).query({
        page: -1,
      });

      expect(response.status).toBe(400);
    });

    it('should validate limit', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const response = await authenticatedRequest('get', ENDPOINTS.operation, authToken).query({
        limit: 1000,
      });

      expect(response.status).toBe(400);
    });
  });
});

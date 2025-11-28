import { OPERATION_TYPE } from '@prisma';
import ENDPOINTS from '@test/constants/endpoint.constant';
import {
  authenticatedRequest,
  expectError,
  expectSuccess,
  expectValidationError,
  rapidRequests,
} from '@test/helpers/supertest-utils';
import {
  createTestDiscussion,
  createTestOperation,
  createTestUser,
  generateAuthToken,
} from '@test/helpers/test-utils';

describe('POST /api/operation', () => {
  describe('successful creation', () => {
    it('should create operation with valid data', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({
        createdBy: user.id,
        startingValue: 100,
      });

      const response = await authenticatedRequest('post', ENDPOINTS.operation, authToken).send({
        discussionId: discussion.id,
        operationType: OPERATION_TYPE.ADD,
        value: 50,
        parentId: null,
        title: 'Add 50',
      });

      const body = expectSuccess(response, 201);

      expect(body.data).toMatchObject({
        operationType: OPERATION_TYPE.ADD,
        value: 50,
        beforeValue: 100,
        afterValue: 150,
        title: 'Add 50',
      });
    });

    it('should handle precision correctly (0.1 + 0.2 = 0.3)', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({
        createdBy: user.id,
        startingValue: 0.1,
      });

      const response = await authenticatedRequest('post', ENDPOINTS.operation, authToken).send({
        discussionId: discussion.id,
        operationType: OPERATION_TYPE.ADD,
        value: 0.2,
        parentId: null,
      });

      const body = expectSuccess(response, 201);
      expect(body.data.afterValue).toBe(0.3); // NOT 0.30000000000000004
    });

    it('should create child operation correctly', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({
        createdBy: user.id,
        startingValue: 100,
      });

      const parent = await createTestOperation({
        discussionId: discussion.id,
        operationType: OPERATION_TYPE.ADD,
        value: 50,
        createdBy: user.id,
      });

      const response = await authenticatedRequest('post', ENDPOINTS.operation, authToken).send({
        discussionId: discussion.id,
        operationType: 'MULTIPLY',
        value: 2,
        parentId: parent.id,
      });

      const body = expectSuccess(response, 201);
      expect(body.data.parentId).toBe(parent.id);
      expect(body.data.beforeValue).toBe(150); // Parent's afterValue
      expect(body.data.afterValue).toBe(300);
    });
  });

  describe('validation errors', () => {
    it('should reject division by zero', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({ createdBy: user.id });

      const response = await authenticatedRequest('post', ENDPOINTS.operation, authToken).send({
        discussionId: discussion.id,
        operationType: 'DIVIDE',
        value: 0,
        parentId: null,
      });

      expectError(response, 400, 'Cannot divide by zero');
      expect(response.status).toBe(400);
    });

    it('should handel NaN to be zero', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({ createdBy: user.id });

      const response = await authenticatedRequest('post', ENDPOINTS.operation, authToken).send({
        discussionId: discussion.id,
        operationType: OPERATION_TYPE.ADD,
        value: Number.NaN,
        parentId: null,
      });

      expectSuccess(response, 201);
    });

    it('should handel Infinity values to be zero', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({ createdBy: user.id });

      const response = await authenticatedRequest('post', ENDPOINTS.operation, authToken).send({
        discussionId: discussion.id,
        operationType: OPERATION_TYPE.ADD,
        value: Number.POSITIVE_INFINITY,
        parentId: null,
      });

      expectSuccess(response, 201);
    });

    it('should reject invalid operation type', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({ createdBy: user.id });

      const response = await authenticatedRequest('post', ENDPOINTS.operation, authToken).send({
        discussionId: discussion.id,
        operationType: 'INVALID',
        value: 10,
        parentId: null,
      });

      expect(response.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const response = await authenticatedRequest('post', ENDPOINTS.operation, authToken).send({});

      expectValidationError(response);
      expect(response.status).toBe(400);
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limiting (10 req/min)', async () => {
      const user = await createTestUser();
      const authToken = generateAuthToken(user.id, user.email).accessToken;

      const discussion = await createTestDiscussion({ createdBy: user.id });

      const responses = await rapidRequests('post', ENDPOINTS.operation, 12, authToken, {
        discussionId: discussion.id,
        operationType: OPERATION_TYPE.ADD,
        value: 1,
        parentId: null,
      });

      // First 10 should succeed
      const successCount = responses.filter((r) => r.status === 201).length;
      const rateLimitedCount = responses.filter((r) => r.status === 429).length;

      expect(successCount).toBeLessThanOrEqual(10);
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });
});

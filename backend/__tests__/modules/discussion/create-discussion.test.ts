import ENDPOINTS from '@test/constants/endpoint.constant';
import {
  expectError,
  expectSuccess,
  expectValidationError,
  request,
} from '@test/helpers/supertest-utils';
import { createTestUser, generateAuthToken } from '@test/helpers/test-utils';

describe('POST /api/discussion', () => {
  it('should create a new discussion with valid data', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;

    const discussionData = {
      title: 'New Discussion',
      startingValue: 50,
    };

    const response = await request()
      .post(ENDPOINTS.discussion)
      .set('Authorization', `Bearer ${authToken}`)
      .send(discussionData);

    const body = expectSuccess(response, 201);
    expect(body.data).toHaveProperty('id');
    expect(body.data.title).toBe(discussionData.title);
    expect(body.data.startingValue).toBe(discussionData.startingValue);
    expect(body.data.createdBy).toBe(user.id);
  });

  it('should reject missing required fields', async () => {
    const user = await createTestUser();
    const authToken = generateAuthToken(user.id, user.email).accessToken;

    const response = await request()
      .post(ENDPOINTS.discussion)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expectValidationError(response);
  });

  it('should require authentication', async () => {
    const response = await request().post(ENDPOINTS.discussion).send({
      title: 'New Discussion',
      startingValue: 50,
    });

    expectError(response, 401);
  });
});

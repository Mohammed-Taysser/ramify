import request from 'supertest';

import app from '@/app';

/**
 * Make an authenticated request with supertest
 */
function authenticatedRequest(
  method: 'get' | 'post' | 'patch' | 'delete',
  url: string,
  token: string
) {
  return request(app)
    [method](url)
    .set('Authorization', `Bearer ${token}`)
    .set('Accept', 'application/json');
}

/**
 * Expect a successful response
 */
function expectSuccess(response: request.Response, statusCode = 200) {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('success', true);
  return response.body;
}

/**
 * Expect an error response
 */
function expectError(response: request.Response, statusCode: number, messageContains?: string) {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('success', false);

  if (messageContains) {
    expect(response.body.error).toContain(messageContains);
  }

  return response.body;
}

/**
 * Expect validation error
 */
function expectValidationError(response: request.Response, field?: string) {
  expectError(response, 400);

  if (field) {
    expect(response.body.error).toContain(field);
  }

  return response.body;
}

/**
 * Expect rate limit error
 */
function expectRateLimitError(response: request.Response) {
  expectError(response, 429, 'Too many requests');

  // Check for rate limit headers
  expect(response.headers).toHaveProperty('ratelimit-limit');
  expect(response.headers).toHaveProperty('ratelimit-remaining');

  return response.body;
}

/**
 * Make multiple requests rapidly to test rate limiting
 */
async function rapidRequests(
  method: 'get' | 'post' | 'patch' | 'delete',
  url: string,
  count: number,
  token?: string,
  body?: unknown
) {
  const promises = [];

  for (let i = 0; i < count; i++) {
    const req = token ? authenticatedRequest(method, url, token) : request(app)[method](url);

    if (body && (method === 'post' || method === 'patch')) {
      req.send(body);
    }

    promises.push(req);
  }

  return Promise.all(promises);
}

export {
  authenticatedRequest,
  expectError,
  expectRateLimitError,
  expectSuccess,
  expectValidationError,
  rapidRequests,
};

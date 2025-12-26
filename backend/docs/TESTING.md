# Testing Structure & Guidelines

## Overview

This document defines the testing structure, organization, and best practices for the backend test suite.

## Directory Structure

```text
__tests__/
├── helpers/                    # Shared test utilities
│   ├── test-utils.ts          # Database & model utilities (reusing src code)
│   ├── test-setup.ts          # Common test environment setup
│   └── supertest-utils.ts     # HTTP request/response helpers
├── modules/                    # Module-specific integration tests
│   ├── operation/
│   │   ├── get-operations.test.ts
│   │   ├── create-operation.test.ts
│   │   ├── get-operation-by-id.test.ts
│   │   └── update-operation.test.ts
│   ├── discussion/
│   │   ├── get-discussions.test.ts
│   │   ├── create-discussion.test.ts
│   │   ├── get-discussion-by-id.test.ts
│   │   ├── update-discussion.test.ts
│   │   └── end-discussion.test.ts
│   ├── auth/
│   │   ├── register.test.ts
│   │   ├── login.test.ts
│   │   └── refresh-token.test.ts
│   └── user/
│       ├── get-profile.test.ts
│       └── update-profile.test.ts
├── services/                   # Service layer unit tests
│   ├── token.service.test.ts
│   └── operation.service.test.ts
├── utils/                      # Utility function tests
│   ├── depth.utils.test.ts
│   └── dayjs.utils.test.ts
└── middleware/                 # Middleware tests
    ├── authenticate.test.ts
    ├── validate-request.test.ts
    └── rate-limit.test.ts
```

## Naming Conventions

### Test Files

**Pattern:** `{http-method}-{resource}.test.ts` or `{action}.test.ts`

**Examples:**

- ✅ `get-operations.test.ts` - Tests GET /api/operation
- ✅ `create-operation.test.ts` - Tests POST /api/operation
- ✅ `login.test.ts` - Tests POST /api/auth/login
- ❌ `operation-tests.ts` - Too vague
- ❌ `operationController.test.ts` - Wrong naming style

### Test Suites

**Pattern:** HTTP method + endpoint path

```typescript
// ✅ Good
describe('GET /api/operation', () => { ... });
describe('POST /api/operation', () => { ... });
describe('PATCH /api/operation/:id', () => { ... });

// ❌ Bad
describe('Operations', () => { ... });
describe('Operation Controller', () => { ... });
```

### Test Cases

**Pattern:** `should {expected behavior} {given conditions}`

```typescript
// ✅ Good
it('should return paginated operations', async () => { ... });
it('should return 404 when operation not found', async () => { ... });
it('should reject invalid operation type', async () => { ... });

// ❌ Bad
it('works correctly', async () => { ... });
it('test creation', async () => { ... });
it('returns operations', async () => { ... });
```

## Organization Principles

### 1. One File Per Endpoint

Each HTTP endpoint gets its own test file for:

- **Easier maintenance**: Changes to one endpoint don't affect others
- **Parallel execution**: Jest can run files in parallel
- **Clear intent**: File name immediately shows what's tested
- **Focused files**: Keep files under 200 lines

### 2. DRY Principle - Reuse Source Code

**❌ WRONG:** Reimplementing business logic in tests

```typescript
// test-utils.ts
export function generateAuthToken(userId: number) {
  const accessToken = jwt.sign({ id: userId }, CONFIG.JWT_SECRET, {
    expiresIn: CONFIG.JWT_ACCESS_EXPIRES_IN,
  });
  return { accessToken };
}
```

**✅ CORRECT:** Reusing actual source code

```typescript
// test-utils.ts
import tokenService from '@/services/token.service';

export function generateAuthToken(userId: number) {
  const accessToken = tokenService.signAccessToken({ id: userId });
  return { accessToken };
}
```

**Benefits:**

- Tests use real production code
- Changes to source automatically reflected in tests
- No logic duplication
- Catches integration issues

### 3. Shared Setup Pattern

Use a centralized setup helper for common test scenarios:

```typescript
// test-setup.ts
export function setupTestEnvironment() {
  let authToken: string;
  let userId: number;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser({ email: 'test@example.com' });
    userId = user.id;
    authToken = tokenService.signAccessToken({ id: userId });
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  return { authToken, userId };
}
```

**Usage in test files:**

```typescript
import { setupTestEnvironment } from '../../helpers/test-setup';

describe('GET /api/operation', () => {
  const { authToken, userId } = setupTestEnvironment();

  it('should return operations', async () => {
    // authToken and userId are available
  });
});
```

## Test Helpers

### Database Utilities (`test-utils.ts`)

```typescript
cleanDatabase(); // Removes all test data
createTestUser(overrides); // Creates user (uses bcrypt from src)
createTestDiscussion(opts); // Creates discussion with defaults
createTestOperation(opts); // Creates operation with calculations
generateAuthToken(userId); // Generates JWT (uses TokenService)
```

### HTTP Utilities (`supertest-utils.ts`)

```typescript
authenticatedRequest(method, path, token); // Makes authenticated request
expectSuccess(response, statusCode); // Validates success response
expectError(response, statusCode, message); // Validates error response
expectValidationError(response, field); // Validates validation errors
rapidRequests(count, requestFn); // Tests rate limiting
```

### Setup Utilities (`test-setup.ts`)

```typescript
setupTestEnvironment(); // Standard auth user + cleanup
setupUnauthenticated(); // Tests without authentication
setupMultipleUsers(count); // Creates multiple test users
```

## Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
it('should create operation with valid data', async () => {
  // Arrange - Set up test data
  const discussion = await createTestDiscussion({ createdBy: userId });
  const operationData = {
    discussionId: discussion.id,
    operationType: 'ADD',
    value: 50,
  };

  // Act - Perform the action
  const response = await authenticatedRequest('post', '/api/operation', authToken).send(
    operationData
  );

  // Assert - Verify the results
  expect(response.status).toBe(201);
  expect(response.body.data.afterValue).toBe(150);
});
```

### 2. Test Independence

Each test should be completely independent:

```typescript
// ✅ Good - Creates own data
it('should filter by operation type', async () => {
  const discussion = await createTestDiscussion({ createdBy: userId });
  await createTestOperation({ discussionId: discussion.id, operationType: 'ADD' });
  await createTestOperation({ discussionId: discussion.id, operationType: 'SUBTRACT' });

  const response = await authenticatedRequest('get', '/api/operation?operationType=ADD', authToken);
  expect(response.body.data.length).toBe(1);
});

// ❌ Bad - Depends on previous test's data
it('should filter by operation type', async () => {
  const response = await authenticatedRequest('get', '/api/operation?operationType=ADD', authToken);
  expect(response.body.data.length).toBeGreaterThan(0);
});
```

### 3. Meaningful Test Data

Use realistic, meaningful test data:

```typescript
// ✅ Good
const discussion = await createTestDiscussion({
  title: 'Q4 Budget Planning',
  startingValue: 100000,
  createdBy: userId,
});

// ❌ Bad
const discussion = await createTestDiscussion({
  title: 'test',
  startingValue: 1,
});
```

### 4. Group Related Tests

```typescript
describe('GET /api/operation', () => {
  describe('successful requests', () => {
    it('should return paginated operations', ...);
    it('should filter by operation type', ...);
  });

  describe('error handling', () => {
    it('should require authentication', ...);
    it('should validate pagination params', ...);
  });
});
```

### 5. Clear Assertions

```typescript
// ✅ Good - Specific expectations
expect(response.status).toBe(201);
expect(response.body.success).toBe(true);
expect(response.body.data).toMatchObject({
  operationType: 'ADD',
  value: 50,
  afterValue: 150,
});

// ❌ Bad - Vague expectations
expect(response.status).toBeGreaterThan(199);
expect(response.body).toBeDefined();
expect(response.body.data).toBeTruthy();
```

## Coverage Goals

| Layer       | Target Coverage | Priority |
| ----------- | --------------- | -------- |
| Controllers | 70%+            | High     |
| Services    | 80%+            | High     |
| Utils       | 90%+            | High     |
| Middleware  | 75%+            | Medium   |
| Overall     | 70%+            | High     |

## Running Tests

```bash
# Run all tests
yarn test

# Run specific module
yarn test operation

# Run specific file
yarn test get-operations

# Run with coverage
yarn test:coverage

# Run in watch mode
yarn test:watch
```

## Common Patterns

### Testing Pagination

```typescript
it('should return paginated results', async () => {
  // Create more items than page size
  for (let i = 0; i < 15; i++) {
    await createTestOperation({ ... });
  }

  const response = await authenticatedRequest('get', '/api/operation?page=1&limit=10', authToken);

  expect(response.body.data.length).toBe(10);
  expect(response.body.metadata).toMatchObject({
    total: 15,
    page: 1,
    limit: 10,
    totalPages: 2,
  });
});
```

### Testing Authentication

```typescript
describe('authentication', () => {
  it('should require authentication', async () => {
    const response = await request(app).get('/api/operation');
    expect(response.status).toBe(401);
  });

  it('should reject invalid token', async () => {
    const response = await request(app)
      .get('/api/operation')
      .set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(401);
  });
});
```

### Testing Validation

```typescript
it('should validate required fields', async () => {
  const response = await authenticatedRequest('post', '/api/operation', authToken).send({}); // Missing required fields

  expectValidationError(response);
  expect(response.body.errors).toBeDefined();
});
```

### Testing Rate Limiting

```typescript
it('should enforce rate limits', async () => {
  const requests = Array(11)
    .fill(null)
    .map(() => authenticatedRequest('post', '/api/operation', authToken).send(validData));

  const responses = await Promise.all(requests);
  const rateLimited = responses.filter((r) => r.status === 429);

  expect(rateLimited.length).toBeGreaterThan(0);
});
```

## Anti-Patterns to Avoid

### ❌ Testing Implementation Details

```typescript
// Bad - Testing internal implementation
expect(controller.privateMethod).toHaveBeenCalled();

// Good - Testing public behavior
expect(response.status).toBe(200);
```

### ❌ Fragile Assertions

```typescript
// Bad - Will break with any field addition
expect(response.body.data).toEqual({
  id: expect.any(Number),
  // ... 20 more fields
});

// Good - Test only what matters
expect(response.body.data).toMatchObject({
  operationType: 'ADD',
  afterValue: 150,
});
```

### ❌ Testing Multiple Things

```typescript
// Bad
it('should create, update, and delete operations', async () => {
  // Too much in one test
});

// Good - Separate tests
it('should create operation', ...);
it('should update operation', ...);
it('should delete operation', ...);
```

## Maintenance

- Update tests when API changes
- Keep test data realistic and meaningful
- Remove obsolete tests promptly
- Refactor tests alongside source code
- Document complex test scenarios
- Review test coverage regularly

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

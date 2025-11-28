# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive test structure with endpoint-specific test files
- Test documentation in `docs/TESTING.md`
- Shared test environment setup helper (`test-setup.ts`)
- DRY principle enforcement - tests now reuse source code instead of duplicating
- Test organization by HTTP endpoint for better maintainability

### Changed

- **BREAKING**: Split monolithic `operation-controller.test.ts` into 4 endpoint-specific files:
  - `get-operations.test.ts` - GET /api/operation
  - `create-operation.test.ts` - POST /api/operation
  - `get-operation-by-id.test.ts` - GET /api/operation/:id
  - `update-operation.test.ts` - PATCH /api/operation/:id
- Token generation in tests now uses actual `TokenService` instead of reimplementing JWT logic
- Prisma client imports changed from `@prisma/client` to `prisma/generated`

### Fixed

- Date objects being converted to empty `{}` in API responses
- Hardcoded passwords removed from tests (now using `SEED_USER_PASSWORD` env var)
- ESLint `sonarjs/assertions-in-tests` warnings by adding explicit assertions
- DRY violations in test utilities

### Security

- Removed hardcoded passwords from test files
- Centralized password management through environment variables

## [0.1.0] - 2025-11-26

### Added

- Initial backend setup with Express.js
- Prisma ORM integration with PostgreSQL
- JWT authentication with access and refresh tokens
- Rate limiting middleware (10 requests/minute)
- Operation tree structure with parent-child relationships
- Discussion management endpoints
- User authentication and profile management
- Comprehensive error handling
- Input validation with Zod schemas
- API response standardization
- Test infrastructure setup with Jest and Supertest

### Documentation

- API endpoint documentation
- Tree update algorithm documentation
- Testing structure and guidelines
- Prisma schema documentation

---

## Version History

- **Unreleased** - Test restructuring, DRY improvements, bug fixes
- **0.1.0** - Initial backend implementation

## Migration Guide

### Migrating Tests to New Structure

If you have custom tests based on the old `operation-controller.test.ts`:

1. Identify which endpoint your test targets
2. Move the test to the appropriate file:
   - GET requests → `get-operations.test.ts` or `get-operation-by-id.test.ts`
   - POST requests → `create-operation.test.ts`
   - PATCH requests → `update-operation.test.ts`
3. Update imports to use `setupTestEnvironment()` from `test-setup.ts`
4. Remove `beforeEach`/`afterAll` if using setup helper

**Before:**

```typescript
describe('My Test', () => {
  let authToken: string;
  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser(...);
    authToken = generateAuthToken(user.id);
  });
  // tests...
});
```

**After:**

```typescript
import { setupTestEnvironment } from '../../helpers/test-setup';

describe('My Test', () => {
  const { app, authToken, userId } = setupTestEnvironment();
  // tests...
});
```

# Backend Development Context

## Purpose of This Context

This document captures the technical preferences, architectural patterns, and development standards for backend development work. Use this to guide implementation decisions and maintain consistency.

## User Profile

**Role:** Senior backend developer focused on Node.js/TypeScript systems  
**Priorities:** Code quality, test reliability, maintainability, simplicity  
**Work Style:** Prefers reviewing plans before implementation, provides concise feedback, values proactive problem-solving

## Communication Style Rules

- Keep messages **extremely concise** - avoid redundancy
- Provide implementation plans for complex work and request approval
- Use brief confirmations like "LGTM" as approval signals
- Don't over-explain obvious changes
- Highlight only non-obvious decisions or trade-offs
- Use selection comments to point out specific issues

## Technical Stack & Preferences

**Core Stack:**

- TypeScript (strict mode)
- Node.js with Express
- Prisma ORM with PostgreSQL
- Jest for testing
- Zod for validation

**Key Preferences:**

- Use existing utilities rather than creating new ones
- Import from `@/` path aliases
- Leverage Prisma's type generation
- Maintain proper separation of concerns

## Design & Architecture Principles

### Separation of Concerns

- Configuration separate from execution (e.g., `app.ts` vs `server.ts`)
- Controllers handle HTTP, services handle business logic
- Utilities are pure, reusable functions

### Test Architecture

**Critical: Tests must be completely self-contained**

- ❌ **NO** `beforeAll`, `beforeEach`, `afterEach`, or `afterAll` hooks
- ❌ **NO** shared test setup functions
- ❌ **NO** database cleanup between tests
- ✅ Each test creates its own user, discussion, and operations inline
- ✅ Use unique data (timestamps) to avoid collisions
- ✅ Tests can run in any order without interference

**Example pattern:**

```typescript
it('should test something', async () => {
  const user = await createTestUser();
  const authToken = generateAuthToken(user.id, user.email).accessToken;
  const discussion = await createTestDiscussion({ createdBy: user.id });
  // ... test logic
});
```

### Error Handling

- Use specific error types: `BadRequestError`, `NotFoundError`
- Never throw plain `Error` objects
- Validate inputs with Zod schemas
- Provide clear error messages

## Coding & Quality Standards

### Non-Negotiable Requirements

- All tests must pass (target: 61/61 or better)
- TypeScript types must be explicit and correct
- No `any` types unless absolutely necessary
- Proper null/undefined handling

### Code Organization

- Group imports logically: external, internal, types
- Use meaningful variable names
- Keep functions focused and single-purpose
- Add JSDoc comments for complex logic

### Testing Standards

- Test files mirror source structure
- Use descriptive test names
- Test both success and error cases
- Verify edge cases and validation

## Common Pitfalls to Avoid

1. **Test Setup Antipatterns**
   - Don't create shared `beforeAll` blocks
   - Don't attempt database cleanup strategies
   - Don't use helper functions that try to manage shared state

2. **Schema Assumptions**
   - Check if fields already exist before adding them
   - Use existing utility functions (e.g., `calculateOperationDepth`)
   - Don't duplicate validation logic

3. **Import Errors**
   - Use path aliases (`@/`, `@test/`)
   - Don't import from `@jest/globals` - use implicit Jest globals
   - Import types properly from Prisma

4. **Test Isolation**
   - Don't make assertions that depend on exact counts
   - Use `toBeGreaterThanOrEqual` for flexible assertions
   - Find specific items rather than iterating all results

## Output Format Expectations

### Artifacts

- **task.md**: Granular checklist with `[ ]`, `[/]`, `[x]` notation
- **implementation_plan.md**: Clear sections with file links, proposed changes, verification plan
- **walkthrough.md**: Concise summary of what was done, results, and files changed

### Code Changes

- Show diffs clearly
- Explain complexity rating honestly
- Mark TODO items explicitly if work is incomplete
- Run tests after changes

### Progress Updates

- Update task.md as work progresses
- Mark items in-progress `[/]` before complete `[x]`
- Provide test results (`61/61 passing`)

## How the AI Should Handle Uncertainty

### When to Ask

- If requirements conflict with established patterns
- If a proposed approach might break existing tests
- If architectural decisions have multiple valid options

### When to Proceed

- Following established patterns from codebase
- Making fixes that improve consistency
- Adding features with clear requirements and existing utilities

### Validation Approach

- Run tests after every significant change
- Verify assertions match actual API behavior
- Check that new code follows existing patterns
- Ensure TypeScript compilation succeeds

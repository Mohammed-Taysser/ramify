# Frontend Compatibility Fix: Decimal Serialization

## Problem

When Prisma with `Decimal` fields serializes data to JSON, it converts `Decimal` objects to strings (not numbers). This breaks the frontend which expects numeric values.

**Example:**

```typescript
// Database: DECIMAL(20, 10)
// Backend Prisma result: Decimal(123.45)
// JSON Response: "123.45" ← String, not number!
// Frontend expects: 123.45 ← Number
```

## Solution Implemented

**Best Practice:** Convert `Decimal` to `number` in the backend before sending to frontend.

Why this approach:

- ✅ Frontend remains simple
- ✅ Type safety maintained
- ✅ Centralized conversion logic
- ✅ No frontend changes needed

## Implementation

### 1. Created Decimal Utility ([decimal.utils.ts](file:///media/dev/0937ef2f-fba0-4ecb-93f1-94d94f7c78811/dev/research/ellty/ellty-second-task/backend/src/utils/decimal.utils.ts))

```typescript
export function convertDecimalsToNumbers<T>(obj: T): T {
  // Recursively converts Decimal objects to numbers
  // Handles: primitives, objects, arrays, nested structures
}

export function toNumberResponse<T>(data: T): T {
  return convertDecimalsToNumbers(data);
}
```

**Features:**

- Recursively processes nested objects and arrays
- Preserves null, undefined, and primitive values
- Type-safe with generics
- Tested with 9 comprehensive test cases

### 2. Updated Response Utilities ([response.utils.ts](file:///media/dev/0937ef2f-fba0-4ecb-93f1-94d94f7c78811/dev/research/ellty/ellty-second-task/backend/src/utils/response.utils.ts))

```typescript
function sendSuccessResponse<T>(params: SuccessResponseParams<T>) {
  return response.status(statusCode).json({
    success: true,
    message,
    data: toNumberResponse(data), // ← Automatic conversion
  });
}

function sendPaginatedResponse<T>(params: PaginatedResponseParams<T>) {
  return response.status(statusCode).json({
    success: true,
    message,
    data: {
      data: toNumberResponse(data), // ← Automatic conversion
      metadata,
    },
  });
}
```

**Result:** All controller responses automatically convert Decimals to numbers

### 3. Test Coverage

Created [decimal.utils.test.ts](file:///media/dev/0937ef2f-fba0-4ecb-93f1-94d94f7c78811/dev/research/ellty/ellty-second-task/backend/src/utils/__tests__/decimal.utils.test.ts):

```bash
✓ should convert Decimal to number
✓ should convert object with Decimal fields
✓ should convert nested objects
✓ should convert arrays
✓ should convert arrays of objects
✓ should handle null and undefined
✓ should preserve primitive values
✓ should handle deep nesting
✓ should be an alias for convertDecimalsToNumbers

Test Suites: 1 passed
Tests: 9 passed
```

## API Response Format

**Before Fix:**

```json
{
  "success": true,
  "data": {
    "value": "123.45", // String!
    "beforeValue": "100.00", // String!
    "afterValue": "223.45" // String!
  }
}
```

**After Fix:**

```json
{
  "success": true,
  "data": {
    "value": 123.45, // Number ✓
    "beforeValue": 100, // Number ✓
    "afterValue": 223.45 // Number ✓
  }
}
```

## Alternative Approaches Considered

### Option 1: Convert in Frontend ❌

```typescript
// Would require this in every component
const value = typeof data.value === 'string' ? parseFloat(data.value) : data.value;
```

**Rejected:** Too much boilerplate, error-prone

### Option 2: Custom Prisma Serializer ❌

```typescript
// Override Prisma's JSON serialization
```

**Rejected:** Too invasive, hard to maintain

### Option 3: Backend Conversion ✅ CHOSEN

- Centralized in response utilities
- Automatic for all endpoints
- Transparent to controllers
- Easy to test

## Impact

- ✅ **Zero Frontend Changes Required**
- ✅ **All Existing Endpoints Fixed**
- ✅ **Type Safety Maintained**
- ✅ **Fully Tested (9 test cases)**

## Testing

```bash
# Test decimal conversion specifically
yarn test decimal.utils

# Test all endpoints
yarn test

# Verify frontend
# Open frontend, check network tab
# All numeric fields should be numbers, not strings
```

## Migration Notes

No migration needed! The fix is backward compatible:

- Frontend already expects numbers
- Backend now sends numbers instead of strings
- Transparent upgrade

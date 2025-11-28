# API Documentation

## Overview

This document provides additional information about the Ramify API beyond what's in the Swagger documentation.

## Rate Limiting

All creation endpoints have rate limiting to prevent spam and abuse:

**Creation Endpoints** (10 requests/minute):

- `POST /api/discussions` - Create discussion
- `POST /api/operations` - Create operation

**General Endpoints** (100 requests/minute):

- All other API endpoints

Rate limit headers are included in responses:

```
RateLimit-Limit: 10
RateLimit-Remaining: 9
RateLimit-Reset: 1640000000
```

When rate limit is exceeded:

```json
{
  "success": false,
  "message": "Too many requests, please try again later.",
  "statusCode": 429
}
```

## Input Validation

All numeric inputs are validated to:

- Reject `NaN` (Not a Number)
- Reject `Infinity` and `-Infinity`
- Ensure within safe JavaScript number range
- Accept both number and string formats

## Tree Depth

Operations have a maximum tree depth of **10 levels** to prevent performance issues.

Each operation tracks its depth:

```json
{
  "id": 1,
  "depth": 0, // Root operation
  "parentId": null
}
```

## Testing

**Manual Testing:** See `backend/docs/MANUAL_TESTING.md`  
**Automated Tests:** Run `yarn test` in backend directory

Test Coverage:

- Operation service (arithmetic, edge cases)
- Depth validation utilities

## Environment Configuration

**Development:** Uses `.env` file  
**Testing:** Uses `.env.test` file

The application automatically loads the correct environment file based on `NODE_ENV`.

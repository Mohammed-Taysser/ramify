# Manual Testing Guide

This document provides manual testing procedures for verifying the security enhancements and features.

## Prerequisites

- Backend server running on `http://localhost:8080`
- Valid authentication token (login first)
- Tools: `curl`, `jq` (optional for JSON formatting)

## Getting an Auth Token

```bash
# Login to get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@demo.com",
    "password": "Demo@123456"
  }' | jq -r '.data.token'

# Store token in variable
export TOKEN="<your-token-here>"
```

## Test 1: Decimal Precision

**Objective:** Verify that calculations use exact decimal arithmetic

```bash
# Step 1: Create discussion with decimal starting value
curl -X POST http://localhost:8080/api/discussions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Decimal Precision Test",
    "startingValue": 0.1
  }' | jq

# Note the discussion ID from response
export DISCUSSION_ID=<discussion-id>

# Step 2: Add 0.2 (should equal exactly 0.3)
curl -X POST http://localhost:8080/api/operations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"discussionId\": $DISCUSSION_ID,
    \"operation\": \"ADD\",
    \"value\": 0.2,
    \"title\": \"Add 0.2\"
  }" | jq

# Step 3: Verify result is exactly 0.3
curl http://localhost:8080/api/discussions/$DISCUSSION_ID | jq '.data.operations[0].afterValue'

# Expected: "0.3" (not "0.30000000000000004")

# Step 4: Multiply by 3 (should equal exactly 0.9)
curl -X POST http://localhost:8080/api/operations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"parentId\": <operation-id-from-step-2>,
    \"operation\": \"MULTIPLY\",
    \"value\": 3,
    \"title\": \"Multiply by 3\"
  }" | jq

# Expected afterValue: "0.9" (exactly)
```

**Success Criteria:**

- ✅ `0.1 + 0.2 = 0.3` (exactly)
- ✅ `0.3 × 3 = 0.9` (exactly)
- ✅ No floating-point precision errors

---

## Test 2: Rate Limiting

**Objective:** Verify creation endpoints are rate-limited to 10 requests/minute

```bash
# Create test script
cat > test_rate_limit.sh << 'EOF'
#!/bin/bash
TOKEN="$1"
ENDPOINT="$2"

echo "Testing rate limit on $ENDPOINT"
echo "Sending 15 requests..."

for i in {1..15}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8080/api/$ENDPOINT" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"Rate Test $i\", \"startingValue\": 1}")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  echo "Request $i: HTTP $HTTP_CODE"

  if [ "$HTTP_CODE" == "429" ]; then
    echo "✅ Rate limit triggered at request $i"
  fi

  sleep 0.3
done
EOF

chmod +x test_rate_limit.sh

# Run test
./test_rate_limit.sh "$TOKEN" "discussions"
```

**Success Criteria:**

- ✅ Requests 1-10: HTTP 201 (Created)
- ✅ Requests 11+: HTTP 429 (Too Many Requests)
- ✅ Response includes rate limit headers

**Check Headers:**

```bash
curl -I -X POST http://localhost:8080/api/discussions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "startingValue": 1}'

# Expected headers:
# RateLimit-Limit: 10
# RateLimit-Remaining: 9
# RateLimit-Reset: <timestamp>
```

---

## Test 3: Input Validation (NaN/Infinity)

**Objective:** Verify that invalid numbers are rejected

```bash
# Test 3.1: NaN rejection
curl -X POST http://localhost:8080/api/operations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discussionId": 1,
    "operation": "ADD",
    "value": "NaN"
  }'

# Expected: HTTP 400
# Expected message: "Value must be a valid finite number"

# Test 3.2: Infinity rejection
curl -X POST http://localhost:8080/api/operations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discussionId": 1,
    "operation": "ADD",
    "value": "Infinity"
  }'

# Expected: HTTP 400
# Expected message: "Value must be a valid finite number"

# Test 3.3: Valid decimal string
curl -X POST http://localhost:8080/api/operations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discussionId": 1,
    "operation": "ADD",
    "value": "123.456"
  }'

# Expected: HTTP 201 (success)
```

**Success Criteria:**

- ✅ NaN is rejected with 400
- ✅ Infinity is rejected with 400
- ✅ Valid decimal strings are accepted
- ✅ Error messages are descriptive

---

## Test 4: Division by Zero Protection

**Objective:** Verify division by zero is prevented

```bash
# Attempt to divide by zero
curl -X POST http://localhost:8080/api/operations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discussionId": 1,
    "operation": "DIVIDE",
    "value": 0
  }'

# Expected: HTTP 400
# Expected message: "Cannot divide by zero"
```

**Success Criteria:**

- ✅ Returns HTTP 400
- ✅ Clear error message
- ✅ No operation created

---

## Test 5: Tree Depth Validation

**Objective:** Verify operations cannot exceed MAX_TREE_DEPTH (10 levels)

```bash
# Create a deep tree (this will be implemented once depth validation is integrated)
# Start with discussion
DISCUSSION_ID=1
PARENT_ID=""

# Create 11 nested operations
for i in {1..11}; do
  if [ -z "$PARENT_ID" ]; then
    # First operation (root)
    RESPONSE=$(curl -s -X POST http://localhost:8080/api/operations \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"discussionId\": $DISCUSSION_ID,
        \"operation\": \"ADD\",
        \"value\": 1,
        \"title\": \"Level $i\"
      }")
  else
    # Nested operation
    RESPONSE=$(curl -s -X POST http://localhost:8080/api/operations \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"parentId\": $PARENT_ID,
        \"operation\": \"ADD\",
        \"value\": 1,
        \"title\": \"Level $i\"
      }")
  fi

  PARENT_ID=$(echo "$RESPONSE" | jq -r '.data.id')
  HTTP_CODE=$(echo "$RESPONSE" | jq -r '.statusCode')

  echo "Level $i: ID=$PARENT_ID (HTTP $HTTP_CODE)"

  if [ "$HTTP_CODE" != "201" ]; then
    echo "❌ Failed at level $i"
    break
  fi
done
```

**Success Criteria (once integrated):**

- ✅ Levels 1-10: HTTP 201 (success)
- ✅ Level 11: HTTP 400 (rejected)
- ✅ Error: "Maximum tree depth of 10 exceeded"

---

## Test 6: Calculation Cascading

**Objective:** Verify that updating an operation recalculates descendants

```bash
# 1. Create a chain: 10 → +5 → ×2 → -3
DISCUSSION_ID=1

# Root operation: +5 (10 + 5 = 15)
OP1=$(curl -s -X POST http://localhost:8080/api/operations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"discussionId\": $DISCUSSION_ID,
    \"operation\": \"ADD\",
    \"value\": 5
  }" | jq -r '.data.id')

# Child: ×2 (15 × 2 = 30)
OP2=$(curl -s -X POST http://localhost:8080/api/operations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"parentId\": $OP1,
    \"operation\": \"MULTIPLY\",
    \"value\": 2
  }" | jq -r '.data.id')

# Grandchild: -3 (30 - 3 = 27)
OP3=$(curl -s -X POST http://localhost:8080/api/operations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"parentId\": $OP2,
    \"operation\": \"SUBTRACT\",
    \"value\": 3
  }" | jq -r '.data.id')

# 2. Verify initial values
curl -s http://localhost:8080/api/operations/$OP3 | jq '.data.afterValue'
# Expected: 27

# 3. Update middle operation (×2 → ×3)
curl -X PATCH http://localhost:8080/api/operations/$OP2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": 3}'

# 4. Check if grandchild was recalculated
curl -s http://localhost:8080/api/operations/$OP3 | jq '.data.afterValue'
# Expected: 42 (15 × 3 = 45, 45 - 3 = 42)
```

**Success Criteria:**

- ✅ Initial calculation: 27
- ✅ After update: 42
- ✅ Update message includes "descendant(s) recalculated"

---

## Automated Test Alternative

For automated regression testing, use the Jest test suite (once implemented):

```bash
# Run all backend tests
cd backend
yarn test

# Run specific test suite
yarn test operation.service.test.ts

# Run with coverage
yarn test:coverage
```

---

## Troubleshooting

**Issue:** Rate limit not working

- **Solution:** Check if `creationRateLimiter` is applied in route files
- **Verify:** Headers should include `RateLimit-*`

**Issue:** Decimal precision still wrong

- **Solution:** Check Prisma migration was applied: `yarn prisma:migrate`
- **Verify:** Database columns should be `DECIMAL(20,10)`

**Issue:** Token expired

- **Solution:** Login again to get fresh token
- **Note:** Tokens expire after configured JWT lifetime

---

## Quick Reference

**Get new token:**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@demo.com", "password": "Demo@123456"}' \
  | jq -r '.data.token'
```

**List all discussions:**

```bash
curl "http://localhost:8080/api/discussions" | jq
```

**Get discussion with operations:**

```bash
curl "http://localhost:8080/api/discussions/<id>" | jq
```

**Delete test data:**

```bash
cd backend
yarn prisma:reset  # Caution: Deletes all data!
yarn prisma:seed   # Restore demo data
```

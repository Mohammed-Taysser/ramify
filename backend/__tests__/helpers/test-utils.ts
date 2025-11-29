import { Discussion, Operation, OPERATION_TYPE, User } from '@prisma';

import CONFIG from '@/apps/config';
import prisma from '@/apps/prisma';
import { calculateOperation } from '@/modules/operation/operation.service';
import tokenService from '@/services/token.service';

/**
 * Create a test user with default values
 */
async function createTestUser(overrides: Partial<User> = {}) {
  const rawPassword = overrides.password || CONFIG.SEED_USER_PASSWORD;
  const hashedPassword = await tokenService.hash(rawPassword);

  return prisma.user.create({
    data: {
      name: overrides.name || `Test User ${Date.now()}`,
      email: overrides.email || `test-${Date.now()}@example.com`,
      password: hashedPassword,
    },
  });
}

/**
 * Create a test discussion with optional user
 */
async function createTestDiscussion(overrides: Partial<Discussion> = {}) {
  let userId = overrides.createdBy;

  if (!userId) {
    const user = await createTestUser();
    userId = user.id;
  }

  return prisma.discussion.create({
    data: {
      title: overrides.title || `Test Discussion ${Date.now()}`,
      startingValue: overrides.startingValue || 100,
      createdBy: userId,
      isEnded: overrides.isEnded || false,
    },
    include: {
      user: true,
      operations: true,
    },
  });
}

/**
 * Create a test operation
 */
async function createTestOperation(overrides: Partial<Operation> = {}) {
  let discussionId = overrides.discussionId;
  let userId = overrides.createdBy;

  if (!discussionId) {
    const discussion = await createTestDiscussion();
    discussionId = discussion.id;
    userId = discussion.createdBy;
  }

  if (!userId) {
    const user = await createTestUser();
    userId = user.id;
  }

  const operationType = overrides.operationType || OPERATION_TYPE.ADD;
  const value = overrides.value || 10;

  // Get discussion to calculate beforeValue
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
  });

  const beforeValue = overrides.parentId
    ? await getOperationAfterValue(overrides.parentId)
    : Number(discussion?.startingValue || 0);

  const afterValue = calculateOperation(beforeValue, operationType, value);

  return prisma.operation.create({
    data: {
      discussionId,
      parentId: overrides.parentId || null,
      operationType,
      value,
      beforeValue,
      afterValue,
      title: overrides.title || `${operationType} ${value}`,
      createdBy: userId,
      depth: overrides.depth || 0,
    },
    include: {
      user: true,
    },
  });
}

/**
 * Generate JWT tokens for a user
 * Uses actual TokenService from src to avoid DRY violations
 */
function generateAuthToken(userId: number, email: string = 'test@example.com') {
  const accessToken = tokenService.signAccessToken({ id: userId, email });
  const refreshToken = tokenService.signRefreshToken({ id: userId, email });

  return { accessToken, refreshToken };
}

/**
 * Get operation's after value
 */
async function getOperationAfterValue(operationId: number): Promise<number> {
  const operation = await prisma.operation.findUnique({
    where: { id: operationId },
    select: { afterValue: true },
  });

  return operation?.afterValue ?? 0;
}

export { createTestDiscussion, createTestOperation, createTestUser, generateAuthToken };

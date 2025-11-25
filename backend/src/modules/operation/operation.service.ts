import Decimal from 'decimal.js';
import type { OPERATION_TYPE, Operation, Prisma } from 'prisma/generated';

import { BadRequestError, NotFoundError } from '@/utils/errors.utils';

/**
 * Calculate the result of an operation using Decimal for precision
 */
function calculateOperation(
  beforeValue: Decimal,
  operationType: OPERATION_TYPE,
  value: Decimal
): Decimal {
  switch (operationType) {
    case 'ADD':
      return beforeValue.plus(value);
    case 'SUBTRACT':
      return beforeValue.minus(value);
    case 'MULTIPLY':
      return beforeValue.times(value);
    case 'DIVIDE':
      if (value.isZero()) {
        throw new BadRequestError('Cannot divide by zero');
      }
      return beforeValue.dividedBy(value);
    default:
      throw new BadRequestError(`Invalid operation type: ${operationType}`);
  }
}

/**
 * Recursively fetch all descendant operations of a given operation
 */
async function getDescendantOperations(
  operationId: number,
  tx: Prisma.TransactionClient
): Promise<Operation[]> {
  const children = await tx.operation.findMany({
    where: { parentId: operationId },
  });

  const descendants: Operation[] = [...children];

  for (const child of children) {
    const childDescendants = await getDescendantOperations(child.id, tx);
    descendants.push(...childDescendants);
  }

  return descendants;
}

/**
 * Topological sort operations by depth (breadth-first)
 * Ensures parents are processed before children
 */
function topologicalSort(operations: Operation[]): Operation[] {
  if (operations.length === 0) return [];

  // Build adjacency map
  const childrenMap = new Map<number, Operation[]>();
  const operationMap = new Map<number, Operation>();

  for (const op of operations) {
    operationMap.set(op.id, op);
    if (op.parentId) {
      if (!childrenMap.has(op.parentId)) {
        childrenMap.set(op.parentId, []);
      }
      childrenMap.get(op.parentId)!.push(op);
    }
  }

  // BFS traversal
  const sorted: Operation[] = [];
  const queue: Operation[] = [];

  // Find root operations (those whose parent is not in the operations list)
  for (const op of operations) {
    if (op.parentId && !operationMap.has(op.parentId)) {
      queue.push(op);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    const children = childrenMap.get(current.id) || [];
    queue.push(...children);
  }

  return sorted;
}

/**
 * Recalculate the entire tree of descendants for a given operation
 * This is called after an operation is updated to cascade changes
 *
 * @param operationId - The ID of the operation that was updated
 * @param tx - Prisma transaction client
 * @returns Number of operations recalculated
 */
export async function recalculateOperationTree(
  operationId: number,
  tx: Prisma.TransactionClient
): Promise<number> {
  // 1. Fetch all descendants
  const descendants = await getDescendantOperations(operationId, tx);

  if (descendants.length === 0) {
    return 0; // No descendants to update
  }

  // 2. Sort by depth (parents before children)
  const sorted = topologicalSort(descendants);

  // 3. Update each operation
  for (const op of sorted) {
    const parent = await tx.operation.findUnique({
      where: { id: op.parentId! },
      select: { afterValue: true },
    });

    if (!parent) {
      throw new NotFoundError(`Parent operation ${op.parentId} not found`);
    }

    // Convert Prisma Decimal to decimal.js Decimal
    const parentAfterValue = new Decimal(parent.afterValue.toString());
    const opValue = new Decimal(op.value.toString());
    const newAfterValue = calculateOperation(parentAfterValue, op.operationType, opValue);

    await tx.operation.update({
      where: { id: op.id },
      data: {
        beforeValue: parentAfterValue,
        afterValue: newAfterValue,
      },
    });
  }

  return descendants.length;
}

/**
 * Export helper function for use in controllers
 */
export { calculateOperation };

const operationService = {
  recalculateOperationTree,
  calculateOperation,
  getDescendantOperations,
};

export default operationService;

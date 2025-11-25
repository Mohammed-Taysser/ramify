/**
 * Constants and utilities for managing operation tree depth
 */

export const MAX_TREE_DEPTH = 50;

/**
 * Calculate the depth of an operation based on its parent
 * @param parentDepth - The depth of the parent operation (0 for root operations)
 * @returns The depth of the new operation
 */
export function calculateOperationDepth(parentDepth: number): number {
  return parentDepth + 1;
}

/**
 * Validate if adding a new operation would exceed max depth
 * @param parentDepth - The depth of the parent operation
 * @throws Error if depth would exceed MAX_TREE_DEPTH
 */
export function validateTreeDepth(parentDepth: number): void {
  const newDepth = calculateOperationDepth(parentDepth);
  if (newDepth > MAX_TREE_DEPTH) {
    throw new Error(
      `Maximum tree depth of ${MAX_TREE_DEPTH} exceeded. Cannot add operation at depth ${newDepth}.`
    );
  }
}

/**
 * Constants and utilities for managing operation tree depth
 */

/**
 * Maximum allowed tree depth
 * NOTE: This is currently a constant, but could be made configurable
 * by storing in database (e.g., in a Settings table) for better flexibility
 */
export const MAX_TREE_DEPTH = 10;

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
 * @param maxDepth - Optional custom max depth (defaults to MAX_TREE_DEPTH)
 * @throws Error if depth would exceed maxDepth
 */
export function validateTreeDepth(parentDepth: number, maxDepth: number = MAX_TREE_DEPTH): void {
  const newDepth = calculateOperationDepth(parentDepth);
  if (newDepth > maxDepth) {
    throw new Error(
      `Maximum tree depth of ${maxDepth} exceeded. Cannot add operation at depth ${newDepth}.`
    );
  }
}

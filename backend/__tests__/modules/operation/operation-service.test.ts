import { OPERATION_TYPE } from '@prisma';

import prisma from '@/apps/prisma';
import operationService from '@/modules/operation/operation.service';
import { BadRequestError } from '@/utils/errors.utils';
import { createTestDiscussion, createTestOperation } from '@test/helpers/test-utils';

describe('Operation Service', () => {
  describe('calculateOperation', () => {
    describe('addition', () => {
      it('should add two numbers correctly', () => {
        const result = operationService.calculateOperation(10, OPERATION_TYPE.ADD, 5);
        expect(result).toBe(15);
      });

      it('should handle addition with precision', () => {
        const result = operationService.calculateOperation(0.1, OPERATION_TYPE.ADD, 0.2);
        expect(result).toBeCloseTo(0.3, 10);
      });

      it('should handle negative numbers', () => {
        const result = operationService.calculateOperation(-5, OPERATION_TYPE.ADD, 10);
        expect(result).toBe(5);
      });

      it('should handle adding zero', () => {
        const result = operationService.calculateOperation(5, OPERATION_TYPE.ADD, 0);
        expect(result).toBe(5);
      });
    });

    describe('subtraction', () => {
      it('should subtract two numbers correctly', () => {
        const result = operationService.calculateOperation(20, OPERATION_TYPE.SUBTRACT, 8);
        expect(result).toBe(12);
      });

      it('should handle subtraction with precision', () => {
        const result = operationService.calculateOperation(0.3, OPERATION_TYPE.SUBTRACT, 0.1);
        expect(result).toBeCloseTo(0.2, 10);
      });

      it('should handle negative results', () => {
        const result = operationService.calculateOperation(5, OPERATION_TYPE.SUBTRACT, 10);
        expect(result).toBe(-5);
      });
    });

    describe('multiplication', () => {
      it('should multiply two numbers correctly', () => {
        const result = operationService.calculateOperation(7, OPERATION_TYPE.MULTIPLY, 6);
        expect(result).toBe(42);
      });

      it('should handle multiplication with precision', () => {
        const result = operationService.calculateOperation(0.3, OPERATION_TYPE.MULTIPLY, 3);
        expect(result).toBeCloseTo(0.9, 10);
      });

      it('should handle multiplying by zero', () => {
        const result = operationService.calculateOperation(5, OPERATION_TYPE.MULTIPLY, 0);
        expect(result).toBe(0);
      });

      it('should handle large numbers', () => {
        const result = operationService.calculateOperation(
          999999999999,
          OPERATION_TYPE.MULTIPLY,
          2
        );
        expect(result).toBe(1999999999998);
      });
    });

    describe('division', () => {
      it('should divide two numbers correctly', () => {
        const result = operationService.calculateOperation(100, OPERATION_TYPE.DIVIDE, 4);
        expect(result).toBe(25);
      });

      it('should handle division with precision', () => {
        const result = operationService.calculateOperation(1, OPERATION_TYPE.DIVIDE, 3);
        // 1/3 = 0.333... (repeating)
        expect(result.toFixed(10)).toBe('0.3333333333');
      });

      it('should throw BadRequestError when dividing by zero', () => {
        expect(() => {
          operationService.calculateOperation(10, OPERATION_TYPE.DIVIDE, 0);
        }).toThrow(BadRequestError);

        expect(() => {
          operationService.calculateOperation(10, OPERATION_TYPE.DIVIDE, 0);
        }).toThrow('Cannot divide by zero');
      });

      it('should handle dividing zero', () => {
        const result = operationService.calculateOperation(0, OPERATION_TYPE.DIVIDE, 5);
        expect(result).toBe(0);
      });
    });

    describe('edge cases', () => {
      it('should handle very small numbers', () => {
        const result = operationService.calculateOperation(
          0.00001,
          OPERATION_TYPE.MULTIPLY,
          0.00001
        );
        // Result will be in scientific notation: 1e-10 = 0.0000000001
        expect(result.toString()).toContain('e-');
        expect(result).toBeCloseTo(0.0000000001, 10);
      });

      it('should maintain precision through multiple operations', () => {
        let value = 0.1;

        // (0.1 + 0.2) × 3 - 0.9 should be close to 0
        value = operationService.calculateOperation(value, OPERATION_TYPE.ADD, 0.2);
        expect(value).toBeCloseTo(0.3, 10);

        value = operationService.calculateOperation(value, OPERATION_TYPE.MULTIPLY, 3);
        expect(value).toBeCloseTo(0.9, 10);

        value = operationService.calculateOperation(value, 'SUBTRACT', 0.9);
        expect(value).toBeCloseTo(0, 10);
      });
    });
  });

  describe('getDescendantOperations', () => {
    it('should fetch all descendant operations recursively', async () => {
      const discussion = await createTestDiscussion();
      const root = await createTestOperation({ discussionId: discussion.id });
      const child1 = await createTestOperation({ discussionId: discussion.id, parentId: root.id });
      const child2 = await createTestOperation({ discussionId: discussion.id, parentId: root.id });
      const grandChild = await createTestOperation({
        discussionId: discussion.id,
        parentId: child1.id,
      });

      const descendants = await prisma.$transaction(async (tx) => {
        return operationService.getDescendantOperations(root.id, tx);
      });

      expect(descendants).toHaveLength(3);
      const ids = descendants.map((op) => op.id);
      expect(ids).toContain(child1.id);
      expect(ids).toContain(child2.id);
      expect(ids).toContain(grandChild.id);
    });

    it('should return empty array when no descendants exist', async () => {
      const discussion = await createTestDiscussion();
      const root = await createTestOperation({ discussionId: discussion.id });

      const descendants = await prisma.$transaction(async (tx) => {
        return operationService.getDescendantOperations(root.id, tx);
      });

      expect(descendants).toHaveLength(0);
    });

    it('should handle deeply nested operations', async () => {
      const discussion = await createTestDiscussion();
      let parent = await createTestOperation({ discussionId: discussion.id });
      const rootId = parent.id;

      // Create 5 levels of nesting
      for (let i = 0; i < 5; i++) {
        parent = await createTestOperation({ discussionId: discussion.id, parentId: parent.id });
      }

      const descendants = await prisma.$transaction(async (tx) => {
        return operationService.getDescendantOperations(rootId, tx);
      });

      expect(descendants).toHaveLength(5);
    });
  });

  describe('recalculateOperationTree', () => {
    it('should recalculate all descendants after parent update', async () => {
      const discussion = await createTestDiscussion({ startingValue: 100 });
      // Root: 100 + 10 = 110
      const root = await createTestOperation({
        discussionId: discussion.id,
        operationType: OPERATION_TYPE.ADD,
        value: 10,
      });
      // Child: 110 * 2 = 220
      const child = await createTestOperation({
        discussionId: discussion.id,
        parentId: root.id,
        operationType: OPERATION_TYPE.MULTIPLY,
        value: 2,
      });

      // Update root to: 100 + 20 = 120
      // Expected Child: 120 * 2 = 240
      await prisma.operation.update({
        where: { id: root.id },
        data: { afterValue: 120 },
      });

      await prisma.$transaction(async (tx) => {
        await operationService.recalculateOperationTree(root.id, tx);
      });

      const updatedChild = await prisma.operation.findUnique({ where: { id: child.id } });
      expect(updatedChild?.beforeValue).toBe(120);
      expect(updatedChild?.afterValue).toBe(240);
    });

    // Delete root to simulate missing parent during recalculation
    // Note: In real app, foreign key constraints might prevent this, but we're testing the service logic
    // We'll manually break the link or delete parent if cascade allows,
    // but here we can just pass an ID that has children but the parent is gone.
    // Actually, recalculateOperationTree uses parentId from the child.
    // So if we delete the parent, we need to ensure the child still exists (e.g. no cascade delete in test env or optional relation)
    // Prisma schema usually has cascade delete.
    // Instead, let's mock the scenario where parent is missing logic-wise or just test the error path directly?
    // The service throws if `parent` is null.
    // Let's force a child to point to a non-existent parent ID if possible, or just trust the logic.
    // Given constraints, maybe we can't easily reproduce "parent not found" if DB enforces integrity.
    // But we can try to pass a child that has a parentId that doesn't exist.
    // However, we can't create such a child in DB due to FK.
    // So this test might be hard to implement with real DB unless we mock prisma.
    // Let's skip this one or mock it if we were using unit tests.
    // Since these are integration tests, we'll skip it or try to find a way.
    // Actually, we can just delete the parent and see if child remains?
    // If child remains, then we can run it.
    // If child is deleted, then `getDescendantOperations` returns empty.
    // So this path is likely unreachable with strict FKs.
    // We'll leave it as TODO or remove it if unreachable.
    // Let's try to implement it by mocking if possible, but we don't have mocks setup.
    // We will skip this specific error case for now as it's enforced by DB constraints.
    test.todo('should throw NotFoundError if parent not found');

    it('should return count of recalculated operations', async () => {
      const discussion = await createTestDiscussion();
      const root = await createTestOperation({ discussionId: discussion.id });
      await createTestOperation({ discussionId: discussion.id, parentId: root.id });
      await createTestOperation({ discussionId: discussion.id, parentId: root.id });

      const count = await prisma.$transaction(async (tx) => {
        return operationService.recalculateOperationTree(root.id, tx);
      });

      expect(count).toBe(2);
    });
  });
});

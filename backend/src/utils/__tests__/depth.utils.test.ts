import { describe, expect, it } from '@jest/globals';

import { calculateOperationDepth, MAX_TREE_DEPTH, validateTreeDepth } from '../depth.utils';

describe('Depth Utilities', () => {
  describe('calculateOperationDepth', () => {
    it('should calculate depth for root operation', () => {
      const depth = calculateOperationDepth(0);
      expect(depth).toBe(1);
    });

    it('should calculate depth for nested operation', () => {
      const depth = calculateOperationDepth(5);
      expect(depth).toBe(6);
    });

    it('should handle large depth values', () => {
      const depth = calculateOperationDepth(99);
      expect(depth).toBe(100);
    });
  });

  describe('validateTreeDepth', () => {
    it('should allow operations within max depth', () => {
      expect(() => {
        validateTreeDepth(0); // depth will be 1
      }).not.toThrow();

      expect(() => {
        validateTreeDepth(5); // depth will be 6
      }).not.toThrow();

      expect(() => {
        validateTreeDepth(MAX_TREE_DEPTH - 1); // depth will be MAX_TREE_DEPTH
      }).not.toThrow();
    });

    it('should reject operations exceeding max depth', () => {
      expect(() => {
        validateTreeDepth(MAX_TREE_DEPTH); // depth will be MAX_TREE_DEPTH + 1
      }).toThrow();

      expect(() => {
        validateTreeDepth(MAX_TREE_DEPTH + 5);
      }).toThrow();
    });

    it('should include depth information in error message', () => {
      try {
        validateTreeDepth(MAX_TREE_DEPTH);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(
          `Maximum tree depth of ${MAX_TREE_DEPTH} exceeded`
        );
        expect((error as Error).message).toContain(`depth ${MAX_TREE_DEPTH + 1}`);
      }
    });

    it('should support custom max depth', () => {
      const customMax = 5;

      // Should allow up to custom max
      expect(() => {
        validateTreeDepth(customMax - 1, customMax);
      }).not.toThrow();

      // Should reject beyond custom max
      expect(() => {
        validateTreeDepth(customMax, customMax);
      }).toThrow();
    });

    it('should use default MAX_TREE_DEPTH when not provided', () => {
      expect(() => {
        validateTreeDepth(MAX_TREE_DEPTH);
      }).toThrow();

      expect(() => {
        validateTreeDepth(MAX_TREE_DEPTH - 1);
      }).not.toThrow();
    });
  });

  describe('MAX_TREE_DEPTH constant', () => {
    it('should have correct configured value', () => {
      expect(MAX_TREE_DEPTH).toBe(10);
    });

    it('should be a positive integer', () => {
      expect(MAX_TREE_DEPTH).toBeGreaterThan(0);
      expect(Number.isInteger(MAX_TREE_DEPTH)).toBe(true);
    });
  });
});

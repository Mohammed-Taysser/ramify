import { calculateOperationDepth, MAX_TREE_DEPTH, validateTreeDepth } from '@/utils/depth.utils';
import { BadRequestError } from '@/utils/errors.utils';

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

    it('should handle zero parent depth', () => {
      const depth = calculateOperationDepth(0);
      expect(depth).toBeGreaterThan(0);
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
      }).toThrow(BadRequestError);

      expect(() => {
        validateTreeDepth(MAX_TREE_DEPTH + 5);
      }).toThrow(BadRequestError);
    });

    it('should include depth information in error message', () => {
      try {
        validateTreeDepth(MAX_TREE_DEPTH);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestError);
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
      }).toThrow(BadRequestError);
    });

    it('should use default MAX_TREE_DEPTH when not provided', () => {
      expect(() => {
        validateTreeDepth(MAX_TREE_DEPTH);
      }).toThrow(BadRequestError);

      expect(() => {
        validateTreeDepth(MAX_TREE_DEPTH - 1);
      }).not.toThrow();
    });

    it('should throw BadRequestError with correct status code', () => {
      try {
        validateTreeDepth(MAX_TREE_DEPTH);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect((error as BadRequestError).statusCode).toBe(400);
      }
    });

    it('should handle edge case at exactly max depth', () => {
      expect(() => {
        validateTreeDepth(MAX_TREE_DEPTH - 1);
      }).not.toThrow();

      expect(() => {
        validateTreeDepth(MAX_TREE_DEPTH);
      }).toThrow();
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

    it('should be a reasonable value for tree depth', () => {
      expect(MAX_TREE_DEPTH).toBeGreaterThanOrEqual(5);
      expect(MAX_TREE_DEPTH).toBeLessThanOrEqual(100);
    });
  });
});

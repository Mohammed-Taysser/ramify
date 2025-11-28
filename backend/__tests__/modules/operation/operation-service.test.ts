import { OPERATION_TYPE } from '@prisma';

import operationService from '@/modules/operation/operation.service';
import { BadRequestError } from '@/utils/errors.utils';

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
    it.todo('should fetch all descendant operations recursively');
    it.todo('should return empty array when no descendants exist');
    it.todo('should handle deeply nested operations');
  });

  describe('recalculateOperationTree', () => {
    it.todo('should recalculate all descendants after parent update');
    it.todo('should throw NotFoundError if parent not found');
    it.todo('should return count of recalculated operations');
  });
});

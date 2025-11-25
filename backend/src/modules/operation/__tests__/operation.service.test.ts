import { describe, expect, it } from '@jest/globals';
import Decimal from 'decimal.js';

import operationService from '../operation.service';

import { BadRequestError } from '@/utils/errors.utils';

describe('Operation Service', () => {
  describe('calculateOperation', () => {
    it('should add two numbers correctly', () => {
      const result = operationService.calculateOperation(new Decimal(10), 'ADD', new Decimal(5));
      expect(result.toString()).toBe('15');
    });

    it('should handle decimal addition with precision', () => {
      const result = operationService.calculateOperation(new Decimal(0.1), 'ADD', new Decimal(0.2));
      expect(result.toString()).toBe('0.3');
    });

    it('should subtract two numbers correctly', () => {
      const result = operationService.calculateOperation(
        new Decimal(20),
        'SUBTRACT',
        new Decimal(8)
      );
      expect(result.toString()).toBe('12');
    });

    it('should multiply two numbers correctly', () => {
      const result = operationService.calculateOperation(
        new Decimal(7),
        'MULTIPLY',
        new Decimal(6)
      );
      expect(result.toString()).toBe('42');
    });

    it('should handle decimal multiplication with precision', () => {
      const result = operationService.calculateOperation(
        new Decimal(0.3),
        'MULTIPLY',
        new Decimal(3)
      );
      expect(result.toString()).toBe('0.9');
    });

    it('should divide two numbers correctly', () => {
      const result = operationService.calculateOperation(
        new Decimal(100),
        'DIVIDE',
        new Decimal(4)
      );
      expect(result.toString()).toBe('25');
    });

    it('should handle decimal division with precision', () => {
      const result = operationService.calculateOperation(new Decimal(1), 'DIVIDE', new Decimal(3));
      // 1/3 = 0.333... (repeating)
      expect(result.toFixed(10)).toBe('0.3333333333');
    });

    it('should throw BadRequestError when dividing by zero', () => {
      expect(() => {
        operationService.calculateOperation(new Decimal(10), 'DIVIDE', new Decimal(0));
      }).toThrow(BadRequestError);

      expect(() => {
        operationService.calculateOperation(new Decimal(10), 'DIVIDE', new Decimal(0));
      }).toThrow('Cannot divide by zero');
    });

    it('should handle negative numbers correctly', () => {
      const result = operationService.calculateOperation(new Decimal(-5), 'ADD', new Decimal(10));
      expect(result.toString()).toBe('5');
    });

    it('should handle large numbers correctly', () => {
      const result = operationService.calculateOperation(
        new Decimal(999999999999),
        'MULTIPLY',
        new Decimal(2)
      );
      expect(result.toString()).toBe('1999999999998');
    });

    it('should handle very small decimal numbers', () => {
      const result = operationService.calculateOperation(
        new Decimal(0.00001),
        'MULTIPLY',
        new Decimal(0.00001)
      );
      // Result will be in scientific notation: 1e-10 = 0.0000000001
      expect(result.toString()).toBe('1e-10');
      expect(result.toNumber()).toBe(0.0000000001);
    });
  });

  describe('getDescendantOperations', () => {
    // Note: This test requires a Prisma mock or test database
    // For now, we'll skip implementation
    it.todo('should fetch all descendant operations recursively');
    it.todo('should return empty array when no descendants exist');
    it.todo('should handle deeply nested operations');
  });

  describe('recalculateOperationTree', () => {
    // Note: This test requires a Prisma mock or test database
    it.todo('should recalculate all descendants after parent update');
    it.todo('should throw NotFoundError if parent not found');
    it.todo('should return count of recalculated operations');
  });
});

describe('Operation Service Edge Cases', () => {
  it('should handle zero as operand', () => {
    const addZero = operationService.calculateOperation(new Decimal(5), 'ADD', new Decimal(0));
    expect(addZero.toString()).toBe('5');

    const multiplyZero = operationService.calculateOperation(
      new Decimal(5),
      'MULTIPLY',
      new Decimal(0)
    );
    expect(multiplyZero.toString()).toBe('0');
  });

  it('should maintain precision through multiple operations', () => {
    let value = new Decimal(0.1);

    // (0.1 + 0.2) × 3 - 0.9 should equal 0
    value = operationService.calculateOperation(value, 'ADD', new Decimal(0.2));
    expect(value.toString()).toBe('0.3');

    value = operationService.calculateOperation(value, 'MULTIPLY', new Decimal(3));
    expect(value.toString()).toBe('0.9');

    value = operationService.calculateOperation(value, 'SUBTRACT', new Decimal(0.9));
    expect(value.toString()).toBe('0');
  });
});

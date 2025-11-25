import { describe, expect, it } from '@jest/globals';
import Decimal from 'decimal.js';

import { convertDecimalsToNumbers, toNumberResponse } from '@/utils/decimal.utils';

describe('Decimal Utils', () => {
  describe('convertDecimalsToNumbers', () => {
    it('should convert Decimal to number', () => {
      const decimal = new Decimal(123.456);
      const result = convertDecimalsToNumbers(decimal);
      expect(result).toBe(123.456);
      expect(typeof result).toBe('number');
    });

    it('should convert object with Decimal fields', () => {
      const obj = {
        id: 1,
        value: new Decimal(10.5),
        name: 'test',
      };
      const result = convertDecimalsToNumbers(obj);
      expect(result.value).toBe(10.5);
      expect(typeof result.value).toBe('number');
      expect(result.id).toBe(1);
      expect(result.name).toBe('test');
    });

    it('should convert nested objects', () => {
      const obj = {
        operation: {
          value: new Decimal(5),
          beforeValue: new Decimal(10),
          afterValue: new Decimal(15),
        },
      };
      const result = convertDecimalsToNumbers(obj);
      expect(result.operation.value).toBe(5);
      expect(result.operation.beforeValue).toBe(10);
      expect(result.operation.afterValue).toBe(15);
    });

    it('should convert arrays', () => {
      const arr = [new Decimal(1), new Decimal(2), new Decimal(3)];
      const result = convertDecimalsToNumbers(arr);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should convert arrays of objects', () => {
      const arr = [{ value: new Decimal(1.1) }, { value: new Decimal(2.2) }];
      const result = convertDecimalsToNumbers(arr);
      expect(result[0].value).toBe(1.1);
      expect(result[1].value).toBe(2.2);
    });

    it('should handle null and undefined', () => {
      expect(convertDecimalsToNumbers(null)).toBe(null);
      expect(convertDecimalsToNumbers(undefined)).toBe(undefined);
    });

    it('should preserve primitive values', () => {
      expect(convertDecimalsToNumbers(123)).toBe(123);
      expect(convertDecimalsToNumbers('test')).toBe('test');
      expect(convertDecimalsToNumbers(true)).toBe(true);
    });

    it('should handle deep nesting', () => {
      const obj = {
        discussion: {
          startingValue: new Decimal(100),
          operations: [
            {
              value: new Decimal(10),
              children: [
                {
                  value: new Decimal(5),
                },
              ],
            },
          ],
        },
      };
      const result = convertDecimalsToNumbers(obj);
      expect(result.discussion.startingValue).toBe(100);
      expect(result.discussion.operations[0].value).toBe(10);
      expect(result.discussion.operations[0].children[0].value).toBe(5);
    });
  });

  describe('toNumberResponse', () => {
    it('should be an alias for convertDecimalsToNumbers', () => {
      const obj = { value: new Decimal(42) };
      const result = toNumberResponse(obj);
      expect(result.value).toBe(42);
    });
  });
});

import Decimal from 'decimal.js';

/**
 * Fields in our models that use Decimal type
 * Only convert these specific fields for efficiency
 */
const DECIMAL_FIELDS = ['value', 'beforeValue', 'afterValue', 'startingValue'] as const;

/**
 * Check if value is a Decimal (either decimal.js or Prisma Decimal)
 * Prisma Decimals have structure: {s: number, e: number, d: number[]}
 */
function isDecimalLike(value: unknown): boolean {
  if (value instanceof Decimal) {
    return true;
  }

  // Check for Prisma Decimal structure
  if (
    value &&
    typeof value === 'object' &&
    's' in value &&
    'e' in value &&
    'd' in value &&
    Array.isArray((value as Record<string, unknown>).d)
  ) {
    return true;
  }

  return false;
}

/**
 * Convert Decimal-like value to number
 */
function decimalToNumber(value: unknown): number {
  if (value instanceof Decimal) {
    return value.toNumber();
  }

  // Handle Prisma Decimal by converting its internal structure
  if (isDecimalLike(value)) {
    const dec = value as { s: number; e: number; d: number[] };
    // Reconstruct the decimal value from Prisma's internal representation
    // s = sign (1 or -1), e = exponent, d = digits array
    let result = 0;
    const digits = dec.d;

    for (let i = 0; i < digits.length; i++) {
      result += digits[i] * Math.pow(10, dec.e - i * 7);
    }

    return dec.s * result;
  }

  return Number(value);
}

/**
 * Convert known Decimal fields in an object to numbers
 * Only processes fields that are actually Decimal types
 *
 * @param obj - Object potentially containing Decimal values
 * @returns Object with Decimal fields converted to numbers
 */
export function convertDecimalsToNumbers<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Decimal instances directly
  if (isDecimalLike(obj)) {
    return decimalToNumber(obj) as T;
  }

  // Handle arrays - process each item
  if (Array.isArray(obj)) {
    return obj.map((item) => convertDecimalsToNumbers(item)) as T;
  }

  // Handle objects - only convert known Decimal fields
  if (typeof obj === 'object') {
    const converted = { ...obj } as Record<string, unknown>;

    // Only process known Decimal fields for efficiency
    for (const field of DECIMAL_FIELDS) {
      if (field in converted && isDecimalLike(converted[field])) {
        converted[field] = decimalToNumber(converted[field]);
      }
    }

    // Recursively process nested objects and arrays
    for (const [key, value] of Object.entries(converted)) {
      if (value && typeof value === 'object') {
        converted[key] = convertDecimalsToNumbers(value);
      }
    }

    return converted as T;
  }

  // Return primitives as-is
  return obj;
}

/**
 * Convert Decimal fields in Prisma result to numbers
 * Use this before sending data to frontend
 *
 * @example
 * const operation = await prisma.operation.findUnique({...});
 * const response = toNumberResponse(operation);
 * res.json(response);
 */
export function toNumberResponse<T>(data: T): T {
  return convertDecimalsToNumbers(data);
}

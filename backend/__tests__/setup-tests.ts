/**
 * Global test setup
 * Runs before all tests
 */

// Set NODE_ENV before loading config
process.env.NODE_ENV = 'test';

// Set test timeout
jest.setTimeout(10000);

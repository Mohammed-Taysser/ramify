/**
 * Global test setup
 * Runs before all tests
 */

// Set NODE_ENV before loading config
process.env.NODE_ENV = 'test';

// Config will automatically load .env.test based on NODE_ENV
// No need to manually set environment variables here

// Set test timeout
jest.setTimeout(10000);

// Global teardown
afterAll(async () => {
  // Close any open connections
  await new Promise((resolve) => setTimeout(resolve, 500));
});

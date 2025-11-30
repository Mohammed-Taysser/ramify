import { NextFunction, Request, Response } from 'express';

import errorHandlerMiddleware from '@/middleware/error-handler.middleware';
import { BadRequestError, InternalServerError } from '@/utils/errors.utils';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRequest = {
      originalUrl: '/api/test',
      method: 'GET',
    };
    mockResponse = {
      status: statusMock,
    };
    mockNext = jest.fn();
  });

  it('should handle BaseError with JSON message', () => {
    const error = new BadRequestError('Invalid input');

    errorHandlerMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Invalid input',
      })
    );
  });

  it('should handle BaseError with string message', () => {
    // Create error with message that isn't valid JSON
    const error = new BadRequestError({ field: 'email', message: 'Invalid' });

    errorHandlerMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalled();
  });

  it('should handle non-BaseError as 500', () => {
    const error = new Error('Unexpected error');

    errorHandlerMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Internal Server Error',
      })
    );
  });

  it('should handle error in test environment', () => {
    const error = new InternalServerError();

    errorHandlerMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    // Test environment behaves like production
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalled();
    const callArg = jsonMock.mock.calls[0][0];
    expect(callArg).toHaveProperty('success', false);
    expect(callArg).toHaveProperty('error');
  });

  it('should not include stack trace in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new InternalServerError();

    errorHandlerMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    const callArg = jsonMock.mock.calls[0][0];
    expect(callArg).not.toHaveProperty('stack');
    expect(callArg).not.toHaveProperty('path');
    expect(callArg).not.toHaveProperty('method');

    process.env.NODE_ENV = originalEnv;
  });
});

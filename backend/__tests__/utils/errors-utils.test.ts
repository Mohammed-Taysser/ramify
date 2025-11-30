import {
  BadRequestError,
  BaseError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '@/utils/errors.utils';

describe('errors.utils', () => {
  describe('BaseError', () => {
    it('should create error with message and statusCode', () => {
      const error = new BaseError('Test error', 500);
      expect(error.message).toBe(JSON.stringify('Test error'));
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('BaseError');
    });

    it('should handle object error messages', () => {
      const errorObj = { field: 'email', message: 'Invalid email' };
      const error = new BaseError(errorObj, 400);
      expect(error.message).toBe(JSON.stringify(errorObj));
    });
  });

  describe('BadRequestError', () => {
    it('should create error with default message', () => {
      const error = new BadRequestError();
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(JSON.stringify('Bad Request'));
    });

    it('should create error with custom message', () => {
      const error = new BadRequestError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(JSON.stringify('Invalid input'));
    });
  });

  describe('UnauthorizedError', () => {
    it('should create error with default message', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe(JSON.stringify('Unauthorized'));
    });

    it('should create error with custom message', () => {
      const error = new UnauthorizedError('Token expired');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe(JSON.stringify('Token expired'));
    });
  });

  describe('ForbiddenError', () => {
    it('should create error with default message', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe(JSON.stringify('Forbidden'));
    });

    it('should create error with custom message', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe(JSON.stringify('Access denied'));
    });
  });

  describe('NotFoundError', () => {
    it('should create error with default message', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe(JSON.stringify('Not Found'));
    });

    it('should create error with custom message', () => {
      const error = new NotFoundError('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe(JSON.stringify('User not found'));
    });
  });

  describe('ConflictError', () => {
    it('should create error with default message', () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe(JSON.stringify('Conflict'));
    });

    it('should create error with custom message', () => {
      const error = new ConflictError('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe(JSON.stringify('Email already exists'));
    });
  });

  describe('InternalServerError', () => {
    it('should create error with default message', () => {
      const error = new InternalServerError();
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe(JSON.stringify('Internal Server Error'));
    });

    it('should create error with custom message', () => {
      const error = new InternalServerError('Database connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe(JSON.stringify('Database connection failed'));
    });
  });

  describe('TooManyRequestsError', () => {
    it('should create error with default message', () => {
      const error = new TooManyRequestsError();
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe(JSON.stringify('Too Many Requests'));
    });

    it('should create error with custom message', () => {
      const error = new TooManyRequestsError('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe(JSON.stringify('Rate limit exceeded'));
    });
  });
});

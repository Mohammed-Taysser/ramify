class BaseError extends Error {
  public statusCode: number;

  constructor(error: ErrorContent, statusCode: number) {
    const resolvedMessage = JSON.stringify(error);

    super(resolvedMessage);
    this.statusCode = statusCode;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Derived error classes
class BadRequestError extends BaseError {
  constructor(error: ErrorContent = 'Bad Request') {
    super(error, 400);
  }
}

class UnauthorizedError extends BaseError {
  constructor(error: ErrorContent = 'Unauthorized') {
    super(error, 401);
  }
}

class NotFoundError extends BaseError {
  constructor(error: ErrorContent = 'Not Found') {
    super(error, 404);
  }
}

class ForbiddenError extends BaseError {
  constructor(error: ErrorContent = 'Forbidden') {
    super(error, 403);
  }
}

class ConflictError extends BaseError {
  constructor(error: ErrorContent = 'Conflict') {
    super(error, 409);
  }
}

class InternalServerError extends BaseError {
  constructor(error: ErrorContent = 'Internal Server Error') {
    super(error, 500);
  }
}

class TooManyRequestsError extends BaseError {
  constructor(error: ErrorContent = 'Too Many Requests') {
    super(error, 429);
  }
}

export {
  BadRequestError,
  BaseError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
};

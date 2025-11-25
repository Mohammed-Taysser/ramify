import { Response } from 'express';

import { toNumberResponse } from './decimal.utils';

interface SuccessResponseParams<T> {
  response: Response;
  statusCode?: number;
  message?: string;
  data?: T;
}

interface PaginatedResponseParams<T> {
  response: Response;
  statusCode?: number;
  message?: string;
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function sendSuccessResponse<T>(params: SuccessResponseParams<T>) {
  const { response, statusCode = 200, message, data } = params;

  return response.status(statusCode).json({
    success: true,
    message,
    // Convert Decimal values to numbers before sending to frontend
    data: toNumberResponse(data),
  });
}

function sendPaginatedResponse<T>(params: PaginatedResponseParams<T>) {
  const { response, statusCode = 200, message, data, metadata } = params;

  return response.status(statusCode).json({
    success: true,
    message,
    data: {
      // Convert Decimal values to numbers before sending to frontend
      data: toNumberResponse(data),
      metadata,
    },
  });
}

export { sendPaginatedResponse, sendSuccessResponse };

interface AxiosSimpleResponse {
  data: Array<SimpleResponseEntity>;
}

interface AxiosPaginatedResponse<T> {
  data: {
    data: T[];
    metadata: {
      "total": number;
      "page": number,
      "limit": number;
      "totalPages": number;
    };
  };
}

interface AxiosSuccessResponse<T> {
  data: T;
}

interface ApiNormalError {
  error: string;
}

interface ApiValidationError {
  [key: string]: string;
}

type APIResponseError = AxiosError<ApiNormalError | ApiValidationError>;


interface SimpleResponseEntity {
  id: number;
  name: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

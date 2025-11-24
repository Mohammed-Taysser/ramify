import axios, { type AxiosInstance } from 'axios';
import { API_ENDPOINT, LOCAL_STORAGE_KEYS, SITEMAP } from './config';
import routes from './routes';

class HTTPService {
  protected client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_ENDPOINT,
    });

    this.client.interceptors.request.use(
      async (request) => {
        const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.accessToken);

        if (accessToken) {
          request.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        request.headers['Accept-Language'] = 'en';

        if (!request.headers['Content-Type']) {
          request.headers['Content-Type'] = 'application/json';
        }

        return request;
      },
      (error) => {
        return Promise.reject(error as Error);
      }
    );

    this.client.interceptors.response.use(
      function (response) {
        return response;
      },
      async (error) => {
        const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.refreshToken);

        // Check if this is a 401 error and NOT the refresh token endpoint itself
        const canRefresh =
          error.response?.status === 401 &&
          refreshToken &&
          error.config.url !== 'auth/refresh-token';

        if (canRefresh) {
          try {
            // Lazy-load authApi to avoid circular dependency
            const { default: authApi } = await import('@/api/auth.api');
            const response = await authApi.refreshToken(refreshToken);

            localStorage.setItem(LOCAL_STORAGE_KEYS.accessToken, response.data.data.accessToken);

            // Update refresh token if provided
            if (response.data.data.refreshToken) {
              localStorage.setItem(
                LOCAL_STORAGE_KEYS.refreshToken,
                response.data.data.refreshToken
              );
            }

            // Retry the original request with new token
            return this.client(error.config);
          } catch (err) {
            // Refresh failed - clear auth and redirect to login
            localStorage.removeItem(LOCAL_STORAGE_KEYS.user);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.accessToken);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.refreshToken);

            routes.navigate(SITEMAP.login.path);

            return Promise.reject(err);
          }
        }

        if (
          error.request.responseType === 'blob' &&
          error.response.data instanceof Blob &&
          error.response.data.type &&
          error.response.data.type.toLowerCase().indexOf('json') != -1
        ) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                error.response.data = JSON.parse(reader.result as string);
              }
              resolve(Promise.reject(error));
            };

            reader.onerror = () => {
              reject(error);
            };

            reader.readAsText(error.response.data);
          });
        }

        return Promise.reject(error as Error);
      }
    );
  }
}

export default HTTPService;

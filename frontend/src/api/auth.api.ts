import HTTPService from '@/apps/http-service';

class AuthAPI extends HTTPService {
  me() {
    return this.client.get<AxiosSuccessResponse<AuthenticatedUser>>('users/me');
  }

  login(body: LoginRequestPayload) {
    return this.client.post<AxiosSuccessResponse<AuthResponse>>('auth/login', body);
  }

  register(body: RegisterRequestPayload) {
    return this.client.post<AxiosSuccessResponse<AuthResponse>>('auth/register', body);
  }

  refreshToken(token: string) {
    return this.client.post<AxiosSuccessResponse<RefreshTokenResponse>>('auth/refresh-token', {
      refreshToken: token,
    });
  }

  switchUser(userId: number) {
    return this.client.post<AxiosSuccessResponse<AuthResponse>>('auth/switch-user', {
      userId,
    });
  }
}

export default new AuthAPI();

import HTTPService from '@/apps/http-service';

class UserAPI extends HTTPService {
  getList() {
    return this.client.get<AxiosSuccessResponse<{ id: number; name: string; email: string }[]>>(
      'users/all'
    );
  }
}

export default new UserAPI();

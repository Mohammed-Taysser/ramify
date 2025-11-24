import AxiosAPI from './http-service';

abstract class EntityService<
  T,
  CreatePayload,
  UpdatePayload,
  FilterParams  = Partial<BaseFilterParams>,
> extends AxiosAPI {
  protected endpoint: string;

  constructor(endpoint: string) {
    super();
    this.endpoint = endpoint;
  }

  getList(params?: FilterParams) {
    return this.client.get<AxiosPaginatedResponse<T>>(`${this.endpoint}/`, {
      params,
    });
  }

  getSimpleList(params?: FilterParams) {
    return this.client.get<AxiosSimpleResponse>(
      `${this.endpoint}/GetListModel`,
      {
        params,
      }
    );
  }

  getById(id: number) {
    return this.client.get<AxiosSuccessResponse<T>>(`${this.endpoint}/${id}/`);
  }

  export(params?: FilterParams) {
    return this.client.get<Blob>(`${this.endpoint}/export/`, {
      params,
      responseType: 'blob',
    });
  }

  create(payload: CreatePayload) {
    return this.client.post<AxiosSuccessResponse<T>>(
      `${this.endpoint}/`,
      payload
    );
  }

  createForm(payload: CreatePayload) {
    return this.client.postForm<AxiosSuccessResponse<T>>(
      `${this.endpoint}/`,
      payload
    );
  }

  update(id: number, payload: Partial< UpdatePayload>) {
    return this.client.patch<AxiosSuccessResponse<T>>(
      `${this.endpoint}/${id}/`,
      payload
    );
  }

  updateForm(id: number, payload: Partial< UpdatePayload>) {
    return this.client.patchForm<AxiosSuccessResponse<T>>(
      `${this.endpoint}/${id}/`,
      payload
    );
  }

  delete(id: number) {
    return this.client.delete<void>(`${this.endpoint}/${id}`);
  }

  deActive(id: number, isStopped: boolean) {
    return this.client.patch(`${this.endpoint}/${id}`, {
      isStopped,
    });
  }
}

export default EntityService;

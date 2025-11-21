type Maybe<T> = T | undefined;

interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface BaseFilterParams {
  page?: number;
  pageSize?: number;
}

import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';

export interface Unit {
  id: number;
  name: string;
  code: string;
  precision: number;
}
const unitApiPath = '/units';
export const unitApiFn = {
  getAll: (page: number, limit: number, total?: number) =>
    api
      .get<ApiResponse<Unit[]>>(unitApiPath, { params: { page, limit, total } })
      .then((r) => r.data),
  create: (payload: Omit<Unit, 'id'>) =>
    api
      .put<ApiResponse<Unit>>(unitApiPath, { id: 0, ...payload })
      .then((r) => r.data),
  update: (id: number, payload: Partial<Unit>) =>
    api
      .patch<ApiResponse<Unit>>(`${unitApiPath}/${id}`, payload)
      .then((r) => r.data),
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`${unitApiPath}/${id}`).then((r) => r.data),
};

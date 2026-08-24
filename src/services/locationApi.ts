export interface Location {
  id: number;
  name: string;
  type: string;
  description: string;
}
import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';

const locationApiPath = '/inventory_locations';
export const locationApiFn = {
  getAll: (page: number, limit: number, total?: number) =>
    api
      .get<ApiResponse<Location[]>>(locationApiPath, {
        params: { page, limit, total },
      })
      .then((r) => r.data),
  create: (payload: Omit<Location, 'id'>) =>
    api
      .put<ApiResponse<Location>>(locationApiPath, { id: 0, ...payload })
      .then((r) => r.data),
  update: (id: number, payload: Partial<Location>) =>
    api
      .patch<ApiResponse<Location>>(`${locationApiPath}/${id}`, payload)
      .then((r) => r.data),
  delete: (id: number) =>
    api
      .delete<ApiResponse<null>>(`${locationApiPath}/${id}`)
      .then((r) => r.data),
};

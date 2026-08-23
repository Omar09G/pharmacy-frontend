import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';

const taxApiPath = '/tax_profiles';

export interface TaxProfile {
  id: number;
  name: string;
  rate: number;
  isInclusive: boolean;
  description?: string;
}

//Valid Error GeT all Tax Profiles

export const taxApiFn = {
  getAll: (page: number, limit: number, total?: number) =>
    api
      .get<ApiResponse<TaxProfile[]>>(taxApiPath, {
        params: { page, limit, total },
      })
      .then((r) => r.data),
  create: (payload: Omit<TaxProfile, 'id'>) =>
    api
      .put<ApiResponse<TaxProfile>>(taxApiPath, { id: 0, ...payload })
      .then((r) => r.data),
  update: (id: number, payload: Partial<TaxProfile>) =>
    api
      .patch<ApiResponse<TaxProfile>>(`${taxApiPath}/${id}`, payload)
      .then((r) => r.data),
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`${taxApiPath}/${id}`).then((r) => r.data),
};

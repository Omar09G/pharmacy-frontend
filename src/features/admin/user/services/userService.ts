import { ApiResponse } from '../../../../utils/Utils';

import AxioscCient from '../../../../services/Service';
import {
  UserRequest,
  UserResponse,
} from '../../../../components/Admin/User/Utils/utils';

const BASE = '/user';

export const userService = {
  async fetchUsers(page = 0, limit = 0, total = 0) {
    const pageTotal = page - 1;
    try {
      const res = await AxioscCient.get<ApiResponse<UserResponse[]>>(BASE, {
        params: { page: pageTotal, limit, total },
      });
      return { items: res.data.data, total: res.data.total };
    } catch (err: unknown) {
      let message = 'API error';
      if (err instanceof Error) message = err.message;
      throw new Error(message);
    }
  },

  async getUser(id: number) {
    try {
      const res = await AxioscCient.get<ApiResponse<UserResponse>>(
        `${BASE}/${id}`,
      );
      return res.data.data;
    } catch (err: unknown) {
      let message = 'API error';
      if (err instanceof Error) message = err.message;
      throw new Error(message);
    }
  },

  async createUser(payload: UserRequest) {
    try {
      const res = await AxioscCient.put<ApiResponse<UserRequest>>(
        BASE,
        payload,
      );
      return res.data.data;
    } catch (err: unknown) {
      let message = 'API error';
      if (err instanceof Error) message = err.message;
      throw new Error(message);
    }
  },

  async updateUser(id: number, payload: Partial<UserRequest>) {
    try {
      const res = await AxioscCient.patch<ApiResponse<UserRequest>>(
        `${BASE}/${id}`,
        payload,
      );
      return res.data.data;
    } catch (err: unknown) {
      let message = 'API error';
      if (err instanceof Error) message = err.message;
      throw new Error(message);
    }
  },

  async deleteUser(id: number) {
    try {
      const res = await AxioscCient.delete<ApiResponse<{ success: boolean }>>(
        `${BASE}/${id}`,
      );
      return res.data.data;
    } catch (err: unknown) {
      let message = 'API error';
      if (err instanceof Error) message = err.message;
      throw new Error(message);
    }
  },
};

export default userService;

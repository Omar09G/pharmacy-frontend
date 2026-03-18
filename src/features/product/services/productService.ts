import { ApiResponse } from '../../../utils/Utils';
import { ProductRequest } from '../../../components/Product/Utils/UtilsProduct';
import AxioscCient from '../../../services/Service';

const BASE = '/product';
const BASE_DETAILS = '/product/details';

export const productService = {
  async fetchProducts(page = 0, limit = 0, total = 0) {
    const pageTotal = page - 1;
    try {
      const res = await AxioscCient.get<ApiResponse<ProductRequest[]>>(BASE, {
        params: { page: pageTotal, limit, total },
      });

      const ilResult = {
        items: res.data.data,
        total: res.data.total,
      };

      return ilResult;
    } catch (err: any) {
      throw new Error(
        err?.response?.data?.message || err.message || 'API error',
      );
    }
  },

  async getProduct(id: number) {
    try {
      const res = await AxioscCient.get<ApiResponse<ProductRequest>>(
        `${BASE}/${id}`,
      );
      return res.data.data;
    } catch (err: any) {
      throw new Error(
        err?.response?.data?.message || err.message || 'API error',
      );
    }
  },

  async createProduct(payload: Omit<ProductRequest, 'productd'>) {
    try {
      const res = await AxioscCient.put<ApiResponse<ProductRequest>>(
        BASE,
        payload,
      );
      return res.data.data;
    } catch (err: any) {
      throw new Error(
        err?.response?.data?.message || err.message || 'API error',
      );
    }
  },

  async updateProduct(id: number, payload: Partial<ProductRequest>) {
    try {
      const res = await AxioscCient.patch<ApiResponse<ProductRequest>>(
        `${BASE}/${id}`,
        payload,
      );
      return res.data.data;
    } catch (err: any) {
      throw new Error(
        err?.response?.data?.message || err.message || 'API error',
      );
    }
  },

  async deleteProduct(id: number) {
    try {
      const res = await AxioscCient.delete<ApiResponse<{ success: boolean }>>(
        `${BASE}/${id}`,
      );
      return res.data.data;
    } catch (err: any) {
      throw new Error(
        err?.response?.data?.message || err.message || 'API error',
      );
    }
  },

  async getProductDetails(page = 0, limit = 0, total = 0, productName: string) {
    const pageTotal = page - 1;
    try {
      const res = await AxioscCient.get<ApiResponse<ProductRequest[]>>(
        BASE_DETAILS,
        {
          params: { page: pageTotal, limit, total, productName },
        },
      );

      const ilResult = {
        items: res.data.data,
        total: res.data.total,
      };

      return ilResult;
    } catch (err: any) {
      throw new Error(
        err?.response?.data?.message || err.message || 'API error',
      );
    }
  },
};

export default productService;

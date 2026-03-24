import { ApiResponse } from '../../../utils/Utils';
import { ProductRequest } from '../../../components/Product/Utils/UtilsProduct';
import AxioscCient from '../../../services/Service';

type AxiosLike =
  | { response?: { data?: { message?: string } } }
  | Record<string, unknown>;

const BASE = '/product';
const BASE_DETAILS = '/product/details';
const BASE_CODE = '/product/code';

//Funcion para validar con expecion regular si el texto ingresado es un numero o no, para buscar por nombre o por codigo de barras
export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

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
    } catch (err: unknown) {
      let message = 'API error';
      if (err instanceof Error) message = err.message;
      if (err && typeof err === 'object' && 'response' in err) {
        message = (err as AxiosLike).response?.data?.message ?? message;
      }
      throw new Error(message);
    }
  },

  async getProduct(id: number) {
    try {
      const res = await AxioscCient.get<ApiResponse<ProductRequest>>(
        `${BASE}/${id}`,
      );
      return res.data.data;
    } catch (err: unknown) {
      let message = 'API error';
      if (err instanceof Error) message = err.message;
      if (err && typeof err === 'object' && 'response' in err) {
        message = (err as AxiosLike).response?.data?.message ?? message;
      }
      throw new Error(message);
    }
  },

  async createProduct(payload: Omit<ProductRequest, 'productId'>) {
    try {
      const res = await AxioscCient.put<ApiResponse<ProductRequest>>(
        BASE,
        payload,
      );
      return res.data.data;
    } catch (err: unknown) {
      let message = 'API error';
      if (err instanceof Error) message = err.message;
      if (err && typeof err === 'object' && 'response' in err) {
        message = (err as AxiosLike).response?.data?.message ?? message;
      }
      throw new Error(message);
    }
  },

  async updateProduct(id: number, payload: Partial<ProductRequest>) {
    try {
      const res = await AxioscCient.patch<ApiResponse<ProductRequest>>(
        `${BASE}/${id}`,
        payload,
      );
      return res.data.data;
    } catch (err: unknown) {
      let message = 'API error';
      if (err instanceof Error) message = err.message;
      if (err && typeof err === 'object' && 'response' in err) {
        message = (err as AxiosLike).response?.data?.message ?? message;
      }
      throw new Error(message);
    }
  },

  async deleteProduct(id: number) {
    try {
      const res = await AxioscCient.delete<ApiResponse<{ success: boolean }>>(
        `${BASE}/${id}`,
      );
      return res.data.data;
    } catch (err: unknown) {
      let message = 'API error';
      if (err instanceof Error) message = err.message;
      if (err && typeof err === 'object' && 'response' in err) {
        message = (err as AxiosLike).response?.data?.message ?? message;
      }
      throw new Error(message);
    }
  },

  async getProductDetails(page = 0, limit = 0, total = 0, productName: string) {
    const pageTotal = page - 1;
    const BASE_URL: string = isNumeric(productName) ? BASE_CODE : BASE_DETAILS;
    try {
      const res = await AxioscCient.get<ApiResponse<ProductRequest[]>>(
        BASE_URL,
        {
          params: { page: pageTotal, limit, total, productName },
        },
      );

      const ilResult = {
        items: res.data.data,
        total: res.data.total,
      };

      return ilResult;
    } catch (err: unknown) {
      let message = 'API error';
      if (err instanceof Error) message = err.message;
      if (err && typeof err === 'object' && 'response' in err) {
        message = (err as AxiosLike).response?.data?.message ?? message;
      }
      throw new Error(message);
    }
  },
};

export default productService;

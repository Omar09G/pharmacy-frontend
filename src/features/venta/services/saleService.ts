import { ApiResponse } from '../../../utils/Utils';
import AxioscCient from '../../../services/Service';
import {
  PaginationParamsSales,
  SalesDetailResponseDTO,
  SalesRequestDTO,
  SalesResponse,
  SalesResponseDTO,
  SalesResponseIdDTO,
} from '../ventaDto/ventaDto';

type AxiosLike = { response?: { data?: { message?: string } } };

const BASE = '/sale';

function apiErr(err: unknown): never {
  let message = 'API error';
  if (err instanceof Error) message = err.message;
  if (err && typeof err === 'object' && 'response' in err) {
    message = (err as AxiosLike).response?.data?.message ?? message;
  }
  throw new Error(message);
}

export const saleService = {
  // ── PUT /v1/api/sale ────────────────────────────────────────────────────
  // Body: SalesRequestDTO (camelCase, includes details[])
  // Returns: SalesResponseIdDTO { id }
  async createSale(payload: SalesRequestDTO): Promise<SalesResponseIdDTO> {
    try {
      const res = await AxioscCient.put<ApiResponse<SalesResponseIdDTO>>(
        BASE,
        payload,
      );
      return res.data.data;
    } catch (err) {
      apiErr(err);
    }
  },

  // ── GET /v1/api/sale/{sale_id} ─────────────────────────────────────────
  // Path: sale_id (number)
  // Returns: SalesResponse (parent + details)
  async getSaleById(id: number): Promise<SalesResponse> {
    try {
      const res = await AxioscCient.get<ApiResponse<SalesResponse>>(
        `${BASE}/${id}`,
      );
      return res.data.data;
    } catch (err) {
      apiErr(err);
    }
  },

  // ── DELETE /v1/api/sale/{sale_id} ──────────────────────────────────────
  async deleteSale(id: number): Promise<void> {
    try {
      await AxioscCient.delete(`${BASE}/${id}`);
    } catch (err) {
      apiErr(err);
    }
  },

  // ── PATCH /v1/api/sale/cancel/{sale_id} ────────────────────────────────
  // Sets status = "CANCEL" and restores product stock
  async cancelSale(id: number): Promise<void> {
    try {
      await AxioscCient.patch(`${BASE}/cancel/${id}`);
    } catch (err) {
      apiErr(err);
    }
  },

  // ── GET /v1/api/sale/date/{date} ───────────────────────────────────────
  // NOTE: handler reads Query<PaginationParamsSales>; the path param {date}
  //       is actually ignored — dateInicio in query is used.
  // Query: PaginationParamsSales { page, limit, dateInicio (YYYY-MM-DD) }
  // Returns: paginated SalesResponse[]
  async getSalesByDate(
    params: PaginationParamsSales,
  ): Promise<{ items: SalesResponse[]; total: number }> {
    try {
      const res = await AxioscCient.get<ApiResponse<SalesResponse[]>>(
        `${BASE}/date/${params.dateInicio ?? ''}`,
        { params },
      );
      return { items: res.data.data ?? [], total: res.data.total ?? 0 };
    } catch (err) {
      apiErr(err);
    }
  },

  // ── GET /v1/api/sale/user/{username} ───────────────────────────────────
  // NOTE: handler reads Query<PaginationParamsSales>; username in query.
  // Query: PaginationParamsSales { page, limit, username }
  // Returns: paginated SalesResponse[]
  async getSalesByUsername(
    params: PaginationParamsSales,
  ): Promise<{ items: SalesResponse[]; total: number }> {
    try {
      const res = await AxioscCient.get<ApiResponse<SalesResponse[]>>(
        `${BASE}/user/`,
        { params },
      );
      return { items: res.data.data ?? [], total: res.data.total ?? 0 };
    } catch (err) {
      apiErr(err);
    }
  },

  // ── GET /v1/api/sale/search ────────────────────────────────────────────
  // Query: PaginationParamsSales { page, limit, dateInicio, dateFin }
  // Returns: paginated SalesResponse[] between date range
  async searchSales(
    params: PaginationParamsSales,
  ): Promise<{ items: SalesResponse[]; total: number }> {
    try {
      const res = await AxioscCient.get<ApiResponse<SalesResponse[]>>(
        `${BASE}/search`,
        { params },
      );
      return { items: res.data.data ?? [], total: res.data.total ?? 0 };
    } catch (err) {
      apiErr(err);
    }
  },

  // ── GET /v1/api/sale/detail/{sale_id} ─────────────────────────────────
  // Path: sale_id → returns child detail rows for that sale
  async getSaleDetailsById(id: number): Promise<SalesDetailResponseDTO[]> {
    try {
      const res = await AxioscCient.get<ApiResponse<SalesDetailResponseDTO[]>>(
        `${BASE}/detail/${id}`,
      );
      return res.data.data ?? [];
    } catch (err) {
      apiErr(err);
    }
  },

  // ── GET /v1/api/sale/details ───────────────────────────────────────────
  // Query: PaginationParamsSales { page, limit, dateInicio, dateFin }
  // Returns: parent-only SalesResponseDTO[] (no child rows)
  async getSaleDetailsRange(
    params: PaginationParamsSales,
  ): Promise<{ items: SalesResponseDTO[]; total: number }> {
    try {
      const res = await AxioscCient.get<ApiResponse<SalesResponseDTO[]>>(
        `${BASE}/details`,
        { params },
      );
      return { items: res.data.data ?? [], total: res.data.total ?? 0 };
    } catch (err) {
      apiErr(err);
    }
  },

  // ── GET /v1/api/sale/sum/{date} ────────────────────────────────────────
  // Path: date (YYYY-MM-DD)
  // Returns: f32 total for that single day
  async getSumByDate(date: string): Promise<number> {
    try {
      const res = await AxioscCient.get<ApiResponse<number>>(
        `${BASE}/sum/${date}`,
      );
      return res.data.data ?? 0;
    } catch (err) {
      apiErr(err);
    }
  },

  // ── GET /v1/api/sale/sum ───────────────────────────────────────────────
  // Query: PaginationParamsSales { dateInicio, dateFin }
  // Returns: f32 total between date range
  async getSumByRange(params: PaginationParamsSales): Promise<number> {
    try {
      const res = await AxioscCient.get<ApiResponse<number>>(`${BASE}/sum`, {
        params,
      });
      return res.data.data ?? 0;
    } catch (err) {
      apiErr(err);
    }
  },

  // ── GET /v1/api/sale/sum/user/{username} ──────────────────────────────
  // Path: username
  // Returns: f32 total for all sales by that user
  async getSumByUser(username: string): Promise<number> {
    try {
      const res = await AxioscCient.get<ApiResponse<number>>(
        `${BASE}/sum/user/${username}`,
      );
      return res.data.data ?? 0;
    } catch (err) {
      apiErr(err);
    }
  },

  // ── GET /v1/api/sale/sum/user ──────────────────────────────────────────
  // Query: PaginationParamsSales { dateInicio, dateFin, username }
  // Returns: f32 total for user between date range (excludes CANCEL)
  async getSumByUserAndRange(params: PaginationParamsSales): Promise<number> {
    try {
      const res = await AxioscCient.get<ApiResponse<number>>(
        `${BASE}/sum/user`,
        { params },
      );
      return res.data.data ?? 0;
    } catch (err) {
      apiErr(err);
    }
  },
};

export default saleService;

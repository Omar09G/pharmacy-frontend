// ── camelCase matches backend serde(rename_all = "camelCase") ──

export type SalesRequestDTO = {
  id: number;
  /** YYYY-MM-DD */
  dateSale: string | null;
  discount: number;
  idSaleDetl: number;
  iva: number;
  msg: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  status: string | null;
  subTotal: number;
  /** HH:MM:SS */
  timeSale: string | null;
  total: number;
  username: string | null;
  details: SalesDetailRequestDTO[];
};

export type SalesDetailRequestDTO = {
  id: number;
  dateSale: string | null;
  productCodeBar: string | null;
  productCount: number | null;
  productId: number;
  productPrice: number;
  timeSale: string | null;
  idSale: number;
};

/** Full response — parent + children */
export type SalesResponse = {
  id: number;
  dateSale: string | null;
  discount: number;
  idSaleDetl: number;
  iva: number;
  msg: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  status: string | null;
  subTotal: number;
  timeSale: string | null;
  total: number;
  username: string | null;
  details: SalesDetailResponseDTO[];
};

/** Parent-only list response (no child rows) — /sale/details */
export type SalesResponseDTO = {
  id: number;
  dateSale: string | null;
  discount: number;
  idSaleDetl: number;
  iva: number;
  msg: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  status: string | null;
  subTotal: number;
  timeSale: string | null;
  total: number;
  username: string | null;
};

export type SalesDetailResponseDTO = {
  id: number;
  dateSale: string | null;
  productCodeBar: string | null;
  productCount: number | null;
  productId: number;
  productPrice: number;
  timeSale: string | null;
  idSale: number;
};

/** Query params — camelCase per backend serde */
export type PaginationParamsSales = {
  page: number;
  limit: number;
  total: number;
  /** YYYY-MM-DD */
  dateInicio: string | null;
  /** YYYY-MM-DD */
  dateFin: string | null;
  username: string | null;
};

export type SalesResponseIdDTO = {
  id: number;
};

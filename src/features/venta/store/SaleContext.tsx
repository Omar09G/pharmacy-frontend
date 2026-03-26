import React, { createContext, useState } from 'react';
import {
  PaginationParamsSales,
  SalesRequestDTO,
  SalesResponse,
  SalesResponseIdDTO,
} from '../ventaDto/ventaDto';
import saleService from '../services/saleService';

type LastQuery =
  | { type: 'date'; params: PaginationParamsSales }
  | { type: 'user'; params: PaginationParamsSales }
  | { type: 'search'; params: PaginationParamsSales };

type SaleContextType = {
  sales: SalesResponse[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  selected: SalesResponse | null;
  /** Fetch sales filtered by dateInicio using PaginationParamsSales */
  fetchSalesByDate: (params: PaginationParamsSales) => Promise<void>;
  /** Fetch sales filtered by username using PaginationParamsSales */
  fetchSalesByUser: (params: PaginationParamsSales) => Promise<void>;
  /** Search sales between dateInicio/dateFin */
  searchSales: (params: PaginationParamsSales) => Promise<void>;
  createSale: (payload: SalesRequestDTO) => Promise<SalesResponseIdDTO | void>;
  cancelSale: (id: number) => Promise<void>;
  deleteSale: (id: number) => Promise<void>;
  selectSale: (s: SalesResponse | null) => void;
  /** Re-calls the last search service with a new page number */
  goToPage: (p: number) => Promise<void>;
  setPage: (p: number) => void;
  setLimit: (l: number) => void;
};

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sales, setSales] = useState<SalesResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [selected, setSelected] = useState<SalesResponse | null>(null);
  const [lastQuery, setLastQuery] = useState<LastQuery | null>(null);

  const fetchSalesByDate = async (params: PaginationParamsSales) => {
    setLoading(true);
    setLastQuery({ type: 'date', params });
    setPage(params.page ?? 1);
    try {
      const res = await saleService.getSalesByDate(params);
      setSales(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesByUser = async (params: PaginationParamsSales) => {
    setLoading(true);
    setLastQuery({ type: 'user', params });
    setPage(params.page ?? 1);
    try {
      const res = await saleService.getSalesByUsername(params);
      setSales(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  const searchSales = async (params: PaginationParamsSales) => {
    setLoading(true);
    setLastQuery({ type: 'search', params });
    setPage(params.page ?? 1);
    try {
      const res = await saleService.searchSales(params);
      setSales(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = async (p: number) => {
    if (!lastQuery) return;
    const newParams: PaginationParamsSales = { ...lastQuery.params, page: p };
    setPage(p);
    setLoading(true);
    try {
      let res;
      if (lastQuery.type === 'date') {
        res = await saleService.getSalesByDate(newParams);
      } else if (lastQuery.type === 'user') {
        res = await saleService.getSalesByUsername(newParams);
      } else {
        res = await saleService.searchSales(newParams);
      }
      setSales(res.items);
      setTotal(res.total);
      setLastQuery({ ...lastQuery, params: newParams });
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (payload: SalesRequestDTO) => {
    setLoading(true);
    try {
      return await saleService.createSale(payload);
    } finally {
      setLoading(false);
    }
  };

  const cancelSale = async (id: number) => {
    setLoading(true);
    try {
      await saleService.cancelSale(id);
      setSales((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'CANCEL' } : s)),
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteSale = async (id: number) => {
    setLoading(true);
    try {
      await saleService.deleteSale(id);
      setSales((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const selectSale = (s: SalesResponse | null) => setSelected(s);

  return (
    <SaleContext.Provider
      value={{
        sales,
        loading,
        total,
        page,
        limit,
        selected,
        fetchSalesByDate,
        fetchSalesByUser,
        searchSales,
        createSale,
        cancelSale,
        deleteSale,
        selectSale,
        goToPage,
        setPage,
        setLimit,
      }}
    >
      {children}
    </SaleContext.Provider>
  );
};

export default SaleContext;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { dashboardApi } from '../../services/dashboardApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, ShoppingCart, Users, AlertTriangle } from 'lucide-react';
import { formatLocalDate } from '../../utils/dateUtils';

const n = (v: number | null | undefined) => v ?? 0;

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: dailySalesRes } = useQuery({
    queryKey: ['dashboard-daily'],
    queryFn: () => dashboardApi.getSalesDailySummary(),
  });
  const { data: bestSellersRes } = useQuery({
    queryKey: ['dashboard-bestSellers'],
    queryFn: () => dashboardApi.getBestSellers30d(),
  });
  const { data: overdueInvoicesRes } = useQuery({
    queryKey: ['dashboard-overdue'],
    queryFn: () => dashboardApi.getCustomerInvoiceAging(),
  });
  const { data: lowStockRes } = useQuery({
    queryKey: ['dashboard-lowStock'],
    queryFn: () => dashboardApi.getInventoryStock(),
  });
  const { data: cashCutRes } = useQuery({
    queryKey: ['dashboard-cashCut'],
    queryFn: () => dashboardApi.getDailyCashCut(),
  });
  const { data: cashBalanceRes } = useQuery({
    queryKey: ['dashboard-cashBalance'],
    queryFn: () => dashboardApi.getCashJournalBalance(),
  });

  const dailySales = dailySalesRes?.data;
  const bestSellers = bestSellersRes?.data;
  const overdueInvoices = overdueInvoicesRes?.data;
  const lowStock = lowStockRes?.data;
  const cashCuts = cashCutRes?.data;
  const cashBalances = cashBalanceRes?.data;

  const todaySales = dailySales?.[0] ?? null;
  const totalSales = todaySales?.total ?? 0;
  const todayCashCut = cashCuts?.[0] ?? null;
  const firstCashBalance = cashBalances?.[0] ?? null;
  const kpis = [
    {
      label: t('dashboard.todaySales'),
      value: n(todaySales?.salesCount),
      icon: <ShoppingCart size={20} />,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: t('dashboard.todayRevenue'),
      value: `$${n(Number(totalSales)).toFixed(2)}`,
      icon: <DollarSign size={20} />,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    },
    {
      label: t('dashboard.totalCustomers'),
      value: 156,
      icon: <Users size={20} />,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: t('dashboard.lowStock'),
      value: lowStock?.length ?? 0,
      icon: <AlertTriangle size={20} />,
      color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    },
  ];

  const chartData =
    dailySales?.map((d) => ({
      day: d.day.slice(5, 10),
      total: Math.round(n(d.total)),
      count: n(d.salesCount),
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t('dashboard.title')}
        </h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {kpi.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily sales chart */}
        <Card title={t('dashboard.dailySales')}>
          <div className="h-64 w-full">
            <ResponsiveContainer
              width="100%"
              height={256}
              minWidth={0}
              minHeight={0}
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb',
                  }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top products */}
        <Card title={t('dashboard.topProducts')}>
          <div className="h-64 w-full">
            <ResponsiveContainer
              width="100%"
              height={256}
              minWidth={0}
              minHeight={0}
            >
              <BarChart data={bestSellers?.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="productName"
                  width={120}
                  stroke="#9ca3af"
                  fontSize={11}
                  tickFormatter={(v: string | null) => v ?? ''}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb',
                  }}
                />
                <Bar dataKey="qtySold" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue invoices */}
        <Card title={t('dashboard.overdueInvoices')}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                  <th className="text-left py-2">{t('customers.fullName')}</th>
                  <th className="text-right py-2">{t('common.amount')}</th>
                  <th className="text-center py-2">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {overdueInvoices?.map((inv) => (
                  <tr
                    key={inv.invoiceId}
                    className="border-b border-neutral-100 dark:border-neutral-700/50"
                  >
                    <td className="py-2 text-neutral-900 dark:text-neutral-100">
                      {inv.customerName}
                    </td>
                    <td className="py-2 text-right font-medium">
                      ${n(Number(inv.outstanding)).toFixed(2)}
                    </td>
                    <td className="py-2 text-center">
                      <Badge
                        color={
                          (
                            {
                              overdue: 'red' as const,
                              open: 'yellow' as const,
                            } as Record<string, 'red' | 'yellow' | 'green'>
                          )[inv.invoiceStatus ?? ''] ?? 'green'
                        }
                      >
                        {inv.invoiceStatus}{' '}
                        {n(Number(inv.daysOverdue)) > 0
                          ? `(${n(Number(inv.daysOverdue))}d)`
                          : ''}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low stock */}
        <Card title={t('dashboard.lowStockItems')}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                  <th className="text-left py-2">
                    {t('products.productName')}
                  </th>
                  <th className="text-center py-2">{t('common.quantity')}</th>
                  <th className="text-center py-2">
                    {t('products.expirationDate')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStock?.map((s) => (
                  <tr
                    key={s.productId}
                    className="border-b border-neutral-100 dark:border-neutral-700/50"
                  >
                    <td className="py-2 text-neutral-900 dark:text-neutral-100">
                      {s.productName}
                    </td>
                    <td className="py-2 text-center">
                      <Badge color={n(s.qtyOnHand) <= 3 ? 'red' : 'yellow'}>
                        {n(s.qtyOnHand)}
                      </Badge>
                    </td>
                    <td className="py-2 text-center text-neutral-500">
                      {s.maxExpiryDate ? formatLocalDate(s.maxExpiryDate) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Cash cut */}
      <Card title={t('dashboard.cashCut')}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <p className="text-sm text-neutral-500">
              {t('dashboard.cashCut')} Efectivo
            </p>
            <p className="text-xl font-bold text-neutral-900 dark:text-white">
              ${n(Number(todayCashCut?.salesCash)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">No Efectivo</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-white">
              ${n(Number(todayCashCut?.salesNonCash)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Entradas</p>
            <p className="text-xl font-bold text-green-600">
              ${n(Number(todayCashCut?.cashEntriesIn)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Salidas</p>
            <p className="text-xl font-bold text-red-600">
              ${n(Number(todayCashCut?.cashEntriesOut)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Balance</p>
            <p className="text-xl font-bold text-blue-600">
              ${n(Number(firstCashBalance?.balance)).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;

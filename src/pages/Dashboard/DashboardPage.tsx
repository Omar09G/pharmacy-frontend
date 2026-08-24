import React from 'react';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { dashboardApi } from '../../services/dashboardApi';
import { customerApi } from '../../services/customerApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { useThemeColors } from '../../hooks/useThemeColors';
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
import { formatLocalDate, getCurrentDate } from '../../utils/dateUtils';

const n = (v: number | null | undefined) => v ?? 0;

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const chart = useThemeColors();

  // Preload data in parallel
  const [
    { data: dailySalesRes },
    { data: bestSellersRes },
    { data: overdueInvoicesRes },
    { data: lowStockRes },
    { data: cashCutRes },
    { data: cashBalanceRes },
    { data: customersRes },
  ] = useQueries({
    queries: [
      {
        queryKey: ['dashboard-daily'],
        queryFn: () => dashboardApi.getSalesDailySummary(),
      },
      {
        queryKey: ['dashboard-bestSellers'],
        queryFn: () => dashboardApi.getBestSellers30d(),
      },
      {
        queryKey: ['dashboard-overdue'],
        queryFn: () => dashboardApi.getCustomerInvoiceAging(),
      },
      {
        queryKey: ['dashboard-lowStock'],
        queryFn: () => dashboardApi.getInventoryStock(),
      },
      {
        queryKey: ['dashboard-cashCut'],
        queryFn: () => dashboardApi.getDailyCashCut(),
      },
      {
        queryKey: ['dashboard-cashBalance'],
        queryFn: () => dashboardApi.getCashJournalBalance(),
      },
      {
        queryKey: ['dashboard-customers'],
        queryFn: () => customerApi.getAll(1, 1),
      },
    ],
  });

  const dailySales = dailySalesRes?.data;
  const bestSellers = bestSellersRes?.data;
  const overdueInvoices = overdueInvoicesRes?.data;
  const lowStock = lowStockRes?.data;
  const cashCuts = cashCutRes?.data;
  const cashBalances = cashBalanceRes?.data;

  // The summary now covers the last 7 days; KPIs must use today's row.
  const todayKey = getCurrentDate();
  const isToday = (day: string | undefined) => day?.slice(0, 10) === todayKey;

  const todaySales = dailySales?.find((d) => isToday(d.day)) ?? null;
  const totalSales = todaySales?.total ?? 0;
  const weekTotal =
    dailySales?.reduce((acc, d) => acc + Number(d.total ?? 0), 0) ?? 0;
  const todayCashCut = cashCuts?.find((c) => isToday(c.day)) ?? null;
  const firstCashBalance = cashBalances?.[0] ?? null;
  const kpis = [
    {
      label: t('dashboard.todaySales'),
      value: n(todaySales?.salesCount),
      icon: <ShoppingCart size={20} />,
      tone: 'brand' as const,
    },
    {
      label: t('dashboard.todayRevenue'),
      value: `$${n(Number(totalSales)).toFixed(2)}`,
      icon: <DollarSign size={20} />,
      tone: 'success' as const,
    },
    {
      label: t('dashboard.totalCustomers'),
      value: customersRes?.total ?? 0,
      icon: <Users size={20} />,
      tone: 'brand' as const,
    },
    {
      label: t('dashboard.lowStock'),
      value: lowStock?.length ?? 0,
      icon: <AlertTriangle size={20} />,
      tone: 'danger' as const,
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
      <PageHeader title={t('dashboard.title')} />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            tone={kpi.tone}
            delayIndex={i}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily sales chart (last 7 days) */}
        <Card
          title={t('dashboard.dailySales')}
          actions={
            <span className="text-xs font-medium tabular-nums text-muted">
              7d · ${weekTotal.toFixed(2)}
            </span>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer
              width="100%"
              height={256}
              minWidth={0}
              minHeight={0}
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis
                  dataKey="day"
                  stroke={chart.tick}
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis stroke={chart.tick} fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={chart.tooltipStyle}
                  cursor={{ fill: chart.grid, opacity: 0.4 }}
                />
                <Bar
                  dataKey="total"
                  fill={chart.brand}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
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
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis
                  type="number"
                  stroke={chart.tick}
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="productName"
                  width={120}
                  stroke={chart.tick}
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v: string | null) => v ?? ''}
                />
                <Tooltip
                  contentStyle={chart.tooltipStyle}
                  cursor={{ fill: chart.grid, opacity: 0.4 }}
                />
                <Bar
                  dataKey="qtySold"
                  fill={chart.success}
                  radius={[0, 6, 6, 0]}
                  maxBarSize={24}
                />
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
                <tr className="border-b border-line text-muted">
                  <th scope="col" className="text-left py-2 font-medium">
                    {t('customers.fullName')}
                  </th>
                  <th scope="col" className="text-right py-2 font-medium">
                    {t('common.amount')}
                  </th>
                  <th scope="col" className="text-center py-2 font-medium">
                    {t('common.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {overdueInvoices?.map((inv) => (
                  <tr key={inv.invoiceId} className="border-b border-line/60">
                    <td className="py-2 text-ink">{inv.customerName}</td>
                    <td className="py-2 text-right font-mono tabular-nums font-medium">
                      ${n(Number(inv.outstanding)).toFixed(2)}
                    </td>
                    <td className="py-2 text-center">
                      <Badge
                        tone={
                          (
                            {
                              overdue: 'danger' as const,
                              open: 'warning' as const,
                            } as Record<
                              string,
                              'danger' | 'warning' | 'success'
                            >
                          )[inv.invoiceStatus ?? ''] ?? 'success'
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
                <tr className="border-b border-line text-muted">
                  <th scope="col" className="text-left py-2 font-medium">
                    {t('products.productName')}
                  </th>
                  <th scope="col" className="text-center py-2 font-medium">
                    {t('common.quantity')}
                  </th>
                  <th scope="col" className="text-center py-2 font-medium">
                    {t('products.expirationDate')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStock?.map((s) => (
                  <tr key={s.productId} className="border-b border-line/60">
                    <td className="py-2 text-ink">{s.productName}</td>
                    <td className="py-2 text-center">
                      <Badge tone={n(s.qtyOnHand) <= 3 ? 'danger' : 'warning'}>
                        {n(s.qtyOnHand)}
                      </Badge>
                    </td>
                    <td className="py-2 text-center text-muted font-mono tabular-nums">
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
          <div>
            <p className="text-sm text-muted">{t('dashboard.cashCut')}</p>
            <p className="text-xl font-semibold font-mono tabular-nums text-ink">
              ${n(Number(todayCashCut?.salesCash ?? 0)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">No Efectivo</p>
            <p className="text-xl font-semibold font-mono tabular-nums text-ink">
              ${n(Number(todayCashCut?.salesNonCash ?? 0)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Entradas</p>
            <p className="text-xl font-semibold font-mono tabular-nums text-success">
              ${n(Number(todayCashCut?.cashEntriesIn ?? 0)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Salidas</p>
            <p className="text-xl font-semibold font-mono tabular-nums text-danger">
              ${n(Number(todayCashCut?.cashEntriesOut ?? 0)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Neto hoy</p>
            <p className="text-xl font-semibold font-mono tabular-nums text-brand">
              ${n(Number(todayCashCut?.netCash ?? 0)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Balance</p>
            <p className="text-xl font-semibold font-mono tabular-nums text-brand">
              ${n(Number(firstCashBalance?.balance ?? 0)).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;

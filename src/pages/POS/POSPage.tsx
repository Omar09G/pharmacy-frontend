import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productApi } from '../../services/productApi';
import { customerApi } from '../../services/customerApi';
import { paymentMethodApi } from '../../services/paymentMethodApi';
import { discountApi } from '../../services/discountApi';
import { saleApi } from '../../services/saleApi';
import { usePOSStore, type CartItem } from '../../store/posStore';
import { useAuthStore } from '../../store/authStore';
import { nowUTC } from '../../utils/dateUtils';
import { showSuccess, showError, confirmSale } from '../../utils/alerts';
import type { Product } from '../../models/product.model';
import type { Customer } from '../../models/customer.model';
import type { PaymentMethod } from '../../models/payment-method.model';
import type { Discount } from '../../models/discount.model';
import type { AddSaleRequest } from '../../models/sale.model';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import {
  ShoppingCart,
  Search,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  DollarSign,
} from 'lucide-react';

const POSPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const {
    cart,
    customerId,
    paymentMethodId,
    discountId,
    notes,
    addItem,
    removeItem,
    updateQuantity,
    setCustomerId,
    setPaymentMethodId,
    setDiscountId,
    setNotes,
    clearCart,
    getTotal,
    getSubtotal,
    getTotalDiscount,
  } = usePOSStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Preload data
  const { data: productsData } = useQuery({
    queryKey: ['pos-products'],
    queryFn: () => productApi.getAll(0, 100),
  });
  const { data: customersData } = useQuery({
    queryKey: ['pos-customers'],
    queryFn: () => customerApi.getAll(0, 100),
  });
  const { data: payMethodsData } = useQuery({
    queryKey: ['pos-paymentMethods'],
    queryFn: () => paymentMethodApi.getAll(0, 50),
  });
  const { data: discountsData } = useQuery({
    queryKey: ['pos-discounts'],
    queryFn: () => discountApi.getAll(0, 50, 0, true),
  });

  const products: Product[] = Array.isArray(productsData?.data)
    ? productsData.data
    : [];
  const customers: Customer[] = Array.isArray(customersData?.data)
    ? customersData.data
    : [];
  const payMethods: PaymentMethod[] = Array.isArray(payMethodsData?.data)
    ? payMethodsData.data
    : [];
  const discounts: Discount[] = Array.isArray(discountsData?.data)
    ? discountsData.data
    : [];

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filteredProducts =
    searchTerm.length > 0
      ? products.filter((p) => {
          const q = searchTerm.toLowerCase();
          const name = String(p.productName ?? '').toLowerCase();
          const barcode = String(p.barcode ?? '').toLowerCase();
          return name.includes(q) || barcode.includes(q);
        })
      : [];

  const handleAddProduct = (p: Product) => {
    const item: Omit<CartItem, 'subtotal'> = {
      productId: p.id,
      name: p.productName,
      barcode: p.barcode,
      qty: 1,
      unitPrice: p.purchasePrice ?? 0,
      discountAmount: 0,
    };
    addItem(item);
    setSearchTerm('');
    searchRef.current?.focus();
  };

  const saleMut = useMutation({
    mutationFn: (payload: AddSaleRequest) => saleApi.create(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      const folio =
        res?.data && typeof res.data === 'object' && 'id' in res.data
          ? (res.data as { id: number }).id
          : '';
      showSuccess(`${t('pos.saleSuccess')} ${t('pos.folio')}: ${folio}`);
      clearCart();
      setShowConfirm(false);
    },
    onError: () => showError(t('common.error')),
  });

  const handleCharge = async () => {
    if (cart.length === 0) {
      showError(t('pos.emptyCart'));
      return;
    }
    const total = getTotal();
    const res = await confirmSale(total);
    if (res.isConfirmed) setShowConfirm(true);
  };

  const handleConfirmSale = () => {
    const payload: AddSaleRequest = {
      id: 0,
      customerId: customerId ?? 1,
      userId: user?.id ?? 1,
      discountId: discountId,
      date: nowUTC(),
      notes,
      items: cart.map((c) => ({
        id: 0,
        productId: c.productId,
        qty: c.qty,
        unitPrice: c.unitPrice,
        discountAmount: c.discountAmount,
        lineTotal: c.subtotal,
      })),
      paymentMethodId: paymentMethodId ?? 1,
      total: getTotal(),
      taxTotal: 0,
      reference: 'EFECTIVO',
      status: 'completed',
      subtotal: getSubtotal(),
      discountTotal: getTotalDiscount(),
      isCredit: false,
      createdAt: nowUTC(),
    };
    saleMut.mutate(payload);
  };

  const subtotal = getSubtotal();
  const totalDiscount = getTotalDiscount();
  const total = getTotal();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
        <ShoppingCart size={24} /> {t('pos.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Product search + results */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('pos.scanBarcode')}
                className="w-full pl-10 pr-4 py-3 text-lg rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            {filteredProducts.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg divide-y divide-neutral-100 dark:divide-neutral-700">
                {filteredProducts.slice(0, 10).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleAddProduct(p)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left transition-colors"
                  >
                    <div>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {p.productName}
                      </span>
                      <span className="ml-2 text-xs text-neutral-500">
                        {p.barcode}
                      </span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      ${Number(p.purchasePrice ?? 0).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Cart table */}
          <Card title={t('pos.cart')}>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <ShoppingCart size={40} className="mx-auto mb-2" />
                <p>{t('pos.emptyCart')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                      <th className="text-left py-2 px-3">
                        {t('products.productName')}
                      </th>
                      <th className="text-center py-2 px-3">
                        {t('pos.unitPrice')}
                      </th>
                      <th className="text-center py-2 px-3">
                        {t('common.quantity')}
                      </th>
                      <th className="text-center py-2 px-3">
                        {t('pos.discountAmount')}
                      </th>
                      <th className="text-right py-2 px-3">
                        {t('pos.subtotal')}
                      </th>
                      <th className="py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr
                        key={item.productId}
                        className="border-b border-neutral-100 dark:border-neutral-700/50"
                      >
                        <td className="py-2 px-3 text-neutral-900 dark:text-neutral-100">
                          {item.name}
                          <span className="ml-2 text-xs text-neutral-400">
                            {item.barcode}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          ${Number(item.unitPrice ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.qty - 1)
                              }
                              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.qty}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.qty + 1)
                              }
                              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          ${Number(item.discountAmount ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          ${Number(item.subtotal ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Summary panel */}
        <div className="space-y-4">
          <Card>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t('pos.customer')}
                </label>
                <select
                  value={customerId ?? ''}
                  onChange={(e) =>
                    setCustomerId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100"
                >
                  <option value="">{t('pos.selectCustomer')}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t('pos.paymentMethod')}
                </label>
                <select
                  value={paymentMethodId ?? ''}
                  onChange={(e) =>
                    setPaymentMethodId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100"
                >
                  <option value="">{t('pos.selectPayment')}</option>
                  {payMethods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t('pos.discount')}
                </label>
                <select
                  value={discountId ?? ''}
                  onChange={(e) =>
                    setDiscountId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100"
                >
                  <option value="">—</option>
                  {discounts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.value} ({d.percentage}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t('pos.notes')}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 resize-none"
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>{t('pos.subtotal')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>{t('pos.discount')}</span>
                <span className="text-red-500">
                  -${totalDiscount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-white border-t border-neutral-200 dark:border-neutral-700 pt-2">
                <span>{t('pos.totalToPay')}</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={handleCharge}
              className="w-full mt-4"
              size="lg"
              disabled={cart.length === 0}
            >
              <CreditCard size={20} /> {t('pos.charge')} ${total.toFixed(2)}
            </Button>
            <Button
              variant="ghost"
              onClick={clearCart}
              className="w-full mt-2"
              size="sm"
            >
              {t('common.clear')}
            </Button>
          </Card>
        </div>
      </div>

      {/* Confirm sale modal */}
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={t('pos.confirmSale')}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmSale} loading={saleMut.isPending}>
              <DollarSign size={16} /> {t('common.confirm')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            {t('sales.items')}
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                <th className="text-left py-1">{t('products.productName')}</th>
                <th className="text-center py-1">{t('common.quantity')}</th>
                <th className="text-right py-1">{t('pos.unitPrice')}</th>
                <th className="text-right py-1">{t('pos.subtotal')}</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((c) => (
                <tr
                  key={c.productId}
                  className="border-b border-neutral-100 dark:border-neutral-700/50"
                >
                  <td className="py-1 text-neutral-900 dark:text-neutral-100">
                    {c.name}
                  </td>
                  <td className="py-1 text-center">{c.qty}</td>
                  <td className="py-1 text-right">
                    ${Number(c.unitPrice ?? 0).toFixed(2)}
                  </td>
                  <td className="py-1 text-right font-medium">
                    ${Number(c.subtotal ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 space-y-1">
            <div className="flex justify-between">
              <span>{t('pos.subtotal')}</span>
              <span>${Number(subtotal ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>{t('pos.discount')}</span>
              <span>-${Number(totalDiscount ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-green-600">
              <span>{t('pos.totalToPay')}</span>
              <span>${Number(total ?? 0).toFixed(2)}</span>
            </div>
          </div>
          {customerId && (
            <p className="text-sm text-neutral-500">
              <Badge color="blue">{t('pos.customer')}</Badge>{' '}
              {customers.find((c) => c.id === customerId)?.name}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default POSPage;

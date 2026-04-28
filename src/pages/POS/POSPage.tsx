import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productApi } from '../../services/productApi';
import { customerApi } from '../../services/customerApi';
import { paymentMethodApi } from '../../services/paymentMethodApi';
import { discountApi } from '../../services/discountApi';
import { saleApi } from '../../services/saleApi';
import {
  CartItemInput,
  usePOSStore,
  type CartItem,
} from '../../store/posStore';
import { useAuthStore } from '../../store/authStore';
import { nowUTC } from '../../utils/dateUtils';
import { showSuccess, showError, showApiError } from '../../utils/alerts';
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
  TicketIcon,
} from 'lucide-react';
import Input from '../../components/ui/Input';
import { useReactToPrint } from 'react-to-print';
import ReceiptPrint from '../../components/ReceiptPrint';

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
    //Agregar setPayAmountAt al store y aqui para manejar el monto que se paga en efectivo o con tarjeta, para mostrar el cambio al cliente
    setPayAmountAt,
    getPayAmountAt,
  } = usePOSStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement | null>(null);
  const [printAfterSuccess, setPrintAfterSuccess] = useState(false);
  const [printData, setPrintData] = useState<{
    items: Partial<CartItem>[];
    subtotal: number;
    total: number;
    totalDiscount: number;
    customerName?: string;
    notes?: string;
    paymentMethod?: string;
    reference?: string;
    createdAt?: string;
  } | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    onAfterPrint: () => setPrintData(null),
  });

  // Preload data in parallel
  const [
    { data: productsData },
    { data: customersData },
    { data: payMethodsData },
    { data: discountsData },
  ] = useQueries({
    queries: [
      { queryKey: ['pos-products'], queryFn: () => productApi.getAll(1, 1000) },
      {
        queryKey: ['pos-customers'],
        queryFn: () => customerApi.getAll(1, 100),
      },
      {
        queryKey: ['pos-paymentMethods'],
        queryFn: () => paymentMethodApi.getAll(1, 50),
      },
      {
        queryKey: ['pos-discounts'],
        queryFn: () => discountApi.getAll(1, 50, 0, true),
      },
    ],
  });

  const products: Product[] = useMemo(
    () => (Array.isArray(productsData?.data) ? productsData.data : []),
    [productsData?.data],
  );
  const customers: Customer[] = useMemo(
    () => (Array.isArray(customersData?.data) ? customersData.data : []),
    [customersData?.data],
  );
  const payMethods: PaymentMethod[] = useMemo(
    () => (Array.isArray(payMethodsData?.data) ? payMethodsData.data : []),
    [payMethodsData?.data],
  );
  const discounts: Discount[] = useMemo(
    () => (Array.isArray(discountsData?.data) ? discountsData.data : []),
    [discountsData?.data],
  );

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (customerId === null && customers.length > 0) {
      const defaultCustomer = customers.find(
        (c) => c.name === 'Publico en General',
      );
      if (defaultCustomer) {
        setCustomerId(defaultCustomer.id);
      } else {
        setCustomerId(customers[0].id);
      }
    }

    if (paymentMethodId === null && payMethods.length > 0) {
      const defaultMethod = payMethods.find((m) => m.name === 'Efectivo');
      if (defaultMethod) {
        setPaymentMethodId(defaultMethod.id);
      } else {
        setPaymentMethodId(payMethods[0].id);
      }
    }

    if (discountId === null && discounts.length > 0) {
      const defaultDiscount = discounts.find((d) => Number(d.value) === 0);
      if (defaultDiscount) {
        setDiscountId(defaultDiscount.id);
        return;
      }
      setDiscountId(discounts[0].id);
    }
  }, [
    customerId,
    customers,
    paymentMethodId,
    payMethods,
    discountId,
    discounts,
    setCustomerId,
    setPaymentMethodId,
    setDiscountId,
  ]);

  //Inicializar los SET de Customer, PaymentMethod y Discount con el primer valor de cada uno para evitar errores al crear la venta, ya que el backend espera un valor numerico y no null

  const filteredProducts =
    searchTerm.length > 0
      ? products.filter((p) => {
          const q = searchTerm.toLowerCase();
          const name = String(p.name ?? '').toLowerCase();
          const barcode = String(p.barcodesDetail?.barcode ?? '').toLowerCase();
          return name.includes(q) || barcode.includes(q);
        })
      : [];

  const handleAddProduct = (p: Product) => {
    //Validar el nuero de Stock que tiene producto y que estan en Carrito, para no agregar mas de lo que hay en stock
    const inCart = cart.find((c) => c.productId === p.id);
    const stock = p.lotsDetail?.qtyOnHand ?? 0;
    if (inCart && stock < inCart.qty + 1) {
      showError(t('products.minStock'));
      return;
    }
    if (!inCart && stock < 1) {
      showError(t('products.minStock'));
      return;
    }

    const item: CartItemInput = {
      productId: p.id,
      name: p.name,
      barcode: p.barcodesDetail?.barcode ?? '',
      qty: 1,
      qtyOnHand: p.lotsDetail?.qtyOnHand ?? 0,
      unitPrice: p.salePrice ?? 0,
      discount:
        ((p.salePrice ?? 0) *
          (discounts.find((d) => d.id === discountId)?.value ?? 0)) /
        100,
      lotId: p.lotsDetail?.id,
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
      setShowConfirm(false);

      if (printAfterSuccess) {
        // give React a moment to render the hidden receipt
        setTimeout(() => {
          try {
            handlePrint();
          } catch (err) {
            showError(err as string);
          }
          setPrintAfterSuccess(false);
        }, 200);
      }
      //Actualiza totales de QTY de Productos en el store para que al agregar un producto al carrito, se actualice el stock disponible de lo que esta en Cart, sin necesidad de recargar la pagina
      qc.setQueryData(['pos-products'], (old: typeof productsData) => {
        if (!old?.data || !Array.isArray(old.data)) return old;
        return {
          ...old,
          data: old.data.map((p: Product) => {
            const soldItem = cart.find((i) => i.productId === p.id);
            if (!soldItem) return p;
            return {
              ...p,
              lotsDetail: {
                ...p.lotsDetail,
                qtyOnHand: (p.lotsDetail?.qtyOnHand ?? 0) - soldItem.qty,
              },
            };
          }),
        };
      });

      clearCart();
    },
    onError: (err) => showApiError(err),
  });

  const handleCharge = async () => {
    if (cart.length === 0) {
      showError(t('pos.emptyCart'));
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSale = async () => {
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
        qtyOnHand: c.qtyOnHand,
        unitPrice: c.unitPrice,
        discount: c.discount,
        lineTotal: c.subtotal,
        saleId: 0,
        taxAmount: 0,
        lotId: c.lotId,
      })),
      paymentMethodId: paymentMethodId ?? 1,
      total: getTotal(),
      taxTotal: 0,
      reference: methodName ?? 'EFECTIVO',
      status: 'completed',
      subtotal: getSubtotal(),
      discountTotal: getTotalDiscount(),
      isCredit: false,
      createdAt: nowUTC(),
      paymentAmountAt: getPayAmountAt(),
    };

    saleMut.mutate(payload);
  };

  const handleConfirmAndPrintSale = async () => {
    setPrintData({
      items: cart.map((c) => ({
        name: c.name,
        qty: c.qty,
        unitPrice: c.unitPrice,
        subtotal: c.subtotal,
      })),
      subtotal,
      total,
      totalDiscount,
      customerName: customers.find((c) => c.id === customerId)?.name,
      notes,
      paymentMethod: methodName ?? '',
      reference: methodName ?? 'EFECTIVO',
      createdAt: new Date().toLocaleString(),
    });
    setPrintAfterSuccess(true);
    await handleConfirmSale();
  };

  const subtotal = getSubtotal();
  const totalDiscount = getTotalDiscount();
  const total = getTotal();

  const methodName = useMemo(
    () => payMethods.find((m) => m.id === paymentMethodId)?.name ?? null,
    [payMethods, paymentMethodId],
  );

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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredProducts.length > 0) {
                    handleAddProduct(filteredProducts[0]);
                  }
                }}
                placeholder={t('pos.scanBarcode')}
                className="w-full pl-10 pr-4 py-3 text-lg rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            {filteredProducts.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg divide-y divide-neutral-100 dark:divide-neutral-700">
                {filteredProducts.slice(0, 100).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleAddProduct(p)}
                    title={t('tooltips.addProduct')}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left transition-colors"
                  >
                    <div>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {p.name}
                      </span>
                      <span className="ml-2 text-xs text-neutral-500">
                        {p.barcodesDetail?.barcode ?? ''}
                      </span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      ${Number(p.salePrice ?? 0).toFixed(2)}
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
                        {t('products.maxStock')}
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
                              title={t('tooltips.decreaseQuantity')}
                              aria-label="Disminuir cantidad"
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
                              title={t('tooltips.increaseQuantity')}
                              aria-label="Aumentar cantidad"
                              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {Number(item.qtyOnHand ?? 0).toFixed(1)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          ${Number(item.discount ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          ${Number(item.subtotal ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => removeItem(item.productId)}
                            title={t('tooltips.removeItem')}
                            aria-label="Eliminar producto"
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
                  {discounts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {Number(d.value).toFixed(2)}% - {d.name}
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
                  -${Number(totalDiscount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-white border-t border-neutral-200 dark:border-neutral-700 pt-2">
                <span>{t('pos.totalToPay')}</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              title={t('tooltips.charge')}
              onClick={handleCharge}
              className="w-full mt-4"
              size="lg"
              disabled={cart.length === 0}
            >
              <CreditCard size={20} /> {t('pos.charge')} ${total.toFixed(2)}
            </Button>
            <Button
              title={t('tooltips.clearCart')}
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
        onClose={() => {
          setShowConfirm(false);
          setPayAmountAt(0);
        }}
        title={t('pos.confirmSale')}
        size="lg"
        footer={
          <>
            <Button
              title={t('tooltips.cancel')}
              variant="secondary"
              onClick={() => {
                setShowConfirm(false);
                setPayAmountAt(0);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              title={t('tooltips.confirmSale')}
              onClick={handleConfirmSale}
              loading={saleMut.isPending}
              variant="tertiary"
              disabled={methodName === 'Efectivo' && getPayAmountAt() < total}
            >
              <DollarSign size={16} /> {t('common.confirm')}
            </Button>
            <Button
              title={t('tooltips.confirmAndPrint')}
              onClick={handleConfirmAndPrintSale}
              loading={saleMut.isPending}
              disabled={methodName === 'Efectivo' && getPayAmountAt() < total}
            >
              <TicketIcon size={16} /> {t('common.confirmAndPrint')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {customerId && (
            <p className="text-sm text-neutral-500">
              <Badge color="blue">{t('pos.customer')}</Badge>{' '}
              {customers.find((c) => c.id === customerId)?.name}
            </p>
          )}
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
                  <td className="py-1 text-center dark:text-neutral-100">
                    {c.qty}
                  </td>
                  <td className="py-1 text-right dark:text-neutral-100">
                    ${Number(c.unitPrice ?? 0).toFixed(2)}
                  </td>
                  <td className="py-1 text-right font-medium dark:text-neutral-100">
                    ${Number(c.subtotal ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 space-y-1">
            <div className="flex justify-between dark:text-neutral-100">
              <span>{t('pos.subtotal')}</span>
              <span>${Number(subtotal ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>{t('pos.discount')}</span>
              <span>-${Number(totalDiscount ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-end text-xl font-bold text-green-600">
              <span className="justify-end">=</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-green-600">
              <span>{t('pos.totalToPay')}</span>
              <span>${Number(total ?? 0).toFixed(2)}</span>
            </div>

            {methodName === 'Efectivo' && (
              <div>
                <div className="flex justify-between text-xl font-bold text-blue-600">
                  <span>{t('pos.change') + ':'}</span>
                  <span>
                    $
                    {(
                      Number(getPayAmountAt() ?? 0) - Number(total ?? 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {methodName === 'Efectivo' && (
            <div className="flex items-center justify-between text-xl text-gray-600 gap-3 dark:text-gray-300">
              <label className="font-bold">{t('pos.enterAmount')}</label>
              <div className="w-32">
                <Input
                  className="text-right text-xl font-bold dark:text-white"
                  type="number"
                  placeholder={t('pos.enterAmount')}
                  onChange={(e) => setPayAmountAt(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (getPayAmountAt() >= total) {
                        handleConfirmSale();
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>
      {/* Hidden receipt for printing */}
      <div style={{ display: 'none' }}>
        {printData && (
          <ReceiptPrint
            ref={receiptRef}
            storeName="Mi Tienda"
            items={printData.items ?? []}
            subtotal={printData.subtotal}
            total={printData.total}
            totalDiscount={printData.totalDiscount}
            customerName={printData.customerName}
            notes={printData.notes}
            paymentMethod={printData.paymentMethod}
            reference={printData.reference}
            createdAt={printData.createdAt}
          />
        )}
      </div>
    </div>
  );
};

export default POSPage;

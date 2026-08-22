import { create } from 'zustand';

export interface CartItem {
  productId: number;
  name: string;
  barcode: string;
  lotId?: number;
  qty: number;
  qtyOnHand: number;
  unitPrice: number;
  discountPct: number;
  discount: number;
  subtotal: number;
}

export type CartItemInput = Omit<CartItem, 'discount' | 'subtotal'>;

interface POSStore {
  cart: CartItem[];
  customerId: number | null;
  discountId: number | null;
  paymentMethodId: number | null;
  payAmountAt: number;
  notes: string;
  error: string | null;
  setError: (msg: string | null) => void;
  addItem: (item: CartItemInput) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  applyDiscountToCart: (pct: number) => void;
  setCustomerId: (id: number | null) => void;
  setDiscountId: (id: number | null) => void;
  setPaymentMethodId: (id: number | null) => void;
  setNotes: (notes: string) => void;
  setPayAmountAt: (amount: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getTotalDiscount: () => number;
  getPayAmountAt: () => number;
}

function calcDiscount(
  item: Pick<CartItem, 'unitPrice' | 'qty' | 'discountPct'>,
): number {
  return item.unitPrice * item.qty * (item.discountPct / 100);
}

function calcSubtotal(item: Pick<CartItem, 'unitPrice' | 'qty' | 'discount'>) {
  return item.qty * item.unitPrice - item.discount;
}

function recalcItem(item: Omit<CartItem, 'discount' | 'subtotal'>): CartItem {
  const discount = calcDiscount(item);
  return { ...item, discount, subtotal: calcSubtotal({ ...item, discount }) };
}

export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  error: null,
  customerId: null,
  discountId: null,
  paymentMethodId: null,
  notes: '',
  payAmountAt: 0,

  setError: (msg) => set({ error: msg }),

  addItem: (item) => {
    const cart = get().cart;
    const existing = cart.find((c) => c.productId === item.productId);

    if (existing) {
      if (item.qty > existing.qtyOnHand) {
        set({
          error: 'No se pueden agregar más registros al carrito por bajo stock',
        });
        return;
      }
      set({
        cart: cart.map((c) =>
          c.productId === item.productId
            ? recalcItem({
                ...c,
                qty: c.qty + item.qty,
                qtyOnHand: c.qtyOnHand - item.qty,
                //El nuevo producto hereda el % de descuento vigente del carrito
                discountPct: c.discountPct,
              })
            : c,
        ),
        error: null,
      });
    } else {
      if (item.qty > item.qtyOnHand) {
        set({
          error: 'No se pueden agregar más registros al carrito por bajo stock',
        });
        return;
      }
      set({
        cart: [
          ...cart,
          recalcItem({
            ...item,
            qtyOnHand: item.qtyOnHand - item.qty,
          }),
        ],
        error: null,
      });
    }
  },

  removeItem: (productId) =>
    set({
      cart: get().cart.filter((c) => c.productId !== productId),
      error: null,
    }),

  updateQuantity: (productId, qty) => {
    const cart = get().cart;
    const item = cart.find((c) => c.productId === productId);
    if (!item) return;

    if (qty <= 0) {
      set({ cart: cart.filter((c) => c.productId !== productId), error: null });
      return;
    }

    const delta = qty - item.qty;
    if (delta > 0) {
      // Increasing quantity: check available stock
      if (delta > item.qtyOnHand) {
        set({ error: 'No hay suficiente stock para esa cantidad' });
        return;
      }
      set({
        cart: cart.map((c) =>
          c.productId === productId
            ? recalcItem({ ...c, qty, qtyOnHand: c.qtyOnHand - delta })
            : c,
        ),
        error: null,
      });
    } else if (delta < 0) {
      // Decreasing quantity: restore stock
      set({
        cart: cart.map((c) =>
          c.productId === productId
            ? recalcItem({
                ...c,
                qty,
                qtyOnHand: c.qtyOnHand + Math.abs(delta),
              })
            : c,
        ),
        error: null,
      });
    }
  },

  applyDiscountToCart: (pct) =>
    set({
      cart: get().cart.map((c) =>
        recalcItem({ ...c, discountPct: Number(pct) || 0 }),
      ),
      error: null,
    }),

  setCustomerId: (id) => set({ customerId: id }),
  setDiscountId: (id) => set({ discountId: id }),
  setPaymentMethodId: (id) => set({ paymentMethodId: id }),
  setNotes: (notes) => set({ notes }),
  setPayAmountAt: (amount) => set({ payAmountAt: amount }),

  clearCart: () =>
    set({
      cart: [],
      customerId: null,
      discountId: null,
      paymentMethodId: null,
      payAmountAt: 0,
      notes: '',
      error: null,
    }),

  getTotal: () => get().cart.reduce((sum, c) => sum + c.subtotal, 0),
  getSubtotal: () =>
    get().cart.reduce((sum, c) => sum + c.qty * c.unitPrice, 0),
  getTotalDiscount: () =>
    get().cart.reduce((sum, c) => sum + Number(c.discount ?? 0), 0),
  getPayAmountAt: () => get().payAmountAt,
}));

import { create } from 'zustand';

export interface CartItem {
  productId: number;
  name: string;
  barcode: string;
  lotId?: number;
  qty: number;
  qtyOnHand: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

interface POSStore {
  cart: CartItem[];
  customerId: number | null;
  discountId: number | null;
  paymentMethodId: number | null;
  notes: string;
  error: string | null;
  setError: (msg: string | null) => void;
  addItem: (item: Omit<CartItem, 'subtotal'>) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  updateDiscount: (productId: number, discount: number) => void;
  setCustomerId: (id: number | null) => void;
  setDiscountId: (id: number | null) => void;
  setPaymentMethodId: (id: number | null) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getTotalDiscount: () => number;
}

function calcSubtotal(item: Omit<CartItem, 'subtotal'>): number {
  return item.qty * item.unitPrice - item.discount;
}

export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  error: null,
  customerId: null,
  discountId: null,
  paymentMethodId: null,
  notes: '',

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
            ? {
                ...c,
                qty: c.qty + item.qty,
                qtyOnHand: c.qtyOnHand - item.qty,
                subtotal: calcSubtotal({
                  ...c,
                  qty: c.qty + item.qty,
                }),
              }
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
          {
            ...item,
            qtyOnHand: item.qtyOnHand - item.qty,
            subtotal: calcSubtotal(item),
          },
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
            ? {
                ...c,
                qty,
                qtyOnHand: c.qtyOnHand - delta,
                subtotal: calcSubtotal({ ...c, qty }),
              }
            : c,
        ),
        error: null,
      });
    } else if (delta < 0) {
      // Decreasing quantity: restore stock
      set({
        cart: cart.map((c) =>
          c.productId === productId
            ? {
                ...c,
                qty,
                qtyOnHand: c.qtyOnHand + Math.abs(delta),
                subtotal: calcSubtotal({ ...c, qty }),
              }
            : c,
        ),
        error: null,
      });
    }
  },

  updateDiscount: (productId, discount) =>
    set({
      cart: get().cart.map((c) =>
        c.productId === productId
          ? {
              ...c,
              discount: discount,
              subtotal: calcSubtotal({ ...c, discount: discount }),
            }
          : c,
      ),
      error: null,
    }),

  setCustomerId: (id) => set({ customerId: id }),
  setDiscountId: (id) => set({ discountId: id }),
  setPaymentMethodId: (id) => set({ paymentMethodId: id }),
  setNotes: (notes) => set({ notes }),

  clearCart: () =>
    set({
      cart: [],
      customerId: null,
      discountId: null,
      paymentMethodId: null,
      notes: '',
      error: null,
    }),

  getTotal: () => get().cart.reduce((sum, c) => sum + c.subtotal, 0),
  getSubtotal: () =>
    get().cart.reduce((sum, c) => sum + c.qty * c.unitPrice, 0),
  getTotalDiscount: () => get().cart.reduce((sum, c) => sum + c.discount, 0),
}));

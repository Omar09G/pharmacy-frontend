import { create } from 'zustand';

export interface CartItem {
  productId: number;
  name: string;
  barcode: string;
  qty: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
}

interface POSStore {
  cart: CartItem[];
  customerId: number | null;
  discountId: number | null;
  paymentMethodId: number | null;
  notes: string;
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
  return item.qty * item.unitPrice - item.discountAmount;
}

export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  customerId: null,
  discountId: null,
  paymentMethodId: null,
  notes: '',

  addItem: (item) => {
    const cart = get().cart;
    const existing = cart.find((c) => c.productId === item.productId);
    if (existing) {
      set({
        cart: cart.map((c) =>
          c.productId === item.productId
            ? {
                ...c,
                qty: c.qty + item.qty,
                subtotal: calcSubtotal({
                  ...c,
                  qty: c.qty + item.qty,
                }),
              }
            : c,
        ),
      });
    } else {
      set({ cart: [...cart, { ...item, subtotal: calcSubtotal(item) }] });
    }
  },

  removeItem: (productId) =>
    set({ cart: get().cart.filter((c) => c.productId !== productId) }),

  updateQuantity: (productId, qty) => {
    if (qty <= 0) {
      set({ cart: get().cart.filter((c) => c.productId !== productId) });
      return;
    }
    set({
      cart: get().cart.map((c) =>
        c.productId === productId
          ? {
              ...c,
              qty: qty,
              subtotal: calcSubtotal({ ...c, qty: qty }),
            }
          : c,
      ),
    });
  },

  updateDiscount: (productId, discount) =>
    set({
      cart: get().cart.map((c) =>
        c.productId === productId
          ? {
              ...c,
              discountAmount: discount,
              subtotal: calcSubtotal({ ...c, discountAmount: discount }),
            }
          : c,
      ),
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
    }),

  getTotal: () => get().cart.reduce((sum, c) => sum + c.subtotal, 0),
  getSubtotal: () =>
    get().cart.reduce((sum, c) => sum + c.qty * c.unitPrice, 0),
  getTotalDiscount: () =>
    get().cart.reduce((sum, c) => sum + c.discountAmount, 0),
}));

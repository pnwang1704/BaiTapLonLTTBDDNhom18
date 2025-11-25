// store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // nếu bạn dùng persist thì thêm dòng này

// TYPE MỚI – HOÀN HẢO, SẠCH SẼ, CHUẨN E-COMMERCE
export type CartItem = {
  id: string;
  name: string;
  price: number;                    // ← Luôn là number để tính toán chính xác
  displayPrice?: string;            // ← Để hiển thị đẹp: "18.633.000 VND"
  image: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
};

// TẠO STORE HOÀN HẢO – DÙNG PERSIST ĐỂ GIỮ GIỎ HÀNG KHI TẮT APP
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      // TÍNH TỔNG TIỀN CHUẨN 100% – CHỈ DÙNG price (number)
      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // lưu vào AsyncStorage
    }
  )
);
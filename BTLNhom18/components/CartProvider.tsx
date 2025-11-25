// components/CartProvider.tsx – CHỈ 15 DÒNG, NHƯNG QUAN TRỌNG NHƯ TRÁI TIM!!!
import React from 'react';
import { useCartStore } from '../store/cartStore';

type Props = {
  children: React.ReactNode;
};

export const CartProvider = ({ children }: Props) => {
  // Chỉ cần gọi useCartStore một lần để khởi tạo store (Zustand tự động persist)
  useCartStore((state) => state.items);

  return <>{children}</>;
};
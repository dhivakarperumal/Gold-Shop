import { createContext } from 'react';

export interface CartProduct {
  id: string;
  name: string;
  category: string;
  purity: string;
  weight: number;
  weightUnit: string;
  price: number;
  offerPrice: number;
  stock: number;
  image: string;
}

export interface CartLine {
  product: CartProduct;
  quantity: number;
}

export interface StoreCartContextValue {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  savings: number;
  addItem: (product: CartProduct) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
}

export const StoreCartContext = createContext<StoreCartContextValue | null>(null);

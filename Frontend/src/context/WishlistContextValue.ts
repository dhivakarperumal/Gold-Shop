import { createContext } from 'react';
import type { CartProduct } from './StoreCartContext';

export interface WishlistContextValue {
  items: CartProduct[];
  itemCount: number;
  isLoading: boolean;
  error: string;
  hasItem: (productId: string) => boolean;
  refresh: () => Promise<void>;
  toggleItem: (product: CartProduct) => Promise<boolean>;
  removeItem: (productId: string) => Promise<void>;
}

export const WishlistContext = createContext<WishlistContextValue | null>(null);

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isAxiosError } from 'axios';
import api, { BACKEND_BASE_URL } from '../api';
import { useAuth } from './AuthContext';
import type { CartProduct } from './StoreCartContext';
import { WishlistContext, type WishlistContextValue } from './WishlistContextValue';

function withAbsoluteImage(product: CartProduct): CartProduct {
  const image = product.image;
  return {
    ...product,
    image: image && !/^(https?:|data:|blob:)/i.test(image)
      ? `${BACKEND_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`
      : image || '',
  };
}

function requestErrorMessage(error: unknown, fallback: string) {
  return isAxiosError(error) && typeof error.response?.data?.message === 'string'
    ? error.response.data.message
    : fallback;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<CartProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWishlist = useCallback(async () => {
    const { data } = await api.get<{ items: CartProduct[] }>('/wishlist');
    setItems(Array.isArray(data.items) ? data.items.map(withAbsoluteImage) : []);
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    let active = true;
    const initializeWishlist = async () => {
      if (!user) {
        setItems([]);
        setError('');
        setIsLoading(false);
        return;
      }
      setItems([]);
      setIsLoading(true);
      setError('');
      try {
        const { data } = await api.get<{ items: CartProduct[] }>('/wishlist');
        if (active) setItems(Array.isArray(data.items) ? data.items.map(withAbsoluteImage) : []);
      } catch (requestError: unknown) {
        console.error('Could not load wishlist:', requestError);
        if (active) setError(requestErrorMessage(requestError, 'Could not load your wishlist.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void initializeWishlist();
    return () => {
      active = false;
    };
  }, [isAuthLoading, user]);

  const value = useMemo<WishlistContextValue>(() => ({
    items,
    itemCount: items.length,
    isLoading,
    error,
    hasItem: (productId) => items.some((item) => item.id === productId),
    refresh: async () => {
      if (!user) return;
      setError('');
      setIsLoading(true);
      try {
        await loadWishlist();
      } catch (requestError: unknown) {
        console.error('Could not reload wishlist:', requestError);
        setError(requestErrorMessage(requestError, 'Could not load your wishlist.'));
      } finally {
        setIsLoading(false);
      }
    },
    toggleItem: async (product) => {
      if (!user) {
        setError('Sign in to save products to your wishlist.');
        return false;
      }
      setError('');
      try {
        if (items.some((item) => item.id === product.id)) {
          await api.delete(`/wishlist/${encodeURIComponent(product.id)}`);
        } else {
          await api.post('/wishlist', { productId: product.id });
        }
        await loadWishlist();
        return true;
      } catch (requestError: unknown) {
        console.error('Could not update wishlist:', requestError);
        setError(requestErrorMessage(requestError, 'Could not update your wishlist.'));
        return false;
      }
    },
    removeItem: async (productId) => {
      setError('');
      try {
        await api.delete(`/wishlist/${encodeURIComponent(productId)}`);
        await loadWishlist();
      } catch (requestError: unknown) {
        console.error('Could not remove wishlist item:', requestError);
        setError(requestErrorMessage(requestError, 'Could not remove this item from your wishlist.'));
      }
    },
  }), [error, isLoading, items, loadWishlist, user]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

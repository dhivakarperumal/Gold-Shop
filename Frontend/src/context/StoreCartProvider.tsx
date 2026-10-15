import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { isAxiosError } from 'axios';
import api, { BACKEND_BASE_URL } from '../api';
import { useAuth } from './AuthContext';
import { StoreCartContext, type CartLine, type CartProduct, type StoreCartContextValue } from './StoreCartContext';

interface ApiCartLine {
  product: CartProduct;
  quantity: number;
}

function currentPrice(product: CartProduct) {
  return product.offerPrice > 0 ? product.offerPrice : product.price;
}

export function StoreCartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const previousUser = useRef(user);
  const currentItems = useRef(items);
  currentItems.current = items;

  const loadServerCart = useCallback(async () => {
    const { data } = await api.get<{ items: ApiCartLine[] }>('/cart');
    const lines = Array.isArray(data.items) ? data.items : [];
    return lines.map((line): CartLine => {
      const image = line.product.image;
      return {
        ...line,
        product: {
          ...line.product,
          image: image && !/^(https?:|data:|blob:)/i.test(image)
            ? `${BACKEND_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`
            : image || '',
        },
      };
    });
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    let active = true;
    const guestItems = !previousUser.current && user ? currentItems.current : [];
    previousUser.current = user;
    const initializeCart = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (user) {
          for (const item of guestItems) {
            await api.post('/cart', {
              productId: item.product.id,
              quantity: item.quantity,
            });
          }
          const serverItems = await loadServerCart();
          if (active) setItems(serverItems);
        } else if (active) {
          setItems([]);
        }
      } catch (requestError: unknown) {
        console.error('Could not load shopping cart:', requestError);
        if (active) {
          setItems(guestItems);
          setError(isAxiosError(requestError)
            ? requestError.response?.data?.message || 'Could not load your cart from the server.'
            : 'Could not load your cart from the server.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void initializeCart();
    return () => {
      active = false;
    };
  }, [isAuthLoading, loadServerCart, user]);

  const value = useMemo<StoreCartContextValue>(() => {
    const itemCount = items.reduce((total, line) => total + line.quantity, 0);
    const subtotal = items.reduce((total, line) => total + currentPrice(line.product) * line.quantity, 0);
    const savings = items.reduce((total, line) => (
      total + Math.max(0, line.product.price - currentPrice(line.product)) * line.quantity
    ), 0);

    return {
      items,
      itemCount,
      subtotal,
      savings,
      isLoading,
      error,
      addItem: async (product, quantity = 1) => {
        if (!Number.isInteger(quantity) || quantity < 1 || product.stock < quantity) return false;
        const existing = items.find((line) => line.product.id === product.id);
        if (existing && existing.quantity + quantity > product.stock) return false;
        setError('');
        if (user) {
          try {
            await api.post('/cart', { productId: product.id, quantity });
            setItems(await loadServerCart());
            return true;
          } catch (requestError: unknown) {
            console.error('Could not add product to cart:', requestError);
            setError(isAxiosError(requestError)
              ? requestError.response?.data?.message || 'Could not add this product to your cart.'
              : 'Could not add this product to your cart.');
            return false;
          }
        }
        setItems((current) => {
          const currentLine = current.find((line) => line.product.id === product.id);
          return currentLine
            ? current.map((line) => line.product.id === product.id
              ? { ...line, product, quantity: line.quantity + quantity }
              : line)
            : [...current, { product, quantity }];
        });
        return true;
      },
      updateQuantity: async (productId, quantity) => {
        setError('');
        if (user) {
          try {
            if (quantity < 1) {
              await api.delete(`/cart/${encodeURIComponent(productId)}`);
            } else {
              await api.patch(`/cart/${encodeURIComponent(productId)}`, { quantity });
            }
            setItems(await loadServerCart());
          } catch (requestError: unknown) {
            console.error('Could not update cart quantity:', requestError);
            setError(isAxiosError(requestError)
              ? requestError.response?.data?.message || 'Could not update your cart.'
              : 'Could not update your cart.');
          }
          return;
        }
        setItems((current) => {
          const selected = current.find((line) => line.product.id === productId);
          if (quantity < 1 || (selected && selected.product.stock < 1)) {
            return current.filter((line) => line.product.id !== productId);
          }
          return current.map((line) => line.product.id === productId
            ? { ...line, quantity: Math.min(quantity, line.product.stock) }
            : line);
        });
      },
      removeItem: async (productId) => {
        setError('');
        if (user) {
          try {
            await api.delete(`/cart/${encodeURIComponent(productId)}`);
            setItems(await loadServerCart());
          } catch (requestError: unknown) {
            console.error('Could not remove cart item:', requestError);
            setError(isAxiosError(requestError)
              ? requestError.response?.data?.message || 'Could not remove this item from your cart.'
              : 'Could not remove this item from your cart.');
          }
          return;
        }
        setItems((current) => current.filter((line) => line.product.id !== productId));
      },
      clearCart: () => setItems([]),
    };
  }, [error, isLoading, items, loadServerCart, user]);

  return <StoreCartContext.Provider value={value}>{children}</StoreCartContext.Provider>;
}

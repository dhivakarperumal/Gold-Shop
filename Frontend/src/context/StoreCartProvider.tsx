import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { StoreCartContext, type CartLine, type CartProduct, type StoreCartContextValue } from './StoreCartContext';

const STORAGE_KEY = 'srivengateshwara-cart';

function loadCart(): CartLine[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error('Saved cart data is not a list');
    return parsed.filter((line): line is CartLine => (
      Boolean(line)
      && typeof line === 'object'
      && 'product' in line
      && typeof line.product === 'object'
      && line.product !== null
      && 'id' in line.product
      && typeof line.product.id === 'string'
      && typeof line.quantity === 'number'
      && Number.isInteger(line.quantity)
      && line.quantity > 0
    ));
  } catch (error) {
    console.error('Could not load the saved shopping cart:', error);
    return [];
  }
}

function currentPrice(product: CartProduct) {
  return product.offerPrice > 0 ? product.offerPrice : product.price;
}

export function StoreCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Could not save the shopping cart:', error);
    }
  }, [items]);

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
      addItem: (product) => {
        if (product.stock <= 0) return false;
        const existing = items.find((line) => line.product.id === product.id);
        if (existing && existing.quantity >= product.stock) return false;
        setItems((current) => {
          const currentLine = current.find((line) => line.product.id === product.id);
          if (currentLine) {
            return current.map((line) => line.product.id === product.id
              ? { ...line, product, quantity: line.quantity + 1 }
              : line);
          }
          return [...current, { product, quantity: 1 }];
        });
        return true;
      },
      updateQuantity: (productId, quantity) => {
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
      removeItem: (productId) => {
        setItems((current) => current.filter((line) => line.product.id !== productId));
      },
    };
  }, [items]);

  return <StoreCartContext.Provider value={value}>{children}</StoreCartContext.Provider>;
}

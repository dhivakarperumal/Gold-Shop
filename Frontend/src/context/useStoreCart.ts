import { useContext } from 'react';
import { StoreCartContext } from './StoreCartContext';

export function useStoreCart() {
  const context = useContext(StoreCartContext);
  if (!context) throw new Error('useStoreCart must be used inside StoreCartProvider');
  return context;
}

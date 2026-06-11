import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '../api';

interface DataContextType {
  customers: any[];
  loans: any[];
  payments: any[];
  isDataLoading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsDataLoading(true);
      
      // Load customers from API
      try {
        const customersResponse = await api.get('/customers');
        setCustomers(Array.isArray(customersResponse.data) ? customersResponse.data : []);
      } catch (error) {
        console.error('Error loading customers:', error);
        setCustomers([]);
      }

      // Load loans from API (if endpoint exists)
      try {
        const loansResponse = await api.get('/loans');
        setLoans(Array.isArray(loansResponse.data) ? loansResponse.data : []);
      } catch (error) {
        console.log('Loans endpoint not available yet');
        setLoans([]);
      }

      // Load payments from API (if endpoint exists)
      try {
        const paymentsResponse = await api.get('/payments');
        setPayments(Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []);
      } catch (error) {
        console.log('Payments endpoint not available yet');
        setPayments([]);
      }
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <DataContext.Provider value={{ customers, loans, payments, isDataLoading, refreshData: loadData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

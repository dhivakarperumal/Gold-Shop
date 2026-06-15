import api from '../../api';

export type Dealer = {
  id?: string;
  dealerId: string;
  name: string;
  companyName: string;
  contactPerson: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  emailAddress?: string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  businessType?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  openingBalance?: number;
  status: 'Active' | 'Inactive';
  notes?: string;
  profileImageUrl?: string;
  createdAt?: string;
};

export type DealerPurchase = {
  id?: string;
  dealerId: string;
  invoiceNumber: string;
  purchaseDate: string;
  productDetails: string;
  goldPurity: string;
  weight: number;
  goldRate: number;
  makingCharges: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partially Paid';
  notes?: string;
  createdAt?: string;
};

export type DealerPayment = {
  id?: string;
  dealerId: string;
  paymentDate: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  referenceNumber?: string;
  amount: number;
  remarks?: string;
  receiptUrl?: string;
  createdAt?: string;
};

export async function uploadDealerProfileImage(dealerId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.put(`/dealers/${dealerId}/profile-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.imageUrl || response.data.profileImageUrl;
}

export async function uploadDealerReceipt(dealerId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('receipt', file);
  
  const response = await api.post(`/dealers/${dealerId}/receipts`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.receiptUrl;
}

export async function getDealers(): Promise<Dealer[]> {
  const response = await api.get('/dealers');
  return response.data || [];
}

export async function getDealerById(id: string): Promise<Dealer | null> {
  try {
    const response = await api.get(`/dealers/${id}`);
    return response.data || null;
  } catch (error) {
    return null;
  }
}

export async function createDealer(data: Omit<Dealer, 'id' | 'createdAt'>): Promise<Dealer> {
  const payload = {
    ...data,
    dealerId: data.dealerId || `DLR-${Date.now()}`,
    openingBalance: Number(data.openingBalance ?? 0),
  };
  const response = await api.post('/dealers', payload);
  return response.data;
}

export async function updateDealer(id: string, updates: Partial<Dealer>): Promise<Dealer> {
  const payload: Partial<Dealer> = { ...updates };
  if (payload.openingBalance !== undefined) {
    payload.openingBalance = Number(payload.openingBalance);
  }
  const response = await api.put(`/dealers/${id}`, payload);
  return response.data;
}

export async function deleteDealer(id: string): Promise<void> {
  await api.delete(`/dealers/${id}`);
}

export async function getDealerPurchases(dealerId: string): Promise<DealerPurchase[]> {
  const response = await api.get(`/dealers/${dealerId}/purchases`);
  return response.data || [];
}

export async function getDealerPayments(dealerId: string): Promise<DealerPayment[]> {
  const response = await api.get(`/dealers/${dealerId}/payments`);
  return response.data || [];
}

export async function createDealerPurchase(purchase: Omit<DealerPurchase, 'id' | 'createdAt'>): Promise<DealerPurchase> {
  const payload = {
    ...purchase,
    weight: Number(purchase.weight),
    goldRate: Number(purchase.goldRate),
    makingCharges: Number(purchase.makingCharges),
    totalAmount: Number(purchase.totalAmount),
  };
  const response = await api.post('/dealerPurchases', payload);
  return response.data;
}

export async function createDealerPayment(payment: Omit<DealerPayment, 'id' | 'createdAt'>): Promise<DealerPayment> {
  const payload = {
    ...payment,
    amount: Number(payment.amount),
  };
  const response = await api.post('/dealerPayments', payload);
  return response.data;
}

export async function getAllDealerPurchases(): Promise<DealerPurchase[]> {
  const response = await api.get('/dealerPurchases');
  return response.data || [];
}

export async function getAllDealerPayments(): Promise<DealerPayment[]> {
  const response = await api.get('/dealerPayments');
  return response.data || [];
}

export type LedgerEntry = {
  id: string;
  type: 'Purchase' | 'Payment';
  date: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance?: number;
};

export async function getDealerLedger(dealerId: string, openingBalance = 0): Promise<LedgerEntry[]> {
  const [purchases, payments] = await Promise.all([
    getDealerPurchases(dealerId),
    getDealerPayments(dealerId),
  ]);

  const entries: LedgerEntry[] = [
    ...purchases.map((purchase) => ({
      id: purchase.id || `${Date.now()}-${Math.random()}`,
      type: 'Purchase',
      date: purchase.purchaseDate,
      description: purchase.productDetails,
      debit: Number(purchase.totalAmount),
      credit: 0,
    } as LedgerEntry)),
    ...payments.map((payment) => ({
      id: payment.id || `${Date.now()}-${Math.random()}`,
      type: 'Payment',
      date: payment.paymentDate,
      description: payment.paymentMode + (payment.referenceNumber ? ` / ${payment.referenceNumber}` : ''),
      debit: 0,
      credit: Number(payment.amount),
    } as LedgerEntry)),
  ];

  const sorted = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let running = Number(openingBalance || 0);

  return sorted.map((entry) => {
    running += entry.debit;
    running -= entry.credit;
    return {
      ...entry,
      runningBalance: Number(running.toFixed(2)),
    };
  });
}

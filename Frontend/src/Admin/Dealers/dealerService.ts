import { v4 as uuidv4 } from 'uuid';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { dbFirestore, storage } from '../../lib/firebase';

const dealersCollection = collection(dbFirestore, 'dealers');
const purchasesCollection = collection(dbFirestore, 'dealerPurchases');
const paymentsCollection = collection(dbFirestore, 'dealerPayments');

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

export async function uploadDealerProfileImage(dealerId: string, file: File) {
  const storageRef = ref(storage, `dealers/${dealerId}/profile/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadDealerReceipt(dealerId: string, file: File) {
  const storageRef = ref(storage, `dealers/${dealerId}/receipts/${uuidv4()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function getDealers(): Promise<Dealer[]> {
  const snapshot = await getDocs(query(dealersCollection, orderBy('createdAt', 'desc')));
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Dealer) }));
}

export async function getDealerById(id: string): Promise<Dealer | null> {
  const docRef = doc(dbFirestore, 'dealers', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...(docSnap.data() as Dealer) }) : null;
}

export async function createDealer(data: Omit<Dealer, 'id' | 'createdAt'>): Promise<Dealer> {
  const dealerId = data.dealerId || `DLR-${Date.now()}`;
  const payload = {
    ...data,
    dealerId,
    openingBalance: Number(data.openingBalance ?? 0),
    createdAt: new Date().toISOString(),
  };
  const docRef = await addDoc(dealersCollection, payload);
  return { id: docRef.id, ...payload } as Dealer;
}

export async function updateDealer(id: string, updates: Partial<Dealer>) {
  const docRef = doc(dbFirestore, 'dealers', id);
  const payload: Partial<Dealer> = { ...updates };

  if (payload.openingBalance !== undefined) {
    payload.openingBalance = Number(payload.openingBalance);
  }

  const updatePayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Partial<Dealer>;

  await updateDoc(docRef, updatePayload);
  return { id, ...(updates as Dealer) } as Dealer;
}

export async function deleteDealer(id: string) {
  const docRef = doc(dbFirestore, 'dealers', id);
  await deleteDoc(docRef);
}

export async function getDealerPurchases(dealerId: string): Promise<DealerPurchase[]> {
  const q = query(
    purchasesCollection,
    where('dealerId', '==', dealerId),
    orderBy('purchaseDate', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as DealerPurchase) }));
}

export async function getDealerPayments(dealerId: string): Promise<DealerPayment[]> {
  const q = query(
    paymentsCollection,
    where('dealerId', '==', dealerId),
    orderBy('paymentDate', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as DealerPayment) }));
}

export async function createDealerPurchase(purchase: Omit<DealerPurchase, 'id' | 'createdAt'>) {
  const docRef = await addDoc(purchasesCollection, {
    ...purchase,
    weight: Number(purchase.weight),
    goldRate: Number(purchase.goldRate),
    makingCharges: Number(purchase.makingCharges),
    totalAmount: Number(purchase.totalAmount),
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...purchase } as DealerPurchase;
}

export async function createDealerPayment(payment: Omit<DealerPayment, 'id' | 'createdAt'>) {
  const docRef = await addDoc(paymentsCollection, {
    ...payment,
    amount: Number(payment.amount),
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...payment } as DealerPayment;
}

export async function getAllDealerPurchases(): Promise<DealerPurchase[]> {
  const snapshot = await getDocs(query(purchasesCollection, orderBy('purchaseDate', 'desc')));
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as DealerPurchase) }));
}

export async function getAllDealerPayments(): Promise<DealerPayment[]> {
  const snapshot = await getDocs(query(paymentsCollection, orderBy('paymentDate', 'desc')));
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as DealerPayment) }));
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

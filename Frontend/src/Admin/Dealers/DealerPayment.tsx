import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CreditCard, Save } from 'lucide-react';
import type { Dealer } from './dealerService';
import {
  createDealerPayment,
  getDealers,
  uploadDealerReceipt,
} from './dealerService';

const initialPayment = {
  dealerId: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentMode: 'Cash' as 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque',
  referenceNumber: '',
  amount: 0,
  remarks: '',
  receiptUrl: '',
};

export function DealerPayment() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [payment, setPayment] = useState(initialPayment);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const dealerIdFromQuery = searchParams.get('dealerId') || '';
    getDealers().then((data) => {
      setDealers(data);
      if (dealerIdFromQuery) {
        setPayment((prev) => ({ ...prev, dealerId: dealerIdFromQuery }));
      }
    });
  }, [searchParams]);

  const handleChange = (key: keyof typeof initialPayment) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = key === 'amount' ? Number(event.target.value) : event.target.value;
    setPayment((prev) => ({ ...prev, [key]: value }));
  };

  const handleReceipt = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setReceiptFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!payment.dealerId || payment.amount <= 0) {
      toast.error('Please select dealer and enter amount.');
      return;
    }

    try {
      setIsLoading(true);
      let receiptUrl = '';
      if (receiptFile) {
        receiptUrl = await uploadDealerReceipt(payment.dealerId, receiptFile);
      }
      await createDealerPayment({ ...payment, receiptUrl });
      toast.success('Payment recorded successfully.');
      navigate(`/admin/dealers/view/${payment.dealerId}`);
    } catch (error) {
      console.error(error);
      toast.error('Unable to save payment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="mt-6 text-3xl font-black text-slate-900">Record Dealer Payment</h1>
          <p className="mt-2 text-sm text-slate-500">Capture payment receipts and reconcile outstanding dealer balances.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Dealer*
              <select value={payment.dealerId} onChange={handleChange('dealerId')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="">Choose dealer</option>
                {dealers.map((dealer) => (
                  <option key={dealer.id} value={dealer.id}>{dealer.name} — {dealer.companyName}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Payment Date*
              <input value={payment.paymentDate} onChange={handleChange('paymentDate')} type="date" className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Payment Mode*
              <select value={payment.paymentMode} onChange={handleChange('paymentMode')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Reference Number
              <input value={payment.referenceNumber} onChange={handleChange('referenceNumber')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="UPI / transaction ID" />
            </label>
          </div>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Amount*
            <input value={payment.amount} onChange={handleChange('amount')} type="number" min="0" step="0.01" className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="0" />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Remarks
            <textarea value={payment.remarks} onChange={handleChange('remarks')} rows={3} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Payment remarks or invoice details" />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Receipt Upload
            <input type="file" accept="image/*,.pdf" onChange={handleReceipt} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          </label>
        </div>

        <div className="space-y-6 rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-800">
            <CreditCard className="w-5 h-5" />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Payment Summary</p>
              <p className="mt-1 text-sm text-slate-500">Confirm payment details before saving.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Dealer</span>
              <span>{dealers.find((dealer) => dealer.id === payment.dealerId)?.name ?? 'Not selected'}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Mode</span>
              <span>{payment.paymentMode}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Reference</span>
              <span>{payment.referenceNumber || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-3">
              <span>Amount</span>
              <span>₹{payment.amount.toLocaleString()}</span>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Save className="w-4 h-4" /> Record Payment
          </button>
        </div>
      </form>
    </div>
  );
}

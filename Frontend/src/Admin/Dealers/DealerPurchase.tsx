import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ClipboardList, Save } from 'lucide-react';
import { createDealerPurchase, getDealers, type Dealer } from './dealerService';

const initialPurchase = {
  dealerId: '',
  invoiceNumber: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  productDetails: '',
  goldPurity: '',
  weight: 0,
  goldRate: 0,
  makingCharges: 0,
  totalAmount: 0,
  paymentStatus: 'Pending' as 'Paid' | 'Pending' | 'Partially Paid',
  notes: '',
};

export function DealerPurchase() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [purchase, setPurchase] = useState(initialPurchase);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const dealerIdFromQuery = searchParams.get('dealerId') || '';
    getDealers().then((data) => {
      setDealers(data);
      if (dealerIdFromQuery) {
        setPurchase((prev) => ({ ...prev, dealerId: dealerIdFromQuery }));
      }
    });
  }, [searchParams]);

  useEffect(() => {
    const amount = Number(purchase.weight) * Number(purchase.goldRate) + Number(purchase.makingCharges);
    setPurchase((prev) => ({ ...prev, totalAmount: Number(amount.toFixed(2)) }));
  }, [purchase.weight, purchase.goldRate, purchase.makingCharges]);

  const selectedDealer = useMemo(() => dealers.find((dealer) => dealer.id === purchase.dealerId), [dealers, purchase.dealerId]);

  const handleChange = (key: keyof typeof initialPurchase) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = key === 'weight' || key === 'goldRate' || key === 'makingCharges' ? Number(event.target.value) : event.target.value;
    setPurchase((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!purchase.dealerId || !purchase.invoiceNumber || !purchase.productDetails || purchase.weight <= 0 || purchase.goldRate <= 0) {
      toast.error('Please complete the purchase form.');
      return;
    }
    try {
      setIsLoading(true);
      await createDealerPurchase(purchase);
      toast.success('Purchase created successfully.');
      navigate(`/admin/dealers/view/${purchase.dealerId}`);
    } catch (error) {
      console.error(error);
      toast.error('Unable to save purchase.');
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
          <h1 className="mt-6 text-3xl font-black text-slate-900">Create Dealer Purchase</h1>
          <p className="mt-2 text-sm text-slate-500">Record new gold purchase transactions against a dealer account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Dealer*
              <select value={purchase.dealerId} onChange={handleChange('dealerId')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="">Select dealer</option>
                {dealers.map((dealer) => (
                  <option value={dealer.id} key={dealer.id}>{dealer.name} — {dealer.companyName}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Invoice Number*
              <input value={purchase.invoiceNumber} onChange={handleChange('invoiceNumber')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="PUR-2026-001" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Purchase Date*
              <input value={purchase.purchaseDate} onChange={handleChange('purchaseDate')} type="date" className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Gold Purity
              <input value={purchase.goldPurity} onChange={handleChange('goldPurity')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="18K / 22K / 24K" />
            </label>
          </div>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Product Details*
            <textarea value={purchase.productDetails} onChange={handleChange('productDetails')} rows={3} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Gold necklace, chain, or bullion details" />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Weight (g)*
              <input value={purchase.weight} onChange={handleChange('weight')} type="number" min="0" step="0.01" className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Gold Rate*/g
              <input value={purchase.goldRate} onChange={handleChange('goldRate')} type="number" min="0" step="0.01" className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Making Charges
              <input value={purchase.makingCharges} onChange={handleChange('makingCharges')} type="number" min="0" step="0.01" className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Payment Status
              <select value={purchase.paymentStatus} onChange={handleChange('paymentStatus')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Total Amount
              <input value={purchase.totalAmount} readOnly className="w-full rounded-3xl border border-gray-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none" />
            </label>
          </div>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Notes
            <textarea value={purchase.notes} onChange={handleChange('notes')} rows={3} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Add any purchase notes." />
          </label>
        </div>

        <div className="space-y-6 rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-800">
            <ClipboardList className="w-5 h-5" />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Invoice Summary</p>
              <p className="mt-1 text-sm text-slate-500">Preview purchase totals before saving.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Weight (g)</span>
              <span>{purchase.weight || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Gold Rate</span>
              <span>₹{purchase.goldRate || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Making Charges</span>
              <span>₹{purchase.makingCharges || 0}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-3">
              <span>Total Amount</span>
              <span>₹{purchase.totalAmount.toLocaleString()}</span>
            </div>
          </div>
          {selectedDealer && (
            <div className="rounded-3xl border border-slate-100 p-5">
              <p className="text-sm font-semibold text-slate-900">Selected Dealer</p>
              <p className="mt-2 text-sm text-slate-600">{selectedDealer.name} — {selectedDealer.companyName}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{selectedDealer.status}</p>
            </div>
          )}
          <button type="submit" disabled={isLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Save className="w-4 h-4" /> Save Purchase
          </button>
        </div>
      </form>
    </div>
  );
}

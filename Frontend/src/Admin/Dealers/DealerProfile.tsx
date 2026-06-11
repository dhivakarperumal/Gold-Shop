import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Home, MapPin, Banknote } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Dealer, DealerPayment, DealerPurchase } from './dealerService';
import {
  getDealerById,
  getDealerPayments,
  getDealerPurchases,
  getDealerLedger,
} from './dealerService';

export function DealerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [purchases, setPurchases] = useState<DealerPurchase[]>([]);
  const [payments, setPayments] = useState<DealerPayment[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    Promise.all([getDealerById(id), getDealerPurchases(id), getDealerPayments(id)])
      .then(([dealerData, purchaseData, paymentData]) => {
        if (!dealerData) {
          toast.error('Dealer not found');
          navigate('/admin/dealers');
          return null;
        }

        setDealer(dealerData);
        setPurchases(purchaseData);
        setPayments(paymentData);
        return getDealerLedger(id, Number(dealerData.openingBalance || 0));
      })
      .then((ledgerData) => {
        if (ledgerData) {
          setLedger(ledgerData);
        }
      })
      .catch(() => {
        toast.error('Failed to load dealer information.');
      });
  }, [id, navigate]);

  const totals = useMemo(() => {
    const purchaseTotal = purchases.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const paymentTotal = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const openingBalance = Number(dealer?.openingBalance || 0);
    const outstanding = openingBalance + purchaseTotal - paymentTotal;
    return { purchaseTotal, paymentTotal, openingBalance, outstanding };
  }, [dealer, payments, purchases]);

  if (!dealer) {
    return <div className="text-slate-600">Loading dealer details...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="mt-6 text-3xl font-black text-slate-900">Dealer Profile</h1>
          <p className="mt-2 text-sm text-slate-500">Review contact details, payment history, purchase history, and the ledger summary.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
          <button onClick={() => navigate(`/admin/dealers/edit/${dealer.id}`)} className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Edit Dealer
          </button>
          <button onClick={() => navigate('/admin/dealers/purchases')} className="rounded-3xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100">
            Add Purchase
          </button>
          <button onClick={() => navigate('/admin/dealers/payments')} className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
            Add Payment
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6 rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-[28px] bg-slate-100">
              {dealer.profileImageUrl ? (
                <img src={dealer.profileImageUrl} alt={dealer.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">{dealer.name.charAt(0)}</div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{dealer.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{dealer.companyName}</p>
              <p className="mt-1 text-sm uppercase tracking-[0.2em] text-slate-400">{dealer.status}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Outstanding Balance</p>
              <p className="mt-3 text-3xl font-black text-slate-900">₹{totals.outstanding.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Opening Balance</p>
              <p className="mt-3 text-3xl font-black text-slate-900">₹{totals.openingBalance.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total Purchases</p>
              <p className="mt-3 text-2xl font-black text-blue-700">₹{totals.purchaseTotal.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total Paid</p>
              <p className="mt-3 text-2xl font-black text-emerald-700">₹{totals.paymentTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-800">
            <Home className="w-5 h-5" />
            <p className="font-semibold">Dealer Information</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Contact Person</p>
              <p className="mt-2 font-semibold text-slate-900">{dealer.contactPerson}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Mobile</p>
              <p className="mt-2 font-semibold text-slate-900">{dealer.mobileNumber}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Alternate Mobile</p>
              <p className="mt-2 font-semibold text-slate-900">{dealer.alternateMobileNumber || 'N/A'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
              <p className="mt-2 font-semibold text-slate-900">{dealer.emailAddress || 'N/A'}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 text-slate-800 mb-3">
              <MapPin className="w-4 h-4" />
              <p className="font-semibold">Address</p>
            </div>
            <p className="text-sm text-slate-600">{dealer.address || 'N/A'}</p>
            <p className="mt-3 text-sm text-slate-600">{dealer.city}, {dealer.state} {dealer.pincode}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 text-slate-800 mb-3">
              <Banknote className="w-4 h-4" />
              <p className="font-semibold">GST / PAN</p>
            </div>
            <p className="text-sm text-slate-600">GST: {dealer.gstNumber || 'N/A'}</p>
            <p className="mt-2 text-sm text-slate-600">PAN: {dealer.panNumber || 'N/A'}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 text-slate-800 mb-3">
              <CreditCard className="w-4 h-4" />
              <p className="font-semibold">Bank Details</p>
            </div>
            <p className="text-sm text-slate-600">Bank: {dealer.bankName || 'N/A'}</p>
            <p className="mt-2 text-sm text-slate-600">A/C: {dealer.accountNumber || 'N/A'}</p>
            <p className="mt-2 text-sm text-slate-600">IFSC: {dealer.ifscCode || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-gray-500">Purchase History</p>
              <h2 className="mt-2 text-xl font-black text-slate-900">Recent Purchases</h2>
            </div>
            <div className="text-sm text-slate-500">Total ₹{totals.purchaseTotal.toLocaleString()}</div>
          </div>
          <div className="space-y-4">
            {purchases.length === 0 ? (
              <p className="text-sm text-slate-500">No purchase records found for this dealer.</p>
            ) : (
              purchases.slice(0, 5).map((purchase) => (
                <div key={purchase.id} className="rounded-3xl border border-slate-100 p-4 hover:border-blue-100 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{purchase.invoiceNumber}</p>
                      <p className="text-sm text-slate-500">{new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm font-semibold text-slate-700">₹{Number(purchase.totalAmount).toLocaleString()}</div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{purchase.productDetails}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-gray-500">Payment History</p>
              <h2 className="mt-2 text-xl font-black text-slate-900">Recent Payments</h2>
            </div>
            <div className="text-sm text-slate-500">Paid ₹{totals.paymentTotal.toLocaleString()}</div>
          </div>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <p className="text-sm text-slate-500">No payments recorded yet.</p>
            ) : (
              payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="rounded-3xl border border-slate-100 p-4 hover:border-emerald-100 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{payment.paymentMode}</p>
                      <p className="text-sm text-slate-500">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm font-semibold text-emerald-700">₹{Number(payment.amount).toLocaleString()}</div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{payment.remarks || 'No remarks'}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-gray-500">Ledger Summary</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Running Balance</h2>
          </div>
          <div className="text-sm text-slate-500">Latest entry ₹{ledger?.at(-1)?.runningBalance?.toLocaleString() || '0'}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3 text-right">Debit</th>
                <th className="px-5 py-3 text-right">Credit</th>
                <th className="px-5 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">Ledger is empty for this dealer.</td>
                </tr>
              ) : (
                ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{entry.type}</td>
                    <td className="px-5 py-4">{entry.description}</td>
                    <td className="px-5 py-4 text-right text-rose-600">{entry.debit ? `₹${entry.debit.toLocaleString()}` : '-'}</td>
                    <td className="px-5 py-4 text-right text-emerald-600">{entry.credit ? `₹${entry.credit.toLocaleString()}` : '-'}</td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">₹{entry.runningBalance?.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

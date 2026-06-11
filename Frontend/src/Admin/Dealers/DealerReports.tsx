import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Layers, FileText, CreditCard } from 'lucide-react';
import { getAllDealerPayments, getAllDealerPurchases, getDealers } from './dealerService';

export function DealerReports() {
  const navigate = useNavigate();
  const [dealers, setDealers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    getDealers().then(setDealers);
    getAllDealerPurchases().then(setPurchases);
    getAllDealerPayments().then(setPayments);
  }, []);

  const outstandingReport = useMemo(() => {
    return dealers.map((dealer) => {
      const purchaseAmount = purchases.filter((item) => item.dealerId === dealer.id).reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
      const paidAmount = payments.filter((item) => item.dealerId === dealer.id).reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const openingBalance = Number(dealer.openingBalance || 0);
      return {
        dealer,
        purchaseAmount,
        paidAmount,
        outstanding: Math.max(openingBalance + purchaseAmount - paidAmount, 0),
      };
    }).sort((a, b) => b.outstanding - a.outstanding);
  }, [dealers, payments, purchases]);

  const monthlyTransactions = useMemo(() => {
    const grouped: Record<string, { purchases: number; payments: number; transactions: number }> = {};
    purchases.forEach((entry) => {
      const month = new Date(entry.purchaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      grouped[month] = grouped[month] || { purchases: 0, payments: 0, transactions: 0 };
      grouped[month].purchases += Number(entry.totalAmount || 0);
      grouped[month].transactions += 1;
    });
    payments.forEach((entry) => {
      const month = new Date(entry.paymentDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      grouped[month] = grouped[month] || { purchases: 0, payments: 0, transactions: 0 };
      grouped[month].payments += Number(entry.amount || 0);
      grouped[month].transactions += 1;
    });
    return Object.entries(grouped).map(([month, data]) => ({ month, ...data })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [payments, purchases]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="mt-6 text-3xl font-black text-slate-900">Dealer Reports</h1>
          <p className="mt-2 text-sm text-slate-500">Download dealer, purchase, payment, and outstanding balance summaries.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600">
            <BarChart3 className="w-5 h-5" />
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Dealer Report</p>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{dealers.length}</p>
          <p className="mt-2 text-sm text-slate-500">Total registered dealers in the system.</p>
        </div>
        <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600">
            <Layers className="w-5 h-5" />
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Purchase Report</p>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{purchases.length}</p>
          <p className="mt-2 text-sm text-slate-500">Purchase transactions recorded.</p>
        </div>
        <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-amber-600">
            <CreditCard className="w-5 h-5" />
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Payment Report</p>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{payments.length}</p>
          <p className="mt-2 text-sm text-slate-500">Payment records saved.</p>
        </div>
        <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-rose-600">
            <FileText className="w-5 h-5" />
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Outstanding Report</p>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{outstandingReport.filter((row) => row.outstanding > 0).length}</p>
          <p className="mt-2 text-sm text-slate-500">Dealers with pending balances.</p>
        </div>
      </div>

      <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Outstanding Balance Report</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Largest Outstanding Balances</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-5 py-3">Dealer</th>
                <th className="px-5 py-3">Total Purchases</th>
                <th className="px-5 py-3">Total Paid</th>
                <th className="px-5 py-3 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outstandingReport.slice(0, 8).map((row) => (
                <tr key={row.dealer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{row.dealer.name}</td>
                  <td className="px-5 py-4">₹{row.purchaseAmount.toLocaleString()}</td>
                  <td className="px-5 py-4">₹{row.paidAmount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-semibold text-rose-600">₹{row.outstanding.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Monthly Transaction Report</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">Monthly Totals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-5 py-3">Month</th>
                <th className="px-5 py-3 text-right">Purchase Total</th>
                <th className="px-5 py-3 text-right">Payment Total</th>
                <th className="px-5 py-3 text-right">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyTransactions.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{row.month}</td>
                  <td className="px-5 py-4 text-right">₹{row.purchases.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right">₹{row.payments.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right">{row.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

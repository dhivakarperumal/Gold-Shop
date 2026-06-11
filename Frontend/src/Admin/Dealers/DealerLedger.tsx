import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getDealerLedger, getDealers, type Dealer, type LedgerEntry } from './dealerService';

export function DealerLedger() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    getDealers().then((data) => {
      setDealers(data);
      const dealerId = searchParams.get('dealerId') || data[0]?.id || '';
      setSelectedDealerId(dealerId);
    });
  }, [searchParams]);

  useEffect(() => {
    if (!selectedDealerId) return;
    getDealerLedger(selectedDealerId).then(setLedger).catch((error) => {
      console.error(error);
      toast.error('Unable to load ledger.');
    });
  }, [selectedDealerId]);

  const selectedDealer = useMemo(() => dealers.find((dealer) => dealer.id === selectedDealerId), [dealers, selectedDealerId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="mt-6 text-3xl font-black text-slate-900">Dealer Ledger</h1>
          <p className="mt-2 text-sm text-slate-500">View debit/credit movements, running balance, and export ledger statements.</p>
        </div>

        <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <Printer className="w-4 h-4" /> Export Ledger PDF
        </button>
      </div>

      <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">Select Dealer</p>
            <select value={selectedDealerId} onChange={(e) => setSelectedDealerId(e.target.value)} className="mt-3 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option value="">Choose dealer</option>
              {dealers.map((dealer) => (
                <option key={dealer.id} value={dealer.id}>{dealer.name} — {dealer.companyName}</option>
              ))}
            </select>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current Ledger</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{selectedDealer?.name || 'No dealer selected'}</p>
            <p className="mt-1 text-sm text-slate-500">{selectedDealer?.companyName || 'Please select a dealer to view entries.'}</p>
          </div>
        </div>
      </div>

      <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm print:max-w-full print:shadow-none print:border-none">
        <div className="flex items-center gap-3 mb-5">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Ledger Entries</p>
            <p className="text-sm text-slate-500">Debit and credit movement history with running balance.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600 print:text-black">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500 print:bg-white">
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
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-slate-400">No ledger entries available.</td>
                </tr>
              ) : (
                ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors print:hover:bg-transparent">
                    <td className="px-5 py-4">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{entry.type}</td>
                    <td className="px-5 py-4">{entry.description}</td>
                    <td className="px-5 py-4 text-right text-rose-600">{entry.debit ? `₹${entry.debit.toLocaleString()}` : '-'}</td>
                    <td className="px-5 py-4 text-right text-emerald-600">{entry.credit ? `₹${entry.credit.toLocaleString()}` : '-'}</td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">₹{entry.runningBalance?.toLocaleString() ?? '-'}</td>
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

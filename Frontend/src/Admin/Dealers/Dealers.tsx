import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  BarChart3,
  ClipboardList,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { Dealer, DealerPurchase, DealerPayment } from './dealerService';
import {
  getDealers,
  deleteDealer,
  getAllDealerPurchases,
  getAllDealerPayments,
} from './dealerService';

const ITEMS_PER_PAGE = 10;

export function Dealers() {
  const navigate = useNavigate();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [purchases, setPurchases] = useState<DealerPurchase[]>([]);
  const [payments, setPayments] = useState<DealerPayment[]>([]);

  const loadData = async () => {
    setDealers(await getDealers());
    setPurchases(await getAllDealerPurchases());
    setPayments(await getAllDealerPayments());
  };

  useEffect(() => {
    void (async () => {
      await loadData();
    })();
  }, []);

  const filteredDealers = useMemo(() => {
    return dealers
      .filter((dealer) =>
        [dealer.name, dealer.companyName, dealer.contactPerson]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .filter((dealer) => statusFilter === 'All' || dealer.status === statusFilter)
      .sort((a, b) => {
        const aValue = a.name.toLowerCase();
        const bValue = b.name.toLowerCase();
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [dealers, searchTerm, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredDealers.length / ITEMS_PER_PAGE));
  const paginatedDealers = filteredDealers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const totalDealers = dealers.length;
    const activeDealers = dealers.filter((d) => d.status === 'Active').length;
    const inactiveDealers = dealers.filter((d) => d.status === 'Inactive').length;
    const totalPurchaseAmount = purchases.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const totalPaidAmount = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalPendingAmount = Math.max(totalPurchaseAmount - totalPaidAmount, 0);

    const purchaseByMonth = purchases.reduce<Record<string, number>>((acc, item) => {
      const month = new Date(item.purchaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + Number(item.totalAmount || 0);
      return acc;
    }, {});

    return {
      totalDealers,
      activeDealers,
      inactiveDealers,
      totalPurchaseAmount,
      totalPaidAmount,
      totalPendingAmount,
      purchaseByMonth,
    };
  }, [dealers, purchases, payments]);

  const recentActivities = useMemo(() => {
    const activity = [
      ...purchases.map((purchase) => ({
        key: purchase.id,
        label: `Purchase: ${purchase.invoiceNumber}`,
        dealer: purchase.dealerId,
        amount: purchase.totalAmount,
        date: purchase.purchaseDate,
        type: 'Purchase',
      })),
      ...payments.map((payment) => ({
        key: payment.id,
        label: `Payment: ₹${payment.amount}`,
        dealer: payment.dealerId,
        amount: payment.amount,
        date: payment.paymentDate,
        type: 'Payment',
      })),
    ];
    return activity
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [purchases, payments]);

  const handleDelete = async (id?: string) => {
    if (!id || !confirm('Are you sure you want to delete this dealer?')) return;
    await deleteDealer(id);
    await loadData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Dealer Management</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">Manage gold dealers, purchase entries, payments, and full ledger analytics from one unified admin dashboard.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full md:w-auto">
          <Link to="/admin/dealers/new" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Dealer
          </Link>
          <Link to="/admin/dealers/purchases" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
            <ClipboardList className="w-4 h-4 text-blue-600" /> New Purchase
          </Link>
          <Link to="/admin/dealers/payments" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
            <Wallet className="w-4 h-4 text-emerald-600" /> Record Payment
          </Link>
          <Link to="/admin/dealers/ledger" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
            <BarChart3 className="w-4 h-4 text-purple-600" /> Ledger
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">Total Dealers</p>
          <h2 className="mt-4 text-3xl font-black text-gray-900">{stats.totalDealers}</h2>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">Active Dealers</p>
          <h2 className="mt-4 text-3xl font-black text-emerald-700">{stats.activeDealers}</h2>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">Inactive Dealers</p>
          <h2 className="mt-4 text-3xl font-black text-rose-600">{stats.inactiveDealers}</h2>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">Outstanding Amount</p>
          <h2 className="mt-4 text-3xl font-black text-blue-700">₹{stats.totalPendingAmount.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-4xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Dealers Pulse</p>
              <h3 className="mt-1 text-xl font-black text-gray-900">Quick Insights</h3>
            </div>
            <div className="text-sm text-gray-500">Updated just now</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
            <div className="rounded-3xl bg-slate-950/95 p-5 text-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-300">Total Purchase</p>
              <p className="mt-3 text-2xl font-black">₹{stats.totalPurchaseAmount.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-5 text-emerald-900 shadow-sm">
              <p className="text-xs uppercase tracking-[0.26em] text-emerald-600">Paid</p>
              <p className="mt-3 text-2xl font-black">₹{stats.totalPaidAmount.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl bg-rose-50 p-5 text-rose-900 shadow-sm">
              <p className="text-xs uppercase tracking-[0.26em] text-rose-600">Pending</p>
              <p className="mt-3 text-2xl font-black">₹{stats.totalPendingAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-gray-900">Monthly Purchase Analytics</h4>
                <p className="text-sm text-gray-500">Tracking month-over-month dealer purchases.</p>
              </div>
              <button onClick={() => navigate('/admin/dealers/reports')} className="text-sm font-semibold text-blue-600 hover:text-blue-800">View reports</button>
            </div>
            <div className="grid gap-3">
              {Object.entries(stats.purchaseByMonth).map(([month, amount]) => (
                <div key={month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                    <span>{month}</span>
                    <span>₹{amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.min(100, (amount / Math.max(...Object.values(stats.purchaseByMonth), 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}
              {Object.keys(stats.purchaseByMonth).length === 0 && (
                <p className="text-sm text-gray-500">No purchase analytics available yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-4xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Recent Dealer Activity</p>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No activity yet. Add dealers or record transactions to populate this feed.</div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.key} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 rounded-2xl bg-slate-100 p-3 text-slate-700">
                      {activity.type === 'Purchase' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{activity.label}</p>
                      <p className="text-sm text-gray-500 mt-1">{new Date(activity.date).toLocaleString()}</p>
                    </div>
                    <div className="text-right text-sm font-bold text-gray-900">₹{Number(activity.amount).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-4xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Dealer List</p>
            <h3 className="mt-2 text-xl font-black text-gray-900">Manage Dealers</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(event.target.value); setCurrentPage(1); }}
                className="w-full rounded-2xl border border-gray-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Search dealers"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => { setStatusFilter(event.target.value as 'All' | 'Active' | 'Inactive'); setCurrentPage(1); }}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-slate-50"
            >
              Sort: {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Dealer ID</th>
                <th className="px-6 py-4">Dealer Name</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedDealers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-400">
                    No dealers match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedDealers.map((dealer) => (
                  <tr key={dealer.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{dealer.dealerId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{dealer.name}</div>
                      <div className="text-xs text-slate-500">{dealer.contactPerson}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{dealer.companyName}</td>
                    <td className="px-6 py-4 text-slate-600">{dealer.mobileNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${dealer.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {dealer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link to={`/admin/dealers/view/${dealer.id}`} className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
                        View
                      </Link>
                      <Link to={`/admin/dealers/edit/${dealer.id}`} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(dealer.id)} className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Showing {paginatedDealers.length} of {filteredDealers.length} dealers</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40">
              Prev
            </button>
            <span className="text-xs text-slate-600">{currentPage} / {totalPages}</span>
            <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

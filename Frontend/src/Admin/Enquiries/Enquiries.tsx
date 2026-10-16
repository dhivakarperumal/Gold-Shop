import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, CalendarDays, Check, CheckCircle2, Clock3, Eye, Mail,
  MessageCircle, Phone, RefreshCw, Search, Send, Trash2, X,
} from 'lucide-react';
import api from '../../api';

type EnquiryStatus = 'New' | 'In Progress' | 'Resolved' | 'Closed';
type Enquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  assignedTo: string;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
};

const statuses: EnquiryStatus[] = ['New', 'In Progress', 'Resolved', 'Closed'];

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

function statusStyle(status: EnquiryStatus) {
  switch (status) {
    case 'New': return 'bg-sky-50 text-sky-700 border-sky-100';
    case 'In Progress': return 'bg-amber-50 text-amber-800 border-amber-100';
    case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'Closed': return 'bg-rose-50 text-rose-700 border-rose-100';
  }
}

export function Enquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All subjects');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [assignedDraft, setAssignedDraft] = useState('');

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<{ enquiries: Enquiry[] }>('/enquiries');
      const records = Array.isArray(data.enquiries) ? data.enquiries : [];
      setEnquiries(records);
      setSelectedId((current) => (
        current && records.some((enquiry) => enquiry.id === current)
          ? current
          : records[0]?.id ?? null
      ));
    } catch (requestError: unknown) {
      console.error('Could not load enquiries:', requestError);
      setError('Could not load enquiries. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEnquiries();
  }, [loadEnquiries]);

  const selected = enquiries.find((enquiry) => enquiry.id === selectedId) ?? null;

  useEffect(() => {
    setNotesDraft(selected?.internalNotes || '');
    setAssignedDraft(selected?.assignedTo || '');
    setActionMessage('');
  }, [selected?.assignedTo, selected?.id, selected?.internalNotes]);

  const subjects = useMemo(
    () => [...new Set(enquiries.map((enquiry) => enquiry.subject).filter(Boolean))],
    [enquiries],
  );
  const stats = useMemo(() => ({
    total: enquiries.length,
    new: enquiries.filter((enquiry) => enquiry.status === 'New').length,
    progress: enquiries.filter((enquiry) => enquiry.status === 'In Progress').length,
    resolved: enquiries.filter((enquiry) => enquiry.status === 'Resolved').length,
    closed: enquiries.filter((enquiry) => enquiry.status === 'Closed').length,
  }), [enquiries]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const since = dateFilter === '7'
      ? Date.now() - 7 * 24 * 60 * 60 * 1000
      : dateFilter === '30'
        ? Date.now() - 30 * 24 * 60 * 60 * 1000
        : 0;
    return enquiries.filter((enquiry) => {
      const matchesSearch = !query || [
        enquiry.name, enquiry.email, enquiry.phone, enquiry.subject, enquiry.message, `#${enquiry.id}`,
      ].some((value) => value?.toLowerCase().includes(query));
      const matchesSubject = subjectFilter === 'All subjects' || enquiry.subject === subjectFilter;
      const matchesStatus = statusFilter === 'All statuses' || enquiry.status === statusFilter;
      const matchesDate = !since || new Date(enquiry.createdAt).getTime() >= since;
      return matchesSearch && matchesSubject && matchesStatus && matchesDate;
    });
  }, [dateFilter, enquiries, search, statusFilter, subjectFilter]);

  const updateSelected = async (changes: Partial<Pick<Enquiry, 'status' | 'assignedTo' | 'internalNotes'>>) => {
    if (!selected) return;
    setSaving(true);
    setActionMessage('');
    try {
      const { data } = await api.patch<{ enquiry: Enquiry }>(`/enquiries/${selected.id}`, changes);
      setEnquiries((current) => current.map((enquiry) => enquiry.id === selected.id ? data.enquiry : enquiry));
      setActionMessage('Enquiry updated.');
    } catch (requestError: unknown) {
      console.error('Could not update enquiry:', requestError);
      setActionMessage('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteSelected = async () => {
    if (!selected || !window.confirm(`Delete enquiry #${1000 + selected.id}? This cannot be undone.`)) return;
    try {
      await api.delete(`/enquiries/${selected.id}`);
      const remaining = enquiries.filter((enquiry) => enquiry.id !== selected.id);
      setEnquiries(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      setActionMessage('Enquiry deleted.');
    } catch (requestError: unknown) {
      console.error('Could not delete enquiry:', requestError);
      setActionMessage('Could not delete enquiry. Please try again.');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSubjectFilter('All subjects');
    setStatusFilter('All statuses');
    setDateFilter('all');
  };

  const statCards = [
    { label: 'Total enquiries', value: stats.total, icon: Mail, color: 'text-[#74180f]', bg: 'bg-[#fff2d5]' },
    { label: 'New enquiries', value: stats.new, icon: MessageCircle, color: 'text-sky-700', bg: 'bg-sky-50' },
    { label: 'In progress', value: stats.progress, icon: Clock3, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Closed', value: stats.closed, icon: X, color: 'text-rose-700', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#ad7929]">Customer service</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#381413]">Enquiries</h1>
          <p className="mt-1 text-sm text-gray-500">Manage customer questions, product enquiries, and showroom visit requests.</p>
        </div>
        <button type="button" onClick={() => void loadEnquiries()} disabled={loading} className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#eadbc9] bg-white px-3 py-2 text-xs font-semibold text-[#5a1112] hover:bg-[#fff8ec] disabled:opacity-60 sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-[#f0e5d5] bg-white p-3 shadow-sm sm:p-4">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}><Icon className="h-5 w-5" /></span>
            <div className="min-w-0"><p className="truncate text-[10px] font-semibold text-gray-500">{label}</p><p className="mt-0.5 text-xl font-bold text-[#381413]">{value}</p></div>
          </div>
        ))}
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</span>
          <button type="button" onClick={() => void loadEnquiries()} className="font-bold underline">Retry</button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl border border-[#f0e5d5] bg-white p-3 shadow-sm">
        <label className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone, or message..." className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#b98531] focus:ring-2 focus:ring-[#f4c35e]/20" />
        </label>
        <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} className="min-w-36 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-[#b98531]">
          <option>All subjects</option>{subjects.map((subject) => <option key={subject}>{subject}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-w-36 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-[#b98531]">
          <option>All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
        <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filter by date" className="min-w-32 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-[#b98531]">
          <option value="all">All dates</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option>
        </select>
        <button type="button" onClick={resetFilters} className="rounded-lg border border-[#eadbc9] px-4 py-2.5 text-xs font-bold text-[#74180f] hover:bg-[#fff8ec]">Reset</button>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
        <section aria-label="Enquiry list" className="overflow-hidden rounded-xl border border-[#f0e5d5] bg-white shadow-sm">
          {loading ? (
            <div role="status" className="p-12 text-center text-sm text-gray-500">Loading enquiries…</div>
          ) : filtered.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="border-b border-[#f0e5d5] bg-[#fffaf2] text-[10px] font-bold uppercase tracking-wider text-[#806c5e]">
                  <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Subject & message</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">View</th></tr>
                </thead>
                <tbody className="divide-y divide-[#f1e8dc]">
                  {filtered.map((enquiry) => (
                    <tr key={enquiry.id} className={`cursor-pointer transition hover:bg-[#fffdf8] ${selectedId === enquiry.id ? 'bg-[#fffaf2]' : ''}`} onClick={() => setSelectedId(enquiry.id)}>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-500">#{1000 + enquiry.id}</td>
                      <td className="max-w-40 px-4 py-3">
                        <p className="truncate text-xs font-bold text-[#381413]">{enquiry.name}</p>
                        <p className="mt-1 truncate text-[10px] text-gray-500">{enquiry.email}</p>
                        {enquiry.phone && <p className="mt-0.5 text-[10px] text-gray-500">{enquiry.phone}</p>}
                      </td>
                      <td className="max-w-64 px-4 py-3">
                        <p className="text-xs font-semibold text-[#4b1715]">{enquiry.subject}</p>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-500">{enquiry.message}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[10px] text-gray-500">{formatDate(enquiry.createdAt)}</td>
                      <td className="px-4 py-3"><span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyle(enquiry.status)}`}>{enquiry.status}</span></td>
                      <td className="px-4 py-3 text-right"><button type="button" aria-label={`View enquiry #${1000 + enquiry.id}`} onClick={(event) => { event.stopPropagation(); setSelectedId(enquiry.id); }} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-[#d6ad62] hover:text-[#74180f]"><Eye className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-[#c9ad82]" />
              <h2 className="mt-3 font-serif text-lg font-bold text-[#5a1112]">{enquiries.length ? 'No matching enquiries' : 'No enquiries yet'}</h2>
              <p className="mt-1 text-sm text-gray-500">{enquiries.length ? 'Try changing or resetting the filters.' : 'New customer messages submitted from Contact Us will appear here.'}</p>
              {enquiries.length > 0 && <button type="button" onClick={resetFilters} className="mt-3 text-xs font-bold text-[#74180f] underline">Reset filters</button>}
            </div>
          )}
          {!loading && filtered.length > 0 && <div className="border-t border-[#f0e5d5] px-4 py-3 text-[10px] text-gray-500">Showing {filtered.length} of {enquiries.length} enquiries</div>}
        </section>

        <aside aria-label="Selected enquiry details" className="rounded-xl border border-[#f0e5d5] bg-white shadow-sm xl:sticky xl:top-4">
          {selected ? (
            <div>
              <div className="flex items-start justify-between border-b border-[#f0e5d5] p-4">
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#ad7929]">Enquiry details</p><h2 className="mt-1 font-serif text-lg font-bold text-[#381413]">#{1000 + selected.id}</h2></div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyle(selected.status)}`}>{selected.status}</span>
              </div>
              <div className="space-y-4 p-4">
                <div><h3 className="text-sm font-bold text-[#381413]">{selected.name}</h3><a href={`mailto:${selected.email}`} className="mt-1 flex items-center gap-2 break-all text-xs text-gray-600 hover:text-[#74180f]"><Mail className="h-3.5 w-3.5 shrink-0" />{selected.email}</a>{selected.phone && <a href={`tel:${selected.phone}`} className="mt-1 flex items-center gap-2 text-xs text-gray-600 hover:text-[#74180f]"><Phone className="h-3.5 w-3.5" />{selected.phone}</a>}<p className="mt-2 flex items-center gap-2 text-[10px] text-gray-500"><CalendarDays className="h-3.5 w-3.5" />{formatDate(selected.createdAt)}</p></div>
                <div className="border-t border-[#f0e5d5] pt-3"><h3 className="text-xs font-bold text-[#74180f]">{selected.subject}</h3><p className="mt-2 whitespace-pre-wrap rounded-lg bg-[#fffaf2] p-3 text-xs leading-5 text-gray-700">{selected.message}</p></div>
                <label className="block text-xs font-bold text-[#4b1715]">Status<select value={selected.status} disabled={saving} onChange={(event) => void updateSelected({ status: event.target.value as EnquiryStatus })} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium outline-none focus:border-[#b98531]">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
                <label className="block text-xs font-bold text-[#4b1715]">Assign to<input value={assignedDraft} disabled={saving} onChange={(event) => setAssignedDraft(event.target.value)} onBlur={(event) => { if (event.target.value !== selected.assignedTo) void updateSelected({ assignedTo: event.target.value }); }} placeholder="Enter staff name" maxLength={100} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-normal outline-none focus:border-[#b98531]" /></label>
                <label className="block text-xs font-bold text-[#4b1715]">Internal notes<textarea value={notesDraft} onChange={(event) => setNotesDraft(event.target.value)} maxLength={4000} rows={3} placeholder="Add private notes for your team..." className="mt-1.5 w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-normal outline-none focus:border-[#b98531]" /></label>
                <button type="button" disabled={saving || notesDraft === selected.internalNotes} onClick={() => void updateSelected({ internalNotes: notesDraft })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#5a1112] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#74180f] disabled:cursor-not-allowed disabled:opacity-50"><Check className="h-4 w-4" />{saving ? 'Saving…' : 'Save internal notes'}</button>
                {actionMessage && <p role="status" className="text-center text-xs text-[#5a1112]">{actionMessage}</p>}
                <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}&body=${encodeURIComponent(`Hello ${selected.name},\n\n`)}`} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#eadbc9] px-4 py-2.5 text-xs font-bold text-[#74180f] transition hover:bg-[#fff8ec]"><Send className="h-4 w-4" />Reply to customer</a>
                <button type="button" onClick={() => void deleteSelected()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete enquiry</button>
              </div>
            </div>
          ) : <div className="p-8 text-center text-sm text-gray-500">Select an enquiry to view its details.</div>}
        </aside>
      </div>
    </div>
  );
}

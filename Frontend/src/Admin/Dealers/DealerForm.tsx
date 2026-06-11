import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ImagePlus, Save } from 'lucide-react';
import type { Dealer } from './dealerService';
import {
  createDealer,
  getDealerById,
  updateDealer,
  uploadDealerProfileImage,
} from './dealerService';

const initialDealer: Dealer = {
  dealerId: '',
  name: '',
  companyName: '',
  contactPerson: '',
  mobileNumber: '',
  alternateMobileNumber: '',
  emailAddress: '',
  gstNumber: '',
  panNumber: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  businessType: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  openingBalance: 0,
  status: 'Active',
  notes: '',
  profileImageUrl: '',
};

export function DealerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState<Dealer>(initialDealer);
  const [loading, setLoading] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDealerById(id)
      .then((result) => {
        if (result) {
          setDealer(result);
          setPreviewUrl(result.profileImageUrl || '');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const pageTitle = id ? 'Edit Dealer' : 'Add Dealer';

  const handleInput = (key: keyof Dealer) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = key === 'openingBalance' ? Number(event.target.value || 0) : event.target.value;
    setDealer((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setProfileFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const isValid = useMemo(() => {
    return dealer.name.trim() !== '' && dealer.companyName.trim() !== '' && dealer.mobileNumber.trim() !== '';
  }, [dealer]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      toast.error('Please fill in the required dealer details.');
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await updateDealer(id, dealer);
        if (profileFile) {
          const downloadUrl = await uploadDealerProfileImage(id, profileFile);
          await updateDealer(id, { profileImageUrl: downloadUrl });
        }
        toast.success('Dealer updated successfully.');
      } else {
        const created = await createDealer(dealer);
        if (profileFile) {
          const downloadUrl = await uploadDealerProfileImage(created.id!, profileFile);
          await updateDealer(created.id!, { profileImageUrl: downloadUrl });
        }
        toast.success('Dealer added successfully.');
      }
      navigate('/admin/dealers');
    } catch (error) {
      console.error(error);
      toast.error('Unable to save dealer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dealers
          </button>
          <h1 className="mt-6 text-3xl font-black text-slate-900">{pageTitle}</h1>
          <p className="mt-2 text-sm text-slate-500">Complete dealer profile fields, bank details, and opening balance information.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6 rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Dealer Name*
              <input value={dealer.name} onChange={handleInput('name')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Arun Verma" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Company Name*
              <input value={dealer.companyName} onChange={handleInput('companyName')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Kanak Gold Traders" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Contact Person
              <input value={dealer.contactPerson} onChange={handleInput('contactPerson')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Suresh Gupta" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Mobile Number*
              <input value={dealer.mobileNumber} onChange={handleInput('mobileNumber')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="9876543210" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Alternate Number
              <input value={dealer.alternateMobileNumber} onChange={handleInput('alternateMobileNumber')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="9876501234" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Email Address
              <input value={dealer.emailAddress} onChange={handleInput('emailAddress')} type="email" className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="dealer@example.com" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              GST Number
              <input value={dealer.gstNumber} onChange={handleInput('gstNumber')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="27ABCDE1234F1Z5" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              PAN Number
              <input value={dealer.panNumber} onChange={handleInput('panNumber')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="ABCDE1234F" />
            </label>
          </div>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Address
            <textarea value={dealer.address} onChange={handleInput('address')} rows={3} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Shop No. 12, Gold Market, Jaipur"></textarea>
          </label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              City
              <input value={dealer.city} onChange={handleInput('city')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Jaipur" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              State
              <input value={dealer.state} onChange={handleInput('state')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Rajasthan" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Pincode
              <input value={dealer.pincode} onChange={handleInput('pincode')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="302001" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Business Type
              <input value={dealer.businessType} onChange={handleInput('businessType')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Supplier / Dealer" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Status
              <select value={dealer.status} onChange={handleInput('status')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Bank Name
              <input value={dealer.bankName} onChange={handleInput('bankName')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="State Bank of India" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Account Number
              <input value={dealer.accountNumber} onChange={handleInput('accountNumber')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="123456789012" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              IFSC Code
              <input value={dealer.ifscCode} onChange={handleInput('ifscCode')} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="SBIN0001234" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Opening Balance
              <input value={dealer.openingBalance ?? ''} onChange={handleInput('openingBalance')} type="number" min="0" className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="0" />
            </label>
          </div>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Notes
            <textarea value={dealer.notes} onChange={handleInput('notes')} rows={3} className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Add any internal notes for this dealer."></textarea>
          </label>
        </div>

        <div className="space-y-6">
          <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Dealer Identity</p>
                <p className="mt-2 text-sm text-slate-500">Auto generated dealer code and profile image.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-200 p-4 text-center">
              {previewUrl ? (
                <img src={previewUrl} alt="dealer profile" className="mx-auto h-40 w-40 rounded-3xl object-cover" />
              ) : (
                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                  <ImagePlus className="w-10 h-10" />
                </div>
              )}
              <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">
                Upload Profile Image
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-600">
              <p className="font-semibold text-slate-800">Important</p>
              <p className="mt-2">Dealer ID will be generated automatically when you save. Use this profile section for quick dealer reference and mobile connections.</p>
            </div>
          </div>

          <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">Save Changes</p>
            <div className="mt-6 flex flex-col gap-3">
              <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                <Save className="w-4 h-4" /> {id ? 'Update Dealer' : 'Create Dealer'}
              </button>
              <button type="button" onClick={() => navigate('/admin/dealers')} className="rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

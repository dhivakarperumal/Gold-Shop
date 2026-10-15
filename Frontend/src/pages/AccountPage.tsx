import { useEffect, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

type AccountSection = 'orders' | 'addresses' | 'profile' | 'password';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  createdAt: string;
}

interface OrderDetails extends Order {
  address: {
    addressLine1: string;
    addressLine2: string;
    pincode: string;
    city: string;
    state: string;
  };
  items: {
    productId: string | null;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

interface SavedAddress {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  city: string;
  state: string;
  isDefault: boolean;
}

type AddressFields = Omit<SavedAddress, 'id' | 'isDefault'> & { isDefault: boolean };

const emptyAddress: AddressFields = {
  fullName: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  pincode: '',
  city: '',
  state: '',
  isDefault: false,
};

const sections: { id: AccountSection; label: string; Icon: typeof UserRound }[] = [
  { id: 'orders', label: 'My Orders', Icon: ClipboardList },
  { id: 'addresses', label: 'My Addresses', Icon: MapPin },
  { id: 'profile', label: 'Profile Details', Icon: UserRound },
  { id: 'password', label: 'Change Password', Icon: KeyRound },
];

const fieldClassName =
  'mt-1.5 w-full rounded-xl border border-[#eadfd2] bg-white px-3.5 py-3 text-sm text-[#382a26] outline-none transition placeholder:text-gray-400 focus:border-[#a66b20] focus:ring-2 focus:ring-[#f4c35e]/20';

function errorMessage(error: unknown, fallback: string) {
  return isAxiosError(error) && typeof error.response?.data?.message === 'string'
    ? error.response.data.message
    : fallback;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string) {
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(value);
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();
  const colors = normalizedStatus.includes('deliver')
    ? 'bg-emerald-100 text-emerald-800'
    : normalizedStatus.includes('ship')
      ? 'bg-blue-100 text-blue-800'
      : normalizedStatus.includes('cancel')
        ? 'bg-red-100 text-red-800'
        : 'bg-amber-100 text-amber-800';

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${colors}`}>{status}</span>;
}

export default function AccountPage() {
  const { user, logout, setUserFromStorage } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<AccountSection>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState('');
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [addressesError, setAddressesError] = useState('');
  const [profileName, setProfileName] = useState(user?.username || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordFields, setPasswordFields] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addressEditor, setAddressEditor] = useState<{ id: number | null; fields: AddressFields } | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled([
      api.get<{ orders: Order[] }>('/orders'),
      api.get<{ addresses: SavedAddress[] }>('/addresses'),
    ]).then(([ordersResult, addressesResult]) => {
      if (!active) return;
      if (ordersResult.status === 'fulfilled') {
        setOrders(ordersResult.value.data.orders || []);
        setOrdersError('');
      } else {
        setOrdersError(errorMessage(ordersResult.reason, 'Could not load your orders.'));
      }
      if (addressesResult.status === 'fulfilled') {
        setAddresses(addressesResult.value.data.addresses || []);
        setAddressesError('');
      } else {
        setAddressesError(errorMessage(addressesResult.reason, 'Could not load your saved addresses.'));
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const refreshAddresses = async () => {
    const { data } = await api.get<{ addresses: SavedAddress[] }>('/addresses');
    setAddresses(data.addresses || []);
    setAddressesError('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openOrderDetails = async (orderId: number) => {
    setOrderDetails(null);
    setOrderDetailsError('');
    setOrderDetailsLoading(true);
    try {
      const { data } = await api.get<{ order: OrderDetails }>(`/orders/${orderId}`);
      setOrderDetails(data.order);
    } catch (error) {
      setOrderDetailsError(errorMessage(error, 'Could not load order details.'));
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileMessage('');
    try {
      const { data } = await api.put<{ user: { username: string; phone: string | null } }>('/auth/profile', {
        username: profileName,
        phone: profilePhone,
      });
      const updatedUser = { ...user!, username: data.user.username, phone: data.user.phone || '' };
      setUserFromStorage(updatedUser);
      setProfileName(updatedUser.username);
      setProfilePhone(updatedUser.phone || '');
      setProfileMessage('Your profile has been updated.');
    } catch (error) {
      setProfileError(errorMessage(error, 'Could not update your profile.'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordError('The new passwords do not match.');
      return;
    }
    setPasswordSaving(true);
    try {
      const { data } = await api.put<{ message: string }>('/auth/password', {
        currentPassword: passwordFields.currentPassword,
        newPassword: passwordFields.newPassword,
      });
      setPasswordMessage(data.message);
      setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError(errorMessage(error, 'Could not change your password.'));
    } finally {
      setPasswordSaving(false);
    }
  };

  const saveAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!addressEditor) return;
    setAddressSaving(true);
    setAddressError('');
    try {
      if (addressEditor.id) {
        await api.put(`/addresses/${addressEditor.id}`, addressEditor.fields);
      } else {
        await api.post('/addresses', addressEditor.fields);
      }
      setAddressEditor(null);
      try {
        await refreshAddresses();
      } catch (error) {
        setAddressesError(errorMessage(error, 'Address saved, but the address list could not be refreshed.'));
      }
    } catch (error) {
      setAddressError(errorMessage(error, 'Could not save this address.'));
    } finally {
      setAddressSaving(false);
    }
  };

  const deleteAddress = async (addressId: number) => {
    if (!window.confirm('Delete this saved address?')) return;
    setAddressesError('');
    try {
      await api.delete(`/addresses/${addressId}`);
      setAddresses((current) => current.filter((address) => address.id !== addressId));
      try {
        await refreshAddresses();
      } catch (error) {
        setAddressesError(errorMessage(error, 'Address deleted, but the address list could not be refreshed.'));
      }
    } catch (error) {
      setAddressesError(errorMessage(error, 'Could not delete this address.'));
    }
  };

  const openAddressEditor = (address?: SavedAddress) => {
    setAddressError('');
    setAddressEditor(address
      ? { id: address.id, fields: { ...address } }
      : { id: null, fields: { ...emptyAddress, fullName: user?.username || '', phone: user?.phone || '', email: user?.email || '', isDefault: addresses.length === 0 } });
  };

  const panelClassName = 'rounded-2xl border border-[#f0e5d5] bg-white shadow-[0_12px_40px_rgba(73,24,18,0.05)]';
  const primaryButtonClassName = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#5a1112] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#74180f] disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#381413]">
      <section className="relative overflow-hidden bg-[#4b0d0d] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(48,5,7,.95),rgba(48,5,7,.78)_48%,rgba(48,5,7,.25)),url('/page-header-banner.png')] bg-cover bg-center" />
        <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-white/75 sm:text-sm">
            <Link to="/" className="text-[#f4c35e] hover:text-white">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span aria-current="page">My Account</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f4c35e]">Your jewellery journey</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#f8dfa0] sm:text-4xl">My Account</h1>
          <p className="mt-2 max-w-xl text-sm text-white/85">Manage your profile, orders, and saved delivery addresses.</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid items-start gap-5 lg:grid-cols-[245px_minmax(0,1fr)]">
          <aside className={`${panelClassName} overflow-hidden`}>
            <div className="border-b border-[#f1e8dc] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5a1112] font-serif text-lg font-bold text-[#f8dfa0]">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#4b1715]">{user?.username || 'Customer'}</p>
                  <p className="truncate text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            <nav aria-label="Account sections" className="p-2">
              {sections.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={section === id ? 'page' : undefined}
                  onClick={() => { setSection(id); setAddressEditor(null); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${section === id ? 'bg-[#fff4df] text-[#74180f]' : 'text-gray-600 hover:bg-[#fffaf2] hover:text-[#74180f]'}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                  {section === id && <ChevronRight className="ml-auto h-4 w-4" />}
                </button>
              ))}
              <Link to="/contact" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-600 transition hover:bg-[#fffaf2] hover:text-[#74180f]">
                <CircleHelp className="h-4 w-4" /> Help &amp; Support
              </Link>
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </nav>
          </aside>

          <main className="min-w-0">
            {loading ? (
              <section role="status" className={`${panelClassName} p-10 text-center text-sm text-gray-600`}>Loading your account…</section>
            ) : (
              <>
                {section === 'orders' && (
                  <section className={`${panelClassName} overflow-hidden`}>
                    <div className="border-b border-[#f1e8dc] px-5 py-5 sm:px-6">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ad7929]">Your purchases</p>
                      <h2 className="mt-1 font-serif text-2xl font-bold text-[#5a1112]">My Orders</h2>
                    </div>
                    {ordersError ? <p role="alert" className="p-6 text-sm text-red-700">{ordersError}</p> : orders.length ? (
                      <ul className="divide-y divide-[#f1e8dc]">
                        {orders.map((order) => (
                          <li key={order.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6">
                            <div>
                              <p className="font-bold text-[#4b1715]">Order #{order.id}</p>
                              <p className="mt-1 text-xs text-gray-500">{order.orderNumber}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500"><CalendarDays className="h-4 w-4" />{formatDate(order.createdAt)}</div>
                            <StatusBadge status={order.status} />
                            <strong className="text-sm text-[#74180f]">{formatPrice(order.subtotal)}</strong>
                            <button type="button" onClick={() => void openOrderDetails(order.id)} className="rounded-lg border border-[#b98531] px-3 py-1.5 text-xs font-bold text-[#74180f] hover:bg-[#fff4df]">View Details</button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-5 py-14 text-center">
                        <Package className="mx-auto h-10 w-10 text-[#b98531]" />
                        <h3 className="mt-3 font-serif text-lg font-bold text-[#4b1715]">No orders yet</h3>
                        <p className="mt-1 text-sm text-gray-500">When you place an order, you can track it here.</p>
                        <Link to="/shop" className={`${primaryButtonClassName} mt-5`}>Explore jewellery <ArrowRight className="h-4 w-4" /></Link>
                      </div>
                    )}
                  </section>
                )}

                {section === 'addresses' && (
                  <section className={`${panelClassName} p-5 sm:p-6`}>
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ad7929]">Delivery information</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#5a1112]">My Addresses</h2></div>
                      {!addressEditor && <button type="button" onClick={() => openAddressEditor()} className={primaryButtonClassName}><Plus className="h-4 w-4" /> Add Address</button>}
                    </div>
                    {addressesError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{addressesError}</p>}
                    {addressEditor ? (
                      <form onSubmit={saveAddress} className="rounded-xl border border-[#f0e5d5] bg-[#fffdf8] p-4 sm:p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <h3 className="font-serif text-lg font-bold text-[#4b1715]">{addressEditor.id ? 'Edit address' : 'Add a new address'}</h3>
                          <button type="button" aria-label="Close address form" onClick={() => setAddressEditor(null)} className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-[#5a1112]"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {([
                            ['fullName', 'Full name', 'text'],
                            ['phone', 'Phone number', 'tel'],
                            ['email', 'Email address', 'email'],
                            ['addressLine1', 'Address line 1', 'text'],
                            ['addressLine2', 'Address line 2 (optional)', 'text'],
                            ['pincode', 'PIN code', 'text'],
                            ['city', 'City', 'text'],
                            ['state', 'State', 'text'],
                          ] as const).map(([key, label, type]) => (
                            <label key={key} className={`text-xs font-bold text-gray-600 ${key === 'addressLine1' || key === 'addressLine2' ? 'sm:col-span-2' : ''}`}>
                              {label}
                              <input
                                type={type}
                                required={!['addressLine2'].includes(key)}
                                maxLength={key === 'fullName' ? 100 : key === 'phone' ? 20 : key === 'email' ? 254 : key.startsWith('addressLine') ? 150 : key === 'city' || key === 'state' ? 80 : 10}
                                value={addressEditor.fields[key]}
                                onChange={(event) => setAddressEditor((current) => current ? { ...current, fields: { ...current.fields, [key]: event.target.value } } : current)}
                                className={fieldClassName}
                              />
                            </label>
                          ))}
                        </div>
                        <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                          <input type="checkbox" checked={addressEditor.fields.isDefault} onChange={(event) => setAddressEditor((current) => current ? { ...current, fields: { ...current.fields, isDefault: event.target.checked } } : current)} className="h-4 w-4 accent-[#74180f]" />
                          Set as my default address
                        </label>
                        {addressError && <p role="alert" className="mt-3 text-sm text-red-700">{addressError}</p>}
                        <div className="mt-5 flex justify-end gap-2">
                          <button type="button" onClick={() => setAddressEditor(null)} className="rounded-xl border border-[#eadfd2] px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-white">Cancel</button>
                          <button type="submit" disabled={addressSaving} className={primaryButtonClassName}>{addressSaving ? 'Saving…' : 'Save Address'}</button>
                        </div>
                      </form>
                    ) : addresses.length ? (
                      <ul className="grid gap-3 md:grid-cols-2">
                        {addresses.map((address) => (
                          <li key={address.id} className={`rounded-xl border p-4 ${address.isDefault ? 'border-[#b98531]' : 'border-[#f0e5d5]'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5d22]" />
                                <div><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-[#4b1715]">{address.fullName}</strong>{address.isDefault && <span className="rounded bg-[#fff1cf] px-2 py-0.5 text-[10px] font-bold text-[#805113]">Default</span>}</div>
                                  <p className="mt-2 text-xs leading-5 text-gray-600">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}<br />{address.city}, {address.state} {address.pincode}<br />{address.phone}</p>
                                </div>
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <button type="button" aria-label={`Edit address for ${address.fullName}`} onClick={() => openAddressEditor(address)} className="rounded-lg p-2 text-[#8b5d22] hover:bg-[#fff4df]"><Pencil className="h-4 w-4" /></button>
                                <button type="button" aria-label={`Delete address for ${address.fullName}`} onClick={() => void deleteAddress(address.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="rounded-xl bg-[#fffaf2] px-5 py-12 text-center">
                        <MapPin className="mx-auto h-9 w-9 text-[#b98531]" />
                        <p className="mt-3 font-semibold text-[#4b1715]">No saved addresses yet</p>
                        <p className="mt-1 text-sm text-gray-500">Add an address for a faster checkout next time.</p>
                        <button type="button" onClick={() => openAddressEditor()} className={`${primaryButtonClassName} mt-5`}><Plus className="h-4 w-4" /> Add Address</button>
                      </div>
                    )}
                  </section>
                )}

                {section === 'profile' && (
                  <section className={`${panelClassName} p-5 sm:p-6`}>
                    <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ad7929]">Your information</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#5a1112]">Profile Details</h2><p className="mt-1 text-sm text-gray-500">Update the name and phone number linked to your account.</p></div>
                    <form onSubmit={handleProfileSubmit} className="max-w-xl space-y-4">
                      <label className="block text-xs font-bold text-gray-600">Full name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} required maxLength={50} className={fieldClassName} /></label>
                      <label className="block text-xs font-bold text-gray-600">Email address<input value={user?.email || ''} readOnly className={`${fieldClassName} cursor-not-allowed bg-gray-50 text-gray-500`} /><span className="mt-1 block font-normal text-gray-400">Email changes are not available here.</span></label>
                      <label className="block text-xs font-bold text-gray-600">Phone number<input type="tel" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} maxLength={15} className={fieldClassName} /></label>
                      {profileError && <p role="alert" className="text-sm text-red-700">{profileError}</p>}
                      {profileMessage && <p role="status" className="text-sm text-emerald-700">{profileMessage}</p>}
                      <button type="submit" disabled={profileSaving} className={primaryButtonClassName}>{profileSaving ? 'Saving…' : <><Check className="h-4 w-4" /> Save Changes</>}</button>
                    </form>
                  </section>
                )}

                {section === 'password' && (
                  <section className={`${panelClassName} p-5 sm:p-6`}>
                    <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ad7929]">Account security</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#5a1112]">Change Password</h2><p className="mt-1 text-sm text-gray-500">Choose a new password with at least 8 characters.</p></div>
                    <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-4">
                      {([
                        ['currentPassword', 'Current password', false],
                        ['newPassword', 'New password', true],
                        ['confirmPassword', 'Confirm new password', true],
                      ] as const).map(([key, label, isNew]) => (
                        <label key={key} className="block text-xs font-bold text-gray-600">{label}
                          <span className="relative block">
                            <input
                              type={showPasswords ? 'text' : 'password'}
                              value={passwordFields[key]}
                              onChange={(event) => setPasswordFields((current) => ({ ...current, [key]: event.target.value }))}
                              required
                              minLength={isNew ? 8 : undefined}
                              maxLength={128}
                              autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'}
                              className={`${fieldClassName} pr-11`}
                            />
                            {key === 'currentPassword' && <button type="button" onClick={() => setShowPasswords((visible) => !visible)} aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5a1112]">{showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
                          </span>
                        </label>
                      ))}
                      {passwordError && <p role="alert" className="text-sm text-red-700">{passwordError}</p>}
                      {passwordMessage && <p role="status" className="text-sm text-emerald-700">{passwordMessage}</p>}
                      <button type="submit" disabled={passwordSaving} className={primaryButtonClassName}>{passwordSaving ? 'Updating…' : 'Update Password'}</button>
                    </form>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      {(orderDetailsLoading || orderDetailsError || orderDetails) && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !orderDetailsLoading) {
            setOrderDetails(null);
            setOrderDetailsError('');
          }
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="order-details-title" className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ad7929]">Order information</p><h2 id="order-details-title" className="mt-1 font-serif text-xl font-bold text-[#5a1112]">Order Details</h2></div>
              <button type="button" aria-label="Close order details" disabled={orderDetailsLoading} onClick={() => { setOrderDetails(null); setOrderDetailsError(''); }} className="rounded-lg p-2 text-gray-500 hover:bg-[#fff4df] hover:text-[#5a1112] disabled:opacity-50"><X className="h-5 w-5" /></button>
            </div>
            {orderDetailsLoading ? <p role="status" className="py-10 text-center text-sm text-gray-500">Loading order details…</p>
              : orderDetailsError ? <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{orderDetailsError}</p>
                : orderDetails && (
                  <>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fffaf2] p-4">
                      <div><p className="font-bold text-[#4b1715]">Order #{orderDetails.id}</p><p className="mt-1 text-xs text-gray-500">{orderDetails.orderNumber} · {formatDate(orderDetails.createdAt)}</p></div>
                      <StatusBadge status={orderDetails.status} />
                    </div>
                    <h3 className="mt-5 font-serif font-bold text-[#4b1715]">Items</h3>
                    <ul className="mt-2 divide-y divide-[#f1e8dc] rounded-xl border border-[#f0e5d5]">
                      {orderDetails.items.map((item, index) => (
                        <li key={`${item.productId || item.productName}-${index}`} className="flex items-center justify-between gap-3 p-3">
                          <div><p className="text-sm font-semibold text-[#4b1715]">{item.productName}</p><p className="mt-1 text-xs text-gray-500">Qty {item.quantity} · {formatPrice(item.unitPrice)} each</p></div>
                          <strong className="shrink-0 text-sm text-[#74180f]">{formatPrice(item.lineTotal)}</strong>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div><h3 className="font-serif font-bold text-[#4b1715]">Delivery address</h3><p className="mt-1 text-sm leading-5 text-gray-600">{orderDetails.address.addressLine1}{orderDetails.address.addressLine2 ? `, ${orderDetails.address.addressLine2}` : ''}, {orderDetails.address.city}, {orderDetails.address.state} {orderDetails.address.pincode}</p></div>
                      <div className="shrink-0 text-right"><p className="text-xs text-gray-500">Order total</p><strong className="mt-1 block text-lg text-[#74180f]">{formatPrice(orderDetails.subtotal)}</strong></div>
                    </div>
                  </>
                )}
          </section>
        </div>
      )}
    </div>
  );
}

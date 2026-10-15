import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { ArrowLeft, ArrowRight, CreditCard, LockKeyhole, MapPin, ShieldCheck, Truck } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/CommonComponents/PageHeader.jsx';
import { useAuth } from '../context/AuthContext';
import { useStoreCart } from '../context/useStoreCart';

type DeliveryOption = 'standard' | 'express';
type PaymentOption = 'contact' | 'cod';

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

type CheckoutFields = Omit<SavedAddress, 'id' | 'isDefault'>;

const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(price);

const fieldClassName = 'mt-1.5 w-full rounded-md border border-[#e8dfd5] bg-white px-3 py-2.5 text-sm text-[#382a26] outline-none transition placeholder:text-gray-400 focus:border-[#a66b20] focus:ring-2 focus:ring-[#f4c35e]/20';

export default function CheckoutPage() {
  const { items, itemCount, subtotal, savings, clearCart, isLoading: cartLoading, error: cartError } = useStoreCart();
  const { user } = useAuth();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [delivery, setDelivery] = useState<DeliveryOption>('standard');
  const [payment, setPayment] = useState<PaymentOption>('contact');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{ orderNumber: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [checkoutFields, setCheckoutFields] = useState<CheckoutFields>({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    city: '',
    state: '',
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!user) {
      setSavedAddresses([]);
      setSelectedAddressId(null);
      return;
    }
    let active = true;
    setAddressLoading(true);
    api.get<{ addresses: SavedAddress[] }>('/addresses')
      .then(({ data }) => {
        if (!active) return;
        const addresses = data.addresses || [];
        setSavedAddresses(addresses);
        const address = addresses.find((item) => item.isDefault) || addresses[0];
        if (address) {
          setSelectedAddressId(address.id);
          setCheckoutFields({
            fullName: address.fullName,
            phone: address.phone,
            email: address.email,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            pincode: address.pincode,
            city: address.city,
            state: address.state,
          });
        } else {
          setCheckoutFields((current) => ({
            ...current,
            fullName: current.fullName || user.username || '',
            phone: current.phone || user.phone || '',
            email: current.email || user.email || '',
          }));
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error('Could not load saved addresses:', error);
        setSubmitError(isAxiosError(error)
          ? error.response?.data?.message || 'Could not load your saved addresses.'
          : 'Could not load your saved addresses.');
      })
      .finally(() => {
        if (active) setAddressLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const updateAddressField = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    if (name in checkoutFields) {
      setCheckoutFields((current) => ({ ...current, [name]: value }));
    }
  };

  const fetchLiveLocation = async () => {
    if (!navigator.geolocation) {
      setLocationMessage('Live location is not supported by this browser. Please enter your address manually.');
      return;
    }

    setLocationLoading(true);
    setLocationMessage('Requesting your location permission…');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        });
      });
      const { latitude, longitude } = position.coords;
      const query = new URLSearchParams({
        format: 'jsonv2',
        addressdetails: '1',
        zoom: '18',
        lat: String(latitude),
        lon: String(longitude),
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Address lookup failed (${response.status}). Please enter your address manually.`);
      }

      const result = await response.json() as {
        address?: Record<string, string>;
        display_name?: string;
      };
      if (!result.address) {
        throw new Error('No postal address was found for your location. Please enter your address manually.');
      }

      const address = result.address;
      const street = [address.house_number, address.road].filter(Boolean).join(' ');
      const locality = [
        address.neighbourhood,
        address.suburb,
        address.quarter,
        address.residential,
      ].find((value) => value && value !== address.road);
      const city = address.city || address.town || address.village || address.municipality || address.county || '';

      setCheckoutFields((current) => ({
        addressLine1: street || address.road || result.display_name || current.addressLine1,
        addressLine2: locality || current.addressLine2,
        pincode: address.postcode || current.pincode,
        city: city || current.city,
        state: address.state || current.state,
        fullName: current.fullName,
        phone: current.phone,
        email: current.email,
      }));
      setSelectedAddressId(null);
      setLocationMessage('Address found. Please review it and fill in any missing details before continuing.');
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'number') {
        const messages: Record<number, string> = {
          1: 'Location permission was denied. Allow location access in your browser or enter your address manually.',
          2: 'Your location could not be determined. Please try again or enter your address manually.',
          3: 'Location request timed out. Please try again or enter your address manually.',
        };
        setLocationMessage(messages[error.code] || 'Could not fetch your location. Please enter your address manually.');
      } else {
        setLocationMessage(error instanceof Error ? error.message : 'Could not look up your address. Please enter it manually.');
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const selectSavedAddress = (event: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(event.currentTarget.value);
    if (!id) {
      setSelectedAddressId(null);
      return;
    }
    const address = savedAddresses.find((item) => item.id === id);
    if (!address) return;
    setSelectedAddressId(address.id);
    setCheckoutFields({
      fullName: address.fullName,
      phone: address.phone,
      email: address.email,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      pincode: address.pincode,
      city: address.city,
      state: address.state,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setSubmitError('Please sign in before placing your order.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');

    try {
      const addressPayload = {
        ...checkoutFields,
        isDefault: selectedAddressId != null
          && savedAddresses.find((address) => address.id === selectedAddressId)?.isDefault === true,
      };
      const addressResponse = selectedAddressId
        ? await api.put<{ address: SavedAddress }>(`/addresses/${selectedAddressId}`, addressPayload)
        : await api.post<{ address: SavedAddress }>('/addresses', addressPayload);
      const addressId = addressResponse.data.address.id;

      await api.put('/cart', {
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
      });
      const { data } = await api.post<{ order: { orderNumber: string } }>('/orders', {
        addressId,
        deliveryOption: delivery,
        paymentMethod: payment,
      });

      setCompletedOrder({ orderNumber: data.order.orderNumber });
      setSubmitMessage(`Order ${data.order.orderNumber} was placed successfully.`);
      clearCart();
    } catch (error: unknown) {
      console.error('Could not place order:', error);
      setSubmitError(isAxiosError(error)
        ? error.response?.data?.message || 'Could not place your order. Please try again.'
        : 'Could not place your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const continueCheckout = () => {
    if (checkoutStep === 1 && !formRef.current?.reportValidity()) return;
    setCheckoutStep((step) => Math.min(3, step + 1));
    setSubmitMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const previousCheckoutStep = () => {
    setCheckoutStep((step) => Math.max(1, step - 1));
    setSubmitMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (completedOrder) {
    return (
      <div className="min-h-screen bg-[#fffdf8] text-[#381413]">
        <PageHeader breadcrumb="Order placed" title="Thank you" description="Your order has been saved." className="flex h-[300px] items-center" contentClassName="py-4" titleClassName="text-4xl sm:text-5xl" />
        <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800"><ShieldCheck className="h-8 w-8" /></span>
          <h2 className="mt-5 font-serif text-2xl font-bold text-[#5a1112]">Order placed successfully</h2>
          <p className="mt-2 text-sm text-gray-600">Your order number is <strong>{completedOrder.orderNumber}</strong>. The shop team will contact you to confirm your order.</p>
          <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#74180f] px-5 py-3 text-sm font-bold text-white hover:bg-[#5a1112]">Continue shopping <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#fffdf8] text-[#381413]">
        <PageHeader breadcrumb="Checkout" title="Checkout" description="Loading your cart." className="flex h-[300px] items-center" contentClassName="py-4" titleClassName="text-4xl sm:text-5xl" />
        <p role="status" className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-gray-600">Loading your cart…</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-[#fffdf8] text-[#381413]">
        <PageHeader breadcrumb="Checkout" title="Checkout" description="Complete your delivery details to request your order." className="flex h-[300px] items-center" contentClassName="py-4" titleClassName="text-4xl sm:text-5xl" />
        <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
          <h2 className="font-serif text-2xl font-bold text-[#5a1112]">{cartError ? 'Your cart could not be loaded' : 'Your cart is empty'}</h2>
          <p className="mt-2 text-sm text-gray-600">{cartError || 'Add jewellery to your cart before continuing to checkout.'}</p>
          <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#74180f] px-5 py-3 text-sm font-bold text-white hover:bg-[#5a1112]">Explore jewellery <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#381413]">
      <PageHeader breadcrumb="Checkout" title="Checkout" description="Share your delivery details and our team will confirm your order securely." className="flex h-[300px] items-center" contentClassName="py-4" titleClassName="text-4xl sm:text-5xl" />
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <ol aria-label="Checkout progress" className="mb-6 grid grid-cols-3 rounded-xl border border-[#f0e5d5] bg-white p-3 text-center text-[10px] font-semibold sm:mb-8 sm:p-4 sm:text-sm">
          {(['Delivery details', 'Delivery & payment', 'Review request'] as const).map((label, index) => {
            const step = index + 1;
            const isCurrent = checkoutStep === step;
            const isComplete = checkoutStep > step;
            return (
              <li key={label} className={isCurrent || isComplete ? 'text-[#74180f]' : 'text-gray-500'}>
                <button
                  type="button"
                  onClick={() => {
                    if (isComplete) setCheckoutStep(step);
                  }}
                  disabled={!isComplete}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`flex w-full items-center justify-center gap-1.5 rounded-md ${isComplete ? 'cursor-pointer hover:bg-[#fff8ec]' : 'cursor-default'}`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isCurrent || isComplete ? 'bg-[#74180f] text-white' : 'border border-[#d8cabb]'}`}>
                    {isComplete ? '✓' : step}
                  </span>
                  <span>{label}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <form ref={formRef} onSubmit={handleSubmit} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.8fr)] lg:gap-6">
          <div className="space-y-5">
            {checkoutStep === 1 && (
            <section className="rounded-xl border border-[#f0e5d5] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#74180f]" />
                <div><h2 className="font-serif text-lg font-bold text-[#5a1112]">1. Shipping Address</h2><p className="text-xs text-gray-500">Enter the address where you would like your jewellery delivered.</p></div>
              </div>
              <button type="button" onClick={fetchLiveLocation} disabled={locationLoading} className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-[#b98531] px-3 py-2 text-xs font-bold text-[#74180f] transition hover:bg-[#fff8ec] disabled:cursor-wait disabled:opacity-60">
                <MapPin className="h-4 w-4" />{locationLoading ? 'Finding your location…' : 'Use my live location'}
              </button>
              </div>
              {user && savedAddresses.length > 0 && (
                <label className="mb-4 block text-xs font-semibold text-[#4a3029]">
                  Use a saved address
                  <select
                    value={selectedAddressId ?? ''}
                    onChange={selectSavedAddress}
                    disabled={addressLoading}
                    className={fieldClassName}
                  >
                    <option value="">Enter a new address</option>
                    {savedAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.fullName} — {address.addressLine1}, {address.city}
                        {address.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {addressLoading && <p role="status" className="mb-3 text-xs text-gray-500">Loading saved addresses…</p>}
              {locationMessage && <p role="status" aria-live="polite" className="mb-4 rounded-md bg-[#fff8ec] px-3 py-2 text-xs leading-5 text-[#5a1112]">{locationMessage}</p>}
              <p className="mb-4 text-[10px] leading-4 text-gray-500">When you request an address lookup, your browser shares your location with <a href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer" className="font-semibold text-[#74180f] underline">OpenStreetMap</a>. Review the filled address before using it.</p>
              <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-[#4a3029]">Full name <span className="text-red-700">*</span><input required name="fullName" value={checkoutFields.fullName} onChange={updateAddressField} autoComplete="name" maxLength={100} className={fieldClassName} placeholder="Your full name" /></label>
              <label className="text-xs font-semibold text-[#4a3029]">Phone number <span className="text-red-700">*</span><input required name="phone" type="tel" value={checkoutFields.phone} onChange={updateAddressField} autoComplete="tel" minLength={7} maxLength={20} className={fieldClassName} placeholder="+91 98765 43210" /></label>
              <label className="text-xs font-semibold text-[#4a3029] sm:col-span-2">Email address <span className="text-red-700">*</span><input required name="email" type="email" value={checkoutFields.email} onChange={updateAddressField} autoComplete="email" maxLength={254} className={fieldClassName} placeholder="you@example.com" /></label>
              <label className="text-xs font-semibold text-[#4a3029] sm:col-span-2">Address line 1 <span className="text-red-700">*</span><input required name="addressLine1" value={checkoutFields.addressLine1} onChange={updateAddressField} autoComplete="address-line1" maxLength={150} className={fieldClassName} placeholder="House number, building, street" /></label>
              <label className="text-xs font-semibold text-[#4a3029] sm:col-span-2">Address line 2 <span className="font-normal text-gray-400">(optional)</span><input name="addressLine2" value={checkoutFields.addressLine2} onChange={updateAddressField} autoComplete="address-line2" maxLength={150} className={fieldClassName} placeholder="Area, landmark" /></label>
              <label className="text-xs font-semibold text-[#4a3029]">Pincode <span className="text-red-700">*</span><input required name="pincode" value={checkoutFields.pincode} onChange={updateAddressField} autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} className={fieldClassName} placeholder="6-digit pincode" /></label>
              <label className="text-xs font-semibold text-[#4a3029]">City <span className="text-red-700">*</span><input required name="city" value={checkoutFields.city} onChange={updateAddressField} autoComplete="address-level2" maxLength={80} className={fieldClassName} placeholder="City" /></label>
              <label className="text-xs font-semibold text-[#4a3029] sm:col-span-2">State <span className="text-red-700">*</span><input required name="state" value={checkoutFields.state} onChange={updateAddressField} autoComplete="address-level1" maxLength={80} className={fieldClassName} placeholder="State" /></label>
              </div>
            </section>
            )}

            {checkoutStep === 2 && (
              <>
            <fieldset className="rounded-xl border border-[#f0e5d5] bg-white p-4 shadow-sm sm:p-6">
              <legend className="sr-only">Delivery option</legend>
              <div className="mb-4 flex items-start gap-3"><Truck className="mt-0.5 h-5 w-5 text-[#74180f]" /><div><h2 className="font-serif text-lg font-bold text-[#5a1112]">2. Delivery Option</h2><p className="text-xs text-gray-500">Our team will confirm availability and timing.</p></div></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  ['standard', 'Standard delivery', 'Insured delivery. Timing confirmed by our team.', 'Free'],
                  ['express', 'Express delivery', 'Availability and timing confirmed after your request.', 'Confirm with team'],
                ] as const).map(([value, title, description, cost]) => (
                  <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${delivery === value ? 'border-[#8a2520] bg-[#fffaf6]' : 'border-[#eadfd2] hover:border-[#c99a52]'}`}>
                    <input type="radio" name="delivery" value={value} checked={delivery === value} onChange={() => setDelivery(value)} className="mt-1 accent-[#74180f]" />
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{title}</span><span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span><span className="mt-1 block text-xs font-bold text-emerald-700">{cost}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="rounded-xl border border-[#f0e5d5] bg-white p-4 shadow-sm sm:p-6">
              <legend className="sr-only">Payment preference</legend>
              <div className="mb-4 flex items-start gap-3"><CreditCard className="mt-0.5 h-5 w-5 text-[#74180f]" /><div><h2 className="font-serif text-lg font-bold text-[#5a1112]">3. Payment Preference</h2><p className="text-xs text-gray-500">No payment is collected on this page. Our team will confirm payment options.</p></div></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  ['contact', 'Arrange with the team', 'We will contact you to confirm secure payment options.'],
                  ['cod', 'Request cash on delivery', 'Subject to product, delivery area, and team confirmation.'],
                ] as const).map(([value, title, description]) => (
                  <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${payment === value ? 'border-[#8a2520] bg-[#fffaf6]' : 'border-[#eadfd2] hover:border-[#c99a52]'}`}>
                    <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} className="mt-1 accent-[#74180f]" />
                    <span><span className="block text-sm font-bold">{title}</span><span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
              </>
            )}

            {checkoutStep === 3 && (
              <section className="rounded-xl border border-[#f0e5d5] bg-white p-4 shadow-sm sm:p-6">
                <h2 className="font-serif text-lg font-bold text-[#5a1112]">3. Review Your Order Request</h2>
                <p className="mt-1 text-xs text-gray-500">Check your delivery and payment preferences before sending the request.</p>
                <div className="mt-5 rounded-lg bg-[#fffaf2] p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#4a3029]">Delivery address</h3>
                      <p className="mt-2 font-semibold">{checkoutFields.fullName}</p>
                      <p className="text-gray-600">{checkoutFields.phone} · {checkoutFields.email}</p>
                      <p className="mt-1 whitespace-pre-line text-gray-600">{[checkoutFields.addressLine1, checkoutFields.addressLine2, `${checkoutFields.city}, ${checkoutFields.state} ${checkoutFields.pincode}`].filter(Boolean).join('\n')}</p>
                    </div>
                    <button type="button" onClick={() => setCheckoutStep(1)} className="text-xs font-bold text-[#74180f] underline">Edit</button>
                  </div>
                  <div className="mt-4 border-t border-[#eadfd2] pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[#4a3029]">Delivery & payment</h3>
                        <p className="mt-1 text-gray-600">{delivery === 'standard' ? 'Standard delivery' : 'Express delivery (to be confirmed)'}</p>
                        <p className="mt-1 text-gray-600">{payment === 'cod' ? 'Cash on delivery (subject to confirmation)' : 'Arrange payment with the team'}</p>
                      </div>
                      <button type="button" onClick={() => setCheckoutStep(2)} className="text-xs font-bold text-[#74180f] underline">Edit</button>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-gray-600">Placing the order records it in your account and reserves the available stock. No payment is collected on this page.</p>
              </section>
            )}

            {checkoutStep < 3 && (
              <div className="flex items-center justify-between gap-3">
                {checkoutStep === 2 ? (
                  <button type="button" onClick={previousCheckoutStep} className="inline-flex items-center gap-2 rounded-lg border border-[#eadfd2] bg-white px-4 py-3 text-sm font-semibold text-[#5a1112] hover:bg-[#fff8ec]"><ArrowLeft className="h-4 w-4" /> Back</button>
                ) : <span />}
                <button type="button" onClick={continueCheckout} className="inline-flex items-center gap-2 rounded-lg bg-[#74180f] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#5a1112]">
                  {checkoutStep === 1 ? 'Continue to delivery & payment' : 'Continue to review'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {checkoutStep === 3 && (
              <button type="button" onClick={previousCheckoutStep} className="inline-flex items-center gap-2 rounded-lg border border-[#eadfd2] bg-white px-4 py-3 text-sm font-semibold text-[#5a1112] hover:bg-[#fff8ec]"><ArrowLeft className="h-4 w-4" /> Back to delivery & payment</button>
            )}
          </div>

          <aside className="rounded-xl border border-[#f0e5d5] bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-28">
            <div className="flex items-center justify-between gap-3 border-b border-[#f0e5d5] pb-4">
              <h2 className="font-serif text-lg font-bold text-[#5a1112]">Order Summary <span className="text-sm font-medium text-gray-500">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span></h2>
              <Link to="/cart" className="shrink-0 text-xs font-semibold text-[#74180f] underline underline-offset-2">Edit Cart</Link>
            </div>
            <ul className="max-h-72 divide-y divide-[#f3ece3] overflow-y-auto">
              {items.map(({ product, quantity }) => {
                const unitPrice = product.offerPrice > 0 ? product.offerPrice : product.price;
                return <li key={product.id} className="flex gap-3 py-3"><img src={product.image} alt="" className="h-14 w-14 shrink-0 rounded-md bg-[#fff8ed] object-cover" /><div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-bold text-[#382a26]">{product.name}</p><p className="mt-1 text-[10px] text-gray-500">{[product.purity, product.weight ? `${product.weight} ${product.weightUnit}` : ''].filter(Boolean).join(' · ')}</p><p className="text-[10px] text-gray-500">Qty: {quantity}</p></div><span className="shrink-0 text-xs font-bold text-[#74180f]">{formatPrice(unitPrice * quantity)}</span></li>;
              })}
            </ul>
            <div className="space-y-2 border-t border-[#f0e5d5] pt-4 text-xs">
              <div className="flex justify-between gap-3 text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal + savings)}</span></div>
              {savings > 0 && <div className="flex justify-between gap-3 text-emerald-700"><span>Discount</span><span>− {formatPrice(savings)}</span></div>}
              <div className="flex justify-between gap-3 text-gray-600"><span>Shipping</span><span className="font-semibold text-emerald-700">{delivery === 'standard' ? 'Free' : 'To be confirmed'}</span></div>
              <div className="flex justify-between gap-3 text-gray-600"><span>Taxes</span><span>Confirmed by team</span></div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-[#fff8ec] p-3"><span className="font-serif text-sm font-bold text-[#5a1112]">Estimated total</span><span className="text-lg font-extrabold text-[#74180f]">{formatPrice(subtotal)}</span></div>
            <p className="mt-2 text-right text-[10px] leading-4 text-gray-500">Final taxes and delivery charges, if any, are confirmed before purchase.</p>
            <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-[10px] leading-4 text-emerald-900"><p className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4 shrink-0" /> Secure order</p><p className="mt-1">Your saved cart and delivery address will be submitted to the shop. No payment is taken now.</p></div>
            {checkoutStep === 3 && !user && <p className="mt-4 rounded-lg bg-[#fff8ec] p-3 text-xs leading-5 text-[#5a1112]">Please <Link to="/login" className="font-bold underline">sign in</Link> to save your address and place this order.</p>}
            {checkoutStep === 3 && <button type="submit" disabled={!user || submitting} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#74180f] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#5a1112] disabled:cursor-not-allowed disabled:opacity-60"><LockKeyhole className="h-4 w-4" /> {submitting ? 'Placing order…' : 'Place Order'} {!submitting && <ArrowRight className="h-4 w-4" />}</button>}
            {submitError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-800">{submitError}</p>}
            {submitMessage && <p role="status" className="mt-3 text-xs leading-5 text-[#5a1112]">{submitMessage}</p>}
            <p className="mt-3 text-center text-[10px] leading-4 text-gray-500">Order placement checks current prices and available stock. Taxes, delivery charges, and payment are confirmed by the shop team.</p>
          </aside>
        </form>
        <Link to="/cart" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#74180f] hover:text-[#ad7929]"><ArrowLeft className="h-4 w-4" /> Return to cart</Link>
      </main>
    </div>
  );
}

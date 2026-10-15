import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/CommonComponents/PageHeader.jsx';
import { useStoreCart } from '../context/useStoreCart';

const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(price);

export default function CartPage() {
  const { items, itemCount, subtotal, savings, updateQuantity, removeItem } = useStoreCart();

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#381413]">
      <PageHeader
        breadcrumb="My Cart"
        title="My Cart"
        description="Review your selected jewellery before checkout."
        className="flex h-[300px] items-center"
        contentClassName="py-4"
        titleClassName="text-4xl sm:text-5xl"
      />

      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {!items.length ? (
          <section className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-[#f0e5d5] bg-white px-6 py-12 text-center shadow-[0_12px_40px_rgba(73,24,18,0.06)] sm:py-16">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4df] text-[#8b5d22]">
              <ShoppingBag className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-serif text-2xl font-bold text-[#5a1112]">Your cart is waiting for something special</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">Explore our collection and add a piece you’ll treasure.</p>
            <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#5a1112] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#74180f]">
              Explore jewellery <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ad7929]">Your selection</p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-[#5a1112]">Shopping Cart <span className="text-base font-medium text-gray-500">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span></h2>
              </div>
              <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7a321e] transition hover:text-[#ad7929]">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Continue shopping
              </Link>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[1.7fr_0.8fr]">
              <section aria-label="Cart items" className="overflow-hidden rounded-2xl border border-[#f0e5d5] bg-white shadow-[0_12px_40px_rgba(73,24,18,0.05)]">
                <div className="hidden grid-cols-[minmax(0,1fr)_110px_135px_110px_40px] items-center gap-4 border-b border-[#f0e5d5] bg-[#fffaf2] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#806c5e] md:grid">
                  <span>Jewellery</span><span>Price</span><span>Quantity</span><span className="text-right">Total</span><span />
                </div>
                <ul className="divide-y divide-[#f1e8dc]">
                  {items.map(({ product, quantity }) => {
                    const price = product.offerPrice > 0 ? product.offerPrice : product.price;
                    return (
                      <li key={product.id} className="relative grid gap-3 p-4 sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-5 sm:p-5 md:grid-cols-[100px_minmax(0,1fr)_110px_135px_110px_40px] md:items-center">
                        <Link to={`/product/${product.id}`} className="h-24 w-24 overflow-hidden rounded-xl bg-[#fff8ed]">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </Link>
                        <div className="min-w-0">
                          <Link to={`/product/${product.id}`} className="font-serif text-base font-bold text-[#4b1715] hover:text-[#9c6a27]">{product.name}</Link>
                          <p className="mt-1 text-xs text-gray-500">{[product.purity, product.weight ? `${product.weight} ${product.weightUnit}` : '', product.category].filter(Boolean).join(' · ')}</p>
                          <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                            <Check className="h-3 w-3" aria-hidden="true" /> Available to order
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-3 md:hidden">
                            <span className="text-sm font-bold text-[#74180f]">{formatPrice(price)}</span>
                            <div className="flex items-center rounded-lg border border-[#eadfd2]">
                              <button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => updateQuantity(product.id, quantity - 1)} className="p-2 text-[#5a1112] hover:bg-[#fff4df]">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-8 text-center text-xs font-bold" aria-live="polite">{quantity}</span>
                              <button type="button" aria-label={`Increase ${product.name} quantity`} disabled={quantity >= product.stock} onClick={() => updateQuantity(product.id, quantity + 1)} className="p-2 text-[#5a1112] hover:bg-[#fff4df] disabled:cursor-not-allowed disabled:opacity-40">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-[#74180f]">{formatPrice(price * quantity)}</span>
                          </div>
                        </div>
                        <span className="hidden text-sm font-semibold text-[#5b4a43] md:block">{formatPrice(price)}</span>
                        <div className="hidden items-center rounded-lg border border-[#eadfd2] md:flex">
                          <button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => updateQuantity(product.id, quantity - 1)} className="p-2 text-[#5a1112] hover:bg-[#fff4df]">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-xs font-bold" aria-live="polite">{quantity}</span>
                          <button type="button" aria-label={`Increase ${product.name} quantity`} disabled={quantity >= product.stock} onClick={() => updateQuantity(product.id, quantity + 1)} className="p-2 text-[#5a1112] hover:bg-[#fff4df] disabled:cursor-not-allowed disabled:opacity-40">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="hidden text-right text-sm font-bold text-[#74180f] md:block">{formatPrice(price * quantity)}</span>
                        <button type="button" aria-label={`Remove ${product.name} from cart`} onClick={() => removeItem(product.id)} className="hidden justify-self-end rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-700 md:inline-flex">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label={`Remove ${product.name} from cart`} onClick={() => removeItem(product.id)} className="absolute right-5 top-5 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-700 sm:right-6 sm:top-6 md:hidden">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <aside className="rounded-2xl border border-[#f0e5d5] bg-white p-5 shadow-[0_12px_40px_rgba(73,24,18,0.06)] sm:p-6 lg:sticky lg:top-32">
                <h2 className="font-serif text-xl font-bold text-[#5a1112]">Order Summary</h2>
                <div className="mt-5 space-y-3 border-b border-[#f0e5d5] pb-5 text-sm">
                  <div className="flex justify-between gap-3 text-gray-600"><span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span><span className="font-semibold text-[#3e312d]">{formatPrice(subtotal + savings)}</span></div>
                  {savings > 0 && <div className="flex justify-between gap-3 text-emerald-700"><span>Offer savings</span><span className="font-semibold">− {formatPrice(savings)}</span></div>}
                  <div className="flex justify-between gap-3 text-gray-600"><span>Shipping</span><span className="font-semibold text-emerald-700">Free</span></div>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3 rounded-xl bg-[#fff8ec] p-4">
                  <span className="font-serif text-base font-bold text-[#5a1112]">Total</span>
                  <span className="text-xl font-extrabold text-[#74180f]">{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-2 text-right text-[11px] text-gray-500">Final taxes, if applicable, confirmed at purchase.</p>
                <Link to="/checkout" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#74180f] px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-[#5a1112]/15 transition hover:bg-[#5a1112]">
                  Continue to checkout <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <div className="mt-4 space-y-2 border-t border-[#f0e5d5] pt-4 text-xs text-gray-600">
                  <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#b98531]" aria-hidden="true" /> Delivery details confirmed by our team</p>
                  <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#b98531]" aria-hidden="true" /> Contact us for product and hallmark details</p>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

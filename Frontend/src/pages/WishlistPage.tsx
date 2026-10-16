import { ArrowRight, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/CommonComponents/PageHeader.jsx';
import { useAuth } from '../context/AuthContext';
import { useStoreCart } from '../context/useStoreCart';
import { useWishlist } from '../context/useWishlist';

const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(price);

export default function WishlistPage() {
  const { items, isLoading, error, refresh, removeItem } = useWishlist();
  const { addItem, error: cartError } = useStoreCart();
  const { user, isLoading: isAuthLoading } = useAuth();

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#381413]">
      <PageHeader
        breadcrumb="My Wishlist"
        title="My Wishlist"
        description="Keep the jewellery you love close at hand."
        className="flex h-[300px] items-center"
        contentClassName="py-4"
        titleClassName="text-4xl sm:text-5xl"
      />

      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {cartError && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{cartError}</p>}
        {isAuthLoading || isLoading ? (
          <section role="status" className="mx-auto max-w-xl rounded-2xl border border-[#f0e5d5] bg-white px-6 py-12 text-center text-sm text-gray-600">
            Loading your wishlist…
          </section>
        ) : !user ? (
          <section className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-[#f0e5d5] bg-white px-6 py-12 text-center shadow-[0_12px_40px_rgba(73,24,18,0.06)]">
            <Heart className="h-8 w-8 text-[#8b5d22]" aria-hidden="true" />
            <h2 className="mt-4 font-serif text-2xl font-bold text-[#5a1112]">Sign in to view your wishlist</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">Your saved jewellery is linked to your account.</p>
            <Link to="/login" className="mt-6 rounded-xl bg-[#5a1112] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#74180f]">Sign in</Link>
          </section>
        ) : error ? (
          <section className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
            <p role="alert" className="text-sm text-red-800">{error}</p>
            <button type="button" onClick={() => void refresh()} className="mt-5 rounded-xl bg-[#5a1112] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#74180f]">
              Try again
            </button>
          </section>
        ) : !items.length ? (
          <section className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-[#f0e5d5] bg-white px-6 py-12 text-center shadow-[0_12px_40px_rgba(73,24,18,0.06)] sm:py-16">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4df] text-[#8b5d22]">
              <Heart className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-serif text-2xl font-bold text-[#5a1112]">Your wishlist is empty</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">Save your favourite designs here and come back to them anytime.</p>
            <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#5a1112] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#74180f]">
              Explore jewellery <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ad7929]">Saved for later</p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-[#5a1112]">
                  Favourite Designs <span className="text-base font-medium text-gray-500">({items.length})</span>
                </h2>
              </div>
              <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7a321e] transition hover:text-[#ad7929]">
                Continue shopping <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => {
                const price = product.offerPrice > 0 ? product.offerPrice : product.price;
                return (
                  <li key={product.id} className="overflow-hidden rounded-2xl border border-[#f0e5d5] bg-white shadow-sm">
                    <Link to={`/product/${product.id}`} className="block aspect-square bg-[#fff8ed]">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#ad7929]"><Heart className="h-10 w-10" /></div>
                      )}
                    </Link>
                    <div className="p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#ad7929]">{product.category || 'Fine Jewellery'}</p>
                      <Link to={`/product/${product.id}`} className="mt-1 block font-serif font-bold text-[#4b1715] hover:text-[#9c6a27]">{product.name}</Link>
                      <p className="mt-2 text-lg font-extrabold text-[#74180f]">{formatPrice(price)}</p>
                      {product.offerPrice > 0 && product.offerPrice < product.price && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
                      )}
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          disabled={product.stock <= 0}
                          onClick={() => void addItem(product)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#5a1112] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#74180f] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                          {product.stock > 0 ? 'Add to cart' : 'Out of stock'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          aria-label={`Remove ${product.name} from wishlist`}
                          className="rounded-lg border border-[#eadfd2] p-2.5 text-[#74180f] transition hover:bg-[#fff4df]"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

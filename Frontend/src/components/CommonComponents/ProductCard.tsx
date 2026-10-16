import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Crown, ShieldCheck, Heart, Star, Gem, Eye, ShoppingCart, Truck, RotateCcw, Sparkles, Tag, TrendingUp, X } from 'lucide-react';
import type { CartProduct } from '../../context/StoreCartContext';
import { useStoreCart } from '../../context/useStoreCart';
import { useWishlist } from '../../context/useWishlist';

export interface Product {
  id: number;
  productId: string;
  name: string;
  category: string;
  subCategory: string;
  brand: string;
  purity: string;
  hallmark: boolean;
  weight: number;
  weightUnit: string;
  price: number;
  offerPrice: number;
  discount: number;
  rating?: number;
  reviewCount?: number;
  certificate?: string;
  shipping?: {
    freeShipping?: boolean;
    insuredShipping?: boolean;
  };
  returnPolicy?: {
    returnAvailable?: boolean;
    returnDays?: number;
    exchangeAvailable?: boolean;
  };
  stock: number;
  color: string;
  material: string;
  description: string;
  images: string[];
  status: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  wishlist?: Set<string>;
  toggleWishlist?: (id: string) => void;
  showCollectionBadges?: boolean;
}

export function ProductCard({ product, index = 0, wishlist, toggleWishlist, showCollectionBadges = true }: ProductCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const quickViewCloseButton = useRef<HTMLButtonElement>(null);
  const { addItem, error: cartError } = useStoreCart();
  const wishlistContext = useWishlist();
  const { error: wishlistError } = wishlistContext;
  const isWished = wishlist?.has(product.productId) ?? wishlistContext.hasItem(product.productId);
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      if (product.images[0].startsWith('http') || product.images[0].startsWith('data:')) return product.images[0];
      return `${baseUrl}${product.images[0]}`;
    }
    return null;
  };

  const imgSrc = getProductImage(product);
  const currentPrice = product.offerPrice > 0 ? product.offerPrice : product.price;
  const hasDiscountedPrice = product.offerPrice > 0 && product.offerPrice < product.price;
  const discountPercent = product.discount || (hasDiscountedPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0);
  const collectionBadge = showCollectionBadges
    ? product.bestSeller
      ? { label: 'Bestseller', className: 'bg-[#a20d19] text-white', Icon: Crown }
      : product.newArrival
        ? { label: 'New Arrival', className: 'bg-[#f6d17b] text-[#381413]', Icon: Sparkles }
        : product.featured
          ? { label: 'Trending', className: 'bg-[#087d32] text-white', Icon: TrendingUp }
          : null
    : null;
  const shippingLabel = product.shipping?.freeShipping ? 'Free Shipping' : 'Insured Shipping';
  const returnLabel = product.returnPolicy?.exchangeAvailable
    ? 'Lifetime Exchange'
    : product.returnPolicy?.returnAvailable
      ? 'Easy Returns'
      : 'Easy Support';
  const returnDetail = product.returnPolicy?.returnAvailable && product.returnPolicy.returnDays
    ? `${product.returnPolicy.returnDays}-Day Returns`
    : product.returnPolicy?.exchangeAvailable
      ? 'On eligible items'
      : 'Contact our team';

  useEffect(() => {
    if (!isQuickViewOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    quickViewCloseButton.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsQuickViewOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isQuickViewOpen]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleWishlist) {
      toggleWishlist(product.productId);
      return;
    }
    wishlistContext.toggleItem({
      id: product.productId,
      name: product.name,
      category: product.category,
      purity: product.purity,
      weight: Number(product.weight) || 0,
      weightUnit: product.weightUnit || 'g',
      price: Number(product.price) || 0,
      offerPrice: Number(product.offerPrice) || 0,
      stock: Number(product.stock) || 0,
      image: imgSrc || '',
    });
  };

  const addProductToCart = async () => {
    const cartProduct: CartProduct = {
      id: product.productId,
      name: product.name,
      category: product.category,
      purity: product.purity,
      weight: Number(product.weight) || 0,
      weightUnit: product.weightUnit || 'g',
      price: Number(product.price) || 0,
      offerPrice: Number(product.offerPrice) || 0,
      stock: Number(product.stock) || 0,
      image: imgSrc || '',
    };
    const added = await addItem(cartProduct);
    setCartMessage(added
      ? `${product.name} added to your cart.`
      : `${product.name} is out of stock or at its available quantity limit.`);
    return added;
  };

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await addProductToCart();
  };

  const handleBuyNow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (await addProductToCart()) {
      setIsQuickViewOpen(false);
      navigate('/checkout');
    }
  };

  return (
    <>
    <article
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#ead8bf] bg-[#fffdfa] shadow-[0_3px_12px_rgba(91,48,15,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(91,48,15,0.16)]"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-[#f7eee1]">
        <Link to={`/product/${product.productId}`} aria-label={`View ${product.name}`} className="block h-full w-full">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Gem className="h-16 w-16 text-amber-300/60" />
            </div>
          )}
        </Link>

        {(collectionBadge || discountPercent > 0) && (
          <div className="absolute left-2.5 top-2.5">
            {collectionBadge ? (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm ${collectionBadge.className}`}>
                <collectionBadge.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {collectionBadge.label}
              </span>
            ) : discountPercent > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#df1018] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                <Tag className="h-3 w-3" aria-hidden="true" />
                {discountPercent}% OFF
              </span>
            ) : null}
          </div>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={`${isWished ? 'Remove' : 'Add'} ${product.name} ${isWished ? 'from' : 'to'} wishlist`}
          aria-pressed={isWished}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#7a1515] shadow-md transition hover:scale-105 hover:bg-red-50 sm:h-9 sm:w-9 ${isWished ? 'text-red-600' : ''}`}
        >
          <Heart className={`h-4 w-4 ${isWished ? 'fill-current' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => setIsQuickViewOpen(true)}
          aria-label={`Quick view ${product.name}`}
          className={`absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-md bg-[#5a1112]/95 px-3 py-2 text-[11px] font-bold text-white shadow transition-all hover:bg-[#ad7929] ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
        >
          <Eye className="h-3.5 w-3.5" /> Quick View
        </button>
        <svg
          aria-hidden="true"
          viewBox="0 0 100 14"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-4 w-full"
        >
          <path d="M0 5 C18 9 31 13 48 8 C66 3 80 1 100 6 L100 14 L0 14 Z" fill="#fffdfa" />
        </svg>
      </div>

      <div className="flex flex-1 flex-col px-3 py-2.5 sm:px-3.5">
        {(cartError || wishlistError || cartMessage) && (
          <span role={cartError || wishlistError ? 'alert' : 'status'} className="sr-only">
            {cartError || wishlistError || cartMessage}
          </span>
        )}

        <Link to={`/product/${product.productId}`} className="font-serif text-[14px] font-bold leading-5 text-[#191414] transition-colors hover:text-[#74180f] sm:text-[15px]">
          <h3 className="line-clamp-1">{product.name}</h3>
        </Link>

        <p className="mt-0.5 truncate text-[11px] font-medium text-[#697080] sm:text-xs">
          {[product.purity || product.material, product.weight > 0 ? `${product.weight} ${product.weightUnit || 'g'}` : '']
            .filter(Boolean)
            .join(' · ') || product.category}
        </p>

        {Number(product.rating) > 0 && (
          <div className="mt-1 flex items-center gap-1 text-[11px]" aria-label={`Rated ${Number(product.rating).toFixed(1)} out of 5${product.reviewCount ? ` from ${product.reviewCount} reviews` : ''}`}>
            <span className="flex items-center text-[#f28a00]" aria-hidden="true">
              {Array.from({ length: 5 }, (_, starIndex) => {
                const fillPercent = Math.min(100, Math.max(0, (Number(product.rating) - starIndex) * 100));
                return (
                 <span key={starIndex} className="relative h-3.5 w-3.5">
                   <Star className="absolute inset-0 h-3.5 w-3.5 text-[#d5d0c8]" />
                   <span className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}>
                     <Star className="h-3.5 w-3.5 fill-current text-[#f28a00]" />
                   </span>
                 </span>
                );
              })}
            </span>
            <span className="font-medium text-[#555b66]">{Number(product.rating).toFixed(1)}{product.reviewCount ? ` (${product.reviewCount})` : ''}</span>
          </div>
        )}

        <div className="mt-1.5 flex min-h-7 items-center gap-1.5 overflow-hidden">
          <span className="shrink-0 text-[17px] font-black leading-none text-[#74180f] sm:text-lg">{formatPrice(currentPrice)}</span>
          {hasDiscountedPrice && (
            <span className="truncate text-[10px] font-medium text-[#777] line-through sm:text-[11px]">
              {formatPrice(product.price)}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="ml-auto shrink-0 rounded-md bg-[#fde1df] px-1.5 py-1 text-[9px] font-bold text-[#ba1714] sm:px-2 sm:text-[10px]">
              {discountPercent}% OFF
            </span>
          )}
          {product.stock <= 0 && <span className="ml-auto shrink-0 text-[9px] font-bold text-red-600">Out of stock</span>}
        </div>

        <div className="mt-2 grid grid-cols-3 items-center gap-1 pt-1.5 text-[#34343a]">
          <div className="flex min-w-0 items-center gap-1">
            {product.hallmark || product.certificate ? (
              <BadgeCheck className="h-4 w-4 shrink-0 text-[#242934]" />
            ) : (
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#242934]" />
            )}
            <span className="min-w-0 text-[8px] leading-[1.15] sm:text-[9px]">
              <span className="block font-semibold">{product.hallmark ? 'BIS' : product.certificate ? 'Certified' : 'Quality'}</span>
              <span className="block truncate">{product.hallmark ? 'Hallmarked' : product.certificate || 'Assured'}</span>
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <Truck className="h-4 w-4 shrink-0 text-[#b84a13]" />
            <span className="min-w-0 text-[8px] leading-[1.15] sm:text-[9px]">
              <span className="block font-semibold">{shippingLabel.split(' ')[0]}</span>
              <span className="block truncate">{shippingLabel.split(' ').slice(1).join(' ')}</span>
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <RotateCcw className="h-4 w-4 shrink-0 text-[#b84a13]" />
            <span className="min-w-0 text-[8px] leading-[1.15] sm:text-[9px]">
              <span className="block font-semibold">{returnLabel.split(' ')[0]}</span>
              <span className="block truncate" title={returnDetail}>{returnLabel.split(' ').slice(1).join(' ') || returnDetail}</span>
            </span>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-[1.15fr_1fr] gap-1.5">
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            title={product.stock > 0 ? 'Add to cart' : 'Out of stock'}
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#8e0610] px-2 text-[10px] font-bold text-white shadow-sm transition hover:bg-[#74180f] disabled:cursor-not-allowed disabled:opacity-50 sm:text-[11px]"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </button>
          <Link
            to={`/product/${product.productId}`}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-full border border-[#e5b65e] bg-white px-2 text-[10px] font-bold text-[#35211e] shadow-sm transition hover:bg-[#fff6e8] sm:text-[11px]"
          >
            <span className="truncate">View Details</span><ArrowRight className="h-3 w-3 shrink-0" />
          </Link>
        </div>
      </div>
    </article>
    {isQuickViewOpen && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsQuickViewOpen(false);
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby={`quick-view-title-${product.productId}`}
          className="relative grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl sm:grid-cols-2"
        >
          <button
            ref={quickViewCloseButton}
            type="button"
            onClick={() => setIsQuickViewOpen(false)}
            aria-label="Close quick view"
            className="absolute right-3 top-3 z-10 rounded-full bg-white/95 p-2 text-gray-700 shadow transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative flex min-h-64 items-center justify-center bg-[#fff8ed] sm:min-h-[420px]">
            {imgSrc ? (
              <img src={imgSrc} alt={product.name} className="h-full max-h-[45vh] w-full object-contain sm:max-h-[560px]" />
            ) : (
              <Gem className="h-20 w-20 text-amber-300/70" aria-hidden="true" />
            )}
          </div>
          <div className="flex flex-col p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#ad7929]">
              {product.category}{product.subCategory ? ` · ${product.subCategory}` : ''}
            </p>
            <h2 id={`quick-view-title-${product.productId}`} className="mt-2 font-serif text-2xl font-bold text-[#381413]">
              {product.name}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
              {product.purity && <span className="rounded-full bg-[#fff8ec] px-3 py-1">{product.purity}</span>}
              {product.weight > 0 && <span className="rounded-full bg-[#fff8ec] px-3 py-1">{product.weight} {product.weightUnit || 'g'}</span>}
              {product.material && <span className="rounded-full bg-[#fff8ec] px-3 py-1">{product.material}</span>}
              {product.hallmark && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Hallmarked</span>}
            </div>
            <p className="mt-4 line-clamp-4 text-sm leading-6 text-gray-600">
              {product.description || 'Discover this finely crafted jewellery design from our collection.'}
            </p>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-2xl font-black text-[#74180f]">
                {formatPrice(product.offerPrice > 0 ? product.offerPrice : product.price)}
              </span>
              {product.offerPrice > 0 && product.offerPrice < product.price && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
              )}
            </div>
            <p className={`mt-2 text-xs font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </p>
            {(cartError || wishlistError || cartMessage) && (
              <p role={cartError || wishlistError ? 'alert' : 'status'} className="mt-3 text-xs font-medium text-[#5a1112]">
                {cartError || wishlistError || cartMessage}
              </p>
            )}
            <div className="mt-auto grid gap-2 pt-6">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={(event) => void handleAddToCart(event)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5a1112] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#74180f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </button>
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={(event) => void handleBuyNow(event)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ad7929] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#91621f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Buy Now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    handleWishlist(event);
                  }}
                  aria-pressed={isWished}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eadbc9] px-3 py-2.5 text-xs font-bold text-[#74180f] transition hover:bg-[#fff8ec]"
                >
                  <Heart className={`h-4 w-4 ${isWished ? 'fill-current text-red-600' : ''}`} />
                  {isWished ? 'Saved' : 'Add to wishlist'}
                </button>
                <Link
                  to={`/product/${product.productId}`}
                  onClick={() => setIsQuickViewOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eadbc9] px-3 py-2.5 text-xs font-bold text-[#74180f] transition hover:bg-[#fff8ec]"
                >
                  View details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )}
    </>
  );
}

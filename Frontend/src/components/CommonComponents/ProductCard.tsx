import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Heart, Star, Sparkles, Gem, Eye, ShoppingBag, X } from 'lucide-react';
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
    <Link
      to={`/product/${product.productId}`}
      className="group relative block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-amber-100/50 transition-all duration-500 hover:-translate-y-2"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gem className="w-16 h-16 text-amber-300/60" />
          </div>
        )}

        {/* Overlay gradient on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg tracking-wide">
              {product.discount}% OFF
            </span>
          )}
          {showCollectionBadges && product.newArrival && (
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> NEW
            </span>
          )}
          {showCollectionBadges && product.bestSeller && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg tracking-wide flex items-center gap-1">
              <Star className="w-3 h-3" /> BEST
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={`${isWished ? 'Remove' : 'Add'} ${product.name} ${isWished ? 'from' : 'to'} wishlist`}
          aria-pressed={isWished}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg ${isWished
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/80 text-gray-500 hover:bg-red-50 hover:text-red-500'
            }`}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Actions on Hover */}
        <div className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsQuickViewOpen(true);
            }}
            aria-label={`Quick view ${product.name}`}
            className="flex-1 bg-[#5a1112] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#ad7929] hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            title={product.stock > 0 ? 'Add to cart' : 'Out of stock'}
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            className="bg-[#5a1112] text-white p-2.5 rounded-xl hover:bg-[#74180f] transition-colors shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        {/* Purity Tag */}
        {product.purity && (
          <div className={`absolute bottom-3 right-3 transition-all duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider">
              {product.purity}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-2.5">
        {(cartError || wishlistError || cartMessage) && <span role={cartError || wishlistError ? 'alert' : 'status'} className="sr-only">{cartError || wishlistError || cartMessage}</span>}
        {/* Category */}
        <p className="text-[10px] font-bold text-[#1b88f3] uppercase tracking-[0.15em]">
          {product.category} {product.subCategory ? `· ${product.subCategory}` : ''}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#1b88f3] transition-colors">
          {product.name}
        </h3>

        {Number(product.rating) > 0 && (
          <div className="flex items-center gap-1 text-xs" aria-label={`Rated ${product.rating} out of 5`}>
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-700">{Number(product.rating).toFixed(1)}</span>
            <span className="text-gray-400">/ 5</span>
          </div>
        )}

        {/* Weight & Material */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
          {product.weight > 0 && <span>{product.weight} {product.weightUnit}</span>}
          {product.weight > 0 && product.material && <span>·</span>}
          {product.material && <span>{product.material}</span>}
          {product.hallmark && (
            <>
              <span>·</span>
              <span className="text-emerald-600 flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Hallmarked
              </span>
            </>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 pt-1">
          <span className="text-lg font-black text-gray-900">
            {formatPrice(product.offerPrice > 0 ? product.offerPrice : product.price)}
          </span>
          {product.offerPrice > 0 && product.offerPrice < product.price && (
            <span className="text-xs text-gray-400 line-through font-medium pb-0.5">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Only {product.stock} left!</p>
        )}
        {product.stock === 0 && (
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Out of Stock</p>
        )}
      </div>
    </Link>
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

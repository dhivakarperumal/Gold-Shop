import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Star, Sparkles, Gem, Eye, ShoppingBag } from 'lucide-react';

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
}

export function ProductCard({ product, index = 0, wishlist = new Set(), toggleWishlist }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isWished = wishlist.has(product.productId);
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

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (toggleWishlist) toggleWishlist(product.productId);
  };

  return (
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
          {product.newArrival && (
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> NEW
            </span>
          )}
          {product.bestSeller && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg tracking-wide flex items-center gap-1">
              <Star className="w-3 h-3" /> BEST
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg ${isWished
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/80 text-gray-500 hover:bg-red-50 hover:text-red-500'
            }`}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Actions on Hover */}
        <div className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button onClick={(e) => e.preventDefault()} className="flex-1 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold py-2.5 rounded-xl hover:bg-[#1b88f3] hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
          <button onClick={(e) => e.preventDefault()} className="bg-[#1b88f3] text-white p-2.5 rounded-xl hover:bg-[#1569c7] transition-colors shadow-lg">
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
        {/* Category */}
        <p className="text-[10px] font-bold text-[#1b88f3] uppercase tracking-[0.15em]">
          {product.category} {product.subCategory ? `· ${product.subCategory}` : ''}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#1b88f3] transition-colors">
          {product.name}
        </h3>

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
  );
}

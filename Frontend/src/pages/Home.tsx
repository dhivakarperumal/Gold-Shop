import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ShieldCheck, Clock, ArrowRight, Heart, Star, Sparkles, Gem, Eye, ShoppingBag, Truck, Award, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Product {
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

export function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        const activeProducts = (res.data.products || []).filter((p: Product) => p.status === 'Active');
        setProducts(activeProducts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const featuredProducts = products.filter(p => p.featured);
  const newArrivals = products.filter(p => p.newArrival);
  const bestSellers = products.filter(p => p.bestSeller);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return `${baseUrl}${product.images[0]}`;
    }
    return null;
  };

  // Product Card Component
  const ProductCard = ({ product, index }: { product: Product; index: number }) => {
    const imgSrc = getProductImage(product);
    const isHovered = hoveredProduct === product.productId;
    const isWished = wishlist.has(product.productId);

    return (
      <div
        className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-amber-100/50 transition-all duration-500 hover:-translate-y-2"
        style={{ animationDelay: `${index * 80}ms` }}
        onMouseEnter={() => setHoveredProduct(product.productId)}
        onMouseLeave={() => setHoveredProduct(null)}
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
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.productId); }}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg ${isWished
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white/80 text-gray-500 hover:bg-red-50 hover:text-red-500'
              }`}
          >
            <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Actions on Hover */}
          <div className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button className="flex-1 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold py-2.5 rounded-xl hover:bg-[#1b88f3] hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-lg">
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
            <button className="bg-[#1b88f3] text-white p-2.5 rounded-xl hover:bg-[#1569c7] transition-colors shadow-lg">
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
      </div>
    );
  };

  // Skeleton Card for loading state
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 w-1/3 bg-gray-200 rounded-full" />
        <div className="h-3.5 w-3/4 bg-gray-200 rounded-full" />
        <div className="h-2.5 w-1/2 bg-gray-200 rounded-full" />
        <div className="h-5 w-1/3 bg-gray-200 rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      {/* ═══════════════════════════════════════════ HERO SECTION ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left relative z-10">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Premium Gold Jewellery
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1]">
                Timeless <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600">Gold</span> for Every Occasion.
              </h1>
              <p className="text-xl text-gray-500 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                Discover exquisite BIS hallmarked jewellery crafted with precision. From daily wear elegance to bridal grandeur.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link to={user ? "/admin" : "/register"} className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-xl hover:shadow-amber-200/50 transition-all flex items-center gap-2 shadow-lg">
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#products" className="px-8 py-4 rounded-xl font-bold text-lg text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all">
                  Browse Collection
                </a>
              </div>
            </div>

            <div className="relative group hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-yellow-300/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <div className="relative bg-gradient-to-tr from-amber-100 via-yellow-50 to-orange-50 rounded-3xl p-8 border border-amber-200/30 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow ${i === 0 ? 'row-span-2' : ''}`}>
                      <Gem className={`w-8 h-8 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-rose-400' : i === 2 ? 'text-blue-400' : 'text-emerald-400'}`} />
                      <span className="text-xs font-bold text-gray-500 text-center">
                        {i === 0 ? 'Necklaces' : i === 1 ? 'Rings' : i === 2 ? 'Earrings' : 'Bangles'}
                      </span>
                      {i === 0 && (
                        <div className="mt-2 space-y-2 w-full">
                          <div className="h-2 w-full bg-amber-100 rounded-full" />
                          <div className="h-2 w-3/4 bg-amber-50 rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ TRUST BADGES ═══════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <ShieldCheck className="w-5 h-5" />, title: 'BIS Hallmarked', desc: 'Certified 22K Purity', color: 'text-emerald-600' },
              { icon: <Truck className="w-5 h-5" />, title: 'Free Delivery', desc: 'On orders above ₹10,000', color: 'text-blue-600' },
              { icon: <Award className="w-5 h-5" />, title: 'Lifetime Exchange', desc: 'Easy exchange policy', color: 'text-amber-600' },
              { icon: <RefreshCcw className="w-5 h-5" />, title: '7-Day Returns', desc: 'Hassle-free returns', color: 'text-purple-600' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center ${badge.color}`}>
                  {badge.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{badge.title}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ FEATURED PRODUCTS ══════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[11px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-1">Hand Picked</p>
              <h2 className="text-3xl font-black text-gray-900">Featured Collection</h2>
            </div>
            <a href="#products" className="text-sm font-bold text-[#1b88f3] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.slice(0, 4).map((product, i) => (
              <ProductCard key={product.productId} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════ ALL PRODUCTS ══════════════════════════════════════ */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-10 space-y-3">
          <p className="text-[11px] font-bold text-[#1b88f3] uppercase tracking-[0.2em]">Our Catalogue</p>
          <h2 className="text-4xl font-black text-gray-900">Explore Our Products</h2>
          <p className="text-gray-400 font-medium max-w-md mx-auto">Handcrafted with love, each piece tells a unique story of artistry and tradition.</p>
        </div>

        {/* Category Tabs */}
        {categories.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeCategory === cat
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-300/30 scale-105'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.productId} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <Gem className="w-16 h-16 text-gray-200 mx-auto" />
            <h3 className="text-xl font-bold text-gray-400">No products found</h3>
            <p className="text-sm text-gray-400">New collections are being added soon. Stay tuned!</p>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════ NEW ARRIVALS HIGHLIGHT ═══════════════════════════════════ */}
      {newArrivals.length > 0 && (
        <section className="bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Just Arrived
                </p>
                <h2 className="text-3xl font-black text-gray-900">New Arrivals</h2>
              </div>
              <a href="#products" className="text-sm font-bold text-[#1b88f3] hover:underline flex items-center gap-1">
                See All <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {newArrivals.slice(0, 4).map((product, i) => (
                <ProductCard key={product.productId} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════ BEST SELLERS ═══════════════════════════════════ */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" /> Most Loved
              </p>
              <h2 className="text-3xl font-black text-gray-900">Best Sellers</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bestSellers.slice(0, 4).map((product, i) => (
              <ProductCard key={product.productId} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════ FEATURES ═══════════════════════════════════ */}
      <section className="bg-gray-50/80 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[11px] font-bold text-[#1b88f3] uppercase tracking-[0.2em]">Why Choose Us</p>
            <h2 className="text-3xl font-black text-gray-900">Built on Trust & Tradition</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl space-y-4 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 group border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1b88f3] group-hover:scale-110 group-hover:bg-[#1b88f3] group-hover:text-white transition-all duration-300">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Total Transparency</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">Real-time gold rate updates and transparent breakup of making charges, wastage, and final price.</p>
            </div>

            <div className="p-8 bg-white rounded-2xl space-y-4 hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300 group border border-gray-100">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Certified Purity</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">Every piece is BIS hallmarked and comes with a certificate of authenticity. Zero compromise on quality.</p>
            </div>

            <div className="p-8 bg-white rounded-2xl space-y-4 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300 group border border-gray-100">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-400 group-hover:text-white transition-all duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Fast Delivery</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">Insured delivery within 3-5 days. Track your precious order every step of the way.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ CTA BANNER ═══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-12 md:p-16">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-amber-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider backdrop-blur-sm">
              <Gem className="w-3.5 h-3.5" /> Special Offer
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Get <span className="text-amber-400">10% Off</span> on Your First Order
            </h2>
            <p className="text-gray-400 font-medium">
              Sign up today and receive an exclusive discount on your first jewellery purchase. Limited time offer!
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <Link
                to={user ? "/admin" : "/register"}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-base hover:scale-105 hover:shadow-xl hover:shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                {user ? 'Go to Dashboard' : 'Create Account'} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

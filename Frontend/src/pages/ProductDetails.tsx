import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ShieldCheck, Clock, Award, ChevronRight, Star } from 'lucide-react';
import api from '../api';
import { ProductCard } from '../components/CommonComponents/ProductCard';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      try {
        const [productRes, allProductsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/products')
        ]);
        
        const currentProduct = productRes.data.product;
        setProduct(currentProduct);

        const allProducts = allProductsRes.data.products || [];
        const related = allProducts.filter((p: any) => 
          p.status === 'Active' &&
          p.category === currentProduct.category && 
          p.productId !== currentProduct.productId
        );
        setRelatedProducts(related.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch product details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      window.scrollTo(0, 0); // scroll to top when changing products
      fetchProductAndRelated();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1b88f3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-gray-500 mt-2">The product you are looking for does not exist.</p>
        <Link to="/" className="mt-6 text-[#1b88f3] font-bold hover:underline">Return to Home</Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [null];
  
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f3f4f6&color=9ca3af&size=500`;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
    return `${baseUrl}${imagePath}`;
  };

  const discountAmount = product.price - (product.offerPrice || product.price);

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-8">
          <Link to="/" className="hover:text-[#1b88f3]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-[#1b88f3]">{product.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 truncate">{product.name}</span>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            
            {/* Left: Images */}
            <div className="p-8 lg:p-12 lg:border-r border-gray-100 flex flex-col gap-6">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                {product.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    {product.discount}% OFF
                  </div>
                )}
                {product.bestSeller && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Best Seller
                  </div>
                )}
                <img 
                  src={getImageUrl(images[activeImage])} 
                  alt={product.name} 
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === idx ? 'border-[#1b88f3] shadow-md' : 'border-transparent hover:border-gray-200 bg-gray-50'
                      }`}
                    >
                      <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="p-8 lg:p-12">
              <p className="text-sm font-bold text-[#1b88f3] uppercase tracking-wider mb-2">{product.brand}</p>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-8 text-sm">
                <span className="flex items-center gap-1 text-gray-500 font-medium">
                  <span className="text-amber-500 flex">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-gray-200" />
                  </span>
                  (4.0)
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 font-medium">SKU: {product.sku}</span>
              </div>

              <div className="flex items-end gap-4 mb-6">
                <div className="text-4xl font-black text-gray-900 tracking-tight">
                  ₹{product.offerPrice ? product.offerPrice.toLocaleString() : product.price?.toLocaleString()}
                </div>
                {product.offerPrice && product.offerPrice < product.price && (
                  <div className="flex flex-col mb-1">
                    <span className="text-lg text-gray-400 line-through font-bold">₹{product.price.toLocaleString()}</span>
                    <span className="text-sm font-bold text-red-500">Save ₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button className="flex-1 bg-[#1b88f3] text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1569c7] transition-all shadow-lg shadow-blue-500/30">
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button className="h-14 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Heart className="w-5 h-5" /> Wishlist
                </button>
              </div>

              {/* Key Features / Specs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Purity</p>
                    <p className="text-sm font-bold text-gray-900">{product.purity || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1b88f3] shadow-sm shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Weight</p>
                    <p className="text-sm font-bold text-gray-900">{product.weight} {product.weightUnit}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Hallmark</p>
                    <p className="text-sm font-bold text-gray-900">{product.hallmark ? 'BIS Hallmarked' : 'No'}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Availability</p>
                    <p className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight mb-3">Product Description</h3>
                  <p className="text-gray-500 leading-relaxed text-sm font-medium">
                    {product.description}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[11px] font-bold text-[#1b88f3] uppercase tracking-[0.2em] mb-1">More to Explore</p>
                <h2 className="text-3xl font-black text-gray-900">Related Products</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.productId} product={p} index={i} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ShieldCheck, Clock, Award, Star, ArrowRight } from 'lucide-react';
import api from '../api';
import { ProductCard, type Product } from '../components/CommonComponents/ProductCard';
import PageContainer from '../components/CommonComponents/PageContainer.jsx';
import PageHeader from '../components/CommonComponents/PageHeader.jsx';
import type { CartProduct } from '../context/StoreCartContext';
import { useStoreCart } from '../context/useStoreCart';

type ProductDetailsRecord = Product & { sku?: string };

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetailsRecord | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetailsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [cartMessage, setCartMessage] = useState('');
  const { addItem } = useStoreCart();

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      try {
        const [productRes, allProductsRes] = await Promise.all([
          api.get<{ product: ProductDetailsRecord }>(`/products/${id}`),
          api.get<{ products: ProductDetailsRecord[] }>('/products')
        ]);
        
        const currentProduct = productRes.data.product;
        setProduct(currentProduct);

        const allProducts = allProductsRes.data.products || [];
        const related = allProducts.filter((p) =>
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

  const images: (string | null)[] = product.images.length > 0 ? product.images : [null];
  
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f3f4f6&color=9ca3af&size=500`;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
    return `${baseUrl}${imagePath}`;
  };

  const discountAmount = product.price - (product.offerPrice || product.price);
  const addProductToCart = () => {
    const cartProduct: CartProduct = {
      id: String(product.productId),
      name: String(product.name),
      category: String(product.category || ''),
      purity: String(product.purity || ''),
      weight: Number(product.weight) || 0,
      weightUnit: String(product.weightUnit || 'g'),
      price: Number(product.price) || 0,
      offerPrice: Number(product.offerPrice) || 0,
      stock: Number(product.stock) || 0,
      image: getImageUrl(images[0]),
    };
    if (addItem(cartProduct)) {
      setCartMessage(`${cartProduct.name} added to your cart.`);
      return true;
    } else {
      setCartMessage('This item is currently out of stock or at its available quantity limit.');
      return false;
    }
  };

  const handleBuyNow = () => {
    if (addProductToCart()) {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf8] pb-12 font-sans">
      <PageHeader
        breadcrumb={product.category}
        eyebrow={product.brand}
        title={product.name}
        description={`${product.purity || 'Fine'} jewellery${product.weight ? ` · ${product.weight} ${product.weightUnit}` : ''} · Explore the details of this design.`}
        className="flex h-[300px] items-center"
        contentClassName="py-4"
        titleClassName="text-3xl sm:text-4xl lg:text-5xl"
      />

      <PageContainer className="py-6 sm:py-8">
        <div className="overflow-hidden rounded-2xl border border-[#f0e5d5] bg-white shadow-[0_12px_40px_rgba(73,24,18,0.06)] sm:rounded-[2rem]">
          <div className="grid lg:grid-cols-2">
            
            {/* Left: Images */}
            <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:border-r lg:border-[#f0e5d5] lg:p-10">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#fffaf2]">
                {product.discount > 0 && (
                  <div className="absolute left-4 top-4 z-10 rounded-full bg-[#74180f] px-3 py-1 text-xs font-bold text-white">
                    {product.discount}% OFF
                  </div>
                )}
                {product.bestSeller && (
                  <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-[#f4c35e] px-3 py-1 text-xs font-bold text-[#4b1715]">
                    <Star className="h-3 w-3 fill-current" /> Best Seller
                  </div>
                )}
                <img 
                  src={getImageUrl(images[activeImage])} 
                  alt={product.name} 
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img: string | null, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === idx ? 'border-[#b98531] shadow-md' : 'border-[#f0e5d5] hover:border-[#d6ad62] bg-[#fffaf2]'
                      }`}
                    >
                      <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="p-5 sm:p-7 lg:p-10">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ad7929]">{product.category}{product.subCategory ? ` · ${product.subCategory}` : ''}</p>
              <h2 className="mb-4 font-serif text-2xl font-bold leading-tight tracking-tight text-[#4b1715] sm:text-3xl lg:text-4xl">
                {product.name}
              </h2>
              
              <div className="flex items-center gap-4 mb-8 text-sm">
                <span className="flex items-center gap-1 font-medium text-gray-500">
                  <span className="flex text-[#c18b2c]">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-gray-200" />
                  </span>
                  (4.0)
                </span>
                <span className="text-gray-300">|</span>
                <span className="font-medium text-gray-500">SKU: {product.sku || product.productId}</span>
              </div>

              <div className="flex items-end gap-4 mb-6">
                <div className="text-3xl font-extrabold tracking-tight text-[#74180f] sm:text-4xl">
                  ₹{product.offerPrice ? product.offerPrice.toLocaleString() : product.price?.toLocaleString()}
                </div>
                {product.offerPrice && product.offerPrice < product.price && (
                  <div className="flex flex-col mb-1">
                    <span className="text-lg text-gray-400 line-through font-bold">₹{product.price.toLocaleString()}</span>
                    <span className="text-sm font-bold text-emerald-700">Save ₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mb-10 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={addProductToCart}
                  disabled={product.stock <= 0}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#5a1112] font-bold text-white shadow-lg shadow-[#5a1112]/20 transition-all hover:bg-[#74180f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#b98531] px-6 font-bold text-white transition-all hover:bg-[#9c6a27] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Buy Now <ArrowRight className="h-5 w-5" />
                </button>
                <button type="button" className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#eadfd2] px-6 font-bold text-[#5a1112] transition-all hover:border-[#b98531] hover:bg-[#fffaf2]">
                  <Heart className="w-5 h-5" /> Wishlist
                </button>
              </div>
              {cartMessage && <p role="status" className="-mt-7 mb-7 text-sm font-medium text-[#5a1112]">{cartMessage}</p>}

              {/* Key Features / Specs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex items-center gap-3 rounded-2xl border border-[#f0e5d5] bg-[#fffaf2] p-3 sm:p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#b98531] shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Purity</p>
                    <p className="text-sm font-bold text-gray-900">{product.purity || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-[#f0e5d5] bg-[#fffaf2] p-3 sm:p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#b98531] shadow-sm">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Weight</p>
                    <p className="text-sm font-bold text-gray-900">{product.weight} {product.weightUnit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-[#f0e5d5] bg-[#fffaf2] p-3 sm:p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Hallmark</p>
                    <p className="text-sm font-bold text-gray-900">{product.hallmark ? 'BIS Hallmarked' : 'No'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-[#f0e5d5] bg-[#fffaf2] p-3 sm:p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#8b5b80] shadow-sm">
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
                  <h3 className="mb-3 font-serif text-lg font-bold tracking-tight text-[#4b1715]">Product Description</h3>
                  <p className="text-sm font-medium leading-relaxed text-gray-600">
                    {product.description}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-10 sm:mt-14">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#ad7929]">More to Explore</p>
                <h2 className="font-serif text-2xl font-bold text-[#5a1112] sm:text-3xl">Related Products</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.productId} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

      </PageContainer>
    </div>
  );
}

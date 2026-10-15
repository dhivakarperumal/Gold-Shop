import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowRight, Gem, Truck, RotateCcw, BadgeCheck, Minus, Plus, Sparkles } from 'lucide-react';
import api from '../api';
import type { Product } from '../components/CommonComponents/ProductCard';
import PageContainer from '../components/CommonComponents/PageContainer.jsx';
import PageHeader from '../components/CommonComponents/PageHeader.jsx';
import type { CartProduct } from '../context/StoreCartContext';
import { useStoreCart } from '../context/useStoreCart';

type ProductDetailsRecord = Product & {
  sku?: string;
  certificate?: string;
  makingCharges?: number;
  wastagePercentage?: number;
  features?: string[];
  occasion?: string[];
  size?: (number | string)[];
  lengthOptions?: string[];
  shipping?: { freeShipping?: boolean; estimatedDelivery?: string; cashOnDelivery?: boolean };
  returnPolicy?: { returnAvailable?: boolean; returnDays?: number };
};

const productTabs = ['Description', 'Specifications', 'Reviews', 'Shipping & Returns'] as const;
type ProductTab = typeof productTabs[number];

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetailsRecord | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetailsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<ProductTab>('Description');
  const [cartMessage, setCartMessage] = useState('');
  const [relatedCartMessage, setRelatedCartMessage] = useState('');
  const { addItem, error: cartError } = useStoreCart();

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
        setActiveImage(0);
        setQuantity(1);
        setActiveTab('Description');

        const allProducts = allProductsRes.data.products || [];
        const currentCategory = currentProduct.category?.trim().toLowerCase();
        const currentSubCategory = currentProduct.subCategory?.trim().toLowerCase();
        const candidates = allProducts.filter((candidate) =>
          String(candidate.productId) !== String(currentProduct.productId)
          && String(candidate.status || '').toLowerCase() === 'active'
        );
        candidates.sort((a, b) => {
          const score = (candidate: ProductDetailsRecord) => (
            (candidate.category?.trim().toLowerCase() === currentCategory ? 2 : 0)
            + (candidate.subCategory?.trim().toLowerCase() === currentSubCategory ? 1 : 0)
          );
          return score(b) - score(a);
        });
        setRelatedProducts(candidates.slice(0, 5));
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
  const addProductToCart = async () => {
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
    if (await addItem(cartProduct, quantity)) {
      setCartMessage(`${cartProduct.name} added to your cart.`);
      return true;
    } else {
      setCartMessage('This item is out of stock or the selected quantity exceeds available stock.');
      return false;
    }
  };

  const handleBuyNow = async () => {
    if (await addProductToCart()) {
      navigate('/cart');
    }
  };

  const addRelatedToCart = async (relatedProduct: ProductDetailsRecord) => {
    const image = relatedProduct.images?.[0] || null;
    const cartProduct: CartProduct = {
      id: String(relatedProduct.productId),
      name: relatedProduct.name,
      category: relatedProduct.category || '',
      purity: relatedProduct.purity || '',
      weight: Number(relatedProduct.weight) || 0,
      weightUnit: relatedProduct.weightUnit || 'g',
      price: Number(relatedProduct.price) || 0,
      offerPrice: Number(relatedProduct.offerPrice) || 0,
      stock: Number(relatedProduct.stock) || 0,
      image: getImageUrl(image),
    };
    setRelatedCartMessage(await addItem(cartProduct)
      ? `${cartProduct.name} added to your cart.`
      : `${cartProduct.name} is out of stock or at its available quantity limit.`);
  };

  return (
    <div className="min-h-screen bg-[#fffdf8] pb-12 font-sans text-[#381413]">
      <PageHeader
        breadcrumbTrail={
          <>
            <Link to="/" className="text-[#f1bf54] transition-colors hover:text-white">Home</Link>
            <span aria-hidden="true">›</span>
            <Link to="/shop" className="text-[#f1bf54] transition-colors hover:text-white">Shop</Link>
            <span aria-hidden="true">›</span>
            <span>{product.category}</span>
            <span aria-hidden="true">›</span>
            <span aria-current="page" className="max-w-[45vw] truncate">{product.name}</span>
          </>
        }
        eyebrow={product.brand}
        title={product.name}
        description={`${product.purity || 'Fine'} jewellery${product.weight ? ` · ${product.weight} ${product.weightUnit}` : ''} · SKU: ${product.sku || product.productId}`}
        className="flex h-[300px] items-center"
        contentClassName="py-4"
        titleClassName="text-3xl sm:text-4xl lg:text-5xl"
      />

      <PageContainer className="py-4 sm:py-6">
        <section className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-10">
          <div className="flex flex-col-reverse gap-3 sm:gap-4 lg:flex-row">
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 lg:w-[76px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    aria-label={`View product image ${idx + 1}`}
                    aria-pressed={activeImage === idx}
                    className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-lg border-2 bg-white transition sm:h-[76px] sm:w-[76px] ${activeImage === idx ? 'border-[#a66b20]' : 'border-[#eadfd2] hover:border-[#c99a52]'}`}
                  >
                    <img src={getImageUrl(img)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex aspect-square min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-[#f0e5d5] bg-[#fffaf2]">
              {product.discount > 0 && (
                <span className="absolute left-3 top-3 z-10 rounded-full bg-[#74180f] px-3 py-1 text-xs font-bold text-white sm:left-4 sm:top-4">
                  {product.discount}% OFF
                </span>
              )}
              {product.bestSeller && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-[#f4c35e] px-3 py-1 text-xs font-bold text-[#4b1715] sm:right-4 sm:top-4">
                  Bestseller
                </span>
              )}
              <img
                src={getImageUrl(images[activeImage])}
                alt={product.name}
                className="h-full w-full object-contain p-3 mix-blend-multiply sm:p-6"
              />
            </div>
          </div>

          <div className="min-w-0 py-1 lg:py-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#ad7929]">{product.category}{product.subCategory ? ` · ${product.subCategory}` : ''}</p>
                <h1 className="font-serif text-2xl font-bold leading-tight text-[#281a18] sm:text-3xl">{product.name}</h1>
              </div>
              <button type="button" aria-label="Add to wishlist" className="rounded-full border border-[#eadfd2] bg-white p-2.5 text-[#74180f] transition hover:border-[#b98531] hover:bg-[#fff8ec]">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 sm:text-sm">
              <span>{product.brand || 'Fine Jewellery'}</span>
              <span className="text-gray-300">|</span>
              <span>SKU: {product.sku || product.productId}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-extrabold tracking-tight text-[#74180f] sm:text-4xl">
                ₹{(product.offerPrice || product.price)?.toLocaleString('en-IN')}
              </span>
              {product.offerPrice > 0 && product.offerPrice < product.price && (
                <>
                  <span className="text-base font-semibold text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-bold text-emerald-700">Save ₹{discountAmount.toLocaleString('en-IN')}</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Prices and product details are confirmed by our team before purchase.</p>

            <div className="mt-4 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
              {product.stock > 0 && <span className="text-xs text-gray-500">({product.stock} available)</span>}
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-[#f0e5d5] bg-white">
              {[
                ['Gold Purity', product.purity || '—'],
                ['Gross Weight', product.weight ? `${product.weight} ${product.weightUnit || 'g'}` : '—'],
                ['Making Charges', product.makingCharges ? `${product.makingCharges}%` : 'Included in listed price'],
                ['Material', product.material || 'Gold'],
                ['Certification', product.certificate || (product.hallmark ? 'BIS Hallmarked' : '—')],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-[#f3ece3] px-3 py-2.5 text-xs last:border-0 sm:px-4 sm:text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-[#382a26]">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm font-semibold">Quantity</span>
              <div className="flex h-10 items-center overflow-hidden rounded-lg border border-[#eadfd2] bg-white">
                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="h-full px-3 text-[#5a1112] hover:bg-[#fff4df] disabled:opacity-40">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-9 text-center text-sm font-semibold" aria-live="polite">{quantity}</span>
                <button type="button" aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} className="h-full px-3 text-[#5a1112] hover:bg-[#fff4df] disabled:opacity-40">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <button type="button" onClick={addProductToCart} disabled={product.stock <= 0} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#5a1112] px-4 text-sm font-bold text-white shadow-md transition hover:bg-[#74180f] disabled:cursor-not-allowed disabled:opacity-50">
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
              <button type="button" onClick={handleBuyNow} disabled={product.stock <= 0} className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#b98531] bg-white px-4 text-sm font-bold text-[#9c6a27] transition hover:bg-[#fff8ec] disabled:cursor-not-allowed disabled:opacity-50">
                <ArrowRight className="h-4 w-4" /> Buy Now
              </button>
              <button type="button" onClick={addProductToCart} disabled={product.stock <= 0} aria-label="Add to wishlist" className="hidden h-12 items-center justify-center rounded-lg border border-[#eadfd2] px-4 text-[#5a1112] hover:bg-[#fff8ec] disabled:opacity-50 sm:flex lg:hidden">
                <Heart className="h-5 w-5" />
              </button>
            </div>
            {(cartError || cartMessage) && <p role={cartError ? 'alert' : 'status'} className="mt-2 text-sm font-medium text-[#5a1112]">{cartError || cartMessage}</p>}

            <div className="mt-6 grid grid-cols-3 divide-x divide-[#f0e5d5] border-t border-[#f0e5d5] pt-5 text-center">
              <div className="px-2"><BadgeCheck className="mx-auto h-6 w-6 text-[#c18b2c]" /><p className="mt-2 text-[10px] font-bold text-[#4b1715] sm:text-xs">Hallmarked</p><p className="mt-0.5 text-[9px] text-gray-500 sm:text-[10px]">Certified purity</p></div>
              <div className="px-2"><Truck className="mx-auto h-6 w-6 text-[#c18b2c]" /><p className="mt-2 text-[10px] font-bold text-[#4b1715] sm:text-xs">Insured Shipping</p><p className="mt-0.5 text-[9px] text-gray-500 sm:text-[10px]">Delivery details confirmed</p></div>
              <div className="px-2"><RotateCcw className="mx-auto h-6 w-6 text-[#c18b2c]" /><p className="mt-2 text-[10px] font-bold text-[#4b1715] sm:text-xs">Easy Support</p><p className="mt-0.5 text-[9px] text-gray-500 sm:text-[10px]">Contact our team</p></div>
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-[#f0e5d5] bg-white sm:mt-12">
          <div role="tablist" aria-label="Product information" className="flex overflow-x-auto border-b border-[#f0e5d5]">
            {productTabs.map((tab) => (
              <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 px-4 py-4 text-xs font-bold transition sm:px-6 sm:text-sm ${activeTab === tab ? 'border-[#74180f] text-[#74180f]' : 'border-transparent text-gray-600 hover:text-[#74180f]'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div role="tabpanel" className="min-h-40 p-4 sm:p-6 lg:p-8">
            {activeTab === 'Description' && (
              <div className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.8fr)]">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#281a18]">Product Description</h2>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{product.description || `${product.name} is crafted with care in ${product.purity || 'fine'} gold. Contact us for more details about this design.`}</p>
                  {product.features?.length ? (
                    <ul className="mt-4 space-y-2">
                      {product.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-gray-700"><Gem className="mt-0.5 h-4 w-4 shrink-0 text-[#b98531]" />{feature}</li>)}
                    </ul>
                  ) : null}
                </div>
                <aside className="flex min-h-40 flex-col justify-end rounded-lg bg-gradient-to-br from-[#4b1715] to-[#8a3d20] p-5 text-white">
                  <Gem className="mb-auto h-7 w-7 text-[#f4c35e]" />
                  <p className="font-serif text-xl font-bold text-[#f8dfa0]">Made to Treasure</p>
                  <p className="mt-1 text-xs leading-5 text-white/85">Thoughtfully selected jewellery for your most meaningful moments.</p>
                </aside>
              </div>
            )}
            {activeTab === 'Specifications' && (
              <div>
                <h2 className="mb-4 font-serif text-xl font-bold text-[#281a18]">Product Specifications</h2>
                <div className="grid gap-x-8 sm:grid-cols-2">
                  {[
                    ['Category', product.category],
                    ['Subcategory', product.subCategory],
                    ['Purity', product.purity],
                    ['Gross Weight', product.weight ? `${product.weight} ${product.weightUnit || 'g'}` : '—'],
                    ['Material', product.material || 'Gold'],
                    ['Colour', product.color],
                    ['Hallmark', product.hallmark ? (product.certificate || 'BIS Hallmarked') : 'Not specified'],
                    ['SKU', product.sku || product.productId],
                    ...(product.size?.length ? [['Available Sizes', product.size.join(', ')] as [string, string]] : []),
                    ...(product.lengthOptions?.length ? [['Length Options', product.lengthOptions.join(', ')] as [string, string]] : []),
                  ].filter(([, value]) => Boolean(value)).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-[#f3ece3] py-3 text-sm">
                      <span className="text-gray-500">{label}</span><span className="text-right font-semibold text-[#382a26]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'Reviews' && (
              <div className="py-3">
                <h2 className="font-serif text-xl font-bold text-[#281a18]">Customer Reviews</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">For product feedback and customer reviews, please contact our team.</p>
                <Link to="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#74180f] hover:text-[#ad7929]">Contact Us <ArrowRight className="h-4 w-4" /></Link>
              </div>
            )}
            {activeTab === 'Shipping & Returns' && (
              <div>
                <h2 className="font-serif text-xl font-bold text-[#281a18]">Shipping & Returns</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-[#fffaf2] p-4"><Truck className="h-5 w-5 text-[#b98531]" /><h3 className="mt-2 text-sm font-bold">Delivery</h3><p className="mt-1 text-sm text-gray-600">{product.shipping?.freeShipping === false ? 'Shipping details will be confirmed by our team.' : 'Insured shipping. Delivery timing will be confirmed by our team.'} {product.shipping?.estimatedDelivery ? `Estimated: ${product.shipping.estimatedDelivery}.` : ''}</p></div>
                  <div className="rounded-lg bg-[#fffaf2] p-4"><RotateCcw className="h-5 w-5 text-[#b98531]" /><h3 className="mt-2 text-sm font-bold">Returns & Support</h3><p className="mt-1 text-sm text-gray-600">{product.returnPolicy?.returnAvailable ? `Eligible for return within ${product.returnPolicy.returnDays || 7} days, subject to our return policy.` : 'Contact our team for assistance with returns and exchanges.'}</p></div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-10 border-t border-[#f0e5d5] pt-8 sm:mt-14 sm:pt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#ad7929]"><Sparkles className="h-3.5 w-3.5" /> More to Explore</p>
                <h2 className="font-serif text-2xl font-bold text-[#281a18] sm:text-3xl">You May Also Like</h2>
              </div>
              <Link to="/shop" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#74180f] hover:text-[#ad7929] sm:text-sm">View All <ArrowRight className="h-4 w-4" /></Link>
            </div>
            {(cartError || relatedCartMessage) && <p role={cartError ? 'alert' : 'status'} className="mb-3 text-sm font-medium text-[#5a1112]">{cartError || relatedCartMessage}</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {relatedProducts.map((relatedProduct) => {
                const image = relatedProduct.images?.[0] || null;
                const price = Number(relatedProduct.offerPrice) > 0 ? Number(relatedProduct.offerPrice) : Number(relatedProduct.price);
                return (
                  <article key={relatedProduct.productId} className="group overflow-hidden rounded-xl border border-[#f0e5d5] bg-white transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#5a1112]/10">
                    <Link to={`/product/${relatedProduct.productId}`} className="relative block aspect-[4/3] overflow-hidden bg-[#fff8ed]">
                      {image ? (
                        <img src={getImageUrl(image)} alt={relatedProduct.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><Gem className="h-10 w-10 text-[#d5b77b]" /></div>
                      )}
                      {relatedProduct.bestSeller && <span className="absolute left-2 top-2 rounded-full bg-[#f4c35e] px-2 py-1 text-[9px] font-bold text-[#4b1715]">Bestseller</span>}
                    </Link>
                    <div className="p-3">
                      <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-[#ad7929]">{relatedProduct.category}{relatedProduct.subCategory ? ` · ${relatedProduct.subCategory}` : ''}</p>
                      <Link to={`/product/${relatedProduct.productId}`} className="mt-1 block min-h-10 text-sm font-bold leading-5 text-[#4b1715] hover:text-[#9c6a27]">{relatedProduct.name}</Link>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-extrabold text-[#74180f]">{Number.isFinite(price) ? `₹${price.toLocaleString('en-IN')}` : 'Price on request'}</span>
                        {Number(relatedProduct.offerPrice) > 0 && Number(relatedProduct.offerPrice) < Number(relatedProduct.price) && <span className="text-[10px] text-gray-400 line-through">₹{Number(relatedProduct.price).toLocaleString('en-IN')}</span>}
                      </div>
                      <button type="button" onClick={() => addRelatedToCart(relatedProduct)} disabled={relatedProduct.stock <= 0} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#74180f] px-2 py-2.5 text-[10px] font-bold text-white transition hover:bg-[#5a1112] disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs">
                        <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

      </PageContainer>
    </div>
  );
}

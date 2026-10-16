import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Award, Gift, Gem, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { BACKEND_BASE_URL } from '../api';
import { ProductCard, type Product } from '../components/CommonComponents/ProductCard';
import PageHeader from '../components/CommonComponents/PageHeader.jsx';

type OfferProduct = Product & {
  occasion?: string[] | string;
};

type BannerOffer = {
  id?: string | number;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  link?: string;
  active?: boolean | number;
  type?: string;
};

const imageAsset = (number: number) => `/Gold Shop Images/shopping (${number}).webp`;

const productCollections = [
  {
    key: 'featured',
    title: 'Featured Jewellery',
    description: 'Handpicked jewellery and signature designs.',
    icon: Sparkles,
  },
  {
    key: 'bestSeller',
    title: 'Best Sellers',
    description: 'Customer favourites loved for their timeless design.',
    icon: Award,
  },
  {
    key: 'newArrival',
    title: 'New Arrivals',
    description: 'The latest designs, just added to our collection.',
    icon: Star,
  },
] as const;

function isProductFlagged(value: unknown) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function getBannerImage(source?: string) {
  if (!source) return '';
  if (/^(https?:|data:|blob:)/i.test(source) || source.startsWith('/Gold Shop Images/')) return source;
  return `${BACKEND_BASE_URL}${source.startsWith('/') ? source : `/${source}`}`;
}

function getProductImage(product: OfferProduct) {
  const image = product.images?.[0];
  if (!image) return '';
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${BACKEND_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`;
}

function OfferProductCard({ product }: { product: OfferProduct }) {
  const shownPrice = Number(product.offerPrice > 0 ? product.offerPrice : product.price) || 0;
  const originalPrice = Number(product.price) || 0;
  const image = getProductImage(product);

  const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <article className="overflow-hidden rounded-lg border border-[#eadfd1] bg-white transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/product/${product.productId}`} className="relative block aspect-square overflow-hidden bg-[#fff8ec]">
        <img src={image || imageAsset(10)} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" />
        <span className="absolute left-2 top-2 rounded-sm bg-[#b5121b] px-2 py-1 text-[9px] font-extrabold text-white">
          {product.discount > 0 ? `${product.discount}% OFF` : 'SPECIAL OFFER'}
        </span>
      </Link>
      <div className="p-2.5">
        <p className="truncate text-[9px] text-gray-500">{product.purity}{product.weight ? ` · ${product.weight} ${product.weightUnit || 'g'}` : ''}</p>
        <Link to={`/product/${product.productId}`} className="mt-1 block min-h-8 text-xs font-bold leading-4 text-[#351414] hover:text-[#74180f]">
          {product.name}
        </Link>
        <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
          <span className="text-sm font-extrabold text-[#74180f]">{formatPrice(shownPrice)}</span>
          {originalPrice > shownPrice && <span className="text-[10px] text-gray-400 line-through">{formatPrice(originalPrice)}</span>}
        </div>
        <div className="mt-2 flex gap-1">
          <Link to={`/product/${product.productId}`} className="flex-1 rounded bg-[#5a1112] px-2 py-1.5 text-center text-[10px] font-bold text-white hover:bg-[#3f0b0c]">
            Shop Offer
          </Link>
          <span className="flex items-center rounded border border-[#eadfd1] px-2 text-[9px] font-bold text-[#825215]">
            {product.stock > 0 ? 'In stock' : 'Sold out'}
          </span>
        </div>
      </div>
    </article>
  );
}

function OffersPage() {
  const [products, setProducts] = useState<OfferProduct[]>([]);
  const [banners, setBanners] = useState<BannerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Offers');

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get('/products'), api.get('/banners')])
      .then(([productResponse, bannerResponse]) => {
        if (!mounted) return;
        const activeProducts = (Array.isArray(productResponse.data?.products) ? productResponse.data.products : [])
          .filter((product: OfferProduct) => product.status === 'Active');
        const activeBanners = (Array.isArray(bannerResponse.data?.data) ? bannerResponse.data.data : [])
          .filter((banner: BannerOffer) => banner.type === 'offer' && (banner.active === true || banner.active === 1));
        setProducts(activeProducts);
        setBanners(activeBanners);
      })
      .catch((error) => {
        console.error('Failed to load offers:', error);
        if (mounted) setLoadError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const offerProducts = useMemo(() => {
    const discounted = products.filter((product) => Number(product.discount) > 0 || (Number(product.offerPrice) > 0 && Number(product.offerPrice) < Number(product.price)));
    if (activeFilter === 'All Offers') return discounted;
    if (activeFilter === 'Gold Jewellery') return discounted.filter((product) => !/diamond/i.test(product.category));
    if (activeFilter === 'Diamond Jewellery') return discounted.filter((product) => /diamond/i.test(`${product.category} ${product.name}`));
    if (activeFilter === 'Festival Offers') return discounted.filter((product) => /festival|occasion/i.test(`${product.occasion || ''}`));
    return discounted.filter((product) => /bridal|wedding|temple/i.test(`${product.category} ${product.name}`));
  }, [products, activeFilter]);

  const promoCards = [
    { title: 'Wedding Special Offers', subtitle: 'Up to 25% OFF', image: imageAsset(21), action: 'Explore Now' },
    { title: 'Diamond Collection Offer', subtitle: 'Flat 20% OFF', image: imageAsset(20), action: 'Shop Now' },
    { title: 'Gold Jewellery Offer', subtitle: 'Making Charges Free', image: imageAsset(14), action: 'Shop Now' },
    { title: 'Temple Jewellery Offer', subtitle: 'Up to 15% OFF', image: imageAsset(32), action: 'View Collection' },
  ];
  const offerTiles = banners.length
    ? banners.slice(0, 4).map((banner, index) => ({
      id: banner.id || index,
      title: banner.title || promoCards[index % promoCards.length].title,
      subtitle: banner.subtitle || banner.description || promoCards[index % promoCards.length].subtitle,
      image: getBannerImage(banner.image) || promoCards[index % promoCards.length].image,
      action: banner.link ? 'Explore Now' : promoCards[index % promoCards.length].action,
      link: banner.link || '/shop',
    }))
    : promoCards.map((card, index) => ({ ...card, id: index, link: '/shop' }));
  const filters = ['All Offers', 'Gold Jewellery', 'Diamond Jewellery', 'Bridal Collection', 'Temple Jewellery', 'Festival Offers'];

  return (
    <div className="min-h-screen bg-[#fffdf8] text-primary">
      <PageHeader
        breadcrumb="Offers"
        title="Offers"
        subtitle="Exclusive Offers for Every Occasion"
        description="Explore our latest offers and festive collections on gold, diamond and traditional jewellery, crafted to make your celebrations more special."
        className="flex h-[300px] items-center"
        contentClassName="py-4"
        titleClassName="text-4xl sm:text-5xl lg:text-6xl"
      />

      <main className="mx-auto max-w-[1700px] px-[6%] py-3 sm:px-[5%] lg:px-[3%]">
        <nav aria-label="Breadcrumb" className="mb-3 flex gap-2 text-[10px] text-gray-500">
          <Link to="/" className="hover:text-[#74180f]">Home</Link><span aria-hidden="true">›</span><span>Offers</span>
        </nav>

        <section aria-label="Featured promotions" className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {offerTiles.map((offer) => (
            <Link key={offer.id} to={offer.link} className="group relative isolate flex min-h-[105px] items-center overflow-hidden rounded-md bg-[#350c0b] p-3 text-white sm:min-h-[125px] sm:p-4">
              <img src={offer.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#260809]/95 via-[#400b0d]/70 to-transparent" />
              <div className="relative z-10 max-w-[70%]">
                <h2 className="font-serif text-xs font-bold leading-tight sm:text-sm">{offer.title}</h2>
                <p className="mt-1 font-serif text-sm font-bold text-[#f5cd69] sm:text-lg">{offer.subtitle}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#f1bf54] px-2.5 py-1 text-[9px] font-bold text-[#401010]">{offer.action}<ArrowRight className="h-3 w-3" /></span>
              </div>
            </Link>
          ))}
        </section>

        <section aria-label="Shop featured product collections" className="space-y-10 py-6 sm:py-8">
          {productCollections.map(({ key, title, description, icon: Icon }) => {
            const collection = products.filter((product) => isProductFlagged(product[key]));
            return (
              <section key={key} aria-labelledby={`offers-${key}-heading`} className="scroll-mt-24">
                <div className="mb-4 flex items-end justify-between gap-3 border-b border-[#eadfd1] pb-3">
                  <div>
                    <p className="mb-1 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-[#a66b1a]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      Curated collection
                    </p>
                    <h2 id={`offers-${key}-heading`} className="font-serif text-xl font-bold text-[#4b1715] sm:text-2xl">{title}</h2>
                    <p className="mt-1 text-xs text-gray-500">{description}</p>
                  </div>
                  <Link to="/shop" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fff2d5] px-3 py-2 text-[10px] font-bold text-[#5a1112] transition hover:bg-[#f5d995]">
                    Shop all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                {loading ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 5 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-xl bg-brand-100" />)}
                  </div>
                ) : collection.length ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {collection.map((product, index) => (
                      <ProductCard key={product.productId} product={product} index={index} showCollectionBadges={false} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#eadfd1] bg-white px-4 py-8 text-center">
                    <p className="font-serif text-base font-bold text-[#4b1715]">No {title.toLowerCase()} yet</p>
                    <p className="mt-1 text-xs text-gray-500">New designs will appear here when they are added to this collection.</p>
                  </div>
                )}
              </section>
            );
          })}
        </section>

        <section className="py-4 sm:py-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#a66b1a]">Limited-time savings</p>
              <h2 className="font-serif text-xl font-bold text-[#4b1715] sm:text-2xl">Featured Offers</h2>
            </div>
            <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`shrink-0 rounded-md border px-2.5 py-1.5 text-[9px] font-semibold transition sm:text-[10px] ${activeFilter === filter ? 'border-[#5a1112] bg-[#5a1112] text-white' : 'border-[#eadfd1] bg-white text-gray-700 hover:border-[#b88836]'}`}>
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {Array.from({ length: 7 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-brand-100" />)}
            </div>
          ) : loadError ? (
            <div role="alert" className="rounded-lg border border-red-100 bg-white py-10 text-center text-sm text-red-700">
              Offers could not be loaded. Please try again later.
            </div>
          ) : offerProducts.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {offerProducts.map((product) => <OfferProductCard key={product.productId} product={product} />)}
            </div>
          ) : (
            <div className="rounded-lg border border-[#eadfd1] bg-white py-9 text-center">
              <p className="font-serif text-lg font-bold text-[#4b1715]">No featured offers right now</p>
              <p className="mt-1 text-xs text-gray-500">Explore our jewellery collection and check back for new offers.</p>
              <Link to="/shop" className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#5a1112] px-4 py-2 text-xs font-bold text-white hover:bg-[#3f0b0c]">Browse Jewellery <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          )}
        </section>

        <section className="grid gap-2 pb-5 sm:grid-cols-2">
          <Link to="/shop" className="group relative isolate flex min-h-[112px] items-center overflow-hidden rounded-lg bg-[#5a1112] p-4 text-white">
            <img src={imageAsset(28)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            <span className="absolute inset-0 -z-0 bg-gradient-to-r from-[#34100a]/95 via-[#54200c]/75 to-transparent" />
            <span className="relative z-10 max-w-xs"><span className="block font-serif text-lg font-bold text-[#f8dfa0]">Akshaya Tritiya Specials</span><span className="mt-1 block text-[10px] text-white/85">Bring prosperity home with exclusive gold jewellery offers.</span><span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#f1bf54] px-3 py-1 text-[9px] font-bold text-[#401010]">Shop Now <ArrowRight className="h-3 w-3" /></span></span>
          </Link>
          <Link to="/shop" className="group relative isolate flex min-h-[112px] items-center overflow-hidden rounded-lg bg-[#5a1112] p-4 text-white">
            <img src={imageAsset(10)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            <span className="absolute inset-0 -z-0 bg-gradient-to-r from-[#34100a]/95 via-[#54200c]/75 to-transparent" />
            <span className="relative z-10 max-w-xs"><span className="block font-serif text-lg font-bold text-[#f8dfa0]">Festival Gold & Diamond Offers</span><span className="mt-1 block text-[10px] text-white/85">Celebrate every festival with jewellery collections made to shine.</span><span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#f1bf54] px-3 py-1 text-[9px] font-bold text-[#401010]">Explore Collection <ArrowRight className="h-3 w-3" /></span></span>
          </Link>
        </section>

        <section className="grid grid-cols-2 gap-2 border-t border-[#efe3d3] py-3 text-center sm:grid-cols-4">
          {[
            { icon: Truck, title: 'Free & Insured Delivery', detail: 'Across India' },
            { icon: ShieldCheck, title: 'BIS Hallmarked Gold', detail: 'Purity you can trust' },
            { icon: Gem, title: 'Certified Diamonds', detail: 'Quality assured' },
            { icon: Gift, title: 'Exclusive Offers', detail: 'On special occasions' },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="flex items-center justify-center gap-2 py-2">
              <Icon className="h-5 w-5 shrink-0 text-[#c88316]" />
              <span className="text-left"><span className="block text-[10px] font-bold text-[#3b1815]">{title}</span><span className="block text-[9px] text-gray-500">{detail}</span></span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default OffersPage;

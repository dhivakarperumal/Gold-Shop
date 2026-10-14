import { useEffect, useState } from 'react';
import {
  ArrowRight, Award, BadgeCheck, BookOpen, Clock3, Gem, Heart,
  HeartHandshake, IndianRupee, Instagram, MapPin, ShieldCheck, Users,
  Sparkles, Store, Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { BACKEND_BASE_URL } from '../../api';
import { ProductCard } from '../CommonComponents/ProductCard';
import PageContainer from '../CommonComponents/PageContainer.jsx';
import { categories as storeCategories } from '../../lib/categoryData';
import Hero from './Hero/Hero.jsx';

const imageAsset = (number) => `/Gold Shop Images/shopping (${number}).webp`;

function resolveImageUrl(image) {
  if (!image) return '';
  if (/^(https?:|data:|blob:)/i.test(image) || image.startsWith('/Gold Shop Images/')) return image;
  return `${BACKEND_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`;
}

function getProductImage(product) {
  let images = product?.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch {
      images = [images];
    }
  }
  return resolveImageUrl(Array.isArray(images) ? images[0] : '');
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-8 text-center">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
      <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-xl text-xs text-gray-500 sm:text-sm">{description}</p>}
    </div>
  );
}

export function Home() {
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => {
        setProducts((data.products || []).filter((product) => product.status === 'Active'));
      })
      .catch((error) => {
        console.error('Failed to load storefront products:', error);
      })
      .finally(() => setLoading(false));

    api.get('/banners')
      .then(({ data }) => {
        setOffers((Array.isArray(data?.data) ? data.data : [])
          .filter((banner) => banner.type === 'offer' && (banner.active === true || banner.active === 1)));
      })
      .catch((error) => {
        console.error('Failed to load promotional banners:', error);
      });
  }, []);

  const categoryNames = [...new Set([
    ...products.map((product) => product.category),
    ...storeCategories.map((category) => category.categoryName),
  ].filter(Boolean))];
  const visibleProducts = activeCategory === 'All'
    ? products
    : products.filter((product) => product.category === activeCategory);
  const featuredProducts = products.filter((product) => product.featured);
  const filteredFeaturedProducts = activeCategory === 'All'
    ? featuredProducts
    : featuredProducts.filter((product) => product.category === activeCategory);
  const displayProducts = (filteredFeaturedProducts.length ? filteredFeaturedProducts : visibleProducts).slice(0, 6);
  const categoryProducts = categoryNames.slice(0, 8).map((name, index) => ({
    name,
    product: products.find((product) => product.category === name),
    fallbackImage: imageAsset(index + 1),
  }));

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent('Newsletter subscription request');
    const body = encodeURIComponent(`Please subscribe ${newsletterEmail} to your newsletter.`);
    window.location.href = `mailto:support@kanakgold.com?subject=${subject}&body=${body}`;
  };

  const offerCards = offers.slice(0, 3);
  const promoFallbacks = [
    { title: 'Bridal Collection', subtitle: 'For your special day', image: imageAsset(10), action: 'Explore Collection' },
    { title: 'Everyday Elegance', subtitle: 'Jewellery for every moment', image: imageAsset(23), action: 'Discover More' },
    { title: 'Diamond Collection', subtitle: 'Brilliance for every occasion', image: imageAsset(20), action: 'View Collection' },
  ];

  const collections = [
    { title: 'Wedding Collection', image: imageAsset(10) },
    { title: 'Daily Wear Collection', image: imageAsset(21) },
    { title: 'Temple Jewellery', image: imageAsset(32) },
    { title: 'Diamond Collection', image: imageAsset(20) },
  ];

  const benefits = [
    { icon: ShieldCheck, title: 'BIS Hallmarked', description: 'Hallmark information on eligible pieces' },
    { icon: IndianRupee, title: 'Transparent Pricing', description: 'Clear product and price details' },
    { icon: Store, title: 'Exclusive Designs', description: 'Traditional and modern styles' },
    { icon: BadgeCheck, title: 'Certified Jewellery', description: 'Purity details shown with products' },
    { icon: HeartHandshake, title: 'Helpful Support', description: 'Our team is ready to assist' },
    { icon: Sparkles, title: 'Made for Moments', description: 'Find a piece for every occasion' },
  ];

  const editorialCards = [
    { title: 'A Guide to Choosing Jewellery for Your Wedding', image: imageAsset(24), category: 'STYLE GUIDE' },
    { title: 'How to Care for Your Gold Jewellery', image: imageAsset(26), category: 'JEWELLERY CARE' },
    { title: 'Explore Traditional Temple Jewellery', image: imageAsset(33), category: 'COLLECTIONS' },
  ];

  const instagramImages = [10, 15, 20, 21, 24, 27, 32, 36];

  return (
    <div className="overflow-hidden bg-[#fffdf8] text-primary">
      <Hero />

      <section className="border-y border-brand-100 bg-brand-50">
        <PageContainer className="py-4">
          <div className="grid grid-cols-2 divide-x divide-brand-200 md:grid-cols-4">
            {[
              { icon: ShieldCheck, title: '100%', desc: 'BIS Hallmarked Gold' },
              { icon: Gem, title: 'Certified', desc: 'Diamond Jewellery' },
              { icon: IndianRupee, title: 'Best Price', desc: 'Assured Gold Rate' },
              { icon: Truck, title: 'Secure & Safe', desc: 'Delivery Across India' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center justify-center gap-2 border-b border-brand-200 px-2 py-3 last:border-b-0 sm:gap-3 md:border-b-0 md:px-4">
                <Icon className="h-6 w-6 shrink-0 text-secondary sm:h-7 sm:w-7" />
                <div>
                  <p className="text-xs font-bold leading-tight text-primary sm:text-sm">{title}</p>
                  <p className="mt-0.5 text-[9px] leading-tight text-gray-600 sm:text-[11px]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-12">
        <PageContainer>
          <SectionHeading eyebrow="Find Your Style" title="Shop by Category" description="Explore our jewellery collections, crafted for every occasion." />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {categoryProducts.map(({ name, product, fallbackImage }) => {
              const image = getProductImage(product) || fallbackImage;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setActiveCategory(name);
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group text-center"
                >
                  <span className="mx-auto block aspect-square overflow-hidden rounded-full border border-brand-100 bg-brand-50 p-1 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md">
                    <img src={image} alt="" className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                  </span>
                  <span className="mt-2 block text-[11px] font-semibold text-primary sm:text-xs">{name}</span>
                </button>
              );
            })}
          </div>
        </PageContainer>
      </section>

      <section className="pb-10">
        <PageContainer className="grid gap-3 md:grid-cols-3">
          {(offerCards.length ? offerCards : promoFallbacks).map((offer, index) => {
            const image = resolveImageUrl(offer.image) || promoFallbacks[index % promoFallbacks.length].image;
            const title = offer.title || promoFallbacks[index % promoFallbacks.length].title;
            const description = offer.subtitle || offer.description || promoFallbacks[index % promoFallbacks.length].subtitle;
            return (
              <Link key={offer.id || title} to="/#products" className="group relative isolate flex min-h-40 items-end overflow-hidden rounded-xl bg-primary p-5 shadow-sm sm:min-h-48">
                <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 -z-0 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent" />
                <div className="relative z-10 max-w-[85%] text-white">
                  <p className="text-lg font-bold leading-tight sm:text-xl">{title}</p>
                  <p className="mt-1 text-xs text-white/80">{description}</p>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[10px] font-bold text-primary">
                    {offer.link ? 'Explore Offer' : promoFallbacks[index % promoFallbacks.length].action} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </PageContainer>
      </section>

      <section id="products" className="scroll-mt-28 py-10 sm:py-14">
        <PageContainer>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">Handpicked for you</p>
              <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">Featured Jewellery</h2>
            </div>
            <a href="#products" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-4 py-2 text-[10px] font-bold text-primary sm:text-xs">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
            {['All', ...categoryNames].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-semibold transition-colors sm:text-xs ${activeCategory === category ? 'bg-[#74180f] text-white' : 'bg-white text-gray-600 ring-1 ring-brand-100 hover:text-secondary-dark'}`}
              >
                {category}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[...Array(6)].map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-brand-100" />)}
            </div>
          ) : displayProducts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {displayProducts.map((product, index) => <ProductCard key={product.productId} product={product} index={index} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-brand-100 bg-white py-12 text-center text-sm text-gray-500">New jewellery is being added to this collection.</div>
          )}
        </PageContainer>
      </section>

      <section className="py-5 sm:py-8">
        <PageContainer>
          <div className="relative isolate flex min-h-48 items-center overflow-hidden rounded-xl bg-[#3c130d] px-6 py-8 sm:min-h-64 sm:px-12">
            <img src={imageAsset(25)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#260a06]/90 via-[#38120b]/65 to-transparent" />
            <div className="relative z-10 max-w-sm text-white">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">Sri Vengateshwara</p>
              <h2 className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl">Festive Collection</h2>
              <p className="mt-2 text-xs text-white/80">Discover jewellery for celebrations, gifting, and every special moment.</p>
              <Link to="/#products" className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[10px] font-bold text-primary">
                Shop the Collection <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14">
        <PageContainer>
          <SectionHeading eyebrow="Made for every occasion" title="Explore Our Collections" description="Find a design that feels like it was made just for you." />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {collections.map((collection) => (
              <Link key={collection.title} to="/#products" className="group relative isolate aspect-[1.1/1] overflow-hidden rounded-lg bg-primary">
                <img src={collection.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 -z-0 bg-gradient-to-t from-primary/85 via-transparent to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <h3 className="font-serif text-sm font-bold sm:text-lg">{collection.title}</h3>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[9px] font-bold text-primary">Explore <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="border-y border-brand-100 bg-[#fffaf0] py-10 sm:py-14">
        <PageContainer>
          <SectionHeading eyebrow="The Sri Vengateshwara promise" title="Why Choose Us?" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-lg border border-brand-100 bg-white px-3 py-5 text-center shadow-sm">
                <Icon className="mx-auto h-7 w-7 text-secondary" />
                <h3 className="mt-3 text-xs font-bold text-primary">{title}</h3>
                <p className="mt-1 text-[10px] leading-4 text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14">
        <PageContainer>
          <div className="grid overflow-hidden rounded-xl bg-[#f6ead3] md:grid-cols-2">
            <div className="relative isolate flex min-h-48 items-end overflow-hidden bg-primary p-6 sm:min-h-64 sm:p-10">
              <img src={imageAsset(28)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#2a1007]/90 to-[#2a1007]/30" />
              <div className="relative z-10 text-white">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">Gold Rate</p>
                <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">Today's Gold Rate</h2>
                <p className="mt-2 text-xs text-white/80">Rates may change throughout the day. Contact us for current pricing.</p>
                <a href="tel:+919080281344" className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[10px] font-bold text-primary">
                  Call for Today's Rate <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:p-6">
              {[
                { title: 'Gold Jewellery', description: 'Browse available gold designs', icon: Gem },
                { title: 'Diamond Jewellery', description: 'Explore diamond collections', icon: Sparkles },
              ].map(({ title, description, icon: Icon }) => (
                <Link key={title} to="/#products" className="flex flex-col justify-center rounded-lg border border-white bg-white/80 p-4 sm:p-6">
                  <Icon className="h-7 w-7 text-secondary" />
                  <h3 className="mt-4 font-serif text-sm font-bold text-primary sm:text-lg">{title}</h3>
                  <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">{description}</p>
                  <span className="mt-3 text-[10px] font-bold text-secondary-dark">Shop now <ArrowRight className="inline h-3 w-3" /></span>
                </Link>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="pb-12 sm:pb-16">
        <PageContainer>
          <div className="grid items-center gap-7 lg:grid-cols-[0.8fr_1.4fr_0.8fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">About Us</p>
              <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-primary sm:text-3xl">Crafting Trust for Generations</h2>
              <p className="mt-3 text-xs leading-5 text-gray-600">Discover thoughtfully selected gold and diamond jewellery, with clear product details to help you choose with confidence.</p>
              <Link to="/about" className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[10px] font-bold text-primary">Know More <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="overflow-hidden rounded-lg">
              <img src={imageAsset(30)} alt="Jewellery showroom" className="h-52 w-full object-cover sm:h-64" loading="lazy" />
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              {[
                { icon: Users, title: 'Personal Service', description: 'Guidance for your selection' },
                { icon: Award, title: 'Quality Details', description: 'Product information at a glance' },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-center gap-3">
                  <Icon className="h-7 w-7 shrink-0 text-secondary" />
                  <div><h3 className="text-xs font-bold text-primary">{title}</h3><p className="mt-1 text-[10px] text-gray-500">{description}</p></div>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="border-y border-brand-100 bg-white py-10 sm:py-14">
        <PageContainer>
          <SectionHeading eyebrow="Here to help" title="A Personal Jewellery Experience" description="Our team is ready to help with product details, availability, and choosing a piece for your occasion." />
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 rounded-xl border border-brand-100 bg-[#fffaf0] p-5 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-3">
              <HeartHandshake className="h-9 w-9 shrink-0 text-secondary" />
              <div><p className="text-sm font-bold text-primary">Need help choosing?</p><p className="mt-1 text-xs text-gray-500">Talk with our jewellery team.</p></div>
            </div>
            <a href="tel:+919080281344" className="rounded-full bg-[#74180f] px-5 py-2.5 text-xs font-bold text-white">Call +91 90802 81344</a>
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14">
        <PageContainer>
          <div className="mb-6 flex items-end justify-between">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">Read & discover</p><h2 className="mt-1 font-serif text-2xl font-bold text-primary sm:text-3xl">Jewellery Guides</h2></div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500">Style & care <BookOpen className="h-3.5 w-3.5" /></span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {editorialCards.map((article) => (
              <article key={article.title} className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-sm">
                <img src={article.image} alt="" className="h-32 w-full object-cover sm:h-40" loading="lazy" />
                <div className="p-4">
                  <p className="text-[9px] font-bold tracking-widest text-secondary">{article.category}</p>
                  <h3 className="mt-2 font-serif text-sm font-bold leading-snug text-primary">{article.title}</h3>
                  <Link to="/#products" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-secondary-dark">Explore jewellery <ArrowRight className="h-3 w-3" /></Link>
                </div>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="pb-10 sm:pb-14">
        <PageContainer>
          <SectionHeading eyebrow="Follow our collections" title="Follow Us on Instagram" description="A closer look at designs and details from our collections." />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {instagramImages.map((number) => (
              <Link key={number} to="/#products" className="group aspect-square overflow-hidden rounded-md bg-brand-100">
                <img src={imageAsset(number)} alt="Jewellery collection inspiration" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
              </Link>
            ))}
          </div>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="mx-auto mt-5 flex w-fit items-center gap-2 text-xs font-bold text-secondary-dark">
            <Instagram className="h-4 w-4" /> Find us on Instagram
          </a>
        </PageContainer>
      </section>

      <section className="bg-[#5b100d] py-6 text-white">
        <PageContainer className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <h2 className="font-serif text-lg font-bold">Subscribe to Our Newsletter</h2>
            <p className="mt-1 text-[10px] text-white/75">Get updates about new collections and jewellery inspiration.</p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-md overflow-hidden rounded-md border border-white/30 sm:w-auto">
            <label htmlFor="home-newsletter-email" className="sr-only">Enter your email address</label>
            <input id="home-newsletter-email" type="email" required value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="Enter your email address" className="min-w-0 flex-1 bg-white px-3 py-2.5 text-xs text-primary outline-none sm:w-64" />
            <button type="submit" className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-xs font-bold text-primary">Subscribe <ArrowRight className="h-3 w-3" /></button>
          </form>
        </PageContainer>
      </section>

      <section className="border-t border-brand-100 bg-[#fffaf0] py-5">
        <PageContainer className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[10px] font-semibold text-gray-500 sm:justify-between">
          <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-secondary" /> Valasaravakkam, Chennai</span>
          <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-secondary" /> Contact us for store hours</span>
          <span className="inline-flex items-center gap-2"><Heart className="h-3.5 w-3.5 text-secondary" /> Made for your precious moments</span>
        </PageContainer>
      </section>
    </div>
  );
}

export default Home;

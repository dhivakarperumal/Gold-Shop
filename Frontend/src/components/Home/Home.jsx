import { useEffect, useState } from 'react';
import {
  ArrowRight, Award, BadgeCheck, BookOpen, Clock3, Gem, Heart,
  HeartHandshake, IndianRupee, MapPin, ShieldCheck, Users,
  Sparkles, Store, Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';
import PageContainer from '../CommonComponents/PageContainer.jsx';
import Category from './Categeory/Category.jsx';
import ExploreCollections from './ExploreCollections/ExploreCollections.jsx';
import Hero from './Hero/Hero.jsx';
import Instagram from './Instagram/Instagram.jsx';
import PromotionalCollections from './PromotionalCollections/PromotionalCollections.jsx';
import Products from './Products/Products.jsx';
import WhyChooseUs from './WhyChooseUs/WhyChooseUs.jsx';

const imageAsset = (number) => `/Gold Shop Images/shopping (${number}).webp`;

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-8 text-center">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
      <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-xl text-xs text-gray-500 sm:text-sm">{description}</p>}
    </div>
  );
}

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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

    api.get('/categories')
      .then(({ data }) => {
        const fetchedCategories = Array.isArray(data?.categories) ? data.categories : [];
        setCategories(fetchedCategories.filter((category) => (
          category.status !== 'Inactive' && typeof category.categoryName === 'string'
        )));
      })
      .catch((error) => {
        console.error('Failed to load storefront categories:', error);
      });

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
    ...categories.map((category) => category.categoryName),
    ...products.map((product) => product.category),
  ].filter(Boolean))];
  const visibleProducts = activeCategory === 'All'
    ? products
    : products.filter((product) => product.category === activeCategory);
  const featuredProducts = products.filter((product) => product.featured);
  const filteredFeaturedProducts = activeCategory === 'All'
    ? featuredProducts
    : featuredProducts.filter((product) => product.category === activeCategory);
  const displayProducts = (filteredFeaturedProducts.length ? filteredFeaturedProducts : visibleProducts).slice(0, 6);
  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent('Newsletter subscription request');
    const body = encodeURIComponent(`Please subscribe ${newsletterEmail} to your newsletter.`);
    window.location.href = `mailto:support@kanakgold.com?subject=${subject}&body=${body}`;
  };

  const editorialCards = [
    { title: 'A Guide to Choosing Jewellery for Your Wedding', image: imageAsset(24), category: 'STYLE GUIDE' },
    { title: 'How to Care for Your Gold Jewellery', image: imageAsset(26), category: 'JEWELLERY CARE' },
    { title: 'Explore Traditional Temple Jewellery', image: imageAsset(33), category: 'COLLECTIONS' },
  ];

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

      <Category
        categories={categories}
        products={products}
        onSelectCategory={(category) => {
          setActiveCategory(category);
          document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <PromotionalCollections offers={offers} />

      <Products
        categories={categoryNames}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        products={displayProducts}
        loading={loading}
      />

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

      <ExploreCollections />

      <WhyChooseUs />

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

      <Instagram />

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

export const Home = HomePage;
export default HomePage;

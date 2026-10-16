import { ArrowRight, Award, Sparkles, Star } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../../../api';
import { ProductCard } from '../../CommonComponents/ProductCard';
import PageContainer from '../../CommonComponents/PageContainer.jsx';

const collections = [
  {
    key: 'featured',
    title: 'Featured Jewellery',
    eyebrow: 'Handpicked for you',
    description: 'Explore our most-loved designs, selected for their exceptional craftsmanship.',
    icon: Sparkles,
  },
  {
    key: 'newArrival',
    title: 'New Arrivals',
    eyebrow: 'Just added',
    description: 'Be among the first to explore the latest additions to our collection.',
    icon: Star,
  },
  {
    key: 'bestSeller',
    title: 'Best Sellers',
    eyebrow: 'Customer favourites',
    description: 'Discover the jewellery customers come back for again and again.',
    icon: Award,
  },
];

const isFlagged = (value) => value === true || value === 1 || value === '1' || value === 'true';

function resolveBannerImage(image) {
  if (!image) return '';
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${BACKEND_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`;
}

function OfferBanner({ offer }) {
  const image = resolveBannerImage(offer.image);
  const mobileImage = resolveBannerImage(offer.mobile_image);
  const title = offer.title || 'A special offer for you';
  const description = offer.subtitle || offer.description || 'Explore our latest jewellery offers.';
  const link = offer.link || '/shop';
  const content = (
    <>
      {image && (
        <picture className="absolute inset-0 -z-20">
          {mobileImage && <source media="(max-width: 639px)" srcSet={mobileImage} />}
          <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
        </picture>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#250908]/90 via-[#38120b]/65 to-[#38120b]/10 sm:from-[#250908]/85 sm:via-[#38120b]/50" />
      <div className="relative z-10 max-w-2xl py-8 sm:py-12">
        <span className="inline-flex items-center rounded-full border border-[#f5d78e]/50 bg-[#3b1a13]/50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-[#f8dfa0] backdrop-blur-sm">
          Limited-time offer
        </span>
        <h2 className="mt-3 max-w-xl font-serif text-2xl font-bold leading-tight text-white sm:text-4xl">{title}</h2>
        <p className="mt-2 max-w-lg text-xs leading-5 text-white/85 sm:text-sm sm:leading-6">{description}</p>
        <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f1bf54] px-4 py-2.5 text-xs font-bold text-[#381413] shadow-lg transition group-hover:bg-white">
          Explore offer <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <span aria-hidden="true" className="absolute right-6 top-6 hidden h-24 w-24 rounded-full border border-white/20 sm:block" />
      <span aria-hidden="true" className="absolute right-12 top-12 hidden h-12 w-12 rounded-full border border-[#f1bf54]/50 sm:block" />
    </>
  );

  const className = 'group relative isolate block min-h-56 overflow-hidden rounded-2xl bg-[#38120b] px-6 text-left shadow-[0_18px_45px_rgba(56,18,11,0.18)] sm:min-h-72 sm:px-10';
  return /^https?:\/\//i.test(link) ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className={className} aria-label={`Explore offer: ${title}`}>
      {content}
    </a>
  ) : (
    <Link to={link.startsWith('/') ? link : `/${link}`} className={className} aria-label={`Explore offer: ${title}`}>
      {content}
    </Link>
  );
}

export default function Products({
  categories,
  activeCategory,
  onSelectCategory,
  products,
  loading,
  offers = [],
}) {
  return (
    <section id="products" className="scroll-mt-28 py-10 sm:py-14">
      <PageContainer>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {['All', ...categories].map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              onClick={() => onSelectCategory(category)}
              className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-semibold transition-colors sm:text-xs ${activeCategory === category ? 'bg-[#74180f] text-white' : 'bg-white text-gray-600 ring-1 ring-brand-100 hover:text-secondary-dark'}`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="space-y-12 sm:space-y-16">
          {collections.map(({ key, title, eyebrow, description, icon: Icon }) => {
            const collectionProducts = products.filter((product) => isFlagged(product[key]));
            return (
              <Fragment key={key}>
                <section id={`home-${key}`} aria-labelledby={`home-${key}-title`} className="scroll-mt-28">
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">
                        <Icon className="h-4 w-4" aria-hidden="true" /> {eyebrow}
                      </p>
                      <h2 id={`home-${key}-title`} className="font-serif text-2xl font-bold text-primary sm:text-3xl">{title}</h2>
                      <p className="mt-1 max-w-xl text-xs text-gray-500 sm:text-sm">{description}</p>
                    </div>
                    <a href="/shop" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-4 py-2 text-[10px] font-bold text-primary transition hover:bg-[#e7b54a] sm:text-xs">
                      View All <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  {loading ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {[...Array(5)].map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-brand-100" />)}
                    </div>
                  ) : collectionProducts.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {collectionProducts.map((product, index) => (
                        <ProductCard key={product.productId} product={product} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-brand-100 bg-white py-8 text-center text-sm text-gray-500">
                      No {title.toLowerCase()} products are available in this category yet.
                    </div>
                  )}
                </section>
                {key === 'featured' && offers.length > 0 && (
                  <OfferBanner key={`offer-${offers[0].id || 'active'}`} offer={offers[0]} />
                )}
                {key === 'newArrival' && offers.length > 1 && (
                  <OfferBanner key={`offer-${offers[1].id || 'active-2'}`} offer={offers[1]} />
                )}
              </Fragment>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}

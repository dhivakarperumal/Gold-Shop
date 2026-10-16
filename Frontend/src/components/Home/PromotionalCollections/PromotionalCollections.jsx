import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../../../api';
import PageContainer from '../../CommonComponents/PageContainer.jsx';

const imageAsset = (number) => `/Gold Shop Images/shopping (${number}).webp`;

const fallbackOffers = [
  { title: 'Bridal Collection', subtitle: 'For your special day', image: imageAsset(10), action: 'Explore Collection' },
  { title: 'Everyday Elegance', subtitle: 'Jewellery for every moment', image: imageAsset(23), action: 'Discover More' },
  { title: 'Diamond Collection', subtitle: 'Brilliance for every occasion', image: imageAsset(20), action: 'View Collection' },
];

function resolveImageUrl(image) {
  if (!image) return '';
  if (/^(https?:|data:|blob:)/i.test(image) || image.startsWith('/Gold Shop Images/')) return image;
  return `${BACKEND_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`;
}

export default function PromotionalCollections({ offers }) {
  const cards = offers.length ? offers.slice(0, 3) : fallbackOffers;

  return (
    <section className="mt-8 pb-10 sm:mt-10">
      <PageContainer>
        <div className="mx-auto mb-7 max-w-3xl text-center sm:mb-9">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#a85c08] sm:text-xs">
            Exclusive Jewellery Offers
          </p>
          <h2 className="font-serif text-xl font-bold leading-tight text-[#641d19] sm:text-2xl lg:text-3xl">
            Celebrate Every Occasion with Special Savings
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
            Discover exceptional offers on gold, diamond, and bridal jewellery, crafted to make your precious moments even more memorable.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {cards.map((offer, index) => {
            const fallback = fallbackOffers[index % fallbackOffers.length];
            const image = resolveImageUrl(offer.image) || fallback.image;
            const title = offer.title || fallback.title;
            const description = offer.subtitle || offer.description || fallback.subtitle;
            return (
              <Link key={offer.id || title} to="/#products" className="group relative isolate flex min-h-40 items-end overflow-hidden rounded-xl bg-primary p-5 shadow-sm sm:min-h-48">
                <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 -z-0 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent" />
                <div className="relative z-10 max-w-[85%] text-white">
                  <p className="text-lg font-bold leading-tight sm:text-xl">{title}</p>
                  <p className="mt-1 text-xs text-white/80">{description}</p>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[10px] font-bold text-primary">
                    {offer.link ? 'Explore Offer' : fallback.action} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { BACKEND_BASE_URL } from '../../../api';
import PageContainer from '../../CommonComponents/PageContainer.jsx';

const fallbackBanner = {
  title: 'Timeless Gold for Every Occasion.',
  subtitle: 'Premium Gold Jewellery',
  description: 'Discover exquisite BIS hallmarked jewellery crafted with precision. From daily wear elegance to bridal grandeur.',
  image: '/Gold Shop Images/shopping (20).webp',
  mobile_image: '/Gold Shop Images/shopping (20).webp',
  link: '/#products',
};

function resolveBannerImage(image) {
  if (!image || /^(https?:|data:|blob:)/i.test(image) || image.startsWith('/Gold Shop Images/')) return image;
  const backendUrl = BACKEND_BASE_URL || window.location.origin;
  return `${backendUrl.replace(/\/$/, '')}${image.startsWith('/') ? image : `/${image}`}`;
}

export default function Hero() {
  const [banners, setBanners] = useState([fallbackBanner]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;

    api.get('/banners')
      .then(({ data }) => {
        if (!isMounted) return;
        const heroBanners = (Array.isArray(data?.data) ? data.data : [])
          .filter((item) => item.type === 'hero' && item.active);
        setBanners(heroBanners.length ? heroBanners : [fallbackBanner]);
        setActiveIndex(0);
      })
      .catch((error) => {
        console.error('Failed to load homepage hero banner:', error);
        toast.error('Could not load the latest homepage banner');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length < 2 || isPaused) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % banners.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [banners.length, isPaused]);

  const showSlide = (index) => {
    setActiveIndex((index + banners.length) % banners.length);
  };

  const content = banners[activeIndex] || fallbackBanner;
  const desktopImage = resolveBannerImage(content.image);
  const mobileImage = resolveBannerImage(content.mobile_image || content.image);
  const target = content.link || '/#products';
  const isExternalLink = /^https?:\/\//i.test(target);

  const callToAction = (
    <>
      Shop Now <ArrowRight className="h-5 w-5" />
    </>
  );

  return (
    <section
      className="relative isolate overflow-hidden bg-brand-50"
      aria-roledescription="carousel"
      aria-label="Featured jewellery"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      {desktopImage && (
        <div key={content.id || content.title} className="absolute inset-0 -z-10 animate-[hero-fade-in_500ms_ease-out]">
          <picture>
            {mobileImage && <source media="(max-width: 767px)" srcSet={mobileImage} />}
            <img
              src={desktopImage}
              alt={content.title || 'Featured jewellery collection'}
              className="h-full w-full object-cover"
            />
          </picture>
        </div>
      )}
      <div className={`absolute inset-0 -z-0 ${desktopImage ? 'bg-gradient-to-r from-primary/85 via-primary/65 to-primary/10' : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-200/60 via-brand-50 to-white'}`} />

      <PageContainer className="relative z-10 grid min-h-[520px] items-center gap-10 py-20 lg:grid-cols-2">
        <div className={`space-y-7 text-center lg:text-left ${desktopImage ? 'text-white' : 'text-gray-900'}`}>
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${desktopImage ? 'border-white/30 bg-white/10 text-white' : 'border-brand-200 bg-brand-100 text-secondary-dark'}`}>
            <Sparkles className="h-3.5 w-3.5" />
            {content.subtitle || 'Premium Gold Jewellery'}
          </div>
          <h1 key={`${content.id || content.title}-title`} className="animate-[hero-fade-in_500ms_ease-out] text-5xl font-black leading-[1.1] sm:text-6xl lg:text-7xl">
            {content.title === fallbackBanner.title ? (
              <>Timeless <span className="text-accent">Gold</span> for Every Occasion.</>
            ) : content.title}
          </h1>
          {content.description && (
            <p className={`mx-auto max-w-lg text-lg font-medium leading-relaxed lg:mx-0 ${desktopImage ? 'text-white/85' : 'text-gray-600'}`}>
              {content.description}
            </p>
          )}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            {isExternalLink ? (
              <a href={target} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-bold text-primary shadow-lg transition-all hover:scale-105 hover:bg-secondary-light">
                {callToAction}
              </a>
            ) : (
              <Link to={target} className="flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-bold text-primary shadow-lg transition-all hover:scale-105 hover:bg-secondary-light">
                {callToAction}
              </Link>
            )}
            <Link to="/#products" className={`rounded-xl border px-8 py-4 text-lg font-bold transition-all ${desktopImage ? 'border-white/50 text-white hover:bg-white/10' : 'border-gray-200 text-gray-700 hover:bg-white'}`}>
              Browse Collection
            </Link>
          </div>
        </div>
        {!desktopImage && (
          <div className="relative hidden min-h-[340px] items-center justify-center lg:flex">
            <div className="absolute h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative grid h-80 w-80 grid-cols-2 gap-4 rounded-[2rem] border border-brand-200/70 bg-gradient-to-tr from-brand-100 via-white to-brand-50 p-6 shadow-xl">
              {['Necklaces', 'Rings', 'Earrings', 'Bangles'].map((category, index) => (
                <div key={category} className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm ${index === 0 ? 'row-span-2' : ''}`}>
                  <span className="text-3xl text-accent" aria-hidden="true">✦</span>
                  <span className="text-xs font-bold text-gray-600">{category}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
      {banners.length > 1 && (
        <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-4 sm:bottom-8">
          <button
            type="button"
            onClick={() => showSlide(activeIndex - 1)}
            className="rounded-full border border-white/60 bg-primary/50 p-2 text-white transition hover:bg-primary"
            aria-label="Previous hero slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2" aria-label={`Slide ${activeIndex + 1} of ${banners.length}`}>
            {banners.map((item, index) => (
              <button
                key={item.id || index}
                type="button"
                onClick={() => showSlide(index)}
                className={`h-2.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-accent' : 'w-2.5 bg-white/70 hover:bg-white'}`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => showSlide(activeIndex + 1)}
            className="rounded-full border border-white/60 bg-primary/50 p-2 text-white transition hover:bg-primary"
            aria-label="Next hero slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
      <style>{`@keyframes hero-fade-in { from { opacity: 0.35; } to { opacity: 1; } }`}</style>
    </section>
  );
}
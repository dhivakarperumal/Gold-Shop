import {
  ArrowRight, Award, BadgeCheck, Gem, HeartHandshake, MapPin,
  ShieldCheck, Sparkles, Users
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const image = (number: number) => `/Gold Shop Images/shopping (${number}).webp`;

function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1700px] px-[6%] sm:px-[5%] lg:px-[3%] ${className}`}>{children}</div>;
}

const values = [
  { icon: Gem, title: 'Purity Assured', description: 'Hallmarked gold and carefully selected jewellery' },
  { icon: Award, title: 'Exquisite Designs', description: 'Traditional artistry with a contemporary touch' },
  { icon: Users, title: 'Customer First', description: 'Friendly guidance for every special purchase' },
  { icon: ShieldCheck, title: 'Here for You', description: 'Support and care beyond your purchase' },
];

const promises = [
  { icon: BadgeCheck, title: 'Quality You Can Trust', description: 'Clear product details and hallmark information on eligible pieces.' },
  { icon: Sparkles, title: 'Made for Your Moments', description: 'Explore designs for celebrations, milestones and everyday wear.' },
  { icon: HeartHandshake, title: 'Personal Service', description: 'Our team is here to help you find a piece that feels just right.' },
];

function SectionLabel({ children }: { children: string }) {
  return <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">{children}</p>;
}

function About() {
  return (
    <div className="overflow-hidden bg-[#fffdf8] text-primary">
      <section
        className="relative flex min-h-[260px] items-center bg-cover bg-center sm:min-h-[320px]"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(54, 9, 11, .94), rgba(73, 13, 13, .68), rgba(45, 10, 8, .12)), url("${image(10)}")` }}
      >
        <Container className="relative py-14 sm:py-20">
          <div className="max-w-2xl text-white">
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-white/80">
              <Link to="/" className="text-accent hover:text-white">Home</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page">About Us</span>
            </nav>
            <h1 className="font-serif text-4xl font-bold sm:text-5xl lg:text-6xl">About Us</h1>
            <div className="mt-5 h-px w-36 bg-accent" />
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-xl">
              <SectionLabel>Our Story</SectionLabel>
              <h2 className="font-serif text-3xl font-bold leading-tight text-[#641d19] sm:text-4xl">
                A Love for Gold, Rooted in Trust
              </h2>
              <div className="my-4 h-px w-24 bg-accent" />
              <p className="text-sm leading-7 text-gray-700">
                At Sri Vengateshwara, we believe jewellery is more than an adornment: it is part of the moments and memories you treasure. Our collection brings together the beauty of traditional Indian craftsmanship and designs for the way you celebrate today.
              </p>
              <p className="mt-4 text-sm leading-7 text-gray-700">
                From choosing a gift to finding something special for yourself, we are here to make your experience welcoming, clear and personal. Explore with confidence, knowing our team is ready to help.
              </p>
            </div>
            <img
              src={image(21)}
              alt="A customer admiring traditional gold jewellery"
              className="h-64 w-full rounded-2xl object-cover shadow-lg sm:h-80 lg:h-[370px]"
            />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, description }) => (
              <article key={title} className="flex flex-col items-center rounded-2xl border border-brand-100 bg-white px-5 py-6 text-center shadow-sm">
                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-secondary">
                  <Icon className="h-8 w-8" aria-hidden="true" />
                </span>
                <h3 className="font-serif text-lg font-bold text-[#641d19]">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-brand-50 py-10 sm:py-14">
        <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <img
            src={image(32)}
            alt="Intricate gold jewellery inspired by Indian tradition"
            className="h-64 w-full rounded-2xl object-cover shadow-lg sm:h-80 lg:h-[390px]"
          />
          <div className="space-y-8">
            <article>
              <SectionLabel>Our Vision</SectionLabel>
              <h2 className="font-serif text-3xl font-bold leading-tight text-[#641d19]">Jewellery to Treasure, Service to Remember</h2>
              <div className="my-3 h-px w-20 bg-accent" />
              <p className="text-sm leading-7 text-gray-700">
                We want every visit to feel inspiring and every choice to feel right: a trusted place to discover jewellery that celebrates your own style and traditions.
              </p>
            </article>
            <article className="border-t border-brand-200 pt-6">
              <SectionLabel>Our Promise</SectionLabel>
              <h2 className="font-serif text-3xl font-bold leading-tight text-[#641d19]">Care in Every Detail</h2>
              <div className="my-3 h-px w-20 bg-accent" />
              <p className="text-sm leading-7 text-gray-700">
                We are committed to thoughtful designs, clear information and attentive service, so you can choose jewellery with confidence for every generation and occasion.
              </p>
            </article>
          </div>
        </Container>
      </section>

      <section className="bg-[#5a1112] py-10 text-[#f7df91] sm:py-12">
        <Container>
          <div className="mb-8 text-center">
            <SectionLabel>What Matters to Us</SectionLabel>
            <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">The Values Behind Every Visit</h2>
            <div className="mx-auto mt-4 h-px w-24 bg-accent" />
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {promises.map(({ icon: Icon, title, description }) => (
              <article key={title} className="flex flex-col items-center px-4 text-center">
                <Icon className="mb-3 h-9 w-9 text-accent" aria-hidden="true" />
                <h3 className="font-serif text-xl font-bold text-white">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-[#f2dfc0]">{description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1">
            <SectionLabel>Our Craftsmanship</SectionLabel>
            <h2 className="font-serif text-3xl font-bold leading-tight text-[#641d19] sm:text-4xl">Tradition, Made to Shine</h2>
            <div className="my-4 h-px w-24 bg-accent" />
            <p className="max-w-xl text-sm leading-7 text-gray-700">
              Every design tells a story. Discover intricate traditional details alongside timeless pieces made for everyday elegance, celebrations and the occasions you will remember.
            </p>
            <Link to="/#products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#641d19] px-5 py-3 text-sm font-bold text-white transition hover:bg-primary">
              Explore Our Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="order-1 grid h-[300px] grid-cols-2 grid-rows-2 gap-3 sm:h-[380px] lg:order-2">
            <img src={image(24)} alt="Artisan carefully shaping gold jewellery" className="row-span-2 h-full w-full rounded-xl object-cover" />
            <img src={image(33)} alt="Detail of handcrafted traditional jewellery" className="h-full w-full rounded-xl object-cover" />
            <img src={image(20)} alt="Gold jewellery design detail" className="h-full w-full rounded-xl object-cover" />
          </div>
        </Container>
      </section>

      <section className="bg-brand-50 py-10 sm:py-14">
        <Container className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <img
            src={image(1)}
            alt="Warmly lit jewellery showroom"
            className="h-64 w-full rounded-2xl object-cover shadow-lg sm:h-80"
          />
          <div>
            <SectionLabel>Visit Our Showroom</SectionLabel>
            <h2 className="font-serif text-3xl font-bold leading-tight text-[#641d19] sm:text-4xl">Find Your Next Favourite</h2>
            <div className="my-4 h-px w-24 bg-accent" />
            <p className="text-sm leading-7 text-gray-700">
              Visit us in Valasaravakkam, Chennai, and explore our collection in person. We look forward to helping you find jewellery for your next special moment.
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=18%2F09%20Valasaravakkam%2C%20Chennai%2C%20600087%2C%20Tamil%20Nadu%2C%20India"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#641d19] px-5 py-3 text-sm font-bold text-white transition hover:bg-primary"
            >
              <MapPin className="h-4 w-4" /> Find Our Showroom <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default About;

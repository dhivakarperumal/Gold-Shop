import { ArrowRight, Facebook, Heart, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories } from '../../lib/categoryData';
import PageContainer from './PageContainer.jsx';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Shop', to: '/#products' },
  { label: 'Offers', to: '/#products' },
];

const socialLinks = [
  { label: 'Facebook', Icon: Facebook },
  { label: 'Instagram', Icon: Instagram },
  { label: 'YouTube', Icon: Youtube },
];

const storeAddress = '18/09 Valasaravakkam, Chennai - 600087, Tamil Nadu, India';
const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=18%2F09%20Valasaravakkam%2C%20Chennai%2C%20600087%2C%20Tamil%20Nadu%2C%20India';

export default function Footer() {
  return (
    <footer className="bg-primary font-sans text-[#f9e8b2]">
      <PageContainer className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="min-w-0">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7ad52] text-2xl font-bold text-[#f5c75e]">S</span>
            <span className="text-lg font-bold tracking-wide text-[#f5c75e]">Sri Vengateshwara</span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-[#ead7b5]">
            Your trusted destination for authentic gold jewellery, crafted to make life’s special moments shine.
          </p>
          <div className="mt-5 flex gap-3">
            {socialLinks.map(({ label, Icon }) => (
              <span
                key={label}
                aria-label={label}
                title={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#7d4b2d] text-[#f5c75e]"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <h2 className="mb-5 text-sm font-bold text-white">Quick Links</h2>
          <ul className="space-y-3 text-sm text-[#ead7b5]">
            {quickLinks.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="transition-colors hover:text-[#f5c75e]">{label}</Link>
              </li>
            ))}
            <li><a href="mailto:support@kanakgold.com" className="transition-colors hover:text-[#f5c75e]">Contact Us</a></li>
          </ul>
        </div>

        <div className="min-w-0">
          <h2 className="mb-5 text-sm font-bold text-white">Our Collections</h2>
          <ul className="space-y-3 text-sm text-[#ead7b5]">
            {categories.slice(0, 6).map(({ categoryName }) => (
              <li key={categoryName}>
                <Link to="/#products" className="transition-colors hover:text-[#f5c75e]">{categoryName}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <h2 className="mb-5 text-sm font-bold text-white">Contact Us</h2>
          <ul className="space-y-4 text-sm text-[#ead7b5]">
            <li>
              <a href="tel:+919080281344" className="flex items-center gap-3 transition-colors hover:text-[#f5c75e]">
                <Phone className="h-4 w-4 shrink-0 text-[#f5c75e]" />
                +91 90802 81344
              </a>
            </li>
            <li>
              <a href="mailto:support@kanakgold.com" className="flex items-center gap-3 transition-colors hover:text-[#f5c75e]">
                <Mail className="h-4 w-4 shrink-0 text-[#f5c75e]" />
                <span className="break-all">support@kanakgold.com</span>
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#f5c75e]" />
              <span>{storeAddress}</span>
            </li>
          </ul>
        </div>

        <div className="min-w-0">
          <h2 className="mb-5 text-sm font-bold text-white">Google Map</h2>
          <iframe
            title="Sri Vengateshwara location map"
            src="https://www.google.com/maps?q=18%2F09%20Valasaravakkam%2C%20Chennai%20600087%2C%20Tamil%20Nadu%2C%20India&output=embed"
            className="h-28 w-full rounded-lg border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent px-4 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-primary"
          >
            View on Google Maps <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </PageContainer>

      <div className="border-t border-white/10 bg-primary-dark">
        <PageContainer className="flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-[#ead7b5] sm:flex-row sm:text-left">
          <p>© 2026 Sri Vengateshwara. All Rights Reserved.</p>
          <p className="inline-flex items-center gap-1">Made with <Heart className="h-3.5 w-3.5 fill-[#f5c75e] text-[#f5c75e]" /> for your precious moments.</p>
        </PageContainer>
      </div>
    </footer>
  );
}

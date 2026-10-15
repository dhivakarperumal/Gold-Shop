import {
  BadgeCheck,
  HeartHandshake,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';
import PageContainer from '../../CommonComponents/PageContainer.jsx';

const benefits = [
  { icon: ShieldCheck, title: 'BIS Hallmarked', description: 'Hallmark information on eligible pieces' },
  { icon: IndianRupee, title: 'Transparent Pricing', description: 'Clear product and price details' },
  { icon: Store, title: 'Exclusive Designs', description: 'Traditional and modern styles' },
  { icon: BadgeCheck, title: 'Certified Jewellery', description: 'Purity details shown with products' },
  { icon: HeartHandshake, title: 'Helpful Support', description: 'Our team is ready to assist' },
  { icon: Sparkles, title: 'Made for Moments', description: 'Find a piece for every occasion' },
];

export default function WhyChooseUs() {
  return (
    <section className="border-y border-brand-100 bg-[#fffaf0] py-10 sm:py-14">
      <PageContainer>
        <div className="mb-8 text-center">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">The Sri Vengateshwara promise</p>
          <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">Why Choose Us?</h2>
        </div>
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
  );
}

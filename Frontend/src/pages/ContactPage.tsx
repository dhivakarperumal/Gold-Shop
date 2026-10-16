import { useState, type FormEvent } from 'react';
import { ArrowRight, Clock3, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/CommonComponents/PageHeader.jsx';

const storeAddress = '18/09 Valasaravakkam, Chennai - 600087, Tamil Nadu, India';
const mapUrl = 'https://www.google.com/maps/search/?api=1&query=18%2F09%20Valasaravakkam%2C%20Chennai%2C%20600087%2C%20Tamil%20Nadu%2C%20India';
const mapEmbedUrl = 'https://www.google.com/maps?q=18%2F09%20Valasaravakkam%2C%20Chennai%20600087%2C%20Tamil%20Nadu%2C%20India&output=embed';

const contactCards = [
  {
    icon: Phone,
    title: 'Call our team',
    detail: '+91 90802 81344',
    note: 'Speak with us about a product or visit.',
    href: 'tel:+919080281344',
  },
  {
    icon: Mail,
    title: 'Email us',
    detail: 'support@kanakgold.com',
    note: 'We’re happy to help with your questions.',
    href: 'mailto:support@kanakgold.com',
  },
  {
    icon: MapPin,
    title: 'Visit our showroom',
    detail: storeAddress,
    note: 'Call ahead for current showroom hours.',
    href: mapUrl,
  },
];

const faqs = [
  {
    question: 'Where is your showroom?',
    answer: storeAddress,
  },
  {
    question: 'How can I ask about a jewellery piece?',
    answer: 'Call or email our team with the product name or details, and we’ll be glad to assist.',
  },
  {
    question: 'Can I visit the showroom?',
    answer: 'Yes. Use the directions link to find us in Valasaravakkam, Chennai. Please contact us for current showroom hours.',
  },
];

export default function ContactPage() {
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();
    setIsSubmitting(true);
    setFormMessage('');
    try {
      const { data } = await api.post<{ message: string }>('/enquiries', { name, email, phone, subject, message });
      setFormMessage(data.message || 'Your enquiry has been submitted. Our team will be in touch soon.');
      form.reset();
    } catch (error: unknown) {
      console.error('Could not submit contact enquiry:', error);
      setFormMessage('We could not send your enquiry. Please try again or contact us by phone or email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#381413]">
      <PageHeader
        breadcrumb="Contact Us"
        title="Let’s Talk"
        subtitle="We’re Here to Help"
        description="Questions about a design, a visit, or your order? Our team would love to hear from you."
        className="flex h-[300px] items-center"
        contentClassName="py-4"
        titleClassName="text-4xl sm:text-5xl lg:text-6xl"
      />

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section aria-label="Contact information" className="grid gap-4 md:grid-cols-3">
          {contactCards.map(({ icon: Icon, title, detail, note, href }) => (
            <a
              key={title}
              href={href}
              target={href === mapUrl ? '_blank' : undefined}
              rel={href === mapUrl ? 'noreferrer' : undefined}
              className="group flex min-h-36 items-start gap-4 rounded-2xl border border-[#f0e5d5] bg-white p-5 shadow-[0_8px_30px_rgba(73,24,18,0.05)] transition hover:-translate-y-1 hover:border-[#d6ad62] hover:shadow-[0_14px_35px_rgba(73,24,18,0.1)] sm:p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5a1112] text-[#f4c35e] transition group-hover:bg-[#74180f]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-serif text-lg font-bold text-[#5a1112]">{title}</span>
                <span className="mt-1 block break-words text-sm font-semibold text-[#5b4a43]">{detail}</span>
                <span className="mt-2 block text-xs leading-5 text-gray-500">{note}</span>
              </span>
              <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-[#b98531] opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
            </a>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:gap-8">
          <div className="rounded-2xl border border-[#f0e5d5] bg-white p-5 shadow-[0_12px_40px_rgba(73,24,18,0.06)] sm:p-8">
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ad7929]">Get in touch</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-[#5a1112] sm:text-3xl">Send us a message</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                Tell us what you’re looking for and we’ll help you take the next step.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#4a3029]">
                Your name <span className="text-[#a53129]">*</span>
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Enter your name"
                  className="mt-2 w-full rounded-xl border border-[#eadfd2] bg-[#fffdfa] px-4 py-3 text-sm font-normal outline-none transition placeholder:text-gray-400 focus:border-[#b98531] focus:ring-2 focus:ring-[#f4c35e]/25"
                />
              </label>
              <label className="block text-sm font-semibold text-[#4a3029]">
                Email address <span className="text-[#a53129]">*</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-[#eadfd2] bg-[#fffdfa] px-4 py-3 text-sm font-normal outline-none transition placeholder:text-gray-400 focus:border-[#b98531] focus:ring-2 focus:ring-[#f4c35e]/25"
                />
              </label>
              <label className="block text-sm font-semibold text-[#4a3029]">
                Phone number <span className="font-normal text-gray-400">(optional)</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={30}
                  placeholder="+91"
                  className="mt-2 w-full rounded-xl border border-[#eadfd2] bg-[#fffdfa] px-4 py-3 text-sm font-normal outline-none transition placeholder:text-gray-400 focus:border-[#b98531] focus:ring-2 focus:ring-[#f4c35e]/25"
                />
              </label>
              <label className="block text-sm font-semibold text-[#4a3029]">
                What can we help with? <span className="text-[#a53129]">*</span>
                <select
                  name="subject"
                  required
                  defaultValue=""
                  className="mt-2 w-full rounded-xl border border-[#eadfd2] bg-[#fffdfa] px-4 py-3 text-sm font-normal outline-none transition focus:border-[#b98531] focus:ring-2 focus:ring-[#f4c35e]/25"
                >
                  <option value="" disabled>Select a topic</option>
                  <option>Product enquiry</option>
                  <option>Showroom visit</option>
                  <option>Order support</option>
                  <option>Other question</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-[#4a3029] sm:col-span-2">
                Your message <span className="text-[#a53129]">*</span>
                <textarea
                  name="message"
                  required
                  minLength={5}
                  maxLength={2000}
                  rows={5}
                  placeholder="How can we help?"
                  className="mt-2 w-full resize-y rounded-xl border border-[#eadfd2] bg-[#fffdfa] px-4 py-3 text-sm font-normal outline-none transition placeholder:text-gray-400 focus:border-[#b98531] focus:ring-2 focus:ring-[#f4c35e]/25"
                />
              </label>
              <div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5a1112] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#5a1112]/15 transition hover:bg-[#74180f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b98531] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting ? 'Sending…' : 'Send enquiry'} <Send className="h-4 w-4" aria-hidden="true" />
                </button>
                {formMessage && <p role="status" className="text-xs text-[#5a1112]">{formMessage}</p>}
              </div>
            </form>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-2xl border border-[#f0e5d5] bg-white shadow-[0_12px_40px_rgba(73,24,18,0.06)]">
              <div className="relative flex min-h-40 items-end overflow-hidden bg-[#5a1112] p-6 text-white">
                <div className="absolute inset-0 bg-[url('/page-header-banner.png')] bg-cover bg-[center_65%] opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3f0b0c] via-[#3f0b0c]/50 to-transparent" />
                <div className="relative">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#f4c35e]/70 bg-[#5a1112]/60 text-[#f4c35e]">
                    <Clock3 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="font-serif text-xl font-bold">A personal touch awaits</h2>
                  <p className="mt-1 text-sm text-white/80">We’re here to make your jewellery experience feel special.</p>
                </div>
              </div>
              <div className="p-5">
                <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#7a321e] transition hover:text-[#ad7929]">
                  Get directions <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-[#f0e5d5] bg-white p-5 shadow-[0_12px_40px_rgba(73,24,18,0.06)] sm:p-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4df] text-[#ad7929]">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="font-serif text-xl font-bold text-[#5a1112]">A few helpful answers</h2>
              </div>
              <div className="divide-y divide-[#f0e5d5]">
                {faqs.map(({ question, answer }) => (
                  <details key={question} className="group py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[#4a3029] marker:hidden">
                      {question}
                      <span className="text-[#ad7929] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                    </summary>
                    <p className="mt-2 pr-6 text-xs leading-5 text-gray-600">{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#f0e5d5] bg-white shadow-[0_12px_40px_rgba(73,24,18,0.06)]">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ad7929]">Come say hello</p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-[#5a1112]">Find our showroom</h2>
              <p className="mt-1 flex items-start gap-2 text-sm leading-6 text-gray-600">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#b98531]" aria-hidden="true" />
                {storeAddress}
              </p>
            </div>
            <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#7a321e] transition hover:text-[#ad7929]">
              Open in Google Maps <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <iframe
            title="Map showing Sri Vengateshwara showroom in Valasaravakkam, Chennai"
            src={mapEmbedUrl}
            className="h-64 w-full border-0 sm:h-80"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      </div>
    </div>
  );
}

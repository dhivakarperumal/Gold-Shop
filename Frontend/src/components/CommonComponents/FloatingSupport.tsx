import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, MessageCircle, Phone, Send, X } from 'lucide-react';

const phoneNumber = '+919080281344';
const whatsappNumber = '919080281344';
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello, I need help with Sri Vengateshwara jewellery.')}`;

const quickReplies = [
  {
    label: 'Browse jewellery',
    answer: 'Explore our jewellery collection and check each product page for current pricing and availability.',
  },
  {
    label: 'Orders and delivery',
    answer: 'For help with an order or delivery, message or call our team and include your order details.',
  },
  {
    label: "Today's gold rate",
    answer: 'Gold rates can change during the day. Call our team for the latest rate.',
  },
];

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <path
        d="M20.5 11.7a8.5 8.5 0 0 1-12.4 7.6L4 20l.9-4.1A8.5 8.5 0 1 1 20.5 11.7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M8.2 7.7c.2-.4.5-.5.8-.5h.5c.2 0 .4.1.5.4l.9 2c.1.2.1.5-.1.7l-.7.8c-.2.2-.2.4 0 .7.6 1 1.4 1.8 2.4 2.4.3.2.5.2.7 0l.8-.7c.2-.2.5-.2.7-.1l2 .9c.3.1.4.3.4.5v.5c0 .3-.1.6-.5.8-.8.5-2.2.4-4.1-.5-2.2-1-4.1-2.9-5.1-5.1-.9-1.9-1-3.3-.5-4.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function FloatingSupport() {
  const [chatOpen, setChatOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateScrollButton = () => setShowScrollTop(window.scrollY > 120);
    updateScrollButton();
    window.addEventListener('scroll', updateScrollButton, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollButton);
  }, []);

  return (
    <aside aria-label="Customer support" className="fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {chatOpen && (
        <section
          aria-label="Jewellery support chat"
          aria-live="polite"
          className="mb-1 w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-2xl border border-[#eadbc9] bg-white shadow-[0_20px_60px_rgba(48,5,7,0.24)]"
        >
          <header className="flex items-center justify-between bg-[#5a1112] px-4 py-3 text-white">
            <div>
              <h2 className="text-sm font-bold">Sri Vengateshwara Support</h2>
              <p className="mt-0.5 text-[11px] text-white/75">We’re here to help</p>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              aria-label="Close support chat"
              className="rounded-full p-1.5 transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="p-4">
            <p className="rounded-xl bg-[#fff8ec] p-3 text-sm leading-5 text-[#4b1715]">
              Hello! What can we help you with?
            </p>
            <div className="mt-3 flex flex-col items-start gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply.label}
                  type="button"
                  onClick={() => setAnswer(reply.answer)}
                  className="rounded-full border border-[#eadbc9] px-3 py-2 text-xs font-semibold text-[#74180f] transition hover:bg-[#fff8ec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#74180f]"
                >
                  {reply.label}
                </button>
              ))}
            </div>
            {answer && (
              <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm leading-5 text-gray-700" role="status">
                {answer}
              </p>
            )}
            <div className="mt-4 flex gap-2 border-t border-[#f0e5d5] pt-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25d366] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#1eae54] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25d366]"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp us
              </a>
              <Link
                to="/shop"
                onClick={() => setChatOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#eadbc9] px-3 py-2.5 text-xs font-bold text-[#74180f] transition hover:bg-[#fff8ec]"
              >
                <Send className="h-4 w-4" /> Shop
              </Link>
            </div>
          </div>
        </section>
      )}

      <a
        href={`tel:${phoneNumber}`}
        aria-label="Call Sri Vengateshwara at +91 90802 81344"
        title="Call us"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#74180f] text-white shadow-lg transition hover:scale-105 hover:bg-[#5a1112] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#74180f] sm:h-14 sm:w-14"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact Sri Vengateshwara on WhatsApp"
        title="WhatsApp us"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1eae54] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25d366] sm:h-14 sm:w-14"
      >
        <WhatsAppIcon />
      </a>
      <button
        type="button"
        onClick={() => setChatOpen((open) => !open)}
        aria-label={chatOpen ? 'Close support chat' : 'Open support chat'}
        aria-expanded={chatOpen}
        title={chatOpen ? 'Close support chat' : 'Chat with us'}
        className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ad7929] sm:h-14 sm:w-14 ${chatOpen ? 'bg-[#ad7929]' : 'bg-[#5a1112]'}`}
      >
        {chatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          title="Scroll to top"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ad7929] text-white shadow-lg transition hover:scale-105 hover:bg-[#91621f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ad7929] sm:h-14 sm:w-14"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </aside>
  );
}

import { Instagram as InstagramIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageContainer from '../../CommonComponents/PageContainer.jsx';

const imageNumbers = [10, 15, 20, 21, 24, 27, 32, 36];
const imageAsset = (number) => `/Gold Shop Images/shopping (${number}).webp`;

export default function Instagram() {
  return (
    <section className="pb-10 sm:pb-14">
      <PageContainer>
        <div className="mb-8 text-center">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Follow our collections</p>
          <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">Follow Us on Instagram</h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-gray-500 sm:text-sm">A closer look at designs and details from our collections.</p>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {imageNumbers.map((number) => (
            <Link key={number} to="/#products" className="group aspect-square overflow-hidden rounded-md bg-brand-100">
              <img src={imageAsset(number)} alt="Jewellery collection inspiration" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
            </Link>
          ))}
        </div>
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="mx-auto mt-5 flex w-fit items-center gap-2 text-xs font-bold text-secondary-dark">
          <InstagramIcon className="h-4 w-4" /> Find us on Instagram
        </a>
      </PageContainer>
    </section>
  );
}

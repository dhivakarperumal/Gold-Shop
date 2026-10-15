import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageContainer from '../../CommonComponents/PageContainer.jsx';

const imageAsset = (number) => `/Gold Shop Images/shopping (${number}).webp`;

const collections = [
  { title: 'Wedding Collection', image: imageAsset(10) },
  { title: 'Daily Wear Collection', image: imageAsset(21) },
  { title: 'Temple Jewellery', image: imageAsset(32) },
  { title: 'Diamond Collection', image: imageAsset(20) },
];

export default function ExploreCollections() {
  return (
    <section className="py-10 sm:py-14">
      <PageContainer>
        <div className="mb-8 text-center">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Made for every occasion</p>
          <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">Explore Our Collections</h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-gray-500 sm:text-sm">Find a design that feels like it was made just for you.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {collections.map((collection) => (
            <Link key={collection.title} to="/#products" className="group relative isolate aspect-[1.1/1] overflow-hidden rounded-lg bg-primary">
              <img src={collection.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 -z-0 bg-gradient-to-t from-primary/85 via-transparent to-transparent" />
              <div className="absolute inset-x-3 bottom-3 text-white">
                <h3 className="font-serif text-sm font-bold sm:text-lg">{collection.title}</h3>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[9px] font-bold text-primary">Explore <ArrowRight className="h-3 w-3" /></span>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

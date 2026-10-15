import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../../CommonComponents/ProductCard';
import PageContainer from '../../CommonComponents/PageContainer.jsx';

export default function Products({
  categories,
  activeCategory,
  onSelectCategory,
  products,
  loading,
}) {
  return (
    <section id="products" className="scroll-mt-28 py-10 sm:py-14">
      <PageContainer>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">Handpicked for you</p>
            <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">Featured Jewellery</h2>
          </div>
          <a href="#products" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-4 py-2 text-[10px] font-bold text-primary sm:text-xs">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
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
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[...Array(6)].map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-brand-100" />)}
          </div>
        ) : products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((product, index) => (
              <ProductCard key={product.productId} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-brand-100 bg-white py-12 text-center text-sm text-gray-500">
            New jewellery is being added to this collection.
          </div>
        )}
      </PageContainer>
    </section>
  );
}

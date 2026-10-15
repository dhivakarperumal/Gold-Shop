import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Heart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { BACKEND_BASE_URL } from '../api';
import type { Product } from '../components/CommonComponents/ProductCard';
import PageHeader from '../components/CommonComponents/PageHeader.jsx';
import { categories as storeCategories } from '../lib/categoryData';

type CatalogProduct = Product & {
  gender?: string;
  occasion?: string[] | string;
  createdAt?: string;
};

type Filters = {
  categories: string[];
  purities: string[];
  genders: string[];
  occasions: string[];
  inStockOnly: boolean;
};

const emptyFilters: Filters = {
  categories: [],
  purities: [],
  genders: [],
  occasions: [],
  inStockOnly: false,
};

const imageAsset = (number: number) => `/Gold Shop Images/shopping (${number}).webp`;
const priceOf = (product: CatalogProduct) => Number(product.offerPrice > 0 ? product.offerPrice : product.price) || 0;

function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1700px] px-[6%] sm:px-[5%] lg:px-[3%] ${className}`}>{children}</div>;
}

function productImage(product: CatalogProduct) {
  const source = product.images?.[0];
  if (!source) return '';
  if (/^(https?:|data:|blob:)/i.test(source)) return source;
  return `${BACKEND_BASE_URL}${source.startsWith('/') ? source : `/${source}`}`;
}

function normalizedList(value: string[] | string | undefined) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [value];
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
}

function FilterGroup({
  title,
  items,
  selectedItems,
  onToggle,
  counts,
}: {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  counts?: Record<string, number>;
}) {
  return (
    <details open={title === 'Category' || title === 'Purity'} className="border-b border-[#eadbc9] py-3 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[#4b1715]">
        {title}<ChevronDown className="h-4 w-4 text-[#7b4d3b]" />
      </summary>
      <div className="mt-2 space-y-2">
        {items.length ? items.map((item) => (
          <label key={item} className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={() => onToggle(item)}
              className="h-3.5 w-3.5 accent-[#74180f]"
            />
            <span>{item}</span>
            {counts && <span className="ml-auto text-[10px] text-gray-400">({counts[item] || 0})</span>}
          </label>
        )) : <p className="text-xs text-gray-400">No options available</p>}
      </div>
    </details>
  );
}

function ShopPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [maximumPrice, setMaximumPrice] = useState(0);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const pageSize = 12;

  useEffect(() => {
    let mounted = true;
    api.get('/products')
      .then(({ data }) => {
        if (!mounted) return;
        const activeProducts = (Array.isArray(data?.products) ? data.products : [])
          .filter((product: CatalogProduct) => product.status === 'Active');
        setProducts(activeProducts);
        setMaximumPrice(Math.max(0, ...activeProducts.map(priceOf)));
      })
      .catch((error) => {
        console.error('Failed to load shop products:', error);
        if (mounted) setLoadError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categoryNames = useMemo(() => [...new Set([
    ...products.map((product) => product.category).filter(Boolean),
    ...storeCategories.map((category) => category.categoryName),
  ])], [products]);

  const categoryCards = categoryNames.slice(0, 9).map((name, index) => ({
    name,
    product: products.find((item) => item.category === name),
    fallback: imageAsset(index + 1),
  }));

  const availableOccasions = [...new Set(products.flatMap((product) => normalizedList(product.occasion)))].sort();
  const availablePurities = [...new Set(products.map((product) => product.purity).filter(Boolean))].sort();
  const availableGenders = [...new Set(products
    .map((product) => product.gender)
    .filter((gender): gender is string => Boolean(gender)))].sort();

  const filteredProducts = useMemo(() => {
    const matches = products.filter((product) => {
      if (filters.categories.length && !filters.categories.includes(product.category)) return false;
      if (filters.purities.length && !filters.purities.includes(product.purity)) return false;
      if (filters.genders.length && !filters.genders.includes(product.gender || '')) return false;
      if (filters.occasions.length && !filters.occasions.some((occasion) => normalizedList(product.occasion).includes(occasion))) return false;
      if (filters.inStockOnly && product.stock <= 0) return false;
      return priceOf(product) <= maximumPrice;
    });

    return [...matches].sort((a, b) => {
      if (sort === 'price-low') return priceOf(a) - priceOf(b);
      if (sort === 'price-high') return priceOf(b) - priceOf(a);
      if (sort === 'bestseller') return Number(b.bestSeller) - Number(a.bestSeller);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [products, filters, maximumPrice, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const toggleFilter = (key: 'categories' | 'purities' | 'genders' | 'occasions', value: string) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setMaximumPrice(Math.max(0, ...products.map(priceOf)));
    setPage(1);
  };

  const formatPrice = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

  const filtersPanel = (
    <div className="rounded-xl border border-[#eadbc9] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-[#4b1715]">Filters</h2>
        <button type="button" onClick={clearFilters} className="text-xs font-semibold text-[#74180f] underline">Clear All</button>
        <button type="button" onClick={() => setMobileFiltersOpen(false)} className="p-1 text-gray-500 lg:hidden" aria-label="Close filters">
          <X className="h-4 w-4" />
        </button>
      </div>

      <FilterGroup
        title="Category"
        items={categoryNames}
        selectedItems={filters.categories}
        onToggle={(item) => toggleFilter('categories', item)}
        counts={Object.fromEntries(categoryNames.map((name) => [name, products.filter((product) => product.category === name).length]))}
      />

      <div className="border-b border-[#eadbc9] py-3">
        <label htmlFor="max-price" className="flex items-center justify-between text-sm font-bold text-[#4b1715]">
          Price Range <ChevronDown className="h-4 w-4 text-[#7b4d3b]" />
        </label>
        <input
          id="max-price"
          type="range"
          min={0}
          max={Math.max(1, ...products.map(priceOf))}
          value={maximumPrice}
          onChange={(event) => {
            setMaximumPrice(Number(event.target.value));
            setPage(1);
          }}
          className="mt-3 w-full accent-[#d78a16]"
        />
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>{formatPrice(0)}</span><span>{formatPrice(maximumPrice)}</span>
        </div>
      </div>

      <FilterGroup title="Purity" items={availablePurities} selectedItems={filters.purities} onToggle={(item) => toggleFilter('purities', item)} />
      <FilterGroup title="Gender" items={availableGenders} selectedItems={filters.genders} onToggle={(item) => toggleFilter('genders', item)} />
      <FilterGroup title="Occasion" items={availableOccasions} selectedItems={filters.occasions} onToggle={(item) => toggleFilter('occasions', item)} />

      <label className="flex cursor-pointer items-center gap-2 pt-3 text-xs text-gray-600">
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(event) => {
            setFilters((current) => ({ ...current, inStockOnly: event.target.checked }));
            setPage(1);
          }}
          className="h-3.5 w-3.5 accent-[#74180f]"
        />
        In stock only
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fffdf8] text-primary">
      <PageHeader
        title="Shop Jewellery"
        eyebrow="HANDCRAFTED FOR EVERY OCCASION"
        breadcrumb="Shop"
        description="Explore timeless gold, diamond, and everyday jewellery, thoughtfully crafted to make every celebration shine."
        image={imageAsset(25)}
        className="flex h-[300px] items-center"
        contentClassName="py-4"
        titleClassName="text-2xl sm:text-3xl"
      />

      <Container className="py-3">
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {categoryCards.map(({ name, product, fallback }) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setFilters((current) => ({
                  ...current,
                  categories: current.categories.includes(name) ? [] : [name],
                }));
                setPage(1);
              }}
              className={`rounded-lg border p-2 text-center transition hover:border-[#d69a2d] ${filters.categories.includes(name) ? 'border-[#74180f] bg-[#fff5df]' : 'border-[#f0e6d9] bg-white'}`}
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#fff8ed] sm:h-16 sm:w-16">
                <img src={product ? productImage(product) || fallback : fallback} alt="" className="h-full w-full object-cover" loading="lazy" />
              </span>
              <span className="mt-1 block truncate text-[10px] font-semibold text-[#381413] sm:text-xs">{name.replace(/^Gold /, '')}</span>
              <span className="block text-[9px] text-gray-500">({products.filter((item) => item.category === name).length})</span>
            </button>
          ))}
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[190px_minmax(0,1fr)]">
          <aside className="hidden lg:block">{filtersPanel}</aside>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/50 p-4 lg:hidden" onClick={(event) => {
              if (event.target === event.currentTarget) setMobileFiltersOpen(false);
            }}>
              <div className="mx-auto mt-12 max-w-sm">{filtersPanel}</div>
            </div>
          )}

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
              <span>
                Showing {filteredProducts.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length} products
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setMobileFiltersOpen(true)} className="inline-flex items-center gap-1 rounded-md border border-[#e8d6bf] bg-white px-2 py-1.5 font-semibold lg:hidden">
                  <Filter className="h-3.5 w-3.5" /> Filters
                </button>
                <label htmlFor="shop-sort" className="hidden sm:inline">Sort by:</label>
                <select
                  id="shop-sort"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-md border border-[#e8d6bf] bg-white px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-[#74180f]"
                >
                  <option value="latest">Latest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="bestseller">Best Sellers</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: pageSize }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-brand-100" />)}
              </div>
            ) : loadError ? (
              <div role="alert" className="rounded-xl border border-red-100 bg-white py-12 text-center text-sm text-red-700">
                We couldn’t load the jewellery catalogue. Please try again later.
              </div>
            ) : visibleProducts.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {visibleProducts.map((product) => {
                  const image = productImage(product);
                  return (
                    <article key={product.productId} className="group overflow-hidden rounded-lg border border-[#eee3d6] bg-white transition hover:-translate-y-0.5 hover:shadow-md">
                      <Link to={`/product/${product.productId}`} className="relative block aspect-square overflow-hidden bg-[#fff9f0]">
                        {image ? (
                          <img src={image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <img src={imageAsset(1)} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                        )}
                        {(product.newArrival || product.bestSeller || product.discount > 0) && (
                          <span className="absolute left-2 top-2 rounded-sm bg-[#f0a616] px-1.5 py-1 text-[9px] font-bold text-[#35110c]">
                            {product.discount > 0 ? `${product.discount}% OFF` : product.newArrival ? 'New' : 'Best Seller'}
                          </span>
                        )}
                      </Link>
                      <div className="p-2 sm:p-3">
                        <p className="truncate text-[9px] text-gray-500">{product.purity}{product.weight ? ` · ${product.weight} ${product.weightUnit || 'g'}` : ''}</p>
                        <Link to={`/product/${product.productId}`} className="mt-1 block min-h-8 text-xs font-semibold leading-4 text-[#301414] hover:text-[#74180f] sm:text-sm">
                          {product.name}
                        </Link>
                        <p className="mt-1 text-sm font-extrabold text-[#74180f]">{formatPrice(priceOf(product))}</p>
                        {product.offerPrice > 0 && product.offerPrice < product.price && (
                          <p className="text-[10px] text-gray-400 line-through">{formatPrice(product.price)}</p>
                        )}
                        <div className="mt-2 flex items-center gap-1">
                          <Link to={`/product/${product.productId}`} className="flex-1 rounded bg-[#5a1112] px-2 py-1.5 text-center text-[10px] font-bold text-white transition hover:bg-[#3f0b0c]">
                            View Details
                          </Link>
                          <button type="button" aria-label={`Add ${product.name} to wishlist`} className="rounded border border-[#eadbc9] p-1.5 text-[#74180f] hover:bg-[#fff4e5]">
                            <Heart className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-[#eadbc9] bg-white py-12 text-center">
                <p className="font-serif text-lg font-bold text-[#4b1715]">No jewellery found</p>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters to find more designs.</p>
                <button type="button" onClick={clearFilters} className="mt-4 rounded-full bg-[#5a1112] px-4 py-2 text-xs font-bold text-white">Clear filters</button>
              </div>
            )}

            {!loading && filteredProducts.length > pageSize && (
              <nav aria-label="Shop pages" className="mt-5 flex items-center justify-center gap-1">
                <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded border border-[#eadbc9] p-2 text-[#5a1112] disabled:opacity-40" aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <button key={number} type="button" onClick={() => setPage(number)} aria-current={number === page ? 'page' : undefined} className={`min-w-8 rounded px-2 py-1.5 text-xs font-semibold ${number === page ? 'bg-[#5a1112] text-white' : 'border border-[#eadbc9] bg-white text-gray-700 hover:bg-[#fff4e5]'}`}>
                    {number}
                  </button>
                ))}
                <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="rounded border border-[#eadbc9] p-2 text-[#5a1112] disabled:opacity-40" aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default ShopPage;

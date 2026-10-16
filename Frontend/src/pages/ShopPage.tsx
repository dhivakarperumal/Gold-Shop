import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Heart, LayoutGrid, List, ShoppingCart, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { BACKEND_BASE_URL } from '../api';
import { ProductCard, type Product } from '../components/CommonComponents/ProductCard';
import PageHeader from '../components/CommonComponents/PageHeader.jsx';
import type { Category } from '../lib/categoryData';
import type { CartProduct } from '../context/StoreCartContext';
import { useStoreCart } from '../context/useStoreCart';
import { useWishlist } from '../context/useWishlist';

type CatalogProduct = Product & {
  gender?: string;
  occasion?: string[] | string;
  createdAt?: string;
};

type Filters = {
  categories: string[];
  subCategories: string[];
  purities: string[];
  genders: string[];
  occasions: string[];
  inStockOnly: boolean;
};

const emptyFilters: Filters = {
  categories: [],
  subCategories: [],
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem, error: cartError } = useStoreCart();
  const { hasItem, toggleItem, error: wishlistError } = useWishlist();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [maximumPrice, setMaximumPrice] = useState(0);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isDesktopFiltersOpen, setIsDesktopFiltersOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const pageSize = 12;
  const selectedCategory = searchParams.get('category');
  const selectedSubCategory = searchParams.get('subCategory');
  const activeFilters = useMemo(() => selectedCategory || selectedSubCategory
    ? {
        ...filters,
        categories: selectedCategory ? [selectedCategory] : [],
        subCategories: selectedSubCategory ? [selectedSubCategory] : [],
      }
    : filters, [filters, selectedCategory, selectedSubCategory]);

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

  useEffect(() => {
    let mounted = true;
    api.get<{ categories?: Category[] }>('/categories')
      .then(({ data }) => {
        if (!mounted) return;
        setCategories(Array.isArray(data?.categories)
          ? data.categories.filter((category) => category.status !== 'Inactive' && typeof category.categoryName === 'string')
          : []);
      })
      .catch((error: unknown) => {
        console.error('Failed to load shop categories:', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categoryNames = useMemo(() => [...new Set([
    ...products.map((product) => product.category).filter(Boolean),
    ...categories.map((category) => category.categoryName),
  ])], [products, categories]);

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
      if (activeFilters.categories.length && !activeFilters.categories.includes(product.category)) return false;
      if (activeFilters.subCategories.length && !activeFilters.subCategories.includes(product.subCategory)) return false;
      if (activeFilters.purities.length && !activeFilters.purities.includes(product.purity)) return false;
      if (activeFilters.genders.length && !activeFilters.genders.includes(product.gender || '')) return false;
      if (activeFilters.occasions.length && !activeFilters.occasions.some((occasion) => normalizedList(product.occasion).includes(occasion))) return false;
      if (activeFilters.inStockOnly && product.stock <= 0) return false;
      return priceOf(product) <= maximumPrice;
    });

    return [...matches].sort((a, b) => {
      if (sort === 'price-low') return priceOf(a) - priceOf(b);
      if (sort === 'price-high') return priceOf(b) - priceOf(a);
      if (sort === 'bestseller') return Number(b.bestSeller) - Number(a.bestSeller);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [products, activeFilters, maximumPrice, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const toggleFilter = (key: 'categories' | 'subCategories' | 'purities' | 'genders' | 'occasions', value: string) => {
    setPage(1);
    if (key === 'categories' || key === 'subCategories') {
      setSearchParams({}, { replace: true });
    }
    setFilters((current) => {
      const selectedItems = key === 'categories' || key === 'subCategories'
        ? activeFilters[key]
        : current[key];
      return {
        ...current,
        [key]: selectedItems.includes(value)
          ? selectedItems.filter((item) => item !== value)
          : [...selectedItems, value],
        ...(key === 'categories' ? { subCategories: [] } : {}),
      };
    });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
    setFilters(emptyFilters);
    setMaximumPrice(Math.max(0, ...products.map(priceOf)));
    setPage(1);
  };

  const formatPrice = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

  const handleAddToCart = async (product: CatalogProduct) => {
    const image = productImage(product);
    const cartProduct: CartProduct = {
      id: product.productId,
      name: product.name,
      category: product.category,
      purity: product.purity,
      weight: Number(product.weight) || 0,
      weightUnit: product.weightUnit || 'g',
      price: Number(product.price) || 0,
      offerPrice: Number(product.offerPrice) || 0,
      stock: Number(product.stock) || 0,
      image: image || imageAsset(1),
    };

    setCartMessage(await addItem(cartProduct)
      ? `${product.name} added to your cart.`
      : `${product.name} is out of stock or at its available quantity limit.`);
  };

  const toggleWishlist = (product: CatalogProduct) => {
    const image = productImage(product);
    void toggleItem({
      id: product.productId,
      name: product.name,
      category: product.category,
      purity: product.purity,
      weight: Number(product.weight) || 0,
      weightUnit: product.weightUnit || 'g',
      price: Number(product.price) || 0,
      offerPrice: Number(product.offerPrice) || 0,
      stock: Number(product.stock) || 0,
      image: image || imageAsset(1),
    });
  };

  const filtersPanel = (
    <div className="w-full min-w-0 rounded-xl border border-[#eadbc9] bg-white p-4">
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
        selectedItems={activeFilters.categories}
        onToggle={(item) => toggleFilter('categories', item)}
        counts={Object.fromEntries(categoryNames.map((name) => [name, products.filter((product) => product.category === name).length]))}
      />

      <FilterGroup
        title="Subcategory"
        items={[...new Set([
          ...categories
            .filter((category) => !filters.categories.length || filters.categories.includes(category.categoryName))
            .flatMap((category) => category.subCategories),
          ...products.map((product) => product.subCategory).filter(Boolean),
        ])]}
        selectedItems={activeFilters.subCategories}
        onToggle={(item) => toggleFilter('subCategories', item)}
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
          checked={activeFilters.inStockOnly}
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
        title="Shop"
        subtitle="Explore Our Exquisite Collections"
        breadcrumb="Shop"
        description="Discover a wide range of gold, diamond and traditional jewellery crafted with purity, elegance and timeless beauty."
        className="flex h-[300px] items-center"
        contentClassName="py-4"
        titleClassName="text-4xl sm:text-5xl lg:text-6xl"
      />

      <Container className="py-3">
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {categoryCards.map(({ name, product, fallback }) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setSearchParams({}, { replace: true });
                setFilters((current) => ({
                  ...current,
                  categories: activeFilters.categories.includes(name) ? [] : [name],
                  subCategories: [],
                }));
                setPage(1);
              }}
              className={`rounded-lg border p-2 text-center transition hover:border-[#d69a2d] ${activeFilters.categories.includes(name) ? 'border-[#74180f] bg-[#fff5df]' : 'border-[#f0e6d9] bg-white'}`}
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#fff8ed] sm:h-16 sm:w-16">
                <img src={product ? productImage(product) || fallback : fallback} alt="" className="h-full w-full object-cover" loading="lazy" />
              </span>
              <span className="mt-1 block truncate text-[10px] font-semibold text-[#381413] sm:text-xs">{name.replace(/^Gold /, '')}</span>
              <span className="block text-[9px] text-gray-500">({products.filter((item) => item.category === name).length})</span>
            </button>
          ))}
        </div>

        <div className={`grid items-start gap-4 ${isDesktopFiltersOpen ? 'lg:grid-cols-[250px_minmax(0,1fr)]' : 'lg:grid-cols-1'}`}>
          {isDesktopFiltersOpen && <aside className="hidden min-w-0 lg:block">{filtersPanel}</aside>}

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/50 p-3 sm:p-4 lg:hidden" onClick={(event) => {
              if (event.target === event.currentTarget) setMobileFiltersOpen(false);
            }}>
              <div className="mx-auto mt-8 w-full max-w-md sm:mt-12">{filtersPanel}</div>
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
                <button
                  type="button"
                  aria-label={isDesktopFiltersOpen ? 'Hide filters' : 'Show filters'}
                  aria-expanded={isDesktopFiltersOpen}
                  onClick={() => setIsDesktopFiltersOpen((open) => !open)}
                  className={`hidden items-center gap-1 rounded-md border px-2 py-1.5 font-semibold transition-colors lg:inline-flex ${isDesktopFiltersOpen ? 'border-[#74180f] bg-[#fff5df] text-[#74180f]' : 'border-[#e8d6bf] bg-white text-gray-700 hover:bg-[#fff5df]'}`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  {isDesktopFiltersOpen ? 'Hide Filters' : 'Filters'}
                </button>
                <div className="inline-flex items-center rounded-md border border-[#e8d6bf] bg-white p-0.5" role="group" aria-label="Product view">
                  <button
                    type="button"
                    aria-label="Card view"
                    aria-pressed={viewMode === 'cards'}
                    onClick={() => setViewMode('cards')}
                    className={`rounded p-1.5 transition-colors ${viewMode === 'cards' ? 'bg-[#5a1112] text-white' : 'text-gray-600 hover:bg-[#fff5df]'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Table view"
                    aria-pressed={viewMode === 'table'}
                    onClick={() => setViewMode('table')}
                    className={`rounded p-1.5 transition-colors ${viewMode === 'table' ? 'bg-[#5a1112] text-white' : 'text-gray-600 hover:bg-[#fff5df]'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
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

            <div className="mt-8">
              {loading ? (
                viewMode === 'cards' ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: pageSize }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-brand-100" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Array.from({ length: pageSize }, (_, index) => <div key={index} className="h-14 animate-pulse rounded-lg bg-brand-100" />)}
                  </div>
                )
              ) : loadError ? (
                <div role="alert" className="rounded-xl border border-red-100 bg-white py-12 text-center text-sm text-red-700">
                  We couldn’t load the jewellery catalogue. Please try again later.
                </div>
              ) : visibleProducts.length ? (
                viewMode === 'cards' ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {visibleProducts.map((product, index) => (
                      <ProductCard key={product.productId} product={product} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-[#eadbc9] bg-white">
                    <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                    <thead className="bg-[#fff5df] text-[#4b1715]">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-bold">Product</th>
                        <th scope="col" className="px-4 py-3 font-bold">Category</th>
                        <th scope="col" className="px-4 py-3 font-bold">Purity</th>
                        <th scope="col" className="px-4 py-3 font-bold">Weight</th>
                        <th scope="col" className="px-4 py-3 font-bold">Price</th>
                        <th scope="col" className="px-4 py-3 font-bold">Stock</th>
                        <th scope="col" className="px-4 py-3 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0e6d9]">
                      {visibleProducts.map((product) => (
                        <tr key={product.productId} className="text-gray-700 hover:bg-[#fffdf8]">
                          <td className="px-4 py-3">
                            <Link to={`/product/${product.productId}`} className="flex min-w-52 items-center gap-3 font-semibold text-[#301414] hover:text-[#74180f]">
                              <img src={productImage(product) || imageAsset(1)} alt="" className="h-12 w-12 rounded-md bg-[#fff9f0] object-cover" loading="lazy" />
                              <span>{product.name}</span>
                            </Link>
                          </td>
                          <td className="px-4 py-3">{product.category}{product.subCategory ? ` · ${product.subCategory}` : ''}</td>
                          <td className="px-4 py-3">{product.purity || '—'}</td>
                          <td className="px-4 py-3">{product.weight ? `${product.weight} ${product.weightUnit || 'g'}` : '—'}</td>
                          <td className="px-4 py-3 font-bold text-[#74180f]">{formatPrice(priceOf(product))}</td>
                          <td className="px-4 py-3">{Number(product.stock) > 0 ? product.stock : 'Out of stock'}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Link to={`/product/${product.productId}`} className="rounded bg-[#5a1112] px-3 py-2 text-[10px] font-bold text-white hover:bg-[#3f0b0c]">
                                View
                              </Link>
                              <button
                                type="button"
                                aria-label={`Add ${product.name} to cart`}
                                onClick={() => handleAddToCart(product)}
                                className="rounded border border-[#eadbc9] p-2 text-[#74180f] hover:bg-[#fff4e5]"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label={`${hasItem(product.productId) ? 'Remove' : 'Add'} ${product.name} ${hasItem(product.productId) ? 'from' : 'to'} wishlist`}
                                aria-pressed={hasItem(product.productId)}
                                onClick={() => toggleWishlist(product)}
                                className={`rounded border border-[#eadbc9] p-2 hover:bg-[#fff4e5] ${hasItem(product.productId) ? 'text-red-600' : 'text-[#74180f]'}`}
                              >
                                <Heart className={`h-3.5 w-3.5 ${hasItem(product.productId) ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="rounded-xl border border-[#eadbc9] bg-white py-12 text-center">
                  <p className="font-serif text-lg font-bold text-[#4b1715]">No jewellery found</p>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your filters to find more designs.</p>
                  <button type="button" onClick={clearFilters} className="mt-4 rounded-full bg-[#5a1112] px-4 py-2 text-xs font-bold text-white">Clear filters</button>
                </div>
              )}
            </div>

            {(cartError || wishlistError || cartMessage) && <p role={cartError || wishlistError ? 'alert' : 'status'} className="mt-3 text-xs font-semibold text-[#5a1112]">{cartError || wishlistError || cartMessage}</p>}

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

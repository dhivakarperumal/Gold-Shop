import { BACKEND_BASE_URL } from '../../../api';
import PageContainer from '../../CommonComponents/PageContainer.jsx';

const imageAsset = (number) => `/Gold Shop Images/shopping (${number}).webp`;

function resolveImageUrl(image) {
  if (!image) return '';
  if (/^(https?:|data:|blob:)/i.test(image) || image.startsWith('/Gold Shop Images/')) return image;
  return `${BACKEND_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`;
}

function getProductImage(product) {
  let images = product?.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch {
      images = [images];
    }
  }
  return resolveImageUrl(Array.isArray(images) ? images[0] : '');
}

export default function Category({ categories, products, onSelectCategory }) {
  const categoryNames = [...new Set([
    ...categories.map((category) => category.categoryName),
    ...products.map((product) => product.category),
  ].filter(Boolean))];
  const categoryItems = categoryNames.slice(0, 8).map((name, index) => ({
    name,
    category: categories.find((item) => item.categoryName === name),
    product: products.find((item) => item.category === name),
    fallbackImage: imageAsset(index + 1),
  }));

  return (
    <section className="py-10 sm:py-12">
      <PageContainer>
        <div className="mb-8 text-center">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Find Your Style</p>
          <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">Shop by Category</h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-gray-500 sm:text-sm">Explore our jewellery collections, crafted for every occasion.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {categoryItems.map(({ name, category, product, fallbackImage }) => {
            const image = resolveImageUrl(category?.image) || getProductImage(product) || fallbackImage;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onSelectCategory(name)}
                className="group text-center"
              >
                <span className="mx-auto block aspect-square overflow-hidden rounded-full border border-brand-100 bg-brand-50 p-1 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md">
                  <img src={image} alt="" className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                </span>
                <span className="mt-2 block text-[11px] font-semibold text-primary sm:text-xs">{name}</span>
              </button>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}

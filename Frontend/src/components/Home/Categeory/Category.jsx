import { BACKEND_BASE_URL } from '../../../api';
import { ArrowRight, Flower2 } from 'lucide-react';
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
    productCount: products.filter((item) => item.category === name).length,
    fallbackImage: imageAsset(index + 1),
  }));

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_#fffdf8_0%,_#fff8ec_72%,_#fff1d7_100%)] py-7 sm:py-9">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-[radial-gradient(ellipse_at_left,_rgba(217,164,65,0.16),_transparent_72%)] sm:w-40" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-[radial-gradient(ellipse_at_right,_rgba(217,164,65,0.16),_transparent_72%)] sm:w-40" />
      <PageContainer className="relative max-w-[1900px]">
        <div className="mb-7 text-center sm:mb-9">
          <div className="mx-auto mb-2 flex max-w-sm items-center justify-center gap-3 text-[#bd780e]">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d69a36]" />
            <Flower2 className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] sm:text-xs">Our Categories</p>
            <Flower2 className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d69a36]" />
          </div>
          <h2 className="font-serif text-2xl font-bold leading-tight text-[#1d2934] sm:text-3xl lg:text-4xl">
            Explore Our <span className="text-[#851b25]">Jewellery Collections</span>
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs text-gray-600 sm:text-base">
            Discover timeless designs crafted for every occasion, from traditional classics to modern trends.
          </p>
          <div aria-hidden="true" className="mx-auto mt-4 flex max-w-xs items-center gap-2 text-[#c48724]">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d69a36]" />
            <span className="text-sm">◆</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d69a36]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-3">
          {categoryItems.map(({ name, category, product, productCount, fallbackImage }) => {
            const image = resolveImageUrl(category?.image) || getProductImage(product) || fallbackImage;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onSelectCategory(name)}
                aria-label={`Explore ${name} jewellery`}
                className="group relative mx-auto block aspect-square w-full max-w-[250px] overflow-hidden rounded-full border-2 border-[#d79a31] bg-[#fffaf0] text-center shadow-[0_10px_25px_rgba(115,65,16,0.15)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(115,65,16,0.24)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d79a31]/40"
              >
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[43%] bg-gradient-to-b from-[#fff8ec]/90 via-[#fff8ec]/95 to-[#fff8ec]" />
                <span className="absolute inset-x-2 bottom-1 flex flex-col items-center sm:bottom-1.5">
                  <span className="max-w-full truncate font-serif text-sm font-bold text-[#74161b] sm:text-lg">{name}</span>
                  <span className="mt-0.5 text-[10px] text-gray-600 sm:text-xs">
                    {productCount ? `${productCount}+ Designs` : 'Explore Designs'}
                  </span>
                  <span aria-hidden="true" className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#8b1723] text-white shadow-md transition-transform group-hover:translate-x-1 sm:h-9 sm:w-9">
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}

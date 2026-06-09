import type { Category } from './categoryData';

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  subCategory: string;
  stock: number;
  price: number;
  status: 'Active' | 'Inactive';
  addedAt: string;
}

export const products: Product[] = [
  {
    id: 'PROD-0001',
    name: 'Classic Gold Ring',
    sku: 'GR-001',
    categoryId: 'CAT001',
    subCategory: "Men's Ring",
    stock: 24,
    price: 25999,
    status: 'Active',
    addedAt: '2026-06-01'
  },
  {
    id: 'PROD-0002',
    name: 'Diamond Engagement Ring',
    sku: 'GR-002',
    categoryId: 'CAT001',
    subCategory: 'Engagement Ring',
    stock: 12,
    price: 75999,
    status: 'Active',
    addedAt: '2026-06-05'
  },
  {
    id: 'PROD-0003',
    name: 'Golden Wedding Band',
    sku: 'GR-003',
    categoryId: 'CAT001',
    subCategory: 'Wedding Ring',
    stock: 8,
    price: 49999,
    status: 'Active',
    addedAt: '2026-06-07'
  },
  {
    id: 'PROD-0004',
    name: 'Pearl Gold Pendant',
    sku: 'GN-001',
    categoryId: 'CAT002',
    subCategory: 'Pendant',
    stock: 15,
    price: 45999,
    status: 'Active',
    addedAt: '2026-06-02'
  },
  {
    id: 'PROD-0005',
    name: 'Traditional Gold Chain',
    sku: 'GN-002',
    categoryId: 'CAT002',
    subCategory: 'Chain',
    stock: 10,
    price: 65999,
    status: 'Active',
    addedAt: '2026-06-06'
  },
  {
    id: 'PROD-0006',
    name: 'Ruby Hoop Earrings',
    sku: 'GE-001',
    categoryId: 'CAT003',
    subCategory: 'Hoops',
    stock: 18,
    price: 29999,
    status: 'Active',
    addedAt: '2026-06-04'
  },
  {
    id: 'PROD-0007',
    name: 'Classic Gold Studs',
    sku: 'GE-002',
    categoryId: 'CAT003',
    subCategory: 'Studs',
    stock: 22,
    price: 21999,
    status: 'Active',
    addedAt: '2026-06-03'
  },
  {
    id: 'PROD-0008',
    name: 'Bridal Gold Bangle',
    sku: 'GB-001',
    categoryId: 'CAT004',
    subCategory: 'Bridal Bangle',
    stock: 6,
    price: 89999,
    status: 'Active',
    addedAt: '2026-06-08'
  },
  {
    id: 'PROD-0009',
    name: 'Thin Gold Bangle',
    sku: 'GB-002',
    categoryId: 'CAT004',
    subCategory: 'Thin Bangle',
    stock: 14,
    price: 34999,
    status: 'Active',
    addedAt: '2026-06-09'
  },
  {
    id: 'PROD-0010',
    name: 'Antique Gold Necklace',
    sku: 'GN-003',
    categoryId: 'CAT002',
    subCategory: 'Traditional Necklace',
    stock: 5,
    price: 129999,
    status: 'Inactive',
    addedAt: '2026-06-10'
  }
];

export function findCategoryName(categoryId: string, categories: Category[]) {
  const category = categories.find((c) => c.categoryId === categoryId);
  return category ? category.categoryName : 'Unknown';
}

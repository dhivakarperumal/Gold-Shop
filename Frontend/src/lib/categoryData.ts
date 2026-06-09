export interface Category {
  categoryId: string;
  categoryName: string;
  subCategories: string[];
  image?: string;
  description?: string;
  status?: 'Active' | 'Inactive';
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const categories: Category[] = [
  {
    categoryId: 'CAT001',
    categoryName: 'Gold Rings',
    subCategories: [
      "Men's Ring",
      "Women's Ring",
      'Engagement Ring',
      'Wedding Ring'
    ]
  },
  {
    categoryId: 'CAT002',
    categoryName: 'Gold Necklaces',
    subCategories: [
      'Chain',
      'Pendant',
      'Traditional Necklace'
    ]
  },
  {
    categoryId: 'CAT003',
    categoryName: 'Gold Earrings',
    subCategories: [
      'Studs',
      'Hoops',
      'Drops'
    ]
  },
  {
    categoryId: 'CAT004',
    categoryName: 'Gold Bangles',
    subCategories: [
      'Thin Bangle',
      'Broad Bangle',
      'Bridal Bangle'
    ]
  }
];

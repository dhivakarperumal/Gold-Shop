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
    description: 'Premium gold ring collection.',
    status: 'Active',
    featured: true,
    subCategories: [
      "Men's Ring",
      "Women's Ring",
      'Engagement Ring',
      'Wedding Ring'
    ]
  },
  {
    categoryId: 'CAT002',
    categoryName: 'Gold Chains',
    description: 'Premium gold chain collection.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Rope Chain',
      'Box Chain',
      'Cuban Chain',
      'Daily Wear Chain'
    ]
  },
  {
    categoryId: 'CAT003',
    categoryName: 'Gold Necklaces',
    description: 'Elegant gold necklace collection.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Bridal Necklace',
      'Temple Necklace',
      'Choker Necklace',
      'Designer Necklace'
    ]
  },
  {
    categoryId: 'CAT004',
    categoryName: 'Gold Earrings',
    description: 'Beautiful gold earrings collection.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Stud Earrings',
      'Jhumka',
      'Hoop Earrings',
      'Drop Earrings'
    ]
  },
  {
    categoryId: 'CAT005',
    categoryName: 'Gold Bracelets',
    description: 'Stylish gold bracelets collection.',
    status: 'Active',
    featured: true,
    subCategories: [
      "Men's Bracelet",
      "Women's Bracelet",
      'Charm Bracelet',
      'Designer Bracelet'
    ]
  },
  {
    categoryId: 'CAT006',
    categoryName: 'Gold Bangles',
    description: 'Traditional and modern gold bangles.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Plain Bangles',
      'Designer Bangles',
      'Bridal Bangles',
      'Kids Bangles'
    ]
  },
  {
    categoryId: 'CAT007',
    categoryName: 'Gold Pendants',
    description: 'Premium gold pendants collection.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Religious Pendant',
      'Heart Pendant',
      'Name Pendant',
      'Designer Pendant'
    ]
  },
  {
    categoryId: 'CAT008',
    categoryName: 'Gold Coins',
    description: 'Pure gold investment coins.',
    status: 'Active',
    featured: true,
    subCategories: [
      '1 Gram Coin',
      '5 Gram Coin',
      '10 Gram Coin',
      '20 Gram Coin'
    ]
  },
  {
    categoryId: 'CAT009',
    categoryName: 'Gold Anklets',
    description: 'Elegant gold anklets collection.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Traditional Anklet',
      'Designer Anklet',
      'Kids Anklet',
      'Party Wear Anklet'
    ]
  },
  {
    categoryId: 'CAT010',
    categoryName: 'Gold Nose Pins',
    description: 'Beautiful gold nose pins collection.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Stud Nose Pin',
      'Diamond Nose Pin',
      'Floral Nose Pin',
      'Traditional Nose Pin'
    ]
  },
  {
    categoryId: 'CAT011',
    categoryName: 'Gold Sets',
    description: 'Complete gold jewelry sets.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Bridal Set',
      'Temple Set',
      'Party Wear Set',
      'Designer Set'
    ]
  },
  {
    categoryId: 'CAT012',
    categoryName: 'Kids Gold Jewelry',
    description: 'Gold jewelry collection for kids.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Kids Ring',
      'Kids Chain',
      'Kids Bracelet',
      'Kids Earrings'
    ]
  },
  {
    categoryId: 'CAT013',
    categoryName: 'Temple Jewelry',
    description: 'Traditional temple jewelry collection.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Lakshmi Necklace',
      'Temple Earrings',
      'Temple Bangles',
      'Temple Pendant'
    ]
  },
  {
    categoryId: 'CAT014',
    categoryName: 'Diamond Gold Jewelry',
    description: 'Diamond-studded gold jewelry collection.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Diamond Ring',
      'Diamond Necklace',
      'Diamond Earrings',
      'Diamond Bracelet'
    ]
  },
  {
    categoryId: 'CAT015',
    categoryName: 'Customized Jewelry',
    description: 'Personalized gold jewelry designs.',
    status: 'Active',
    featured: true,
    subCategories: [
      'Name Jewelry',
      'Photo Pendant',
      'Custom Ring',
      'Custom Necklace'
    ]
  }
];

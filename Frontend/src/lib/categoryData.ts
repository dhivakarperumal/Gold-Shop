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
    categoryId: "CAT001",
    categoryName: "Gold Rings",
    image: "data:image/jpeg;base64,...",
    description: "Premium gold ring collection.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Men's Ring",
      "Women's Ring",
      "Engagement Ring",
      "Wedding Ring"
    ]
  },
  {
    categoryId: "CAT002",
    categoryName: "Gold Chains",
    image: "data:image/jpeg;base64,...",
    description: "Premium gold chain collection.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Rope Chain",
      "Box Chain",
      "Cuban Chain",
      "Daily Wear Chain"
    ]
  },
  {
    categoryId: "CAT003",
    categoryName: "Gold Necklaces",
    image: "data:image/jpeg;base64,...",
    description: "Elegant gold necklace collection.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Bridal Necklace",
      "Temple Necklace",
      "Choker Necklace",
      "Designer Necklace"
    ]
  },
  {
    categoryId: "CAT004",
    categoryName: "Gold Earrings",
    image: "data:image/jpeg;base64,...",
    description: "Beautiful gold earrings collection.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Stud Earrings",
      "Jhumka",
      "Hoop Earrings",
      "Drop Earrings"
    ]
  },
  {
    categoryId: "CAT005",
    categoryName: "Gold Bracelets",
    image: "data:image/jpeg;base64,...",
    description: "Stylish gold bracelets collection.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Men's Bracelet",
      "Women's Bracelet",
      "Charm Bracelet",
      "Designer Bracelet"
    ]
  },
  {
    categoryId: "CAT006",
    categoryName: "Gold Bangles",
    image: "data:image/jpeg;base64,...",
    description: "Traditional and modern gold bangles.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Plain Bangles",
      "Designer Bangles",
      "Bridal Bangles",
      "Kids Bangles"
    ]
  },
  {
    categoryId: "CAT007",
    categoryName: "Gold Pendants",
    image: "data:image/jpeg;base64,...",
    description: "Premium gold pendants collection.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Religious Pendant",
      "Heart Pendant",
      "Name Pendant",
      "Designer Pendant"
    ]
  },
  {
    categoryId: "CAT008",
    categoryName: "Gold Coins",
    image: "data:image/jpeg;base64,...",
    description: "Pure gold investment coins.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "1 Gram Coin",
      "5 Gram Coin",
      "10 Gram Coin",
      "20 Gram Coin"
    ]
  },
  {
    categoryId: "CAT009",
    categoryName: "Gold Anklets",
    image: "data:image/jpeg;base64,...",
    description: "Elegant gold anklets collection.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Traditional Anklet",
      "Designer Anklet",
      "Kids Anklet",
      "Party Wear Anklet"
    ]
  },
  {
    categoryId: "CAT010",
    categoryName: "Gold Nose Pins",
    image: "data:image/jpeg;base64,...",
    description: "Beautiful gold nose pins collection.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Stud Nose Pin",
      "Diamond Nose Pin",
      "Floral Nose Pin",
      "Traditional Nose Pin"
    ]
  },
  {
    categoryId: "CAT011",
    categoryName: "Gold Sets",
    image: "data:image/jpeg;base64,...",
    description: "Complete gold jewelry sets.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Bridal Set",
      "Temple Set",
      "Party Wear Set",
      "Designer Set"
    ]
  },
  {
    categoryId: "CAT012",
    categoryName: "Kids Gold Jewelry",
    image: "data:image/jpeg;base64,...",
    description: "Gold jewelry collection for kids.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Kids Ring",
      "Kids Chain",
      "Kids Bracelet",
      "Kids Earrings"
    ]
  },
  {
    categoryId: "CAT013",
    categoryName: "Temple Jewelry",
    image: "data:image/jpeg;base64,...",
    description: "Traditional temple jewelry collection.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Lakshmi Necklace",
      "Temple Earrings",
      "Temple Bangles",
      "Temple Pendant"
    ]
  },
  {
    categoryId: "CAT014",
    categoryName: "Diamond Gold Jewelry",
    image: "data:image/jpeg;base64,...",
    description: "Diamond-studded gold jewelry collection.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Diamond Ring",
      "Diamond Necklace",
      "Diamond Earrings",
      "Diamond Bracelet"
    ]
  },
  {
    categoryId: "CAT015",
    categoryName: "Customized Jewelry",
    image: "data:image/jpeg;base64,...",
    description: "Personalized gold jewelry designs.",
    status: "Active",
    featured: true,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
    subCategories: [
      "Name Jewelry",
      "Photo Pendant",
      "Custom Ring",
      "Custom Necklace"
    ]
  }
];

const { pool } = require('../src/config/db');

const categories = [
  {
    categoryId: 'CAT001',
    categoryName: 'Gold Rings',
    description: 'Premium gold ring collection.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ["Men's Ring", "Women's Ring", 'Engagement Ring', 'Wedding Ring']
  },
  {
    categoryId: 'CAT002',
    categoryName: 'Gold Chains',
    description: 'Premium gold chain collection.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Rope Chain', 'Box Chain', 'Cuban Chain', 'Daily Wear Chain']
  },
  {
    categoryId: 'CAT003',
    categoryName: 'Gold Necklaces',
    description: 'Elegant gold necklace collection.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Bridal Necklace', 'Temple Necklace', 'Choker Necklace', 'Designer Necklace']
  },
  {
    categoryId: 'CAT004',
    categoryName: 'Gold Earrings',
    description: 'Beautiful gold earrings collection.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Stud Earrings', 'Jhumka', 'Hoop Earrings', 'Drop Earrings']
  },
  {
    categoryId: 'CAT005',
    categoryName: 'Gold Bracelets',
    description: 'Stylish gold bracelets collection.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ["Men's Bracelet", "Women's Bracelet", 'Charm Bracelet', 'Designer Bracelet']
  },
  {
    categoryId: 'CAT006',
    categoryName: 'Gold Bangles',
    description: 'Traditional and modern gold bangles.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Plain Bangles', 'Designer Bangles', 'Bridal Bangles', 'Kids Bangles']
  },
  {
    categoryId: 'CAT007',
    categoryName: 'Gold Pendants',
    description: 'Premium gold pendants collection.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Religious Pendant', 'Heart Pendant', 'Name Pendant', 'Designer Pendant']
  },
  {
    categoryId: 'CAT008',
    categoryName: 'Gold Coins',
    description: 'Pure gold investment coins.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['1 Gram Coin', '5 Gram Coin', '10 Gram Coin', '20 Gram Coin']
  },
  {
    categoryId: 'CAT009',
    categoryName: 'Gold Anklets',
    description: 'Elegant gold anklets collection.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Traditional Anklet', 'Designer Anklet', 'Kids Anklet', 'Party Wear Anklet']
  },
  {
    categoryId: 'CAT010',
    categoryName: 'Gold Nose Pins',
    description: 'Beautiful gold nose pins collection.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Stud Nose Pin', 'Diamond Nose Pin', 'Floral Nose Pin', 'Traditional Nose Pin']
  },
  {
    categoryId: 'CAT011',
    categoryName: 'Gold Sets',
    description: 'Complete gold jewelry sets.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Bridal Set', 'Temple Set', 'Party Wear Set', 'Designer Set']
  },
  {
    categoryId: 'CAT012',
    categoryName: 'Kids Gold Jewelry',
    description: 'Gold jewelry collection for kids.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Kids Ring', 'Kids Chain', 'Kids Bracelet', 'Kids Earrings']
  },
  {
    categoryId: 'CAT013',
    categoryName: 'Temple Jewelry',
    description: 'Traditional temple jewelry collection.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Lakshmi Necklace', 'Temple Earrings', 'Temple Bangles', 'Temple Pendant']
  },
  {
    categoryId: 'CAT014',
    categoryName: 'Diamond Gold Jewelry',
    description: 'Diamond-studded gold jewelry collection.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Diamond Ring', 'Diamond Necklace', 'Diamond Earrings', 'Diamond Bracelet']
  },
  {
    categoryId: 'CAT015',
    categoryName: 'Customized Jewelry',
    description: 'Personalized gold jewelry designs.',
    image: null,
    createdAt: '2026-06-09 00:00:00',
    updatedAt: '2026-06-09 00:00:00',
    status: 'Active',
    featured: true,
    subCategories: ['Name Jewelry', 'Photo Pendant', 'Custom Ring', 'Custom Necklace']
  }
];

async function createCategories() {
  const connection = await pool.getConnection();
  try {
    console.log('Starting to seed categories...');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    for (const category of categories) {
      try {
        await connection.execute(
          `INSERT INTO categories (category_id, name, description, image, status, featured, subcategories, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            category.categoryId,
            category.categoryName,
            category.description,
            category.image || null,
            category.status,
            category.featured ? 1 : 0,
            JSON.stringify(category.subCategories),
            category.createdAt || now,
            category.updatedAt || now
          ]
        );
        console.log(`✓ Category ${category.categoryName} created successfully`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠ Category ${category.categoryName} (${category.categoryId}) already exists`);
        } else {
          console.error(`✗ Error creating category ${category.categoryName}:`, error.message);
        }
      }
    }

    console.log('\n✓ Category seeding completed!');
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    connection.release();
    await pool.end();
  }
}

createCategories();

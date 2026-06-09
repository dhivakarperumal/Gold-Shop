import { useMemo, useState } from 'react';
import { categories as initialCategories, type Category } from '../../lib/categoryData';
import { products, findCategoryName } from '../../lib/productData';

interface NewCategoryForm {
  categoryId: string;
  categoryName: string;
  image: string;
  description: string;
  status: 'Active' | 'Inactive';
  featured: boolean;
  subCategories: string;
}

export function Products() {
  const [categoryList, setCategoryList] = useState<Category[]>(initialCategories);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategoryForm>({
    categoryId: '',
    categoryName: '',
    image: '',
    description: '',
    status: 'Active',
    featured: true,
    subCategories: "Men's Ring\nWomen's Ring\nEngagement Ring\nWedding Ring"
  });

  const latestProduct = products[products.length - 1];

  const nextCategoryId = useMemo(() => {
    const highestNumber = categoryList
      .map((category) => Number(category.categoryId.replace(/[^0-9]/g, '')) || 0)
      .sort((a, b) => a - b)
      .pop() ?? 0;

    return `CAT${String(highestNumber + 1).padStart(3, '0')}`;
  }, [categoryList]);

  const openCategoryModal = () => {
    setNewCategory({
      categoryId: nextCategoryId,
      categoryName: '',
      image: '',
      description: '',
      status: 'Active',
      featured: true,
      subCategories: "Men's Ring\nWomen's Ring\nEngagement Ring\nWedding Ring"
    });
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
  };

  const handleCategoryChange = (field: keyof NewCategoryForm, value: string | boolean) => {
    setNewCategory((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const saveCategory = () => {
    if (!newCategory.categoryName.trim()) {
      alert('Category name is required.');
      return;
    }

    const subCategories = newCategory.subCategories
      .split(/[,\n]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    const categoryToAdd: Category = {
      categoryId: newCategory.categoryId,
      categoryName: newCategory.categoryName.trim(),
      subCategories,
      image: newCategory.image.trim() || undefined,
      description: newCategory.description.trim() || undefined,
      status: newCategory.status,
      featured: newCategory.featured,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCategoryList((prev) => [...prev, categoryToAdd]);
    setShowCategoryModal(false);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-600">View the latest product and manage product categories and stock.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-[#1b88f3] text-white rounded">Add Product</button>
          <button
            type="button"
            onClick={openCategoryModal}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Add Category
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="bg-white border rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Latest Product Added</p>
              <h2 className="text-xl font-semibold">{latestProduct.name}</h2>
            </div>
            <span className="text-sm text-gray-600">{latestProduct.addedAt}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-500">SKU</p>
              <p className="mt-2 font-medium">{latestProduct.sku}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-500">Category</p>
              <p className="mt-2 font-medium">{findCategoryName(latestProduct.categoryId, categoryList)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-500">Subcategory</p>
              <p className="mt-2 font-medium">{latestProduct.subCategory}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-500">Stock</p>
              <p className="mt-2 font-medium">{latestProduct.stock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Category Summary</p>
          {categoryList.map((category) => (
            <div key={category.categoryId} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div>
                  <p className="text-sm font-medium">{category.categoryName}</p>
                  <p className="text-xs text-gray-500">{category.subCategories.length} subcategories</p>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                  {products.filter((product) => product.categoryId === category.categoryId).length} products
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Product List</h2>
          <p className="text-sm text-gray-500">Total {products.length} products</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Subcategory</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium">{product.name}</td>
                  <td className="px-3 py-3">{findCategoryName(product.categoryId, categoryList)}</td>
                  <td className="px-3 py-3">{product.subCategory}</td>
                  <td className="px-3 py-3">{product.stock}</td>
                  <td className="px-3 py-3">₹{product.price.toLocaleString()}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

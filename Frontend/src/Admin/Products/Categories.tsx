import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, List, LayoutGrid, Edit2, Trash2 } from 'lucide-react';
import { type Category } from '../../lib/categoryData';
import api from '../../api';

interface NewCategoryForm {
  categoryId: string;
  categoryName: string;
  imageFile: File | null;
  description: string;
  status: 'Active' | 'Inactive';
  featured: boolean;
  subCategories: string[];
}

export function Categories() {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [newCategory, setNewCategory] = useState<NewCategoryForm>({
    categoryId: '',
    categoryName: '',
    imageFile: null,
    description: '',
    status: 'Active',
    featured: true,
    subCategories: ["Men's Ring", "Women's Ring", 'Engagement Ring', 'Wedding Ring']
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategoryList(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const nextCategoryId = useMemo(() => {
    const highest = categoryList
      .map((category) => Number(category.categoryId.replace(/[^0-9]/g, '')) || 0)
      .sort((a, b) => a - b)
      .pop() ?? 0;

    return `CAT${String(highest + 1).padStart(3, '0')}`;
  }, [categoryList]);

  const openModal = () => {
    setNewCategory({
      categoryId: nextCategoryId,
      categoryName: '',
      imageFile: null,
      description: '',
      status: 'Active',
      featured: true,
      subCategories: ["Men's Ring", "Women's Ring", 'Engagement Ring', 'Wedding Ring']
    });
    setImagePreview('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setImagePreview('');
  };

  const handleChange = (field: keyof NewCategoryForm, value: string | boolean) => {
    setNewCategory((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubcategoryChange = (index: number, value: string) => {
    setNewCategory((prev) => ({
      ...prev,
      subCategories: prev.subCategories.map((item, idx) => (idx === index ? value : item))
    }));
  };

  const addSubcategory = () => {
    setNewCategory((prev) => ({
      ...prev,
      subCategories: [...prev.subCategories, '']
    }));
  };

  const removeSubcategory = (index: number) => {
    setNewCategory((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, idx) => idx !== index)
    }));
  };

  const handleImageFile = async (file: File | null) => {
    if (!file) return;
    
    // Set the file in the form
    setNewCategory((prev) => ({
      ...prev,
      imageFile: file
    }));

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveCategory = async () => {
    if (!newCategory.categoryName.trim()) {
      alert('Category name is required.');
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('categoryId', newCategory.categoryId);
      formData.append('categoryName', newCategory.categoryName.trim());
      formData.append('description', newCategory.description.trim());
      formData.append('status', newCategory.status);
      formData.append('featured', newCategory.featured.toString());
      formData.append('subCategories', JSON.stringify(
        newCategory.subCategories.map((item) => item.trim()).filter(Boolean)
      ));
      formData.append('createdAt', new Date().toISOString());
      formData.append('updatedAt', new Date().toISOString());
      
      // Add image file if present
      if (newCategory.imageFile) {
        formData.append('image', newCategory.imageFile);
      }

      const response = await api.post('/categories', formData);

      if (response.status === 201 || response.status === 200) {
        // Refresh categories list
        const categoriesResponse = await api.get('/categories');
        setCategoryList(categoriesResponse.data.categories || []);
        setShowModal(false);
        alert('Category added successfully!');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredCategories = categoryList.filter((category) =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subCategories.some((sub) => sub.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeCount = categoryList.filter((category) => (category.status ?? 'Active') === 'Active').length;
  const featuredCount = categoryList.filter((category) => category.featured).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Category Management</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-gray-500">Manage your category collections and subcategory structure.</p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1b88f3] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-[#1665c1]"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.5fr_auto] items-end">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Total categories</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{categoryList.length}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Active</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{activeCount}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Featured</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{featuredCount}</p>
          </div>
        </div>

        
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
          <label className="relative block flex-1 ">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by category or subcategory..."
              className="w-1/2 rounded-3xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <div className="inline-flex rounded-3xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition ${viewMode === 'table' ? 'bg-[#1b88f3] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition ${viewMode === 'grid' ? 'bg-[#1b88f3] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-[0.2em]">
                <tr>
                  <th className="px-4 py-4">S.No</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Subcategories</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Featured</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                      No categories match your search.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category, index) => {
                    const status = category.status ?? 'Active';

                    return (
                      <tr key={category.categoryId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-xs font-semibold text-gray-500">{index + 1}</td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-900">{category.categoryName}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-400">{category.categoryId}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {category.subCategories.map((sub) => (
                              <span key={sub} className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            category.featured ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {category.featured ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="inline-flex items-center gap-2 text-gray-400">
                            <button className="rounded-full bg-gray-50 p-2 transition hover:bg-gray-100">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button className="rounded-full bg-gray-50 p-2 transition hover:bg-red-50 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm font-semibold text-gray-500">
                No categories match your search.
              </div>
            ) : (
              filteredCategories.map((category) => {
                const status = category.status ?? 'Active';
                return (
                  <div key={category.categoryId} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    {category.image && (
                      <div className="h-40 overflow-hidden bg-gray-100">
                        <img src={category.image} alt={category.categoryName} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-gray-400">{category.categoryId}</p>
                          <h3 className="mt-2 text-xl font-semibold text-gray-900">{category.categoryName}</h3>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {status}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-gray-500">{category.description || 'No description provided for this category.'}</p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {category.subCategories.map((sub) => (
                          <span key={sub} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                      <span>{category.featured ? 'Featured category' : 'Standard category'}</span>
                      <span>{category.createdAt ? `Created ${new Date(category.createdAt).toLocaleDateString()}` : 'Created N/A'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-xl">
            <div className="shrink-0 border-b border-gray-200 p-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Add New Category</h2>
                <p className="text-sm text-gray-500 mt-1">Category ID is generated automatically.</p>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-900 shrink-0">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-gray-700">
                    Category ID
                    <input type="text" value={newCategory.categoryId} disabled className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700" />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-gray-700 md:col-span-1">
                    Category Name
                    <input
                      type="text"
                      value={newCategory.categoryName}
                      onChange={(event) => handleChange('categoryName', event.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                      placeholder="Enter category name"
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium text-gray-700">
                  Description
                  <textarea
                    value={newCategory.description}
                    onChange={(event) => handleChange('description', event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    placeholder="Category description"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-700">
                  Image Upload
                  <div className="grid gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageFile(event.target.files?.[0] ?? null)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm"
                    />
                  </div>
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">Preview</p>
                      <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="h-10 w-20 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-medium text-gray-700">Subcategories</label>
                    <button
                      type="button"
                      onClick={addSubcategory}
                      className="inline-flex mt-3 items-center gap-2 rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      <Plus className="h-5 w-5" />
                      Add
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newCategory.subCategories.map((sub, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={sub}
                          onChange={(event) => handleSubcategoryChange(index, event.target.value)}
                          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm"
                          placeholder={`Subcategory ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeSubcategory(index)}
                          className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-500 hover:bg-gray-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-gray-700">
                    Status
                    <select
                      value={newCategory.status}
                      onChange={(event) => handleChange('status', event.target.value as 'Active' | 'Inactive')}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={newCategory.featured}
                      onChange={(event) => handleChange('featured', event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#1b88f3]"
                    />
                    Featured category
                  </label>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 p-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCategory}
                className="rounded-xl bg-[#1b88f3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1665c1]"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

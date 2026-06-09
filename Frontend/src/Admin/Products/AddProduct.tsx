import { useEffect, useState } from 'react';
import { Save, Image as ImageIcon, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

export function AddProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    category: '',
    subCategory: '',
    brand: 'Royal Gold Jewellers',
    
    purity: '22K',
    hallmark: true,
    certificate: 'BIS Hallmarked',
    
    weight: 0,
    weightUnit: 'grams',
    coinWeight: '',
    
    makingCharges: 0,
    wastagePercentage: 0,
    
    price: 0,
    offerPrice: 0,
    discount: 0,
    
    stock: 0,
    sku: '',
    
    gender: 'Unisex',
    
    // Comma separated strings for simplicity in form
    occasion: 'Daily Wear, Wedding, Festival',
    color: 'Yellow Gold',
    material: 'Gold',
    size: '10, 12, 14, 16, 18, 20',
    lengthOptions: '18 Inch, 20 Inch, 22 Inch, 24 Inch',
    
    description: '',
    features: '22K Pure Gold, BIS Hallmarked, Premium Finish',
    
    dimLength: '',
    dimWidth: '',
    
    freeShipping: true,
    estimatedDelivery: '3-5 Days',
    cashOnDelivery: false,
    
    returnAvailable: true,
    returnDays: 7,
    
    metaTitle: '',
    metaDescription: '',
    keywords: 'gold, jewellery',
    
    status: 'Active',
    featured: false,
    bestSeller: false,
    newArrival: true,
  });

  useEffect(() => {
    // Fetch categories for the dropdown
    api.get('/categories').then((res) => {
      setCategories(res.data.categories || []);
    }).catch(console.error);
    
    if (isEditMode && id) {
      // Fetch product data
      api.get(`/products/${id}`).then((res) => {
        const product = res.data.product;
        if (product) {
          setFormData({
            productId: product.productId || '',
            name: product.name || '',
            category: product.category || '',
            subCategory: product.subCategory || '',
            brand: product.brand || '',
            purity: product.purity || '',
            hallmark: !!product.hallmark,
            certificate: product.certificate || '',
            weight: product.weight || 0,
            weightUnit: product.weightUnit || 'grams',
            coinWeight: product.coinWeight || '',
            makingCharges: product.makingCharges || 0,
            wastagePercentage: product.wastagePercentage || 0,
            price: product.price || 0,
            offerPrice: product.offerPrice || 0,
            discount: product.discount || 0,
            stock: product.stock || 0,
            sku: product.sku || '',
            gender: product.gender || 'Unisex',
            occasion: (product.occasion || []).join(', '),
            color: product.color || '',
            material: product.material || '',
            size: (product.size || []).join(', '),
            lengthOptions: (product.lengthOptions || []).join(', '),
            description: product.description || '',
            features: (product.features || []).join(', '),
            dimLength: product.dimensions?.length || '',
            dimWidth: product.dimensions?.width || '',
            freeShipping: product.shipping?.freeShipping ?? true,
            estimatedDelivery: product.shipping?.estimatedDelivery || '3-5 Days',
            cashOnDelivery: product.shipping?.cashOnDelivery ?? false,
            returnAvailable: product.returnPolicy?.returnAvailable ?? true,
            returnDays: product.returnPolicy?.returnDays || 7,
            metaTitle: product.seo?.metaTitle || '',
            metaDescription: product.seo?.metaDescription || '',
            keywords: (product.seo?.keywords || []).join(', '),
            status: product.status || 'Active',
            featured: !!product.featured,
            bestSeller: !!product.bestSeller,
            newArrival: !!product.newArrival,
          });
          
          if (product.images && product.images.length > 0) {
            setExistingImages(product.images);
            const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
            setImagePreviews(product.images.map((img: string) => `${baseUrl}${img}`));
          }
        }
      }).catch(err => {
        console.error(err);
        alert('Failed to load product details.');
      }).finally(() => {
        setIsFetching(false);
      });
    } else {
      // Auto-generate product ID (mock logic)
      setFormData(prev => ({ ...prev, productId: `GLD${Date.now().toString().slice(-4)}` }));
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = Number(value);
      
      setFormData(prev => {
        const newData = { ...prev, [name]: numValue };
        
        // Auto-calculation logic for pricing
        if (name === 'price' || name === 'discount') {
          const price = name === 'price' ? numValue : prev.price;
          const discount = name === 'discount' ? numValue : prev.discount;
          
          if (price > 0 && discount >= 0 && discount <= 100) {
            newData.offerPrice = Math.round(price - (price * (discount / 100)));
          } else {
            newData.offerPrice = price;
          }
        } else if (name === 'offerPrice') {
          const price = prev.price;
          const offerPrice = numValue;
          
          if (price > 0 && offerPrice >= 0 && offerPrice <= price) {
            // Calculate what the discount percentage is based on manual offer price entry
            newData.discount = Number((((price - offerPrice) / price) * 100).toFixed(2));
          }
        }
        
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    // If it's an existing image being removed (before any new files are added)
    if (index < existingImages.length && imageFiles.length === 0) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Adjust index for newly added files
      const adjustedIndex = index - (imageFiles.length > 0 ? 0 : existingImages.length);
      if (adjustedIndex >= 0) {
        setImageFiles(prev => prev.filter((_, i) => i !== adjustedIndex));
      }
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const selectedCategoryObj = categories.find(c => c.categoryName === formData.category);
  const subCategoryOptions = selectedCategoryObj?.subCategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload to match JSON structure
      const payload = new FormData();
      
      // Basic info
      payload.append('productId', formData.productId);
      payload.append('name', formData.name);
      payload.append('category', formData.category);
      payload.append('subCategory', formData.subCategory);
      payload.append('brand', formData.brand);
      payload.append('purity', formData.purity);
      payload.append('hallmark', String(formData.hallmark));
      payload.append('certificate', formData.certificate);
      payload.append('weight', String(formData.weight));
      payload.append('weightUnit', formData.weightUnit);
      if (formData.coinWeight) payload.append('coinWeight', formData.coinWeight);
      
      payload.append('makingCharges', String(formData.makingCharges));
      payload.append('wastagePercentage', String(formData.wastagePercentage));
      payload.append('price', String(formData.price));
      payload.append('offerPrice', String(formData.offerPrice));
      payload.append('discount', String(formData.discount));
      payload.append('stock', String(formData.stock));
      payload.append('sku', formData.sku);
      payload.append('gender', formData.gender);
      payload.append('color', formData.color);
      payload.append('material', formData.material);
      payload.append('description', formData.description);
      payload.append('status', formData.status);
      payload.append('featured', String(formData.featured));
      payload.append('bestSeller', String(formData.bestSeller));
      payload.append('newArrival', String(formData.newArrival));

      // Arrays (comma separated)
      const parseArray = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);
      payload.append('occasion', JSON.stringify(parseArray(formData.occasion)));
      payload.append('size', JSON.stringify(parseArray(formData.size).map(Number)));
      payload.append('lengthOptions', JSON.stringify(parseArray(formData.lengthOptions)));
      payload.append('features', JSON.stringify(parseArray(formData.features)));
      
      // Nested objects
      payload.append('dimensions', JSON.stringify({ length: formData.dimLength, width: formData.dimWidth }));
      payload.append('shipping', JSON.stringify({ 
        freeShipping: formData.freeShipping, 
        estimatedDelivery: formData.estimatedDelivery, 
        cashOnDelivery: formData.cashOnDelivery 
      }));
      payload.append('returnPolicy', JSON.stringify({ 
        returnAvailable: formData.returnAvailable, 
        returnDays: formData.returnDays 
      }));
      payload.append('seo', JSON.stringify({ 
        metaTitle: formData.metaTitle, 
        metaDescription: formData.metaDescription, 
        keywords: parseArray(formData.keywords) 
      }));

      // Existing Images (if we didn't add new ones)
      if (imageFiles.length === 0) {
        existingImages.forEach(img => {
          payload.append('images', img);
        });
      } else {
        // New Images
        imageFiles.forEach(file => {
          payload.append('images', file);
        });
      }

      // Submit to backend
      if (isEditMode) {
        await api.put(`/products/${id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Product updated successfully!');
        navigate('/admin/products/all');
      } else {
        await api.post('/products', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Product created successfully!');
        navigate('/admin/products/all');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create product. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return <div className="p-10 text-center text-gray-500">Loading product details...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-gray-500">{isEditMode ? 'Update existing product information.' : 'Create a new product listing in your catalog.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Product Name</span>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">SKU</span>
              <input required name="sku" value={formData.sku} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Category</span>
              <select required name="category" value={formData.category} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.categoryId} value={c.categoryName}>{c.categoryName}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Sub Category</span>
              <select required name="subCategory" value={formData.subCategory} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3">
                <option value="">Select Subcategory</option>
                {subCategoryOptions.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Brand</span>
              <input name="brand" value={formData.brand} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Gender</span>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3">
                <option>Male</option>
                <option>Female</option>
                <option>Unisex</option>
                <option>Kids</option>
              </select>
            </label>
          </div>
          <div className="mt-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Description</span>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3"></textarea>
            </label>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Base Price (₹)</span>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Offer Price (₹)</span>
              <input type="number" name="offerPrice" value={formData.offerPrice} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Discount (%)</span>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Making Charges (₹)</span>
              <input type="number" name="makingCharges" value={formData.makingCharges} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Wastage (%)</span>
              <input type="number" name="wastagePercentage" value={formData.wastagePercentage} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Stock Quantity</span>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Material</span>
              <input name="material" value={formData.material} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Color</span>
              <input name="color" value={formData.color} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Purity</span>
              <select name="purity" value={formData.purity} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3">
                <option>18K</option>
                <option>22K</option>
                <option>24K</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Weight</span>
              <div className="flex gap-2">
                <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
                <select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="rounded-xl border-gray-200 bg-gray-50 px-3">
                  <option>grams</option>
                  <option>kg</option>
                </select>
              </div>
            </label>
            <label className="flex items-center gap-2 mt-8">
              <input type="checkbox" name="hallmark" checked={formData.hallmark} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Is Hallmarked?</span>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Certificate Type</span>
              <input name="certificate" value={formData.certificate} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" />
            </label>
          </div>
        </div>

        {/* Arrays & Details */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details (Comma separated)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Occasion</span>
              <input name="occasion" value={formData.occasion} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" placeholder="Wedding, Daily Wear..." />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Features</span>
              <input name="features" value={formData.features} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" placeholder="Premium Finish, 22K Gold..." />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Size Options</span>
              <input name="size" value={formData.size} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" placeholder="10, 12, 14..." />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Length Options</span>
              <input name="lengthOptions" value={formData.lengthOptions} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3" placeholder="18 Inch, 20 Inch..." />
            </label>
          </div>
        </div>

        {/* Status & Flags */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Flags</h2>
          <div className="flex flex-wrap gap-6">
            <label className="space-y-1 w-48">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-gray-50 p-3">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
            <label className="flex items-center gap-2 mt-8">
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 mt-8">
              <input type="checkbox" name="bestSeller" checked={formData.bestSeller} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Best Seller</span>
            </label>
            <label className="flex items-center gap-2 mt-8">
              <input type="checkbox" name="newArrival" checked={formData.newArrival} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">New Arrival</span>
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
          
          <div className="flex gap-4 flex-wrap mb-4">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="relative w-32 h-32 border rounded-xl overflow-hidden group">
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition">
              <ImageIcon className="w-8 h-8 mb-2" />
              <span className="text-xs font-semibold">Upload</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/products/all')} className="px-6 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 transition flex items-center gap-2">
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Save Product')}
          </button>
        </div>

      </form>
    </div>
  );
}

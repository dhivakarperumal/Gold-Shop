import { useEffect, useState } from 'react';
import { Search, Plus, List, LayoutGrid, Eye, Edit2, Trash2, Box, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

// Helper to format image URLs
const getImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('data:')) return imagePath;
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  return `${baseUrl}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
};

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.categoryId === categoryId || c.categoryName === categoryId);
    return cat ? cat.categoryName : categoryId;
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.productId !== productId && p.id !== productId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete product.');
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Product Directory</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-gray-500">Manage your product specialized dossiers & stock.</p>
        </div>

        <Link
          to="/admin/products/add"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1b88f3] px-6 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-blue-200 transition hover:bg-[#1665c1] uppercase"
        >
          <Plus className="h-5 w-5" />
          Enroll New Product
        </Link>
      </div>

      {/* Main Card Container */}
      <div className="rounded-[2rem] border border-gray-100 bg-white shadow-sm p-4 sm:p-6">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <label className="relative block w-full md:w-[400px]">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Name, SKU or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-14 pr-6 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </label>

          <div className="inline-flex rounded-full border border-gray-200 bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex h-10 w-12 items-center justify-center rounded-full transition ${viewMode === 'list' ? 'bg-[#1b88f3] text-white shadow' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex h-10 w-12 items-center justify-center rounded-full transition ${viewMode === 'grid' ? 'text-gray-400 hover:bg-gray-50' : 'text-gray-400 hover:bg-gray-50'}`}
              disabled // Keep list as primary for this design specifically
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">S.No</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Product Profile</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Category Details</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Identity Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 text-center">Active Price</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 text-center">Dossier Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => {
                  const isActive = product.status === 'Active';
                  const mainImage = product.images?.[0] ? getImageUrl(product.images[0]) : null;

                  return (
                    <tr key={product.id || index} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5 text-sm font-bold text-gray-400">
                        {index + 1}
                      </td>
                      
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200/50">
                            {mainImage ? (
                              <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Box className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-[15px] uppercase tracking-wide">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] uppercase tracking-[0.1em] text-gray-400">REF: {product.sku || product.productId}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col justify-center">
                          <p className="font-semibold text-gray-700 text-sm">{getCategoryName(product.category)}</p>
                          <p className="text-[12px] text-gray-400 mt-0.5 font-medium">{product.subCategory || 'No Subcategory'}</p>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                            : 'bg-red-50 text-red-600 border border-red-100/50'
                        }`}>
                          {isActive ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {isActive ? 'Verified' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex rounded-lg bg-blue-50/80 px-3 py-1.5 text-sm font-bold text-blue-600">
                          ₹{Number(product.price || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setSelectedProduct(product)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleEdit(product.productId || product.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 transition hover:bg-blue-50 hover:text-blue-500">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(product.productId || product.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 transition hover:bg-red-50 hover:text-red-500">
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
      </div>

      {/* View Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Product Dossier</h2>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-32 h-32 rounded-2xl bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                  {selectedProduct.images?.[0] ? (
                    <img src={getImageUrl(selectedProduct.images[0])} alt="Product" className="w-full h-full object-cover" />
                  ) : (
                    <Box className="w-full h-full p-8 text-gray-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">REF: {selectedProduct.sku || selectedProduct.productId}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">{getCategoryName(selectedProduct.category)}</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">{selectedProduct.purity}</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">₹{Number(selectedProduct.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Description</h4>
                  <p className="text-sm text-gray-700">{selectedProduct.description || 'No description available.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Weight</h4>
                    <p className="text-sm text-gray-700">{selectedProduct.weight} {selectedProduct.weightUnit}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Stock Level</h4>
                    <p className="text-sm text-gray-700">{selectedProduct.stock} Units Available</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end">
              <button onClick={() => setSelectedProduct(null)} className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-100">
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

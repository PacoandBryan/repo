import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import FallingYarn from '../../components/FallingYarn';
import '../../styles/CherryBlossomTheme.css';

interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  category_id?: number;
  category_name?: string;
  image_url?: string;
  is_active: boolean;
  sku?: string;
  inventory?: number;
}

const FlaskProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    sku: '',
    inventory: '',
    is_active: true
  });

  const { logout, apiCall } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/products');
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      await fetch('/admin/logout?format=json', { method: 'GET' });
      logout();
      navigate('/');
    } catch (error) {
      logout();
      navigate('/');
    }
  };

  const openWizard = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        description: product.description || '',
        price: product.price.toString(),
        sku: product.sku || '',
        inventory: product.inventory?.toString() || '',
        is_active: product.is_active
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        sku: '',
        inventory: '',
        is_active: true
      });
    }
    setWizardStep(1);
    setShowWizard(true);
  };

  const handleNext = () => setWizardStep(s => Math.min(s + 1, 4));
  const handleBack = () => setWizardStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      const data = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        sku: formData.sku,
        inventory: formData.inventory ? parseInt(formData.inventory) : 0,
        is_active: formData.is_active
      };

      if (editingProduct) {
        await apiCall(`/products/${editingProduct.id}`, 'PUT', data);
      } else {
        await apiCall('/products', 'POST', data);
      }

      setShowWizard(false);
      fetchProducts();
    } catch (err) {
      alert('The garden encountered an issue saving your treasure.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this treasure from the garden?')) {
      try {
        await apiCall(`/products/${id}`, 'DELETE');
        fetchProducts();
      } catch (err) {
        alert('Could not remove the item.');
      }
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff0f6] to-[#ffe3ee] relative overflow-hidden pb-20">
      <FallingYarn />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-xl border-b border-[#ffc2d1]/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <a href="https://diky.mx" target="_blank" rel="noopener noreferrer" className="text-2xl font-black text-[#ff6b9a] hover:scale-105 transition-transform">
              DIKY<span className="text-[#3d2a2a]">.mx</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/admin/dashboard" className="text-sm font-bold text-[#8c6a6a] hover:text-[#ff6b9a] uppercase tracking-widest transition-colors">Dashboard</Link>
              <Link to="/admin/products" className="text-sm font-bold text-[#ff6b9a] uppercase tracking-widest border-b-2 border-[#ff6b9a] pb-1">Products</Link>
              <Link to="/admin/categories" className="text-sm font-bold text-[#8c6a6a] hover:text-[#ff6b9a] uppercase tracking-widest transition-colors">Categories</Link>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-bold text-[#8c6a6a] hover:text-[#ff6b9a] uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <span>Exit Garden</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="pt-32 max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black text-[#3d2a2a] tracking-tighter mb-2">Product Treasures</h1>
            <p className="text-[#8c6a6a] font-medium">Curate and manage your beautiful collection here, Luz.</p>
          </div>
          <button
            onClick={() => openWizard()}
            className="cherry-btn flex items-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Add New Treasure</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="cherry-card !p-4 mb-8 flex items-center gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ffb7c5]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              className="cherry-input w-full pl-12 bg-white/50 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="cherry-card !p-0 overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full py-20">
              <div className="w-8 h-8 border-4 border-[#ffb7c5] border-t-[#ff6b9a] rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#ffb7c5]/10 border-b border-[#ffc2d1]/30">
                  <th className="px-6 py-5 text-xs font-black text-[#ff6b9a] uppercase tracking-[0.2em]">Product</th>
                  <th className="px-6 py-5 text-xs font-black text-[#ff6b9a] uppercase tracking-[0.2em]">Price</th>
                  <th className="px-6 py-5 text-xs font-black text-[#ff6b9a] uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-5 text-xs font-black text-[#ff6b9a] uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffc2d1]/20">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white shadow-sm overflow-hidden flex-shrink-0 border border-[#ffc2d1]/30">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🍬</div>
                          )}
                        </div>
                        <div>
                          <div className="font-black text-[#3d2a2a] text-lg">{product.title}</div>
                          <div className="text-xs font-bold text-[#8c6a6a] uppercase tracking-widest">{product.sku || 'NO-SKU'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-black text-[#ff6b9a]">${product.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${product.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {product.is_active ? 'Blooming' : 'Dormant'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openWizard(product)}
                          className="p-2 rounded-lg bg-white/60 text-[#ff6b9a] hover:bg-[#ff6b9a] hover:text-white transition-all shadow-sm"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg bg-white/60 text-red-400 hover:bg-red-400 hover:text-white transition-all shadow-sm"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#3d2a2a]/40 backdrop-blur-md animate-fade-in">
          <div className="cherry-card w-full max-w-2xl relative overflow-hidden shadow-2xl animate-scale-up">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#ffc2d1]/30">
              <div
                className="h-full bg-[#ff6b9a] transition-all duration-500"
                style={{ width: `${(wizardStep / 4) * 100}%` }}
              ></div>
            </div>

            <button
              onClick={() => setShowWizard(false)}
              className="absolute top-6 right-6 text-[#8c6a6a] hover:text-[#ff6b9a] transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-8">
              <div className="text-xs font-black text-[#ff6b9a] uppercase tracking-[0.3em] mb-2">Step {wizardStep} of 4</div>
              <h2 className="text-3xl font-black text-[#3d2a2a] tracking-tighter">
                {wizardStep === 1 ? 'Basic Info' :
                  wizardStep === 2 ? 'Treasures Details' :
                    wizardStep === 3 ? 'Availability' : 'Confirm Growth'}
              </h2>
            </div>

            <div className="min-h-[300px]">
              {wizardStep === 1 && (
                <div className="space-y-6 animate-slide-right">
                  <div>
                    <label className="block text-sm font-bold text-[#3d2a2a] mb-2 uppercase tracking-tighter">Treasure Name</label>
                    <input
                      className="cherry-input w-full"
                      placeholder="e.g. Sugar Blush Pouch"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#3d2a2a] mb-2 uppercase tracking-tighter">Garden SKU</label>
                    <input
                      className="cherry-input w-full"
                      placeholder="e.g. SBP-001"
                      value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-6 animate-slide-right">
                  <div>
                    <label className="block text-sm font-bold text-[#3d2a2a] mb-2 uppercase tracking-tighter">Description</label>
                    <textarea
                      className="cherry-input w-full min-h-[120px]"
                      placeholder="Tell the story of this item..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#3d2a2a] mb-2 uppercase tracking-tighter">Price ($)</label>
                      <input
                        type="number"
                        className="cherry-input w-full"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#3d2a2a] mb-2 uppercase tracking-tighter">Initial Stock</label>
                      <input
                        type="number"
                        className="cherry-input w-full"
                        placeholder="0"
                        value={formData.inventory}
                        onChange={e => setFormData({ ...formData, inventory: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-8 animate-slide-right">
                  <div className="p-6 rounded-2xl bg-[#ffb7c5]/10 border-2 border-[#ffc2d1]/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-[#3d2a2a] text-lg">Blooming Status</h4>
                        <p className="text-sm text-[#8c6a6a]">Should this item be visible in the catalog immediately?</p>
                      </div>
                      <button
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        className={`w-14 h-8 rounded-full transition-all relative ${formData.is_active ? 'bg-[#ff6b9a]' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${formData.is_active ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>
                  </div>
                  <div className="text-center p-8 border-2 border-dashed border-[#ffc2d1] rounded-2xl">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="font-bold text-[#8c6a6a]">Image Upload is coming soon!</p>
                    <p className="text-xs text-[#ffb7c5] uppercase tracking-widest font-black mt-1">Luz's Prototype</p>
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="text-center py-10 animate-slide-right">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🌸</div>
                  <h3 className="text-2xl font-black text-[#3d2a2a] mb-2">Ready to bloom?</h3>
                  <p className="text-[#8c6a6a] max-w-sm mx-auto mb-8">Review the details of your new treasure. Once confirmed, it will be added to the Diky Garden.</p>
                  <div className="cherry-card !p-4 bg-[#ffb7c5]/5 text-left divide-y divide-[#ffc2d1]/20">
                    <div className="py-2 flex justify-between"><span className="text-xs font-bold uppercase text-[#ff6b9a]">Name</span> <span className="font-black text-[#3d2a2a]">{formData.title || 'Unknown'}</span></div>
                    <div className="py-2 flex justify-between"><span className="text-xs font-bold uppercase text-[#ff6b9a]">Price</span> <span className="font-black text-[#3d2a2a]">${parseFloat(formData.price || '0').toFixed(2)}</span></div>
                    <div className="py-2 flex justify-between"><span className="text-xs font-bold uppercase text-[#ff6b9a]">Status</span> <span className="font-black text-[#3d2a2a]">{formData.is_active ? 'Blooms' : 'Dormant'}</span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#ffc2d1]/20">
              <button
                onClick={handleBack}
                disabled={wizardStep === 1}
                className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${wizardStep === 1 ? 'opacity-0' : 'text-[#8c6a6a] hover:text-[#ff6b9a]'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                <span>Back</span>
              </button>

              {wizardStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="cherry-btn px-10"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="cherry-btn px-10 bg-green-500 shadow-green-200"
                >
                  Confirm & Grow
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styles for Wizard Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slide-right { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-slide-right { animation: slide-right 0.4s ease-out; }
      `}} />
    </div>
  );
};

export default FlaskProductsPage;

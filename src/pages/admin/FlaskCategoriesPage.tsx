import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import FallingYarn from '../../components/FallingYarn';
import '../../styles/CherryBlossomTheme.css';

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  products_count?: number;
}

const FlaskCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });

  const { logout, apiCall } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/catalog/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
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

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        icon: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await apiCall(`/catalog/categories/${editingCategory.id}`, 'PUT', formData);
      } else {
        await apiCall('/catalog/categories', 'POST', formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Could not update the category garden.';
      alert(errorMsg);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deleting a category will leave its treasures uncategorized. Proceed?')) {
      try {
        await apiCall(`/catalog/categories/${id}`, 'DELETE');
        fetchCategories();
      } catch (err) {
        alert('Could not remove category.');
      }
    }
  };

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
              <Link to="/admin/products" className="text-sm font-bold text-[#8c6a6a] hover:text-[#ff6b9a] uppercase tracking-widest transition-colors">Products</Link>
              <Link to="/admin/categories" className="text-sm font-bold text-[#ff6b9a] uppercase tracking-widest border-b-2 border-[#ff6b9a] pb-1">Categories</Link>
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
            <h1 className="text-5xl font-black text-[#3d2a2a] tracking-tighter mb-2">Category Garden</h1>
            <p className="text-[#8c6a6a] font-medium">Organize your treasures into beautiful blooming sections.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="cherry-btn flex items-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Add New Category</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#ffb7c5] border-t-[#ff6b9a] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div key={category.id} className="cherry-card group relative">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(category)} className="p-2 rounded-lg bg-white/60 text-[#ff6b9a] hover:bg-[#ff6b9a] hover:text-white transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="p-2 rounded-lg bg-white/60 text-red-400 hover:bg-red-400 hover:text-white transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-[#ffb7c5]/20 flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform">
                  {category.name.toLowerCase().includes('purse') ? '👜' :
                    category.name.toLowerCase().includes('sweets') ? '🍭' :
                      category.name.toLowerCase().includes('cake') ? '🍰' : '🌸'}
                </div>

                <h3 className="text-2xl font-black text-[#3d2a2a] mb-2">{category.name}</h3>
                <p className="text-[#8c6a6a] text-sm mb-6 line-clamp-2">{category.description || 'No description provided for this section of the garden.'}</p>

                <div className="flex items-center justify-between pt-6 border-t border-[#ffc2d1]/20">
                  <span className="text-xs font-black uppercase text-[#ff6b9a] tracking-widest">{category.products_count || 0} ITEMS</span>
                  <Link to="/admin/products" className="text-xs font-bold text-[#8c6a6a] hover:text-[#ff6b9a] uppercase tracking-widest">View All</Link>
                </div>
              </div>
            ))}

            <div
              onClick={() => openModal()}
              className="cherry-card border-dashed border-2 border-[#ffc2d1] bg-white/10 flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-white/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-full border-2 border-[#ffb7c5] flex items-center justify-center text-[#ffb7c5] group-hover:scale-110 group-hover:border-[#ff6b9a] group-hover:text-[#ff6b9a] transition-all mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="font-black text-[#ffb7c5] group-hover:text-[#ff6b9a] uppercase tracking-widest text-sm">Grow New Section</span>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#3d2a2a]/40 backdrop-blur-md animate-fade-in">
          <div className="cherry-card w-full max-w-lg shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-[#3d2a2a] tracking-tighter">
                {editingCategory ? 'Edit Section' : 'Add New Section'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#8c6a6a] hover:text-[#ff6b9a] transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#3d2a2a] mb-2 uppercase tracking-tighter">Section Name</label>
                <input
                  className="cherry-input w-full"
                  placeholder="e.g. Blossom Purses"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#3d2a2a] mb-2 uppercase tracking-tighter">Purpose / Description</label>
                <textarea
                  className="cherry-input w-full min-h-[100px]"
                  placeholder="What treasures belong here?"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="cherry-btn w-full">
                  {editingCategory ? 'Save Changes' : 'Grow Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles for Modal Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}} />
    </div>
  );
};

export default FlaskCategoriesPage;

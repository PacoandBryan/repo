import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import FallingYarn from '../../components/FallingYarn';
import '../../styles/CherryBlossomTheme.css';

interface DashboardStats {
  products_total: number;
  products_active: number;
  categories_total: number;
  total_inventory: number;
}

const FlaskDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout, apiCall } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/stats');
      setStats({
        products_total: data.products.total,
        products_active: data.products.active,
        categories_total: data.categories.total,
        total_inventory: data.products.total_inventory,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff0f6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ffb7c5] border-t-[#ff6b9a] rounded-full animate-spin"></div>
      </div>
    );
  }

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
              <Link to="/admin/dashboard" className="text-sm font-bold text-[#ff6b9a] uppercase tracking-widest border-b-2 border-[#ff6b9a] pb-1">Dashboard</Link>
              <Link to="/admin/products" className="text-sm font-bold text-[#8c6a6a] hover:text-[#ff6b9a] uppercase tracking-widest transition-colors">Products</Link>
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

      {/* Main Content */}
      <main className="pt-32 max-w-7xl mx-auto px-6 relative z-10">
        <header className="mb-16 text-center md:text-left">
          <div className="inline-block px-4 py-1 rounded-full bg-white/50 border border-[#ffc2d1]/50 text-[#ff6b9a] text-xs font-black uppercase tracking-[0.2em] mb-4 animate-fade-in">
            Admin Panel
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-[#3d2a2a] mb-4 tracking-tighter leading-tight">
            Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b9a] via-[#ff8fab] to-[#ffb7c5] animate-gradient-x">Luz</span>
          </h1>
          <p className="text-xl text-[#8c6a6a] font-medium max-w-2xl">
            The garden is blooming beautifully today. Here's a quick look at your treasures.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="cherry-card group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-[#ffb7c5]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#ff6b9a]">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-4xl font-black text-[#3d2a2a] mb-1">{stats?.products_total || 0}</div>
            <div className="text-sm font-bold text-[#8c6a6a] uppercase tracking-wider">Total Products</div>
          </div>

          <div className="cherry-card group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-[#ff9ecf]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#ff6b9a]">
                <path d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="text-4xl font-black text-[#3d2a2a] mb-1">{stats?.categories_total || 0}</div>
            <div className="text-sm font-bold text-[#8c6a6a] uppercase tracking-wider">Categories</div>
          </div>

          <div className="cherry-card group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-[#ff8fab]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#ff6b9a]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="text-4xl font-black text-[#3d2a2a] mb-1">{stats?.products_active || 0}</div>
            <div className="text-sm font-bold text-[#8c6a6a] uppercase tracking-wider">Active Items</div>
          </div>

          <div className="cherry-card group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-[#ffc2d1]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#ff6b9a]">
                <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="text-4xl font-black text-[#3d2a2a] mb-1">{stats?.total_inventory || 0}</div>
            <div className="text-sm font-bold text-[#8c6a6a] uppercase tracking-wider">Storage Load</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row gap-6">
          <Link to="/admin/products" className="cherry-btn flex-1 flex items-center justify-center gap-4 group">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:rotate-12 transition-transform">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Manage Products</span>
          </Link>
          <Link to="/admin/categories" className="cherry-btn flex-1 flex items-center justify-center gap-4 bg-white/40 !text-[#ff6b9a] border-2 border-[#ff6b9a] group">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:rotate-12 transition-transform">
              <path d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span>Sort Categories</span>
          </Link>
        </div>

      </main>

      {/* Footer Design Element */}
      <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-white/40 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default FlaskDashboardPage;

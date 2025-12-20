import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Link } from 'react-router-dom';

interface DashboardStats {
  products: {
    total: number;
    active: number;
    featured: number;
    inactive: number;
  };
  categories: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
  };
}

const SimpleDashboardPage: React.FC = () => {
  const { admin, logout, apiCall } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/stats');
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Welcome back, {admin?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/products"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Manage Products
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Products Stats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Products</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white font-medium">{stats.products.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active:</span>
                  <span className="text-green-400 font-medium">{stats.products.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Featured:</span>
                  <span className="text-yellow-400 font-medium">{stats.products.featured}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Inactive:</span>
                  <span className="text-red-400 font-medium">{stats.products.inactive}</span>
                </div>
              </div>
            </div>

            {/* Categories Stats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white font-medium">{stats.categories.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active:</span>
                  <span className="text-green-400 font-medium">{stats.categories.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Inactive:</span>
                  <span className="text-red-400 font-medium">{stats.categories.inactive}</span>
                </div>
              </div>
            </div>

            {/* Users Stats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Users</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white font-medium">{stats.users.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active:</span>
                  <span className="text-green-400 font-medium">{stats.users.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Inactive:</span>
                  <span className="text-red-400 font-medium">{stats.users.inactive}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/products"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md text-center font-medium transition-colors"
            >
              Manage Products
            </Link>
            <button
              onClick={() => window.location.href = '/admin/categories'}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-center font-medium transition-colors"
            >
              Manage Categories
            </button>
            <button
              onClick={fetchStats}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-md text-center font-medium transition-colors"
            >
              Refresh Stats
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleDashboardPage;

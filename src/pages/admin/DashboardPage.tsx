import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { syncCatalog, getCatalog } from '../../services/AdminApi';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    fetchCatalogStats();
  }, []);

  const fetchCatalogStats = async () => {
    try {
      setLoading(true);
      const catalogData = await getCatalog();
      
      setStats({
        products: catalogData.products?.length || 0,
        categories: catalogData.categories?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching catalog stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (direction: 'to_json' | 'to_database') => {
    try {
      setSyncLoading(true);
      setSyncMessage(null);
      
      const result = await syncCatalog(direction);
      
      setSyncMessage({
        text: result.message || `Catalog synchronized successfully (${direction})`,
        type: 'success',
      });
      
      // Refresh stats after sync
      fetchCatalogStats();
    } catch (error) {
      console.error('Error syncing catalog:', error);
      setSyncMessage({
        text: `Failed to synchronize catalog: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Products
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {loading ? '...' : stats.products}
              </dd>
            </dl>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Categories
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {loading ? '...' : stats.categories}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Database Synchronization
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Synchronize the catalog between the database and JSON file.
          </p>
        </div>
        
        {syncMessage && (
          <div className={`px-4 py-3 ${syncMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm ${syncMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {syncMessage.text}
            </p>
          </div>
        )}
        
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <button
                onClick={() => handleSync('to_json')}
                disabled={syncLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {syncLoading ? 'Syncing...' : 'Sync Database to JSON'}
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Updates the JSON file with the latest data from the database.
              </p>
            </div>
            
            <div>
              <button
                onClick={() => handleSync('to_database')}
                disabled={syncLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {syncLoading ? 'Syncing...' : 'Sync JSON to Database'}
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Updates the database with the latest data from the JSON file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage; 
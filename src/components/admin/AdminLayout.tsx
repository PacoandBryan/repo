import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar for mobile */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 flex z-40 md:hidden`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-indigo-700">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-4">
            <span className="text-white text-xl font-bold">Admin Panel</span>
          </div>
          
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              <NavLink 
                to="/admin/dashboard" 
                className={({ isActive }) => 
                  isActive 
                    ? "group flex items-center px-2 py-2 text-base font-medium rounded-md bg-indigo-800 text-white" 
                    : "group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-indigo-600"
                }
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/admin/products" 
                className={({ isActive }) => 
                  isActive 
                    ? "group flex items-center px-2 py-2 text-base font-medium rounded-md bg-indigo-800 text-white" 
                    : "group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-indigo-600"
                }
              >
                Products
              </NavLink>
              <NavLink 
                to="/admin/categories" 
                className={({ isActive }) => 
                  isActive 
                    ? "group flex items-center px-2 py-2 text-base font-medium rounded-md bg-indigo-800 text-white" 
                    : "group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-indigo-600"
                }
              >
                Categories
              </NavLink>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-700">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-indigo-800">
            <span className="text-white text-xl font-bold">Admin Panel</span>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <NavLink 
                to="/admin/dashboard" 
                className={({ isActive }) => 
                  isActive 
                    ? "group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-indigo-800 text-white" 
                    : "group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-indigo-600"
                }
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/admin/products" 
                className={({ isActive }) => 
                  isActive 
                    ? "group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-indigo-800 text-white" 
                    : "group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-indigo-600"
                }
              >
                Products
              </NavLink>
              <NavLink 
                to="/admin/categories" 
                className={({ isActive }) => 
                  isActive 
                    ? "group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-indigo-800 text-white" 
                    : "group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-indigo-600"
                }
              >
                Categories
              </NavLink>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className="md:pl-64 flex flex-col">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-4">
                    {admin?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 
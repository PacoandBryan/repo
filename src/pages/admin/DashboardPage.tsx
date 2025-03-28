import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { syncCatalog, getCatalog } from '../../services/AdminApi';
import { Link } from 'react-router-dom';
import './AdminDashboard.css'; // We'll create this file next
import AddProductButton from '../../components/admin/product/AddProductButton';
import TranslationSettings from '../../components/admin/settings/TranslationSettings';

// Define Product type for better type safety
interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  description?: string;
  imageUrl?: string;
}

// Define Category type for better type safety
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string;
  imageUrl?: string;
  count: number;
}

// Edit Product Modal Component
const EditProductModal: React.FC<{
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  categories?: Category[];
}> = ({ product, isOpen, onClose, onSave, categories = [] }) => {
  const [editedProduct, setEditedProduct] = useState<Product>({
    id: 0,
    name: '',
    category: '',
    price: '',
    stock: 0,
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setEditedProduct(prev => ({
      ...prev,
      [name]: name === 'stock' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedProduct);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4]">
              <h3 className="text-lg leading-6 font-medium text-gray-800">Edit Product</h3>
            </div>
            
            <div className="bg-white px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={editedProduct.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    id="category"
                    value={editedProduct.category}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="text"
                    name="price"
                    id="price"
                    value={editedProduct.price}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    id="stock"
                    min="0"
                    value={editedProduct.stock}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    id="description"
                    value={editedProduct.description || ''}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                  />
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    id="imageUrl"
                    value={editedProduct.imageUrl || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Category Modal Component
const CategoryModal: React.FC<{
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  isNew?: boolean;
}> = ({ category, isOpen, onClose, onSave, isNew = false }) => {
  const [editedCategory, setEditedCategory] = useState<Category>({
    id: 0,
    name: '',
    slug: '',
    description: '',
    parentCategory: '',
    imageUrl: '',
    count: 0
  });

  useEffect(() => {
    if (category) {
      setEditedCategory(category);
    } else if (isNew) {
      // Reset form for new category
      setEditedCategory({
        id: Date.now(), // Temporary ID for new category
        name: '',
        slug: '',
        description: '',
        parentCategory: '',
        imageUrl: '',
        count: 0
      });
    }
  }, [category, isNew]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from name if it's a new category or slug field hasn't been manually edited
    if (name === 'name' && (isNew || !editedCategory.slug)) {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      setEditedCategory(prev => ({
        ...prev,
        [name]: value,
        slug: slug
      }));
    } else {
      setEditedCategory(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedCategory);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4]">
              <h3 className="text-lg leading-6 font-medium text-gray-800">
                {isNew ? 'Add New Category' : 'Edit Category'}
              </h3>
            </div>
            
            <div className="bg-white px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={editedCategory.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (URL)</label>
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    value={editedCategory.slug}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    id="description"
                    value={editedCategory.description || ''}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                  />
                </div>
                
                <div>
                  <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700">Parent Category (optional)</label>
                  <select
                    name="parentCategory"
                    id="parentCategory"
                    value={editedCategory.parentCategory || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                  >
                    <option value="">None (Top Level)</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Outerwear">Outerwear</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    id="imageUrl"
                    value={editedCategory.imageUrl || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none transition-colors duration-200"
              >
                {isNew ? 'Create Category' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ product, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 py-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Product</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the product "{product.name}"? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Category Delete Confirmation Modal
const CategoryDeleteConfirmationModal: React.FC<{
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ category, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 py-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Category</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the category "{category.name}"? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom sidebar item component
const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center space-x-3 px-4 py-3 rounded-md cursor-pointer transition-all duration-200 
      ${active 
        ? 'bg-[#fcdce4] text-gray-800 shadow-sm' 
        : 'text-gray-700 hover:bg-[#fef4f7]'
      }
    `}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

// Sidebar component with pink theme

// Add this new component to enhance the dashboard with sidebar-like navigation
const PinkSideActions: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#fcc4d4] overflow-y-auto shadow-sm z-10 custom-scrollbar">
      <div className="flex flex-col h-full">
        {/* Navigation header */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4]">
          <span className="text-gray-800 text-xl font-bold">Admin Panel</span>
        </div>
      
        {/* Navigation items */}
        <div className="flex-1 p-4">
          <div className="mb-6">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main
            </h3>
            <div className="mt-2 space-y-1">
              <div 
                onClick={() => setActiveTab('dashboard')}
                className={`
                  sidebar-item flex items-center space-x-3 px-4 py-3 rounded-md cursor-pointer
                  ${activeTab === 'dashboard' 
                    ? 'pink-gradient text-gray-800 shadow-sm' 
                    : 'text-gray-700 hover:bg-[#fef4f7]'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
                <span className="font-medium">Dashboard</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Catalog
            </h3>
            <div className="mt-2 space-y-1">
              <div 
                onClick={() => setActiveTab('catalog')}
                className={`
                  sidebar-item flex items-center space-x-3 px-4 py-3 rounded-md cursor-pointer
                  ${activeTab === 'catalog' 
                    ? 'pink-gradient text-gray-800 shadow-sm' 
                    : 'text-gray-700 hover:bg-[#fef4f7]'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path>
                </svg>
                <span className="font-medium">Products</span>
              </div>
              <div 
                onClick={() => setActiveTab('categories')}
                className={`
                  sidebar-item flex items-center space-x-3 px-4 py-3 rounded-md cursor-pointer
                  ${activeTab === 'categories' 
                    ? 'pink-gradient text-gray-800 shadow-sm' 
                    : 'text-gray-700 hover:bg-[#fef4f7]'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                </svg>
                <span className="font-medium">Categories</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Marketing
            </h3>
            <div className="mt-2 space-y-1">
              <div 
                onClick={() => setActiveTab('newsletter')}
                className={`
                  sidebar-item flex items-center space-x-3 px-4 py-3 rounded-md cursor-pointer
                  ${activeTab === 'newsletter' 
                    ? 'pink-gradient text-gray-800 shadow-sm' 
                    : 'text-gray-700 hover:bg-[#fef4f7]'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                <span className="font-medium">Newsletter</span>
              </div>
            </div>
          </div>
          <div 
            onClick={() => setActiveTab('translation-settings')}
            className={`
              sidebar-item flex items-center space-x-3 px-4 py-3 rounded-md cursor-pointer
              ${activeTab === 'translation-settings' 
                ? 'pink-gradient text-gray-800 shadow-sm' 
                : 'text-gray-700 hover:bg-[#fef4f7]'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
            </svg>
            <span className="font-medium">Translation Settings</span>
          </div>
        </div>
        
        {/* Animated sync indicator */}
        <div className="p-4 border-t border-[#fcc4d4] bg-[#fef4f7] rounded-md mt-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full absolute top-0 left-0 sync-indicator opacity-75"></div>
            </div>
            <span className="text-sm text-gray-700">System synchronized</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const styleInjected = useRef(false);
  
  // State for products
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Pink Dress', category: 'Dresses', price: '$49.99', stock: 12, description: 'A beautiful pink dress for special occasions' },
    { id: 2, name: 'Floral Blouse', category: 'Tops', price: '$29.99', stock: 8, description: 'Elegant floral pattern blouse' },
    { id: 3, name: 'Denim Jeans', category: 'Bottoms', price: '$39.99', stock: 15, description: 'Classic blue denim jeans' },
    { id: 4, name: 'Summer Hat', category: 'Accessories', price: '$19.99', stock: 20, description: 'Wide-brimmed summer hat for sun protection' },
    { id: 5, name: 'Leather Sandals', category: 'Footwear', price: '$59.99', stock: 6, description: 'Comfortable leather sandals for summer' },
  ]);
  
  // State for categories
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Dresses', slug: 'dresses', count: 32, description: 'Beautiful dresses for all occasions', imageUrl: '👗' },
    { id: 2, name: 'Tops', slug: 'tops', count: 28, description: 'Stylish tops and blouses', imageUrl: '👚' },
    { id: 3, name: 'Bottoms', slug: 'bottoms', count: 24, description: 'Pants, skirts and shorts', imageUrl: '👖' },
    { id: 4, name: 'Outerwear', slug: 'outerwear', count: 18, description: 'Jackets, coats and cardigans', imageUrl: '🧥' },
    { id: 5, name: 'Accessories', slug: 'accessories', count: 15, description: 'Hats, scarves, jewelry and more', imageUrl: '👒' },
    { id: 6, name: 'Footwear', slug: 'footwear', count: 22, description: 'Shoes, boots and sandals', imageUrl: '👠' },
  ]);
  
  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // State for category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  
  // State for category delete confirmation
  const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  // State for category search, sort, and pagination
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categorySortCriteria, setCategorySortCriteria] = useState<'name' | 'count' | 'dateCreated'>('name');
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const categoryItemsPerPage = 6; // Number of categories to show per page

  useEffect(() => {
    fetchCatalogStats();
    
    // Only inject styles once
    if (!styleInjected.current) {
      // Create a style element
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        /* Pink theme for admin sidebar */
        .md\\:flex.md\\:flex-col.md\\:fixed.md\\:inset-y-0 .bg-indigo-700 {
          background-color: white !important;
        }
        
        .md\\:flex.md\\:flex-col.md\\:fixed.md\\:inset-y-0 .bg-indigo-800 {
          background-image: linear-gradient(to right, #fcdce4, #fcc4d4) !important;
        }
        
        .md\\:flex.md\\:flex-col.md\\:fixed.md\\:inset-y-0 .text-white {
          color: #4b5563 !important;
        }
        
        .md\\:flex.md\\:flex-col.md\\:fixed.md\\:inset-y-0 .bg-indigo-800.text-white {
          background-color: #fcdce4 !important;
          color: #1f2937 !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .md\\:flex.md\\:flex-col.md\\:fixed.md\\:inset-y-0 .hover\\:bg-indigo-600:hover {
          background-color: #fef4f7 !important;
        }
        
        /* Override the logo area */
        .md\\:flex.md\\:flex-col.md\\:fixed.md\\:inset-y-0 .flex-shrink-0 {
          border-bottom: 1px solid #fcc4d4;
        }
        
        /* Add a sync status indicator to the sidebar */
        .md\\:flex.md\\:flex-col.md\\:fixed.md\\:inset-y-0 nav::after {
          content: '';
          display: block;
          margin-top: 1.5rem;
          padding: 1rem;
          border-top: 1px solid #fcc4d4;
          background-color: #fef4f7;
        }
        
        /* Create a pulsing dot animation for sync status */
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .md\\:flex.md\\:flex-col.md\\:fixed.md\\:inset-y-0 nav::before {
          content: 'System synchronized';
          display: flex;
          align-items: center;
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          padding: 0.75rem;
          font-size: 0.875rem;
          color: #4b5563;
          background-color: #fef4f7;
          border-radius: 0.375rem;
          border: 1px solid #fcc4d4;
        }
        
        .md\\:flex.md\\:flex-col.md\\:fixed.md\\:inset-y-0 nav::before::before {
          content: '';
          display: block;
          width: 0.75rem;
          height: 0.75rem;
          margin-right: 0.5rem;
          border-radius: 9999px;
          background-color: #34d399;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `;
      document.head.appendChild(styleElement);
      styleInjected.current = true;
      
      // Add icons and new menu items to the sidebar
      setTimeout(() => {
        const sidebar = document.querySelector('.md\\:flex.md\\:flex-col.md\\:fixed.md\\:inset-y-0 nav');
        if (sidebar) {
          // Add Newsletter link
          const newsletterLink = document.createElement('a');
          newsletterLink.className = 'group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-[#fef4f7]';
          newsletterLink.href = '#';
          newsletterLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            setActiveTab('newsletter'); 
          });
          newsletterLink.innerHTML = `
            <svg class="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
            Newsletter
          `;
          
          // Add Manage Users link
          const usersLink = document.createElement('a');
          usersLink.className = 'group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-[#fef4f7]';
          usersLink.href = '#';
          usersLink.innerHTML = `
            <svg class="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path>
            </svg>
            Manage Users
          `;
          
          // Create a divider
          const divider = document.createElement('div');
          divider.className = 'border-t border-[#fcc4d4] my-4';
          
          // Add them to the sidebar
          sidebar.appendChild(divider);
          sidebar.appendChild(newsletterLink);
          sidebar.appendChild(usersLink);
          
          // Add icons to existing links
          const links = sidebar.querySelectorAll('a');
          links.forEach(link => {
            if (link.textContent?.includes('Dashboard') && !link.querySelector('svg')) {
              link.innerHTML = `
                <svg class="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
                Dashboard
              `;
            } else if (link.textContent?.includes('Products') && !link.querySelector('svg')) {
              link.innerHTML = `
                <svg class="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"></path>
                </svg>
                Products
              `;
            } else if (link.textContent?.includes('Categories') && !link.querySelector('svg')) {
              link.innerHTML = `
                <svg class="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                </svg>
                Categories
              `;
            }
          });
          
          // Add sync status indicator
          const syncStatus = document.createElement('div');
          syncStatus.className = 'absolute bottom-4 left-4 right-4 p-3 bg-[#fef4f7] rounded border border-[#fcc4d4] flex items-center';
          syncStatus.innerHTML = `
            <div class="relative mr-2">
                <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                <div class="w-3 h-3 bg-green-400 rounded-full absolute top-0 left-0 animate-ping opacity-75"></div>
              </div>
              <span class="text-sm text-gray-700">System synchronized</span>
          `;
          
          const sidebarContainer = sidebar.parentElement;
          if (sidebarContainer) {
            sidebarContainer.appendChild(syncStatus);
          }
        }
      }, 200);
    }
  }, [setActiveTab]);

  const fetchCatalogStats = async () => {
    try {
      setLoading(true);
      const catalogData = await getCatalog();
      
      setStats({
        products: catalogData.products?.length || 0,
        categories: catalogData.categories?.length || 0,
      });
      
      // If there are actual products in the catalog data, use them
      if (catalogData.products && catalogData.products.length > 0) {
        setProducts(catalogData.products);
      }
    } catch (error) {
      console.error('Error fetching catalog stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Handle save edited product
  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    
    // Show success message
    setSyncMessage({
      text: `Product "${updatedProduct.name}" updated successfully`,
      type: 'success'
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSyncMessage(null);
    }, 3000);
  };

  // Handle delete product click
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (productToDelete) {
      const productName = productToDelete.name;
      
      setProducts(prevProducts => 
        prevProducts.filter(p => p.id !== productToDelete.id)
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        products: prev.products - 1
      }));
      
      // Show success message
      setSyncMessage({
        text: `Product "${productName}" deleted successfully`,
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSyncMessage(null);
      }, 3000);
    }
    
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
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

  // Category Handlers
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsNewCategory(true);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsNewCategory(false);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (updatedCategory: Category) => {
    if (isNewCategory) {
      // Add new category
      setCategories(prevCategories => [...prevCategories, updatedCategory]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        categories: prev.categories + 1
      }));
      
      // Show success message
      setSyncMessage({
        text: `Category "${updatedCategory.name}" created successfully`,
        type: 'success'
      });
    } else {
      // Update existing category
      setCategories(prevCategories => 
        prevCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      );
      
      // Show success message
      setSyncMessage({
        text: `Category "${updatedCategory.name}" updated successfully`,
        type: 'success'
      });
    }
    
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
    setIsNewCategory(false);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSyncMessage(null);
    }, 3000);
  };

  const handleDeleteCategoryClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsCategoryDeleteModalOpen(true);
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      const categoryName = categoryToDelete.name;
      
      setCategories(prevCategories => 
        prevCategories.filter(c => c.id !== categoryToDelete.id)
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        categories: prev.categories - 1
      }));
      
      // Show success message
      setSyncMessage({
        text: `Category "${categoryName}" deleted successfully`,
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSyncMessage(null);
      }, 3000);
    }
    
    setIsCategoryDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  // Category search, sort, and pagination handlers
  const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategorySearchTerm(e.target.value);
    setCategoryCurrentPage(1); // Reset to first page on new search
  };

  const handleCategorySortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategorySortCriteria(e.target.value as 'name' | 'count' | 'dateCreated');
    setCategoryCurrentPage(1); // Reset to first page on sort change
  };

  const handleCategoryPageChange = (page: number) => {
    setCategoryCurrentPage(page);
  };

  // Filter, sort and paginate categories
  const getFilteredAndSortedCategories = () => {
    // First filter by search term
    const filtered = categorySearchTerm 
      ? categories.filter(category => 
          category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()))
        )
      : categories;
    
    // Then sort by selected criteria
    const sorted = [...filtered].sort((a, b) => {
      switch (categorySortCriteria) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'count':
          return b.count - a.count; // Descending order
        case 'dateCreated':
          // Using ID as a proxy for date created (higher ID = more recent)
          return b.id - a.id; // Descending order
        default:
          return 0;
      }
    });
    
    return sorted;
  };

  const getPaginatedCategories = () => {
    const filteredAndSorted = getFilteredAndSortedCategories();
    
    // Calculate pagination
    const startIndex = (categoryCurrentPage - 1) * categoryItemsPerPage;
    const endIndex = startIndex + categoryItemsPerPage;
    
    return {
      paginatedCategories: filteredAndSorted.slice(startIndex, endIndex),
      totalCategories: filteredAndSorted.length,
      totalPages: Math.ceil(filteredAndSorted.length / categoryItemsPerPage)
    };
  };

  const renderDashboardContent = () => (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4] overflow-hidden shadow-lg rounded-lg">
          <div className="px-6 py-8">
            <dl>
              <dt className="text-sm font-medium text-gray-700 truncate">
                Total Products
              </dt>
              <dd className="mt-2 text-4xl font-bold text-primary">
                {loading ? '...' : stats.products}
              </dd>
            </dl>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4] overflow-hidden shadow-lg rounded-lg">
          <div className="px-6 py-8">
            <dl>
              <dt className="text-sm font-medium text-gray-700 truncate">
                Total Categories
              </dt>
              <dd className="mt-2 text-4xl font-bold text-primary">
                {loading ? '...' : stats.categories}
              </dd>
            </dl>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4] overflow-hidden shadow-lg rounded-lg">
          <div className="px-6 py-8">
            <dl>
              <dt className="text-sm font-medium text-gray-700 truncate">
                Recent Orders
              </dt>
              <dd className="mt-2 text-4xl font-bold text-primary">
                12
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow-lg overflow-hidden sm:rounded-lg border border-[#fcc4d4]">
        <div className="px-6 py-5 bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4]">
          <h3 className="text-lg leading-6 font-medium text-gray-800">
            Database Synchronization
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Synchronize the catalog between the database and JSON file.
          </p>
        </div>
        
        {syncMessage && (
          <div className={`px-6 py-4 ${syncMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm ${syncMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {syncMessage.text}
            </p>
          </div>
        )}
        
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <button
                onClick={() => handleSync('to_json')}
                disabled={syncLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0] transition-colors duration-200 disabled:bg-pink-300"
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
                className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0] transition-colors duration-200 disabled:bg-pink-300"
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

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white shadow-lg overflow-hidden sm:rounded-lg border border-[#fcc4d4]">
          <div className="px-6 py-5 bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4]">
            <h3 className="text-lg leading-6 font-medium text-gray-800">
              Quick Actions
            </h3>
          </div>
          <div className="px-6 py-6 grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveTab('catalog')} 
              className="py-3 px-4 border border-[#fcc4d4] rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-[#fef4f7] focus:outline-none transition-colors duration-200"
            >
              Edit Catalog
            </button>
            <button 
              onClick={() => setActiveTab('newsletter')} 
              className="py-3 px-4 border border-[#fcc4d4] rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-[#fef4f7] focus:outline-none transition-colors duration-200"
            >
              Create Newsletter
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg overflow-hidden sm:rounded-lg border border-[#fcc4d4]">
          <div className="px-6 py-5 bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4]">
            <h3 className="text-lg leading-6 font-medium text-gray-800">
              Recent Activity
            </h3>
          </div>
          <div className="px-6 py-5">
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <p className="text-sm text-gray-600">New order #1082 received</p>
                <span className="text-xs text-gray-400 ml-auto">2 mins ago</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <p className="text-sm text-gray-600">Product 'Summer Dress' updated</p>
                <span className="text-xs text-gray-400 ml-auto">15 mins ago</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <p className="text-sm text-gray-600">New user registered</p>
                <span className="text-xs text-gray-400 ml-auto">1 hour ago</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <p className="text-sm text-gray-600">Newsletter 'Summer Collection' sent</p>
                <span className="text-xs text-gray-400 ml-auto">3 hours ago</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );

  const renderCatalogContent = () => (
    <div className="bg-white shadow-lg overflow-hidden sm:rounded-lg border border-[#fcc4d4]">
      <div className="px-6 py-5 bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4] flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-800">
          Catalog Management
        </h3>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className="py-2 px-4 border border-[#f09bc0] rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-[#fef4f7] focus:outline-none transition-colors duration-200"
        >
          Back to Dashboard
        </button>
      </div>
      
      {syncMessage && (
        <div className={`px-6 py-4 ${syncMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-sm ${syncMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {syncMessage.text}
          </p>
        </div>
      )}
      
      <div className="px-6 py-6">
        <div className="flex justify-between mb-6">
          <div>
            <h4 className="text-lg font-medium text-gray-800">Products</h4>
            <p className="text-sm text-gray-500">Manage your product catalog</p>
          </div>
          <AddProductButton 
            onProductAdded={() => fetchCatalogStats()}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <button 
                      onClick={() => handleEditProduct(product)} 
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(product)} 
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Categories</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <div key={category.id} className="border border-[#fcc4d4] rounded-md p-4 flex justify-between items-center">
                <span>{category.name}</span>
                <button className="text-gray-400 hover:text-gray-600" onClick={() => handleEditCategory(category)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="border border-dashed border-[#fcc4d4] rounded-md p-4 flex justify-center items-center text-[#f09bc0] hover:bg-[#fef4f7] cursor-pointer" onClick={handleAddCategory}>
              + Add Category
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewsletterContent = () => (
    <div className="bg-white shadow-lg overflow-hidden sm:rounded-lg border border-[#fcc4d4]">
      <div className="px-6 py-5 bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4] flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-800">
          Newsletter Creator
        </h3>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className="py-2 px-4 border border-[#f09bc0] rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-[#fef4f7] focus:outline-none transition-colors duration-200"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="px-6 py-6">
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-800">Create Newsletter</h4>
          <p className="text-sm text-gray-500">Design and send newsletters to your subscribers</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="newsletter-title" className="block text-sm font-medium text-gray-700">
              Newsletter Title
            </label>
            <input
              type="text"
              id="newsletter-title"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
              placeholder="Summer Collection Announcement"
            />
          </div>
          
          <div>
            <label htmlFor="newsletter-subject" className="block text-sm font-medium text-gray-700">
              Email Subject
            </label>
            <input
              type="text"
              id="newsletter-subject"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
              placeholder="Introducing Our New Summer Collection!"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Template
            </label>
            <div className="mt-1 border border-gray-300 rounded-md overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b border-gray-300">
                <div className="space-x-2">
                  <button className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 rounded">B</button>
                  <button className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 rounded italic">I</button>
                  <button className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 rounded underline">U</button>
                  <button className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 rounded">Link</button>
                  <button className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 rounded">Image</button>
                </div>
                <select className="text-xs border border-gray-300 rounded py-1 px-2">
                  <option>Select Template</option>
                  <option>Seasonal Announcement</option>
                  <option>Product Launch</option>
                  <option>Sale Promotion</option>
                </select>
              </div>
              <div className="p-4 min-h-[300px] bg-white border-dashed border-2 border-gray-200 m-4 rounded">
                <div className="text-center text-gray-400">
                  <p>Drag and drop elements here or select a template</p>
                  <p className="text-xs mt-2">Preview will appear here</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Audience
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              <div className="bg-[#fef4f7] border border-[#fcc4d4] rounded-full px-3 py-1 text-sm">
                All Subscribers
              </div>
              <div className="bg-white border border-gray-300 rounded-full px-3 py-1 text-sm hover:bg-gray-50 cursor-pointer">
                Recent Customers
              </div>
              <div className="bg-white border border-gray-300 rounded-full px-3 py-1 text-sm hover:bg-gray-50 cursor-pointer">
                VIP Members
              </div>
              <div className="bg-white border border-gray-300 rounded-full px-3 py-1 text-sm hover:bg-gray-50 cursor-pointer">
                Inactive (30+ days)
              </div>
              <div className="border border-dashed border-gray-300 rounded-full px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
                + Create Segment
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Schedule
            </label>
            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <select className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]">
                  <option>Send Immediately</option>
                  <option>Schedule for Later</option>
                  <option>Save as Draft</option>
                </select>
              </div>
              <div>
                <input
                  type="datetime-local"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                  disabled
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
            >
              Save Draft
            </button>
            <button
              className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none transition-colors duration-200"
            >
              Preview & Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoriesContent = () => {
    // Filter categories based on search term
    const filteredCategories = categorySearchTerm 
      ? categories.filter(category => 
          category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()))
        )
      : categories;
    
    // Sort categories based on selected criteria
    const sortedCategories = [...filteredCategories].sort((a, b) => {
      switch (categorySortCriteria) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'count':
          return b.count - a.count; // Descending order
        case 'dateCreated':
          // Using ID as a proxy for date created (higher ID = more recent)
          return b.id - a.id; // Descending order
        default:
          return 0;
      }
    });
    
    // Calculate pagination
    const totalCategories = sortedCategories.length;
    const totalPages = Math.ceil(totalCategories / categoryItemsPerPage);
    const startIndex = (categoryCurrentPage - 1) * categoryItemsPerPage;
    const endIndex = startIndex + categoryItemsPerPage;
    const paginatedCategories = sortedCategories.slice(startIndex, endIndex);
    
    // Generate page numbers array
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    
    return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4] overflow-hidden shadow-lg rounded-lg">
          <div className="px-6 py-8">
            <dl>
              <dt className="text-sm font-medium text-gray-700 truncate">
                Total Categories
              </dt>
              <dd className="mt-2 text-4xl font-bold text-primary">
                {categories.length}
              </dd>
            </dl>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4] overflow-hidden shadow-lg rounded-lg">
          <div className="px-6 py-8">
            <dl>
              <dt className="text-sm font-medium text-gray-700 truncate">
                Most Popular
              </dt>
              <dd className="mt-2 text-2xl font-bold text-primary">
                {categories.length > 0 
                  ? `${categories.reduce((prev, current) => (prev.count > current.count) ? prev : current).name} (${categories.reduce((prev, current) => (prev.count > current.count) ? prev : current).count} products)`
                  : 'No categories yet'
                }
              </dd>
            </dl>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4] overflow-hidden shadow-lg rounded-lg">
          <div className="px-6 py-8">
            <dl>
              <dt className="text-sm font-medium text-gray-700 truncate">
                Newest Category
              </dt>
              <dd className="mt-2 text-2xl font-bold text-primary">
                {categories.length > 0 ? categories[categories.length - 1].name : 'No categories yet'}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white shadow-lg rounded-lg border border-[#fcc4d4] overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4] flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-800">
            Categories
          </h3>
          <button className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none transition-colors duration-200" onClick={handleAddCategory}>
            Add New Category
          </button>
        </div>

        {/* Search and filters */}
        <div className="px-6 py-4 border-b border-[#fcc4d4] bg-[#fef4f7]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="relative rounded-md shadow-sm max-w-xs w-full">
              <input
                type="text"
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-[#f09bc0] focus:border-[#f09bc0]"
                placeholder="Search categories..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center space-x-2">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700">Sort by:</label>
              <select 
                id="sort" 
                value={categorySortCriteria}
                onChange={(e) => setCategorySortCriteria(e.target.value as 'name' | 'count' | 'dateCreated')}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm rounded-md"
              >
                <option value="name">Name</option>
                <option value="count">Products Count</option>
                <option value="dateCreated">Date Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories grid */}
        <div className="px-6 py-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found matching your search.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedCategories.map((category) => (
              <div key={category.id} className="border border-[#fcc4d4] rounded-lg overflow-hidden pink-shadow hover:pink-shadow-hover sidebar-item">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{category.imageUrl}</span>
                    <div className="bg-[#fef4f7] rounded-full px-2 py-1 text-xs font-medium text-gray-600">
                      {category.count} products
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">{category.name}</h4>
                  <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <button className="text-[#f09bc0] hover:text-[#e986b4] text-sm font-medium" onClick={() => handleEditCategory(category)}>
                      Edit
                    </button>
                    <div className="flex space-x-2">
                      <button className="p-1 rounded-full text-gray-400 hover:text-gray-500" onClick={() => handleEditCategory(category)}>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button className="p-1 rounded-full text-gray-400 hover:text-red-500" onClick={() => handleDeleteCategoryClick(category)}>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new category card */}
            <div 
              className="border border-dashed border-[#fcc4d4] rounded-lg p-6 flex flex-col items-center justify-center text-[#f09bc0] hover:bg-[#fef4f7] cursor-pointer transition-colors duration-200"
              onClick={handleAddCategory}
            >
              <svg className="h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
              <span className="text-lg font-medium">Add New Category</span>
            </div>
          </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#fcc4d4] flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
              <button 
                onClick={() => setCategoryCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={categoryCurrentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  categoryCurrentPage === 1 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
              Previous
            </button>
              <button 
                onClick={() => setCategoryCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={categoryCurrentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  categoryCurrentPage === totalPages
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, totalCategories)}</span> of{' '}
                  <span className="font-medium">{totalCategories}</span> categories
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button 
                    onClick={() => setCategoryCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={categoryCurrentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${
                      categoryCurrentPage === 1 
                        ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                        : 'text-gray-500 bg-white hover:bg-gray-50'
                    }`}
                  >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                  
                  {pageNumbers.map(number => (
                    <button
                      key={number}
                      onClick={() => setCategoryCurrentPage(number)}
                      aria-current={categoryCurrentPage === number ? "page" : undefined}
                      className={`${
                        categoryCurrentPage === number
                          ? 'z-10 bg-[#fcdce4] border-[#fcc4d4] text-gray-800'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                    >
                      {number}
                </button>
                  ))}
                  
                  <button 
                    onClick={() => setCategoryCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={categoryCurrentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                      categoryCurrentPage === totalPages 
                        ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                        : 'text-gray-500 bg-white hover:bg-gray-50'
                    }`}
                  >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

  const renderTranslationSettingsContent = () => (
    <div className="space-y-6">
      <TranslationSettings 
        onSave={(settings) => {
          // Optional: add any global state updates here if needed
          console.log('Translation settings saved:', settings);
        }}
      />
    </div>
  );

  return (
    <AdminLayout title={activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'catalog' ? 'Catalog Management' : activeTab === 'newsletter' ? 'Newsletter Creator' : 'Categories Management'}>
      <PinkSideActions activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Modal components */}
      <EditProductModal 
        product={selectedProduct} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleSaveProduct} 
        categories={categories}
      />
      
      <DeleteConfirmationModal 
        product={productToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      
      <CategoryModal 
        category={selectedCategory}
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        isNew={isNewCategory}
      />
      
      <CategoryDeleteConfirmationModal 
        category={categoryToDelete}
        isOpen={isCategoryDeleteModalOpen}
        onClose={() => setIsCategoryDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteCategory}
      />
      
      {/* Main content */}
      <div className="md:pl-0 lg:ml-64 panel-transition mt-16"> 
        {/* Page title and user info */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeTab === 'dashboard' ? 'Dashboard' : 
                 activeTab === 'catalog' ? 'Catalog Management' : 
                 activeTab === 'newsletter' ? 'Newsletter Creator' : 
                 'Categories Management'}
              </h1>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* User menu can go here */}
            </div>
          </div>
        </div>
        
        <div className="py-6 px-4 sm:px-6 md:px-8">
      {activeTab === 'dashboard' && renderDashboardContent()}
      {activeTab === 'catalog' && renderCatalogContent()}
      {activeTab === 'newsletter' && renderNewsletterContent()}
      {activeTab === 'categories' && renderCategoriesContent()}
      {activeTab === 'translation-settings' && renderTranslationSettingsContent()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage; 
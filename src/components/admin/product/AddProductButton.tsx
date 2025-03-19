import React, { useState } from 'react';
import MultilingualProductForm from './MultilingualProductForm';
import { createProduct } from '../../../services/AdminApi';

interface AddProductButtonProps {
  onProductAdded?: () => void;
  buttonStyle?: 'primary' | 'outline' | 'small';
  className?: string;
}

/**
 * AddProductButton Component
 * A button that opens the MultilingualProductForm modal when clicked
 */
const AddProductButton: React.FC<AddProductButtonProps> = ({ 
  onProductAdded,
  buttonStyle = 'primary',
  className = ''
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      // Call API to save the product
      await createProduct(productData);
      
      // Call callback if provided
      if (onProductAdded) {
        onProductAdded();
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving product:', error);
      return Promise.reject(error);
    }
  };

  // Button styles
  const getButtonClasses = () => {
    switch (buttonStyle) {
      case 'primary':
        return `py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0] ${className}`;
      case 'outline':
        return `py-2 px-4 border border-[#f09bc0] shadow-sm text-sm font-medium rounded-md text-[#f09bc0] 
                bg-white hover:bg-[#fef4f7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0] ${className}`;
      case 'small':
        return `py-1 px-3 border border-transparent shadow-sm text-xs font-medium rounded-md text-white 
                bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0] ${className}`;
      default:
        return className;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenForm}
        className={getButtonClasses()}
      >
        Add New Product
      </button>
      
      <MultilingualProductForm 
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveProduct}
      />
    </>
  );
};

export default AddProductButton; 
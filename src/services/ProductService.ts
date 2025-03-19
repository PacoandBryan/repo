import axios from 'axios';
import { ProductFormData } from '../types/product';

interface ProductUploadData extends Omit<ProductFormData, 'images'> {
  imageFiles: File[];
}

/**
 * Adds a new product to the database
 */
export const addProduct = async (productData: ProductUploadData): Promise<void> => {
  try {
    // Create a FormData object for multipart/form-data submission
    const formData = new FormData();
    
    // Add product data as JSON
    formData.append('title_en', productData.title.en);
    formData.append('title_es', productData.title.es);
    formData.append('description_en', productData.description.en);
    formData.append('description_es', productData.description.es);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
    
    // Add all image files
    productData.imageFiles.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });
    
    // For demonstration purposes - in a real app, send to your backend API
    // Example using axios:
    /*
    await axios.post(
      'https://your-api.example.com/products',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    */
    
    // Simulate API call with a delay for demo purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Product data would be sent to API:', {
          title: productData.title,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          imageCount: productData.imageFiles.length
        });
        resolve();
      }, 2000); // 2 second delay to simulate API call
    });
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product');
  }
}; 
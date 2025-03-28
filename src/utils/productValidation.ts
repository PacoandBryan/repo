import { ProductBase, ProductFormData, ProductValidationErrors } from '../types/product';

/**
 * Validates a product form submission
 * @param product - The product data to validate
 * @returns An object containing validation errors, if any
 */
export const validateProduct = (product: ProductFormData): ProductValidationErrors => {
  const errors: ProductValidationErrors = {};

  // Title validation
  if (!product.title.en || product.title.en.trim() === '') {
    errors.title = errors.title || {};
    errors.title.en = 'Product title in English is required';
  } else if (product.title.en.length < 3) {
    errors.title = errors.title || {};
    errors.title.en = 'Product title must be at least 3 characters';
  }

  if (!product.title.es || product.title.es.trim() === '') {
    errors.title = errors.title || {};
    errors.title.es = 'Product title in Spanish is required';
  } else if (product.title.es.length < 3) {
    errors.title = errors.title || {};
    errors.title.es = 'Product title must be at least 3 characters';
  }

  // Description validation
  if (!product.description.en || product.description.en.trim() === '') {
    errors.description = errors.description || {};
    errors.description.en = 'Product description in English is required';
  }

  if (!product.description.es || product.description.es.trim() === '') {
    errors.description = errors.description || {};
    errors.description.es = 'Product description in Spanish is required';
  }

  // Price validation
  if (product.price === undefined || product.price === null) {
    errors.price = 'Price is required';
  } else if (isNaN(product.price) || product.price < 0) {
    errors.price = 'Price must be a positive number';
  }

  // SKU validation
  if (!product.sku || product.sku.trim() === '') {
    errors.sku = 'SKU is required';
  } else if (!/^[A-Za-z0-9-_]+$/.test(product.sku)) {
    errors.sku = 'SKU can only contain letters, numbers, hyphens, and underscores';
  }

  // Category validation
  if (!product.categoryId) {
    errors.categoryId = 'Category is required';
  }

  // Inventory validation
  if (product.inventory.quantity === undefined || product.inventory.quantity === null) {
    errors.inventory = errors.inventory || {};
    errors.inventory.quantity = 'Inventory quantity is required';
  } else if (isNaN(product.inventory.quantity) || product.inventory.quantity < 0) {
    errors.inventory = errors.inventory || {};
    errors.inventory.quantity = 'Inventory quantity must be a positive number';
  }

  // Images validation
  if (!product.images || product.images.length === 0) {
    errors.images = 'At least one product image is required';
  }

  return errors;
};

/**
 * Checks if a product has validation errors
 * @param errors - The validation errors object
 * @returns True if there are validation errors
 */
export const hasValidationErrors = (errors: ProductValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Generates a URL-friendly slug from a product title
 * @param title - The product title
 * @returns A URL-friendly slug
 */
export const generateProductSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim(); // Trim spaces from start and end
}; 
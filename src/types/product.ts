export interface ProductBase {
  id?: string;
  slug: string;
  title: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  price: number;
  salePrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  categoryId: string;
  subcategoryIds?: string[];
  tags: string[];
  attributes: ProductAttribute[];
  inventory: {
    quantity: number;
    lowStockThreshold?: number;
    isInStock: boolean;
    isBackorderable?: boolean;
  };
  dimensions?: {
    weight: number;
    width: number;
    height: number;
    length: number;
    unit: 'cm' | 'in';
  };
  images: ProductImage[];
  featuredImageIndex?: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  status: 'draft' | 'published' | 'archived';
  featured?: boolean;
  relatedProductIds?: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
  filterable?: boolean;
}

export interface ProductImage {
  id: string;
  file: File | null;
  preview: string;
  watermarked: string;
  altText?: string;
  sortOrder?: number;
}

export interface ProductVariant {
  id?: string;
  productId: string;
  sku: string;
  barcode?: string;
  options: ProductVariantOption[];
  price: number;
  salePrice?: number;
  inventory: {
    quantity: number;
    isInStock: boolean;
  };
  images: ProductImage[];
}

export interface ProductVariantOption {
  name: string;
  value: string;
}

export interface ProductFormData extends Omit<ProductBase, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'> {
  // Form-specific properties
}

export interface WatermarkSettings {
  logo: 'diky' | 'gaby' | 'custom';
  customLogo?: File;
  opacity: number;
  scale: number;
  position: 'center' | 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
}

export interface ProductValidationErrors {
  title?: {
    en?: string;
    es?: string;
  };
  description?: {
    en?: string;
    es?: string;
  };
  price?: string;
  sku?: string;
  categoryId?: string;
  inventory?: {
    quantity?: string;
  };
  images?: string;
}

export interface ProductFilterParams {
  search?: string;
  categoryId?: string;
  subcategoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  sortBy?: 'price' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
} 
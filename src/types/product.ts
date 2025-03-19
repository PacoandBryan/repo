export interface ProductFormData {
  title: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  price: number;
  category: string;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  file: File | null;
  preview: string;
  watermarked: string;
}

export interface WatermarkSettings {
  logo: 'diky' | 'gaby' | 'custom';
  customLogo?: File;
  opacity: number;
  scale: number;
  position: 'center' | 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
} 
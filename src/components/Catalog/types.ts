export interface ProductPromotion {
  id: number;
  label: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  ends_at?: string | null;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number | null;
  promotion?: ProductPromotion | null;
  description: string;
  image?: string;
  additionalImages?: string[];
  images?: string[];
  artisan: string | {
    name: string;
    location: string;
    image: string;
    quote: string;
  };
  region?: string;
  technique: string;
  category: string;
}
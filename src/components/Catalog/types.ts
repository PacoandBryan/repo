export interface Product {
  id: number;
  name: string;
  price: number;
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
import axios from 'axios';
import { Product } from '../components/Catalog/types';

const API_BASE_URL = '/api/catalog';

export interface CatalogResponse {
    products: Product[];
    total: number;
}

export interface CategoryData {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url?: string;
    product_count: number;
}

export interface CategoriesResponse {
    categories: CategoryData[];
    total: number;
}

export const PublicCatalogService = {
    fetchProducts: async (params?: { category?: string; search?: string; featured?: boolean }): Promise<CatalogResponse> => {
        const response = await axios.get(`${API_BASE_URL}/products`, { params });
        // Transform backend Product to frontend Product if necessary
        const products = response.data.products.map((p: any) => ({
            id: p.id,
            name: p.title,
            price: p.price,
            description: p.description,
            image: p.image_url,
            category: p.category?.name || 'Bolsos',
        }));
        return {
            products,
            total: response.data.total
        };
    },

    fetchCategories: async (): Promise<CategoriesResponse> => {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        return response.data;
    }
};

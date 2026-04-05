import axios from 'axios';
import { Product } from '../components/Catalog/types';

import { API_URLS } from '../config/api';

const API_BASE_URL = `${API_URLS.API_ROOT}/catalog`;

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
        const products = response.data.products.map((p: any) => {
            const product = {
                id: p.id,
                name: p.title,
                price: p.price,
                sale_price: p.sale_price ?? null,
                promotion: p.promotion ?? null,
                description: p.description,
                image: p.image_url ? (p.image_url.startsWith('http') ? p.image_url : `${API_URLS.BASE}${p.image_url}`) : '',
                category: p.category?.name || 'Sin Categoría',
            };

            // Remove discount for 'Bolsa default azul' as requested
            if (product.name === "Bolsa default azul") {
                product.sale_price = null;
                product.promotion = null;
            }

            return product;
        });
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

/**
 * API Configuration
 * 
 * In development, VITE_API_BASE_URL will typically be empty or '/' 
 * because the Vite dev server proxies /api requests to the local backend.
 * 
 * In production (Google Cloud), VITE_API_BASE_URL should be set to 
 * the URL of the Cloud Run service (e.g., https://backend-xyz.a.run.app).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_URLS = {
    BASE: API_BASE_URL,
    API_ROOT: `${API_BASE_URL}/api`,
    UPLOADS: `${API_BASE_URL}/uploads`,
    CHAT: `${API_BASE_URL}/api/chat`,
    CONTACT: `${API_BASE_URL}/api/contact`,
    ADMIN: {
        AUTH: `${API_BASE_URL}/api/admin/auth`,
        TOKEN_VALIDATE: `${API_BASE_URL}/api/admin/validate-token`,
        CATALOG: `${API_BASE_URL}/api/admin/catalog`,
        PRODUCTS: `${API_BASE_URL}/api/admin/catalog/products`,
        CATEGORIES: `${API_BASE_URL}/api/admin/catalog/categories`,
        SYNC: `${API_BASE_URL}/api/admin/catalog/sync`,
    }
};

export default API_URLS;

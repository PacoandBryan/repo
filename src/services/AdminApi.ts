import API_URLS from '../config/api';

// Helper function to get the JWT token
const getToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

// Helper function to create headers with authentication
const createAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Authentication API
export const loginAdmin = async (email: string, password: string) => {
  const response = await fetch(API_URLS.ADMIN.AUTH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
};

// Catalog API
export const getCatalog = async () => {
  const response = await fetch(API_URLS.ADMIN.CATALOG, {
    method: 'GET',
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch catalog');
  }

  return response.json();
};

export const syncCatalog = async (direction: 'to_json' | 'to_database' = 'to_json') => {
  const response = await fetch(API_URLS.ADMIN.SYNC, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify({ direction }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync catalog');
  }

  return response.json();
};

// Products API
export const getProducts = async (params?: { category?: string, limit?: number, skip?: number }) => {
  const queryParams = new URLSearchParams();

  if (params?.category) queryParams.append('category', params.category);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.skip) queryParams.append('skip', params.skip.toString());

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const response = await fetch(`${API_URLS.ADMIN.PRODUCTS}${queryString}`, {
    method: 'GET',
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch products');
  }

  return response.json();
};

export const getProduct = async (productId: string) => {
  const response = await fetch(`${API_URLS.ADMIN.PRODUCTS}/${productId}`, {
    method: 'GET',
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch product');
  }

  return response.json();
};

export const createProduct = async (productData: any) => {
  const response = await fetch(API_URLS.ADMIN.PRODUCTS, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create product');
  }

  return response.json();
};

export const updateProduct = async (productId: string, productData: any) => {
  const response = await fetch(`${API_URLS.ADMIN.PRODUCTS}/${productId}`, {
    method: 'PUT',
    headers: createAuthHeaders(),
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update product');
  }

  return response.json();
};

export const deleteProduct = async (productId: string) => {
  const response = await fetch(`${API_URLS.ADMIN.PRODUCTS}/${productId}`, {
    method: 'DELETE',
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete product');
  }

  return response.json();
};

// Categories API
export const getCategories = async (params?: { limit?: number, skip?: number }) => {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.skip) queryParams.append('skip', params.skip.toString());

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const response = await fetch(`${API_URLS.ADMIN.CATEGORIES}${queryString}`, {
    method: 'GET',
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch categories');
  }

  return response.json();
};

export const getCategory = async (categoryId: string) => {
  const response = await fetch(`${API_URLS.ADMIN.CATEGORIES}/${categoryId}`, {
    method: 'GET',
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch category');
  }

  return response.json();
};

export const createCategory = async (categoryData: any) => {
  const response = await fetch(API_URLS.ADMIN.CATEGORIES, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create category');
  }

  return response.json();
};

export const updateCategory = async (categoryId: string, categoryData: any) => {
  const response = await fetch(`${API_URLS.ADMIN.CATEGORIES}/${categoryId}`, {
    method: 'PUT',
    headers: createAuthHeaders(),
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update category');
  }

  return response.json();
};

export const deleteCategory = async (categoryId: string) => {
  const response = await fetch(`${API_URLS.ADMIN.CATEGORIES}/${categoryId}`, {
    method: 'DELETE',
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }

  return response.json();
};

// Promotions API
export const getPromotions = async (productId?: number) => {
  const query = productId ? `?product_id=${productId}` : '';
  const response = await fetch(`${API_URLS.API_ROOT}/admin/promotions${query}`, {
    method: 'GET',
    headers: createAuthHeaders(),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch promotions');
  return response.json();
};

export const createPromotion = async (data: {
  product_id: number;
  label: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
}) => {
  const response = await fetch(`${API_URLS.API_ROOT}/admin/promotions`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'Failed to create promotion');
  return response.json();
};

export const updatePromotion = async (promoId: number, data: Partial<{
  label: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}>) => {
  const response = await fetch(`${API_URLS.API_ROOT}/admin/promotions/${promoId}`, {
    method: 'PUT',
    headers: createAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'Failed to update promotion');
  return response.json();
};

export const deletePromotion = async (promoId: number) => {
  const response = await fetch(`${API_URLS.API_ROOT}/admin/promotions/${promoId}`, {
    method: 'DELETE',
    headers: createAuthHeaders(),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'Failed to delete promotion');
  return response.json();
}; 
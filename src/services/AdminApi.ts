/**
 * Admin API service for e-commerce application
 * Handles all API calls to the admin endpoints
 */

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
  const response = await fetch('/api/admin/auth', {
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
  const response = await fetch('/api/admin/catalog', {
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
  const response = await fetch('/api/admin/catalog/sync', {
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
  
  const response = await fetch(`/api/admin/catalog/products${queryString}`, {
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
  const response = await fetch(`/api/admin/catalog/products/${productId}`, {
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
  const response = await fetch('/api/admin/catalog/products', {
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
  const response = await fetch(`/api/admin/catalog/products/${productId}`, {
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
  const response = await fetch(`/api/admin/catalog/products/${productId}`, {
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
  
  const response = await fetch(`/api/admin/catalog/categories${queryString}`, {
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
  const response = await fetch(`/api/admin/catalog/categories/${categoryId}`, {
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
  const response = await fetch('/api/admin/catalog/categories', {
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
  const response = await fetch(`/api/admin/catalog/categories/${categoryId}`, {
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
  const response = await fetch(`/api/admin/catalog/categories/${categoryId}`, {
    method: 'DELETE',
    headers: createAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }
  
  return response.json();
}; 
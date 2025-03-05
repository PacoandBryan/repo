import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminContextType {
  isAuthenticated: boolean;
  admin: {
    email: string;
  } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  apiCall: (endpoint: string, method?: string, data?: any) => Promise<any>;
}

const AdminContext = createContext<AdminContextType>({
  isAuthenticated: false,
  admin: null,
  login: async () => false,
  logout: () => {},
  loading: true,
  apiCall: async () => ({}),
});

export const useAdmin = () => useContext(AdminContext);

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to validate stored token
  const validateToken = async () => {
    const token = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_data');
    
    console.log("Token validation - Token exists:", !!token);
    console.log("Token validation - Admin data exists:", !!adminData);
    
    if (!token || !adminData) {
      setLoading(false);
      return;
    }
    
    try {
      // Call a simple protected endpoint to validate the token
      console.log("Validating token with backend...");
      const response = await fetch('/api/admin/validate-token', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log("Token validation response:", response.status);
      
      if (response.ok) {
        // Token is valid
        console.log("Token is valid, setting authenticated state");
        setAdmin(JSON.parse(adminData));
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        // Token is invalid or expired
        console.log("Token is invalid, clearing auth state");
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      // On error, clear potentially invalid data
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_data');
    } finally {
      setLoading(false);
    }
  };

  // Function to check authentication state from localStorage
  const checkAuthState = () => {
    const token = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_data');
    
    console.log("Auth check - Token exists:", !!token);
    console.log("Auth check - Admin data exists:", !!adminData);
    
    if (token && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
        setIsAuthenticated(true);
        console.log("Auth state restored from localStorage");
      } catch (e) {
        console.error("Error parsing admin data:", e);
        // Clear invalid data
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    // First restore from localStorage for immediate UI response
    checkAuthState();
    // Then validate with the backend
    validateToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Login attempt started for:", email);
      setLoading(true);
      
      // Log the request details for debugging
      console.log("Making request to:", 'http://localhost:5000/api/admin/auth', "with method: POST");
      
      // Using the full URL with localhost:5000 instead of relative URL
      const response = await fetch('http://localhost:5000/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password 
        })
      });

      console.log("Login response status:", response.status);
      console.log("Login response headers:", Object.fromEntries([...response.headers.entries()]));
      
      // Get full response for debugging
      const responseText = await response.text();
      console.log("Full response text:", responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      
      // Try to parse it as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error(`Login failed: Could not parse server response`);
      }
      
      if (!response.ok) {
        // Handle non-JSON responses or empty responses safely
        let errorMessage = `Login failed with status ${response.status}`;
        
        // For 405 errors, add more detailed information
        if (response.status === 405) {
          errorMessage = `Method Not Allowed (405): The server does not allow POST requests to this endpoint. Check your API routes configuration.`;
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
        
        errorMessage = data?.error || errorMessage;
        throw new Error(errorMessage);
      }

      console.log("Login successful, received data:", { ...data, access_token: data.access_token ? "[PRESENT]" : "[MISSING]" });
      
      // Verify we received a token before proceeding
      if (!data.access_token) {
        throw new Error('No authentication token received');
      }
      
      // Store the token and admin data
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_data', JSON.stringify({ email: data.email }));
      
      setAdmin({ email: data.email });
      setIsAuthenticated(true);
      setLoading(false);
      console.log("Authentication state updated, redirecting...");
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  // New method to make authenticated API calls to admin endpoints
  const apiCall = async (endpoint: string, method: string = 'GET', data?: any) => {
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      // The backend already has '/api/admin' as the url_prefix, so we shouldn't duplicate it
      const url = endpoint.startsWith('/') 
        ? `/api/admin${endpoint}`
        : `/api/admin/${endpoint}`;
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          logout();
          throw new Error('Authentication expired. Please login again.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API call error (${endpoint}):`, error);
      throw error;
    }
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, admin, login, logout, loading, apiCall }}>
      {children}
    </AdminContext.Provider>
  );
};

// Protected route wrapper component
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedAdminRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/admin/login' 
}) => {
  const { isAuthenticated, loading } = useAdmin();
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);
  
  useEffect(() => {
    console.log("Protected route check - Auth:", isAuthenticated, "Loading:", loading);
    if (!loading && !isAuthenticated && !redirected) {
      console.log("Not authenticated, redirecting to:", redirectTo);
      setRedirected(true);
      navigate(redirectTo);
    }
  }, [isAuthenticated, loading, redirectTo, navigate, redirected]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : null;
}; 
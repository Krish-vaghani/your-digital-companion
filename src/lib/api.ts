// API configuration and helper functions

const API_BASE_URL = localStorage.getItem('api_base_url') || 'http://localhost:5000';

export const setApiBaseUrl = (url: string) => {
  localStorage.setItem('api_base_url', url);
};

export const getApiBaseUrl = () => {
  return localStorage.getItem('api_base_url') || 'http://localhost:5000';
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token') || '';
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// API request helper
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.data?.token) {
      setAuthToken(data.data.token);
    }
    return data;
  },
  
  register: async (name: string, email: string, password: string) => {
    return apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
};

// Landing section endpoints
export const landingApi = {
  getSections: async () => {
    return apiRequest('/api/v1/landing/sections');
  },
  
  getSection: async (key: string) => {
    return apiRequest(`/api/v1/landing/section/${key}`);
  },
  
  updateSection: async (sectionId: string, data: Record<string, unknown>) => {
    return apiRequest(`/api/admin/landing/section/update/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  addSection: async (data: Record<string, unknown>) => {
    return apiRequest('/api/admin/landing/section/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Product endpoints
export const productApi = {
  list: async (params?: { page?: number; limit?: number; category?: string; tag?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.category) queryParams.set('category', params.category);
    if (params?.tag) queryParams.set('tag', params.tag);
    
    const query = queryParams.toString();
    return apiRequest(`/api/v1/product/list${query ? `?${query}` : ''}`);
  },
  
  add: async (data: Record<string, unknown>) => {
    return apiRequest('/api/admin/product/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (productId: string, data: Record<string, unknown>) => {
    return apiRequest(`/api/admin/product/update/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (productId: string) => {
    return apiRequest(`/api/admin/product/delete/${productId}`, {
      method: 'DELETE',
    });
  },
};

// Upload endpoint
export const uploadApi = {
  uploadImage: async (file: File) => {
    const baseUrl = getApiBaseUrl();
    const token = getAuthToken();
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${baseUrl}/api/admin/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    
    return data;
  },
};

// Health check
export const healthApi = {
  check: async () => {
    return apiRequest('/health');
  },
};

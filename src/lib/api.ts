// API configuration and helper functions

const API_BASE_URL = 'https://api.pursolina.com';

export const getApiBaseUrl = () => {
  return API_BASE_URL;
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
    'bypass-tunnel-reminder': 'true',
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

// Auth endpoints (admin login uses base URL + /api/admin/auth/login)
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await apiRequest('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const token = data.data?.token ?? data.token;
    if (token) {
      setAuthToken(token);
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

// Upload endpoint – calls POST /api/admin/upload/image and returns the image URL
export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const baseUrl = getApiBaseUrl();
    const token = getAuthToken();

    const formData = new FormData();
    formData.append('image', file, file.name || 'image');

    const response = await fetch(`${baseUrl}/api/admin/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'bypass-tunnel-reminder': 'true',
      },
      body: formData,
    });

    let data: Record<string, unknown> & { message?: string };
    const contentType = response.headers.get('content-type') || '';
    try {
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(text || 'Upload failed');
        }
        if (text.startsWith('http://') || text.startsWith('https://')) {
          return text.trim();
        }
        try {
          data = JSON.parse(text) as Record<string, unknown>;
        } catch {
          throw new Error('Upload response was not a URL or JSON');
        }
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error('Invalid response from upload server');
      }
      throw err;
    }

    if (!response.ok) {
      throw new Error((data as { message?: string }).message || 'Upload failed');
    }

    const raw = data as Record<string, unknown>;
    const dataObj = raw?.data as string | Record<string, unknown> | undefined;
    const url: string | undefined =
      typeof dataObj === 'string'
        ? dataObj
        : typeof dataObj?.url === 'string'
          ? dataObj.url
          : typeof raw?.url === 'string'
            ? raw.url
            : typeof raw?.imageUrl === 'string'
              ? raw.imageUrl
              : undefined;
    if (typeof url !== 'string' || !url) {
      throw new Error(
        'Upload succeeded but no image URL in response. Keys: ' + JSON.stringify(Object.keys(raw || {}))
      );
    }
    return url;
  },
};

// Order endpoints
export const orderApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    const query = queryParams.toString();
    return apiRequest(`/api/admin/order/list${query ? `?${query}` : ''}`);
  },

  getDetail: async (orderId: string) => {
    return apiRequest(`/api/admin/order/${orderId}`);
  },

  updateStatus: async (orderId: string, status: string) => {
    return apiRequest(`/api/admin/order/update-status/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Testimonial endpoints (admin)
export const testimonialApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    const query = queryParams.toString();
    return apiRequest(`/api/admin/testimonial/list${query ? `?${query}` : ''}`);
  },

  add: async (data: {
    message: string;
    review: number;
    user_name: string;
    user_address: string;
    user_image?: string;
  }) => {
    return apiRequest('/api/admin/testimonial/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    testimonialId: string,
    data: {
      message?: string;
      review?: number;
      user_name?: string;
      user_address?: string;
      user_image?: string;
    }
  ) => {
    return apiRequest(`/api/admin/testimonial/update/${testimonialId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (testimonialId: string) => {
    return apiRequest(`/api/admin/testimonial/delete/${testimonialId}`, {
      method: 'DELETE',
    });
  },
};

// Health check
export const healthApi = {
  check: async () => {
    return apiRequest('/health');
  },
};

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

// ─── Landing Section Enum ─────────────────────────────────────────────────────

export type LandingSection =
  | 'hero'
  | 'best_collections'
  | 'elevate_look'
  | 'fresh_styles'
  | null;

export const LANDING_SECTION_OPTIONS: { value: LandingSection; label: string }[] = [
  { value: null,               label: 'None'            },
  { value: 'hero',             label: 'Hero'            },
  { value: 'best_collections', label: 'Best Collections'},
  { value: 'elevate_look',     label: 'Elevate Look'    },
  { value: 'fresh_styles',     label: 'Fresh Styles'    },
];

export const landingSectionLabel = (v: LandingSection): string =>
  LANDING_SECTION_OPTIONS.find((o) => o.value === v)?.label ?? 'None';

// ─── API request helper ───────────────────────────────────────────────────────

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

// ─── Auth ─────────────────────────────────────────────────────────────────────

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

// ─── Landing (admin) ──────────────────────────────────────────────────────────
// GET /admin/landing → data.hero / data.best_collections / data.elevate_look / data.fresh_styles
// Each section has a `products` array of full Product docs + optional hero config fields.

export const landingApi = {
  getLanding: async () => {
    return apiRequest('/api/admin/landing');
  },

  updateSection: async (sectionId: string, data: Record<string, unknown>) => {
    return apiRequest(`/api/admin/landing/section/update/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  hero: {
    create: async (body: {
      images?: string[];
      price?: number;
      rating?: number;
      numberOfReviews?: number;
    }) => apiRequest('/api/admin/landing/hero', { method: 'POST', body: JSON.stringify(body) }),

    update: async (body: {
      images?: string[];
      price?: number;
      rating?: number;
      numberOfReviews?: number;
    }) => apiRequest('/api/admin/landing/hero', { method: 'PUT', body: JSON.stringify(body) }),
  },
};

// ─── Products (admin) ─────────────────────────────────────────────────────────

export interface AdminProduct {
  _id: string;
  name: string;
  slug?: string;
  category?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  price: number;
  salePrice?: number | null;
  originalPrice?: number | null;
  landingSection: LandingSection;
  tags?: string[];
  is_active?: boolean;
  colorVariants?: {
    colorCode: string;
    colorName?: string;
    images?: string[];
    default?: boolean;
  }[];
  dimensions?: {
    heightCm?: number;
    widthCm?: number;
    depthCm?: number;
  };
  averageRating?: number;
  numberOfReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const productApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    landingSection?: LandingSection;
    is_active?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page)   queryParams.set('page',  params.page.toString());
    if (params?.limit)  queryParams.set('limit', params.limit.toString());
    if (params?.category) queryParams.set('category', params.category);
    if (params?.tag)      queryParams.set('tag',      params.tag);
    if (params?.landingSection !== undefined && params.landingSection !== null) {
      queryParams.set('landingSection', params.landingSection);
    }
    if (params?.is_active !== undefined) {
      queryParams.set('is_active', params.is_active.toString());
    }
    const query = queryParams.toString();
    return apiRequest(`/api/admin/product/list${query ? `?${query}` : ''}`);
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

  updateLandingSection: async (productId: string, landingSection: LandingSection) => {
    return apiRequest(`/api/admin/product/update/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ landingSection }),
    });
  },

  delete: async (productId: string) => {
    return apiRequest(`/api/admin/product/delete/${productId}`, {
      method: 'DELETE',
    });
  },
};

// ─── Public landing ───────────────────────────────────────────────────────────

export interface PublicProduct {
  _id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  price: number;
  originalPrice?: number | null;
  salePrice?: number | null;
  landingSection?: LandingSection;
  tags?: string[];
  is_active?: boolean;
  colorVariants?: {
    colorCode: string;
    colorName?: string;
    images?: string[];
    default?: boolean;
  }[];
}

export interface PublicLandingData {
  hero?: {
    _id?: string;
    images?: string[];
    price?: number;
    rating?: number;
    numberOfReviews?: number;
    products?: PublicProduct[];
  };
  best_collections?: PublicProduct[] | { products?: PublicProduct[] };
  elevate_look?:     PublicProduct[] | { products?: PublicProduct[] };
  fresh_styles?:     PublicProduct[] | { products?: PublicProduct[] };
}

const extractProducts = (
  section: PublicProduct[] | { products?: PublicProduct[] } | undefined
): PublicProduct[] => {
  if (!section) return [];
  if (Array.isArray(section)) return section;
  return section.products ?? [];
};

export const publicLandingApi = {
  getLanding: async (): Promise<PublicLandingData> => {
    const res = await apiRequest('/api/v1/landing');
    return (res.data ?? res) as PublicLandingData;
  },
  extractProducts,
};

// ─── Upload ───────────────────────────────────────────────────────────────────

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

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orderApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page)  queryParams.set('page',  params.page.toString());
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

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const testimonialApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page)  queryParams.set('page',  params.page.toString());
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

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check: async () => {
    return apiRequest('/health');
  },
};

// ─── Legacy type alias (kept for BestCollectionManager) ──────────────────────

export interface LandingProductItem {
  product?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  images?: string[];
  price?: number;
  originalPrice?: number | null;
  rating?: number;
  numberOfReviews?: number;
  tags?: string[];
  colors?: { colorCode: string; images: string[]; default?: boolean }[];
}

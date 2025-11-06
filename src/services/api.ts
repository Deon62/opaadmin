import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Types
export interface ApiError {
  detail: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Helper function to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem('admin_token');
}

// Helper function to get headers
function getHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(!options.skipAuth),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ detail: 'An error occurred' }));
      return {
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    return apiRequest<LoginResponse>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  },
};

// Admin API
export const adminApi = {
  getDashboard: async () => {
    return apiRequest(API_ENDPOINTS.DASHBOARD, {
      method: 'GET',
    });
  },

  getDailyRegistrations: async (period: string = '7d') => {
    return apiRequest(API_ENDPOINTS.DASHBOARD_REGISTRATIONS(period), {
      method: 'GET',
    });
  },

  getUsers: async (params?: {
    role?: string;
    status_filter?: string;
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.USERS}?${queryString}` : API_ENDPOINTS.USERS;
    
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  promoteUser: async (userId: number) => {
    return apiRequest(API_ENDPOINTS.PROMOTE_USER, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  getDrivers: async (params?: {
    verification_status?: string;
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.verification_status) queryParams.append('verification_status', params.verification_status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.DRIVERS}?${queryString}` : API_ENDPOINTS.DRIVERS;
    
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  getDriverDetail: async (driverId: number) => {
    return apiRequest(API_ENDPOINTS.DRIVER_DETAIL(driverId), {
      method: 'GET',
    });
  },

  verifyDriver: async (driverId: number, verificationStatus: string, notes?: string) => {
    return apiRequest(API_ENDPOINTS.DRIVER_VERIFY(driverId), {
      method: 'POST',
      body: JSON.stringify({
        verification_status: verificationStatus,
        notes: notes || null,
      }),
    });
  },

  getClients: async (params?: {
    verification_status?: string;
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.verification_status) queryParams.append('verification_status', params.verification_status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.CLIENTS}?${queryString}` : API_ENDPOINTS.CLIENTS;
    
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  getClientDetail: async (clientId: number) => {
    return apiRequest(API_ENDPOINTS.CLIENT_DETAIL(clientId), {
      method: 'GET',
    });
  },

  verifyClientID: async (clientId: number, verificationStatus: string, notes?: string) => {
    return apiRequest(API_ENDPOINTS.CLIENT_VERIFY_ID(clientId), {
      method: 'POST',
      body: JSON.stringify({
        verification_status: verificationStatus,
        notes: notes || null,
      }),
    });
  },

  verifyClientDL: async (clientId: number, verificationStatus: string, notes?: string) => {
    return apiRequest(API_ENDPOINTS.CLIENT_VERIFY_DL(clientId), {
      method: 'POST',
      body: JSON.stringify({
        verification_status: verificationStatus,
        notes: notes || null,
      }),
    });
  },

  getCarOwners: async (params?: {
    verification_status?: string;
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.verification_status) queryParams.append('verification_status', params.verification_status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.CAR_OWNERS}?${queryString}` : API_ENDPOINTS.CAR_OWNERS;
    
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  getCarOwnerDetail: async (carOwnerId: number) => {
    return apiRequest(API_ENDPOINTS.CAR_OWNER_DETAIL(carOwnerId), {
      method: 'GET',
    });
  },

  verifyCarOwner: async (carOwnerId: number, verificationStatus: string, notes?: string) => {
    return apiRequest(API_ENDPOINTS.CAR_OWNER_VERIFY(carOwnerId), {
      method: 'POST',
      body: JSON.stringify({
        verification_status: verificationStatus,
        notes: notes || null,
      }),
    });
  },

  getVehicles: async (params?: {
    verification_status?: string;
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.verification_status) queryParams.append('verification_status', params.verification_status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.VEHICLES}?${queryString}` : API_ENDPOINTS.VEHICLES;
    
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  getVehicleDetail: async (vehicleId: number) => {
    return apiRequest(API_ENDPOINTS.VEHICLE_DETAIL(vehicleId), {
      method: 'GET',
    });
  },

  verifyVehicleDocuments: async (vehicleId: number, verificationStatus: string, notes?: string) => {
    return apiRequest(API_ENDPOINTS.VEHICLE_VERIFY_DOCUMENTS(vehicleId), {
      method: 'POST',
      body: JSON.stringify({
        verification_status: verificationStatus,
        notes: notes || null,
      }),
    });
  },

  // Analytics - Revenue
  getRevenueAnalytics: async () => {
    return apiRequest(API_ENDPOINTS.REVENUE_ANALYTICS, {
      method: 'GET',
    });
  },

  getDailyRevenue: async (period: string = '7d') => {
    return apiRequest(API_ENDPOINTS.DAILY_REVENUE(period), {
      method: 'GET',
    });
  },

  getRevenueBreakdown: async () => {
    return apiRequest(API_ENDPOINTS.REVENUE_BREAKDOWN, {
      method: 'GET',
    });
  },

  // Analytics - Bookings
  getBookingAnalytics: async () => {
    return apiRequest(API_ENDPOINTS.BOOKING_ANALYTICS, {
      method: 'GET',
    });
  },

  getDailyBookings: async (period: string = '7d', type: string = 'all') => {
    return apiRequest(API_ENDPOINTS.DAILY_BOOKINGS(period, type), {
      method: 'GET',
    });
  },

  getBookingComparison: async (period: string = '7d') => {
    return apiRequest(API_ENDPOINTS.BOOKING_COMPARISON(period), {
      method: 'GET',
    });
  },

  // Analytics - Performance
  getTractionMetrics: async () => {
    return apiRequest(API_ENDPOINTS.TRACTION_METRICS, {
      method: 'GET',
    });
  },

  getConversionRates: async () => {
    return apiRequest(API_ENDPOINTS.CONVERSION_RATES, {
      method: 'GET',
    });
  },

  // Analytics - Top Performers
  getTopDrivers: async (limit: number = 10, period: string = '30d') => {
    return apiRequest(API_ENDPOINTS.TOP_DRIVERS(limit, period), {
      method: 'GET',
    });
  },

  getTopCarOwners: async (limit: number = 10, period: string = '30d') => {
    return apiRequest(API_ENDPOINTS.TOP_CAR_OWNERS(limit, period), {
      method: 'GET',
    });
  },

  getTopClients: async (limit: number = 10, period: string = '30d') => {
    return apiRequest(API_ENDPOINTS.TOP_CLIENTS(limit, period), {
      method: 'GET',
    });
  },

  // Bookings Management
  getAdminBookings: async (params?: {
    type?: string;
    status?: string;
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    return apiRequest(API_ENDPOINTS.ADMIN_BOOKINGS(queryString), {
      method: 'GET',
    });
  },

  getAdminBookingDetail: async (bookingId: number) => {
    return apiRequest(API_ENDPOINTS.ADMIN_BOOKING_DETAIL(bookingId), {
      method: 'GET',
    });
  },
};


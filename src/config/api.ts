// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper function to build full document URL
export function getDocumentUrl(url: string | null): string | null {
  if (!url) return null;
  
  // If URL is already absolute (starts with http:// or https://), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If URL starts with /, it's already a path, just prepend base URL
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }
  
  // Otherwise, it's a relative path, prepend base URL with /
  return `${API_BASE_URL}/${url}`;
}

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  
  // Admin
  DASHBOARD: '/admin/dashboard',
  DASHBOARD_REGISTRATIONS: (period: string) => `/admin/dashboard/registrations?period=${period}`,
  USERS: '/admin/users',
  PROMOTE_USER: '/admin/promote-user',
  
  // Drivers
  DRIVERS: '/admin/drivers',
  DRIVER_DETAIL: (id: number) => `/admin/drivers/${id}`,
  DRIVER_VERIFY: (id: number) => `/admin/drivers/${id}/verify`,
  
  // Clients
  CLIENTS: '/admin/clients',
  CLIENT_DETAIL: (id: number) => `/admin/clients/${id}`,
  CLIENT_VERIFY_ID: (id: number) => `/admin/clients/${id}/verify-id`,
  CLIENT_VERIFY_DL: (id: number) => `/admin/clients/${id}/verify-dl`,
  
  // Car Owners
  CAR_OWNERS: '/admin/car-owners',
  CAR_OWNER_DETAIL: (id: number) => `/admin/car-owners/${id}`,
  CAR_OWNER_VERIFY: (id: number) => `/admin/car-owners/${id}/verify`,
  
  // Vehicles
  VEHICLES: '/admin/vehicles',
  VEHICLE_DETAIL: (id: number) => `/admin/vehicles/${id}`,
  VEHICLE_VERIFY_DOCUMENTS: (id: number) => `/admin/vehicles/${id}/verify-documents`,
  
  // Analytics - Revenue
  REVENUE_ANALYTICS: '/admin/analytics/revenue',
  DAILY_REVENUE: (period: string) => `/admin/analytics/revenue/daily?period=${period}`,
  REVENUE_BREAKDOWN: '/admin/analytics/revenue/breakdown',
  
  // Analytics - Bookings
  BOOKING_ANALYTICS: '/admin/analytics/bookings',
  DAILY_BOOKINGS: (period: string, type: string) => `/admin/analytics/bookings/daily?period=${period}&type=${type}`,
  BOOKING_COMPARISON: (period: string) => `/admin/analytics/bookings/comparison?period=${period}`,
  
  // Analytics - Performance
  TRACTION_METRICS: '/admin/analytics/traction',
  CONVERSION_RATES: '/admin/analytics/conversion',
  
  // Analytics - Top Performers
  TOP_DRIVERS: (limit: number, period: string) => `/admin/analytics/top-drivers?limit=${limit}&period=${period}`,
  TOP_CAR_OWNERS: (limit: number, period: string) => `/admin/analytics/top-car-owners?limit=${limit}&period=${period}`,
  TOP_CLIENTS: (limit: number, period: string) => `/admin/analytics/top-clients?limit=${limit}&period=${period}`,
  
  // Bookings Management
  ADMIN_BOOKINGS: (params?: string) => `/admin/bookings${params ? `?${params}` : ''}`,
  ADMIN_BOOKING_DETAIL: (id: number) => `/admin/bookings/${id}`,
  
  // Commissions (Unified - Drivers + Car Owners)
  COMMISSION_ANALYTICS: '/admin/analytics/commissions',
  COMMISSION_BREAKDOWN: (params?: string) => `/admin/analytics/commissions/breakdown${params ? `?${params}` : ''}`,
  PENDING_COMMISSIONS: (params?: string) => `/admin/commissions/pending${params ? `?${params}` : ''}`,
  DEFAULTED_COMMISSIONS: (params?: string) => `/admin/commissions/defaulted${params ? `?${params}` : ''}`,
  APPROVE_CAR_OWNER_COMMISSION: (id: number) => `/admin/commissions/${id}/approve`,
  APPROVE_DRIVER_COMMISSION: (id: number) => `/admin/driver-commissions/${id}/approve`,
  CAR_OWNER_COMMISSIONS: (carOwnerId: number, params?: string) => `/admin/car-owners/${carOwnerId}/commissions${params ? `?${params}` : ''}`,
};


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
};


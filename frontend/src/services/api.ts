import { Restaurant, Category, MenuItem, Order, TableInfo, AdminUser, DashboardStats } from '../types';

const API_BASE = '/api';

const getHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = localStorage.getItem('qr_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Generic Fetch Wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'API Request Failed');
  }
  return data;
}

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    return request<{ success: boolean; token: string; admin: AdminUser }>('/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
  },
  getMe: async () => {
    return request<{ success: boolean; admin: AdminUser }>('/auth/me', {
      headers: getHeaders(true),
    });
  },

  // Restaurant
  getRestaurant: async () => {
    return request<{ success: boolean; restaurant: Restaurant }>('/restaurant');
  },
  updateRestaurant: async (data: Partial<Restaurant>) => {
    return request<{ success: boolean; restaurant: Restaurant }>('/restaurant', {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
  },

  // Categories
  getCategories: async () => {
    return request<{ success: boolean; categories: Category[] }>('/categories');
  },
  createCategory: async (data: { name: string; description?: string; sortOrder?: number }) => {
    return request<{ success: boolean; category: Category }>('/categories', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
  },
  updateCategory: async (id: string, data: Partial<Category>) => {
    return request<{ success: boolean; category: Category }>(`/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
  },
  deleteCategory: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
  },

  // Menu
  getMenuItems: async (params?: { categoryId?: string; search?: string; availableOnly?: boolean; todayOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.search) query.append('search', params.search);
    if (params?.availableOnly) query.append('availableOnly', 'true');
    if (params?.todayOnly) query.append('todayOnly', 'true');
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; count: number; items: MenuItem[] }>(`/menu${queryString}`);
  },
  createMenuItem: async (data: Omit<MenuItem, 'id'>) => {
    return request<{ success: boolean; item: MenuItem }>('/menu', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
  },
  updateMenuItem: async (id: string, data: Partial<MenuItem>) => {
    return request<{ success: boolean; item: MenuItem }>(`/menu/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
  },
  toggleItemAvailability: async (id: string) => {
    return request<{ success: boolean; item: MenuItem }>(`/menu/${id}/availability`, {
      method: 'PATCH',
      headers: getHeaders(true),
    });
  },
  deleteMenuItem: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/menu/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
  },

  // Orders
  createOrder: async (orderData: {
    tableNumber: number;
    customerName?: string;
    items: Array<{ menuItemId: string; quantity: number; notes?: string }>;
    notes?: string;
  }) => {
    return request<{ success: boolean; message: string; order: Order }>('/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
  },
  getOrders: async (params?: { status?: string; tableNumber?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.tableNumber) query.append('tableNumber', params.tableNumber);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; count: number; orders: Order[] }>(`/orders${queryString}`, {
      headers: getHeaders(true),
    });
  },
  getOrderById: async (id: string) => {
    return request<{ success: boolean; order: Order }>(`/orders/${id}`);
  },
  updateOrderStatus: async (id: string, status: string) => {
    return request<{ success: boolean; message: string; order: Order }>(`/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ status }),
    });
  },
  getDashboardStats: async () => {
    return request<{ success: boolean; stats: DashboardStats }>('/orders/stats', {
      headers: getHeaders(true),
    });
  },

  // QR & Tables
  getNetworkInfo: async () => {
    return request<{ success: boolean; ip: string; networkUrl: string }>('/qr/network-info');
  },
  getTables: async (baseUrl?: string) => {
    const query = baseUrl ? `?baseUrl=${encodeURIComponent(baseUrl)}` : '';
    return request<{ success: boolean; count: number; tables: TableInfo[] }>(`/qr/tables${query}`, {
      headers: getHeaders(true),
    });
  },
  createTable: async (data: { number: number; qrCodeUrl?: string }, baseUrl?: string) => {
    return request<{ success: boolean; table: TableInfo }>('/qr/tables', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ ...data, baseUrl }),
    });
  },
  deleteTable: async (tableNumber: number) => {
    return request<{ success: boolean; message: string; tableNumber: number }>(`/qr/table/${tableNumber}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
  },
  generateTableQR: async (tableNumber: number, baseUrl?: string) => {
    const query = baseUrl ? `?baseUrl=${encodeURIComponent(baseUrl)}` : '';
    return request<{ success: boolean; tableNumber: number; url: string; qrDataUrl: string }>(`/qr/table/${tableNumber}${query}`);
  },
  updateTableQR: async (tableNumber: number, url: string, baseUrl?: string) => {
    return request<{ success: boolean; tableNumber: number; url: string; qrDataUrl: string }>(`/qr/table/${tableNumber}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ url, baseUrl }),
    });
  },
};

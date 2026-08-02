export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  openingHours: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  tableCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  _count?: {
    items: number;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  category?: Category;
  isAvailable: boolean;
  isTodaySpecial: boolean;
  sortOrder: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
  };
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableNumber: number;
  customerName?: string;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TableInfo {
  id: string;
  number: number;
  isOccupied: boolean;
  qrUrl?: string;
  qrDataUrl?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  todayTotalOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  totalTables: number;
  occupiedTables: number;
}

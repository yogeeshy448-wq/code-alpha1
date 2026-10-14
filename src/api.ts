import type { Product, User, CartItem, Order, UserAddress } from './types';

const TOKEN_KEY = 'kobo_auth_token';
const SESSION_KEY = 'kobo_session_id';

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substring(2, 12);
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const sessionId = getSessionId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(payload: { name: string; email: string; password: string; phone?: string; address?: UserAddress }): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<User | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const res = await request<{ user: User }>('/api/auth/me');
      return res.user;
    } catch {
      setStoredToken(null);
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredToken(null);
    }
  },

  async updateProfile(updates: { name?: string; phone?: string; address?: UserAddress }): Promise<User> {
    const res = await request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.user;
  },

  // Products
  async getProducts(params?: { category?: string; search?: string; sort?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== 'All') searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.minPrice !== undefined) searchParams.set('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) searchParams.set('maxPrice', String(params.maxPrice));

    const qs = searchParams.toString();
    const res = await request<{ products: Product[] }>(`/api/products${qs ? `?${qs}` : ''}`);
    return res.products;
  },

  async getProductById(id: string): Promise<Product> {
    const res = await request<{ product: Product }>(`/api/products/${id}`);
    return res.product;
  },

  async addReview(productId: string, review: { author: string; rating: number; comment: string }): Promise<Product> {
    const res = await request<{ product: Product }>(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
    return res.product;
  },

  // Cart
  async getCart(): Promise<CartItem[]> {
    const res = await request<{ items: CartItem[] }>('/api/cart');
    return res.items;
  },

  async addToCart(productId: string, quantity = 1): Promise<CartItem[]> {
    const res = await request<{ items: CartItem[] }>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    return res.items;
  },

  async updateCartQuantity(productId: string, quantity: number): Promise<CartItem[]> {
    const res = await request<{ items: CartItem[] }>(`/api/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return res.items;
  },

  async removeFromCart(productId: string): Promise<CartItem[]> {
    const res = await request<{ items: CartItem[] }>(`/api/cart/${productId}`, {
      method: 'DELETE',
    });
    return res.items;
  },

  async clearCart(): Promise<void> {
    await request('/api/cart', { method: 'DELETE' });
  },

  // Orders
  async createOrder(payload: {
    customerName: string;
    userEmail: string;
    customerPhone: string;
    shippingAddress: UserAddress;
    paymentMethod: 'card' | 'cod' | 'apple_pay';
    promoDiscountPercent?: number;
    customItems?: { productId: string; quantity: number }[];
  }): Promise<Order> {
    const res = await request<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.order;
  },

  async getUserOrders(email?: string): Promise<Order[]> {
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await request<{ orders: Order[] }>(`/api/orders${qs}`);
    return res.orders;
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await request<{ order: Order }>(`/api/orders/${id}`);
    return res.order;
  },
};

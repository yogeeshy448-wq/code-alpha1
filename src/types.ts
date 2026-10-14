export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: 'Furniture' | 'Audio & Studio' | 'Apothecary' | 'Apparel & Objects';
  description: string;
  image: string;
  secondaryImage?: string;
  inStock: boolean;
  stockCount: number;
  features: string[];
  dimensions?: string;
  materials?: string;
  leadTime?: string;
  tags: string[];
  reviews: Review[];
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: UserAddress;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId?: string;
  userEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: UserAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  paymentMethod: 'card' | 'cod' | 'apple_pay';
  trackingCode: string;
  createdAt: string;
  estimatedDelivery: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

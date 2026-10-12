export type ProductCategory = 
  | 'mobiles-tablets'
  | 'electronics'
  | 'camera-accessories'
  | 'fashion'
  | 'home-living'
  | 'beauty-health'
  | 'sports-outdoor'
  | 'toys-games'
  | 'audio-sound'
  | 'laptops'
  | 'appliances'
  | 'gaming';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  subCategory?: string;
  brand?: string;
  price: number; // In Pakistani Rupees (PKR / Rs.)
  compareAtPrice?: number;
  cost?: number;
  stock: number;
  sku: string;
  description: string;
  shortDescription: string;
  images: string[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestSeller?: boolean;
  specs: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  subtitle?: string;
  description: string;
  iconName: string;
  image?: string;
  productCount: number;
  subCategories?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

export type PaymentMethod = 
  | 'cod' 
  | 'jazzcash_easypaisa' 
  | 'bank_transfer' 
  | 'stripe';

export type OrderStatus = 
  | 'pending_payment'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  comment?: string;
  updatedBy: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ES123456
  customer: ShippingAddress;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shippingFee: number;
  estimatedTax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'completed' | 'verification_required';
  paymentReference?: string;
  mobileWalletNumber?: string;
  orderStatus: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  trackingNumber?: string;
  carrier?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderNumber?: string;
  category: 'delivery_delay' | 'damaged_item' | 'wrong_product' | 'refund_request' | 'general_inquiry';
  subject: string;
  message: string;
  status: 'pending' | 'in_review' | 'resolved';
  createdAt: string;
  response?: string;
  resolvedAt?: string;
}

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: Partial<ShippingAddress>;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercentage?: number;
  discountFixed?: number;
  minOrder?: number;
  description: string;
  active: boolean;
}

export interface IntegrationStatus {
  backendConfigured: boolean;
  backendUrl: string | null;
  stripeConfigured: boolean;
  stripeKey: string | null;
  geminiConfigured: boolean;
  databaseType: 'client_indexed_db' | 'remote_rest_api';
  persistedRecords: {
    productsCount: number;
    ordersCount: number;
    usersCount: number;
  };
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaCategory?: ProductCategory | 'all';
  searchFilter?: string;
  imageUrl: string;
  discountBadge?: string;
  active: boolean;
  order: number;
}

export type StoreViewMode = 
  | 'catalog' 
  | 'checkout' 
  | 'order_confirmation' 
  | 'order_history' 
  | 'tracking'
  | 'support'
  | 'wishlist'
  | 'admin';

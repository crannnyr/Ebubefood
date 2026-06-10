export type Owner = 'ebube' | 'bundu' | 'joint';
export type DeliveryTime = 'instant' | '2_hours' | '6_hours' | '24_hours' | '3_days' | '1_week';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type UserRole = 'customer' | 'admin_ebube' | 'admin_bundu' | 'admin_joint';
export type AdType = 'image' | 'gif';
export type AdDuration = '5_seconds' | '10_seconds';
export type AdPeriod = '1_month' | '2_months';
export type AdStatus = 'pending_review' | 'approved' | 'rejected' | 'active' | 'expired';
export type DayStatus = 'open' | 'closed';
export type BannerTargetType = 'category' | 'external';

/* ---- Frontend-facing types (camelCase, used by UI components) ---- */

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  displayOrder: number;
  itemCount?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  costPrice?: number;
  categoryId: string;
  categoryName?: string;
  owner: Owner;
  image: string;
  deliveryTime: DeliveryTime;
  isFeatured: boolean;
  isAvailable: boolean;
  createdAt?: string;
}

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  owner: Owner;
  deliveryTime: DeliveryTime;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  owner: Owner;
  specialInstructions?: string;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AdSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  adType: AdType;
  duration: AdDuration;
  period: AdPeriod;
  customCreation: boolean;
  mediaUrl?: string;
  paymentProofUrl: string;
  linkUrl: string;
  totalPrice: number;
  status: AdStatus;
  rejectionReason?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  mediaUrl: string;
  mediaType: 'image' | 'gif';
  targetType: BannerTargetType;
  targetValue: string;
  displayOrder: number;
  isActive: boolean;
}

export interface AdminPaymentDetails {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  isActive: boolean;
}

export interface SiteSettings {
  deliveryFee: number;
  contactPhone: string;
  contactWhatsApp: string;
  contactEmail: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTwitter: string;
}

export interface DayClosing {
  id: string;
  date: string;
  totalOrders: number;
  totalRevenue: number;
  ebubeOrders: number;
  ebubeRevenue: number;
  ebubeCost: number;
  ebubeProfit: number;
  bunduOrders: number;
  bunduRevenue: number;
  bunduCost: number;
  bunduProfit: number;
  jointOrders: number;
  jointRevenue: number;
  jointCost: number;
  jointProfit: number;
  createdAt: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

/* ---- DB row types (snake_case, matching Supabase table columns) ---- */

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ItemRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  cost_price: number;
  category_id: string | null;
  owner: Owner;
  image_url: string | null;
  delivery_time: DeliveryTime;
  is_available: boolean | null;
  is_featured: boolean | null;
  prep_time_minutes: number | null;
  calories: number | null;
  allergens: string[] | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BannerRow {
  id: string;
  title: string;
  subtitle: string | null;
  media_url: string;
  media_type: string | null;
  target_type: BannerTargetType;
  target_value: string;
  display_order: number | null;
  is_active: boolean | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  full_name: string;
  phone: string;
  address: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  delivery_address: string;
  delivery_phone: string;
  delivery_notes: string | null;
  payment_method: string | null;
  bank_reference: string | null;
  placed_at: string;
  confirmed_at: string | null;
  prepared_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string | null;
  item_id: string | null;
  item_name: string;
  item_price: number;
  item_cost_price: number;
  quantity: number;
  owner: Owner;
  special_instructions: string | null;
  created_at: string;
}

export interface CartItemRow {
  id: string;
  user_id: string | null;
  item_id: string | null;
  quantity: number;
  special_instructions: string | null;
  added_at: string;
}

export interface AdRow {
  id: string;
  advertiser_name: string;
  advertiser_email: string;
  advertiser_phone: string;
  media_url: string | null;
  media_type: AdType | null;
  duration: AdDuration | null;
  period: AdPeriod | null;
  custom_creation: boolean | null;
  amount_paid: number;
  payment_proof_url: string | null;
  status: AdStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DayClosingRow {
  id: string;
  closing_date: string;
  status: DayStatus;
  total_orders: number | null;
  total_revenue: number | null;
  total_cost: number | null;
  total_profit: number | null;
  ebube_orders: number | null;
  ebube_revenue: number | null;
  ebube_cost: number | null;
  ebube_profit: number | null;
  bundu_orders: number | null;
  bundu_revenue: number | null;
  bundu_cost: number | null;
  bundu_profit: number | null;
  joint_orders: number | null;
  joint_revenue: number | null;
  joint_cost: number | null;
  joint_profit: number | null;
  closed_by: string | null;
  closed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface AdminPaymentRow {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_code: string | null;
  is_active: boolean | null;
  set_by: string | null;
  created_at: string;
  updated_at: string;
}

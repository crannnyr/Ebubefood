import { supabase } from '@/lib/supabase';
import {
  transformCategory, transformItem, transformBanner,
  transformProfile, transformOrder, transformOrderItem,
  transformAd, transformDayClosing, transformPayment,
} from '@/lib/transformers';
import type {
  Category, FoodItem, Banner, Profile, Order, OrderItem,
  AdSubmission, DayClosing, AdminPaymentDetails,
  CategoryRow, ItemRow, BannerRow, ProfileRow,
  OrderRow, OrderItemRow, AdRow, DayClosingRow, AdminPaymentRow,
  Owner, AdType, AdDuration, AdPeriod,
} from '@/types';

/* ========== Categories ========== */

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  if (error) throw error;

  const rows = data as CategoryRow[];

  const { count: itemCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('is_available', true);

  return rows.map(r => transformCategory(r, itemCount ?? undefined));
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error) return null;
  return transformCategory(data as CategoryRow);
}

/* ========== Items ========== */

export async function fetchItems(categoryId?: string): Promise<FoodItem[]> {
  let query = supabase
    .from('items')
    .select('*, categories(name)')
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error) throw error;
  return (data as (ItemRow & { categories: { name: string } | null })[]).map(transformItem);
}

export async function fetchFeaturedItems(): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*, categories(name)')
    .eq('is_available', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as (ItemRow & { categories: { name: string } | null })[]).map(transformItem);
}

export async function fetchItemBySlug(slug: string): Promise<FoodItem | null> {
  const { data, error } = await supabase
    .from('items')
    .select('*, categories(name)')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return transformItem(data as ItemRow & { categories: { name: string } | null });
}

export async function fetchRelatedItems(itemId: string, categoryId: string, limit = 4): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*, categories(name)')
    .eq('category_id', categoryId)
    .neq('id', itemId)
    .eq('is_available', true)
    .limit(limit);
  if (error) throw error;
  return (data as (ItemRow & { categories: { name: string } | null })[]).map(transformItem);
}

/* ========== Banners ========== */

export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  if (error) throw error;
  return (data as BannerRow[]).map(transformBanner);
}

/* ========== Auth & Profiles ========== */

export async function signUp(email: string, password: string, fullName: string, phone: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;

  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email || '';
  return transformProfile(data as ProfileRow, email);
}

export async function updateProfile(userId: string, updates: { full_name?: string; phone?: string; address?: string }) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

/* ========== Orders ========== */

export async function fetchOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('placed_at', { ascending: false });
  if (error) throw error;

  const orders: Order[] = [];
  for (const row of data as OrderRow[]) {
    const items = await fetchOrderItems(row.id);
    orders.push(transformOrder(row, items));
  }
  return orders;
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (error || !data) return null;

  const items = await fetchOrderItems(orderId);
  return transformOrder(data as OrderRow, items);
}

async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);
  if (error) return [];
  return (data as OrderItemRow[]).map(transformOrderItem);
}

export async function createOrder(params: {
  userId: string;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryNotes?: string;
  items: { itemId: string; name: string; price: number; costPrice: number; quantity: number; owner: Owner; specialInstructions?: string }[];
  totalAmount: number;
}): Promise<Order> {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: params.userId,
      delivery_address: params.deliveryAddress,
      delivery_phone: params.deliveryPhone,
      delivery_notes: params.deliveryNotes || null,
      total_amount: params.totalAmount,
      payment_method: 'bank_transfer',
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single();
  if (orderError) throw orderError;

  const order = orderData as OrderRow;

  const orderItems = params.items.map(item => ({
    order_id: order.id,
    item_id: item.itemId,
    item_name: item.name,
    item_price: item.price,
    item_cost_price: item.costPrice,
    quantity: item.quantity,
    owner: item.owner,
    special_instructions: item.specialInstructions || null,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  if (itemsError) throw itemsError;

  const items = await fetchOrderItems(order.id);
  return transformOrder(order, items);
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('placed_at', { ascending: false });
  if (error) throw error;

  const orders: Order[] = [];
  for (const row of data as OrderRow[]) {
    const items = await fetchOrderItems(row.id);
    orders.push(transformOrder(row, items));
  }
  return orders;
}

/* ========== Ads ========== */

export async function fetchAds(): Promise<AdSubmission[]> {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as AdRow[]).map(transformAd);
}

export async function submitAd(params: {
  advertiserName: string;
  advertiserEmail: string;
  advertiserPhone: string;
  mediaType: AdType;
  duration: AdDuration;
  period: AdPeriod;
  customCreation: boolean;
  amountPaid: number;
  paymentProofUrl?: string;
  mediaUrl?: string;
}) {
  const { error } = await supabase.from('ads').insert({
    advertiser_name: params.advertiserName,
    advertiser_email: params.advertiserEmail,
    advertiser_phone: params.advertiserPhone,
    media_type: params.mediaType,
    duration: params.duration,
    period: params.period,
    custom_creation: params.customCreation,
    amount_paid: params.amountPaid,
    payment_proof_url: params.paymentProofUrl || null,
    media_url: params.mediaUrl || null,
    status: 'pending_review',
  });
  if (error) throw error;
}

export async function updateAdStatus(adId: string, status: string, adminNotes?: string) {
  const updates: Record<string, unknown> = { status };
  if (adminNotes) updates.admin_notes = adminNotes;
  if (status === 'active') {
    updates.start_date = new Date().toISOString();
    updates.end_date = new Date(Date.now() + 30 * 86400000).toISOString();
  }
  const { error } = await supabase.from('ads').update(updates).eq('id', adId);
  if (error) throw error;
}

/* ========== EOD ========== */

export async function fetchDayClosings(): Promise<DayClosing[]> {
  const { data, error } = await supabase
    .from('day_closings')
    .select('*')
    .order('closing_date', { ascending: false });
  if (error) throw error;
  return (data as DayClosingRow[]).map(transformDayClosing);
}

export async function closeDay(date: string, closedBy: string, notes?: string): Promise<DayClosing> {
  const { data, error } = await supabase.rpc('close_day', {
    p_date: date,
    p_closed_by: closedBy,
    p_notes: notes || null,
  });
  if (error) throw error;

  const { data: closingData, error: fetchError } = await supabase
    .from('day_closings')
    .select('*')
    .eq('id', data)
    .single();
  if (fetchError) throw fetchError;
  return transformDayClosing(closingData as DayClosingRow);
}

/* ========== Payment Details ========== */

export async function fetchPaymentDetails(): Promise<AdminPaymentDetails | null> {
  const { data, error } = await supabase
    .from('admin_payment_details')
    .select('*')
    .eq('is_active', true)
    .single();
  if (error || !data) return null;
  return transformPayment(data as AdminPaymentRow);
}

export async function updatePaymentDetails(id: string, updates: Partial<AdminPaymentRow>) {
  const { error } = await supabase
    .from('admin_payment_details')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

/* ========== Cart ========== */

export async function fetchCartItems(userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, items(*)')
    .eq('user_id', userId);
  if (error) return [];
  return data;
}

export async function addToCartDb(userId: string, itemId: string, quantity: number) {
  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: (existing as { quantity: number }).quantity + quantity })
      .eq('id', (existing as { id: string }).id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, item_id: itemId, quantity });
    if (error) throw error;
  }
}

export async function removeFromCartDb(cartItemId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
  if (error) throw error;
}

export async function clearCartDb(userId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (error) throw error;
}

/* ========== Storage ========== */

export async function uploadImage(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

/* ========== Analytics ========== */

export async function fetchAnalytics(date: string) {
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('snapshot_date', date);
  if (error) return [];
  return data;
}

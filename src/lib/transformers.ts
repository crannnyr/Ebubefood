import type {
  Category, CategoryRow,
  FoodItem, ItemRow,
  Banner, BannerRow,
  Profile, ProfileRow,
  Order, OrderRow,
  OrderItem, OrderItemRow,
  AdSubmission, AdRow,
  DayClosing, DayClosingRow,
  AdminPaymentDetails, AdminPaymentRow,
  DeliveryTime,
} from '@/types';

const CATEGORY_IMAGES: Record<string, string> = {
  'rice-dishes': '/images/cat-rice.jpg',
  'swallows': '/images/cat-swallows.jpg',
  'soups-stews': '/images/cat-soups.jpg',
  'proteins': '/images/cat-grilled.jpg',
  'snacks': '/images/cat-snacks.jpg',
  'drinks': '/images/cat-drinks.jpg',
  'cakes-pastries': '/images/cat-breakfast.jpg',
};

const ITEM_IMAGES: Record<string, string> = {
  'jollof-rice-chicken': '/images/food-jollof.jpg',
  'jollof-rice-turkey': '/images/food-jollof.jpg',
  'fried-rice-turkey': '/images/food-friedrice.jpg',
  'coconut-rice-fish': '/images/food-friedrice.jpg',
  'ofada-rice-stew': '/images/food-ofada.jpg',
  'pounded-yam-egusi': '/images/food-egusi.jpg',
  'pounded-yam-efo-riro': '/images/food-efo-riro.jpg',
  'amala-ewedu': '/images/food-egusi.jpg',
  'fufu-ogbono': '/images/food-egusi.jpg',
  'egusi-soup': '/images/food-egusi.jpg',
  'pepper-soup-goat': '/images/food-peppersoup.jpg',
  'efo-riro': '/images/food-efo-riro.jpg',
  'okra-soup': '/images/food-egusi.jpg',
  'banga-soup': '/images/food-egusi.jpg',
  'suya-platter': '/images/food-suya.jpg',
  'grilled-chicken': '/images/food-suya.jpg',
  'peppered-snail': '/images/food-suya.jpg',
  'asun-spicy-goat': '/images/food-suya.jpg',
  'gizdodo': '/images/food-suya.jpg',
  'chin-chin': '/images/food-chinchin.jpg',
  'puff-puff': '/images/food-chinchin.jpg',
  'meat-pie': '/images/food-chinchin.jpg',
  'spring-rolls': '/images/food-chinchin.jpg',
  'zobo': '/images/food-chinchin.jpg',
  'moi-moi': '/images/food-moimoi.jpg',
  'akara-pap': '/images/food-akara.jpg',
  'chocolate-cake': '/images/food-moimoi.jpg',
};

function categoryImage(slug: string, imageUrl: string | null): string {
  if (imageUrl) return imageUrl;
  return CATEGORY_IMAGES[slug] || '/images/cat-rice.jpg';
}

function itemImage(slug: string, imageUrl: string | null): string {
  if (imageUrl) return imageUrl;
  return ITEM_IMAGES[slug] || '/images/food-jollof.jpg';
}

export function transformCategory(row: CategoryRow, itemCount?: number): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: categoryImage(row.slug, row.image_url),
    displayOrder: row.display_order ?? 0,
    itemCount,
  };
}

export function transformItem(row: ItemRow & { categories?: { name: string } | null }): FoodItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    price: Number(row.price),
    costPrice: Number(row.cost_price),
    categoryId: row.category_id || '',
    categoryName: row.categories?.name,
    owner: row.owner,
    image: itemImage(row.slug, row.image_url),
    deliveryTime: row.delivery_time,
    isFeatured: row.is_featured ?? false,
    isAvailable: row.is_available ?? true,
    createdAt: row.created_at,
  };
}

export function transformBanner(row: BannerRow): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    mediaUrl: row.media_url,
    mediaType: (row.media_type as 'image' | 'gif') || 'image',
    targetType: row.target_type,
    targetValue: row.target_value,
    displayOrder: row.display_order ?? 0,
    isActive: row.is_active ?? true,
  };
}

export function transformProfile(row: ProfileRow, email: string): Profile {
  return {
    id: row.id,
    userId: row.id,
    fullName: row.full_name,
    email,
    phone: row.phone || undefined,
    address: row.address || undefined,
    role: row.role,
    avatarUrl: row.avatar_url || undefined,
  };
}

export function transformOrder(row: OrderRow, items: OrderItem[]): Order {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = subtotal > 0 ? 500 : 0;
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id || '',
    userName: '',
    userPhone: row.delivery_phone,
    userAddress: row.delivery_address,
    items,
    subtotal,
    deliveryFee,
    total: Number(row.total_amount),
    status: row.status,
    paymentStatus: row.payment_status,
    deliveryNotes: row.delivery_notes || undefined,
    createdAt: row.placed_at || row.created_at,
    updatedAt: row.created_at,
  };
}

export function transformOrderItem(row: OrderItemRow): OrderItem {
  return {
    itemId: row.item_id || '',
    name: row.item_name,
    price: Number(row.item_price),
    quantity: row.quantity,
    image: itemImage('', null),
    owner: row.owner,
    specialInstructions: row.special_instructions || undefined,
  };
}

export function transformAd(row: AdRow): AdSubmission {
  return {
    id: row.id,
    name: row.advertiser_name,
    email: row.advertiser_email,
    phone: row.advertiser_phone,
    adType: row.media_type || 'image',
    duration: row.duration || '5_seconds',
    period: row.period || '1_month',
    customCreation: row.custom_creation ?? false,
    mediaUrl: row.media_url || undefined,
    paymentProofUrl: row.payment_proof_url || '',
    linkUrl: '',
    totalPrice: Number(row.amount_paid),
    status: row.status,
    rejectionReason: row.admin_notes || undefined,
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    createdAt: row.created_at,
  };
}

export function transformDayClosing(row: DayClosingRow): DayClosing {
  return {
    id: row.id,
    date: row.closing_date,
    totalOrders: row.total_orders ?? 0,
    totalRevenue: Number(row.total_revenue ?? 0),
    ebubeOrders: row.ebube_orders ?? 0,
    ebubeRevenue: Number(row.ebube_revenue ?? 0),
    ebubeCost: Number(row.ebube_cost ?? 0),
    ebubeProfit: Number(row.ebube_profit ?? 0),
    bunduOrders: row.bundu_orders ?? 0,
    bunduRevenue: Number(row.bundu_revenue ?? 0),
    bunduCost: Number(row.bundu_cost ?? 0),
    bunduProfit: Number(row.bundu_profit ?? 0),
    jointOrders: row.joint_orders ?? 0,
    jointRevenue: Number(row.joint_revenue ?? 0),
    jointCost: Number(row.joint_cost ?? 0),
    jointProfit: Number(row.joint_profit ?? 0),
    createdAt: row.created_at,
  };
}

export function transformPayment(row: AdminPaymentRow): AdminPaymentDetails {
  return {
    id: row.id,
    accountName: row.account_name,
    accountNumber: row.account_number,
    bankName: row.bank_name,
    bankCode: row.bank_code || '',
    isActive: row.is_active ?? true,
  };
}

export function deliveryLabel(dt: DeliveryTime): string {
  switch (dt) {
    case 'instant': return 'Instant';
    case '2_hours': return '2 Hours';
    case '6_hours': return '6 Hours';
    case '24_hours': return '24 Hours';
    case '3_days': return '3 Days';
    case '1_week': return '1 Week';
    default: return dt;
  }
}

export function deliveryColor(dt: DeliveryTime): string {
  switch (dt) {
    case 'instant': return 'bg-green-500/20 text-green-400';
    case '2_hours': return 'bg-blue-500/20 text-blue-400';
    case '6_hours': return 'bg-blue-500/20 text-blue-400';
    case '24_hours': return 'bg-blue-500/20 text-blue-400';
    case '3_days': return 'bg-amber-500/20 text-amber-400';
    case '1_week': return 'bg-amber-500/20 text-amber-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
}

export function ownerLabel(owner: string): string {
  return owner.charAt(0).toUpperCase() + owner.slice(1);
}

export function adDurationLabel(d: string): string {
  switch (d) {
    case '5_seconds': return '5s';
    case '10_seconds': return '10s';
    default: return d;
  }
}

export function adPeriodLabel(p: string): string {
  switch (p) {
    case '1_month': return '1 Month';
    case '2_months': return '2 Months';
    default: return p;
  }
}

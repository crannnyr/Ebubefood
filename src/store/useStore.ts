import { create } from 'zustand';
import type { CartItem, Toast, Profile, Order, FoodItem, Category, Banner, AdminPaymentDetails, AdSubmission, DayClosing } from '@/types';
import { supabase } from '@/lib/supabase';
import * as api from '@/services/api';

interface AppState {
  // Auth
  user: Profile | null;
  isAuthLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: Profile | null) => void;
  initAuth: () => void;

  // Data
  categories: Category[];
  items: FoodItem[];
  featuredItems: FoodItem[];
  banners: Banner[];
  paymentDetails: AdminPaymentDetails | null;
  ads: AdSubmission[];
  dayClosings: DayClosing[];
  isDataLoading: boolean;
  loadData: () => Promise<void>;
  loadAds: () => Promise<void>;
  loadDayClosings: () => Promise<void>;

  // Cart
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: FoodItem, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  setInstructions: (itemId: string, text: string) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Orders
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  loadOrders: () => Promise<void>;

  // Toast
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  isAuthLoading: true,
  isAdmin: false,

  initAuth: () => {
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await api.fetchProfile(session.user.id);
        set({
          user: profile,
          isAdmin: profile?.role?.startsWith('admin') ?? false,
          isAuthLoading: false,
        });
      } else {
        set({ user: null, isAdmin: false, isAuthLoading: false });
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await api.fetchProfile(session.user.id);
        set({
          user: profile,
          isAdmin: profile?.role?.startsWith('admin') ?? false,
          isAuthLoading: false,
        });
      } else {
        set({ isAuthLoading: false });
      }
    });
  },

  login: async (email: string, password: string) => {
    try {
      const { user: authUser } = await api.signIn(email, password);
      if (authUser) {
        const profile = await api.fetchProfile(authUser.id);
        set({ user: profile, isAdmin: profile?.role?.startsWith('admin') ?? false });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  register: async (name: string, email: string, password: string, phone = '') => {
    try {
      const { user: authUser } = await api.signUp(email, password, name, phone);
      if (authUser) {
        const profile = await api.fetchProfile(authUser.id);
        set({ user: profile, isAdmin: false });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  logout: async () => {
    await api.signOut();
    set({ user: null, isAdmin: false, cartItems: [], orders: [] });
  },

  setUser: (user) => {
    set({ user, isAdmin: user?.role?.startsWith('admin') ?? false });
  },

  // Data
  categories: [],
  items: [],
  featuredItems: [],
  banners: [],
  paymentDetails: null,
  ads: [],
  dayClosings: [],
  isDataLoading: true,

  loadData: async () => {
    set({ isDataLoading: true });
    try {
      const [categories, items, featuredItems, banners, paymentDetails] = await Promise.all([
        api.fetchCategories().catch(() => []),
        api.fetchItems().catch(() => []),
        api.fetchFeaturedItems().catch(() => []),
        api.fetchBanners().catch(() => []),
        api.fetchPaymentDetails().catch(() => null),
      ]);
      set({ categories, items, featuredItems, banners, paymentDetails, isDataLoading: false });
    } catch {
      set({ isDataLoading: false });
    }
  },

  loadAds: async () => {
    try {
      const ads = await api.fetchAds();
      set({ ads });
    } catch { /* keep existing */ }
  },

  loadDayClosings: async () => {
    try {
      const dayClosings = await api.fetchDayClosings();
      set({ dayClosings });
    } catch { /* keep existing */ }
  },

  // Cart
  cartItems: [],
  isCartOpen: false,

  addToCart: (item, qty = 1) => {
    const { cartItems } = get();
    const existing = cartItems.find(c => c.itemId === item.id);
    if (existing) {
      set({
        cartItems: cartItems.map(c =>
          c.itemId === item.id ? { ...c, quantity: c.quantity + qty } : c
        ),
      });
    } else {
      set({
        cartItems: [...cartItems, {
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: qty,
          image: item.image,
          owner: item.owner,
          deliveryTime: item.deliveryTime,
        }],
      });
    }

    const user = get().user;
    if (user) api.addToCartDb(user.userId, item.id, qty).catch(() => {});

    get().addToast('success', `Added ${item.name} to cart`);
  },

  removeFromCart: (itemId) => {
    set({ cartItems: get().cartItems.filter(c => c.itemId !== itemId) });
  },

  updateQuantity: (itemId, qty) => {
    if (qty < 1) {
      get().removeFromCart(itemId);
      return;
    }
    set({
      cartItems: get().cartItems.map(c =>
        c.itemId === itemId ? { ...c, quantity: qty } : c
      ),
    });
  },

  setInstructions: (itemId, text) => {
    set({
      cartItems: get().cartItems.map(c =>
        c.itemId === itemId ? { ...c, specialInstructions: text } : c
      ),
    });
  },

  toggleCart: () => set(state => ({ isCartOpen: !state.isCartOpen })),
  setCartOpen: (open) => set({ isCartOpen: open }),
  clearCart: () => {
    const user = get().user;
    if (user) api.clearCartDb(user.userId).catch(() => {});
    set({ cartItems: [] });
  },

  cartTotal: () => {
    return get().cartItems.reduce((sum, c) => sum + c.price * c.quantity, 0);
  },

  cartCount: () => {
    return get().cartItems.reduce((sum, c) => sum + c.quantity, 0);
  },

  // Orders
  orders: [],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set(state => ({ orders: [order, ...state.orders] })),

  loadOrders: async () => {
    const user = get().user;
    if (!user) return;
    const isAdmin = user.role?.startsWith('admin');
    try {
      const orders = isAdmin ? await api.fetchAllOrders() : await api.fetchOrders(user.userId);
      set({ orders });
    } catch { /* keep existing */ }
  },

  // Toast
  toasts: [],
  addToast: (type, message) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    set(state => ({ toasts: [...state.toasts.slice(-2), { id, type, message }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
}));

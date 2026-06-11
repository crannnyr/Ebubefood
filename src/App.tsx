import { HashRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import CartDrawer from '@/components/CartDrawer';
import Toast from '@/components/Toast';

// Public pages
import HomePage from '@/pages/HomePage';
import MenuPage from '@/pages/MenuPage';
import CategoryPage from '@/pages/CategoryPage';
import ProductPage from '@/pages/ProductPage';
import CartPage from '@/pages/CartPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AdsPage from '@/pages/AdsPage';

// Protected pages
import CheckoutPage from '@/pages/CheckoutPage';
import OrdersPage from '@/pages/OrdersPage';
import OrderDetailPage from '@/pages/OrderDetailPage';
import ProfilePage from '@/pages/ProfilePage';
import ProfileEditPage from '@/pages/ProfileEditPage';
import WalletPage from '@/pages/WalletPage';
import WalletFundPage from '@/pages/WalletFundPage';
import WalletHistoryPage from '@/pages/WalletHistoryPage';
import WalletMethodsPage from '@/pages/WalletMethodsPage';
import AddressesPage from '@/pages/AddressesPage';
import FavouritesPage from '@/pages/FavouritesPage';
import ReviewsPage from '@/pages/ReviewsPage';
import ReferralPage from '@/pages/ReferralPage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminItems from '@/pages/admin/AdminItems';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminBanners from '@/pages/admin/AdminBanners';
import AdminAds from '@/pages/admin/AdminAds';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminEOD from '@/pages/admin/AdminEOD';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage';
import AdminZonesPage from '@/pages/admin/AdminZonesPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminEmailsPage from '@/pages/admin/AdminEmailsPage';
import AdminWaitlistPage from '@/pages/admin/AdminWaitlistPage';
import AdminRefundsPage from '@/pages/admin/AdminRefundsPage';
import AdminSupportPage from '@/pages/admin/AdminSupportPage';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const initAuth = useStore(s => s.initAuth);
  const loadData = useStore(s => s.loadData);

  useEffect(() => {
    initAuth();
    loadData();
  }, [initAuth, loadData]);

  return <>{children}</>;
}

export default function App() {
  return (
    <HashRouter>
      <AppInitializer>
        <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--secondary)' }}>
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/ads" element={<AdsPage />} />

              {/* Protected */}
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/order/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
              <Route path="/wallet/fund" element={<ProtectedRoute><WalletFundPage /></ProtectedRoute>} />
              <Route path="/wallet/history" element={<ProtectedRoute><WalletHistoryPage /></ProtectedRoute>} />
              <Route path="/wallet/methods" element={<ProtectedRoute><WalletMethodsPage /></ProtectedRoute>} />
              <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
              <Route path="/favourites" element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>} />
              <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
              <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/items" element={<AdminRoute><AdminItems /></AdminRoute>} />
              <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
              <Route path="/admin/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
              <Route path="/admin/ads" element={<AdminRoute><AdminAds /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
              <Route path="/admin/eod" element={<AdminRoute><AdminEOD /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
              <Route path="/admin/payments" element={<AdminRoute><AdminPaymentsPage /></AdminRoute>} />
              <Route path="/admin/zones" element={<AdminRoute><AdminZonesPage /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
              <Route path="/admin/emails" element={<AdminRoute><AdminEmailsPage /></AdminRoute>} />
              <Route path="/admin/waitlist" element={<AdminRoute><AdminWaitlistPage /></AdminRoute>} />
              <Route path="/admin/refunds" element={<AdminRoute><AdminRefundsPage /></AdminRoute>} />
              <Route path="/admin/support" element={<AdminRoute><AdminSupportPage /></AdminRoute>} />
            </Routes>
          </main>
          <Footer />
          <MobileNav />
          <CartDrawer />
          <Toast />
        </div>
      </AppInitializer>
    </HashRouter>
  );
}
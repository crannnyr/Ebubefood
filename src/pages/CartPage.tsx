import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Crown,
  Trophy,
  Tag,
  Info,
  ChevronDown,
  Home,
  LayoutGrid,
  ShoppingCart,
  ClipboardList,
  User,
  Heart,
  X
} from 'lucide-react';
import { useStore } from '@/store/useStore';

/* ============ Bottom Navigation ============ */
function BottomNav() {
  const [activeTab, setActiveTab] = useState('cart');
  const cartCount = 3;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky bottom-0 z-50 px-2 py-2 pb-safe"
         style={{ background: 'var(--bg-primary, #0a0a0f)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-[1400px] mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative"
              style={{ color: isActive ? 'var(--primary, #f97316)' : 'var(--text-muted, #6b7280)' }}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                        style={{ background: 'var(--primary, #f97316)', color: '#fff' }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium" style={{ color: isActive ? 'var(--primary, #f97316)' : 'inherit' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ============ Cart Item Card ============ */
interface CartItemProps {
  item: {
    itemId: string;
    name: string;
    description?: string;
    image: string;
    price: number;
    quantity: number;
    badge?: string;
    badgeIcon?: 'fire' | 'pepper';
  };
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="rounded-2xl p-3.5 flex gap-3.5 relative"
         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Image */}
      <div className="relative w-[100px] h-[100px] rounded-xl overflow-hidden flex-shrink-0">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = '/images/placeholder-food.jpg'; }}
        />
        {/* Badge */}
        {item.badge && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold"
               style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'var(--primary, #f97316)' }}>
            {item.badgeIcon === 'fire' && <span>🔥</span>}
            {item.badgeIcon === 'pepper' && <span>🌶️</span>}
            {item.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold leading-tight mb-1" 
                style={{ color: 'var(--text-primary, #ffffff)' }}>{item.name}</h3>
            {item.description && (
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted, #6b7280)' }}>
                {item.description}
              </p>
            )}
          </div>
          <button className="p-1.5 rounded-full flex-shrink-0 transition-colors hover:bg-white/5 mt-0.5">
            <Heart size={18} style={{ color: 'var(--text-muted, #6b7280)' }} />
          </button>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div>
            <p className="text-base font-bold mb-2" style={{ color: 'var(--primary, #f97316)' }}>
              ₦{item.price.toLocaleString()}
            </p>
            {/* Quantity Controls */}
            <div className="flex items-center gap-0 rounded-xl overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button 
                onClick={() => onUpdateQuantity(item.itemId, item.quantity - 1)}
                className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-muted, #6b7280)' }}
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-semibold" 
                    style={{ color: 'var(--text-primary, #ffffff)' }}>
                {item.quantity}
              </span>
              <button 
                onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
                className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: 'var(--primary, #f97316)' }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Remove Button */}
          <button 
            onClick={() => onRemove(item.itemId)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-red-500/10 mb-0.5"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <X size={16} style={{ color: 'var(--text-muted, #6b7280)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Add Extras Banner ============ */
function AddExtrasBanner() {
  return (
    <div className="rounded-2xl p-4 flex items-center justify-between"
         style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ background: 'rgba(249,115,22,0.15)' }}>
          <Sparkles size={20} style={{ color: 'var(--primary, #f97316)' }} />
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary, #ffffff)' }}>
            Want something extra?
          </h4>
          <p className="text-[11px]" style={{ color: 'var(--text-muted, #6b7280)' }}>
            Add extras people love with their orders.
          </p>
        </div>
      </div>
      <Link to="/extras" 
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--primary, #f97316)', border: '1px solid rgba(255,255,255,0.1)' }}>
        Add Extras
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/* ============ Points Banner ============ */
function PointsBanner() {
  return (
    <div className="rounded-2xl p-4 flex items-center justify-between"
         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ background: 'rgba(249,115,22,0.1)' }}>
          <Crown size={20} style={{ color: 'var(--primary, #f97316)' }} />
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary, #ffffff)' }}>
            You're earning points!
          </h4>
          <p className="text-[11px]" style={{ color: 'var(--text-muted, #6b7280)' }}>
            You will earn <span className="font-bold" style={{ color: '#22c55e' }}>96</span> points with this order
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
           style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Trophy size={16} style={{ color: '#fbbf24' }} />
        <div>
          <p className="text-[10px] font-medium" style={{ color: '#fbbf24' }}>Gold Member</p>
          <p className="text-[10px] font-bold" style={{ color: 'var(--text-primary, #ffffff)' }}>1,240 pts</p>
        </div>
        <ArrowRight size={14} style={{ color: 'var(--text-muted, #6b7280)' }} />
      </div>
    </div>
  );
}

/* ============ Promo Code Input ============ */
function PromoCodeInput() {
  const [code, setCode] = useState('');

  return (
    <div className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-3 flex-1">
        <Tag size={18} style={{ color: 'var(--text-muted, #6b7280)' }} />
        <input 
          type="text" 
          placeholder="Have a promo code?" 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted,#6b7280)]"
          style={{ color: 'var(--text-primary, #ffffff)' }}
        />
      </div>
      <button 
        className="text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ color: 'var(--primary, #f97316)' }}
      >
        Apply
      </button>
    </div>
  );
}

/* ============ Order Summary ============ */
function OrderSummary({ subtotal, deliveryFee, serviceFee, total, itemCount }: {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  itemCount: number;
}) {
  return (
    <div className="rounded-2xl p-5 space-y-3"
         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
          Subtotal ({itemCount} items)
        </span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #ffffff)' }}>
          ₦{subtotal.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm" style={{ color: 'var(--text-secondary, #9ca3af)' }}>Delivery Fee</span>
          <Info size={14} style={{ color: 'var(--text-muted, #6b7280)' }} />
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #ffffff)' }}>
          ₦{deliveryFee.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm" style={{ color: 'var(--text-secondary, #9ca3af)' }}>Service Fee</span>
          <Info size={14} style={{ color: 'var(--text-muted, #6b7280)' }} />
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #ffffff)' }}>
          ₦{serviceFee.toLocaleString()}
        </span>
      </div>
      <div className="border-t pt-3 mt-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold" style={{ color: 'var(--text-primary, #ffffff)' }}>Total</span>
          <span className="text-xl font-extrabold" style={{ color: 'var(--text-primary, #ffffff)' }}>
            ₦{total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============ Checkout Bar ============ */

function CheckoutBar({ onCheckout }: { onCheckout: () => void }) {
  return (
    <div className="rounded-2xl p-4 flex items-center justify-between gap-4"
         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: 'rgba(255,255,255,0.05)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
               style={{ color: 'var(--text-muted, #6b7280)' }}>
            <circle cx="5.5" cy="17.5" r="3.5"/>
            <circle cx="18.5" cy="17.5" r="3.5"/>
            <path d="M15 17.5V6.5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v11"/>
            <path d="M9 17.5H3v-3a2 2 0 0 1 2-2h2"/>
            <path d="M21 17.5v-3a2 2 0 0 0-2-2h-2"/>
            <path d="M11 4.5h2"/>
          </svg>
        </div>
        <div>
          <p className="text-[11px] mb-0.5" style={{ color: 'var(--text-muted, #6b7280)' }}>Estimated Delivery</p>
          <p className="text-sm font-bold" style={{ color: '#22c55e' }}>24 – 28 mins</p>
        </div>
      </div>

      <div className="flex-1 max-w-[280px]">
        <button 
          onClick={onCheckout}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'var(--primary, #f97316)', color: '#ffffff' }}
        >
          Checkout Securely
          <ArrowRight size={16} />
        </button>
        <button className="w-full flex items-center justify-center gap-1 mt-2 text-xs"
                style={{ color: 'var(--text-muted, #6b7280)' }}>
          Cash on Delivery
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}
/* ============ Cart Page ============ */
export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useStore();

  // Fallback demo data if store is empty
  const demoItems = [
    {
      itemId: '1',
      name: 'Jollof Rice Special',
      description: 'With grilled chicken & plantain',
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=300&fit=crop',
      price: 5500,
      quantity: 1,
      badge: 'Popular',
      badgeIcon: 'fire' as const,
    },
    {
      itemId: '2',
      name: 'Pepper Soup',
      description: 'With assorted meat',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300&h=300&fit=crop',
      price: 4200,
      quantity: 1,
      badge: 'Spicy',
      badgeIcon: 'pepper' as const,
    },
    {
      itemId: '3',
      name: 'Grilled Chicken',
      description: 'Full chicken',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=300&fit=crop',
      price: 3800,
      quantity: 1,
    },
  ];

  const displayItems = cartItems.length > 0 ? cartItems : demoItems;

  const subtotal = cartItems.length > 0 ? cartTotal() : 13500;
  const deliveryFee = 1200;
  const serviceFee = 300;
  const total = subtotal + deliveryFee + serviceFee;
  const itemCount = displayItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQty = (id: string, qty: number) => {
    if (qty < 1) return;
    if (cartItems.length > 0) {
      updateQuantity(id, qty);
    }
  };

  const handleRemove = (id: string) => {
    if (cartItems.length > 0) {
      removeFromCart(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary, #0a0a0f)' }}>
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 px-4 pt-3 pb-2" 
           style={{ background: 'var(--bg-primary, #0a0a0f)' }}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <ArrowLeft size={20} style={{ color: 'var(--text-primary, #ffffff)' }} />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary, #ffffff)' }}>My Cart</h1>
              <div className="w-8 h-0.5 rounded-full mt-1" style={{ background: 'var(--primary, #f97316)' }} />
            </div>
          </div>

          {/* Delivering to */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
               style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <ShieldCheck size={16} style={{ color: 'var(--primary, #f97316)' }} />
            <div className="text-right">
              <p className="text-[9px]" style={{ color: 'var(--text-muted, #6b7280)' }}>Delivering to</p>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary, #ffffff)' }}>Port Harcourt</p>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted, #6b7280)' }} />
          </div>
        </div>

        {/* Security Badge */}
        <div className="max-w-[1400px] mx-auto flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} style={{ color: '#22c55e' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
              Your order is safe and secure
            </span>
          </div>
          {cartItems.length > 0 && (
            <button 
              onClick={clearCart}
              className="p-2 rounded-xl transition-colors hover:bg-red-500/10"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <Trash2 size={16} style={{ color: 'var(--danger, #ef4444)' }} />
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 space-y-3">
        <div className="max-w-[1400px] mx-auto space-y-3">
          {displayItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                   style={{ background: 'rgba(255,255,255,0.05)' }}>
                <ShoppingBag size={40} style={{ color: 'var(--text-muted, #6b7280)' }} />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary, #ffffff)' }}>
                Your cart is empty
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
                Add some delicious food to get started
              </p>
              <Link to="/" 
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-90"
                    style={{ background: 'var(--primary, #f97316)', color: '#ffffff' }}>
                Browse Menu
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              {displayItems.map((item: any) => (
                <CartItemCard 
                  key={item.itemId}
                  item={item}
                  onUpdateQuantity={handleUpdateQty}
                  onRemove={handleRemove}
                />
              ))}

              {/* Add Extras Banner */}
              <AddExtrasBanner />

              {/* Points Banner */}
              <PointsBanner />

              {/* Promo Code */}
              <PromoCodeInput />

              {/* Order Summary */}
              <OrderSummary 
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                serviceFee={serviceFee}
                total={total}
                itemCount={itemCount}
              />

              {/* Checkout Bar */}
              <CheckoutBar 
                onCheckout={() => navigate('/checkout')}
              />
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useStore();
  const subtotal = cartTotal();
  const deliveryFee = cartItems.length > 0 ? 500 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="pt-20 pb-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Your Cart</h1>
          <Link to="/" className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: 'var(--primary)' }}>
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <img src="/images/empty-cart.jpg" alt="Empty" className="w-40 h-40 rounded-full object-cover mx-auto mb-6 opacity-60" />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your cart is hungry</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Add some delicious food to get started</p>
            <Link to="/" className="btn-primary">Browse Menu</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map(item => (
                <div key={item.itemId} className="card p-4 flex gap-4">
                  <img src={item.image} alt={item.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</h3>
                        <span className={`text-[10px] ${item.owner === 'ebube' ? 'owner-badge-ebube' : item.owner === 'bundu' ? 'owner-badge-bundu' : 'owner-badge-joint'}`}>
                          {item.owner.charAt(0).toUpperCase() + item.owner.slice(1)}
                        </span>
                      </div>
                      <button onClick={() => removeFromCart(item.itemId)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0">
                        <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>
                    <p className="font-mono text-sm mt-2" style={{ color: 'var(--primary)' }}>N{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2 p-1 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
                        <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                          className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5">
                          <Minus size={14} />
                        </button>
                        <span className="font-mono text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                          className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5">
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="ml-auto font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                        N{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={clearCart} className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--danger)' }}>
                Clear Cart
              </button>
            </div>

            {/* Summary */}
            <div className="card p-6 h-fit sticky top-20">
              <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Order Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-mono">N{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>Delivery Fee</span>
                  <span className="font-mono">N{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>Total</span>
                  <span className="font-mono" style={{ color: 'var(--primary)' }}>N{total.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                <ShoppingBag size={18} />
                Proceed to Checkout
              </button>
              <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
                Delivery available within Onitsha &amp; environs
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { cartItems, isCartOpen, setCartOpen, updateQuantity, removeFromCart, cartTotal } = useStore();
  const subtotal = cartTotal();
  const deliveryFee = cartItems.length > 0 ? 500 : 0;
  const total = subtotal + deliveryFee;

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/60 animate-fade-in"
        onClick={() => setCartOpen(false)}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-[80] w-full max-w-md flex flex-col animate-slide-in-right"
        style={{ background: 'var(--secondary)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Your Cart ({cartItems.length} items)
          </h2>
          <button onClick={() => setCartOpen(false)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <img src="/images/empty-cart.jpg" alt="Empty cart" className="w-32 h-32 rounded-full object-cover opacity-60" />
            <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Your cart is hungry</p>
            <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              Add some delicious food to get started
            </p>
            <button onClick={() => { setCartOpen(false); navigate('/'); }} className="btn-primary">
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.map(item => (
                <div key={item.itemId} className="card p-3 flex gap-3">
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
                      <button onClick={() => removeFromCart(item.itemId)} className="p-1 rounded hover:bg-red-500/10 transition-colors flex-shrink-0">
                        <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>
                    <p className="font-mono text-sm mt-1" style={{ color: 'var(--primary)' }}>
                      N{item.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'var(--surface-elevated)' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-mono text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'var(--surface-elevated)' }}
                      >
                        <Plus size={14} />
                      </button>
                      <span className="ml-auto font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                        N{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span className="font-mono">N{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>Delivery Fee</span>
                  <span className="font-mono">N{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <span>Total</span>
                  <span className="font-mono" style={{ color: 'var(--primary)' }}>N{total.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => { setCartOpen(false); navigate('/checkout'); }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                Checkout
              </button>
              <button
                onClick={() => { setCartOpen(false); navigate('/'); }}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

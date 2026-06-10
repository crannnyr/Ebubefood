import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, FileText, Upload, CircleCheck as CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { createOrder } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, addOrder, addToast, paymentDetails } = useStore();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', notes: '' });

  const subtotal = cartTotal();
  const deliveryFee = cartItems.length > 0 ? 500 : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address) {
      addToast('error', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const user = useStore.getState().user;
      if (!user) { addToast('error', 'Please sign in to place an order'); setLoading(false); return; }
      const order = await createOrder({
        userId: user.userId,
        deliveryAddress: form.address,
        deliveryPhone: form.phone,
        deliveryNotes: form.notes || undefined,
        items: cartItems.map(c => ({
          itemId: c.itemId,
          name: c.name,
          price: c.price,
          costPrice: 0,
          quantity: c.quantity,
          owner: c.owner,
          specialInstructions: c.specialInstructions,
        })),
        totalAmount: total,
      });
      addOrder(order);
      setOrderNumber(order.orderNumber);
      clearCart();
      setStep('success');
      addToast('success', 'Order placed successfully!');
    } catch {
      addToast('error', 'Failed to place order. Please try again.');
    }
    setLoading(false);
    addToast('success', 'Order placed successfully!');
  };

  if (step === 'success') {
    return (
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto text-center py-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--success-light)' }}>
            <CheckCircle size={40} style={{ color: 'var(--success)' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Order Placed!</h1>
          <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Your order number is</p>
          <p className="font-mono text-2xl font-bold mb-6" style={{ color: 'var(--primary)' }}>{orderNumber}</p>

          <div className="card p-6 text-left mb-6">
            <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Bank Transfer Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Account Name:</span><span style={{ color: 'var(--text-primary)' }}>{paymentDetails?.accountName || 'N/A'}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Account Number:</span><span className="font-mono" style={{ color: 'var(--text-primary)' }}>{paymentDetails?.accountNumber || 'N/A'}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Bank:</span><span style={{ color: 'var(--text-primary)' }}>{paymentDetails?.bankName || 'N/A'}</span></div>
              <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-primary)' }}>Amount:</span>
                <span className="font-mono" style={{ color: 'var(--primary)' }}>N{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => addToast('info', 'Payment proof upload coming soon')} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Upload size={18} />
              Upload Payment Proof
            </button>
            <button onClick={() => navigate('/orders')} className="btn-primary w-full">
              Track Your Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="pt-24 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Your cart is empty</h1>
        <button onClick={() => navigate('/')} className="btn-primary">Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Delivery Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <MapPin size={18} style={{ color: 'var(--primary)' }} /> Delivery Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
                    <input type="text" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                      className="input-field pl-10" placeholder="John Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
                    <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="input-field pl-10" placeholder="08012345678" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Delivery Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3" size={16} style={{ color: 'var(--text-muted)' }} />
                    <textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                      className="input-field pl-10 min-h-[80px] resize-none" placeholder="123 Street Name, Area, City" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Delivery Notes (optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3" size={16} style={{ color: 'var(--text-muted)' }} />
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                      className="input-field pl-10 min-h-[60px] resize-none" placeholder="Any special instructions..." />
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Payment Method</h3>
              <div className="p-4 rounded-xl border-2" style={{ borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
                <p className="font-medium" style={{ color: 'var(--primary)' }}>Bank Transfer</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Pay to: {paymentDetails?.accountName || 'N/A'} | {paymentDetails?.bankName || 'N/A'} | {paymentDetails?.accountNumber || 'N/A'}
                </p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : `Place Order - N${total.toLocaleString()}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="card p-6 h-fit">
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Order Summary</h3>
            <div className="space-y-3 mb-4">
              {cartItems.map(item => (
                <div key={item.itemId} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                  </div>
                  <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>N{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t space-y-2 pt-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>Subtotal</span><span className="font-mono">N{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>Delivery</span><span className="font-mono">N{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-primary)' }}>Total</span>
                <span className="font-mono" style={{ color: 'var(--primary)' }}>N{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

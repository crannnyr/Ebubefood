import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone, FileText, Package, Clock, CircleCheck as CheckCircle, Circle as XCircle, User } from 'lucide-react';
import { useStore } from '@/store/useStore';

const statusSteps = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
const statusIcons: Record<string, any> = {
  pending: Clock, confirmed: CheckCircle, preparing: Package, ready: Package,
  'out_for_delivery': Package, delivered: CheckCircle, cancelled: XCircle,
};
const statusLabels: Record<string, string> = {
  pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing',
  ready: 'Ready', 'out_for_delivery': 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { orders, addToast, paymentDetails } = useStore();
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="pt-24 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Order not found</h1>
        <Link to="/orders" className="btn-primary">Back to Orders</Link>
      </div>
    );
  }

  const currentStepIndex = order.status === 'cancelled' ? -1 : statusSteps.indexOf(order.status);

  return (
    <div className="pt-20 pb-8 px-4">
      <div className="max-w-[800px] mx-auto">
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm mb-6 hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeft size={16} /> Back to Orders
        </Link>

        <div className="card p-6 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{order.orderNumber}</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'cancelled' ? 'status-cancelled' : order.status === 'delivered' ? 'status-delivered' : 'status-preparing'}`}>
              {statusLabels[order.status]}
            </span>
          </div>
        </div>

        {/* Timeline */}
        {order.status !== 'cancelled' && (
          <div className="card p-6 mb-4 overflow-x-auto">
            <div className="flex items-start justify-between min-w-[500px]">
              {statusSteps.map((step, i) => {
                const StepIcon = statusIcons[step];
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step} className="flex flex-col items-center flex-1 relative">
                    {i < statusSteps.length - 1 && (
                      <div className="absolute top-4 left-1/2 w-full h-0.5" style={{ background: i < currentStepIndex ? 'var(--primary)' : 'var(--border)' }} />
                    )}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center relative z-10"
                      style={{ background: isCompleted ? 'var(--primary)' : 'var(--surface-elevated)', border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--border)'}` }}>
                      <StepIcon size={14} style={{ color: isCompleted ? '#fff' : 'var(--text-muted)' }} />
                    </div>
                    <span className="text-[10px] mt-2 text-center font-medium" style={{ color: isCurrent ? 'var(--primary)' : isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                      {statusLabels[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="card p-6 mb-4">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Items</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                </div>
                <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>N{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 space-y-2" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>Subtotal</span><span className="font-mono">N{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>Delivery Fee</span><span className="font-mono">N{order.deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold" style={{ color: 'var(--text-primary)' }}>
              <span>Total</span><span className="font-mono" style={{ color: 'var(--primary)' }}>N{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="card p-6 mb-4">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Delivery Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="flex-shrink-0" size={16} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{order.userName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="flex-shrink-0" size={16} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{order.userPhone}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="flex-shrink-0 mt-0.5" size={16} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{order.userAddress}</span>
            </div>
            {order.deliveryNotes && (
              <div className="flex items-start gap-3">
                <FileText className="flex-shrink-0 mt-0.5" size={16} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{order.deliveryNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="card p-6 mb-4">
          <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Payment</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Status</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.paymentStatus === 'paid' ? 'status-delivered' : 'status-pending'}`}>
              {order.paymentStatus.toUpperCase()}
            </span>
          </div>
          {order.paymentStatus === 'pending' && paymentDetails && (
            <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'var(--surface-elevated)' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Bank: {paymentDetails.bankName}</p>
              <p style={{ color: 'var(--text-secondary)' }}>Acct: {paymentDetails.accountNumber}</p>
              <p style={{ color: 'var(--text-secondary)' }}>Name: {paymentDetails.accountName}</p>
            </div>
          )}
        </div>

        {order.status === 'pending' && (
          <button onClick={() => addToast('info', 'Cancel feature coming soon')}
            className="w-full py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}

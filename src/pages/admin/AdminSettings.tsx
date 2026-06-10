import { useState, useEffect } from 'react';
import { Save, CreditCard } from 'lucide-react';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useStore } from '@/store/useStore';
import { updatePaymentDetails } from '@/services/api';

const DEFAULT_PAYMENT = { accountName: '', accountNumber: '', bankName: '', bankCode: '', isActive: true };

export default function AdminSettings() {
  const { addToast, paymentDetails } = useStore();
  const [loading, setLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState(paymentDetails ?? { id: '', ...DEFAULT_PAYMENT });

  useEffect(() => {
    if (paymentDetails) setPaymentForm(paymentDetails);
  }, [paymentDetails]);

  const handlePaymentSave = async () => {
    if (!paymentForm.id) { addToast('error', 'No payment details to update'); return; }
    setLoading(true);
    try {
      await updatePaymentDetails(paymentForm.id, {
        account_name: paymentForm.accountName,
        account_number: paymentForm.accountNumber,
        bank_name: paymentForm.bankName,
        bank_code: paymentForm.bankCode,
        is_active: paymentForm.isActive,
      });
      addToast('success', 'Payment details saved');
    } catch {
      addToast('error', 'Failed to save payment details');
    }
    setLoading(false);
  };

  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        {/* Payment Details */}
        <div className="card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CreditCard size={18} style={{ color: 'var(--primary)' }} /> Payment Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Account Name</label>
              <input type="text" value={paymentForm.accountName} onChange={e => setPaymentForm({ ...paymentForm, accountName: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Account Number</label>
                <input type="text" value={paymentForm.accountNumber} onChange={e => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bank Code</label>
                <input type="text" value={paymentForm.bankCode} onChange={e => setPaymentForm({ ...paymentForm, bankCode: e.target.value })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bank Name</label>
              <input type="text" value={paymentForm.bankName} onChange={e => setPaymentForm({ ...paymentForm, bankName: e.target.value })} className="input-field" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={paymentForm.isActive} onChange={e => setPaymentForm({ ...paymentForm, isActive: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
              Set as active payment method
            </label>
            <button onClick={handlePaymentSave} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : <><Save size={16} /> Save Payment Details</>}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

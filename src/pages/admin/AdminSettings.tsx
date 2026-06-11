import { useState, useEffect } from 'react';
import { Save, CreditCard, Layout, BarChart2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useStore } from '@/store/useStore';
import { savePaymentDetails, updatePaymentDetails, fetchSiteSettings, updateSiteSetting } from '@/services/api';

const DEFAULT_PAYMENT = { id: '', accountName: '', accountNumber: '', bankName: '', bankCode: '', isActive: true };

export default function AdminSettings() {
  const { addToast, paymentDetails } = useStore();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [siteLoading, setSiteLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState(paymentDetails ?? DEFAULT_PAYMENT);
  const [siteForm, setSiteForm] = useState({
    hero_badge: '',
    hero_title_line1: '',
    hero_title_line2: '',
    hero_title_highlight: '',
    hero_subtitle: '',
    hero_cta_primary: '',
    hero_cta_secondary: '',
    stats_mode: 'fake',
    stats_fake_min: '13',
    stats_fake_max: '57',
    stats_avg_delivery_mins: '28',
    delivery_fee: '500',
  });

  useEffect(() => {
    if (paymentDetails) setPaymentForm(paymentDetails);
  }, [paymentDetails]);

  useEffect(() => {
    fetchSiteSettings().then(settings => {
      setSiteForm(prev => ({ ...prev, ...settings }));
      setSiteLoading(false);
    });
  }, []);

  const handlePaymentSave = async () => {
    if (!paymentForm.accountName || !paymentForm.accountNumber || !paymentForm.bankName) {
      addToast('error', 'Fill in all required fields');
      return;
    }
    setPaymentLoading(true);
    try {
      if (paymentForm.id) {
        await updatePaymentDetails(paymentForm.id, {
          account_name: paymentForm.accountName,
          account_number: paymentForm.accountNumber,
          bank_name: paymentForm.bankName,
          bank_code: paymentForm.bankCode,
          is_active: true,
        });
      } else {
        await savePaymentDetails({
          accountName: paymentForm.accountName,
          accountNumber: paymentForm.accountNumber,
          bankName: paymentForm.bankName,
          bankCode: paymentForm.bankCode,
        });
      }
      addToast('success', 'Payment details saved');
    } catch {
      addToast('error', 'Failed to save payment details');
    }
    setPaymentLoading(false);
  };

  const handleSiteSettingsSave = async () => {
    setSettingsLoading(true);
    try {
      await Promise.all(
        Object.entries(siteForm).map(([key, value]) => updateSiteSetting(key, value))
      );
      addToast('success', 'Site settings saved');
    } catch {
      addToast('error', 'Failed to save settings');
    }
    setSettingsLoading(false);
  };

  const field = (label: string, key: keyof typeof siteForm, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input
        type="text"
        value={siteForm[key]}
        onChange={e => setSiteForm({ ...siteForm, [key]: e.target.value })}
        className="input-field"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl space-y-6">

        {/* Hero Text */}
        <div className="card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Layout size={18} style={{ color: 'var(--primary)' }} /> Homepage Hero Text
          </h3>
          {siteLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>
          ) : (
            <div className="space-y-4">
              {field('Badge Text', 'hero_badge', 'HOT. FRESH. DELIVERED FAST.')}
              {field('Title Line 1', 'hero_title_line1', 'Cravings')}
              {field('Title Line 2', 'hero_title_line2', 'Delivered in')}
              {field('Title Highlight Word', 'hero_title_highlight', 'Minutes')}
              {field('Subtitle', 'hero_subtitle')}
              {field('Primary CTA Button', 'hero_cta_primary', 'Order Now')}
              {field('Secondary CTA Button', 'hero_cta_secondary', 'Explore Menu')}
              <button onClick={handleSiteSettingsSave} disabled={settingsLoading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {settingsLoading ? <LoadingSpinner size="sm" /> : <><Save size={16} /> Save Hero Settings</>}
              </button>
            </div>
          )}
        </div>

        {/* Stats Settings */}
        <div className="card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <BarChart2 size={18} style={{ color: 'var(--primary)' }} /> Homepage Stats
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Order Count Mode
              </label>
              <div className="flex gap-3">
                {(['fake', 'real'] as const).map(mode => (
                  <button key={mode} type="button"
                    onClick={() => setSiteForm({ ...siteForm, stats_mode: mode })}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all border"
                    style={{
                      borderColor: siteForm.stats_mode === mode ? 'var(--primary)' : 'var(--border)',
                      background: siteForm.stats_mode === mode ? 'var(--primary-light)' : 'transparent',
                      color: siteForm.stats_mode === mode ? 'var(--primary)' : 'var(--text-secondary)',
                    }}>
                    {mode === 'fake' ? '🎭 Simulated' : '📊 Real Orders'}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                {siteForm.stats_mode === 'fake'
                  ? 'Shows simulated order count cycling between min/max every 2 hours'
                  : 'Shows actual orders placed today'}
              </p>
            </div>
            {siteForm.stats_mode === 'fake' && (
              <div className="grid grid-cols-2 gap-4">
                {field('Min Orders (fake)', 'stats_fake_min', '13')}
                {field('Max Orders (fake)', 'stats_fake_max', '57')}
              </div>
            )}
            {field('Avg Delivery Time (mins)', 'stats_avg_delivery_mins', '28')}
            {field('Delivery Fee (₦)', 'delivery_fee', '500')}
            <button onClick={handleSiteSettingsSave} disabled={settingsLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {settingsLoading ? <LoadingSpinner size="sm" /> : <><Save size={16} /> Save Stats Settings</>}
            </button>
          </div>
        </div>

        {/* Payment Details */}
        <div className="card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CreditCard size={18} style={{ color: 'var(--primary)' }} /> Payment Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Account Name *</label>
              <input type="text" value={paymentForm.accountName}
                onChange={e => setPaymentForm({ ...paymentForm, accountName: e.target.value })}
                className="input-field" placeholder="e.g. CBK Foods" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Account Number *</label>
                <input type="text" value={paymentForm.accountNumber}
                  onChange={e => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                  className="input-field" placeholder="0123456789" maxLength={10} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bank Code</label>
                <input type="text" value={paymentForm.bankCode}
                  onChange={e => setPaymentForm({ ...paymentForm, bankCode: e.target.value })}
                  className="input-field" placeholder="e.g. 058" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bank Name *</label>
              <input type="text" value={paymentForm.bankName}
                onChange={e => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                className="input-field" placeholder="e.g. GTBank" />
            </div>
            <button onClick={handlePaymentSave} disabled={paymentLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {paymentLoading ? <LoadingSpinner size="sm" /> : <><Save size={16} /> Save Payment Details</>}
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
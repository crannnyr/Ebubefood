import { useState, useEffect } from 'react';
import { CircleCheck as CheckCircle, X, Eye } from 'lucide-react';
import type { AdSubmission, AdStatus } from '@/types';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useStore } from '@/store/useStore';
import * as api from '@/services/api';

const FILTERS: (AdStatus | 'all')[] = ['all', 'pending_review', 'approved', 'rejected', 'active', 'expired'];

const STATUS_CLASSES: Record<string, string> = {
  pending_review: 'status-pending',
  approved: 'status-confirmed',
  rejected: 'status-cancelled',
  active: 'status-delivered',
  expired: 'status-cancelled',
};

export default function AdminAds() {
  const { addToast } = useStore();
  const [ads, setAds] = useState<AdSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<AdStatus | 'all'>('all');
  const [preview, setPreview] = useState<AdSubmission | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { loadAds(); }, []);

  async function loadAds() {
    setLoading(true);
    try {
      const data = await api.fetchAds();
      setAds(data);
    } catch {
      addToast('error', 'Failed to load ads');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setUpdating(id);
    try {
      await api.updateAdStatus(id, 'active');
      setAds(prev => prev.map(a => a.id === id ? {
        ...a, status: 'active' as AdStatus,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      } : a));
      addToast('success', 'Ad approved and activated');
    } catch {
      addToast('error', 'Failed to approve ad');
    } finally {
      setUpdating(null);
    }
  }

  async function handleReject() {
    if (!rejectModal) return;
    setUpdating(rejectModal);
    try {
      await api.updateAdStatus(rejectModal, 'rejected', rejectReason || 'Does not meet guidelines');
      setAds(prev => prev.map(a => a.id === rejectModal ? {
        ...a, status: 'rejected' as AdStatus,
        rejectionReason: rejectReason || 'Does not meet guidelines',
      } : a));
      setRejectModal(null);
      setRejectReason('');
      addToast('success', 'Ad rejected');
    } catch {
      addToast('error', 'Failed to reject ad');
    } finally {
      setUpdating(null);
    }
  }

  const filtered = activeFilter === 'all' ? ads : ads.filter(a => a.status === activeFilter);

  return (
    <AdminLayout title="Ad Review">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all"
            style={{
              background: activeFilter === f ? 'var(--primary)' : 'var(--surface)',
              color: activeFilter === f ? '#fff' : 'var(--text-secondary)',
            }}>
            {f.replace(/_/g, ' ')} ({f === 'all' ? ads.length : ads.filter(a => a.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p style={{ color: 'var(--text-muted)' }}>No ads found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(ad => (
            <div key={ad.id} className="card p-4">
              <div className="flex items-start gap-4">
                <div onClick={() => setPreview(ad)}
                  className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer bg-black/20">
                  {ad.mediaUrl ? (
                    <img src={ad.mediaUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs"
                      style={{ color: 'var(--text-muted)' }}>No image</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{ad.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_CLASSES[ad.status]}`}>
                      {ad.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{ad.email} · {ad.phone}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {ad.adType} · {ad.duration.replace(/_/g, ' ')} · {ad.period === '1_month' ? '1 Month' : '2 Months'}
                    {ad.customCreation && ' · Custom Design'}
                  </p>
                  <p className="font-mono text-sm font-bold mt-1" style={{ color: 'var(--primary)' }}>
                    ₦{ad.totalPrice.toLocaleString()}
                  </p>
                  {ad.rejectionReason && (
                    <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>Rejected: {ad.rejectionReason}</p>
                  )}
                  {ad.startDate && (
                    <p className="text-xs mt-1" style={{ color: 'var(--success)' }}>
                      Active until {new Date(ad.endDate!).toLocaleDateString('en-NG')}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment proof */}
              {ad.paymentProofUrl && (
                <a href={ad.paymentProofUrl} target="_blank" rel="noopener noreferrer"
                  className="block mt-2 text-xs underline" style={{ color: 'var(--primary)' }}>
                  View Payment Proof
                </a>
              )}

              <div className="flex gap-2 mt-3">
                <button onClick={() => setPreview(ad)}
                  className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1">
                  <Eye size={14} /> View
                </button>
                {ad.status === 'pending_review' && (
                  <>
                    <button onClick={() => handleApprove(ad.id)}
                      disabled={updating === ad.id}
                      className="flex-1 py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-1"
                      style={{ background: 'var(--success)', opacity: updating === ad.id ? 0.6 : 1 }}>
                      {updating === ad.id ? <LoadingSpinner size="sm" /> : <><CheckCircle size={14} /> Approve</>}
                    </button>
                    <button onClick={() => setRejectModal(ad.id)}
                      disabled={updating === ad.id}
                      className="flex-1 py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-1"
                      style={{ background: 'var(--danger)', opacity: updating === ad.id ? 0.6 : 1 }}>
                      <X size={14} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreview(null)}>
          <div className="card max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ad Preview</h3>
            <div className="rounded-xl overflow-hidden aspect-[3/1] mb-4 bg-black/20">
              {preview.mediaUrl ? (
                <img src={preview.mediaUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm"
                  style={{ color: 'var(--text-muted)' }}>No media uploaded</div>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <p><span style={{ color: 'var(--text-muted)' }}>Advertiser:</span> <span style={{ color: 'var(--text-primary)' }}>{preview.name}</span></p>
              <p><span style={{ color: 'var(--text-muted)' }}>Contact:</span> <span style={{ color: 'var(--text-primary)' }}>{preview.email} · {preview.phone}</span></p>
              <p><span style={{ color: 'var(--text-muted)' }}>Package:</span> <span style={{ color: 'var(--text-primary)' }}>{preview.adType} · {preview.duration.replace(/_/g, ' ')} · {preview.period.replace(/_/g, ' ')}</span></p>
              {preview.linkUrl && (
                <p><span style={{ color: 'var(--text-muted)' }}>Link:</span> <a href={preview.linkUrl} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--primary)' }}>{preview.linkUrl}</a></p>
              )}
              <p><span style={{ color: 'var(--text-muted)' }}>Amount:</span> <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>₦{preview.totalPrice.toLocaleString()}</span></p>
            </div>
            <button onClick={() => setPreview(null)} className="btn-primary w-full mt-4 py-2.5">Close</button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4">
          <div className="card max-w-sm w-full p-6">
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Reject Ad</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="input-field w-full min-h-[80px] resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="btn-secondary flex-1 py-2.5">Cancel</button>
              <button onClick={handleReject}
                className="flex-1 py-2.5 rounded-lg font-medium text-white"
                style={{ background: 'var(--danger)' }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
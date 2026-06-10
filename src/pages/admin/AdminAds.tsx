import { useState } from 'react';
import { CircleCheck as CheckCircle, Circle as XCircle, Eye } from 'lucide-react';
import type { AdSubmission, AdStatus } from '@/types';
import AdminLayout from './AdminLayout';
import { useStore } from '@/store/useStore';

const filters: (AdStatus | 'all')[] = ['all', 'pending_review', 'approved', 'rejected', 'active', 'expired'];

export default function AdminAds() {
  const { addToast, ads } = useStore();
  const [adsList, setAdsList] = useState<AdSubmission[]>(ads);
  const [activeFilter, setActiveFilter] = useState<AdStatus | 'all'>('all');
  const [preview, setPreview] = useState<AdSubmission | null>(null);

  const filtered = activeFilter === 'all' ? adsList : adsList.filter(a => a.status === activeFilter);

  const handleApprove = (id: string) => {
    setAdsList(as => as.map(a => a.id === id ? { ...a, status: 'active' as AdStatus, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 30 * 86400000).toISOString() } : a));
    addToast('success', 'Ad approved and activated');
  };
  const handleReject = (id: string) => {
    setAdsList(as => as.map(a => a.id === id ? { ...a, status: 'rejected' as AdStatus, rejectionReason: 'Does not meet guidelines' } : a));
    addToast('error', 'Ad rejected');
  };

  const statusClasses: Record<string, string> = {
    pending_review: 'status-pending', approved: 'status-confirmed', rejected: 'status-cancelled',
    active: 'status-delivered', expired: 'status-cancelled',
  };

  return (
    <AdminLayout title="Ad Review">
      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all"
            style={{ background: activeFilter === f ? 'var(--primary)' : 'var(--surface)', color: activeFilter === f ? '#fff' : 'var(--text-secondary)' }}>
            {f} ({f === 'all' ? adsList.length : adsList.filter(a => a.status === f).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16"><p style={{ color: 'var(--text-muted)' }}>No ads found</p></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(ad => (
            <div key={ad.id} className="card p-4">
              <div className="flex items-start gap-4">
                <div onClick={() => setPreview(ad)} className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer">
                  <img src={ad.mediaUrl || '/images/ad-placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{ad.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusClasses[ad.status]}`}>{ad.status}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{ad.email} &middot; {ad.phone}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ad.adType} &middot; {ad.duration.replace(/_/g, ' ')} &middot; {ad.period === '1_month' ? '1 Month' : '2 Months'}</p>
                  <p className="font-mono text-sm font-bold mt-1" style={{ color: 'var(--primary)' }}>N{ad.totalPrice.toLocaleString()}</p>
                  {ad.rejectionReason && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>Reason: {ad.rejectionReason}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setPreview(ad)} className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1">
                  <Eye size={14} /> View
                </button>
                {ad.status === 'pending_review' && (
                  <>
                    <button onClick={() => handleApprove(ad.id)} className="flex-1 py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-1" style={{ background: 'var(--success)' }}>
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button onClick={() => handleReject(ad.id)} className="flex-1 py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-1" style={{ background: 'var(--danger)' }}>
                      <XCircle size={14} /> Reject
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
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreview(null)}>
          <div className="card max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ad Preview</h3>
            <div className="rounded-xl overflow-hidden aspect-[3/1] mb-4">
              <img src={preview.mediaUrl || '/images/ad-placeholder.jpg'} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2 text-sm">
              <p><span style={{ color: 'var(--text-muted)' }}>Advertiser:</span> <span style={{ color: 'var(--text-primary)' }}>{preview.name}</span></p>
              <p><span style={{ color: 'var(--text-muted)' }}>Type:</span> <span style={{ color: 'var(--text-primary)' }}>{preview.adType} &middot; {preview.duration} &middot; {preview.period}</span></p>
              <p><span style={{ color: 'var(--text-muted)' }}>Link:</span> <a href={preview.linkUrl} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--primary)' }}>{preview.linkUrl}</a></p>
              <p><span style={{ color: 'var(--text-muted)' }}>Total:</span> <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>N{preview.totalPrice.toLocaleString()}</span></p>
            </div>
            <button onClick={() => setPreview(null)} className="btn-primary w-full mt-4 py-2.5">Close</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

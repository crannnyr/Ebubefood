import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Eye } from 'lucide-react';
import type { Banner } from '@/types';
import AdminLayout from './AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import { useStore } from '@/store/useStore';

export default function AdminBanners() {
  const { addToast, banners } = useStore();
  const [bannersList, setBannersList] = useState<Banner[]>(banners);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', targetType: 'category' as 'category' | 'external', targetValue: '', displayOrder: 1, isActive: true });

  const openAdd = () => {
    setEditing(null); setForm({ title: '', subtitle: '', targetType: 'category', targetValue: '', displayOrder: bannersList.length + 1, isActive: true }); setShowModal(true);
  };
  const openEdit = (b: Banner) => { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle, targetType: b.targetType, targetValue: b.targetValue, displayOrder: b.displayOrder, isActive: b.isActive }); setShowModal(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setBannersList(bs => bs.map(b => b.id === editing.id ? { ...b, ...form } : b));
    } else {
      setBannersList(bs => [...bs, { id: `new-${Date.now()}`, ...form, mediaUrl: '/images/hero-banner.jpg', mediaType: 'image' }]);
    }
    setShowModal(false);
    addToast('success', editing ? 'Banner updated' : 'Banner created');
  };

  return (
    <AdminLayout title="Hero Banners">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{bannersList.length} banners</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2.5 px-4"><Plus size={16} /> Add Banner</button>
      </div>

      <div className="space-y-3">
        {bannersList.map(b => (
          <div key={b.id} className="card p-4 flex items-center gap-4">
            <img src={b.mediaUrl} alt={b.title} className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{b.title}</h4>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{b.subtitle}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>{b.targetType}: {b.targetValue}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${b.isActive ? 'status-delivered' : 'status-cancelled'}`}>{b.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => addToast('info', 'Preview coming soon')} className="p-1.5 rounded-lg hover:bg-white/5"><Eye size={14} style={{ color: 'var(--text-muted)' }} /></button>
              <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-white/5"><Pencil size={14} style={{ color: 'var(--text-muted)' }} /></button>
              <button onClick={() => setBannersList(bs => bs.filter(x => x.id !== b.id))} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{editing ? 'Edit' : 'Add'} Banner</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title</label><input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Subtitle</label><input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target Type</label><select value={form.targetType} onChange={e => setForm({ ...form, targetType: e.target.value as any })} className="input-field"><option value="category">Category</option><option value="external">External Link</option></select></div>
                <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target Value</label><input type="text" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} className="input-field" placeholder="slug or URL" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Banner Image</label><ImageUploader onImageSelect={() => {}} /></div>
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ accentColor: 'var(--primary)' }} /> Active
              </label>
              <button type="submit" className="btn-primary w-full py-3">{editing ? 'Save' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

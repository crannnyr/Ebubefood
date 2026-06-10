import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { Banner } from '@/types';
import AdminLayout from './AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import * as api from '@/services/api';
import type { BannerRow } from '@/types';
import { transformBanner } from '@/lib/transformers';

async function fetchAllBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .order('display_order');
  if (error) throw error;
  return (data as BannerRow[]).map(transformBanner);
}

async function createBanner(params: {
  title: string; subtitle: string; targetType: 'category' | 'external';
  targetValue: string; displayOrder: number; isActive: boolean;
  mediaUrl: string; mediaType: 'image' | 'gif'; createdBy: string;
}): Promise<void> {
  const { error } = await supabase.from('hero_banners').insert({
    title: params.title,
    subtitle: params.subtitle,
    target_type: params.targetType,
    target_value: params.targetValue,
    display_order: params.displayOrder,
    is_active: params.isActive,
    media_url: params.mediaUrl,
    media_type: params.mediaType,
    created_by: params.createdBy,
  });
  if (error) throw error;
}

async function updateBanner(id: string, params: Partial<{
  title: string; subtitle: string; targetType: string;
  targetValue: string; displayOrder: number; isActive: boolean;
  mediaUrl: string;
}>): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (params.title !== undefined) updates.title = params.title;
  if (params.subtitle !== undefined) updates.subtitle = params.subtitle;
  if (params.targetType !== undefined) updates.target_type = params.targetType;
  if (params.targetValue !== undefined) updates.target_value = params.targetValue;
  if (params.displayOrder !== undefined) updates.display_order = params.displayOrder;
  if (params.isActive !== undefined) updates.is_active = params.isActive;
  if (params.mediaUrl !== undefined) updates.media_url = params.mediaUrl;
  const { error } = await supabase.from('hero_banners').update(updates).eq('id', id);
  if (error) throw error;
}

async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from('hero_banners').delete().eq('id', id);
  if (error) throw error;
}

export default function AdminBanners() {
  const { addToast, user } = useStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', subtitle: '', targetType: 'category' as 'category' | 'external',
    targetValue: '', displayOrder: 1, isActive: true,
  });

  useEffect(() => { loadBanners(); }, []);

  async function loadBanners() {
    setLoading(true);
    try {
      const data = await fetchAllBanners();
      setBanners(data);
    } catch {
      addToast('error', 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ title: '', subtitle: '', targetType: 'category', targetValue: '', displayOrder: banners.length + 1, isActive: true });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  }

  function openEdit(b: Banner) {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle, targetType: b.targetType, targetValue: b.targetValue, displayOrder: b.displayOrder, isActive: b.isActive });
    setImageFile(null);
    setImagePreview(b.mediaUrl || null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!editing && !imageFile) { addToast('error', 'Please upload a banner image'); return; }
    setSaving(true);
    try {
      let mediaUrl = editing?.mediaUrl || '';
      if (imageFile) {
        mediaUrl = await api.uploadImage('hero-banners', `banner-${Date.now()}-${imageFile.name}`, imageFile);
      }

      if (editing) {
        await updateBanner(editing.id, { ...form, mediaUrl });
        addToast('success', 'Banner updated');
      } else {
        await createBanner({ ...form, mediaUrl, mediaType: 'image', createdBy: user!.userId });
        addToast('success', 'Banner created');
      }

      setShowModal(false);
      await loadBanners();
    } catch {
      addToast('error', 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      setDeleteConfirm(null);
      addToast('success', 'Banner deleted');
    } catch {
      addToast('error', 'Failed to delete banner');
    }
  }

  return (
    <AdminLayout title="Hero Banners">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{banners.length} banners</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2.5 px-4">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : banners.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No banners yet. Add your first hero banner.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map(b => (
            <div key={b.id} className="card p-4 flex items-center gap-4">
              <img src={b.mediaUrl} alt={b.title}
                className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).src = '/images/placeholder-food.jpg'; }} />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{b.title}</h4>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{b.subtitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>
                    {b.targetType}: {b.targetValue}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${b.isActive ? 'status-delivered' : 'status-cancelled'}`}>
                    {b.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-white/5">
                  <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
                <button onClick={() => setDeleteConfirm(b.id)} className="p-1.5 rounded-lg hover:bg-red-500/10">
                  <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Banner?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 py-2.5">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-lg font-medium text-white"
                style={{ background: 'var(--danger)' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Edit' : 'Add'} Banner
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title *</label>
                <input type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Subtitle</label>
                <input type="text" value={form.subtitle}
                  onChange={e => setForm({ ...form, subtitle: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target Type</label>
                  <select value={form.targetType}
                    onChange={e => setForm({ ...form, targetType: e.target.value as 'category' | 'external' })}
                    className="input-field">
                    <option value="category">Category</option>
                    <option value="external">External Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {form.targetType === 'category' ? 'Category Slug' : 'URL'}
                  </label>
                  <input type="text" value={form.targetValue}
                    onChange={e => setForm({ ...form, targetValue: e.target.value })}
                    className="input-field"
                    placeholder={form.targetType === 'category' ? 'e.g. rice-dishes' : 'https://...'} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Banner Image {!editing && '*'}
                </label>
                <ImageUploader
                  onImageSelect={(file, preview) => { setImageFile(file); setImagePreview(preview); }}
                  maxSizeMB={3}
                />
                {imagePreview && !imageFile && (
                  <img src={imagePreview} alt="Current" className="mt-2 w-full h-24 object-cover rounded-lg" />
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    style={{ accentColor: 'var(--primary)' }} />
                  Active
                </label>
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Display Order</label>
                  <input type="number" value={form.displayOrder}
                    onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="input-field py-1.5 text-sm" />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {saving ? <><LoadingSpinner size="sm" /> Saving...</> : (editing ? 'Save Changes' : 'Create Banner')}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import type { FoodItem, Owner } from '@/types';
import AdminLayout from './AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useStore } from '@/store/useStore';
import * as api from '@/services/api';

const DELIVERY_OPTIONS = [
  { value: 'instant', label: 'Instant' },
  { value: '2_hours', label: '2 Hours' },
  { value: '6_hours', label: '6 Hours' },
  { value: '24_hours', label: '24 Hours' },
  { value: '3_days', label: '3 Days' },
  { value: '1_week', label: '1 Week' },
];

const initialForm = {
  name: '', description: '', price: 0, costPrice: 0, categoryId: '',
  owner: 'joint' as Owner, deliveryTime: 'instant', isFeatured: false, isAvailable: true,
};

export default function AdminItems() {
  const { addToast, categories, user } = useStore();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await api.adminFetchAllItems();
      setItems(data);
    } catch {
      addToast('error', 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchOwner = ownerFilter === 'all' || i.owner === ownerFilter;
    return matchSearch && matchOwner;
  });

  function openAdd() {
    setEditing(null);
    setForm({ ...initialForm, categoryId: categories[0]?.id || '' });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  }

  function openEdit(item: FoodItem) {
    setEditing(item);
    setForm({
      name: item.name, description: item.description, price: item.price,
      costPrice: item.costPrice || 0, categoryId: item.categoryId,
      owner: item.owner, deliveryTime: item.deliveryTime,
      isFeatured: item.isFeatured, isAvailable: item.isAvailable,
    });
    setImageFile(null);
    setImagePreview(item.image || null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        imageUrl = await api.uploadImage('items-images', `${Date.now()}-${imageFile.name}`, imageFile);
      }

      if (editing) {
        await api.updateItem(editing.id, { ...form, imageUrl: imageUrl || editing.image });
        addToast('success', 'Item updated');
      } else {
        await api.createItem({ ...form, imageUrl, createdBy: user!.userId });
        addToast('success', 'Item created');
      }

      setShowModal(false);
      await loadItems();
    } catch (err) {
      addToast('error', 'Failed to save item');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setDeleteConfirm(null);
      addToast('success', 'Item deleted');
    } catch {
      addToast('error', 'Failed to delete item');
    }
  }

  return (
    <AdminLayout title="Food Items">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search items..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-field pl-10 w-full" />
        </div>
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}
          className="input-field py-2.5 text-sm" style={{ background: 'var(--surface)' }}>
          <option value="all">All Owners</option>
          <option value="ebube">Ebube</option>
          <option value="bundu">Bundu</option>
          <option value="joint">Joint</option>
        </select>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2.5 px-4">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--surface-elevated)' }}>
                  {['Item', 'Category', 'Price', 'Owner', 'Delivery', 'Status', ''].map(h => (
                    <th key={h} className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No items found</td></tr>
                ) : filtered.map(item => (
                  <tr key={item.id} className="border-t hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).src = '/images/placeholder-food.jpg'; }} />
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                      </div>
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{item.categoryName || '—'}</td>
                    <td className="p-3 font-mono" style={{ color: 'var(--primary)' }}>₦{item.price.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.owner === 'ebube' ? 'owner-badge-ebube' : item.owner === 'bundu' ? 'owner-badge-bundu' : 'owner-badge-joint'}`}>
                        {item.owner.charAt(0).toUpperCase() + item.owner.slice(1)}
                      </span>
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{item.deliveryTime.replace(/_/g, ' ')}</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.isAvailable ? 'status-delivered' : 'status-cancelled'}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/5">
                          <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
                        </button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10">
                          <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Item?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 py-2.5">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-lg font-medium text-white transition-colors"
                style={{ background: 'var(--danger)' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Name *</label>
                <input type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field min-h-[80px] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Price (₦) *</label>
                  <input type="number" required min={0} value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Cost Price (₦)</label>
                  <input type="number" min={0} value={form.costPrice}
                    onChange={e => setForm({ ...form, costPrice: Number(e.target.value) })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
                  <select value={form.categoryId}
                    onChange={e => setForm({ ...form, categoryId: e.target.value })} className="input-field">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Delivery Time</label>
                  <select value={form.deliveryTime}
                    onChange={e => setForm({ ...form, deliveryTime: e.target.value })} className="input-field">
                    {DELIVERY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Owner</label>
                <div className="flex gap-2">
                  {(['ebube', 'bundu', 'joint'] as Owner[]).map(o => (
                    <button key={o} type="button" onClick={() => setForm({ ...form, owner: o })}
                      className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all border"
                      style={{
                        borderColor: form.owner === o ? (o === 'bundu' ? '#8B5CF6' : 'var(--primary)') : 'var(--border)',
                        background: form.owner === o ? (o === 'bundu' ? 'rgba(139,92,246,0.15)' : 'var(--primary-light)') : 'transparent',
                        color: form.owner === o ? (o === 'bundu' ? '#8B5CF6' : 'var(--primary)') : 'var(--text-secondary)',
                      }}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Image</label>
                <ImageUploader
                  onImageSelect={(file, preview) => { setImageFile(file); setImagePreview(preview); }}
                  maxSizeMB={5}
                />
                {imagePreview && !imageFile && (
                  <img src={imagePreview} alt="Current" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.isFeatured}
                    onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                    style={{ accentColor: 'var(--primary)' }} />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.isAvailable}
                    onChange={e => setForm({ ...form, isAvailable: e.target.checked })}
                    style={{ accentColor: 'var(--primary)' }} />
                  Available
                </label>
              </div>
              <button type="submit" disabled={saving}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {saving ? <><LoadingSpinner size="sm" /> Saving...</> : (editing ? 'Save Changes' : 'Create Item')}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
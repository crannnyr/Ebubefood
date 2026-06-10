import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import type { FoodItem, Owner } from '@/types';
import AdminLayout from './AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useStore } from '@/store/useStore';

const initialForm: Partial<FoodItem> = {
  name: '', description: '', price: 0, costPrice: 0, categoryId: '1',
  owner: 'joint' as Owner, deliveryTime: 'instant', isFeatured: false, isAvailable: true,
};

export default function AdminItems() {
  const { addToast, items, categories } = useStore();
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const filtered = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesOwner = ownerFilter === 'all' || i.owner === ownerFilter;
    return matchesSearch && matchesOwner;
  });

  const openAdd = () => { setEditing(null); setForm(initialForm); setShowModal(true); };
  const openEdit = (item: FoodItem) => { setEditing(item); setForm({ ...item }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setShowModal(false);
    addToast('success', editing ? 'Item updated' : 'Item created');
  };

  return (
    <AdminLayout title="Food Items">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 w-full" />
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

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-elevated)' }}>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Item</th>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Category</th>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Price</th>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Owner</th>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Delivery</th>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-t hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{item.categoryName}</td>
                  <td className="p-3 font-mono" style={{ color: 'var(--primary)' }}>N{item.price.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-[10px] ${item.owner === 'ebube' ? 'owner-badge-ebube' : item.owner === 'bundu' ? 'owner-badge-bundu' : 'owner-badge-joint'}`}>
                      {item.owner.charAt(0).toUpperCase() + item.owner.slice(1)}
                    </span>
                  </td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{item.deliveryTime}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.isAvailable ? 'status-delivered' : 'status-cancelled'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                        <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
                      </button>
                      <button onClick={() => addToast('info', 'Delete coming soon')} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
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

      {/* Modal */}
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
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Price (N)</label>
                  <input type="number" required value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Cost Price (N)</label>
                  <input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: Number(e.target.value) })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="input-field">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Delivery Time</label>
                  <select value={form.deliveryTime} onChange={e => setForm({ ...form, deliveryTime: e.target.value as any })} className="input-field">
                    <option value="instant">Instant</option>
                    <option value="24hrs">24 Hours</option>
                    <option value="1week">1 Week</option>
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
                <ImageUploader onImageSelect={() => {}} />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
                  Available
                </label>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading ? <LoadingSpinner size="sm" /> : (editing ? 'Save Changes' : 'Create Item')}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

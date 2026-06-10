import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { Category } from '@/types';
import AdminLayout from './AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useStore } from '@/store/useStore';
import * as api from '@/services/api';

export default function AdminCategories() {
  const { addToast } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', displayOrder: 1 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await api.fetchCategories();
      setCategories(data);
    } catch {
      addToast('error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: '', description: '', displayOrder: categories.length + 1 });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, description: '', displayOrder: cat.displayOrder });
    setImageFile(null);
    setImagePreview(cat.image || null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await api.uploadImage('items-images', `cat-${Date.now()}-${imageFile.name}`, imageFile);
      }

      if (editing) {
        await api.updateCategory(editing.id, { ...form, imageUrl: imageUrl || editing.image });
        addToast('success', 'Category updated');
      } else {
        await api.createCategory({ ...form, imageUrl });
        addToast('success', 'Category created');
      }

      setShowModal(false);
      await loadCategories();
    } catch {
      addToast('error', 'Failed to save category');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setDeleteConfirm(null);
      addToast('success', 'Category deleted');
    } catch {
      addToast('error', 'Failed to delete category');
    }
  }

  return (
    <AdminLayout title="Categories">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{categories.length} categories</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2.5 px-4">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="card p-4 flex items-center gap-4 group">
              <img src={cat.image} alt={cat.name}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).src = '/images/cat-rice.jpg'; }} />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{cat.name}</h4>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {cat.itemCount || 0} items · Order {cat.displayOrder}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-white/5">
                  <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
                <button onClick={() => setDeleteConfirm(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10">
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
            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Category?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Items in this category will not be deleted but will become uncategorized.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 py-2.5">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-lg font-medium text-white transition-colors"
                style={{ background: 'var(--danger)' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Edit' : 'Add'} Category
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
                <input type="text" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Display Order</label>
                <input type="number" value={form.displayOrder}
                  onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} className="input-field" />
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
              <button type="submit" disabled={saving}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {saving ? <><LoadingSpinner size="sm" /> Saving...</> : (editing ? 'Save Changes' : 'Create Category')}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
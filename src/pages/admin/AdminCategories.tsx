import { useState } from 'react';
import { Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react';
import type { Category } from '@/types';
import AdminLayout from './AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import { useStore } from '@/store/useStore';

export default function AdminCategories() {
  const { addToast, categories } = useStore();
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', displayOrder: 1 });

  const openAdd = () => { setEditing(null); setForm({ name: '', displayOrder: categoriesList.length + 1 }); setShowModal(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, displayOrder: cat.displayOrder }); setShowModal(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setCategoriesList(cats => cats.map(c => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      const slug = form.name.toLowerCase().replace(/\s+/g, '-');
      setCategoriesList(cats => [...cats, { id: `new-${Date.now()}`, ...form, slug, image: '/images/cat-rice.jpg' }]);
    }
    setShowModal(false);
    addToast('success', editing ? 'Category updated' : 'Category created');
  };

  const handleDelete = (id: string) => {
    setCategoriesList(cats => cats.filter(c => c.id !== id));
    addToast('success', 'Category deleted');
  };

  return (
    <AdminLayout title="Categories">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{categoriesList.length} categories</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2.5 px-4">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesList.map(cat => (
          <div key={cat.id} className="card p-4 flex items-center gap-4 group">
            <GripVertical size={16} style={{ color: 'var(--text-muted)' }} className="cursor-grab" />
            <img src={cat.image} alt={cat.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{cat.name}</h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat.itemCount || 0} items &middot; Order {cat.displayOrder}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-white/5">
                <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
              <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10">
                <Trash2 size={14} style={{ color: 'var(--danger)' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{editing ? 'Edit' : 'Add'} Category</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Display Order</label>
                <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Image</label>
                <ImageUploader onImageSelect={() => {}} />
              </div>
              <button type="submit" className="btn-primary w-full py-3">{editing ? 'Save' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

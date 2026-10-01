import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Loader2, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../services/api';
import { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    id: '',
    name: '',
    shortCode: '',
    badgeColorClass: 'bg-forest text-white',
    borderClass: 'border-forest',
    description: '',
    isFutureModule: false,
    displayOrder: 1,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCategories();
      setCategories(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormData({
      id: '',
      name: '',
      shortCode: '',
      badgeColorClass: 'bg-forest text-white',
      borderClass: 'border-forest',
      description: '',
      isFutureModule: false,
      displayOrder: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setFormData({ ...cat });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    setIsSaving(true);
    try {
      if (editingCat) {
        await adminApi.updateCategory(editingCat.id, formData);
      } else {
        await adminApi.createCategory(formData);
      }
      setIsModalOpen(false);
      fetchCats();
    } catch (err: any) {
      alert(err.message || 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-white">Module & Sector Categories</h3>
          <p className="text-xs text-slate-400">
            Configure visual styling badges and define future extensible sectors without code changes.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-forest/30"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-400" />
            <span>Loading categories...</span>
          </div>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${c.badgeColorClass}`}>
                    {c.shortCode}
                  </span>
                  <div className="flex items-center gap-1">
                    {c.isFutureModule ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                        Future Module
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Active
                      </span>
                    )}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{c.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{c.description || 'No description provided.'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  {c.locationsCount || 0} locations
                </span>
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingCat ? `Edit Category: ${editingCat.name}` : 'New Category'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              {!editingCat && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ID (Uppercase, e.g. HOTELS) *</label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Short Code (4 chars)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.shortCode}
                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fut"
                  checked={formData.isFutureModule}
                  onChange={(e) => setFormData({ ...formData, isFutureModule: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                />
                <label htmlFor="fut" className="text-xs text-slate-300">
                  Mark as Future Expansion Module
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold"
                >
                  {isSaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

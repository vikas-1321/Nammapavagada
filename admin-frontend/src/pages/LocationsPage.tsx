import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Loader2,
  AlertCircle,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { adminApi } from '../services/api';
import { LocationItem, Category } from '../types';

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [formData, setFormData] = useState<Partial<LocationItem>>({
    name: '',
    kannadaName: '',
    category: 'FORT_HERITAGE',
    summary: '',
    fullDescription: '',
    address: 'Pavagada, Karnataka 561202',
    coordinates: { latitude: 14.1025, longitude: 77.2798, elevationMeters: 740 },
    contact: { authority: '', phone: '', website: '' },
    hours: { open: '06:00 AM', close: '06:00 PM', days: 'Daily' },
    tags: [],
    keyAttributes: [],
    verifiedSource: '',
    isPdfAuthoritative: true,
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const [locsRes, catsRes] = await Promise.all([
        adminApi.getLocations({ category: selectedCategory, q: searchQuery, status: selectedStatus }),
        adminApi.getCategories(),
      ]);
      setLocations(locsRes.items || []);
      setCategories(catsRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedCategory, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLocations();
  };

  const handleOpenAddModal = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      kannadaName: '',
      category: categories[0]?.id || 'FORT_HERITAGE',
      summary: '',
      fullDescription: '',
      address: 'Pavagada Town, Karnataka 561202',
      coordinates: { latitude: 14.1025, longitude: 77.2798, elevationMeters: 740 },
      contact: { authority: 'Revenue Department / Municipal Council', phone: '', website: '' },
      hours: { open: '06:00 AM', close: '06:00 PM', days: 'Daily' },
      tags: ['Pavagada', 'Verified'],
      keyAttributes: [],
      verifiedSource: 'Official Administrative Records',
      isPdfAuthoritative: true,
      status: 'ACTIVE',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (loc: LocationItem) => {
    setEditingLocation(loc);
    setFormData({
      ...loc,
      coordinates: { ...loc.coordinates },
      contact: { ...loc.contact },
      hours: { ...loc.hours },
      tags: [...(loc.tags || [])],
      keyAttributes: [...(loc.keyAttributes || [])],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.name?.trim()) {
      setFormError('Location name is required.');
      return;
    }
    if (!formData.summary?.trim()) {
      setFormError('Brief summary description is required.');
      return;
    }
    if (formData.coordinates?.latitude == null || isNaN(formData.coordinates.latitude)) {
      setFormError('Valid numeric latitude is required (e.g. 14.1025).');
      return;
    }
    if (formData.coordinates?.longitude == null || isNaN(formData.coordinates.longitude)) {
      setFormError('Valid numeric longitude is required (e.g. 77.2798).');
      return;
    }

    setIsSaving(true);
    try {
      if (editingLocation) {
        await adminApi.updateLocation(editingLocation.id, formData);
        setSuccessToast(`Updated "${formData.name}" successfully.`);
      } else {
        await adminApi.createLocation(formData);
        setSuccessToast(`Created new location "${formData.name}"! Public map automatically updated.`);
      }
      setIsModalOpen(false);
      fetchLocations();
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save location.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (loc: LocationItem) => {
    const nextStatus = loc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApi.setLocationStatus(loc.id, nextStatus);
      fetchLocations();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleArchive = async (loc: LocationItem) => {
    if (!window.confirm(`Are you sure you want to archive "${loc.name}"? It will no longer appear on the public map or website.`)) {
      return;
    }
    try {
      await adminApi.deleteLocation(loc.id);
      fetchLocations();
      setSuccessToast(`Archived "${loc.name}".`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Archive failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xl animate-fade-in">
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Control Bar: Filters, Search, Add */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, summary, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button type="submit" className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold">
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Add Button */}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-md shadow-forest/30"
          >
            <Plus size={16} />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {/* Locations Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Name / Category</th>
                <th className="py-3 px-4">Coordinates (Map)</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-400" />
                    <span>Loading locations...</span>
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No locations match the filter criteria. Click "Add Location" to create one.
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id} className="table-row-hover">
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-400 font-semibold">
                      {loc.code}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{loc.name}</p>
                      {loc.kannadaName && <p className="text-[11px] text-slate-400">{loc.kannadaName}</p>}
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                        {loc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-mono text-slate-300">
                        <MapPin size={12} className="text-emerald-400 shrink-0" />
                        <span>{loc.coordinates.latitude.toFixed(4)}, {loc.coordinates.longitude.toFixed(4)}</span>
                      </div>
                      {loc.coordinates.elevationMeters && (
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Alt: {loc.coordinates.elevationMeters}m</p>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-300 text-[11px]">{loc.summary}</p>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(loc)}
                        title="Click to toggle status"
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          loc.status === 'ACTIVE'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                            : loc.status === 'DRAFT'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {loc.status}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(loc)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Edit Location"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleArchive(loc)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                          title="Archive Location"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Location */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingLocation ? `Edit Location: ${editingLocation.name}` : 'Add New Location to Pavagada Registry'}
                </h3>
                <p className="text-xs text-slate-400">
                  Data entered here will automatically update the public maps, search index, and cards.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveLocation} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kannada Name</label>
                  <input
                    type="text"
                    value={formData.kannadaName || ''}
                    onChange={(e) => setFormData({ ...formData, kannadaName: e.target.value })}
                    placeholder="e.g. ಪಾವಗಡ ಕೋಟೆ"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Published publicly)</option>
                    <option value="DRAFT">DRAFT (Hidden from public)</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Summary (1-2 sentences) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary || ''}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Geographic Coordinates for Map */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span>Public Map Coordinates</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Latitude (Decimal) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.coordinates?.latitude ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coordinates: {
                            ...(formData.coordinates || { longitude: 77.2798 }),
                            latitude: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Longitude (Decimal) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.coordinates?.longitude ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coordinates: {
                            ...(formData.coordinates || { latitude: 14.1025 }),
                            longitude: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Elevation (Meters)</label>
                    <input
                      type="number"
                      value={formData.coordinates?.elevationMeters ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coordinates: {
                            ...(formData.coordinates || { latitude: 14.1025, longitude: 77.2798 }),
                            elevationMeters: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                      placeholder="e.g. 846"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={formData.hours?.open ? `${formData.hours.open} – ${formData.hours.close}` : ''}
                    onChange={(e) => setFormData({ ...formData, hours: { ...(formData.hours || {}), open: e.target.value, close: '', days: 'Daily' } })}
                    placeholder="e.g. 06:00 AM – 06:00 PM"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact?.phone || ''}
                    onChange={(e) => setFormData({ ...formData, contact: { ...(formData.contact || {}), phone: e.target.value } })}
                    placeholder="e.g. 08136-244240"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pdfAuth"
                  checked={formData.isPdfAuthoritative || false}
                  onChange={(e) => setFormData({ ...formData, isPdfAuthoritative: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="pdfAuth" className="text-xs text-slate-300">
                  Verified from Primary Source / Archaeological Survey Document
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
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
                  className="px-5 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-forest/40 disabled:opacity-50"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingLocation ? 'Save Changes' : 'Publish Location'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

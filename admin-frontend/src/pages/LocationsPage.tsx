import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  MapPin,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Filter,
  RefreshCw,
  Sparkles,
  Building,
} from 'lucide-react';
import { adminApi } from '../services/api';
import { LocationItem, Category, DataFreshnessStats } from '../types';
import { MAIN_CATEGORIES_TAXONOMY } from '../data/categoryTaxonomy';
import { PlaceEntryModal } from '../components/forms/PlaceEntryModal';
import { PlaceDetailsModal } from '../components/common/PlaceDetailsModal';
import { QuickVerifyModal } from '../components/common/QuickVerifyModal';

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState('ALL');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedVerification, setSelectedVerification] = useState('ALL');
  const [filterNeedsVerification, setFilterNeedsVerification] = useState(false);

  // Freshness Stats
  const [freshnessStats, setFreshnessStats] = useState<DataFreshnessStats | null>(null);

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedLocationForEdit, setSelectedLocationForEdit] = useState<LocationItem | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLocationForView, setSelectedLocationForView] = useState<LocationItem | null>(null);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedLocationForVerify, setSelectedLocationForVerify] = useState<LocationItem | null>(null);

  // Toast feedback
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const [locsRes, freshRes] = await Promise.all([
        adminApi.getLocations({
          category: selectedCategory,
          subcategory: selectedSubcategory,
          area: selectedArea,
          status: selectedStatus,
          verification: selectedVerification,
          needsVerification: filterNeedsVerification,
          q: searchQuery,
          limit: 300,
        }),
        adminApi.getFreshnessStats().catch(() => null),
      ]);
      setLocations(locsRes.items || []);
      if (freshRes) setFreshnessStats(freshRes);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to load locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedArea,
    selectedStatus,
    selectedVerification,
    filterNeedsVerification,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLocations();
  };

  const handleOpenAdd = () => {
    setSelectedLocationForEdit(null);
    setIsEntryModalOpen(true);
  };

  const handleOpenEdit = (loc: LocationItem) => {
    setSelectedLocationForEdit(loc);
    setIsEntryModalOpen(true);
  };

  const handleOpenView = (loc: LocationItem) => {
    setSelectedLocationForView(loc);
    setIsDetailsModalOpen(true);
  };

  const handleOpenVerify = (loc: LocationItem) => {
    setSelectedLocationForVerify(loc);
    setIsVerifyModalOpen(true);
  };

  const handleDuplicate = async (loc: LocationItem) => {
    try {
      const duplicated = await adminApi.duplicateLocation(loc.id);
      showToast(`Duplicated "${loc.name}" as draft. Opening for edit...`);
      fetchLocations();
      setSelectedLocationForEdit(duplicated);
      setIsEntryModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to duplicate place', 'error');
    }
  };

  const handleArchive = async (loc: LocationItem) => {
    if (!window.confirm(`Are you sure you want to archive "${loc.name}"? It will be hidden from the public portal.`)) {
      return;
    }
    try {
      await adminApi.setLocationStatus(loc.id, 'ARCHIVED');
      showToast(`Archived "${loc.name}".`);
      fetchLocations();
    } catch (err: any) {
      showToast(err.message || 'Failed to archive place', 'error');
    }
  };

  // Subcategories available based on selected category
  const activeMainCatMeta = MAIN_CATEGORIES_TAXONOMY.find((c) => c.id === selectedCategory);
  const availableSubcategories = activeMainCatMeta?.subcategories || [];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : 'bg-rose-950 text-rose-300 border-rose-700'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle size={16} className="text-emerald-400" />
          ) : (
            <AlertCircle size={16} className="text-rose-400" />
          )}
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Building size={22} className="text-emerald-400" />
            <span>All Places & Civic Services CMS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Categorized content management system for Namma Pavagada: healthcare, transit, civic administration, schools, and essential trades.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchLocations}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh database records"
          >
            <RefreshCw size={15} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-light text-white text-xs font-bold rounded-xl shadow-lg shadow-forest/20 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>Add New Place / Service</span>
          </button>
        </div>
      </div>

      {/* Data Freshness Alert Banner (Section 29) */}
      {freshnessStats && freshnessStats.totalNeedingAttention > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-amber-200">
                  Data Freshness Advisory: Needs Verification
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  {freshnessStats.totalNeedingAttention} records
                </span>
              </div>
              <p className="text-[11px] text-amber-400/90 mt-0.5">
                {freshnessStats.staleRecords} records have not been verified for over 6 months, and{' '}
                {freshnessStats.pendingVerification} records are pending initial administrative check.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setFilterNeedsVerification(!filterNeedsVerification)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterNeedsVerification
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-amber-900/60 hover:bg-amber-900 text-amber-200 border border-amber-800'
              }`}
            >
              {filterNeedsVerification ? 'Show All Records' : 'Filter Unverified'}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl space-y-3">
        {/* Search Row */}
        <form onSubmit={handleSearch} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by official name, alias, tags (e.g. '24/7 hospital', 'hostel', 'UPI'), phone, or area..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory('ALL');
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Main Categories</option>
            {MAIN_CATEGORIES_TAXONOMY.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Subcategory Filter */}
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={selectedCategory === 'ALL' || availableSubcategories.length === 0}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
          >
            <option value="ALL">All Subcategories</option>
            {availableSubcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Area Filter */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Areas / Localities</option>
            <option value="Pavagada Town">Pavagada Town</option>
            <option value="Fort Area">Fort Area</option>
            <option value="Bus Stand Road">Bus Stand Road</option>
            <option value="Hospital Road">Hospital Road</option>
            <option value="Kyathaganacherlu">Kyathaganacherlu</option>
            <option value="Thirumani">Thirumani (Solar Park)</option>
            <option value="Y.N. Hosakote">Y.N. Hosakote</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Published (Live)</option>
            <option value="DRAFT">Draft</option>
            <option value="TEMPORARILY_CLOSED">Temporarily Closed</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Verification Filter */}
          <select
            value={selectedVerification}
            onChange={(e) => setSelectedVerification(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending Verification</option>
            <option value="NEEDS_REVERIFICATION">Needs Reverification</option>
            <option value="NOT_VERIFIED">Not Verified</option>
          </select>
        </div>
      </div>

      {/* Main Places Table View */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 size={28} className="animate-spin mx-auto mb-3 text-emerald-400" />
          <span className="text-xs">Loading categorized places and civic services...</span>
        </div>
      ) : locations.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <Building size={32} className="mx-auto text-slate-600 mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">No Places Matching Filter</h4>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            Try adjusting your search query, main category, or verification filters.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-forest hover:bg-forest-light text-white text-xs font-bold rounded-xl transition-colors"
          >
            + Add New Place Now
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Place / Service Name</th>
                  <th className="py-3 px-4">Category & Type</th>
                  <th className="py-3 px-4">Area / Locality</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Discovery Tags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {locations.map((loc) => {
                  const isVerified = loc.verification?.status === 'VERIFIED';
                  const isFresh = loc.verification?.isFresh !== false;
                  return (
                    <tr
                      key={loc.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => handleOpenView(loc)}
                    >
                      {/* Name & Kannada Title */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">
                            {loc.code}
                          </span>
                          <span>{loc.name}</span>
                        </div>
                        {loc.kannadaName && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{loc.kannadaName}</div>
                        )}
                      </td>

                      {/* Category & Subcategory */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {(loc.subcategory
                            ? loc.subcategory.split(',').map((s) => s.trim()).filter(Boolean)
                            : [loc.category]
                          ).map((sub) => (
                            <span
                              key={sub}
                              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Area */}
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-500" />
                          <span>{loc.area || 'Pavagada Town'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            loc.status === 'DRAFT'
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : loc.status === 'TEMPORARILY_CLOSED'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : loc.status === 'ARCHIVED'
                              ? 'bg-slate-900 text-slate-500 border-slate-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {loc.status}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isVerified && isFresh
                                ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                                : isVerified && !isFresh
                                ? 'bg-amber-400 shadow-sm shadow-amber-400'
                                : 'bg-slate-500'
                            }`}
                          />
                          <span
                            className={`font-semibold text-[11px] ${
                              isVerified ? 'text-emerald-300' : 'text-slate-400'
                            }`}
                          >
                            {loc.verification?.status || 'PENDING'}
                          </span>
                        </div>
                        {loc.verification?.lastVerifiedAt && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(loc.verification.lastVerifiedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                        )}
                      </td>

                      {/* Tags */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(loc.tags || []).slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400"
                            >
                              {t}
                            </span>
                          ))}
                          {(loc.tags || []).length > 3 && (
                            <span className="text-[10px] text-slate-500">
                              +{(loc.tags || []).length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenView(loc)}
                            title="View details"
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(loc)}
                            title="Edit place"
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenVerify(loc)}
                            title="Quick verify"
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            <ShieldCheck size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(loc)}
                            title="Duplicate as draft"
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Copy size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleArchive(loc)}
                            title="Archive record"
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 px-4">
            <span>
              Showing <strong className="text-white">{locations.length}</strong> records
            </span>
            <span>Namma Pavagada Verified Directory CMS</span>
          </div>
        </div>
      )}

      {/* 10-Step Creation & Editing Modal */}
      <PlaceEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        initialData={selectedLocationForEdit}
        onSaved={(saved) => {
          showToast(`Successfully saved "${saved.name}".`);
          fetchLocations();
        }}
      />

      {/* View Details Modal */}
      <PlaceDetailsModal
        isOpen={isDetailsModalOpen}
        location={selectedLocationForView}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={(loc) => {
          setSelectedLocationForEdit(loc);
          setIsEntryModalOpen(true);
        }}
        onVerify={(loc) => {
          setSelectedLocationForVerify(loc);
          setIsVerifyModalOpen(true);
        }}
      />

      {/* 1-Click Verification Modal */}
      <QuickVerifyModal
        isOpen={isVerifyModalOpen}
        location={selectedLocationForVerify}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerified={(updated) => {
          showToast(`Updated verification for "${updated.name}".`);
          fetchLocations();
        }}
      />
    </div>
  );
};

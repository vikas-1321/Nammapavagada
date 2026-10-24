import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Trash2,
  Save,
  RotateCw,
  Calendar,
  Building,
  Bus,
  MapPin,
  User,
  Mail,
  Shield,
  FileText,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../services/api';
import {
  FeedbackItem,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackListResponse,
} from '../types';

export const FeedbackPage: React.FC = () => {
  const [data, setData] = useState<FeedbackListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination state
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  // Detail Modal / Active Item state
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getFeedback({
        page,
        limit: 15,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setData(res);

      // If an active feedback item is currently viewed in detail, update its state
      if (selectedFeedback) {
        const updatedCurrent = res.items.find((i) => i.id === selectedFeedback.id);
        if (updatedCurrent) {
          setSelectedFeedback(updatedCurrent);
          setEditingNotes(updatedCurrent.adminNotes || '');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch feedback records.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, categoryFilter, searchQuery, selectedFeedback?.id]);

  useEffect(() => {
    fetchFeedback();
  }, [page, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFeedback();
  };

  const handleOpenDetail = (item: FeedbackItem) => {
    setSelectedFeedback(item);
    setEditingNotes(item.adminNotes || '');
    setActionSuccess(null);
  };

  const handleCloseDetail = () => {
    setSelectedFeedback(null);
    setActionSuccess(null);
  };

  const handleStatusChange = async (newStatus: FeedbackStatus) => {
    if (!selectedFeedback) return;
    setIsUpdating(true);
    setActionSuccess(null);
    try {
      const updated = await adminApi.updateFeedback(selectedFeedback.id, {
        status: newStatus,
        adminNotes: editingNotes,
      });
      setSelectedFeedback(updated);
      setActionSuccess(`Status successfully changed to ${updated.statusLabel}.`);
      fetchFeedback();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update feedback status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedFeedback) return;
    setIsUpdating(true);
    setActionSuccess(null);
    try {
      const updated = await adminApi.updateFeedback(selectedFeedback.id, {
        adminNotes: editingNotes,
      });
      setSelectedFeedback(updated);
      setActionSuccess('Internal administrator notes saved.');
      fetchFeedback();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save notes.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this feedback entry?')) {
      return;
    }
    try {
      await adminApi.deleteFeedback(id);
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
      fetchFeedback();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete feedback entry.');
    }
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <AlertTriangle size={12} />
            Under Review
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 size={12} />
            Resolved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryBadge = (category: FeedbackCategory) => {
    switch (category) {
      case 'INCORRECT_INFO':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/40 text-rose-300 border border-rose-800/40">
            Incorrect Information
          </span>
        );
      case 'MISSING_PLACE_OR_SERVICE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/40">
            Missing Place / Service
          </span>
        );
      case 'WEBSITE_BUG':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-950/40 text-purple-300 border border-purple-800/40">
            Website Bug
          </span>
        );
      case 'SUGGESTION':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
            Suggestion
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            General Feedback
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Submissions</span>
            <MessageSquare size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {data?.counts.total ?? '—'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Action</span>
            <Clock size={16} />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            {data?.counts.pending ?? '—'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider">Under Review</span>
            <AlertTriangle size={16} />
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-2">
            {data?.counts.underReview ?? '—'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {data?.counts.resolved ?? '—'}
          </div>
        </div>
      </div>

      {/* Control Bar: Status Tabs & Search/Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'ALL', label: 'All Feedback', count: data?.counts.total },
            { id: 'PENDING', label: 'Pending', count: data?.counts.pending },
            { id: 'UNDER_REVIEW', label: 'Under Review', count: data?.counts.underReview },
            { id: 'RESOLVED', label: 'Resolved', count: data?.counts.resolved },
            { id: 'REJECTED', label: 'Rejected', count: data?.counts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search bar & Category dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, submitter name, email, or listing..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="INCORRECT_INFO">Incorrect Information</option>
              <option value="GENERAL">General Feedback</option>
              <option value="MISSING_PLACE_OR_SERVICE">Missing Place / Service</option>
              <option value="WEBSITE_BUG">Website Bug</option>
              <option value="SUGGESTION">Suggestion</option>
              <option value="OTHER">Other</option>
            </select>

            <button
              onClick={() => {
                setPage(1);
                fetchFeedback();
              }}
              className="p-2 rounded-lg border border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Refresh feedback list"
            >
              <RotateCw size={15} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table / Card List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading && !data ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RotateCw size={24} className="animate-spin text-emerald-400 mx-auto mb-3" />
            Loading visitor feedback...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 text-xs">
            <AlertTriangle size={24} className="mx-auto mb-2 text-rose-500" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchFeedback}
              className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        ) : data?.items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-2">
            <MessageSquare size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">No feedback submissions found</p>
            <p className="text-xs text-slate-500">
              There are no feedback records matching the selected status or query filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Feedback Content</th>
                  <th className="py-3 px-4">Submitter</th>
                  <th className="py-3 px-4">Page / Associated Entity</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {data?.items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getCategoryBadge(item.category)}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <p className="line-clamp-2 text-slate-200 font-medium leading-relaxed">
                        {item.message}
                      </p>
                      {item.adminNotes && (
                        <p className="mt-1 text-[11px] text-emerald-400/90 italic flex items-center gap-1">
                          <FileText size={10} />
                          <span className="line-clamp-1">Note: {item.adminNotes}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.name || item.email ? (
                        <div className="space-y-0.5">
                          {item.name && (
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <User size={12} className="text-slate-400" />
                              <span>{item.name}</span>
                            </div>
                          )}
                          {item.email && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <Mail size={11} className="text-slate-500" />
                              <span>{item.email}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Anonymous Visitor</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {item.relatedEntityName ? (
                        <div className="space-y-0.5">
                          <div className="font-medium text-emerald-300 flex items-center gap-1">
                            {item.relatedEntityType === 'BUS_ROUTE' ? (
                              <Bus size={12} className="text-amber-400 shrink-0" />
                            ) : (
                              <Building size={12} className="text-emerald-400 shrink-0" />
                            )}
                            <span className="truncate">{item.relatedEntityName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {item.pagePath}
                          </div>
                        </div>
                      ) : (
                        <span className="font-mono text-slate-400 text-[11px]">
                          {item.pagePath || '/'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenDetail(item)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium mr-2 transition-colors cursor-pointer"
                      >
                        Review
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Delete feedback entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data && data.pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
            <div>
              Showing page <strong className="text-white">{data.pagination.page}</strong> of{' '}
              <strong className="text-white">{data.pagination.pages}</strong> ({data.pagination.total} total items)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= data.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail & Action Slide-Over Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDetail();
          }}
        >
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Feedback Details
                    <span className="font-mono text-xs font-normal text-slate-400">
                      ({selectedFeedback.id})
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Submitted on{' '}
                    {new Date(selectedFeedback.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(selectedFeedback.status)}
                <button
                  onClick={handleCloseDetail}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              {actionSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Submitter & Category Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Feedback Category
                  </span>
                  <div>{getCategoryBadge(selectedFeedback.category)}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Submitter Information
                  </span>
                  <div className="text-slate-200 font-medium">
                    {selectedFeedback.name || 'Anonymous Visitor'}
                  </div>
                  {selectedFeedback.email && (
                    <a
                      href={`mailto:${selectedFeedback.email}`}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Mail size={11} />
                      <span>{selectedFeedback.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Related Entity (if associated) */}
              {selectedFeedback.relatedEntityName && (
                <div className="p-3.5 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 block">
                    Associated Listing / Timetable
                  </span>
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    {selectedFeedback.relatedEntityType === 'BUS_ROUTE' ? (
                      <Bus size={15} className="text-amber-400" />
                    ) : (
                      <Building size={15} className="text-emerald-400" />
                    )}
                    <span>{selectedFeedback.relatedEntityName}</span>
                    <span className="text-xs font-mono font-normal text-slate-400">
                      [{selectedFeedback.relatedEntityType}]
                    </span>
                  </div>
                </div>
              )}

              {/* Feedback Content */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Visitor Message Content
                </span>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap select-text">
                  {selectedFeedback.message}
                </div>
              </div>

              {/* Origin Page Path & Diagnostics */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-500" />
                  <span>
                    Origin Page: <strong className="text-slate-200 font-mono">{selectedFeedback.pagePath}</strong>
                  </span>
                </div>

                <a
                  href={`http://localhost:5173${selectedFeedback.pagePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-medium"
                >
                  <span>Open Page on Website</span>
                  <ExternalLink size={11} />
                </a>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Update Resolution Status
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={isUpdating || selectedFeedback.status === 'UNDER_REVIEW'}
                    onClick={() => handleStatusChange('UNDER_REVIEW')}
                    className="px-3 py-1.5 rounded-lg border border-blue-800 bg-blue-950/40 text-blue-300 hover:bg-blue-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    <AlertTriangle size={13} />
                    Mark Under Review
                  </button>

                  <button
                    disabled={isUpdating || selectedFeedback.status === 'RESOLVED'}
                    onClick={() => handleStatusChange('RESOLVED')}
                    className="px-3 py-1.5 rounded-lg border border-emerald-800 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    <CheckCircle2 size={13} />
                    Mark Resolved
                  </button>

                  <button
                    disabled={isUpdating || selectedFeedback.status === 'REJECTED'}
                    onClick={() => handleStatusChange('REJECTED')}
                    className="px-3 py-1.5 rounded-lg border border-rose-800 bg-rose-950/40 text-rose-300 hover:bg-rose-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    <XCircle size={13} />
                    Mark Rejected
                  </button>

                  {selectedFeedback.status !== 'PENDING' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleStatusChange('PENDING')}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <Clock size={13} />
                      Reset to Pending
                    </button>
                  )}
                </div>
              </div>

              {/* Private Internal Notes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Internal Administrator Notes (Private)
                  </span>
                  <span className="text-[10px] text-slate-500 italic">
                    Never exposed to the public
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Record steps taken, source verification notes, or reason for resolution/rejection..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <div className="flex justify-end">
                  <button
                    disabled={isUpdating}
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={13} />
                    <span>Save Internal Notes</span>
                  </button>
                </div>
              </div>

              {/* Diagnostics */}
              {(selectedFeedback.ipAddress || selectedFeedback.userAgent) && (
                <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800/80 font-mono space-y-0.5">
                  {selectedFeedback.ipAddress && <div>IP: {selectedFeedback.ipAddress}</div>}
                  {selectedFeedback.userAgent && (
                    <div className="truncate">User Agent: {selectedFeedback.userAgent}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

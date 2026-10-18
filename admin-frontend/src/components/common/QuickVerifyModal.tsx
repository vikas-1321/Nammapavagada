import React, { useState } from 'react';
import { X, ShieldCheck, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../services/api';
import { LocationItem, VerificationStatus, VerificationSource } from '../../types';

interface QuickVerifyModalProps {
  isOpen: boolean;
  location: LocationItem | null;
  onClose: () => void;
  onVerified: (updated: LocationItem) => void;
}

const SOURCES: VerificationSource[] = [
  'Official Website',
  'Official Office',
  'Staff / Manager',
  'Phone Verification',
  'Physical Visit',
  'User Submitted',
  'Other',
];

export const QuickVerifyModal: React.FC<QuickVerifyModalProps> = ({
  isOpen,
  location,
  onClose,
  onVerified,
}) => {
  if (!isOpen || !location) return null;

  const [status, setStatus] = useState<VerificationStatus>('VERIFIED');
  const [source, setSource] = useState<string>(
    location.verification?.source || 'Phone Verification'
  );
  const [notes, setNotes] = useState<string>(
    location.verification?.notes || ''
  );
  const [verifiedBy, setVerifiedBy] = useState<string>('Taluk Administrator');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await adminApi.verifyLocation(location.id, {
        status,
        source,
        verifiedBy,
        notes,
      });
      onVerified(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update verification status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shadow-md">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Verify Place Record</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{location.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">Verification Outcome</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'VERIFIED', label: 'Verified (Active & True)' },
                  { id: 'PENDING', label: 'Pending Verification' },
                  { id: 'NEEDS_REVERIFICATION', label: 'Needs Reverification' },
                  { id: 'NOT_VERIFIED', label: 'Not Verified' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatus(opt.id)}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                    status === opt.id
                      ? opt.id === 'VERIFIED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : 'bg-amber-950 text-amber-300 border-amber-600'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">Information Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">Verified By</label>
            <input
              type="text"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
              placeholder="Your name / Administrative title"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">Audit Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Contacted facility desk and verified current OPD hours and casualty availability."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white font-bold transition-all shadow-md shadow-forest/20"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              <span>Save Verification</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

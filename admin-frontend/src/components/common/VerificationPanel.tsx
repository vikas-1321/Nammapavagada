import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  UserCheck,
  Calendar,
  FileCheck,
} from 'lucide-react';
import { VerificationInfo, VerificationStatus, VerificationSource } from '../../types';

interface VerificationPanelProps {
  value?: VerificationInfo;
  onChange: (value: VerificationInfo) => void;
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

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  value = { status: 'PENDING' },
  onChange,
}) => {
  const status = value.status || 'PENDING';
  const lastVerifiedAt = value.lastVerifiedAt;
  const isFresh = value.isFresh;

  const updateField = (field: keyof VerificationInfo, val: any) => {
    onChange({ ...value, [field]: val });
  };

  const markVerifiedNow = () => {
    onChange({
      ...value,
      status: 'VERIFIED',
      lastVerifiedAt: new Date().toISOString(),
      isFresh: true,
    });
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Data Verification & Freshness Audit</span>
          </h4>
          <p className="text-[11px] text-slate-500">
            Accountability and freshness guarantee for citizen published information.
          </p>
        </div>

        <button
          type="button"
          onClick={markVerifiedNow}
          className="self-start px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <FileCheck size={13} />
          <span>Verify as Current Now</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Verification Status */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Verification Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'VERIFIED', label: 'Verified', color: 'emerald' },
                { id: 'PENDING', label: 'Pending Verification', color: 'amber' },
                { id: 'NEEDS_REVERIFICATION', label: 'Needs Reverification', color: 'rose' },
                { id: 'NOT_VERIFIED', label: 'Not Verified', color: 'slate' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateField('status', opt.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                  status === opt.id
                    ? opt.color === 'emerald'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-md'
                      : opt.color === 'amber'
                      ? 'bg-amber-950 text-amber-300 border-amber-600 shadow-md'
                      : opt.color === 'rose'
                      ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-md'
                      : 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Source of Information */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Information Source
          </label>
          <select
            value={value.source || 'Official Website'}
            onChange={(e) => updateField('source', e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <p className="text-[10px] text-slate-500">
            Indicates how this data was verified (e.g. Taluk office visit, phone call with officer).
          </p>
        </div>
      </div>

      {/* Verified By & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Verified By (Editor Name / ID)
          </label>
          <input
            type="text"
            value={value.verifiedBy || ''}
            onChange={(e) => updateField('verifiedBy', e.target.value)}
            placeholder="e.g. Chief Editor / Field Officer Pavagada"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Last Verified Timestamp
          </label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <Calendar size={13} className="text-slate-500" />
            <span>
              {lastVerifiedAt
                ? new Date(lastVerifiedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Never verified'}
            </span>
            {isFresh === false && lastVerifiedAt && (
              <span className="text-[10px] text-amber-400 ml-auto font-medium">
                (Older than 6 months)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verification Notes */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
          Verification Audit Notes
        </label>
        <textarea
          rows={2}
          value={value.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="e.g. Confirmed ICU and snakebite antivenom availability with Hospital Superintendent on phone..."
          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
};

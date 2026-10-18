import React from 'react';
import { PlaceStatus } from '../../types';

interface StatusSelectorProps {
  value: PlaceStatus;
  onChange: (status: PlaceStatus) => void;
}

const STATUS_OPTIONS: Array<{
  id: PlaceStatus;
  label: string;
  badge: string;
  description: string;
}> = [
  {
    id: 'DRAFT',
    label: 'Draft',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    description: 'Hidden from public portal. Saved for administrative curation and incomplete entry.',
  },
  {
    id: 'PUBLISHED',
    label: 'Published',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    description: 'Active and immediately visible on public website, category pages, search, and map.',
  },
  {
    id: 'TEMPORARILY_CLOSED',
    label: 'Temporarily Closed',
    badge: 'bg-amber-950 text-amber-300 border-amber-700',
    description: 'Shown with temporary closure notice (renovations, seasonal, emergency).',
  },
  {
    id: 'INACTIVE',
    label: 'Inactive',
    badge: 'bg-rose-950/70 text-rose-300 border-rose-800',
    description: 'Permanently shut down or discontinued service. Retained for historical directory.',
  },
  {
    id: 'ARCHIVED',
    label: 'Archived',
    badge: 'bg-slate-900 text-slate-400 border-slate-800',
    description: 'Retired record hidden from public website, kept strictly for municipal archival.',
  },
];

export const StatusSelector: React.FC<StatusSelectorProps> = ({ value, onChange }) => {
  const current = value === 'ACTIVE' ? 'PUBLISHED' : value;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-300">
        Publication & Operational Status <span className="text-rose-400 font-bold">*</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = current === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-lg ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${opt.badge}`}>
                  {opt.label}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

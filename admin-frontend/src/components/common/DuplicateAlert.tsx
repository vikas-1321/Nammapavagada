import React from 'react';
import { AlertTriangle, ExternalLink, ArrowRight } from 'lucide-react';
import { DuplicateCandidate } from '../../types';

interface DuplicateAlertProps {
  candidates: DuplicateCandidate[];
  onDismiss: () => void;
  onViewCandidate: (candidateId: string) => void;
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({
  candidates,
  onDismiss,
  onViewCandidate,
}) => {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 space-y-3 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60 shrink-0">
          <AlertTriangle size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-amber-200">
            Possible Duplicate Places Detected
          </h4>
          <p className="text-[11px] text-amber-400/90 mt-0.5">
            We found {candidates.length} existing record{candidates.length > 1 ? 's' : ''} with
            a matching name or locality. Review to avoid creating redundant entries:
          </p>

          <div className="mt-2.5 divide-y divide-amber-900/40 border border-amber-900/60 rounded-xl overflow-hidden bg-slate-950/60">
            {candidates.map((c) => (
              <div
                key={c.id}
                className="p-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">{c.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-mono">
                      {c.similarity}% match
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {c.area} &bull; {c.subcategory || c.category} &bull; {c.address}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onViewCandidate(c.id)}
                  className="px-2 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-200 text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors border border-amber-800/60"
                >
                  <span>View</span>
                  <ExternalLink size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-900/40">
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-1.5 rounded-lg bg-amber-900/50 hover:bg-amber-900 text-amber-200 text-xs font-semibold transition-colors"
        >
          Continue Anyway (Not a Duplicate)
        </button>
      </div>
    </div>
  );
};

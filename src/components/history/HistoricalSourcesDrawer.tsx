import React from 'react';
import { AcademicCitation } from '../../types/history';

export interface HistoricalSourcesDrawerProps {
  citations: AcademicCitation[];
}

export const HistoricalSourcesDrawer: React.FC<HistoricalSourcesDrawerProps> = ({ citations }) => {
  return (
    <div className="bg-white border border-soft-sand rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
      <div className="border-b border-soft-sand pb-4">
        <span className="text-[11px] uppercase font-bold tracking-wider bg-forest-green text-white px-3 py-1 rounded-full shadow-sm">
          Research Bibliography & Verification Records
        </span>
        <h3 className="text-2xl font-serif font-bold text-forest-green mt-3">
          Authoritative Primary & Secondary Citations
        </h3>
        <p className="text-sm text-muted-text mt-1 max-w-3xl leading-relaxed">
          All historical narratives, fort architectural dimensions, ruler chronologies, and megalithic findings
          are directly cross-referenced from peer-reviewed architectural papers, regional gazetteers, and epigraphical surveys.
        </p>
      </div>

      <div className="divide-y divide-soft-sand/70">
        {citations.map((cite, index) => (
          <div key={cite.id} className="py-4 space-y-1 hover:bg-warm-cream/30 px-3 rounded-xl transition-colors">
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs font-bold bg-soft-sand text-forest-green px-2 py-0.5 rounded shrink-0 mt-0.5">
                [{String(index + 1).padStart(2, '0')}]
              </span>
              <div>
                <h4 className="text-base font-serif font-bold text-forest-green">
                  {cite.title}
                </h4>
                <div className="text-xs text-muted-text mt-1">
                  <span className="font-semibold text-dark-text">{cite.authors}</span> ({cite.year}).{' '}
                  <em className="text-earth-brown">{cite.publication}</em>.
                  {cite.isbnOrDoi && (
                    <span className="ml-2 font-mono text-terracotta font-bold">[{cite.isbnOrDoi}]</span>
                  )}
                </div>
                <p className="text-xs text-dark-text/80 pt-1.5 leading-relaxed font-sans">
                  {cite.notes}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

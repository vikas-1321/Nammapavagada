import React, { useState } from 'react';
import { FortStructureItem } from '../../types/history';

export interface FortArchitectureAtlasProps {
  structures: FortStructureItem[];
}

export const FortArchitectureAtlas: React.FC<FortArchitectureAtlasProps> = ({ structures }) => {
  const [filter, setFilter] = useState<'ALL' | 'DEFENSE' | 'RELIGIOUS' | 'ROYAL'>('ALL');

  const filtered = filter === 'ALL'
    ? structures
    : structures.filter(s => s.classification === filter);

  return (
    <div className="space-y-8">
      {/* Introduction Banner: The 7 Enclosures & Engineering Principles */}
      <div className="bg-forest-green text-warm-cream rounded-2xl p-6 md:p-8 border border-forest-green-dark shadow-md">
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 lg:col-span-8 space-y-3">
            <span className="text-[11px] uppercase tracking-widest font-bold text-terracotta-light block">
              Fort Anatomy & Military Engineering
            </span>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              The Seven Concentric Enclosures of Pavagada Fort
            </h3>
            <p className="text-sm md:text-base text-soft-sand leading-relaxed font-sans">
              Pavagada Fort was constructed adopting principles found in post-Vijayanagara fortifications (Chitradurga, Penukonda, and Madhugiri).
              The fort incorporates <strong>seven distinct enclosures</strong>—the first two surrounding the lower civil settlement and five wrapping around the granite hill up to the apex citadel.
              Locally sourced granite blocks with high thermal mass maintain internal stability, while sloping wall profiles were calibrated to deflect cannon shot and withstand prolonged artillery sieges.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-forest-green-light pt-4 lg:pt-0 lg:pl-6 space-y-2.5 font-mono text-xs text-soft-sand">
            <div className="flex justify-between border-b border-forest-green-light pb-2">
              <span className="text-soft-sand/70">Total Enclosures:</span>
              <strong className="text-white">7 Rings</strong>
            </div>
            <div className="flex justify-between border-b border-forest-green-light pb-2">
              <span className="text-soft-sand/70">Hill Enclosures:</span>
              <strong className="text-white">5 Enclosures</strong>
            </div>
            <div className="flex justify-between border-b border-forest-green-light pb-2">
              <span className="text-soft-sand/70">Settlement Enclosures:</span>
              <strong className="text-white">2 Enclosures</strong>
            </div>
            <div className="flex justify-between border-b border-forest-green-light pb-2">
              <span className="text-soft-sand/70">Designed Gateways:</span>
              <strong className="text-white">10 Gates (7 Extant)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-soft-sand/70">Apex Bastion Circumference:</span>
              <strong className="text-white">100 Feet Bastion</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Classification Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-soft-sand pb-4">
        <div className="text-xs uppercase tracking-wider font-bold text-forest-green">
          Filter by Structure Classification
        </div>
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'DEFENSE', 'RELIGIOUS', 'ROYAL'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-150 shadow-sm ${
                filter === tab
                  ? 'bg-forest-green text-white border-forest-green shadow-md'
                  : 'bg-white text-dark-text border-soft-sand hover:bg-warm-cream'
              }`}
            >
              {tab === 'ALL' ? 'All Structures' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Structure Grid */}
      <div className="grid grid-cols-12 gap-6">
        {filtered.map(item => (
          <div
            key={item.id}
            className="col-span-12 md:col-span-6 bg-white border border-soft-sand rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-soft-sand pb-3 mb-3">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                  item.classification === 'DEFENSE'
                    ? 'bg-earth-brown text-white'
                    : item.classification === 'RELIGIOUS'
                    ? 'bg-forest-green text-white'
                    : 'bg-terracotta text-white'
                }`}>
                  {item.classification}
                </span>
                <span className="text-xs font-mono text-muted-text">
                  {item.historicalPeriod}
                </span>
              </div>

              <h4 className="text-xl font-serif font-bold text-forest-green mb-1">
                {item.name}
              </h4>
              {item.kannadaName && (
                <p className="text-sm font-kannada text-earth-brown mb-3">{item.kannadaName}</p>
              )}

              {item.builder && (
                <div className="text-xs font-medium text-dark-text mb-3 bg-warm-cream/50 p-2.5 rounded-lg border border-soft-sand/60">
                  <span className="text-muted-text uppercase tracking-wider text-[11px] block">Patron / Builder:</span>
                  <span className="font-semibold text-forest-green">{item.builder}</span>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <span className="text-[11px] uppercase tracking-wider font-bold text-forest-green block">
                  Architectural & Structural Highlights:
                </span>
                <ul className="space-y-1.5 text-xs text-dark-text">
                  {item.architecturalHighlights.map((hl, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-terracotta shrink-0 font-bold">●</span>
                      <span className="leading-relaxed">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-soft-sand pt-4 space-y-2 mt-4 text-xs">
              <div>
                <span className="font-bold text-muted-text uppercase block text-[11px]">Current Physical State:</span>
                <span className="text-dark-text font-medium">{item.currentCondition}</span>
              </div>
              <div className="bg-warm-cream p-3 rounded-xl border border-soft-sand">
                <span className="font-bold text-terracotta uppercase block text-[11px] mb-0.5">
                  Conservation Appraisal:
                </span>
                <span className="text-dark-text">{item.conservationAction}</span>
              </div>
              <div className="text-[11px] text-muted-text font-mono pt-1">
                Ref: {item.sourceReference}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

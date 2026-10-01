import React, { useState } from 'react';
import { HistoricalEra } from '../../types/history';

export interface HistoricalTimelineProps {
  eras: HistoricalEra[];
}

export const HistoricalTimeline: React.FC<HistoricalTimelineProps> = ({ eras }) => {
  const [activeEraId, setActiveEraId] = useState<string>(eras[0]?.id || '');
  const activeEra = eras.find(e => e.id === activeEraId) || eras[0];

  return (
    <div className="space-y-8">
      {/* Era Navigation Track (Warm horizontal scroll) */}
      <div className="bg-white border border-soft-sand rounded-2xl p-2.5 shadow-sm overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {eras.map((era, index) => {
            const isActive = era.id === activeEraId;
            return (
              <button
                key={era.id}
                type="button"
                onClick={() => setActiveEraId(era.id)}
                className={`text-left px-4 py-3 rounded-xl border transition-all duration-150 font-sans ${
                  isActive
                    ? 'bg-forest-green text-white border-forest-green shadow-sm'
                    : 'bg-warm-cream/40 text-dark-text border-soft-sand hover:bg-soft-sand hover:border-forest-green/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-terracotta text-white' : 'bg-soft-sand text-forest-green'
                  }`}>
                    0{index + 1}
                  </span>
                  <span className={`text-xs uppercase tracking-wider font-semibold ${
                    isActive ? 'text-soft-sand' : 'text-muted-text'
                  }`}>
                    {era.timeRange}
                  </span>
                </div>
                <div className="text-sm font-serif font-bold truncate max-w-[220px]">
                  {era.eraName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Era Exposition Box (12-Column Grid) */}
      {activeEra && (
        <div className="bg-white border border-soft-sand rounded-2xl p-6 md:p-10 shadow-sm">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Metadata & Leadership */}
            <div className="col-span-12 lg:col-span-4 border-b lg:border-b-0 lg:border-r border-soft-sand pb-6 lg:pb-0 lg:pr-8 space-y-6">
              <div>
                <span className="inline-block text-[11px] uppercase tracking-wider font-bold bg-earth-brown text-white px-3 py-1 rounded-full mb-3 shadow-sm">
                  Chronological Epoch
                </span>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-forest-green tracking-tight">
                  {activeEra.eraName}
                </h3>
                {activeEra.kannadaTitle && (
                  <p className="text-base font-kannada text-earth-brown mt-1">
                    {activeEra.kannadaTitle}
                  </p>
                )}
                <div className="font-mono text-sm font-bold text-terracotta mt-2">
                  {activeEra.timeRange}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-forest-green mb-2.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
                  <span>Documented Rulers & Governors</span>
                </h4>
                <ul className="space-y-2 text-sm font-medium text-dark-text">
                  {activeEra.primaryRulers.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 bg-warm-cream/50 px-3 py-1.5 rounded-lg border border-soft-sand/60">
                      <span className="text-terracotta">●</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-warm-cream/70 p-4 rounded-xl border border-soft-sand text-xs text-muted-text">
                <span className="font-bold text-forest-green uppercase block mb-1">
                  Primary Source Record:
                </span>
                {activeEra.pdfEvidence}
              </div>
            </div>

            {/* Right Column: Historical Narrative & Key Milestones */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-forest-green mb-2.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
                  <span>Historical Account & Context</span>
                </h4>
                <p className="text-base text-dark-text leading-relaxed font-sans">
                  {activeEra.summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-forest-green mb-3.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
                  <span>Documented Historical Events</span>
                </h4>
                <div className="space-y-3">
                  {activeEra.keyEvents.map((evt, idx) => (
                    <div
                      key={idx}
                      className="border border-soft-sand rounded-xl p-4 bg-warm-cream/30 hover:bg-warm-cream/60 transition-colors flex items-start gap-3.5 shadow-sm"
                    >
                      <span className="font-mono text-xs font-bold bg-forest-green text-white px-2 py-0.5 rounded shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-dark-text leading-relaxed">
                        {evt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

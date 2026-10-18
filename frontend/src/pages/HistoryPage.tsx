import React, { useState, useEffect } from 'react';
import { historyService } from '../services/historyService';
import { HistoricalTimeline } from '../components/history/HistoricalTimeline';
import { FortArchitectureAtlas } from '../components/history/FortArchitectureAtlas';
import { MegalithicHeritageView } from '../components/history/MegalithicHeritageView';
import { HistoricalEra, FortStructureItem } from '../types/history';
import { X } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'FORT_ANATOMY' | 'MEGALITHIC'>('TIMELINE');
  const [selectedEra, setSelectedEra] = useState<HistoricalEra | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<FortStructureItem | null>(null);

  const eras = historyService.getAllEras();
  const fortStructures = historyService.getFortStructures();
  const megalithicSites = historyService.getMegalithicSites();

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedEra(null);
        setSelectedStructure(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-6 py-6 md:py-8 animate-fadeIn">
      {/* Compact Editorial Header matching Community Page (Low Space Occupancy, No Description) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-3 border-b border-soft-sand">
        {/* Left Side: Eyebrow + Title + Counts (No Description Paragraph) */}
        <div className="space-y-1.5">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold tracking-wider text-slate-500 uppercase">
            <span className="text-slate-400">—</span>
            <span>HERITAGE ARCHIVE · FIELD NOTES 01</span>
          </div>

          {/* Main Title */}
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-dark-text tracking-tight">
              Explore the layers of the past
            </h1>
            <span className="font-kannada text-sm md:text-base text-earth-brown font-medium">
              ಪಾವಗಡ ಐತಿಹಾಸಿಕ ವಿವರಣಾತ್ಮಕ ಕೋಶ
            </span>
          </div>

          {/* Subtitle / Counts */}
          <p className="text-sm md:text-base text-slate-600 font-sans">
            <span className="font-medium text-slate-800">{eras.length} epochs</span>
            <span className="mx-2 text-slate-300">·</span>
            <span>{fortStructures.length} fort structures</span>
            <span className="mx-2 text-slate-300">·</span>
            <span>{megalithicSites.length} megalithic sites</span>
            <span className="hidden sm:inline text-slate-500 ml-2">across Pavagada history</span>
          </p>
        </div>

        {/* Right Side: Collection Navigation Switcher kept aside */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {[
            { id: 'TIMELINE', label: 'Timeline', count: eras.length },
            { id: 'FORT_ANATOMY', label: 'Fort Atlas', count: fortStructures.length },
            { id: 'MEGALITHIC', label: 'Megalithic', count: megalithicSites.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs md:text-sm font-semibold px-4 py-2 rounded-full border transition-all duration-150 shadow-2xs flex items-center gap-2 cursor-pointer ${isActive
                  ? 'bg-terracotta text-white border-terracotta shadow-xs'
                  : 'bg-white text-dark-text border-slate-200 hover:bg-warm-cream'
                  }`}
                aria-pressed={isActive}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-soft-sand text-forest-green'
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content Panel */}
      <section className="pt-2">
        {activeTab === 'TIMELINE' && (
          <HistoricalTimeline
            eras={eras}
            onSelectEra={(era) => setSelectedEra(era)}
          />
        )}

        {activeTab === 'FORT_ANATOMY' && (
          <FortArchitectureAtlas
            structures={fortStructures}
            onSelectStructure={(structure) => setSelectedStructure(structure)}
          />
        )}

        {activeTab === 'MEGALITHIC' && (
          <MegalithicHeritageView sites={megalithicSites} />
        )}
      </section>

      {/* MODAL: HISTORICAL ERA DETAIL DOSSIER */}
      {selectedEra && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-text/70 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-soft-sand shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-soft-sand pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-terracotta">
                  {selectedEra.timeRange}
                </span>
                <h3 className="text-2xl font-serif font-bold text-forest-green mt-1">
                  {selectedEra.eraName}
                </h3>
                {selectedEra.kannadaTitle && (
                  <p className="text-xs font-kannada text-earth-brown mt-0.5">
                    {selectedEra.kannadaTitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedEra(null)}
                className="p-2 text-muted-text hover:text-dark-text rounded-full hover:bg-warm-cream transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm font-sans">
              <div>
                <div className="text-xs uppercase tracking-wider font-bold text-forest-green mb-1">
                  Summary & Context
                </div>
                <p className="text-dark-text/90 leading-relaxed">
                  {selectedEra.summary}
                </p>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider font-bold text-forest-green mb-1">
                  Primary Rulers & Authorities
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedEra.primaryRulers.map((r, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium text-earth-brown bg-warm-cream px-3 py-1 rounded-full border border-soft-sand"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider font-bold text-forest-green mb-2">
                  Key Historical Events
                </div>
                <ul className="space-y-2 text-xs md:text-sm text-dark-text/85">
                  {selectedEra.keyEvents.map((evt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-terracotta font-bold mt-0.5">■</span>
                      <span>{evt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedEra.pdfEvidence && (
                <div className="bg-warm-cream/70 p-4 rounded-xl border border-soft-sand text-xs text-muted-text space-y-1">
                  <div className="font-bold text-forest-green uppercase font-mono">
                    Archival & Academic Source Reference
                  </div>
                  <p>{selectedEra.pdfEvidence}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-soft-sand flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEra(null)}
                className="px-5 py-2.5 rounded-xl bg-forest-green text-white font-semibold text-xs hover:bg-forest-green/90 transition-colors cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORT STRUCTURE DETAIL DOSSIER */}
      {selectedStructure && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-text/70 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-soft-sand shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-soft-sand pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-terracotta">
                  {selectedStructure.classification} · {selectedStructure.historicalPeriod}
                </span>
                <h3 className="text-2xl font-serif font-bold text-forest-green mt-1">
                  {selectedStructure.name}
                </h3>
                {selectedStructure.kannadaName && (
                  <p className="text-xs font-kannada text-earth-brown mt-0.5">
                    {selectedStructure.kannadaName}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedStructure(null)}
                className="p-2 text-muted-text hover:text-dark-text rounded-full hover:bg-warm-cream transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm font-sans">
              {selectedStructure.builder && (
                <div>
                  <span className="text-xs font-semibold text-dark-text">Architect / Builder:</span>{' '}
                  <span className="text-muted-text">{selectedStructure.builder}</span>
                </div>
              )}

              <div>
                <div className="text-xs uppercase tracking-wider font-bold text-forest-green mb-2">
                  Architectural & Engineering Highlights
                </div>
                <ul className="space-y-2 text-xs md:text-sm text-dark-text/85">
                  {selectedStructure.architecturalHighlights.map((hl, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-terracotta font-bold mt-0.5">■</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-warm-cream/50 p-4 rounded-xl border border-soft-sand text-xs">
                <div>
                  <div className="font-bold text-forest-green uppercase font-mono mb-1">
                    Current Condition
                  </div>
                  <p className="text-dark-text/80">{selectedStructure.currentCondition}</p>
                </div>
                <div>
                  <div className="font-bold text-terracotta uppercase font-mono mb-1">
                    Conservation Action
                  </div>
                  <p className="text-dark-text/80">{selectedStructure.conservationAction}</p>
                </div>
              </div>

              <div className="text-xs text-muted-text font-mono pt-2">
                Citation: {selectedStructure.sourceReference}
              </div>
            </div>

            <div className="pt-4 border-t border-soft-sand flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStructure(null)}
                className="px-5 py-2.5 rounded-xl bg-forest-green text-white font-semibold text-xs hover:bg-forest-green/90 transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

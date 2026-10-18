import React, { useState } from 'react';
import { FortStructureItem } from '../../types/history';

export interface FortArchitectureAtlasProps {
  structures: FortStructureItem[];
  onSelectStructure: (structure: FortStructureItem) => void;
}

// Map each structure to an authentic image and territorial enclosure zone
const STRUCTURE_IMAGE_MAP: Record<string, { src: string; region: string }> = {
  'penukonda-bagilu': {
    src: '/images/location_98a06575abbc_second-fort-entrance.jpg',
    region: 'SETTLEMENT RING 01'
  },
  'sultan-bathery': {
    src: '/images/timeline-fort-citadel.jpg',
    region: 'MID-HILL ENCLOSURE'
  },
  'apex-circular-battery': {
    src: '/images/location_df626ae914bb_file81ootmz5faa1bpr44epa.jpg',
    region: 'CITADEL APEX (846M)'
  },
  'khan-darbar': {
    src: '/images/timeline-survey-drawing.jpg',
    region: 'HILLTOP COUNCIL PLINTH'
  },
  'babayya-gudi-masjid': {
    src: '/images/hero-pavagada-betta.jpg',
    region: 'UPPER CITADEL'
  },
  'kote-anjaneya-temple': {
    src: '/images/timeline-paleygar-gateway.jpg',
    region: 'THIRD DEFENSIVE GATE'
  },
  'hajama-mantapa': {
    src: '/images/timeline-early-stone.jpg',
    region: 'CITADEL TERRACE'
  },
  'royal-granary-kitchen': {
    src: '/images/heritage-hero-engraving.jpg',
    region: 'FORTIFIED GARRISON QUARTERS'
  }
};

export const FortArchitectureAtlas: React.FC<FortArchitectureAtlasProps> = ({
  structures,
  onSelectStructure
}) => {
  const [filter, setFilter] = useState<'ALL' | 'DEFENSE' | 'ROYAL' | 'RELIGIOUS'>('ALL');

  const filteredStructures = filter === 'ALL'
    ? structures
    : structures.filter(s => s.classification === filter);

  return (
    <div className="space-y-6">
      {/* Compact Header & Filter Bar (Minimal Vertical Occupancy) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-soft-sand/60">
        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-700">
          <span className="text-terracotta font-mono font-bold">02 / BUILT LANDSCAPES</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-normal">{filteredStructures.length} structures</span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'DEFENSE', label: 'Hill Forts' },
            { id: 'ROYAL', label: 'Royal' },
            { id: 'RELIGIOUS', label: 'Shrines' }
          ].map(btn => {
            const isActive = filter === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id as any)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-terracotta text-white border-terracotta shadow-xs'
                    : 'bg-white hover:bg-soft-sand text-dark-text border-slate-200'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Column Responsive Grid (Large: 4 cols, Medium: 3 cols, Tablet: 2 cols, Mobile: 1 col) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredStructures.map(item => {
          const mapping = STRUCTURE_IMAGE_MAP[item.id] || {
            src: '/images/hero-pavagada-betta.jpg',
            region: 'PAVAGADA FORT RAMPARTS'
          };

          return (
            <article
              key={item.id}
              className="bg-white border border-soft-sand rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Image Container with Landscape Ratio */}
                <div className="w-full h-44 overflow-hidden bg-warm-cream relative">
                  <img
                    src={mapping.src}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero-pavagada-betta.jpg';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 bg-dark-text/80 backdrop-blur-sm text-warm-cream text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                    {item.classification}
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-4 space-y-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-widest font-bold text-terracotta truncate">
                    {mapping.region}
                  </div>

                  <div>
                    <h3 className="text-base md:text-lg font-serif font-bold text-forest-green tracking-tight group-hover:text-terracotta transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    {item.kannadaName && (
                      <div className="text-xs font-kannada text-earth-brown mt-0.5">
                        {item.kannadaName}
                      </div>
                    )}
                  </div>

                  {/* Metadata Lines (Type and Period) */}
                  <div className="text-xs text-muted-text font-sans space-y-0.5 pt-1 border-t border-soft-sand/60">
                    <div>
                      <span className="font-semibold text-dark-text">Type:</span> {item.classification === 'DEFENSE' ? 'Hill Fortification' : item.classification === 'ROYAL' ? 'Royal Citadel Pavilion' : 'Sacred Shrines'}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-dark-text">Period:</span> {item.historicalPeriod}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="px-4 pb-4 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectStructure(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:text-forest-green transition-colors focus:outline-none focus:underline cursor-pointer"
                  aria-label={`View details for ${item.name}`}
                >
                  View details <span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

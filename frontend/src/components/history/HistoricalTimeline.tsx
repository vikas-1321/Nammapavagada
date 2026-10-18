import React from 'react';
import { HistoricalEra } from '../../types/history';

export interface HistoricalTimelineProps {
  eras: HistoricalEra[];
  onSelectEra: (era: HistoricalEra) => void;
}

// Authentic mapped historical photographs and archival engravings
const ERA_IMAGE_MAP: Record<string, { src: string; alt: string; tag: string }> = {
  'megalithic': {
    src: '/images/timeline-early-stone.jpg',
    alt: 'Ancient rock-cut shelters and stone inscriptions in Deccan Karnataka',
    tag: 'Prehistoric Deccan Ridge'
  },
  'aravidu-foundation': {
    src: '/images/timeline-paleygar-gateway.jpg',
    alt: 'Granite temple gopuram and Penukonda Bagilu fort entrance',
    tag: 'Penukonda & Aravidu Realm'
  },
  'paleygar-independence': {
    src: '/images/timeline-fort-citadel.jpg',
    alt: 'Fortified stone ramparts, royal pavilions and bastions on Pavagada hill',
    tag: 'Sovereign Paleygars'
  },
  'mysore-sultanate': {
    src: '/images/location_df626ae914bb_file81ootmz5faa1bpr44epa.jpg',
    alt: 'Hilltop citadel and apex circular battery platform retrofit',
    tag: 'Mysorean Artillery Retrofit'
  },
  'colonial-annexation': {
    src: '/images/timeline-survey-drawing.jpg',
    alt: 'Field sketch of ancient stone pavilion and survey encampment by Colin Mackenzie (1801)',
    tag: 'Mackenzie 1801 Survey'
  },
  'modern-transformation': {
    src: '/images/hero-pavagada-betta.jpg',
    alt: 'Panoramic view of Pavagada hill with modern clean energy transformation',
    tag: 'Shakti Sthala & Civic Era'
  }
};

export const HistoricalTimeline: React.FC<HistoricalTimelineProps> = ({ eras, onSelectEra }) => {
  return (
    <div className="space-y-6">
      {/* 2-Column Editorial Timeline Layout (Minimal Top Space) */}
      <div className="grid grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Left Column: Editorial Sticky Indicator */}
        <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-28 space-y-2 pb-2 lg:pb-0 border-b lg:border-b-0 border-soft-sand/60">
          <div className="text-[11px] font-mono uppercase tracking-widest font-bold text-terracotta">
            01 / CHRONOLOGY
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-forest-green tracking-tight">
            Time, in layers.
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-sans leading-relaxed max-w-sm">
            Six broad epochs across Pavagada history from prehistoric cists to the solar era.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-earth-brown bg-white px-2.5 py-1 rounded-lg border border-soft-sand">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
              {eras.length} Epochs Documented
            </span>
          </div>
        </div>

        {/* Right Column: Timeline Stream with Left Connector Line & Markers */}
        <div className="col-span-12 lg:col-span-8 relative">
          {/* Continuous vertical timeline guideline */}
          <div
            className="absolute left-4 md:left-6 top-6 bottom-6 w-[1.5px] bg-soft-sand pointer-events-none hidden sm:block"
            aria-hidden="true"
          />

          <div className="space-y-6 sm:space-y-8 sm:pl-10 md:pl-12">
            {eras.map((era, index) => {
              const imgData = ERA_IMAGE_MAP[era.id] || {
                src: '/images/timeline-early-stone.jpg',
                alt: era.eraName,
                tag: 'Historical Era'
              };

              return (
                <div key={era.id} className="relative group">
                  {/* Timeline Node Marker */}
                  <div
                    className="absolute -left-10 md:-left-12 top-6 w-3.5 h-3.5 rounded-full border-2 border-terracotta bg-warm-cream hidden sm:flex items-center justify-center transition-transform group-hover:scale-125 z-10"
                    aria-hidden="true"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                  </div>

                  {/* Editorial Timeline Card */}
                  <article className="bg-white border border-soft-sand rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                    {/* Left Thumbnail */}
                    <div className="w-full sm:w-44 md:w-52 h-36 sm:h-32 md:h-36 rounded-xl overflow-hidden shrink-0 border border-soft-sand/80 bg-warm-cream/50 relative">
                      <img
                        src={imgData.src}
                        alt={imgData.alt}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/hero-pavagada-betta.jpg';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-dark-text/80 backdrop-blur-sm text-warm-cream text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                        0{index + 1}
                      </div>
                    </div>

                    {/* Right Narrative Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] md:text-[11px] font-mono uppercase tracking-widest font-bold text-terracotta">
                          {era.timeRange}
                        </span>
                        {era.kannadaTitle && (
                          <span className="text-xs font-kannada text-earth-brown/80 font-medium truncate">
                            {era.kannadaTitle}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg md:text-xl font-serif font-bold text-forest-green tracking-tight group-hover:text-terracotta transition-colors">
                        {era.eraName}
                      </h3>

                      <p className="text-xs md:text-sm text-dark-text/80 font-sans leading-relaxed line-clamp-2 md:line-clamp-3">
                        {era.summary}
                      </p>

                      <div className="pt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[10px] md:text-[11px] font-sans font-medium text-earth-brown bg-warm-cream px-2.5 py-0.5 rounded-full border border-soft-sand">
                          {imgData.tag}
                        </span>

                        <button
                          type="button"
                          onClick={() => onSelectEra(era)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:text-forest-green transition-colors focus:outline-none focus:underline cursor-pointer"
                          aria-label={`Read details for ${era.eraName}`}
                        >
                          Read the era <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

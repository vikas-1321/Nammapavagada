import React from 'react';
import { MegalithicSiteRecord } from '../../types/history';

export interface MegalithicHeritageViewProps {
  sites: MegalithicSiteRecord[];
}

export const MegalithicHeritageView: React.FC<MegalithicHeritageViewProps> = ({ sites }) => {
  return (
    <div className="space-y-6">
      {/* Compact Section Header */}
      <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-700 pb-2 border-b border-soft-sand/60">
        <span className="text-terracotta font-mono font-bold">03 / STONE & MEMORY</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-500 font-normal">{sites.length} megalithic field studies</span>
      </div>

      {/* Large Site Study Cards (Split 50/50 Layout) */}
      <div className="space-y-8">
        {sites.map((site, index) => {
          const isFirst = index === 0;
          const imgSrc = isFirst
            ? '/images/megalithic-cist-study.jpg'
            : '/images/timeline-early-stone.jpg';

          return (
            <article
              key={site.id}
              className="bg-white border border-soft-sand rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Left Column: Authentic Megalithic Field Photo (50% desktop) */}
              <div className="lg:col-span-6 bg-warm-cream relative min-h-[260px] lg:min-h-[400px] overflow-hidden">
                <img
                  src={imgSrc}
                  alt={site.siteName}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/hero-pavagada-betta.jpg';
                  }}
                />
                <div className="absolute top-3 left-3 bg-dark-text/80 backdrop-blur-sm text-warm-cream text-xs font-mono px-2.5 py-0.5 rounded-full font-bold">
                  SURVEY RECORD 0{index + 1}
                </div>
              </div>

              {/* Right Column: Editorial Site Study Dossier (50% desktop) */}
              <div className="lg:col-span-6 p-5 md:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] md:text-[11px] font-mono uppercase tracking-widest font-bold text-terracotta">
                    <span>SITE STUDY 0{index + 1} / 0{sites.length}</span>
                    <span className="text-muted-text">IRON AGE PROTO-HISTORY</span>
                  </div>

                  <div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-forest-green tracking-tight">
                      {site.siteName}
                    </h3>
                    {site.kannadaName && (
                      <div className="text-xs font-kannada text-earth-brown mt-0.5">
                        {site.kannadaName}
                      </div>
                    )}
                  </div>

                  <p className="text-xs md:text-sm text-dark-text/85 font-sans leading-relaxed">
                    Large granite slabs create an enduring architectural presence.
                    Explorations at Pavagada documented 14 chamber cist burials with multi-ton capstones, cairn stone circles (<em>Kalluguppe</em>), and upright menhirs (<em>Nilusugallu</em>).
                  </p>

                  {/* Metadata Table with Thin Horizontal Dividers */}
                  <div className="border-t border-b border-soft-sand/70 py-3 my-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-text font-bold">
                        PERIOD
                      </div>
                      <div className="text-dark-text font-medium mt-0.5">
                        Prehistoric (c. 1000 BCE – 300 CE)
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-text font-bold">
                        STRUCTURE
                      </div>
                      <div className="text-dark-text font-medium mt-0.5 truncate">
                        {site.tombTypes[0] || 'Dolmenoid Cists & Cairns'}
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-1.5 border-t border-soft-sand/60">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-text font-bold">
                        REGION &amp; LOCATION
                      </div>
                      <div className="text-dark-text font-medium mt-0.5">
                        📍 {site.locationDetails}
                      </div>
                    </div>
                  </div>

                  {/* Why It Matters Section */}
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wider font-bold text-forest-green">
                      Why it matters
                    </div>
                    <p className="text-xs text-dark-text/80 font-sans leading-relaxed line-clamp-3">
                      {site.significance} Discoveries of red-and-black funerary pottery (<em>Mrutpatregalu</em>) and iron smelting slag establish continuous human habitation thousands of years before the medieval hill fort.
                    </p>
                  </div>
                </div>

                {/* Cultural lore & researchers citation */}
                <div className="pt-2 border-t border-soft-sand/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-text font-mono">
                  <span>Scholars: Rice (1898), Mackenzie (1801), Cheluvarajan (2015)</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

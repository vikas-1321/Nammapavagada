import React from 'react';
import { MegalithicSiteRecord } from '../../types/history';

export interface MegalithicHeritageViewProps {
  sites: MegalithicSiteRecord[];
}

export const MegalithicHeritageView: React.FC<MegalithicHeritageViewProps> = ({ sites }) => {
  return (
    <div className="space-y-8">
      {/* Editorial Overview Banner */}
      <div className="bg-white border border-soft-sand rounded-2xl p-6 md:p-9 shadow-sm">
        <span className="text-xs uppercase tracking-widest font-bold text-terracotta block mb-2">
          Proto-Historic Antiquity & Archaeological Discovery
        </span>
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-forest-green mb-3">
          Prehistoric Megalithic Burial Grounds of Pavagada
        </h3>
        <p className="text-base text-muted-text leading-relaxed max-w-4xl font-sans">
          Long before the 16th-century stone fortifications, Pavagada was a focal point of South Indian Megalithic culture (circa 1000 BCE to 300 CE).
          Explored by pioneering epigraphist B.L. Rice, Colonel Colin Mackenzie (1801), and modern scholars including Dr. Shivatarak and V.R. Cheluvarajan,
          the granite ridges of Pavagada reveal stone cist tombs, cairn mounds (<em>Kalluguppe</em>), and menhirs (<em>Nilusugallu</em>).
          These monuments evidence sophisticated stone quarrying, funerary urns, and iron smelting in antiquity.
        </p>
      </div>

      {/* Sites Breakdown */}
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        {sites.map(site => (
          <div
            key={site.id}
            className="col-span-12 lg:col-span-6 bg-white border border-soft-sand rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="border-b border-soft-sand pb-4 mb-4">
                <span className="text-[11px] uppercase font-bold tracking-wider bg-earth-brown text-white px-3 py-1 rounded-full shadow-sm">
                  Megalithic Site
                </span>
                <h4 className="text-2xl font-serif font-bold text-forest-green mt-3">
                  {site.siteName}
                </h4>
                {site.kannadaName && (
                  <p className="text-sm font-kannada text-earth-brown mt-0.5">{site.kannadaName}</p>
                )}
                <p className="text-xs text-forest-green font-mono mt-3 bg-warm-cream p-3 rounded-xl border border-soft-sand">
                  📍 {site.locationDetails}
                </p>
              </div>

              {/* Tomb Typology */}
              <div className="mb-4">
                <span className="text-xs uppercase tracking-wider font-bold text-forest-green block mb-2">
                  Monumental Stone Typology:
                </span>
                <ul className="space-y-1.5 text-xs text-dark-text">
                  {site.tombTypes.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-earth-brown font-bold">■</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Excavated Artifacts */}
              <div className="mb-4 bg-warm-cream/50 p-4 rounded-xl border border-soft-sand">
                <span className="text-xs uppercase tracking-wider font-bold text-terracotta block mb-2">
                  Excavated Material Culture:
                </span>
                <ul className="space-y-1.5 text-xs text-dark-text">
                  {site.artifactFindings.map((art, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-terracotta font-bold">●</span>
                      <span>{art}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Research Citations */}
              <div className="mb-4">
                <span className="text-[11px] uppercase tracking-wider font-bold text-muted-text block mb-2">
                  Documented By Scholarly Investigators:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {site.scholarlyResearchers.map((res, idx) => (
                    <span key={idx} className="text-xs font-mono bg-white border border-soft-sand px-2.5 py-1 rounded-md text-forest-green shadow-sm">
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Cultural Lore & Ethnography */}
            <div className="border-t border-soft-sand pt-4 mt-4 bg-warm-cream/40 p-4 rounded-xl border-l-4 border-l-earth-brown">
              <span className="text-[11px] uppercase tracking-wider font-bold text-earth-brown block mb-1">
                Folk Tradition & Living Ethnohistory:
              </span>
              <p className="text-xs text-dark-text leading-relaxed italic font-serif">
                &ldquo;{site.culturalLore}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

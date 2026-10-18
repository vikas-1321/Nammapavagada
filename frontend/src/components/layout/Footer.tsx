import React, { useState } from 'react';
import { PageRoute } from '../../types/navigation';
import { ACADEMIC_CITATIONS } from '../../data/historyData';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export interface FooterProps {
  onRouteChange: (route: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onRouteChange }) => {
  const [showBibliography, setShowBibliography] = useState(false);

  return (
    <footer className="bg-forest-green text-warm-cream border-t-4 border-terracotta mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 space-y-12">
        {/* 12-Column Grid Header */}
        <div className="grid grid-cols-12 gap-8 pb-12 border-b border-forest-green-light">
          {/* Main Brand Statement */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <div>
              <div className="text-2xl md:text-3xl font-serif font-black tracking-tight text-white">
                NAMMA PAVAGADA
              </div>
              <div className="text-sm font-kannada text-soft-sand mt-0.5">
                ನಮ್ಮ ಪಾವಗಡ — ತಾಲ್ಲೂಕು ಮಾಹಿತಿ ವೇದಿಕೆ
              </div>
            </div>

            <div className="text-xs uppercase tracking-widest text-terracotta-light font-bold">
              Heritage × Explorer × Community
            </div>

            <p className="text-sm text-soft-sand/90 max-w-md leading-relaxed font-sans">
              Discover the place. Understand its story. Find what you need.
              An authoritative digital repository documenting Pavagada’s 16th-century hill fortifications,
              prehistoric megalithic heritage, Shakti Sthala 2,050 MW solar infrastructure, and civic public services.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-soft-sand/80">
              <span className="bg-forest-green-dark/80 px-2.5 py-1 rounded border border-forest-green-light">
                COORD: 14.1025° N, 77.2798° E
              </span>
              <span className="bg-forest-green-dark/80 px-2.5 py-1 rounded border border-forest-green-light">
                ALT: 846 M
              </span>
              <span className="bg-forest-green-dark/80 px-2.5 py-1 rounded border border-forest-green-light">
                PIN: 561202
              </span>
            </div>
          </div>

          {/* Heritage Column */}
          <div className="col-span-6 sm:col-span-4 lg:col-span-2 space-y-3">
            <div className="text-xs uppercase tracking-wider font-bold text-terracotta-light border-b border-forest-green-light pb-2">
              Heritage
            </div>
            <ul className="space-y-2 text-sm text-soft-sand">
              <li>
                <button
                  onClick={() => { onRouteChange('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Historical Timeline
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onRouteChange('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  7 Fort Enclosures
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onRouteChange('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Megalithic Cists
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onRouteChange('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Sacred Shrines
                </button>
              </li>
            </ul>
          </div>

          {/* Explorer Column */}
          <div className="col-span-6 sm:col-span-4 lg:col-span-2 space-y-3">
            <div className="text-xs uppercase tracking-wider font-bold text-terracotta-light border-b border-forest-green-light pb-2">
              Explorer
            </div>
            <ul className="space-y-2 text-sm text-soft-sand">
              <li>
                <button
                  onClick={() => { onRouteChange('locations'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Place Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onRouteChange('map'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Geospatial Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onRouteChange('places'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Shakti Sthala (Solar)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onRouteChange('locations'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Category Filter
                </button>
              </li>
            </ul>
          </div>

          {/* Community Column */}
          <div className="col-span-12 sm:col-span-4 lg:col-span-3 space-y-3">
            <div className="text-xs uppercase tracking-wider font-bold text-terracotta-light border-b border-forest-green-light pb-2">
              Community
            </div>
            <ul className="space-y-2 text-sm text-soft-sand">
              <li>
                <button
                  onClick={() => { onRouteChange('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  KSRTC & APSRTC Bus Stand
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onRouteChange('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Taluk General Hospital
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onRouteChange('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Town Municipal Council (TMC)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onRouteChange('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left font-bold text-white flex items-center gap-1.5"
                >
                  <span className="text-terracotta">●</span> Emergency First Response (112)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onRouteChange('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white hover:underline transition-colors text-left text-xs text-soft-sand/70"
                >
                  About the Platform & Demographics
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* INTEGRATED HISTORICAL SOURCES & BIBLIOGRAPHY DRAWER (Relocated from Heritage Page) */}
        <div className="bg-forest-green-dark/70 border border-forest-green-light rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-terracotta-light font-bold">
                <BookOpen className="w-3.5 h-3.5 text-terracotta" />
                <span>Historical Sources & Academic Bibliography</span>
              </div>
              <p className="text-xs text-soft-sand/80 max-w-2xl font-sans">
                Primary and peer-reviewed architectural surveys, epigraphia carnatica, and district gazetteers grounding Pavagada&apos;s history.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowBibliography(!showBibliography)}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-forest-green hover:bg-forest-green-light border border-forest-green-light text-warm-cream transition-colors shadow-sm self-start sm:self-auto shrink-0"
              aria-expanded={showBibliography}
            >
              <span>{showBibliography ? 'Collapse Sources' : 'View Verified Citations'}</span>
              <span className="text-[10px] font-mono bg-terracotta text-white px-1.5 py-0.2 rounded font-bold">
                {ACADEMIC_CITATIONS.length}
              </span>
              {showBibliography ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expandable Bibliography Details */}
          {showBibliography && (
            <div className="pt-4 border-t border-forest-green-light/70 divide-y divide-forest-green-light/40 space-y-4 animate-fade-in">
              {ACADEMIC_CITATIONS.map((cite, index) => (
                <div key={cite.id} className="pt-3.5 first:pt-0 space-y-1">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] font-mono font-bold text-terracotta-light bg-forest-green-dark px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                      0{index + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="text-sm font-serif font-bold text-white">
                        {cite.title}
                      </div>
                      <div className="text-xs text-soft-sand/80">
                        <span className="text-white font-medium">{cite.authors}</span> ({cite.year}).{' '}
                        <em className="text-terracotta-light">{cite.publication}</em>.
                        {cite.isbnOrDoi && (
                          <span className="ml-1.5 font-mono text-[11px] text-terracotta">
                            [{cite.isbnOrDoi}]
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-soft-sand/70 font-sans leading-relaxed pt-0.5">
                        {cite.notes}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Colophon with Academic Citations Credit */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-soft-sand/70 font-sans gap-4 border-t border-forest-green-light/60">
          <div>
            © {new Date().getFullYear()} Namma Pavagada. Documenting Pavagada Taluk, Tumakuru District, Karnataka.
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span>Vivek &amp; Sagar (2022)</span>
            <span className="text-terracotta">•</span>
            <span>V.R. Cheluvarajan (2015)</span>
            <span className="text-terracotta">•</span>
            <span>D.N. Yogeshwarappa (2020)</span>
            <span className="text-terracotta">•</span>
            <span>Colin Mackenzie (1801)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

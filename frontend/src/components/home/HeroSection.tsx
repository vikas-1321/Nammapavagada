import React from 'react';
import { PageRoute } from '../../types/navigation';
import { Button } from '../common/Button';

export interface HeroSectionProps {
  onRouteChange: (route: PageRoute) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onRouteChange }) => {
  return (
    <section className="border-b border-soft-sand pb-16 pt-8 md:pt-14" aria-labelledby="hero-title">
      <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Typographic Asymmetric Hero Column */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Identity Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soft-sand/70 border border-soft-sand text-xs font-bold text-forest-green">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse"></span>
            <span className="uppercase tracking-wider">Heritage × Explorer × Community</span>
          </div>

          {/* Main Headline (Editorial Asymmetric Layout) */}
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-widest font-bold text-terracotta">
              Pavagada Taluk · Tumakuru District
            </div>
            <h1
              id="hero-title"
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black tracking-tight text-forest-green leading-[0.95]"
            >
              DISCOVER<br />
              <span className="text-terracotta">PAVAGADA</span>
            </h1>
          </div>

          {/* Subtitle Triad as requested */}
          <div className="text-2xl md:text-3xl font-serif text-earth-brown font-semibold leading-snug">
            Its stories. Its places. Its people.
          </div>

          {/* Descriptive Body */}
          <p className="text-base md:text-lg text-muted-text font-sans leading-relaxed max-w-xl">
            A centralized digital platform dedicated to Pavagada.
            Explore centuries of stone fortifications, ancient megalithic culture,
            the 2,050 MW Shakti Sthala solar park, and essential community services.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Button
              variant="accent"
              size="lg"
              onClick={() => onRouteChange('locations')}
            >
              Explore Pavagada
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onRouteChange('history')}
            >
              Discover History
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onRouteChange('map')}
            >
              View on Map
            </Button>
          </div>
        </div>

        {/* Right Feature Card: The Three Pillars Showcase */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white border border-soft-sand rounded-2xl p-6 md:p-8 shadow-md space-y-6">
            <div className="border-b border-soft-sand pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-muted-text block">
                  Quick Navigation Hub
                </span>
                <h3 className="text-xl font-serif font-bold text-forest-green">
                  Pavagada at a Glance
                </h3>
              </div>
              <span className="text-xs font-mono font-bold bg-warm-cream border border-soft-sand text-forest-green px-2.5 py-1 rounded-md">
                14.10° N, 77.28° E
              </span>
            </div>

            {/* 3 Pillars Fast Navigation */}
            <div className="space-y-3">
              {/* Heritage Pillar */}
              <div
                onClick={() => onRouteChange('history')}
                className="group p-3.5 rounded-xl border border-soft-sand hover:border-earth-brown bg-warm-cream/40 hover:bg-warm-cream transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-earth-brown/10 text-earth-brown flex items-center justify-center font-bold text-lg">
                    🏛️
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-forest-green group-hover:text-earth-brown transition-colors">
                      HERITAGE
                    </h4>
                    <p className="text-xs text-muted-text">
                      1586 Fort, 8 Paleygars, Megalithic Cists
                    </p>
                  </div>
                </div>
                <span className="text-earth-brown font-bold group-hover:translate-x-1 transition-transform">→</span>
              </div>

              {/* Explorer Pillar */}
              <div
                onClick={() => onRouteChange('locations')}
                className="group p-3.5 rounded-xl border border-soft-sand hover:border-terracotta bg-warm-cream/40 hover:bg-warm-cream transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-lg">
                    🧭
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-forest-green group-hover:text-terracotta transition-colors">
                      EXPLORER
                    </h4>
                    <p className="text-xs text-muted-text">
                      Interactive Map, Solar Park, Hill Gates
                    </p>
                  </div>
                </div>
                <span className="text-terracotta font-bold group-hover:translate-x-1 transition-transform">→</span>
              </div>

              {/* Community Pillar */}
              <div
                onClick={() => onRouteChange('services')}
                className="group p-3.5 rounded-xl border border-soft-sand hover:border-forest-green bg-warm-cream/40 hover:bg-warm-cream transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-forest-green/10 text-forest-green flex items-center justify-center font-bold text-lg">
                    🏥
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-forest-green transition-colors">
                      COMMUNITY
                    </h4>
                    <p className="text-xs text-muted-text">
                      Hospitals, KSRTC Buses, Emergency 112
                    </p>
                  </div>
                </div>
                <span className="text-forest-green font-bold group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Quick Metrics Footer */}
            <div className="pt-3 border-t border-soft-sand flex items-center justify-between text-xs text-muted-text font-mono">
              <span>Dist to BLR: 158 km</span>
              <span>•</span>
              <span>Tumakuru District</span>
              <span>•</span>
              <span>Elev: 846m</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

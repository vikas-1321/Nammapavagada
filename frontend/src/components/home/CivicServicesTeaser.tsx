import React from 'react';
import { PageRoute } from '../../types/navigation';
import { SectionHeader } from '../common/SectionHeader';
import { Button } from '../common/Button';

export interface CivicServicesTeaserProps {
  onRouteChange: (route: PageRoute) => void;
}

export const CivicServicesTeaser: React.FC<CivicServicesTeaserProps> = ({ onRouteChange }) => {
  return (
    <section className="py-16 md:py-24" aria-labelledby="community-preview-title">
      <SectionHeader
        number="03"
        categoryLabel="Community · Essential Services"
        title="Local Information & Services"
        kannadaTitle="ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು ಮತ್ತು ಸಂಪರ್ಕ"
        description="Public transit schedules, municipal desks, local administration, and round-the-clock emergency medical first responders."
        action={
          <Button
            variant="secondary"
            onClick={() => onRouteChange('services')}
          >
            Open Community Hub
          </Button>
        }
      />

      <div className="grid grid-cols-12 gap-6 md:gap-8">
        {/* Transit Service Highlight */}
        <div className="col-span-12 md:col-span-4 bg-white border border-soft-sand rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-soft-sand pb-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-forest-green text-white px-2.5 py-0.5 rounded-full">
                Public Transit
              </span>
              <span className="text-xs font-mono text-muted-text">Bus & Rail</span>
            </div>

            <h4 className="text-xl font-serif font-bold text-forest-green mb-2">
              KSRTC & APSRTC Corridors
            </h4>

            <p className="text-sm text-muted-text leading-relaxed mb-5">
              Direct highway bus services connecting Pavagada to Bengaluru (Majestic), Tumakuru, Madhugiri, Rayadurga, and Bellary.
            </p>

            <div className="bg-warm-cream/60 border border-soft-sand rounded-xl p-3.5 text-xs font-mono text-forest-green space-y-1.5 mb-4">
              <div>• Bengaluru: 158 km via Madhugiri/Tumakuru</div>
              <div>• Tumakuru: Regular district express feeder</div>
              <div>• Rayadurga–Tumakuru railway under execution</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRouteChange('services')}
            className="text-xs font-bold uppercase tracking-wider text-forest-green hover:text-terracotta mt-4 pt-3 border-t border-soft-sand flex items-center justify-between group/link"
          >
            <span>Review Transit Details</span>
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Civic Administration */}
        <div className="col-span-12 md:col-span-4 bg-white border border-soft-sand rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-soft-sand pb-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-forest-green text-white px-2.5 py-0.5 rounded-full">
                Administration
              </span>
              <span className="text-xs font-mono text-muted-text">Civic Desks</span>
            </div>

            <h4 className="text-xl font-serif font-bold text-forest-green mb-2">
              Town Municipal & Taluk Office
            </h4>

            <p className="text-sm text-muted-text leading-relaxed mb-5">
              Town Municipal Council oversees drinking water and urban licenses; Mini Vidhana Soudha administers revenue records (Bhoomi/RTC) and social relief.
            </p>

            <div className="bg-warm-cream/60 border border-soft-sand rounded-xl p-3.5 text-xs font-mono text-forest-green space-y-1.5 mb-4">
              <div>• TMC: 08136-244230 (Office Road)</div>
              <div>• Tahsildar / Taluk: 08136-244225</div>
              <div>• Police Station: 08136-244233 / 112</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRouteChange('services')}
            className="text-xs font-bold uppercase tracking-wider text-forest-green hover:text-terracotta mt-4 pt-3 border-t border-soft-sand flex items-center justify-between group/link"
          >
            <span>Inspect Civic Directory</span>
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Emergency First Response */}
        <div className="col-span-12 md:col-span-4 bg-white border-2 border-terracotta/40 rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-soft-sand pb-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-terracotta text-white px-2.5 py-0.5 rounded-full">
                24/7 First Response
              </span>
              <span className="text-xs font-mono text-terracotta font-bold">Emergency</span>
            </div>

            <h4 className="text-xl font-serif font-bold text-forest-green mb-2">
              Emergency Response Network
            </h4>

            <p className="text-sm text-muted-text leading-relaxed mb-4">
              Round-the-clock emergency medical ambulance, taluk general hospital casualty triage, and unified police dispatch.
            </p>

            <div className="space-y-2 text-xs font-bold font-mono">
              <div className="flex justify-between items-center bg-warm-cream border border-soft-sand p-2.5 rounded-lg">
                <span className="text-forest-green">Unified Emergency:</span>
                <span className="text-terracotta font-bold text-sm">112</span>
              </div>
              <div className="flex justify-between items-center bg-warm-cream border border-soft-sand p-2.5 rounded-lg">
                <span className="text-forest-green">Arogya Ambulance:</span>
                <span className="text-terracotta font-bold text-sm">108</span>
              </div>
              <div className="flex justify-between items-center bg-warm-cream border border-soft-sand p-2.5 rounded-lg">
                <span className="text-forest-green">Taluk Hospital Casualty:</span>
                <span className="text-dark-text">08136-244240</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRouteChange('services')}
            className="text-xs font-bold uppercase tracking-wider text-terracotta hover:text-terracotta-dark mt-4 pt-3 border-t border-soft-sand flex items-center justify-between group/link"
          >
            <span>View All Emergency Lines</span>
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

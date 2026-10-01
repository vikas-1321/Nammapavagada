import React from 'react';
import { PageRoute } from '../../types/navigation';
import { SectionHeader } from '../common/SectionHeader';
import { Button } from '../common/Button';

export interface HistoryTeaserProps {
  onRouteChange: (route: PageRoute) => void;
}

export const HistoryTeaser: React.FC<HistoryTeaserProps> = ({ onRouteChange }) => {
  return (
    <section className="py-16 md:py-24 border-b border-soft-sand" aria-labelledby="heritage-preview-title">
      <SectionHeader
        number="01"
        categoryLabel="Heritage & Historical Chronicles"
        title="The Story of Pavagada"
        kannadaTitle="ಪಾವಗಡದ ಐತಿಹಾಸಿಕ ಕಥೆ"
        description="From Iron-Age megalithic stone cists to the 16th-century Vijayanagara Aravidu stronghold and Mysorean artillery retrenchment under Tipu Sultan."
        action={
          <Button
            variant="earth"
            onClick={() => onRouteChange('history')}
          >
            Explore History
          </Button>
        }
      />

      <div className="grid grid-cols-12 gap-8 items-stretch">
        {/* Story Module 1: The Hill Fort & Paleygar Lineage */}
        <div className="col-span-12 md:col-span-6 bg-white border border-soft-sand rounded-2xl p-7 md:p-9 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-soft-sand pb-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-earth-brown text-white px-2.5 py-0.5 rounded-full">
                1586 – 1799 CE
              </span>
              <span className="text-xs font-mono text-muted-text">Aravidu & Mysore Era</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-serif font-bold text-forest-green mb-3">
              Pavagada Hill Fort & Paleygars
            </h3>

            <p className="text-sm md:text-base text-muted-text leading-relaxed mb-6 font-sans">
              Granted by Aravidu king Venkatapatiraya of Penukonda in 1586 to chieftain Ballappanayaka,
              the fort was constructed between 1591 and 1600. Featuring 7 defensive enclosures,
              subterranean ammunition chambers (Sultan Bathery), a 100-foot apex artillery bastion,
              and a secret escape tunnel to Penukonda, it served as a war-ready bastion for over two centuries.
            </p>

            <div className="bg-warm-cream/60 border border-soft-sand rounded-xl p-4 text-xs font-mono text-forest-green space-y-1.5 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-terracotta">●</span>
                <span>8 Successive Paleygars governed between 1586 and 1799</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-terracotta">●</span>
                <span>Conquered by Hyder Ali & Tipu Sultan (renamed Fatehbad)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-terracotta">●</span>
                <span>Annexed into Mysore State in 1799 under Dewan Purnayya</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-soft-sand flex items-center justify-between">
            <button
              type="button"
              onClick={() => onRouteChange('history')}
              className="text-xs font-bold uppercase tracking-wider text-earth-brown hover:text-terracotta flex items-center gap-2 group/btn"
            >
              <span>Examine Fort Architectural Atlas</span>
              <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
            </button>
            <span className="text-xs text-muted-text font-serif italic">7 Hill Enclosures</span>
          </div>
        </div>

        {/* Story Module 2: The Prehistoric Megalithic Burial Grounds */}
        <div className="col-span-12 md:col-span-6 bg-white border border-soft-sand rounded-2xl p-7 md:p-9 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-soft-sand pb-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-terracotta text-white px-2.5 py-0.5 rounded-full">
                c. 1000 BCE – 300 CE
              </span>
              <span className="text-xs font-mono text-muted-text">Iron Age Antiquity</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-serif font-bold text-forest-green mb-3">
              Prehistoric Megalithic Culture
            </h3>

            <p className="text-sm md:text-base text-muted-text leading-relaxed mb-6 font-sans">
              At Bodula Maramma, Kotegudda, and Udandappanapalya, archaeologists discovered 14 stone chamber tombs (cists/dolmens),
              cairn mounds (<em>Kalluguppe</em>), and standing menhirs. Excavations yielded red-and-black pottery,
              iron oxide nodules (<em>Mandoora</em>), and iron weaponry, proving early human civilization long prior to medieval stone forts.
            </p>

            <div className="bg-warm-cream/60 border border-soft-sand rounded-xl p-4 text-xs font-mono text-forest-green space-y-1.5 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-earth-brown">●</span>
                <span>Documented by B.L. Rice, Colin Mackenzie, & V.R. Cheluvarajan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-earth-brown">●</span>
                <span>Multi-ton capstones measuring up to 45 ft circumference</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-earth-brown">●</span>
                <span>Perennial rock reservoir (Bodulu) sustaining early agro-pastoralists</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-soft-sand flex items-center justify-between">
            <button
              type="button"
              onClick={() => onRouteChange('history')}
              className="text-xs font-bold uppercase tracking-wider text-forest-green hover:text-terracotta flex items-center gap-2 group/btn"
            >
              <span>Examine Megalithic Site Findings</span>
              <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
            </button>
            <span className="text-xs text-muted-text font-serif italic">14 Stone Tombs</span>
          </div>
        </div>
      </div>
    </section>
  );
};

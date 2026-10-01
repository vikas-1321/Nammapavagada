import React from 'react';
import { TransitScheduleItem } from '../../types/service';
import { Badge } from '../common/Badge';

export interface TransitScheduleViewProps {
  routes: TransitScheduleItem[];
}

export const TransitScheduleView: React.FC<TransitScheduleViewProps> = ({ routes }) => {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-forest-green bg-white p-5 rounded-r-2xl border border-soft-sand shadow-sm">
        <h4 className="text-xs uppercase tracking-wider font-bold text-forest-green mb-1.5 flex items-center gap-2">
          <span>🚌</span>
          <span>Public Transit Network · Pavagada Central Station</span>
        </h4>
        <p className="text-xs md:text-sm text-muted-text leading-relaxed font-sans">
          Pavagada is serviced by regular Karnataka State Road Transport Corporation (KSRTC) and Andhra Pradesh State Road Transport Corporation (APSRTC) operations.
          Standard daylight corridor frequencies are listed below. Automated realtime GPS telemetry is progressively synced with state transport databases.
        </p>
      </div>

      <div className="space-y-4">
        {routes.map(route => (
          <div
            key={route.id}
            className="bg-white border border-soft-sand hover:border-forest-green/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-wrap items-center justify-between border-b border-soft-sand pb-3 mb-4 gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-forest-green text-white px-2.5 py-0.5 rounded-md">
                  {route.routeCode}
                </span>
                <Badge variant={route.operator === 'KSRTC' ? 'forest' : route.operator === 'APSRTC' ? 'terracotta' : 'sand'}>
                  {route.operator}
                </Badge>
              </div>
              <span className="text-xs font-mono text-muted-text">
                {route.isTimetableLive ? 'Live GPS Verified' : 'Standard Corridor Frequency'}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center mb-5">
              <div className="col-span-12 sm:col-span-5">
                <span className="text-[11px] uppercase font-bold text-muted-text block mb-0.5">Origin Station</span>
                <div className="text-lg font-serif font-bold text-forest-green">{route.source}</div>
              </div>
              <div className="col-span-12 sm:col-span-2 text-center text-xl font-bold text-terracotta select-none">
                →
              </div>
              <div className="col-span-12 sm:col-span-5">
                <span className="text-[11px] uppercase font-bold text-muted-text block mb-0.5">Destination Terminal</span>
                <div className="text-lg font-serif font-bold text-forest-green">{route.destination}</div>
              </div>
            </div>

            <div className="bg-warm-cream/60 p-3.5 rounded-xl border border-soft-sand text-xs mb-4">
              <span className="font-bold text-forest-green uppercase text-[11px] block mb-1.5">Corridor Route Via:</span>
              <div className="flex flex-wrap gap-1.5">
                {route.via.map((stop, i) => (
                  <span key={i} className="bg-white border border-soft-sand px-2.5 py-0.5 rounded-md font-mono text-dark-text shadow-xs">
                    {stop}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-baseline text-xs text-muted-text pt-2 border-t border-soft-sand/60 gap-2 font-sans">
              <div>
                <strong className="text-forest-green uppercase text-[11px] tracking-wide">Frequency: </strong>
                <span className="text-dark-text font-medium">{route.frequencyNote}</span>
              </div>
              <div className="font-mono text-[11px] text-muted-text">
                {route.statusNote}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

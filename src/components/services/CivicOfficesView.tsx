import React from 'react';
import { CivicServiceContact } from '../../types/service';
import { Badge } from '../common/Badge';
import { MapPin, Phone } from 'lucide-react';

export interface CivicOfficesViewProps {
  offices: CivicServiceContact[];
}

export const CivicOfficesView: React.FC<CivicOfficesViewProps> = ({ offices }) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {offices.map(office => (
        <div
          key={office.id}
          className="col-span-12 md:col-span-6 bg-white border border-soft-sand hover:border-forest-green/40 rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-soft-sand pb-3 mb-3">
              <span className="text-[11px] uppercase font-bold tracking-wider text-terracotta">
                {office.department}
              </span>
              <Badge variant="cream">
                {office.verificationStatus}
              </Badge>
            </div>

            <h4 className="text-xl font-serif font-bold text-forest-green mb-2">
              {office.officeName}
            </h4>

            <div className="text-xs text-dark-text/80 mb-4 bg-warm-cream/60 p-3 rounded-xl border border-soft-sand font-mono flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0 mt-0.5" />
              <span>{office.address}</span>
            </div>

            <div className="space-y-1.5 mb-4">
              <span className="text-[11px] uppercase tracking-wider font-bold text-forest-green block">
                Citizen Services Handled:
              </span>
              <ul className="space-y-1.5 text-xs text-dark-text">
                {office.keyServices.map((svc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-terracotta font-bold">●</span>
                    <span className="leading-relaxed">{svc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-soft-sand pt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-semibold text-muted-text uppercase text-[11px]">Hours: </span>
              <span className="text-dark-text font-medium">{office.workingHours}</span>
            </div>
            {office.contactNumber && (
              <a
                href={`tel:${office.contactNumber.replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center gap-1.5 font-mono font-bold text-terracotta hover:underline bg-warm-cream px-3 py-1 rounded-lg border border-soft-sand"
              >
                <Phone className="w-3 h-3" />
                <span>{office.contactNumber}</span>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

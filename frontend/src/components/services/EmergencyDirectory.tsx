import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { EmergencyContact } from '../../types/service';

export interface EmergencyDirectoryProps {
  contacts: EmergencyContact[];
}

export const EmergencyDirectory: React.FC<EmergencyDirectoryProps> = ({ contacts }) => {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-terracotta bg-white p-5 rounded-r-2xl border border-soft-sand shadow-sm">
        <span className="text-xs uppercase font-bold tracking-wider text-terracotta block mb-1 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-terracotta shrink-0" />
          <span>Emergency First Response Network · Pavagada Taluk</span>
        </span>
        <p className="text-xs md:text-sm text-muted-text leading-relaxed font-sans">
          Critical emergency hotlines for trauma medical triage, fire containment, law enforcement, and women and child protection.
          Direct telephone lines are officially verified against district administration registers.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {contacts.map(c => (
          <div
            key={c.id}
            className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white border border-soft-sand hover:border-terracotta/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-terracotta bg-warm-cream px-2.5 py-0.5 rounded-full inline-block mb-2">
                Emergency Dispatch
              </span>
              <h4 className="text-base font-serif font-bold text-forest-green mb-2 leading-snug">
                {c.service}
              </h4>
              <a
                href={`tel:${c.telephone.replace(/[^0-9]/g, '')}`}
                className="text-3xl font-serif font-black text-terracotta tracking-tight my-2.5 block hover:underline"
              >
                {c.telephone}
              </a>
              {c.alternatePhone && (
                <div className="text-xs font-mono text-muted-text mt-0.5">
                  Alt: {c.alternatePhone}
                </div>
              )}
            </div>

            <div className="border-t border-soft-sand pt-3.5 mt-4 text-xs text-muted-text space-y-1 font-sans">
              <div>
                <span className="font-semibold text-forest-green">Coverage: </span>
                {c.operationalHours}
              </div>
              {c.notes && (
                <div className="text-muted-text/80 text-[11px] leading-relaxed pt-0.5">
                  {c.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Plus, Trash2, Globe, FileText, IndianRupee } from 'lucide-react';

export interface CitizenService {
  name: string;
  description: string;
  requiredDocuments: string;
  officeCounter: string;
  workingHours: string;
  fee: string;
  isOnlineAvailable: boolean;
  applicationUrl: string;
}

interface ServiceListProps {
  services: CitizenService[];
  onChange: (services: CitizenService[]) => void;
  title?: string;
  description?: string;
}

export const ServiceList: React.FC<ServiceListProps> = ({
  services = [],
  onChange,
  title = 'Civic Services Offered to Citizens',
  description = 'List all statutory services, application counters, required documents, and online application links.',
}) => {
  const addService = () => {
    const newService: CitizenService = {
      name: '',
      description: '',
      requiredDocuments: '',
      officeCounter: 'Counter #1',
      workingHours: '10:00 AM – 04:30 PM',
      fee: 'Free / Official Stamp',
      isOnlineAvailable: false,
      applicationUrl: '',
    };
    onChange([...services, newService]);
  };

  const removeService = (idx: number) => {
    onChange(services.filter((_, i) => i !== idx));
  };

  const updateService = (idx: number, field: keyof CitizenService, value: any) => {
    const updated = [...services];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <FileText size={15} className="text-emerald-400" />
            <span>{title}</span>
          </h4>
          <p className="text-[11px] text-slate-500">{description}</p>
        </div>

        <button
          type="button"
          onClick={addService}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus size={14} />
          <span>Add Service</span>
        </button>
      </div>

      {services.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <p className="text-xs text-slate-400 mb-2">No citizen services listed yet.</p>
          <button
            type="button"
            onClick={addService}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            + Click here to add the first service
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 transition-all"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={svc.name}
                    onChange={(e) => updateService(idx, 'name', e.target.value)}
                    placeholder="Service Name (e.g. Birth Certificate, Katha Transfer, Ration Card)..."
                    className="bg-transparent text-xs font-bold text-white focus:outline-none placeholder-slate-500 w-72 md:w-96"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeService(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Remove this service"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Service Description */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Procedure & Citizen Description
                </label>
                <textarea
                  rows={2}
                  value={svc.description}
                  onChange={(e) => updateService(idx, 'description', e.target.value)}
                  placeholder="Explain citizen eligibility, delivery timeline (e.g. 7 working days), and procedural steps..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Documents & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Required Documents Checklist
                  </label>
                  <input
                    type="text"
                    value={svc.requiredDocuments}
                    onChange={(e) => updateService(idx, 'requiredDocuments', e.target.value)}
                    placeholder="e.g. Aadhaar Card, Previous Receipt, RTC Pahani copy"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Counter / Room
                    </label>
                    <input
                      type="text"
                      value={svc.officeCounter}
                      onChange={(e) => updateService(idx, 'officeCounter', e.target.value)}
                      placeholder="Room 102"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Working Hours
                    </label>
                    <input
                      type="text"
                      value={svc.workingHours}
                      onChange={(e) => updateService(idx, 'workingHours', e.target.value)}
                      placeholder="10 AM - 4 PM"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Fee (₹)
                    </label>
                    <input
                      type="text"
                      value={svc.fee}
                      onChange={(e) => updateService(idx, 'fee', e.target.value)}
                      placeholder="₹25 / Free"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Online Application Checkbox & URL */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={svc.isOnlineAvailable}
                    onChange={(e) => updateService(idx, 'isOnlineAvailable', e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-800"
                  />
                  <span>Online Application Available via State Portal</span>
                </label>

                {svc.isOnlineAvailable && (
                  <div className="flex-1 max-w-md relative">
                    <Globe size={13} className="absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="url"
                      value={svc.applicationUrl}
                      onChange={(e) => updateService(idx, 'applicationUrl', e.target.value)}
                      placeholder="https://sevasindhu.karnataka.gov.in/..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

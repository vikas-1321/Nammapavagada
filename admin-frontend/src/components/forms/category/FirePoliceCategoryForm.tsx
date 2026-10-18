import React from 'react';
import { Shield, Flame, PhoneCall, AlertCircle } from 'lucide-react';
import { TextField } from '../../common/TextField';
import { PhoneField } from '../../common/PhoneField';

interface FirePoliceCategoryFormProps {
  type: 'fire_station' | 'police_station';
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const FirePoliceCategoryForm: React.FC<FirePoliceCategoryFormProps> = ({
  type,
  data = {},
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const isFire = type === 'fire_station';

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center gap-2 mb-2">
        {isFire ? (
          <Flame size={16} className="text-rose-400" />
        ) : (
          <Shield size={16} className="text-blue-400" />
        )}
        <h4 className="text-xs font-bold text-white">
          {isFire ? 'Fire & Disaster Rescue Operations Desk' : 'Police Station & Law Enforcement Desk'}
        </h4>
      </div>

      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 text-[11px] text-amber-300 flex items-start gap-2">
        <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-400" />
        <span>
          <strong>Public Accountability Rule:</strong> Enter only official government desk /
          control-room telephone numbers. Do not publish personal mobile numbers of individual
          constables or officers unless officially designated for public taluk helpline use.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PhoneField
          label="Official Station Landline / Control Room Phone"
          value={data.stationPhone || ''}
          onChange={(val) => updateField('stationPhone', val)}
          placeholder={isFire ? '08136-244101' : '08136-244100'}
        />

        <TextField
          label="National / State Emergency Code"
          value={data.emergencyCode || (isFire ? '101 / 112' : '100 / 112')}
          onChange={(e) => updateField('emergencyCode', e.target.value)}
          placeholder="112"
        />
      </div>

      {isFire ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
          {[
            { key: 'hasFireResponse', label: 'Fire Extinguishing & Response' },
            { key: 'hasRescueServices', label: 'Accident & Well Rescue' },
            { key: 'hasDisasterResponse', label: 'Flood & Disaster Relief' },
            { key: 'hasAnimalRescue', label: 'Animal Rescue Services' },
            { key: 'is24HoursOperational', label: '24/7 Watch Room Active' },
          ].map((item) => (
            <label
              key={item.key}
              className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                data[item.key]
                  ? 'bg-rose-950/40 border-rose-600 text-rose-200 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(data[item.key] !== false)}
                onChange={(e) => updateField(item.key, e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-0 bg-slate-800"
              />
              <span className="text-xs">{item.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField
              label="Police Jurisdiction / Circle"
              value={data.jurisdiction || ''}
              onChange={(e) => updateField('jurisdiction', e.target.value)}
              placeholder="Pavagada Town Circle (Ward 1-23 and adjoining rural beats)"
            />

            <TextField
              label="Supervisory Sub-Division"
              value={data.subDivision || 'Madhugiri Sub-Division, Tumakuru District'}
              onChange={(e) => updateField('subDivision', e.target.value)}
              placeholder="Madhugiri Sub-Division"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
            {[
              { key: 'hasWomenChildDesk', label: 'Women & Child Help Desk' },
              { key: 'hasLostFound', label: 'Lost & Found Property Desk' },
              { key: 'hasFirOnlineReceipt', label: 'FIR & e-Complaint Registration' },
              { key: 'hasPassportVerification', label: 'Passport Police Verification Desk' },
              { key: 'hasTrafficServices', label: 'Traffic Enforcement & Challan Desk' },
              { key: 'is24HoursOperational', label: '24/7 Reception & Beat Patrol' },
            ].map((item) => (
              <label
                key={item.key}
                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                  data[item.key]
                    ? 'bg-blue-950/40 border-blue-600 text-blue-200 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(data[item.key] !== false)}
                onChange={(e) => updateField(item.key, e.target.checked)}
                className="rounded border-slate-700 text-blue-500 focus:ring-0 bg-slate-800"
              />
              <span className="text-xs">{item.label}</span>
            </label>
          ))}
          </div>
        </>
      )}
    </div>
  );
};

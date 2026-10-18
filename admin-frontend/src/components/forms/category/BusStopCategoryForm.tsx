import React from 'react';
import { Bus, ShieldCheck } from 'lucide-react';
import { TextField } from '../../common/TextField';

interface BusStopCategoryFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const BusStopCategoryForm: React.FC<BusStopCategoryFormProps> = ({
  data = {},
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center gap-2 mb-2">
        <Bus size={16} className="text-amber-400" />
        <h4 className="text-xs font-bold text-white">
          Bus Stop, Stage & Passenger Amenities
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField
          label="Routes & Highways Passing Through"
          value={data.routesPassingThrough || ''}
          onChange={(e) => updateField('routesPassingThrough', e.target.value)}
          placeholder="e.g. Pavagada–Tumakuru, Pavagada–Bengaluru, Challakere State Highway"
        />

        <TextField
          label="Passenger Capacity / Shelter Type"
          value={data.shelterType || 'Standard Concrete Rural Passenger Shelter'}
          onChange={(e) => updateField('shelterType', e.target.value)}
          placeholder="KSRTC Platform / Steel Shelter / Rural Grama Panchayat Kiosk"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
        {[
          { key: 'hasShelter', label: 'Rain / Sun Passenger Shelter' },
          { key: 'hasSeatingBenches', label: 'Seating Benches' },
          { key: 'hasNightLighting', label: 'Solar / Night Street Lighting' },
          { key: 'hasWheelchairAccess', label: 'Accessible Kerb / Ramp' },
          { key: 'hasDrinkingWater', label: 'Drinking Water Kiosk' },
          { key: 'hasPublicToilet', label: 'Public Toilet Nearby' },
        ].map((item) => (
          <label
            key={item.key}
            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
              data[item.key]
                ? 'bg-amber-950/40 border-amber-600 text-amber-200 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <input
              type="checkbox"
              checked={Boolean(data[item.key])}
              onChange={(e) => updateField(item.key, e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-800"
            />
            <span className="text-[11px]">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

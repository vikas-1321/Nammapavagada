import React from 'react';
import { Wrench, PhoneCall } from 'lucide-react';
import { TextField } from '../../common/TextField';
import { PhoneField } from '../../common/PhoneField';

interface DailyTradesCategoryFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const DailyTradesCategoryForm: React.FC<DailyTradesCategoryFormProps> = ({
  data = {},
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center gap-2 mb-2">
        <Wrench size={16} className="text-cyan-400" />
        <h4 className="text-xs font-bold text-white">
          Trade Professional / Local Service Provider Profile
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <TextField
          label="Business / Master Technician Name"
          value={data.providerName || ''}
          onChange={(e) => updateField('providerName', e.target.value)}
          placeholder="e.g. Manjunatha Electrical Works"
        />

        <TextField
          label="Core Trades & Services"
          value={data.servicesList || ''}
          onChange={(e) => updateField('servicesList', e.target.value)}
          placeholder="House wiring, Inverter repair, Borewell pump repair"
        />

        <TextField
          label="Service Coverage Area"
          value={data.serviceArea || 'Pavagada Town & 15km Surrounding Villages'}
          onChange={(e) => updateField('serviceArea', e.target.value)}
          placeholder="Pavagada Town and nearby villages"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField
          label="Base Pricing / Visiting Charges (Optional)"
          value={data.pricingInfo || 'Visiting charges ₹150 – ₹200 (voluntary quote)'}
          onChange={(e) => updateField('pricingInfo', e.target.value)}
          placeholder="₹150 inspection fee + material at actuals"
          helperText="Only include standard voluntary quotes, not contractual bids"
        />

        <TextField
          label="Years in Local Trade / Experience"
          value={data.experienceYears || '10+ Years'}
          onChange={(e) => updateField('experienceYears', e.target.value)}
          placeholder="10+ Years in Pavagada"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
        {[
          { key: 'hasHomeService', label: 'Doorstep / Home Visit Available' },
          { key: 'hasEmergencyService', label: 'Emergency / On-call Response' },
          { key: 'hasShopLocation', label: 'Physical Workshop / Shop on Premise' },
        ].map((item) => (
          <label
            key={item.key}
            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
              data[item.key]
                ? 'bg-cyan-950/40 border-cyan-600 text-cyan-200 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <input
              type="checkbox"
              checked={Boolean(data[item.key] !== false)}
              onChange={(e) => updateField(item.key, e.target.checked)}
              className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-800"
            />
            <span className="text-xs">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Pill, Truck, Clock, ShieldCheck } from 'lucide-react';
import { TextField } from '../../common/TextField';

interface PharmacyCategoryFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const PharmacyCategoryForm: React.FC<PharmacyCategoryFormProps> = ({
  data = {},
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-2">
        <Pill size={16} className="text-emerald-400" />
        <span>Pharmacy & Medical Store Attributes</span>
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {[
          { key: 'is24Hours', label: '24/7 Open Round the Clock' },
          { key: 'hasHomeDelivery', label: 'Local Medicine Home Delivery' },
          { key: 'hasGenericMedicines', label: 'Generic Medicines In Stock' },
          { key: 'isJanAushadhiKendra', label: 'Jan Aushadhi Kendra (PMBJP)' },
          { key: 'hasOnlineOrdering', label: 'WhatsApp / Phone Medicine Ordering' },
          { key: 'hasEmergencyNightService', label: 'Emergency Night Bell Service' },
        ].map((item) => (
          <label
            key={item.key}
            className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
              data[item.key]
                ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <input
              type="checkbox"
              checked={Boolean(data[item.key])}
              onChange={(e) => updateField(item.key, e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-800"
            />
            <span className="text-xs">{item.label}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <TextField
          label="Drug License Number (DL No.)"
          value={data.drugLicenseNo || ''}
          onChange={(e) => updateField('drugLicenseNo', e.target.value)}
          placeholder="e.g. KA-TU-2024-XXXX"
          helperText="Official drug retail license number issued by Drugs Control Dept"
        />

        <TextField
          label="Payment Methods Accepted"
          value={data.paymentMethods || 'UPI (PhonePe, GPay), Cash, Cards'}
          onChange={(e) => updateField('paymentMethods', e.target.value)}
          placeholder="UPI, Cash, Debit Card, Credit Card"
        />
      </div>
    </div>
  );
};

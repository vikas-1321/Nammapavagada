import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { TextField } from './TextField';
import { Textarea } from './Textarea';

interface AddressFieldProps {
  address: string;
  area: string;
  pincode: string;
  landmark: string;
  onAddressChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onPincodeChange: (value: string) => void;
  onLandmarkChange: (value: string) => void;
  required?: boolean;
}

const COMMON_TALUK_AREAS = [
  'Pavagada Town',
  'Fort Area / Hill Base',
  'Bus Stand Road',
  'Kalyanadurga Road',
  'Challakere Road',
  'M.G. Road',
  'Court Complex Area',
  'Taluk Hospital Road',
  'Kyathaganacherlu',
  'Nagasamudra',
  'Vadamalakunte',
  'Thirumani (Solar Park)',
  'Rayarlapalli',
  'Kotagudda',
  'Y.N. Hosakote',
  'Roppa',
  'Gujjanadu',
];

export const AddressField: React.FC<AddressFieldProps> = ({
  address,
  area,
  pincode,
  landmark,
  onAddressChange,
  onAreaChange,
  onPincodeChange,
  onLandmarkChange,
  required = true,
}) => {
  return (
    <div className="space-y-4">
      <Textarea
        label="Full Physical Address"
        required={required}
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder="Door number, street name, building or lane, Pavagada, Karnataka 561202"
        helperText="Complete postal street address"
        rows={2}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Area / Locality {required && <span className="text-rose-400 font-bold">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              list="taluk-areas-list"
              value={area}
              onChange={(e) => onAreaChange(e.target.value)}
              placeholder="e.g. Pavagada Town"
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <datalist id="taluk-areas-list">
              {COMMON_TALUK_AREAS.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>
        </div>

        <TextField
          label="Postal PIN Code"
          value={pincode}
          onChange={(e) => onPincodeChange(e.target.value)}
          placeholder="561202"
          helperText="Default: 561202 (Pavagada Head Post)"
          icon={<Navigation size={14} />}
        />

        <TextField
          label="Prominent Landmark"
          value={landmark}
          onChange={(e) => onLandmarkChange(e.target.value)}
          placeholder="e.g. Near KSRTC Bus Stand"
          helperText="Helps citizens locate the premises"
          icon={<MapPin size={14} />}
        />
      </div>
    </div>
  );
};

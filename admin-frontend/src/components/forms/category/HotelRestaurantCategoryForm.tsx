import React from 'react';
import { Utensils, Hotel } from 'lucide-react';
import { TextField } from '../../common/TextField';

interface HotelRestaurantCategoryFormProps {
  isRestaurant: boolean;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const HotelRestaurantCategoryForm: React.FC<HotelRestaurantCategoryFormProps> = ({
  isRestaurant,
  data = {},
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center gap-2 mb-2">
        {isRestaurant ? (
          <Utensils size={16} className="text-orange-400" />
        ) : (
          <Hotel size={16} className="text-orange-400" />
        )}
        <h4 className="text-xs font-bold text-white">
          {isRestaurant ? 'Dining, Cuisine & Dietary Details' : 'Hotel, Lodging & Accommodation Amenities'}
        </h4>
      </div>

      {isRestaurant ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <TextField
              label="Cuisine Categories"
              value={data.cuisine || 'South Indian, North Indian, Andhra'}
              onChange={(e) => updateField('cuisine', e.target.value)}
              placeholder="South Indian, Andhra, Chinese, Biryani"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Dietary Category
              </label>
              <select
                value={data.dietary || 'VEG_NON_VEG'}
                onChange={(e) => updateField('dietary', e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="PURE_VEG">Pure Vegetarian (Shuddha Shakahara)</option>
                <option value="VEG_NON_VEG">Vegetarian & Non-Vegetarian</option>
                <option value="NON_VEG_SPECIALTY">Non-Vegetarian Specialty</option>
              </select>
            </div>

            <TextField
              label="Special Dishes / Specialties"
              value={data.specialties || ''}
              onChange={(e) => updateField('specialties', e.target.value)}
              placeholder="Thatte Idli, Ragi Mudde, Mutton Biryani"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
            {[
              { key: 'servesBreakfast', label: 'Morning Breakfast' },
              { key: 'servesLunch', label: 'Afternoon Full Meals' },
              { key: 'servesDinner', label: 'Evening Dinner' },
              { key: 'hasTakeaway', label: 'Parcel / Takeaway Counter' },
              { key: 'hasHomeDelivery', label: 'Door Delivery' },
              { key: 'hasParking', label: 'Dedicated Parking' },
              { key: 'acceptsUpi', label: 'Accepts UPI & QR' },
              { key: 'hasAcDining', label: 'Air Conditioned Dining Hall' },
            ].map((item) => (
              <label
                key={item.key}
                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                  data[item.key]
                    ? 'bg-orange-950/40 border-orange-600 text-orange-200 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(data[item.key] !== false)}
                  onChange={(e) => updateField(item.key, e.target.checked)}
                  className="rounded border-slate-700 text-orange-500 focus:ring-0 bg-slate-800"
                />
                <span className="text-[11px]">{item.label}</span>
              </label>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <TextField
              label="Room Categories"
              value={data.roomTypes || 'Single, Double, Deluxe AC, Family Suite'}
              onChange={(e) => updateField('roomTypes', e.target.value)}
              placeholder="Single, Double, Deluxe AC"
            />

            <TextField
              label="Standard Check-in Time"
              value={data.checkInTime || '12:00 PM'}
              onChange={(e) => updateField('checkInTime', e.target.value)}
              placeholder="12:00 PM (or 24 Hours)"
            />

            <TextField
              label="Standard Check-out Time"
              value={data.checkOutTime || '11:00 AM'}
              onChange={(e) => updateField('checkOutTime', e.target.value)}
              placeholder="11:00 AM"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
            {[
              { key: 'hasAirConditioning', label: 'AC Rooms Available' },
              { key: 'hasHotWater247', label: '24/7 Hot Water' },
              { key: 'hasWifi', label: 'Free High-speed Wi-Fi' },
              { key: 'hasInhouseRestaurant', label: 'In-house Restaurant' },
              { key: 'hasCarParking', label: 'Safe Car Parking' },
              { key: 'hasRoomService', label: '24-hour Room Service' },
              { key: 'hasPowerBackup', label: 'Generator Power Backup' },
              { key: 'hasElevator', label: 'Elevator / Lift' },
            ].map((item) => (
              <label
                key={item.key}
                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                  data[item.key]
                    ? 'bg-orange-950/40 border-orange-600 text-orange-200 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(data[item.key])}
                  onChange={(e) => updateField(item.key, e.target.checked)}
                  className="rounded border-slate-700 text-orange-500 focus:ring-0 bg-slate-800"
                />
                <span className="text-[11px]">{item.label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

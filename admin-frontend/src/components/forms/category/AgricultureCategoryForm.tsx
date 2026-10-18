import React from 'react';
import { Wheat, ShoppingBag } from 'lucide-react';
import { TextField } from '../../common/TextField';

interface AgricultureCategoryFormProps {
  isApmc: boolean;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const AgricultureCategoryForm: React.FC<AgricultureCategoryFormProps> = ({
  isApmc,
  data = {},
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center gap-2 mb-2">
        {isApmc ? (
          <Wheat size={16} className="text-emerald-400" />
        ) : (
          <ShoppingBag size={16} className="text-emerald-400" />
        )}
        <h4 className="text-xs font-bold text-white">
          {isApmc ? 'APMC Wholesale Yard & Produce Trading' : 'Agricultural Inputs & Farm Equipment Store'}
        </h4>
      </div>

      {isApmc ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <TextField
              label="APMC Market Days"
              value={data.marketDays || 'Wednesday & Saturday'}
              onChange={(e) => updateField('marketDays', e.target.value)}
              placeholder="e.g. Wednesday & Saturday"
            />

            <TextField
              label="Auction Timings"
              value={data.auctionTimings || '08:00 AM – 02:00 PM'}
              onChange={(e) => updateField('auctionTimings', e.target.value)}
              placeholder="08:00 AM – 02:00 PM"
            />

            <TextField
              label="Crops & Commodities Handled"
              value={data.cropsHandled || 'Groundnut (Shenga), Tamarind, Ragi, Maize, Castor'}
              onChange={(e) => updateField('cropsHandled', e.target.value)}
              placeholder="Groundnut, Tamarind, Ragi, Maize"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
            {[
              { key: 'hasWeighbridge', label: 'Electronic Weighbridge (Dharmakanta)' },
              { key: 'hasFarmerRestHouse', label: 'Farmer Rest House (Raitha Bhavana)' },
              { key: 'hasWarehousing', label: 'Godown / Storage Warehouse' },
              { key: 'hasE_NAM', label: 'e-NAM Digital Auction Trading' },
            ].map((item) => (
              <label
                key={item.key}
                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
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
                <span className="text-[11px]">{item.label}</span>
              </label>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {[
              { key: 'sellsSeeds', label: 'Certified & Hybrid Seeds' },
              { key: 'sellsFertilizers', label: 'Chemical & Organic Fertilizers' },
              { key: 'sellsPesticides', label: 'Pesticides & Bio-control' },
              { key: 'sellsIrrigation', label: 'Drip & Sprinkler Irrigation Pipes' },
              { key: 'sellsFarmMachinery', label: 'Farm Tools, Sprayers & Machinery' },
              { key: 'hasSoilTesting', label: 'Soil Testing Consultation' },
            ].map((item) => (
              <label
                key={item.key}
                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
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
              label="Authorised Dealerships / Brands"
              value={data.authorisedBrands || ''}
              onChange={(e) => updateField('authorisedBrands', e.target.value)}
              placeholder="IFFCO, KRIBHCO, Bayer, Syngenta, Jain Irrigation"
            />

            <TextField
              label="Subsidy Scheme Authorization"
              value={data.subsidyAuthorization || ''}
              onChange={(e) => updateField('subsidyAuthorization', e.target.value)}
              placeholder="Department of Agriculture authorized subsidy outlet"
            />
          </div>
        </>
      )}
    </div>
  );
};

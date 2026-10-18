import React from 'react';
import { Landmark, CreditCard } from 'lucide-react';
import { TextField } from '../../common/TextField';
import { PhoneField } from '../../common/PhoneField';

interface BankAtmCategoryFormProps {
  isAtm: boolean;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const BankAtmCategoryForm: React.FC<BankAtmCategoryFormProps> = ({
  isAtm,
  data = {},
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center gap-2 mb-2">
        {isAtm ? (
          <CreditCard size={16} className="text-purple-400" />
        ) : (
          <Landmark size={16} className="text-purple-400" />
        )}
        <h4 className="text-xs font-bold text-white">
          {isAtm ? 'ATM / Cash Deposit Recycler Specs' : 'Bank Branch Banking & Customer Services'}
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <TextField
          label="Bank Name / Organization"
          value={data.bankName || ''}
          onChange={(e) => updateField('bankName', e.target.value)}
          placeholder="State Bank of India / Canara Bank / KGB"
        />

        {!isAtm ? (
          <>
            <TextField
              label="Branch Name"
              value={data.branchName || ''}
              onChange={(e) => updateField('branchName', e.target.value)}
              placeholder="Pavagada Main Branch"
            />

            <TextField
              label="IFSC Code (11 alphanumeric)"
              value={data.ifscCode || ''}
              onChange={(e) => updateField('ifscCode', e.target.value.toUpperCase())}
              placeholder="SBIN0000894"
              helperText="Essential code for NEFT, RTGS, and IMPS"
            />
          </>
        ) : (
          <>
            <TextField
              label="Kiosk ID / Machine Identifier"
              value={data.kioskId || ''}
              onChange={(e) => updateField('kioskId', e.target.value)}
              placeholder="PVG-ATM-01"
            />

            <TextField
              label="Weekly Cash Availability Note"
              value={data.cashAvailabilityNote || 'Daily replenishment'}
              onChange={(e) => updateField('cashAvailabilityNote', e.target.value)}
              placeholder="24/7 Cash withdrawal active"
            />
          </>
        )}
      </div>

      {/* Facilities Checkboxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
        {(isAtm
          ? [
              { key: 'is24HoursAtm', label: '24/7 Unrestricted Access' },
              { key: 'hasCashDeposit', label: 'Cash Deposit Machine (CDM)' },
              { key: 'hasWheelchairRamp', label: 'Wheelchair Ramp Access' },
              { key: 'hasSecurityGuard', label: 'Security Guard Stationed' },
            ]
          : [
              { key: 'hasOnsiteAtm', label: 'On-site 24/7 ATM' },
              { key: 'hasCashDeposit', label: 'Cash Deposit Machine (CDM)' },
              { key: 'hasPassbookPrinter', label: 'Self-Service Passbook Kiosk' },
              { key: 'hasSafeDepositLocker', label: 'Safe Deposit Locker Facility' },
              { key: 'hasAgriculturalBanking', label: 'Kisan Credit / Agri Loans Desk' },
              { key: 'hasGoldLoanDesk', label: 'Gold Loan Counter' },
              { key: 'hasWheelchairRamp', label: 'Wheelchair Accessible Ramp' },
              { key: 'hasForexService', label: 'Foreign Exchange / Remittance' },
            ]
        ).map((item) => (
          <label
            key={item.key}
            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
              data[item.key]
                ? 'bg-purple-950/40 border-purple-600 text-purple-200 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <input
              type="checkbox"
              checked={Boolean(data[item.key])}
              onChange={(e) => updateField(item.key, e.target.checked)}
              className="rounded border-slate-700 text-purple-500 focus:ring-0 bg-slate-800"
            />
            <span className="text-[11px]">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

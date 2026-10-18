import React from 'react';
import { Plus, Trash2, ShieldAlert, HeartPulse, Stethoscope } from 'lucide-react';
import { TextField } from '../../common/TextField';
import { PhoneField } from '../../common/PhoneField';

interface HospitalCategoryFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const HospitalCategoryForm: React.FC<HospitalCategoryFormProps> = ({
  data = {},
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const doctors = Array.isArray(data.doctors) ? data.doctors : [];

  const addDoctor = () => {
    updateField('doctors', [...doctors, { name: '', specialization: '', timing: '' }]);
  };

  const removeDoctor = (idx: number) => {
    updateField('doctors', doctors.filter((_: any, i: number) => i !== idx));
  };

  const updateDoctor = (idx: number, key: string, val: string) => {
    const next = [...doctors];
    next[idx] = { ...next[idx], [key]: val };
    updateField('doctors', next);
  };

  return (
    <div className="space-y-6">
      {/* 1. Emergency & Critical Care */}
      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/60 space-y-4">
        <h4 className="text-xs font-bold text-rose-300 flex items-center gap-2">
          <ShieldAlert size={16} className="text-rose-400" />
          <span>Emergency & Critical Care Infrastructure</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            { key: 'hasEmergency247', label: '24/7 Emergency Casualty Desk' },
            { key: 'hasTraumaCare', label: 'Trauma Care Unit' },
            { key: 'hasSnakebiteTreatment', label: 'Snakebite Antivenom Treatment' },
            { key: 'hasIcu', label: 'Intensive Care Unit (ICU)' },
            { key: 'hasAmbulance', label: 'Dedicated Ambulance On-Premises' },
            { key: 'hasBloodStorage', label: 'Blood Storage / Component Desk' },
            { key: 'hasOperationTheatre', label: 'Operation Theatre (OT)' },
          ].map((item) => (
            <label
              key={item.key}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                data[item.key]
                  ? 'bg-rose-950/60 border-rose-600 text-rose-200 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(data[item.key])}
                onChange={(e) => updateField(item.key, e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-0 bg-slate-800"
              />
              <span className="text-xs">{item.label}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <PhoneField
            label="Direct Emergency Casualty Phone"
            value={data.emergencyPhone || ''}
            onChange={(val) => updateField('emergencyPhone', val)}
            placeholder="08136-244222 or 108"
            helperText="Direct desk number dialed by citizens in life-or-death urgency"
          />

          <TextField
            label="Bed Capacity"
            type="number"
            value={data.bedCapacity || ''}
            onChange={(e) => updateField('bedCapacity', e.target.value)}
            placeholder="e.g. 100"
            helperText="Registered general, maternity, and ICU beds"
          />
        </div>
      </div>

      {/* 2. Medical Departments & Clinical Facilities */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <HeartPulse size={16} className="text-emerald-400" />
          <span>Departments & Facilities Available</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {[
            { key: 'hasPharmacy', label: 'In-house Pharmacy' },
            { key: 'hasDiagnosticLab', label: 'Pathology & Diagnostic Lab' },
            { key: 'hasXray', label: 'Digital X-Ray' },
            { key: 'hasUltrasound', label: 'Ultrasound (USG)' },
            { key: 'hasDialysis', label: 'Dialysis Center' },
            { key: 'hasMaternityWard', label: 'Maternity / Labour Ward' },
            { key: 'hasPediatricCare', label: 'Pediatric / SNCU Unit' },
            { key: 'hasAyushmanBharat', label: 'Ayushman Bharat / AB-Arkogya Kiosk' },
          ].map((item) => (
            <label
              key={item.key}
              className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                data[item.key]
                  ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200 font-semibold'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <TextField
            label="Departments List (Comma separated)"
            value={data.departmentsText || ''}
            onChange={(e) => updateField('departmentsText', e.target.value)}
            placeholder="General Medicine, Obstetrics & Gynaecology, Paediatrics, Orthopaedics, Ophthalmology"
          />

          <TextField
            label="Insurances Accepted"
            value={data.insuranceText || ''}
            onChange={(e) => updateField('insuranceText', e.target.value)}
            placeholder="Ayushman Bharat, Arogya Karnataka, Yeshasvini, Star Health"
          />
        </div>
      </div>

      {/* 3. Doctors & Consulting Specialists */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Stethoscope size={16} className="text-emerald-400" />
            <span>Consulting Doctors & Medical Specialists</span>
          </h4>

          <button
            type="button"
            onClick={addDoctor}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
          >
            <Plus size={13} />
            <span>Add Doctor</span>
          </button>
        </div>

        {doctors.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No individual doctor profiles listed yet.</p>
        ) : (
          <div className="space-y-2">
            {doctors.map((doc: any, i: number) => (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Doctor Name (e.g. Dr. Ramesh Kumar)"
                  value={doc.name || ''}
                  onChange={(e) => updateDoctor(i, 'name', e.target.value)}
                  className="flex-1 min-w-[150px] px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Specialization (e.g. MD General Medicine)"
                  value={doc.specialization || ''}
                  onChange={(e) => updateDoctor(i, 'specialization', e.target.value)}
                  className="w-48 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Consultation Timings (e.g. 10 AM - 1 PM)"
                  value={doc.timing || ''}
                  onChange={(e) => updateDoctor(i, 'timing', e.target.value)}
                  className="w-44 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => removeDoctor(i)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Practical Citizen Information */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={Boolean(data.walkInAvailable !== false)}
            onChange={(e) => updateField('walkInAvailable', e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-800"
          />
          <span>Walk-in OPD Available</span>
        </label>

        <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={Boolean(data.appointmentRequired)}
            onChange={(e) => updateField('appointmentRequired', e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-800"
          />
          <span>Appointment Required for Specialists</span>
        </label>

        <div className="flex items-center gap-2">
          <select
            value={data.hospitalSector || 'Government'}
            onChange={(e) => updateField('hospitalSector', e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Government">Government / Taluk Hospital</option>
            <option value="Private">Private Hospital / Nursing Home</option>
            <option value="Trust">Charitable / Trust Hospital</option>
          </select>
        </div>
      </div>
    </div>
  );
};

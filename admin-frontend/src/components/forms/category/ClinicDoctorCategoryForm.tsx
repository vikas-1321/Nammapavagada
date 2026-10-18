import React from 'react';
import { TextField } from '../../common/TextField';
import { PhoneField } from '../../common/PhoneField';

interface ClinicDoctorCategoryFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const ClinicDoctorCategoryForm: React.FC<ClinicDoctorCategoryFormProps> = ({
  data = {},
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <h4 className="text-xs font-bold text-white mb-2">Clinic & Consulting Physician Details</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <TextField
          label="Lead Doctor / Practitioner Name"
          value={data.doctorName || ''}
          onChange={(e) => updateField('doctorName', e.target.value)}
          placeholder="Dr. S. Ramesh, MBBS, DCH"
        />

        <TextField
          label="Medical Qualification"
          value={data.qualification || ''}
          onChange={(e) => updateField('qualification', e.target.value)}
          placeholder="MBBS, MD (Pediatrics), DGO"
        />

        <TextField
          label="Clinical Specialization"
          value={data.specialization || ''}
          onChange={(e) => updateField('specialization', e.target.value)}
          placeholder="General Medicine, Child Specialist, Dental, Eye"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField
          label="Consultation Timings"
          value={data.consultationTimings || ''}
          onChange={(e) => updateField('consultationTimings', e.target.value)}
          placeholder="Morning: 10:00 AM – 01:30 PM, Evening: 05:00 PM – 08:30 PM"
        />

        <PhoneField
          label="Appointment / Clinic Booking Phone"
          value={data.consultationPhone || ''}
          onChange={(val) => updateField('consultationPhone', val)}
          placeholder="08136-244111 or 9845012345"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField
          label="Services & Treatments Offered"
          value={data.servicesOffered || ''}
          onChange={(e) => updateField('servicesOffered', e.target.value)}
          placeholder="General fever checkup, Blood pressure, Diabetes monitoring, ECG, Nebulization"
        />

        <TextField
          label="Languages Spoken by Doctor & Staff"
          value={data.languagesSpoken || 'Kannada, Telugu, English'}
          onChange={(e) => updateField('languagesSpoken', e.target.value)}
          placeholder="Kannada, Telugu, Hindi, English"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={Boolean(data.walkInAllowed !== false)}
            onChange={(e) => updateField('walkInAllowed', e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-800"
          />
          <span>Walk-in Accepted</span>
        </label>

        <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={Boolean(data.appointmentRequired)}
            onChange={(e) => updateField('appointmentRequired', e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-800"
          />
          <span>Prior Appointment Required</span>
        </label>

        <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={Boolean(data.hasHomeVisits)}
            onChange={(e) => updateField('hasHomeVisits', e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-800"
          />
          <span>Elderly Home Visits Available</span>
        </label>
      </div>
    </div>
  );
};

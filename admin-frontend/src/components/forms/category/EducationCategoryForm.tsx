import React from 'react';
import { GraduationCap, School, BookOpen } from 'lucide-react';
import { TextField } from '../../common/TextField';
import { PhoneField } from '../../common/PhoneField';
import { EmailField } from '../../common/EmailField';

interface EducationCategoryFormProps {
  isSchool: boolean;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const EducationCategoryForm: React.FC<EducationCategoryFormProps> = ({
  isSchool,
  data = {},
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-5 p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center gap-2 mb-2">
        {isSchool ? (
          <School size={16} className="text-indigo-400" />
        ) : (
          <GraduationCap size={16} className="text-indigo-400" />
        )}
        <h4 className="text-xs font-bold text-white">
          {isSchool ? 'School Academic Curriculum & Standards' : 'College, Courses & Higher Education Profile'}
        </h4>
      </div>

      {/* 1. Academic Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <TextField
          label={isSchool ? 'Affiliation Board' : 'Affiliating University / Council'}
          value={data.board || (isSchool ? 'Karnataka State Board (KSEAB)' : 'Tumkur University')}
          onChange={(e) => updateField('board', e.target.value)}
          placeholder={isSchool ? 'State Board / CBSE' : 'Tumkur University / DTE Karnataka'}
        />

        <TextField
          label={isSchool ? 'Classes Offered' : 'Academic Degrees / Diplomas'}
          value={data.classesOrDegrees || ''}
          onChange={(e) => updateField('classesOrDegrees', e.target.value)}
          placeholder={isSchool ? 'Class 1 to 10 (SSLC)' : 'B.A., B.Sc., B.Com., M.A.'}
        />

        <TextField
          label="Medium of Instruction"
          value={data.medium || 'Kannada & English Medium'}
          onChange={(e) => updateField('medium', e.target.value)}
          placeholder="Kannada, English"
        />
      </div>

      {!isSchool && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextField
            label="Streams & Subject Combinations"
            value={data.streamsCombinations || ''}
            onChange={(e) => updateField('streamsCombinations', e.target.value)}
            placeholder="Science (PCMB, PCMC), Commerce (EBAC, HEBA), Arts (HEPS)"
          />

          <TextField
            label="Eligibility Criteria"
            value={data.eligibility || ''}
            onChange={(e) => updateField('eligibility', e.target.value)}
            placeholder="SSLC pass for PU College, PUC pass for Degree"
          />
        </div>
      )}

      {/* 2. Campus Facilities */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <label className="text-xs font-semibold text-slate-300 block">
          Campus Infrastructure & Facilities
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {[
            { key: 'hasComputerLab', label: 'Computer Lab' },
            { key: 'hasScienceLab', label: 'Science Lab' },
            { key: 'hasLibrary', label: 'Library' },
            { key: 'hasPlayground', label: 'Playground / Sports Field' },
            { key: 'hasHostel', label: 'Residential Hostel' },
            { key: 'hasSchoolBus', label: 'Bus / Van Transport' },
            { key: 'hasCanteen', label: 'Canteen / Midday Meals' },
            { key: 'hasWheelchairAccess', label: 'Wheelchair Ramp Access' },
          ].map((item) => (
            <label
              key={item.key}
              className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                data[item.key]
                  ? 'bg-indigo-950/40 border-indigo-600 text-indigo-200 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(data[item.key])}
                onChange={(e) => updateField(item.key, e.target.checked)}
                className="rounded border-slate-700 text-indigo-500 focus:ring-0 bg-slate-800"
              />
              <span className="text-[11px]">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Admissions & Principal Office Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
        <PhoneField
          label="Admissions / Principal Contact"
          value={data.admissionsPhone || ''}
          onChange={(val) => updateField('admissionsPhone', val)}
          placeholder="08136-244333"
        />

        <EmailField
          label="Admissions Desk Email"
          value={data.admissionsEmail || ''}
          onChange={(val) => updateField('admissionsEmail', val)}
          placeholder="admissions@college.edu.in"
        />

        <TextField
          label="Student Timings"
          value={data.studentTimings || '09:30 AM – 04:30 PM (Mon–Sat)'}
          onChange={(e) => updateField('studentTimings', e.target.value)}
          placeholder="09:30 AM – 04:30 PM"
        />
      </div>
    </div>
  );
};

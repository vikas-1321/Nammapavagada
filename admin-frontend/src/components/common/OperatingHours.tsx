import React, { useState } from 'react';
import { Clock, Plus, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { StructuredHours, DaySchedule, OperatingSlot } from '../../types';

interface OperatingHoursProps {
  value?: StructuredHours;
  onChange: (value: StructuredHours) => void;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const OperatingHours: React.FC<OperatingHoursProps> = ({
  value = {},
  onChange,
}) => {
  const is24Hours = Boolean(value.is24Hours);
  const isClosedAll = Boolean(value.isClosed);
  const schedule = value.schedule || {};

  const getDaySchedule = (day: string): DaySchedule => {
    return schedule[day] || {
      isClosed: day === 'sunday',
      is24Hours: false,
      slots: [{ open: '09:00 AM', close: '05:00 PM', name: 'General' }],
    };
  };

  const updateScheduleForDay = (day: string, dayData: Partial<DaySchedule>) => {
    const current = getDaySchedule(day);
    const updatedDay: DaySchedule = { ...current, ...dayData };
    const nextSchedule = { ...schedule, [day]: updatedDay };
    onChange({
      ...value,
      is24Hours: false,
      isClosed: false,
      schedule: nextSchedule,
    });
  };

  const setGlobal247 = () => {
    const nextSched: Record<string, DaySchedule> = {};
    DAYS_OF_WEEK.forEach((d) => {
      nextSched[d.key] = { isClosed: false, is24Hours: true, slots: [] };
    });
    onChange({
      ...value,
      is24Hours: true,
      isClosed: false,
      open: '24 Hours',
      close: '24 Hours',
      days: 'Daily (24/7)',
      schedule: nextSched,
    });
  };

  const setStandardGovt = () => {
    const nextSched: Record<string, DaySchedule> = {};
    DAYS_OF_WEEK.forEach((d) => {
      if (d.key === 'sunday') {
        nextSched[d.key] = { isClosed: true, is24Hours: false, slots: [] };
      } else {
        nextSched[d.key] = {
          isClosed: false,
          is24Hours: false,
          slots: [{ open: '10:00 AM', close: '05:30 PM', name: 'Office Hours' }],
        };
      }
    });
    onChange({
      ...value,
      is24Hours: false,
      isClosed: false,
      open: '10:00 AM',
      close: '05:30 PM',
      days: 'Mon–Sat (Sun Closed)',
      schedule: nextSched,
    });
  };

  const setSplitHospital = () => {
    const nextSched: Record<string, DaySchedule> = {};
    DAYS_OF_WEEK.forEach((d) => {
      if (d.key === 'sunday') {
        nextSched[d.key] = {
          isClosed: false,
          is24Hours: false,
          slots: [{ open: '09:00 AM', close: '01:00 PM', name: 'Morning Clinic' }],
        };
      } else {
        nextSched[d.key] = {
          isClosed: false,
          is24Hours: false,
          slots: [
            { open: '09:00 AM', close: '01:00 PM', name: 'Morning' },
            { open: '04:30 PM', close: '08:30 PM', name: 'Evening' },
          ],
        };
      }
    });
    onChange({
      ...value,
      is24Hours: false,
      isClosed: false,
      open: '09:00 AM',
      close: '08:30 PM',
      days: 'Mon–Sun (Split)',
      schedule: nextSched,
    });
  };

  const copyMondayToWeekdays = () => {
    const mon = getDaySchedule('monday');
    const nextSched = { ...schedule };
    ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach((d) => {
      nextSched[d] = JSON.parse(JSON.stringify(mon));
    });
    onChange({ ...value, schedule: nextSched });
  };

  const addSlot = (day: string) => {
    const cur = getDaySchedule(day);
    const slots = [...(cur.slots || [])];
    slots.push({ open: '02:00 PM', close: '06:00 PM', name: 'Evening' });
    updateScheduleForDay(day, { slots, isClosed: false, is24Hours: false });
  };

  const removeSlot = (day: string, idx: number) => {
    const cur = getDaySchedule(day);
    const slots = (cur.slots || []).filter((_, i) => i !== idx);
    updateScheduleForDay(day, { slots });
  };

  const updateSlot = (day: string, idx: number, field: 'open' | 'close' | 'name', val: string) => {
    const cur = getDaySchedule(day);
    const slots = [...(cur.slots || [])];
    if (slots[idx]) {
      slots[idx] = { ...slots[idx], [field]: val };
      updateScheduleForDay(day, { slots });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Quick Preset Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Clock size={15} className="text-emerald-400" />
            <span>Structured Operating Hours</span>
          </label>
          <p className="text-[11px] text-slate-500">
            Define exact daily operating hours, multi-slot timings, and weekly closures.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={setGlobal247}
            className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-colors ${
              is24Hours
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            24/7 Round the Clock
          </button>
          <button
            type="button"
            onClick={setStandardGovt}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-medium transition-colors"
          >
            Standard Govt (10 AM - 5:30 PM)
          </button>
          <button
            type="button"
            onClick={setSplitHospital}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-medium transition-colors"
          >
            Morning + Evening Split
          </button>
          <button
            type="button"
            onClick={copyMondayToWeekdays}
            title="Copies Monday timings to Tuesday through Saturday"
            className="px-2 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Copy size={12} />
            <span>Copy Mon to Sat</span>
          </button>
        </div>
      </div>

      {/* Day by Day List */}
      <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
        {DAYS_OF_WEEK.map((d) => {
          const dayData = getDaySchedule(d.key);
          const isClosed = dayData.isClosed;
          const is24h = dayData.is24Hours;
          const slots = dayData.slots || [];

          return (
            <div
              key={d.key}
              className={`p-2.5 rounded-xl border transition-all ${
                isClosed
                  ? 'bg-slate-900/40 border-slate-800/50 opacity-70'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Day Label + Status Checkboxes */}
                <div className="flex items-center gap-3 w-44 shrink-0">
                  <span className="font-semibold text-xs text-white">{d.label}</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isClosed}
                        onChange={(e) =>
                          updateScheduleForDay(d.key, {
                            isClosed: e.target.checked,
                            is24Hours: false,
                          })
                        }
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-800"
                      />
                      <span>Closed</span>
                    </label>

                    <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={is24h}
                        onChange={(e) =>
                          updateScheduleForDay(d.key, {
                            is24Hours: e.target.checked,
                            isClosed: false,
                          })
                        }
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-800"
                      />
                      <span>24h</span>
                    </label>
                  </div>
                </div>

                {/* Slots or Status Text */}
                <div className="flex-1 min-w-0">
                  {isClosed ? (
                    <span className="text-xs text-rose-400/90 font-medium italic">
                      Closed all day
                    </span>
                  ) : is24h ? (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Open 24 Hours</span>
                    </span>
                  ) : (
                    <div className="space-y-1.5">
                      {slots.map((slot, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 flex-wrap text-xs">
                          <input
                            type="text"
                            value={slot.name || ''}
                            onChange={(e) => updateSlot(d.key, sIdx, 'name', e.target.value)}
                            placeholder="Slot (e.g. Morning)"
                            className="w-24 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-emerald-500"
                          />
                          <input
                            type="text"
                            value={slot.open}
                            onChange={(e) => updateSlot(d.key, sIdx, 'open', e.target.value)}
                            placeholder="09:00 AM"
                            className="w-24 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-white font-mono focus:outline-none focus:border-emerald-500 text-center"
                          />
                          <span className="text-slate-500 text-xs">to</span>
                          <input
                            type="text"
                            value={slot.close}
                            onChange={(e) => updateSlot(d.key, sIdx, 'close', e.target.value)}
                            placeholder="05:00 PM"
                            className="w-24 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-white font-mono focus:outline-none focus:border-emerald-500 text-center"
                          />

                          {slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSlot(d.key, sIdx)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add slot button */}
                {!isClosed && !is24h && (
                  <button
                    type="button"
                    onClick={() => addSlot(d.key)}
                    className="self-start text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
                  >
                    <Plus size={12} />
                    <span>Add Slot</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Public Notes Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Special Timing Notes / Public Exceptions
        </label>
        <input
          type="text"
          value={value.notes || ''}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder="e.g. Lunch break 01:30 PM – 02:00 PM, Emergency casualty open on all government holidays"
          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
};

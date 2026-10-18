import React from 'react';
import { Film, Plus, Trash2, Ticket, Calendar, Clock } from 'lucide-react';
import { TextField } from '../../common/TextField';

export interface MovieShowtime {
  movieName: string;
  language: string;
  screen: string;
  showDate: string;
  showTime: string;
  ticketPrice: string;
  bookingLink: string;
}

interface CinemaTheatreCategoryFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const CinemaTheatreCategoryForm: React.FC<CinemaTheatreCategoryFormProps> = ({
  data = {},
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const showtimes: MovieShowtime[] = Array.isArray(data.showtimes) ? data.showtimes : [];

  const addShowtime = () => {
    const newShow: MovieShowtime = {
      movieName: '',
      language: 'Kannada',
      screen: 'Screen 1',
      showDate: new Date().toISOString().split('T')[0],
      showTime: '11:00 AM',
      ticketPrice: '₹120 / ₹150',
      bookingLink: '',
    };
    updateField('showtimes', [...showtimes, newShow]);
  };

  const removeShowtime = (idx: number) => {
    updateField(
      'showtimes',
      showtimes.filter((_, i) => i !== idx)
    );
  };

  const updateShowtime = (idx: number, field: keyof MovieShowtime, val: string) => {
    const next = [...showtimes];
    next[idx] = { ...next[idx], [field]: val };
    updateField('showtimes', next);
  };

  return (
    <div className="space-y-6">
      {/* Theatre Specs */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Film size={16} className="text-orange-400" />
          <span>Cinema Hall Infrastructure & Specs</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextField
            label="Number of Screens"
            type="number"
            value={data.screensCount || 1}
            onChange={(e) => updateField('screensCount', parseInt(e.target.value) || 1)}
            placeholder="1"
          />

          <TextField
            label="Audio / Sound System"
            value={data.soundSystem || 'Dolby Digital 7.1'}
            onChange={(e) => updateField('soundSystem', e.target.value)}
            placeholder="Dolby Atmos / 7.1 Surround"
          />

          <TextField
            label="Ticket Counter Opening Time"
            value={data.ticketCounterTime || '10:00 AM'}
            onChange={(e) => updateField('ticketCounterTime', e.target.value)}
            placeholder="10:00 AM"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
          {[
            { key: 'hasAirConditioning', label: 'Air Conditioned (AC)' },
            { key: 'hasParking', label: 'Vehicle Parking Available' },
            { key: 'hasOnlineBooking', label: 'Online Booking (BookMyShow)' },
            { key: 'hasCanteenSnacks', label: 'Snacks & Beverage Counter' },
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
      </div>

      {/* Dynamic Showtimes Structure */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Ticket size={16} className="text-orange-400" />
              <span>Current Movies & Dynamic Showtimes</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Structured showtimes displayed to citizens in the live movies schedule.
            </p>
          </div>

          <button
            type="button"
            onClick={addShowtime}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>Add Show</span>
          </button>
        </div>

        {showtimes.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-3 text-center border border-dashed border-slate-800 rounded-xl">
            No active shows configured. Click "+ Add Show" to add today's movies.
          </p>
        ) : (
          <div className="space-y-3">
            {showtimes.map((show, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={show.movieName}
                      onChange={(e) => updateShowtime(idx, 'movieName', e.target.value)}
                      placeholder="Movie Name (e.g. Kantara Chapter 1)..."
                      className="bg-transparent font-bold text-white focus:outline-none placeholder-slate-500 flex-1"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeShowtime(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Language</label>
                    <input
                      type="text"
                      value={show.language}
                      onChange={(e) => updateShowtime(idx, 'language', e.target.value)}
                      placeholder="Kannada / Telugu"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Screen</label>
                    <input
                      type="text"
                      value={show.screen}
                      onChange={(e) => updateShowtime(idx, 'screen', e.target.value)}
                      placeholder="Screen 1"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Show Date</label>
                    <input
                      type="date"
                      value={show.showDate}
                      onChange={(e) => updateShowtime(idx, 'showDate', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Show Time</label>
                    <input
                      type="text"
                      value={show.showTime}
                      onChange={(e) => updateShowtime(idx, 'showTime', e.target.value)}
                      placeholder="11:00 AM, 02:30 PM, 06:30 PM"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Ticket Price</label>
                    <input
                      type="text"
                      value={show.ticketPrice}
                      onChange={(e) => updateShowtime(idx, 'ticketPrice', e.target.value)}
                      placeholder="₹120 / ₹150"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

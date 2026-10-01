import React, { useState, useEffect } from 'react';
import { Film, Plus, Edit2, Clock, Ticket, Loader2 } from 'lucide-react';
import { adminApi } from '../services/api';
import { Theatre } from '../types';

export const TheatresPage: React.FC = () => {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState<Theatre | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    kannadaName: '',
    address: 'Cinema Road, Pavagada 561202',
    phone: '',
    screensCount: 1,
    currentMoviesStr: '',
    showTimingsStr: '11:00 AM, 02:30 PM, 06:30 PM, 09:30 PM',
    balconyPrice: '₹120',
    firstClassPrice: '₹80',
    secondClassPrice: '₹50',
  });

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTheatres();
      setTheatres(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleOpenAdd = () => {
    setEditingTheatre(null);
    setFormData({
      name: '',
      kannadaName: '',
      address: 'Cinema Road, Pavagada 561202',
      phone: '',
      screensCount: 1,
      currentMoviesStr: 'Yuva (Kannada), Kalki 2898 AD (Telugu)',
      showTimingsStr: '11:00 AM, 02:30 PM, 06:30 PM, 09:30 PM',
      balconyPrice: '₹120',
      firstClassPrice: '₹80',
      secondClassPrice: '₹50',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (th: Theatre) => {
    setEditingTheatre(th);
    setFormData({
      name: th.name,
      kannadaName: th.kannadaName || '',
      address: th.address,
      phone: th.phone || '',
      screensCount: th.screensCount,
      currentMoviesStr: (th.currentMovies || []).join(', '),
      showTimingsStr: (th.showTimings || []).join(', '),
      balconyPrice: th.ticketInfo?.balcony || '₹120',
      firstClassPrice: th.ticketInfo?.firstClass || '₹80',
      secondClassPrice: th.ticketInfo?.secondClass || '₹50',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      kannadaName: formData.kannadaName,
      address: formData.address,
      phone: formData.phone,
      screensCount: formData.screensCount,
      currentMovies: formData.currentMoviesStr.split(',').map((s) => s.trim()).filter(Boolean),
      showTimings: formData.showTimingsStr.split(',').map((s) => s.trim()).filter(Boolean),
      ticketInfo: {
        balcony: formData.balconyPrice,
        firstClass: formData.firstClassPrice,
        secondClass: formData.secondClassPrice,
      },
      status: 'ACTIVE',
    };

    try {
      if (editingTheatre) {
        await adminApi.updateTheatre(editingTheatre.id, payload);
      } else {
        await adminApi.createTheatre(payload);
      }
      setIsModalOpen(false);
      fetchTheatres();
    } catch (err: any) {
      alert(err.message || 'Save failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Film size={18} className="text-purple-400" />
            <span>Cinemas, Movies & Daily Show Timings</span>
          </h3>
          <p className="text-xs text-slate-400">
            Dynamically update current movies, 4 daily show timings, and counter tickets without modifying frontend code.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-forest/30"
        >
          <Plus size={16} />
          <span>Add Cinema Theatre</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-purple-400" />
            <span>Loading cinemas...</span>
          </div>
        ) : (
          theatres.map((th) => (
            <div key={th.id} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                      {th.screensCount} Screen{th.screensCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{th.name}</h4>
                  {th.kannadaName && <p className="text-xs text-slate-400 mt-0.5">{th.kannadaName}</p>}
                </div>
                <button
                  onClick={() => handleOpenEdit(th)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              {/* Current Movies */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-2">
                  <Film size={12} className="text-emerald-400" />
                  <span>Now Showing</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {th.currentMovies && th.currentMovies.length > 0 ? (
                    th.currentMovies.map((m, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold">
                        {m}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No movies currently listed.</span>
                  )}
                </div>
              </div>

              {/* Show Timings */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <Clock size={12} className="text-amber-400" />
                  <span>Daily Show Schedules</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {th.showTimings && th.showTimings.map((time, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs font-mono font-semibold">
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ticket Pricing */}
              {th.ticketInfo && (
                <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Ticket size={14} className="text-slate-500" />
                    <span>Ticket Rates:</span>
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-300">Balcony: <strong className="text-emerald-400">{th.ticketInfo.balcony || '₹120'}</strong></span>
                    <span className="text-slate-300">First: <strong className="text-emerald-400">{th.ticketInfo.firstClass || '₹80'}</strong></span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingTheatre ? `Edit ${editingTheatre.name}` : 'New Cinema Theatre'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Theatre Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sri Venkateshwara Theatre"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Now Showing Movies (Comma-separated) *</label>
                <input
                  type="text"
                  required
                  value={formData.currentMoviesStr}
                  onChange={(e) => setFormData({ ...formData, currentMoviesStr: e.target.value })}
                  placeholder="Movie 1 (Kannada), Movie 2 (Telugu)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Show Timings (Comma-separated) *</label>
                <input
                  type="text"
                  required
                  value={formData.showTimingsStr}
                  onChange={(e) => setFormData({ ...formData, showTimingsStr: e.target.value })}
                  placeholder="11:00 AM, 02:30 PM, 06:30 PM, 09:30 PM"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Balcony</label>
                  <input
                    type="text"
                    value={formData.balconyPrice}
                    onChange={(e) => setFormData({ ...formData, balconyPrice: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Class</label>
                  <input
                    type="text"
                    value={formData.firstClassPrice}
                    onChange={(e) => setFormData({ ...formData, firstClassPrice: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Second Class</label>
                  <input
                    type="text"
                    value={formData.secondClassPrice}
                    onChange={(e) => setFormData({ ...formData, secondClassPrice: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-bold"
                >
                  Save Theatre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

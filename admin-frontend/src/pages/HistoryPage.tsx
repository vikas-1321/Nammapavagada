import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Edit2, ShieldAlert, BookOpen, Loader2 } from 'lucide-react';
import { adminApi } from '../services/api';
import { HistoryEra, HistoricalPlace } from '../types';

export const HistoryPage: React.FC = () => {
  const [eras, setEras] = useState<HistoryEra[]>([]);
  const [places, setPlaces] = useState<HistoricalPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ERAS' | 'STRUCTURES'>('ERAS');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEra, setEditingEra] = useState<HistoryEra | null>(null);
  const [eraForm, setEraForm] = useState({
    id: '',
    eraName: '',
    kannadaTitle: '',
    timeRange: '',
    summary: '',
    pdfEvidence: '',
    primaryRulersStr: '',
    keyEventsStr: '',
    displayOrder: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eRes, pRes] = await Promise.all([
        adminApi.getHistoryEras(),
        adminApi.getHistoricalPlaces(),
      ]);
      setEras(eRes || []);
      setPlaces(pRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddEra = () => {
    setEditingEra(null);
    setEraForm({
      id: '',
      eraName: '',
      kannadaTitle: '',
      timeRange: '',
      summary: '',
      pdfEvidence: 'Authoritative research documented in Civil Engineering and Architecture (2022) / Barry Lewis (2002)',
      primaryRulersStr: '',
      keyEventsStr: '',
      displayOrder: eras.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditEra = (era: HistoryEra) => {
    setEditingEra(era);
    setEraForm({
      id: era.id,
      eraName: era.eraName,
      kannadaTitle: era.kannadaTitle || '',
      timeRange: era.timeRange,
      summary: era.summary,
      pdfEvidence: era.pdfEvidence,
      primaryRulersStr: (era.primaryRulers || []).join(', '),
      keyEventsStr: (era.keyEvents || []).join('\n'),
      displayOrder: era.displayOrder,
    });
    setIsModalOpen(true);
  };

  const handleSaveEra = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: eraForm.id || eraForm.eraName.toLowerCase().replace(/\s+/g, '-'),
      eraName: eraForm.eraName,
      kannadaTitle: eraForm.kannadaTitle,
      timeRange: eraForm.timeRange,
      summary: eraForm.summary,
      pdfEvidence: eraForm.pdfEvidence,
      primaryRulers: eraForm.primaryRulersStr.split(',').map((s) => s.trim()).filter(Boolean),
      keyEvents: eraForm.keyEventsStr.split('\n').map((s) => s.trim()).filter(Boolean),
      displayOrder: eraForm.displayOrder,
      status: 'ACTIVE',
    };

    try {
      if (editingEra) {
        await adminApi.updateHistoryEra(editingEra.id, payload);
      } else {
        await adminApi.createHistoryEra(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Save failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Historical Accuracy Principle Notice */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
        <ShieldAlert size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90">
          <p className="font-bold text-white">Historical Integrity & Academic Verification Principle</p>
          <p className="mt-0.5">
            Pavagada historical content must strictly adhere to documented archaeological surveys and verified records (Barry Lewis, Vivek & Sagar, Cheluvarajan). Do NOT fabricate dates, rulers, battles, or events.
          </p>
        </div>
      </div>

      {/* Tabs & Add */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ERAS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'ERAS' ? 'bg-forest text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Chronological Eras ({eras.length})
          </button>
          <button
            onClick={() => setActiveTab('STRUCTURES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'STRUCTURES' ? 'bg-forest text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Fort Defense Structures ({places.length})
          </button>
        </div>
        {activeTab === 'ERAS' && (
          <button
            onClick={handleOpenAddEra}
            className="px-4 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-forest/30"
          >
            <Plus size={16} />
            <span>Add History Era</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <Loader2 size={24} className="animate-spin mx-auto mb-2 text-amber-400" />
          <span>Loading historical content...</span>
        </div>
      ) : activeTab === 'ERAS' ? (
        <div className="space-y-4">
          {eras.map((era) => (
            <div key={era.id} className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      {era.timeRange}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Order #{era.displayOrder}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-white">{era.eraName}</h4>
                  {era.kannadaTitle && <p className="text-xs text-slate-400 mt-0.5">{era.kannadaTitle}</p>}
                </div>
                <button
                  onClick={() => handleOpenEditEra(era)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{era.summary}</p>

              {era.keyEvents && era.keyEvents.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Key Historical Events</span>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    {era.keyEvents.map((evt, idx) => (
                      <li key={idx} className="leading-snug">{evt}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <BookOpen size={13} className="text-amber-400 shrink-0" />
                <span className="font-medium">Evidence Source:</span>
                <span className="italic text-slate-300">{era.pdfEvidence}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {places.map((place) => (
            <div key={place.id} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
                  {place.classification}
                </span>
                {place.elevationMeters && (
                  <span className="text-[10px] text-slate-400 font-mono">Elevation: {place.elevationMeters}m</span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white">{place.name}</h4>
              {place.kannadaName && <p className="text-xs text-slate-400">{place.kannadaName}</p>}
              <p className="text-xs text-slate-300 line-clamp-3">{place.description}</p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                <BookOpen size={12} className="text-amber-400" />
                <span className="truncate">{place.pdfSource}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Era Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingEra ? `Edit Era: ${editingEra.eraName}` : 'Add Historical Timeline Era'}
            </h3>
            <form onSubmit={handleSaveEra} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Era Name *</label>
                <input
                  type="text"
                  required
                  value={eraForm.eraName}
                  onChange={(e) => setEraForm({ ...eraForm, eraName: e.target.value })}
                  placeholder="e.g. Sovereign Paleygar Era"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time Range *</label>
                  <input
                    type="text"
                    required
                    value={eraForm.timeRange}
                    onChange={(e) => setEraForm({ ...eraForm, timeRange: e.target.value })}
                    placeholder="1586 – 1652 CE"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={eraForm.displayOrder}
                    onChange={(e) => setEraForm({ ...eraForm, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kannada Title</label>
                <input
                  type="text"
                  value={eraForm.kannadaTitle}
                  onChange={(e) => setEraForm({ ...eraForm, kannadaTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Summary *</label>
                <textarea
                  rows={3}
                  required
                  value={eraForm.summary}
                  onChange={(e) => setEraForm({ ...eraForm, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Key Chronological Events (One per line)</label>
                <textarea
                  rows={3}
                  value={eraForm.keyEventsStr}
                  onChange={(e) => setEraForm({ ...eraForm, keyEventsStr: e.target.value })}
                  placeholder="1586: Chieftaincy granted&#10;1591: Hill fort construction begins"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Academic / PDF Evidence Source *</label>
                <input
                  type="text"
                  required
                  value={eraForm.pdfEvidence}
                  onChange={(e) => setEraForm({ ...eraForm, pdfEvidence: e.target.value })}
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
                  Save Era
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

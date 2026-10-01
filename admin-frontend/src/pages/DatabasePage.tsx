import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, Loader2, ArrowRight } from 'lucide-react';
import { adminApi } from '../services/api';
import { AdminTab } from '../components/layout/Sidebar';

interface DatabasePageProps {
  onNavigate: (tab: AdminTab) => void;
}

export const DatabasePage: React.FC<DatabasePageProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await adminApi.search(query.trim());
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial search for 'fort' to show immediate data
    adminApi.search('fort').then((data) => setResults(data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Database size={18} className="text-emerald-400" />
          <span>Cross-Entity Database Explorer</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Query indexed records across all application modules: Locations, Transit, Hospitals, Schools, Theatres, and Heritage.
        </p>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all modules (e.g. 'fort', 'hospital', 'KSRTC', 'college')..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold transition-colors"
          >
            Execute Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-400" />
          <span>Searching cross-entity database...</span>
        </div>
      ) : results ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>
              Found <strong className="text-white">{results.totalMatches}</strong> total records matching query: <code className="text-emerald-400">"{results.query || 'all'}"</code>
            </span>
          </div>

          {/* Locations Results */}
          {results.locations?.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Locations ({results.locations.length})
                </h4>
                <button
                  onClick={() => onNavigate('locations')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>Open in Locations CMS</span>
                  <ArrowRight size={12} />
                </button>
              </div>
              <div className="divide-y divide-slate-800/60">
                {results.locations.map((loc: any) => (
                  <div key={loc.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold mr-2">{loc.code}</span>
                      <strong className="text-white">{loc.name}</strong>
                      <span className="text-slate-400 ml-2">({loc.category})</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{loc.summary}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {loc.coordinates?.latitude}, {loc.coordinates?.longitude}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bus Routes & Stops */}
          {(results.busRoutes?.length > 0 || results.busStops?.length > 0) && (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Transportation ({results.busRoutes?.length || 0} Routes, {results.busStops?.length || 0} Stops)
                </h4>
                <button
                  onClick={() => onNavigate('buses')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <span>Open in Buses CMS</span>
                  <ArrowRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.busRoutes?.map((r: any) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">{r.routeCode}</span>
                    <p className="font-bold text-white mt-0.5">{r.source} → {r.destination}</p>
                    <p className="text-[11px] text-slate-400">{r.operator}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hospitals Results */}
          {results.hospitals?.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Healthcare ({results.hospitals.length})
                </h4>
                <button
                  onClick={() => onNavigate('hospitals')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                >
                  <span>Open in Hospitals CMS</span>
                  <ArrowRight size={12} />
                </button>
              </div>
              {results.hospitals.map((h: any) => (
                <div key={h.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white">{h.name}</strong>
                    <p className="text-[11px] text-slate-400">{h.address}</p>
                  </div>
                  <span className="font-mono text-rose-400 text-xs font-bold">{h.emergencyPhone}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Bus,
  Building2,
  GraduationCap,
  Film,
  Landmark,
  Image as ImageIcon,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { adminApi } from '../services/api';
import { DashboardOverview } from '../types';
import { AdminTab } from '../components/layout/Sidebar';

interface OverviewPageProps {
  onNavigate: (tab: AdminTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await adminApi.getOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard overview', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        <Activity className="animate-spin mr-2 text-emerald-400" size={20} />
        <span>Loading system overview...</span>
      </div>
    );
  }

  const stats = data?.statistics;

  const statCards = [
    { label: 'Total Locations', count: stats?.totalLocations || 0, icon: <MapPin className="text-emerald-400" />, tab: 'locations' as AdminTab, highlight: `${stats?.activeLocations || 0} Active` },
    { label: 'Bus Routes', count: stats?.totalBusRoutes || 0, icon: <Bus className="text-blue-400" />, tab: 'buses' as AdminTab, highlight: `${stats?.totalBusStops || 0} Stops` },
    { label: 'Hospitals', count: stats?.totalHospitals || 0, icon: <Building2 className="text-rose-400" />, tab: 'hospitals' as AdminTab, highlight: '24/7 Casualty' },
    { label: 'Schools', count: stats?.totalSchools || 0, icon: <GraduationCap className="text-amber-400" />, tab: 'education' as AdminTab, highlight: 'High Schools' },
    { label: 'Colleges', count: stats?.totalColleges || 0, icon: <GraduationCap className="text-teal-400" />, tab: 'education' as AdminTab, highlight: 'Degrees / PU' },
    { label: 'Theatres', count: stats?.totalTheatres || 0, icon: <Film className="text-purple-400" />, tab: 'theatres' as AdminTab, highlight: 'Live Shows' },
    { label: 'Historical Places', count: stats?.totalHistoricalPlaces || 0, icon: <Landmark className="text-amber-500" />, tab: 'history' as AdminTab, highlight: 'Survey Sources' },
    { label: 'Amazon S3 Photos', count: stats?.totalPhotos || 0, icon: <ImageIcon className="text-emerald-300" />, tab: 'photos' as AdminTab, highlight: 'Cloud Storage' },
  ];

  return (
    <div className="space-y-8">
      {/* Alert Banner: Missing Photos / Photo Request Workflow */}
      {(stats?.missingPhotosCount ?? 0) > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-900/60 flex items-center justify-center text-amber-300 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Photo Request Workflow: {stats?.missingPhotosCount} places need authentic photographs
              </h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Authentic local photographs (entrance, exterior, interior) required from the project owner. No generated placeholders.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('photos')}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Review Photo Requests</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Grid of Statistics */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Application Dataset Stats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate(card.tab)}
              className="p-5 rounded-2xl glass-panel hover:border-slate-600 transition-all cursor-pointer group hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
                  {card.icon}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {card.highlight}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-white tracking-tight">{card.count}</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Quick Actions & Recent Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>⚡ Quick Actions</span>
          </h3>
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('locations')}
              className="w-full py-2.5 px-4 rounded-xl bg-forest hover:bg-forest-light text-white font-semibold text-xs transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Plus size={16} />
                <span>Add New Location</span>
              </span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => onNavigate('buses')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Bus size={16} />
                <span>Create Bus Route / Schedule</span>
              </span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => onNavigate('photos')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <ImageIcon size={16} />
                <span>Upload Photos to S3</span>
              </span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => onNavigate('search')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Activity size={16} />
                <span>Unified Data Search</span>
              </span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Live Public Map Status:</p>
            <p className="mt-1 flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={14} />
              <span>Connected dynamically to REST API</span>
            </p>
          </div>
        </div>

        {/* Recently Added Locations */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin size={16} className="text-emerald-400" />
              <span>Recently Published Locations</span>
            </h3>
            <button
              onClick={() => onNavigate('locations')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View All Locations →
            </button>
          </div>

          <div className="space-y-3">
            {data?.recentLocations?.map((loc) => (
              <div
                key={loc.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{loc.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {loc.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{loc.summary}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    loc.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                  }`}>
                    {loc.status}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    {loc.coordinates.latitude.toFixed(4)}, {loc.coordinates.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Preview */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-blue-400" />
            <span>Recent Administrative Activities</span>
          </h3>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            Complete Audit Trail →
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {data?.recentActivities?.map((act) => (
            <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  act.action === 'CREATE' ? 'bg-emerald-950 text-emerald-400' :
                  act.action === 'UPDATE' ? 'bg-blue-950 text-blue-400' :
                  act.action === 'DELETE' ? 'bg-red-950 text-red-400' :
                  'bg-purple-950 text-purple-400'
                }`}>
                  {act.action}
                </span>
                <span className="text-slate-300">
                  <span className="font-semibold text-white">{act.entityType}</span> ({act.entityId})
                </span>
                <span className="text-slate-500 text-[11px]">by {act.adminEmail}</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">
                {act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

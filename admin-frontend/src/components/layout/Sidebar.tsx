import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Tag,
  Bus,
  Building2,
  GraduationCap,
  Film,
  Landmark,
  Image as ImageIcon,
  Search,
  Database,
  History,
  Users,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type AdminTab =
  | 'overview'
  | 'locations'
  | 'categories'
  | 'buses'
  | 'hospitals'
  | 'education'
  | 'theatres'
  | 'history'
  | 'photos'
  | 'search'
  | 'database'
  | 'audit'
  | 'users'
  | 'settings';

interface SidebarProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user } = useAuth();

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ReactNode; superAdminOnly?: boolean }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'locations', label: 'Locations', icon: <MapPin size={18} /> },
    { id: 'categories', label: 'Categories', icon: <Tag size={18} /> },
    { id: 'buses', label: 'Bus Routes & Stops', icon: <Bus size={18} /> },
    { id: 'hospitals', label: 'Hospitals', icon: <Building2 size={18} /> },
    { id: 'education', label: 'Schools & Colleges', icon: <GraduationCap size={18} /> },
    { id: 'theatres', label: 'Theatres & Shows', icon: <Film size={18} /> },
    { id: 'history', label: 'Historical Content', icon: <Landmark size={18} /> },
    { id: 'photos', label: 'Photos / Media (S3)', icon: <ImageIcon size={18} /> },
    { id: 'search', label: 'Unified Search', icon: <Search size={18} /> },
    { id: 'database', label: 'Database Explorer', icon: <Database size={18} /> },
    { id: 'audit', label: 'Audit Trail', icon: <History size={18} /> },
    { id: 'users', label: 'Admin Users', icon: <Users size={18} />, superAdminOnly: true },
    { id: 'settings', label: 'System & AWS', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-white shadow-md shadow-forest/30">
          <ShieldCheck size={22} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight text-white tracking-wide">Namma Pavagada</h1>
          <p className="text-[11px] text-emerald-400 font-medium tracking-wider uppercase">Admin CMS Portal</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Content & Modules
        </div>

        {navItems.map((item) => {
          if (item.superAdminOnly && user?.role !== 'SUPER_ADMIN') {
            return null;
          }

          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-forest text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className={isActive ? 'text-emerald-300' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Info & Role Banner */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold uppercase tracking-wider">
            {user?.role}
          </span>
          <span className="text-slate-500 font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

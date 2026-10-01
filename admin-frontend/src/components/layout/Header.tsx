import React from 'react';
import { LogOut, ExternalLink, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminTab } from './Sidebar';

interface HeaderProps {
  currentTab: AdminTab;
}

export const Header: React.FC<HeaderProps> = ({ currentTab }) => {
  const { user, logout } = useAuth();

  const titleMap: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: { title: 'Dashboard Overview', subtitle: 'System statistics, pending tasks, and recent updates' },
    locations: { title: 'Location Management', subtitle: 'Add, edit, coordinate, and curate Namma Pavagada points of interest' },
    categories: { title: 'Categories Registry', subtitle: 'Manage functional sectors, badge styling, and module toggles' },
    buses: { title: 'Bus Transportation Network', subtitle: 'Manage KSRTC/APSRTC bus routes, ordered stops, and timetable runs' },
    hospitals: { title: 'Hospitals & Emergency Health', subtitle: 'Manage taluk referral healthcare, 24/7 casualty desks, and facilities' },
    education: { title: 'Schools & Colleges', subtitle: 'Collegiate and higher secondary institutions across the taluk' },
    theatres: { title: 'Theatres & Cinema Runs', subtitle: 'Single-screen cinemas, movie show schedules, and ticketing' },
    history: { title: 'Historical Heritage Content', subtitle: 'Authoritative eras, defense bastions, and documented academic citations' },
    photos: { title: 'Photo Management (Amazon S3)', subtitle: 'S3 media repository, primary covers, and Photo Request Workflow' },
    search: { title: 'Unified Data Search', subtitle: 'Query across all entities, coordinates, and local records' },
    database: { title: 'Database Explorer', subtitle: 'Inspect, filter, and audit all stored records' },
    audit: { title: 'Administrative Audit Trail', subtitle: 'Immutable timestamped logs of all administrative modifications and diffs' },
    users: { title: 'Admin Users & Permissions', subtitle: 'Manage administrative staff, roles, and access credentials' },
    settings: { title: 'AWS Cloud & System Settings', subtitle: 'Database connectivity, Amazon S3 bucket parameters, and environment state' },
  };

  const current = titleMap[currentTab] || { title: 'Admin Console', subtitle: '' };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{current.title}</h2>
        <p className="text-xs text-slate-400">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Link to Public Website */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          title="Open Public Website in new tab"
        >
          <Globe size={14} className="text-emerald-400" />
          <span>View Public Site</span>
          <ExternalLink size={12} className="text-slate-400" />
        </a>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-900/50 bg-red-950/30 text-xs font-semibold text-red-300 hover:bg-red-900/40 transition-colors"
          title="Sign out of Admin Dashboard"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

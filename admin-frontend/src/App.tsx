import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, AdminTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { LocationsPage } from './pages/LocationsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { BusesPage } from './pages/BusesPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { EducationPage } from './pages/EducationPage';
import { TheatresPage } from './pages/TheatresPage';
import { HistoryPage } from './pages/HistoryPage';
import { PhotosPage } from './pages/PhotosPage';
import { DatabasePage } from './pages/DatabasePage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { Loader2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 size={32} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentTab={currentTab} />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && <OverviewPage onNavigate={setCurrentTab} />}
          {currentTab === 'locations' && <LocationsPage />}
          {currentTab === 'categories' && <CategoriesPage />}
          {currentTab === 'buses' && <BusesPage />}
          {currentTab === 'hospitals' && <HospitalsPage />}
          {currentTab === 'education' && <EducationPage />}
          {currentTab === 'theatres' && <TheatresPage />}
          {currentTab === 'history' && <HistoryPage />}
          {currentTab === 'photos' && <PhotosPage />}
          {currentTab === 'search' && <DatabasePage onNavigate={setCurrentTab} />}
          {currentTab === 'database' && <DatabasePage onNavigate={setCurrentTab} />}
          {currentTab === 'audit' && <AuditLogsPage />}
          {currentTab === 'users' && <UsersPage />}
          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AdminDashboard />
    </AuthProvider>
  );
};

export default App;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CommunityCategoryGrid } from '../components/community/CommunityCategoryGrid';
import { CategoryDirectoryView } from '../components/community/CategoryDirectoryView';
import { TransitScheduleView } from '../components/services/TransitScheduleView';
import { CivicOfficesView } from '../components/services/CivicOfficesView';
import { EmergencyDirectory } from '../components/services/EmergencyDirectory';
import { communityService } from '../services/communityService';
import { serviceDirectoryService } from '../services/serviceDirectoryService';
import { CommunityCategoryKey } from '../types/community';
import { TransitScheduleItem } from '../types/service';
import { ArrowLeft, Bus, Building2, ShieldAlert, Sparkles, PhoneCall, MapPin, Clock } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  // Parse initial category from window.location.hash (e.g. #community/hospitals or #services/transport)
  const getCategoryFromHash = (): CommunityCategoryKey | null => {
    const hash = window.location.hash.replace('#', '').trim();
    const parts = hash.split('/');
    if (parts.length >= 2 && (parts[0] === 'community' || parts[0] === 'services')) {
      const key = parts[1].toLowerCase() as CommunityCategoryKey;
      const validKeys: CommunityCategoryKey[] = [
        'hospitals',
        'transport',
        'schools',
        'colleges',
        'entertainment',
        'government',
        'banks',
        'food',
        'emergency',
      ];
      if (validKeys.includes(key)) {
        return key;
      }
    }
    return null;
  };

  const [activeCategory, setActiveCategory] = useState<CommunityCategoryKey | null>(getCategoryFromHash);
  const [categories, setCategories] = useState(() => communityService.getCategories());
  const [totalCount, setTotalCount] = useState(() => communityService.getTotalServicesCount());

  // Transit state for Bus & Transport view
  const [transitRoutes, setTransitRoutes] = useState<TransitScheduleItem[]>(() =>
    serviceDirectoryService.getTransitRoutes()
  );
  const [isRefreshingTransit, setIsRefreshingTransit] = useState<boolean>(false);
  const [isTransitApiLoaded, setIsTransitApiLoaded] = useState<boolean>(() =>
    serviceDirectoryService.isApiLoaded()
  );
  const [transitLastSyncedAt, setTransitLastSyncedAt] = useState<Date | null>(() =>
    serviceDirectoryService.getLastSyncedAt()
  );

  const civicOffices = useMemo(() => serviceDirectoryService.getCivicOffices(), []);
  const emergencyContacts = useMemo(() => serviceDirectoryService.getEmergencyContacts(), []);

  // Sync category changes with browser hash
  useEffect(() => {
    const handleHashChange = () => {
      const cat = getCategoryFromHash();
      setActiveCategory(cat);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Subscribe to community service reactive updates (e.g., dynamic counts from backend)
  useEffect(() => {
    const unsubscribeCommunity = communityService.subscribe(() => {
      setCategories(communityService.getCategories());
      setTotalCount(communityService.getTotalServicesCount());
    });

    const unsubscribeTransit = serviceDirectoryService.subscribe(() => {
      setTransitRoutes(serviceDirectoryService.getTransitRoutes());
      setIsTransitApiLoaded(serviceDirectoryService.isApiLoaded());
      setTransitLastSyncedAt(serviceDirectoryService.getLastSyncedAt());
    });

    // Proactively sync backend data
    communityService.syncCountsFromBackend().then(() => {
      setCategories(communityService.getCategories());
      setTotalCount(communityService.getTotalServicesCount());
    });

    serviceDirectoryService.refreshFromApi().then((success) => {
      if (success) {
        setTransitRoutes(serviceDirectoryService.getTransitRoutes());
        setIsTransitApiLoaded(true);
        setTransitLastSyncedAt(serviceDirectoryService.getLastSyncedAt());
      }
    });

    return () => {
      unsubscribeCommunity();
      unsubscribeTransit();
    };
  }, []);

  // Handler to select category and update hash
  const handleSelectCategory = (categoryId: string) => {
    const validKey = categoryId as CommunityCategoryKey;
    setActiveCategory(validKey);
    window.location.hash = `community/${validKey}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler to return to category directory
  const handleBackToDirectory = () => {
    setActiveCategory(null);
    window.location.hash = 'community';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Transit refresh handler
  const handleTransitRefresh = useCallback(async () => {
    setIsRefreshingTransit(true);
    await serviceDirectoryService.refreshFromApi();
    setTransitRoutes(serviceDirectoryService.getTransitRoutes());
    setIsTransitApiLoaded(serviceDirectoryService.isApiLoaded());
    setTransitLastSyncedAt(serviceDirectoryService.getLastSyncedAt());
    setIsRefreshingTransit(false);
  }, []);

  const activeCategoryMeta = activeCategory
    ? communityService.getCategoryById(activeCategory)
    : undefined;

  return (
    <div className="py-6 md:py-10">
      {/* 1. Landing View: Category Directory Grid */}
      {!activeCategory && (
        <CommunityCategoryGrid
          categories={categories}
          totalServicesCount={totalCount}
          onSelectCategory={handleSelectCategory}
          activeCategoryId={activeCategory}
        />
      )}

      {/* 2. Dedicated Category Page: Bus & Transport */}
      {activeCategory === 'transport' && activeCategoryMeta && (
        <div className="space-y-8 animate-fadeIn pb-12">
          {/* Top Breadcrumb */}
          <div className="flex items-center justify-between border-b border-soft-sand pb-4">
            <button
              type="button"
              onClick={handleBackToDirectory}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-forest-green transition-colors group rounded-lg px-2 py-1"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to All Categories</span>
            </button>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
              Transit Corridors · Pavagada Central Station
            </span>
          </div>

          {/* Transport Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {transitRoutes.length} active routes
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-medium text-slate-500">KSRTC & APSRTC Corridors</span>
                </div>
                <h1 className="font-serif text-2xl md:text-4xl font-bold text-dark-text tracking-tight">
                  {activeCategoryMeta.name}
                </h1>
                <p className="font-serif text-sm md:text-base text-slate-600 font-medium">
                  {activeCategoryMeta.kannadaName}
                </p>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed font-sans">
                  {activeCategoryMeta.description}
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-700">
                <Bus className="w-8 h-8 stroke-[1.8]" />
              </div>
            </div>
          </div>

          {/* Existing Transit Schedule View with routes, stops, timings, search */}
          <TransitScheduleView
            routes={transitRoutes}
            onRefresh={handleTransitRefresh}
            isRefreshing={isRefreshingTransit}
            lastSyncedAt={transitLastSyncedAt}
            isApiLoaded={isTransitApiLoaded}
          />

          {/* Footer Category Switcher */}
          <div className="pt-8 border-t border-soft-sand space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Explore Other Categories
            </span>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c.id !== 'transport')
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCategory(c.id)}
                    className="text-xs font-medium px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-forest-green hover:text-forest-green transition-all"
                  >
                    {c.name}
                    <span className="ml-1.5 text-slate-400 font-mono">({c.initialCount})</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Dedicated Category Page: Government Offices */}
      {activeCategory === 'government' && activeCategoryMeta && (
        <div className="space-y-8 animate-fadeIn pb-12">
          <div className="flex items-center justify-between border-b border-soft-sand pb-4">
            <button
              type="button"
              onClick={handleBackToDirectory}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-forest-green transition-colors group rounded-lg px-2 py-1"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to All Categories</span>
            </button>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
              Taluk Administration & Public Desks
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                    {civicOffices.length} administrative offices
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-medium text-slate-500">Pavagada Taluk</span>
                </div>
                <h1 className="font-serif text-2xl md:text-4xl font-bold text-dark-text tracking-tight">
                  {activeCategoryMeta.name}
                </h1>
                <p className="font-serif text-sm md:text-base text-slate-600 font-medium">
                  {activeCategoryMeta.kannadaName}
                </p>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed font-sans">
                  {activeCategoryMeta.description}
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-700">
                <Building2 className="w-8 h-8 stroke-[1.8]" />
              </div>
            </div>
          </div>

          {/* Civic Offices View */}
          <CivicOfficesView offices={civicOffices} />

          {/* Footer Category Switcher */}
          <div className="pt-8 border-t border-soft-sand space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Explore Other Categories
            </span>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c.id !== 'government')
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCategory(c.id)}
                    className="text-xs font-medium px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-forest-green hover:text-forest-green transition-all"
                  >
                    {c.name}
                    <span className="ml-1.5 text-slate-400 font-mono">({c.initialCount})</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Dedicated Category Page: Emergency Services */}
      {activeCategory === 'emergency' && activeCategoryMeta && (
        <div className="space-y-8 animate-fadeIn pb-12">
          <div className="flex items-center justify-between border-b border-soft-sand pb-4">
            <button
              type="button"
              onClick={handleBackToDirectory}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-forest-green transition-colors group rounded-lg px-2 py-1"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to All Categories</span>
            </button>
            <span className="text-xs font-mono text-red-600 font-bold uppercase tracking-wider hidden sm:inline">
              24/7 Rapid Emergency Response Network
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-red-200 p-6 md:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                    Active 24/7 Helplines
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-medium text-slate-500">Immediate First Response</span>
                </div>
                <h1 className="font-serif text-2xl md:text-4xl font-bold text-dark-text tracking-tight">
                  {activeCategoryMeta.name}
                </h1>
                <p className="font-serif text-sm md:text-base text-slate-600 font-medium">
                  {activeCategoryMeta.kannadaName}
                </p>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed font-sans">
                  {activeCategoryMeta.description}
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-red-50 text-red-600 border border-red-200">
                <ShieldAlert className="w-8 h-8 stroke-[1.8]" />
              </div>
            </div>
          </div>

          {/* Emergency Directory Contacts */}
          <EmergencyDirectory contacts={emergencyContacts} />

          {/* Footer Category Switcher */}
          <div className="pt-8 border-t border-soft-sand space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Explore Other Categories
            </span>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c.id !== 'emergency')
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCategory(c.id)}
                    className="text-xs font-medium px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-forest-green hover:text-forest-green transition-all"
                  >
                    {c.name}
                    <span className="ml-1.5 text-slate-400 font-mono">({c.initialCount})</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. General Reusable Category Page for all other categories:
          Hospitals & Healthcare, Schools, Colleges, Theatres & Entertainment, Banks & ATMs, Hotels & Restaurants */}
      {activeCategory &&
        activeCategoryMeta &&
        activeCategory !== 'transport' &&
        activeCategory !== 'government' &&
        activeCategory !== 'emergency' && (
          <CategoryDirectoryView
            category={activeCategoryMeta}
            places={communityService.getPlacesByCategory(activeCategory)}
            onBack={handleBackToDirectory}
            onSelectCategory={handleSelectCategory}
            allCategories={categories}
          />
        )}
    </div>
  );
};

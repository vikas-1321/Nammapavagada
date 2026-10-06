import React, { useState, useEffect } from 'react';
import { PageRoute } from './types/navigation';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';
import { PlacesPage } from './pages/PlacesPage';
import { LocationsPage } from './pages/LocationsPage';
import { ServicesPage } from './pages/ServicesPage';
import { MapPage } from './pages/MapPage';
import { AboutPage } from './pages/AboutPage';
import { Home, Compass, Landmark, HeartPulse, Map } from 'lucide-react';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>('home');

  // Sync hash routing if present (supports base routes as well as community subroutes like #community/hospitals)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '').trim();
      const [baseRoute] = rawHash.split('/');
      const validRoutes: PageRoute[] = ['home', 'about', 'history', 'places', 'locations', 'services', 'map'];
      
      if (baseRoute === 'community' || baseRoute === 'services') {
        setCurrentRoute('services');
      } else if (validRoutes.includes(baseRoute as PageRoute)) {
        setCurrentRoute(baseRoute as PageRoute);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleRouteChange = (route: PageRoute) => {
    setCurrentRoute(route);
    window.location.hash = route === 'services' ? 'community' : route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-cream text-dark-text font-sans selection:bg-terracotta selection:text-white pb-16 lg:pb-0">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-forest-green text-white px-4 py-2 text-xs uppercase font-bold border-2 border-terracotta rounded-lg shadow-lg"
      >
        Skip directly to main content
      </a>

      {/* Warm Header & Navigation */}
      <Navbar currentRoute={currentRoute} onRouteChange={handleRouteChange} />

      {/* Main Content Viewport */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 lg:px-12">
        {currentRoute === 'home' && <HomePage onRouteChange={handleRouteChange} />}
        {currentRoute === 'about' && <AboutPage />}
        {currentRoute === 'history' && <HistoryPage />}
        {currentRoute === 'places' && <PlacesPage onRouteChange={handleRouteChange} />}
        {currentRoute === 'locations' && <LocationsPage onRouteChange={handleRouteChange} />}
        {currentRoute === 'services' && <ServicesPage />}
        {currentRoute === 'map' && <MapPage />}
      </main>

      {/* Editorial Warm Forest Green Footer */}
      <Footer onRouteChange={handleRouteChange} />

      {/* Mobile Sticky Quick Navigation Bar (One-handed navigation) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-soft-sand px-3 py-2 flex items-center justify-around shadow-lg"
        aria-label="Mobile Bottom Navigation"
      >
        <button
          onClick={() => handleRouteChange('home')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-2.5 rounded-lg transition-colors ${
            currentRoute === 'home' ? 'text-terracotta font-bold' : 'text-muted-text hover:text-forest-green'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleRouteChange('locations')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-2.5 rounded-lg transition-colors ${
            currentRoute === 'locations' || currentRoute === 'places' ? 'text-terracotta font-bold' : 'text-muted-text hover:text-forest-green'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Explore</span>
        </button>

        <button
          onClick={() => handleRouteChange('history')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-2.5 rounded-lg transition-colors ${
            currentRoute === 'history' ? 'text-terracotta font-bold' : 'text-muted-text hover:text-forest-green'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Heritage</span>
        </button>

        <button
          onClick={() => handleRouteChange('services')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-2.5 rounded-lg transition-colors ${
            currentRoute === 'services' ? 'text-terracotta font-bold' : 'text-muted-text hover:text-forest-green'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Community</span>
        </button>

        <button
          onClick={() => handleRouteChange('map')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-2.5 rounded-lg transition-colors ${
            currentRoute === 'map' ? 'text-terracotta font-bold' : 'text-muted-text hover:text-forest-green'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Map</span>
        </button>
      </nav>
    </div>
  );
};

export default App;

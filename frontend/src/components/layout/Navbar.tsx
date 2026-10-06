import React, { useState } from 'react';
import { PageRoute } from '../../types/navigation';
import { Search, Menu, X } from 'lucide-react';

export interface NavbarProps {
  currentRoute: PageRoute;
  onRouteChange: (route: PageRoute) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onRouteChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mapped navigation items to clearly communicate HERITAGE × EXPLORER × COMMUNITY
  const navItems: { id: PageRoute; label: string; badge?: string; concept?: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'locations', label: 'Explorer', badge: 'Places', concept: 'EXPLORER' },
    { id: 'history', label: 'Heritage', badge: 'History', concept: 'HERITAGE' },
    { id: 'services', label: 'Community', badge: 'Services', concept: 'COMMUNITY' },
    { id: 'map', label: 'Map', badge: 'Spatial' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (route: PageRoute) => {
    onRouteChange(route);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine active route or route alias
  const isItemActive = (itemId: PageRoute) => {
    if (currentRoute === itemId) return true;
    if (itemId === 'locations' && currentRoute === 'places') return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-soft-sand shadow-sm transition-all">
      {/* Top Metadata Strip: Warm regional banner */}
      <div className="bg-forest-green text-warm-cream text-xs px-4 md:px-8 py-2 flex flex-wrap justify-between items-center border-b border-forest-green-dark">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-wide">PAVAGADA TALUK</span>
          <span className="text-terracotta">●</span>
          <span className="hidden sm:inline text-soft-sand font-mono">14.1025° N, 77.2798° E</span>
          <span className="hidden md:inline text-soft-sand/70">• Tumakuru, Karnataka</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="hidden md:inline text-soft-sand/80">Elev: 846m</span>
          <span className="hidden sm:inline text-soft-sand/80">PIN: 561202</span>
          <span className="bg-terracotta text-white font-mono px-2 py-0.5 rounded text-[11px] font-semibold">
            KA-64
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-20">
        {/* Brand Identity */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-left group focus-visible:ring-2 focus-visible:ring-terracotta rounded-lg p-1 -ml-1 transition-transform"
          aria-label="Namma Pavagada Home"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-serif font-black tracking-tight text-forest-green group-hover:text-terracotta transition-colors">
              NAMMA PAVAGADA
            </span>
            <span className="hidden sm:inline text-base font-kannada text-earth-brown">
              ನಮ್ಮ ಪಾವಗಡ
            </span>
          </div>
          <div className="text-[11px] font-semibold tracking-wider text-muted-text uppercase flex items-center gap-2 mt-0.5">
            <span className="text-earth-brown font-bold">Heritage</span>
            <span>×</span>
            <span className="text-forest-green font-bold">Explorer</span>
            <span>×</span>
            <span className="text-terracotta font-bold">Community</span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const active = isItemActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  active
                    ? 'bg-forest-green text-white shadow-sm'
                    : 'text-dark-text hover:text-forest-green hover:bg-warm-cream'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && !active && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-soft-sand text-forest-green font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Search Shortcut Button */}
          <button
            onClick={() => handleNavClick('locations')}
            className="ml-3 p-2.5 rounded-lg border border-soft-sand text-forest-green hover:bg-warm-cream hover:border-terracotta hover:text-terracotta transition-colors shadow-sm cursor-pointer"
            title="Search Places in Pavagada"
            aria-label="Search places"
          >
            <Search className="w-4 h-4" />
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-lg border border-soft-sand bg-warm-cream text-forest-green hover:bg-soft-sand transition-colors font-semibold text-sm flex items-center gap-1.5 cursor-pointer"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="text-xs uppercase tracking-wider font-bold">
              {isMobileMenuOpen ? 'Close' : 'Menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-soft-sand bg-white px-4 py-4 space-y-2 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const active = isItemActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                  active
                    ? 'bg-forest-green text-white shadow-sm'
                    : 'text-dark-text hover:bg-warm-cream'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.concept && (
                    <span className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-mono ${
                      active ? 'bg-terracotta text-white' : 'bg-soft-sand text-forest-green'
                    }`}>
                      {item.concept}
                    </span>
                  )}
                </div>
                {item.badge && (
                  <span className={`text-[11px] font-mono ${active ? 'text-soft-sand' : 'text-muted-text'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { PageRoute } from '../types/navigation';
import { HeroSection } from '../components/home/HeroSection';
import { QuickFactsBar } from '../components/home/QuickFactsBar';
import { HistoryTeaser } from '../components/home/HistoryTeaser';
import { PlacesTeaser } from '../components/home/PlacesTeaser';
import { CivicServicesTeaser } from '../components/home/CivicServicesTeaser';
import { LocationDetailModal } from '../components/locations/LocationDetailModal';
import { LocationDetail } from '../types/location';

export interface HomePageProps {
  onRouteChange: (route: PageRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onRouteChange }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationDetail | null>(null);

  return (
    <div className="space-y-6">
      <HeroSection onRouteChange={onRouteChange} />
      <QuickFactsBar />
      <HistoryTeaser onRouteChange={onRouteChange} />
      <PlacesTeaser
        onRouteChange={onRouteChange}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
      />
      <CivicServicesTeaser onRouteChange={onRouteChange} />

      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onNavigateToMap={() => {
            onRouteChange('map');
          }}
        />
      )}
    </div>
  );
};

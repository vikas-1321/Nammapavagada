import React, { useState } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { LocationGrid } from '../components/locations/LocationGrid';
import { LocationDetailModal } from '../components/locations/LocationDetailModal';
import { locationService } from '../services/locationService';
import { LocationDetail } from '../types/location';
import { PageRoute } from '../types/navigation';

export interface PlacesPageProps {
  onRouteChange: (route: PageRoute) => void;
}

export const PlacesPage: React.FC<PlacesPageProps> = ({ onRouteChange }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationDetail | null>(null);

  // Curated prominent places
  const prominentLocations = locationService.getLocations();

  return (
    <div className="space-y-10 py-6 md:py-10">
      <SectionHeader
        number="02"
        categoryLabel="Explorer · Local Discovery"
        title="Important Places of Pavagada"
        kannadaTitle="ಪಾವಗಡದ ಪ್ರಮುಖ ಸ್ಥಳಗಳು"
        description="A curated catalogue of the foremost historical edifices, massive clean energy generation hubs, sacred heritage sites, and vital transport nodes in the taluk."
      />

      <LocationGrid
        locations={prominentLocations}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onViewOnMap={() => onRouteChange('map')}
      />

      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onNavigateToMap={() => onRouteChange('map')}
        />
      )}
    </div>
  );
};

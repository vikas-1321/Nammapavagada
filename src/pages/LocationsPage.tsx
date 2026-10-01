import React, { useState } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { LocationFilterBar } from '../components/locations/LocationFilterBar';
import { LocationGrid } from '../components/locations/LocationGrid';
import { LocationDetailModal } from '../components/locations/LocationDetailModal';
import { locationService } from '../services/locationService';
import { LocationCategory, LocationDetail } from '../types/location';
import { PageRoute } from '../types/navigation';

export interface LocationsPageProps {
  onRouteChange: (route: PageRoute) => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({ onRouteChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationDetail | null>(null);

  const categories = locationService.getCategories();
  const categoryCounts = locationService.getCategoryCounts();

  const filteredLocations = locationService.getLocations({
    category: selectedCategory,
    searchQuery: searchQuery,
  });

  return (
    <div className="space-y-10 py-6 md:py-10">
      <SectionHeader
        number="03"
        categoryLabel="Explorer · Master Place Index"
        title="Pavagada Location Directory"
        kannadaTitle="ಸ್ಥಳಗಳ ಸಮಗ್ರ ಕೋಶ"
        description="Filterable inventory of registered fort structures, megalithic monuments, clean energy installations, administrative headquarters, and public transit nodes."
      />

      <LocationFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        categoryCounts={categoryCounts}
        totalCount={filteredLocations.length}
      />

      <LocationGrid
        locations={filteredLocations}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onViewOnMap={() => onRouteChange('map')}
        onResetFilters={() => {
          setSelectedCategory('ALL');
          setSearchQuery('');
        }}
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

import React, { useState } from 'react';
import { PageRoute } from '../../types/navigation';
import { SectionHeader } from '../common/SectionHeader';
import { Button } from '../common/Button';
import { locationService } from '../../services/locationService';
import { LocationCard } from '../locations/LocationCard';
import { LocationDetail } from '../../types/location';
import { Search } from 'lucide-react';

export interface PlacesTeaserProps {
  onRouteChange: (route: PageRoute) => void;
  onSelectLocation: (location: LocationDetail) => void;
}

export const PlacesTeaser: React.FC<PlacesTeaserProps> = ({
  onRouteChange,
  onSelectLocation,
}) => {
  const [quickQuery, setQuickQuery] = useState('');

  // Get 3 prominent diverse highlights
  const highlightIds = ['pavagada-fort-apex', 'shakti-sthala-solar-park', 'bodula-maramma-megalithic'];
  const highlights = highlightIds
    .map(id => locationService.getLocationById(id))
    .filter((loc): loc is LocationDetail => !!loc);

  const popularChips = [
    { label: 'Fort Citadel', category: 'FORT_HERITAGE' },
    { label: 'Solar Park', category: 'SOLAR_INFRASTRUCTURE' },
    { label: 'Hospitals', category: 'HEALTHCARE' },
    { label: 'Bus Station', category: 'TRANSPORTATION' },
    { label: 'Megalithic', category: 'MEGALITHIC_SITE' },
    { label: 'Temples', category: 'RELIGIOUS' },
  ];

  return (
    <section className="py-16 md:py-24 border-b border-soft-sand" aria-labelledby="explorer-preview-title">
      <SectionHeader
        number="02"
        categoryLabel="Explorer · Local Discovery"
        title="Explore Pavagada"
        kannadaTitle="ಪಾವಗಡದ ಪ್ರಮುಖ ಸ್ಥಳಗಳು"
        description="Find places, services, and important locations. From medieval granite redoubts to the world-scale solar energy corridor."
        action={
          <Button
            variant="accent"
            onClick={() => onRouteChange('locations')}
          >
            Explore Complete Directory
          </Button>
        }
      />

      {/* Interactive Quick Discovery Bar */}
      <div className="bg-white border border-soft-sand rounded-2xl p-6 mb-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-forest-green/60 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onRouteChange('locations');
              }}
              placeholder="Search places in Pavagada (e.g., Fort, Solar, Hospital, Bus...)"
              className="w-full pl-11 pr-24 py-3 rounded-xl border border-soft-sand bg-warm-cream/30 text-sm text-dark-text placeholder:text-muted-text focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
            />
            <button
              type="button"
              onClick={() => onRouteChange('locations')}
              className="absolute right-2 top-2 bg-forest-green text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-forest-green-dark transition-colors"
            >
              Search
            </button>
          </div>

          {/* Popular Category Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs uppercase font-bold text-muted-text mr-1">Popular:</span>
            {popularChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onRouteChange('locations')}
                className="text-xs font-medium px-3 py-1 rounded-full bg-soft-sand/70 text-forest-green hover:bg-forest-green hover:text-white transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Location Cards Grid */}
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        {highlights.map((location) => (
          <div
            key={location.id}
            className="col-span-12 md:col-span-6 lg:col-span-4 flex"
          >
            <LocationCard
              location={location}
              onSelect={onSelectLocation}
              onViewOnMap={() => onRouteChange('map')}
            />
          </div>
        ))}
      </div>

      {/* Geospatial Map Invitation Banner */}
      <div className="mt-12 bg-forest-green text-warm-cream rounded-2xl p-6 md:p-8 border border-forest-green-dark shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-terracotta-light">
            <span>●</span>
            <span>Interactive Spatial Map</span>
          </div>
          <h4 className="text-2xl md:text-3xl font-serif font-bold text-white">
            Geospatial Map of Pavagada Taluk
          </h4>
          <p className="text-sm text-soft-sand/90 max-w-xl font-sans">
            Navigate all registered landmarks, filter by historical and civic categories, and inspect spatial coordinates across the taluk.
          </p>
        </div>
        <Button
          variant="accent"
          size="lg"
          onClick={() => onRouteChange('map')}
        >
          Launch Interactive Map
        </Button>
      </div>
    </section>
  );
};

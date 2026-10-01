import React from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { InteractiveMap } from '../components/map/InteractiveMap';

export const MapPage: React.FC = () => {
  return (
    <div className="space-y-8 py-6 md:py-10">
      <SectionHeader
        number="05"
        categoryLabel="Explorer · Geospatial Atlas"
        title="Interactive Map of Pavagada"
        kannadaTitle="ಪಾವಗಡ ಭೂಪಟ"
        description="Geospatial mapping of the 16th-century hill fortifications, megalithic cemeteries, the 2,050 MW Shakti Sthala solar park perimeter, and municipal institutions."
      />

      <InteractiveMap />
    </div>
  );
};

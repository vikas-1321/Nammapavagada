import React from 'react';
import { LocationDetail } from '../../types/location';
import { Badge } from '../common/Badge';
import { formatCoordinates, formatElevation } from '../../utils/formatting';
import { CATEGORY_REGISTRY } from '../../data/categoriesData';
import { MapPin } from 'lucide-react';

export interface LocationCardProps {
  location: LocationDetail;
  onSelect: (location: LocationDetail) => void;
  onViewOnMap?: (location: LocationDetail) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onSelect,
  onViewOnMap,
}) => {
  const categoryDef = CATEGORY_REGISTRY[location.category];

  // Visual header styling according to category
  const isHeritage = location.category === 'FORT_HERITAGE' || location.category === 'MEGALITHIC_SITE' || location.category === 'RELIGIOUS';
  const isSolar = location.category === 'SOLAR_INFRASTRUCTURE';

  const badgeVariant = isHeritage ? 'earth' : isSolar ? 'terracotta' : 'forest';

  return (
    <article className="bg-white border border-soft-sand hover:border-terracotta/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group">
      <div>
        {/* Subtle Category Header Accent */}
        <div className={`h-2.5 w-full ${
          isSolar ? 'bg-terracotta' : isHeritage ? 'bg-earth-brown' : 'bg-forest-green'
        }`} />

        <div className="p-5 md:p-6">
          {/* Top Meta Line: Code & Category Pill */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-soft-sand/60">
            <span className="font-mono text-xs text-muted-text font-bold">
              {location.code}
            </span>
            <Badge variant={badgeVariant}>
              {categoryDef ? categoryDef.name : location.category}
            </Badge>
          </div>

          {/* Title & Kannada subtitle */}
          <div className="mb-3">
            <h3 className="text-xl font-serif font-bold text-forest-green group-hover:text-terracotta transition-colors leading-snug">
              {location.name}
            </h3>
            {location.kannadaName && (
              <p className="text-sm font-kannada text-earth-brown mt-0.5">
                {location.kannadaName}
              </p>
            )}
          </div>

          {/* Spatial Coordinates & Location Pin */}
          <div className="font-mono text-xs text-forest-green bg-warm-cream/80 border border-soft-sand rounded-lg px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <span>{formatCoordinates(location.coordinates.latitude, location.coordinates.longitude)}</span>
            </span>
            <span className="text-muted-text shrink-0 text-[11px]">
              {formatElevation(location.coordinates.elevationMeters)}
            </span>
          </div>

          {/* Summary Description */}
          <p className="text-sm text-muted-text leading-relaxed mb-5 line-clamp-3 font-sans">
            {location.summary}
          </p>

          {/* Key Attributes List */}
          {location.keyAttributes && location.keyAttributes.length > 0 && (
            <div className="space-y-1.5 mb-2 pt-3 border-t border-soft-sand/60 text-xs">
              {location.keyAttributes.slice(0, 2).map((attr, idx) => (
                <div key={idx} className="flex justify-between items-baseline gap-2">
                  <span className="font-semibold text-forest-green uppercase text-[11px] tracking-wide shrink-0">
                    {attr.label}:
                  </span>
                  <span className="text-muted-text truncate text-right font-mono text-[11px]">
                    {attr.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 md:p-6 pt-0 border-t border-soft-sand/40 mt-auto flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelect(location)}
          className="text-xs uppercase tracking-wider font-bold text-forest-green hover:text-terracotta flex items-center gap-1.5 py-1 transition-colors group/btn"
        >
          <span>View Details</span>
          <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1">
            →
          </span>
        </button>

        {onViewOnMap && (
          <button
            type="button"
            onClick={() => onViewOnMap(location)}
            className="text-xs font-semibold text-muted-text hover:text-forest-green bg-warm-cream/80 hover:bg-soft-sand border border-soft-sand px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <span>Locate</span>
            <span className="text-terracotta">⌖</span>
          </button>
        )}
      </div>
    </article>
  );
};

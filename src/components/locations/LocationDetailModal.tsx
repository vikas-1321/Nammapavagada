import React, { useState } from 'react';
import { LocationDetail } from '../../types/location';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCoordinates, formatElevation } from '../../utils/formatting';
import { CATEGORY_REGISTRY } from '../../data/categoriesData';
import { ShieldCheck, MapPin, Clock, Phone, Globe, ExternalLink } from 'lucide-react';

export interface LocationDetailModalProps {
  location: LocationDetail | null;
  onClose: () => void;
  onNavigateToMap?: (location: LocationDetail) => void;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  location,
  onClose,
  onNavigateToMap,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!location) return null;

  const categoryDef = (CATEGORY_REGISTRY as Record<string, any>)[location.category];
  const hasCoordinates =
    location.coordinates?.latitude != null &&
    location.coordinates?.longitude != null &&
    !isNaN(location.coordinates.latitude) &&
    !isNaN(location.coordinates.longitude);

  const verification = (location as any).verification;

  return (
    <Modal
      isOpen={!!location}
      onClose={onClose}
      title={location.name}
      subtitle={location.kannadaName}
      categoryBadge={categoryDef ? categoryDef.name : (location as any).categoryName || location.category}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-8">
        {/* Optional Photo Banner */}
        {location.primaryPhotoUrl && !imageError && (
          <div className="rounded-2xl overflow-hidden border border-soft-sand max-h-72 w-full bg-soft-sand/30 shadow-xs">
            <img
              src={location.primaryPhotoUrl}
              alt={location.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover max-h-72"
            />
          </div>
        )}

        {/* Spatial Coordinates Box */}
        <div className="bg-warm-cream/60 p-5 rounded-xl border border-soft-sand grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs shadow-sm">
          <div>
            <span className="text-muted-text uppercase block font-semibold text-[11px] mb-0.5">
              Spatial Coordinates
            </span>
            <span className="text-forest-green font-bold text-sm">
              {hasCoordinates
                ? formatCoordinates(location.coordinates.latitude, location.coordinates.longitude)
                : 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-muted-text uppercase block font-semibold text-[11px] mb-0.5">
              Altitude Elevation
            </span>
            <span className="text-forest-green font-bold text-sm">
              {formatElevation(location.coordinates?.elevationMeters)}
            </span>
          </div>
          <div>
            <span className="text-muted-text uppercase block font-semibold text-[11px] mb-0.5">
              Taluk Address Code
            </span>
            <span className="text-terracotta font-bold text-sm">{location.code || 'PVG-LOC'}</span>
          </div>
        </div>

        {/* Verification Status Banner if present */}
        {verification && verification.status && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50/80 border border-emerald-200/70 rounded-xl text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Verification Status:</strong> {verification.status}
              {verification.source ? ` (Source: ${verification.source})` : ''}
            </span>
          </div>
        )}

        {/* Conservation & Historical Alert (if applicable) */}
        {location.historicalContext?.conservationPriority && (
          <div className="border-l-4 border-terracotta bg-warm-cream/50 p-4 rounded-r-xl border border-soft-sand shadow-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-terracotta mb-1">
              <span>● Conservation Appraisal:</span>
              <span>{location.historicalContext.conservationPriority}</span>
            </div>
            <p className="text-xs text-dark-text/80 leading-relaxed font-sans">
              Conservation priority recorded in official taluk archaeological survey.
            </p>
          </div>
        )}

        {/* Narrative Description */}
        <div>
          <h4 className="text-xs uppercase tracking-wider font-bold text-forest-green mb-2.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
            <span>Architectural & Physical Analysis</span>
          </h4>
          <p className="text-base text-dark-text leading-relaxed font-sans">
            {location.fullDescription || location.summary || 'Information not available.'}
          </p>
        </div>

        {/* Address */}
        {location.address && (
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-forest-green mb-1.5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-terracotta" />
              <span>Location Address</span>
            </h4>
            <p className="text-sm text-dark-text/90 font-sans">
              {location.address}
            </p>
          </div>
        )}

        {/* Key Architectural & Engineering Attributes Table */}
        {location.keyAttributes && location.keyAttributes.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-forest-green mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
              <span>Structural Specifications & Engineering Data</span>
            </h4>
            <div className="border border-soft-sand rounded-xl overflow-hidden divide-y divide-soft-sand bg-white shadow-sm">
              {location.keyAttributes.map((attr, idx) => (
                <div key={idx} className="grid grid-cols-12 p-3.5 text-sm hover:bg-warm-cream/40 transition-colors">
                  <div className="col-span-12 md:col-span-4 font-semibold text-forest-green text-xs uppercase tracking-wide">
                    {attr.label}
                  </div>
                  <div className="col-span-12 md:col-span-8 text-dark-text font-mono text-xs md:text-sm mt-0.5 md:mt-0">
                    {attr.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Context Breakdown */}
        {location.historicalContext && (location.historicalContext.era || location.historicalContext.builtYearOrCentury) && (
          <div className="bg-warm-cream/50 border border-soft-sand rounded-xl p-5 md:p-6 space-y-4 shadow-sm">
            <h4 className="text-xs uppercase tracking-wider font-bold text-forest-green border-b border-soft-sand pb-2.5 flex items-center justify-between">
              <span>Historical Chronology & Patronage</span>
              <span className="font-mono text-[11px] text-earth-brown font-semibold">Authoritative Source</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {location.historicalContext.era && (
                <div>
                  <span className="font-semibold text-muted-text block uppercase text-[11px]">Historical Era:</span>
                  <span className="text-forest-green font-bold text-sm">{location.historicalContext.era}</span>
                </div>
              )}
              {location.historicalContext.builtYearOrCentury && (
                <div>
                  <span className="font-semibold text-muted-text block uppercase text-[11px]">Period / Century:</span>
                  <span className="text-forest-green font-bold text-sm">{location.historicalContext.builtYearOrCentury}</span>
                </div>
              )}
              {location.historicalContext.patronRuler && (
                <div>
                  <span className="font-semibold text-muted-text block uppercase text-[11px]">Patron / Chieftain:</span>
                  <span className="text-dark-text font-bold text-sm">{location.historicalContext.patronRuler}</span>
                </div>
              )}
              {location.historicalContext.architecturalStyle && (
                <div>
                  <span className="font-semibold text-muted-text block uppercase text-[11px]">Typology / Style:</span>
                  <span className="text-dark-text font-bold text-sm">{location.historicalContext.architecturalStyle}</span>
                </div>
              )}
            </div>
            {location.historicalContext.pdfSourceDoc && (
              <div className="pt-3 text-[11px] text-muted-text border-t border-soft-sand font-sans">
                <strong className="text-forest-green">Documentation Source: </strong>
                {location.historicalContext.pdfSourceDoc}
              </div>
            )}
          </div>
        )}

        {/* Practical Access & Operating Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {location.hours && (location.hours.open || location.hours.days) && (
            <div className="border border-soft-sand rounded-xl p-5 bg-white shadow-sm">
              <h5 className="text-xs uppercase tracking-wider font-bold text-forest-green mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-forest-green" />
                <span>Visiting & Operational Timings</span>
              </h5>
              <p className="text-base font-bold text-dark-text">
                {location.hours.open} {location.hours.close ? `— ${location.hours.close}` : ''}
              </p>
              {location.hours.days && <p className="text-xs text-muted-text mt-1">{location.hours.days}</p>}
              {location.hours.notes && (
                <p className="text-xs text-earth-brown mt-2.5 italic border-t border-soft-sand pt-2">
                  Notice: {location.hours.notes}
                </p>
              )}
            </div>
          )}

          {location.contact && (location.contact.phone || location.contact.authority || location.contact.website) && (
            <div className="border border-soft-sand rounded-xl p-5 bg-white shadow-sm">
              <h5 className="text-xs uppercase tracking-wider font-bold text-forest-green mb-2">
                Administrative Authority & Contact
              </h5>
              {location.contact.authority && (
                <p className="text-sm font-bold text-dark-text">{location.contact.authority}</p>
              )}
              {location.contact.phone && (
                <p className="text-xs text-forest-green font-mono font-semibold mt-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-forest-green" />
                  <span>Tel: {location.contact.phone}</span>
                </p>
              )}
              {location.contact.website && (
                <a
                  href={location.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-terracotta hover:underline mt-1.5 font-mono inline-flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{location.contact.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Tags & Action Row */}
        <div className="border-t border-soft-sand pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {location.tags &&
              location.tags.map((tag, idx) => (
                <Badge key={idx} variant="sand">
                  #{tag}
                </Badge>
              ))}
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToMap && hasCoordinates && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToMap(location);
                }}
                className="bg-forest-green hover:bg-forest-green-dark text-white px-5 py-2.5 text-xs uppercase tracking-wider font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>View on Map</span>
                <span className="text-terracotta-light">⌖</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-warm-cream text-dark-text px-4 py-2.5 text-xs uppercase tracking-wider font-bold border border-soft-sand rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

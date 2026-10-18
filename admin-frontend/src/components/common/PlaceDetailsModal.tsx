import React from 'react';
import {
  X,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Tag,
  Globe,
  Mail,
  Edit2,
  CheckCircle,
  ExternalLink,
  Building,
  Image as ImageIcon,
} from 'lucide-react';
import { LocationItem } from '../../types';

interface PlaceDetailsModalProps {
  isOpen: boolean;
  location: LocationItem | null;
  onClose: () => void;
  onEdit: (location: LocationItem) => void;
  onVerify: (location: LocationItem) => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
  isOpen,
  location,
  onClose,
  onEdit,
  onVerify,
}) => {
  if (!isOpen || !location) return null;

  const contact = location.contact || {};
  const hours = location.hours || {};
  const categoryData = location.categoryData || {};
  const verification = location.verification || { status: 'PENDING' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-forest/20">
              <Building size={20} className="text-emerald-400" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-emerald-400">{location.code}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {location.subcategory || location.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    location.status === 'DRAFT'
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {location.status}
                </span>
              </div>

              <h2 className="text-base font-bold text-white mt-1 leading-snug">{location.name}</h2>
              {location.kannadaName && (
                <p className="text-xs text-slate-400 mt-0.5">{location.kannadaName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(location);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold transition-colors"
            >
              <Edit2 size={13} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
              Overview Summary
            </h4>
            <p className="text-xs leading-relaxed text-slate-200">{location.summary}</p>
            {location.fullDescription && location.fullDescription !== location.summary && (
              <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60">
                {location.fullDescription}
              </p>
            )}
          </div>

          {/* Verification Audit Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  verification.status === 'VERIFIED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Status: {verification.status}</span>
                  {verification.lastVerifiedAt && (
                    <span className="text-slate-400">
                      &bull; Verified on{' '}
                      {new Date(verification.lastVerifiedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Source: <strong>{verification.source || 'Direct Entry'}</strong>
                  {verification.verifiedBy ? ` by ${verification.verifiedBy}` : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onVerify(location)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold transition-colors"
            >
              Update Verification
            </button>
          </div>

          {/* Location & Map Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                <MapPin size={14} className="text-emerald-400" />
                <span>Location & Postal Address</span>
              </h4>
              <p className="text-slate-200">{location.address}</p>
              <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-1">
                <p>
                  Area: <strong className="text-white">{location.area || 'Pavagada Town'}</strong>
                </p>
                {location.landmark && (
                  <p>
                    Landmark: <strong className="text-white">{location.landmark}</strong>
                  </p>
                )}
                <p>
                  PIN Code: <strong className="text-white">{location.pincode || '561202'}</strong>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Clock size={14} className="text-emerald-400" />
                <span>Operating Timings</span>
              </h4>
              {hours.is24Hours ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 font-bold text-xs inline-block">
                  Open 24 Hours / 7 Days
                </span>
              ) : (
                <div className="space-y-1">
                  <p className="text-white font-medium">
                    {hours.open} – {hours.close} ({hours.days})
                  </p>
                  {hours.notes && <p className="text-slate-400 text-[11px]">{hours.notes}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Contact Methods */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Phone size={14} className="text-emerald-400" />
              <span>Public Contact Channels</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {contact.phone && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Primary Phone
                  </span>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-white font-semibold hover:text-emerald-400 transition-colors"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}

              {contact.alternatePhone && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Alternate Phone
                  </span>
                  <span className="text-white font-semibold">{contact.alternatePhone}</span>
                </div>
              )}

              {contact.whatsapp && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    WhatsApp Desk
                  </span>
                  <span className="text-white font-semibold">{contact.whatsapp}</span>
                </div>
              )}

              {contact.email && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-white font-semibold hover:text-emerald-400 transition-colors"
                  >
                    {contact.email}
                  </a>
                </div>
              )}

              {contact.website && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Official Website
                  </span>
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span className="truncate">Visit Portal</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Category Data Details (If Hospital, Services, etc.) */}
          {Object.keys(categoryData).length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs">
                Category Attributes ({location.subcategory || location.category})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(categoryData).map(([k, v]) => {
                  if (typeof v === 'boolean') {
                    return (
                      <div
                        key={k}
                        className={`p-2 rounded-xl border text-[11px] ${
                          v
                            ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300 font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        {v ? '✓ ' : '✕ '}
                        {k.replace(/^has|^is/, '').replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    );
                  }
                  if (typeof v === 'string' && v.trim()) {
                    return (
                      <div key={k} className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-white font-medium truncate block">{v}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Discovery Tags */}
          {location.tags && location.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-400 text-xs flex items-center gap-1.5">
                <Tag size={13} className="text-emerald-400" />
                <span>Search & Discovery Tags ({location.tags.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {location.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">ID: {location.id}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

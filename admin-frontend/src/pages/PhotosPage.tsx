import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  CheckCircle,
  Circle,
  Star,
  Trash2,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { adminApi } from '../services/api';
import { PhotoItem, PhotoRequest, LocationItem } from '../types';

export const PhotosPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'REQUESTS' | 'GALLERY'>('REQUESTS');
  const [requests, setRequests] = useState<PhotoRequest[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery Filters
  const [selectedEntityType, setSelectedEntityType] = useState('location');
  const [selectedEntityId, setSelectedEntityId] = useState('');

  // Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadEntity, setUploadEntity] = useState({ type: 'location', id: '', name: '', photoType: 'Main Photo' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [isPrimary, setIsPrimary] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchPhotoRequests = async () => {
    try {
      setLoading(true);
      const [reqs, locs] = await Promise.all([
        adminApi.getPhotoRequests(),
        adminApi.getLocations({ limit: 100 }),
      ]);
      setRequests(reqs || []);
      setLocations(locs.items || []);
      if (locs.items && locs.items.length > 0 && !selectedEntityId) {
        setSelectedEntityId(locs.items[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntityPhotos = async (entityType: string, entityId: string) => {
    if (!entityId) return;
    try {
      const p = await adminApi.getPhotos(entityType, entityId);
      setPhotos(p || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPhotoRequests();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'GALLERY' && selectedEntityId) {
      fetchEntityPhotos(selectedEntityType, selectedEntityId);
    }
  }, [activeSubTab, selectedEntityType, selectedEntityId]);

  const handleOpenUploadForRequest = (req: PhotoRequest, recommendedType: string) => {
    setUploadEntity({
      type: req.entityType,
      id: req.entityId,
      name: req.entityName,
      photoType: recommendedType,
    });
    setCaption(`${req.entityName} - ${recommendedType}`);
    setAltText(`${req.entityName} ${recommendedType}`);
    setIsPrimary(!req.hasPrimary);
    setSelectedFile(null);
    setIsUploadOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please choose an authentic photograph file to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('entityType', uploadEntity.type);
      formData.append('entityId', uploadEntity.id);
      formData.append('photoType', uploadEntity.photoType);
      formData.append('caption', caption);
      formData.append('altText', altText);
      formData.append('isPrimary', String(isPrimary));

      await adminApi.uploadPhoto(formData);
      setIsUploadOpen(false);
      setToastMsg(`Uploaded photo for ${uploadEntity.name} successfully!`);
      setTimeout(() => setToastMsg(null), 4000);

      fetchPhotoRequests();
      if (selectedEntityId === uploadEntity.id) {
        fetchEntityPhotos(uploadEntity.type, uploadEntity.id);
      }
    } catch (err: any) {
      alert(err.message || 'Photo upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      await adminApi.setPrimaryPhoto(photoId);
      fetchEntityPhotos(selectedEntityType, selectedEntityId);
      fetchPhotoRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to set primary photo.');
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!window.confirm('Delete this photo from Amazon S3 repository?')) return;
    try {
      await adminApi.deletePhoto(photoId);
      fetchEntityPhotos(selectedEntityType, selectedEntityId);
      fetchPhotoRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to delete photo.');
    }
  };

  const copyPhotoChecklist = () => {
    const lines = [
      '==================================================',
      ' NAMMA PAVAGADA — AUTHENTIC PHOTOGRAPHY REQUEST LIST',
      '==================================================',
      '',
      'Please capture high-resolution authentic local photographs for the following places:',
      '',
    ];

    requests.filter((r) => !r.isComplete).forEach((r, idx) => {
      lines.push(`${idx + 1}. ${r.entityName} (${r.category})`);
      r.missingRecommended.forEach((m) => {
        lines.push(`   ○ ${m}`);
      });
      lines.push('');
    });

    lines.push('Please send the captured files to the administrator for upload to Amazon S3.');
    navigator.clipboard.writeText(lines.join('\n'));
    setToastMsg('Photo request list copied to clipboard! Ready to share with project owner.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xl animate-fade-in">
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('REQUESTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'REQUESTS' ? 'bg-forest text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Photo Request Workflow ({requests.filter((r) => !r.isComplete).length} Pending)
          </button>
          <button
            onClick={() => setActiveSubTab('GALLERY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'GALLERY' ? 'bg-forest text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            S3 Media Gallery & Inspection
          </button>
        </div>

        {activeSubTab === 'REQUESTS' && (
          <button
            onClick={copyPhotoChecklist}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <Copy size={14} className="text-emerald-400" />
            <span>Copy Checklist for Project Owner</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-400" />
          <span>Loading media system...</span>
        </div>
      ) : activeSubTab === 'REQUESTS' ? (
        /* Photo Request Workflow Checklist */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <p className="font-bold text-white mb-1">Authentic Local Photography Policy:</p>
            <p>
              To maintain absolute credibility, Namma Pavagada rejects placeholder/generated imagery. This checklist clearly outlines which authentic shots are missing so the project owner can supply genuine local photographs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={`${req.entityType}-${req.entityId}`}
                className={`p-5 rounded-2xl glass-panel border transition-all ${
                  req.isComplete ? 'border-emerald-800/60' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                      {req.entityType} • {req.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{req.entityName}</h4>
                  </div>
                  {req.isComplete ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                      <FileCheck size={12} />
                      <span>Complete</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                      {req.missingRecommended.length} Missing
                    </span>
                  )}
                </div>

                {/* Uploaded Types */}
                <div className="space-y-1.5 mb-3 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Photos Status:</span>
                  {req.uploadedTypes.map((ut, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle size={14} className="shrink-0" />
                      <span>{ut}</span>
                    </div>
                  ))}
                  {req.missingRecommended.map((mr, idx) => (
                    <div key={idx} className="flex items-center justify-between py-0.5 text-slate-400">
                      <div className="flex items-center gap-2">
                        <Circle size={14} className="text-amber-500 shrink-0" />
                        <span>{mr}</span>
                      </div>
                      <button
                        onClick={() => handleOpenUploadForRequest(req, mr)}
                        className="px-2 py-0.5 rounded bg-forest/80 hover:bg-forest text-[11px] font-semibold text-emerald-200"
                      >
                        Upload
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* S3 Media Gallery */
        <div className="space-y-6">
          {/* Selector */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-xs font-semibold text-slate-300">Entity:</label>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white flex-1 max-w-sm"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                const cur = locations.find((l) => l.id === selectedEntityId);
                if (cur) {
                  setUploadEntity({ type: 'location', id: cur.id, name: cur.name, photoType: 'Main Photo' });
                  setCaption(`${cur.name} Photo`);
                  setAltText(`${cur.name}`);
                  setIsPrimary(true);
                  setSelectedFile(null);
                  setIsUploadOpen(true);
                }
              }}
              className="px-4 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Upload size={14} />
              <span>Upload New Photo</span>
            </button>
          </div>

          {/* Grid of Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 glass-panel rounded-2xl">
                No photographs uploaded to Amazon S3 for this entity yet. Click 'Upload New Photo' above.
              </div>
            ) : (
              photos.map((photo) => (
                <div key={photo.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
                  <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.altText}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    {photo.isPrimary && (
                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-forest/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
                        <Star size={12} className="text-amber-300 fill-amber-300" />
                        <span>Primary Photo</span>
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 font-mono text-[10px]">
                      {photo.photoType}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="text-xs font-semibold text-white truncate">{photo.caption || 'No caption'}</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate" title={photo.s3Key}>
                      Key: {photo.s3Key}
                    </p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      {!photo.isPrimary ? (
                        <button
                          onClick={() => handleSetPrimary(photo.id)}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                        >
                          <Star size={12} />
                          <span>Set Primary</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">Currently Primary</span>
                      )}

                      <div className="flex items-center gap-2">
                        <a
                          href={photo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                          title="Open photo URL"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-red-400"
                          title="Delete from S3"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Upload Photo */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Upload Photo to Amazon S3</h3>
            <p className="text-xs text-slate-400 mb-4">
              Target Entity: <span className="font-semibold text-emerald-400">{uploadEntity.name}</span>
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Photo Classification *</label>
                <input
                  type="text"
                  required
                  value={uploadEntity.photoType}
                  onChange={(e) => setUploadEntity({ ...uploadEntity, photoType: e.target.value })}
                  placeholder="e.g. Main entrance, Exterior, Bastion"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Image File (JPG, PNG, WebP) *</label>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Western artillery bastion overlooking plains"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alt Text (Accessibility)</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Descriptive text for screen readers"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="primaryPhoto"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                />
                <label htmlFor="primaryPhoto" className="text-xs text-slate-300">
                  Set as primary display photo for this entity
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading && <Loader2 size={14} className="animate-spin" />}
                  <span>{isUploading ? 'Uploading to S3...' : 'Upload Photo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

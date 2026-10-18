import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Star,
  Trash2,
  MoveLeft,
  MoveRight,
  Loader2,
  Check,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { PhotoItem } from '../../types';

export interface LocalPhoto {
  id?: number;
  url: string;
  isPrimary: boolean;
  caption: string;
  altText: string;
  photoType: string;
  file?: File;
  isUploaded: boolean;
}

interface PhotoUploaderProps {
  entityType: string;
  entityId: string;
  primaryPhotoUrl?: string;
  onPrimaryPhotoChange?: (url: string) => void;
  onPhotosChange?: (photos: LocalPhoto[]) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  entityType = 'location',
  entityId,
  primaryPhotoUrl,
  onPrimaryPhotoChange,
  onPhotosChange,
}) => {
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing photos if entityId is available
  useEffect(() => {
    if (!entityId) return;

    let isMounted = true;
    const fetchExisting = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getPhotos(entityType, entityId);
        if (isMounted && res && res.length > 0) {
          const mapped: LocalPhoto[] = res.map((p) => ({
            id: p.id,
            url: p.url,
            isPrimary: p.isPrimary,
            caption: p.caption,
            altText: p.altText,
            photoType: p.photoType,
            isUploaded: true,
          }));
          setPhotos(mapped);
          if (onPhotosChange) onPhotosChange(mapped);
        } else if (isMounted && primaryPhotoUrl) {
          setPhotos([
            {
              url: primaryPhotoUrl,
              isPrimary: true,
              caption: 'Primary Photo',
              altText: 'Primary Landmark Photo',
              photoType: 'Main Photo',
              isUploaded: true,
            },
          ]);
        }
      } catch (err) {
        console.warn('Could not load photos for entity:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExisting();
    return () => {
      isMounted = false;
    };
  }, [entityId, entityType]);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    const newPhotos: LocalPhoto[] = [...photos];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = URL.createObjectURL(file);
      const isFirst = newPhotos.length === 0;

      // If we have an entity ID, upload immediately to backend S3 / local media
      if (entityId) {
        try {
          const uploaded = await adminApi.uploadPhoto(file, {
            entityType,
            entityId,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            altText: file.name,
            isPrimary: isFirst,
            photoType: isFirst ? 'Main Photo' : 'Gallery',
          });

          newPhotos.push({
            id: uploaded.id,
            url: uploaded.url,
            isPrimary: uploaded.isPrimary,
            caption: uploaded.caption || '',
            altText: uploaded.altText || '',
            photoType: uploaded.photoType || 'Gallery',
            isUploaded: true,
          });

          if (isFirst && onPrimaryPhotoChange) {
            onPrimaryPhotoChange(uploaded.url);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to upload photo');
        }
      } else {
        // Entity not saved yet - keep in local memory state
        newPhotos.push({
          url: previewUrl,
          file,
          isPrimary: isFirst,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          altText: file.name,
          photoType: isFirst ? 'Main Photo' : 'Gallery',
          isUploaded: false,
        });

        if (isFirst && onPrimaryPhotoChange) {
          onPrimaryPhotoChange(previewUrl);
        }
      }
    }

    setPhotos(newPhotos);
    if (onPhotosChange) onPhotosChange(newPhotos);
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setPrimary = async (idx: number) => {
    const target = photos[idx];
    if (!target) return;

    const nextPhotos = photos.map((p, i) => ({
      ...p,
      isPrimary: i === idx,
    }));

    setPhotos(nextPhotos);
    if (onPrimaryPhotoChange) onPrimaryPhotoChange(target.url);
    if (onPhotosChange) onPhotosChange(nextPhotos);

    if (target.id) {
      try {
        await adminApi.setPrimaryPhoto(target.id);
      } catch (err) {
        console.error('Failed to set primary photo:', err);
      }
    }
  };

  const removePhoto = async (idx: number) => {
    const target = photos[idx];
    if (!target) return;

    const nextPhotos = photos.filter((_, i) => i !== idx);

    // If removed photo was primary and there are remaining photos, make the first one primary
    if (target.isPrimary && nextPhotos.length > 0) {
      nextPhotos[0].isPrimary = true;
      if (onPrimaryPhotoChange) onPrimaryPhotoChange(nextPhotos[0].url);
    } else if (nextPhotos.length === 0 && onPrimaryPhotoChange) {
      onPrimaryPhotoChange('');
    }

    setPhotos(nextPhotos);
    if (onPhotosChange) onPhotosChange(nextPhotos);

    if (target.id) {
      try {
        await adminApi.deletePhoto(target.id);
      } catch (err) {
        console.error('Failed to delete photo:', err);
      }
    }
  };

  const movePhoto = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= photos.length) return;

    const nextPhotos = [...photos];
    const temp = nextPhotos[idx];
    nextPhotos[idx] = nextPhotos[targetIdx];
    nextPhotos[targetIdx] = temp;

    setPhotos(nextPhotos);
    if (onPhotosChange) onPhotosChange(nextPhotos);
  };

  const updateMetadata = (idx: number, field: 'caption' | 'altText', val: string) => {
    const nextPhotos = [...photos];
    if (nextPhotos[idx]) {
      nextPhotos[idx] = { ...nextPhotos[idx], [field]: val };
      setPhotos(nextPhotos);
      if (onPhotosChange) onPhotosChange(nextPhotos);

      if (nextPhotos[idx].id) {
        adminApi.updatePhoto(nextPhotos[idx].id!, { [field]: val }).catch(console.error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-800 hover:border-emerald-500/60 bg-slate-900/50 hover:bg-slate-900 rounded-2xl p-6 text-center cursor-pointer transition-all group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={handleFilesSelected}
        />

        <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
          {uploading ? (
            <Loader2 size={24} className="animate-spin text-emerald-400" />
          ) : (
            <UploadCloud size={24} />
          )}
        </div>

        <h4 className="text-xs font-bold text-white mb-1">
          {uploading ? 'Uploading photographs to media bucket...' : 'Click to upload authentic photos'}
        </h4>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          High-resolution PNG, JPG, or WebP. Select a primary cover photo and gallery views.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Photos Grid */}
      {loading ? (
        <div className="py-6 text-center text-slate-400 text-xs">
          <Loader2 size={20} className="animate-spin mx-auto mb-2 text-emerald-400" />
          <span>Loading attached media records...</span>
        </div>
      ) : photos.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Photos attached: <strong className="text-white">{photos.length}</strong>
            </span>
            <span className="text-[11px] text-slate-500">
              Click the star to designate the Primary Cover Photo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl border p-2.5 transition-all ${
                  photo.isPrimary
                    ? 'bg-emerald-950/20 border-emerald-500/70 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                {/* Image Thumbnail */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-2 border border-slate-800">
                  <img
                    src={photo.url}
                    alt={photo.altText || 'Location photo'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=600&q=80';
                    }}
                  />

                  {/* Primary Badge */}
                  {photo.isPrimary && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-md">
                      <Star size={10} className="fill-slate-950" />
                      <span>Primary Photo</span>
                    </div>
                  )}

                  {/* Action Bar Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm p-1 rounded-lg border border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => setPrimary(idx)}
                      title={photo.isPrimary ? 'Primary Photo' : 'Make Primary Photo'}
                      className={`p-1 rounded ${
                        photo.isPrimary
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-slate-400 hover:text-amber-400'
                      }`}
                    >
                      <Star size={13} className={photo.isPrimary ? 'fill-amber-400' : ''} />
                    </button>

                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      title="Delete photo"
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Metadata Inputs */}
                <div className="space-y-1.5 text-xs">
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => updateMetadata(idx, 'caption', e.target.value)}
                    placeholder="Caption (e.g. Main entrance, Casualty ward)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-emerald-500"
                  />

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{idx + 1} of {photos.length}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => movePhoto(idx, 'left')}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move left"
                      >
                        <MoveLeft size={11} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === photos.length - 1}
                        onClick={() => movePhoto(idx, 'right')}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move right"
                      >
                        <MoveRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

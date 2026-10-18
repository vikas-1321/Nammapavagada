import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { PhotoItem } from '../../types';
import { colors } from '../../theme/colors';
import { AppTextInput } from '../common/AppTextInput';
import { AppButton } from '../common/AppButton';
import { photosApi } from '../../api/photosApi';

interface PhotoManagerProps {
  entityType?: string;
  entityId?: string;
  photos: PhotoItem[];
  primaryPhotoUrl?: string;
  onPrimaryPhotoChange?: (url: string) => void;
  onPhotosChange: (photos: PhotoItem[]) => void;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  entityType = 'location',
  entityId,
  photos,
  primaryPhotoUrl,
  onPrimaryPhotoChange,
  onPhotosChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoItem | null>(null);
  const [captionInput, setCaptionInput] = useState('');
  const [altTextInput, setAltTextInput] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [isAddUrlModalOpen, setIsAddUrlModalOpen] = useState(false);

  const handleSetPrimary = async (photo: PhotoItem) => {
    try {
      if (photo.id && entityId) {
        await photosApi.setPrimaryPhoto(photo.id);
      }
      onPrimaryPhotoChange?.(photo.url);

      const updated = photos.map((p) => ({
        ...p,
        isPrimary: p.url === photo.url,
      }));
      onPhotosChange(updated);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update primary photo.');
    }
  };

  const handleDeletePhoto = async (photo: PhotoItem) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (photo.id) {
                await photosApi.deletePhoto(photo.id);
              }
              const updated = photos.filter((p) => (photo.id ? p.id !== photo.id : p.url !== photo.url));
              onPhotosChange(updated);
              if (photo.url === primaryPhotoUrl && updated.length > 0) {
                onPrimaryPhotoChange?.(updated[0].url);
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete photo.');
            }
          },
        },
      ]
    );
  };

  const handleOpenEditModal = (photo: PhotoItem) => {
    setEditingPhoto(photo);
    setCaptionInput(photo.caption || '');
    setAltTextInput(photo.altText || '');
  };

  const handleSavePhotoMeta = async () => {
    if (!editingPhoto) return;
    try {
      if (editingPhoto.id) {
        await photosApi.updatePhoto(editingPhoto.id, {
          caption: captionInput,
          altText: altTextInput,
        });
      }

      const updated = photos.map((p) =>
        (editingPhoto.id ? p.id === editingPhoto.id : p.url === editingPhoto.url)
          ? { ...p, caption: captionInput, altText: altTextInput }
          : p
      );
      onPhotosChange(updated);
      setEditingPhoto(null);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update photo details.');
    }
  };

  // Add photo via direct URL/Image path or device file
  const handleAddPhotoByUrl = () => {
    const url = photoUrlInput.trim();
    if (!url) return;

    const newPhoto: PhotoItem = {
      id: Date.now(), // temporary client id
      entityType,
      entityId: entityId || '',
      url,
      caption: '',
      altText: '',
      isPrimary: photos.length === 0,
      photoType: photos.length === 0 ? 'Main Photo' : 'Gallery',
    };

    const nextPhotos = [...photos, newPhoto];
    onPhotosChange(nextPhotos);
    if (newPhoto.isPrimary) {
      onPrimaryPhotoChange?.(url);
    }

    setPhotoUrlInput('');
    setIsAddUrlModalOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Upload & Add Bar */}
      <View style={styles.topBar}>
        <View style={styles.photoCountInfo}>
          <Text style={styles.countText}>{photos.length} Photos Registered</Text>
          <Text style={styles.subCountText}>Tap a photo to set as primary cover</Text>
        </View>
        <AppButton
          title="+ Add Photo"
          size="small"
          onPress={() => setIsAddUrlModalOpen(true)}
        />
      </View>

      {/* Photos Carousel / Grid */}
      {photos.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyTitle}>No Photos Uploaded</Text>
          <Text style={styles.emptySubtitle}>
            Add high-resolution exterior, entrance, or facility photos for citizens.
          </Text>
          <AppButton
            title="Attach Photo"
            variant="outline"
            size="small"
            style={{ marginTop: 12 }}
            onPress={() => setIsAddUrlModalOpen(true)}
          />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
          {photos.map((item, index) => {
            const isPrimary = item.isPrimary || item.url === primaryPhotoUrl;
            return (
              <View key={item.id || index} style={[styles.photoCard, isPrimary && styles.photoCardPrimary]}>
                <Image source={{ uri: item.url }} style={styles.thumbnail} resizeMode="cover" />

                {isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>★ Primary Cover</Text>
                  </View>
                )}

                <View style={styles.photoActions}>
                  {!isPrimary && (
                    <TouchableOpacity
                      onPress={() => handleSetPrimary(item)}
                      style={styles.actionBtn}
                    >
                      <Text style={styles.actionBtnText}>Set Cover</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => handleOpenEditModal(item)}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>Caption</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeletePhoto(item)}
                    style={[styles.actionBtn, styles.deleteActionBtn]}
                  >
                    <Text style={styles.deleteActionText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {item.caption ? (
                  <Text style={styles.captionText} numberOfLines={1}>
                    {item.caption}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Edit Caption Modal */}
      <Modal visible={!!editingPhoto} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Photo Details & Accessibility</Text>

            <AppTextInput
              label="Caption"
              placeholder="e.g. Front OPD entrance and emergency triage gate"
              value={captionInput}
              onChangeText={setCaptionInput}
            />

            <AppTextInput
              label="Alt Text (For screen readers)"
              placeholder="e.g. Two-story white hospital building with green signage"
              value={altTextInput}
              onChangeText={setAltTextInput}
            />

            <View style={styles.modalButtons}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setEditingPhoto(null)}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Save"
                onPress={handleSavePhotoMeta}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Photo URL / Path Modal */}
      <Modal visible={isAddUrlModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Attach Location Photo</Text>
            <Text style={styles.modalSub}>
              Enter image URL or cloud photo link (JPEG, PNG, WebP)
            </Text>

            <AppTextInput
              label="Image URL / File Path"
              placeholder="https://... or /uploads/photos/image.jpg"
              value={photoUrlInput}
              onChangeText={setPhotoUrlInput}
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setIsAddUrlModalOpen(false)}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Attach"
                disabled={!photoUrlInput.trim()}
                onPress={handleAddPhotoByUrl}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoCountInfo: {
    flex: 1,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  subCountText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyCard: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  galleryScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  photoCard: {
    width: 160,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingBottom: 6,
  },
  photoCardPrimary: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  thumbnail: {
    width: '100%',
    height: 110,
    backgroundColor: colors.surfaceSubtle,
  },
  primaryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingTop: 6,
    alignItems: 'center',
  },
  actionBtn: {
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  actionBtnText: {
    fontSize: 11,
    color: colors.textMain,
    fontWeight: '600',
  },
  deleteActionBtn: {
    backgroundColor: colors.dangerLight,
  },
  deleteActionText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '700',
  },
  captionText: {
    fontSize: 11,
    color: colors.textMuted,
    paddingHorizontal: 6,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
});

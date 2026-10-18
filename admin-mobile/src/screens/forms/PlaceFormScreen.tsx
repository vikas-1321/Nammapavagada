import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  LocationItem,
  MainCategoryMeta,
  SubcategoryMeta,
  PlaceStatus,
  VerificationStatus,
  VerificationSource,
  PhotoItem,
} from '../../types';
import { placesApi } from '../../api/placesApi';
import { colors } from '../../theme/colors';
import { AppTextInput } from '../../components/common/AppTextInput';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge, VerificationBadge } from '../../components/common/AppBadge';
import { OperatingHoursEditor } from '../../components/forms/OperatingHoursEditor';
import { TagSelector } from '../../components/forms/TagSelector';
import { PhotoManager } from '../../components/forms/PhotoManager';
import { CoordinatesPicker } from '../../components/forms/CoordinatesPicker';
import { CategoryFormDispatcher } from '../../forms/CategoryFormDispatcher';
import { DuplicateAlertModal } from '../../components/forms/DuplicateAlertModal';
import { MAIN_CATEGORIES_TAXONOMY } from '../../constants/taxonomy';

export interface PlaceFormScreenProps {
  navigation?: any;
  route?: any;
  editPlaceId?: string;
  initialCategory?: MainCategoryMeta;
  initialSubcategory?: SubcategoryMeta;
  initialSubcategories?: SubcategoryMeta[];
  onSuccess?: (savedPlace: LocationItem) => void;
  onCancel?: () => void;
  onViewExisting?: (placeId: string) => void;
}

export const PlaceFormScreen: React.FC<PlaceFormScreenProps> = ({
  navigation,
  route,
  editPlaceId,
  initialCategory,
  initialSubcategory,
  initialSubcategories,
  onSuccess,
  onCancel,
  onViewExisting,
}) => {
  const activePlaceId = editPlaceId || route?.params?.placeId;
  const isEditMode = !!activePlaceId;
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryIdParam = route?.params?.categoryId;
  const subcategoryIdParam = route?.params?.subcategoryId as string | undefined;
  const subcategoryIdsParam = route?.params?.subcategoryIds as string[] | undefined;

  const resolvedCategory =
    initialCategory ||
    (categoryIdParam ? MAIN_CATEGORIES_TAXONOMY.find((c) => c.id === categoryIdParam) : undefined);

  const initialSubsList: SubcategoryMeta[] = (() => {
    if (initialSubcategories && initialSubcategories.length > 0) return initialSubcategories;
    if (initialSubcategory) return [initialSubcategory];
    if (resolvedCategory) {
      if (subcategoryIdsParam && subcategoryIdsParam.length > 0) {
        return resolvedCategory.subcategories.filter((s) => subcategoryIdsParam.includes(s.id));
      }
      if (subcategoryIdParam) {
        const found = resolvedCategory.subcategories.find((s) => s.id === subcategoryIdParam);
        return found ? [found] : [];
      }
    }
    return [];
  })();

  const handleSuccess = onSuccess || ((savedPlace: LocationItem) => navigation?.goBack());
  const handleCancel = onCancel || (() => navigation?.goBack());
  const handleViewExisting =
    onViewExisting || ((candId: string) => navigation?.navigate('PlaceDetail', { placeId: candId }));

  // Active Category & Subcategories
  const [category, setCategory] = useState<MainCategoryMeta | undefined>(resolvedCategory);
  const [subcategories, setSubcategories] = useState<SubcategoryMeta[]>(initialSubsList);

  // Sync subcategories if route params update (e.g. from SubcategorySelectScreen)
  useEffect(() => {
    if (route?.params?.subcategoryIds && category) {
      const ids: string[] = route.params.subcategoryIds;
      const matched = category.subcategories.filter((s) => ids.includes(s.id));
      if (matched.length > 0) {
        setSubcategories(matched);
      }
    }
  }, [route?.params?.subcategoryIds, category]);

  const handleToggleSubcategory = (sub: SubcategoryMeta) => {
    setSubcategories((prev) => {
      const exists = prev.some((s) => s.id === sub.id);
      return exists ? prev.filter((s) => s.id !== sub.id) : [...prev, sub];
    });
  };

  const allSuggestedTags = Array.from(
    new Set(subcategories.flatMap((s) => s.suggestedTags || []))
  );

  // Form State
  const [formData, setFormData] = useState<Partial<LocationItem>>({
    name: '',
    shortName: '',
    kannadaName: '',
    summary: '',
    fullDescription: '',
    address: '',
    area: 'Pavagada Town',
    pincode: '561202',
    landmark: '',
    mapReference: '',
    coordinates: { latitude: 14.1025, longitude: 77.2798 },
    contact: {
      phone: '',
      alternatePhone: '',
      whatsapp: '',
      email: '',
      website: '',
      authority: '',
    },
    hours: { is24Hours: false },
    categoryData: {},
    tags: allSuggestedTags.length > 0 ? allSuggestedTags : (initialSubcategory?.suggestedTags || []),
    verification: {
      status: 'PENDING',
      source: 'Admin Verification',
      notes: '',
    },
    status: 'ACTIVE',
    primaryPhotoUrl: '',
    photos: [],
  });

  // Duplicate Check
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [hasDismissedDuplicates, setHasDismissedDuplicates] = useState(false);
  const duplicateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing place in Edit mode
  useEffect(() => {
    if (!activePlaceId) return;

    const fetchPlace = async () => {
      try {
        setLoadingInitial(true);
        const place = await placesApi.getPlaceById(activePlaceId);
        setFormData(place);

        // Resolve taxonomy metadata
        const matchedCat = MAIN_CATEGORIES_TAXONOMY.find(
          (c) => c.name.toLowerCase() === place.category.toLowerCase() || c.id === place.category
        );
        if (matchedCat) {
          setCategory(matchedCat);
          if (place.subcategory) {
            const rawSubs = place.subcategory
              .split(',')
              .map((s: string) => s.trim().toLowerCase())
              .filter(Boolean);
            const matchedSubs = matchedCat.subcategories.filter(
              (s) =>
                rawSubs.includes(s.id.toLowerCase()) ||
                rawSubs.includes(s.name.toLowerCase())
            );
            if (matchedSubs.length > 0) {
              setSubcategories(matchedSubs);
            } else {
              setSubcategories(
                rawSubs.map((name: string) => ({
                  id: name,
                  name: name,
                  description: '',
                  formType: 'general' as const,
                  suggestedTags: [],
                }))
              );
            }
          }
        }
      } catch (err: any) {
        Alert.alert('Failed to Load Place', err.message || 'Cannot retrieve record from backend.');
        handleCancel();
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchPlace();
  }, [activePlaceId]);

  // Debounced duplicate detection when Name or Area changes in CREATE mode
  useEffect(() => {
    if (isEditMode || hasDismissedDuplicates || !formData.name || formData.name.trim().length < 4) {
      return;
    }

    if (duplicateTimer.current) clearTimeout(duplicateTimer.current);

    duplicateTimer.current = setTimeout(async () => {
      try {
        const res = await placesApi.checkDuplicate({
          name: formData.name!.trim(),
          category: category?.name,
          area: formData.area,
        });

        if (res.hasDuplicates) {
          setDuplicates(res.duplicates);
          setIsDuplicateModalOpen(true);
        }
      } catch {
        // Non-blocking duplicate check error
      }
    }, 700);

    return () => {
      if (duplicateTimer.current) clearTimeout(duplicateTimer.current);
    };
  }, [formData.name, formData.area, category?.name, isEditMode, hasDismissedDuplicates]);

  const updateFormData = (fields: Partial<LocationItem>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setErrorMessage(null);
  };

  const handleSave = async (targetStatus?: PlaceStatus) => {
    // Validation
    if (!formData.name?.trim()) {
      setErrorMessage('Official Name is required.');
      return;
    }
    if (!formData.summary?.trim()) {
      setErrorMessage('Short Summary / Headline description is required.');
      return;
    }
    if (!formData.address?.trim()) {
      setErrorMessage('Full Address is required.');
      return;
    }
    if (!formData.coordinates?.latitude || !formData.coordinates?.longitude) {
      setErrorMessage('GPS Latitude and Longitude coordinates are required.');
      return;
    }

    const subcategoryString =
      subcategories.length > 0
        ? subcategories.map((s) => s.name).join(', ')
        : formData.subcategory || '';

    const payload: Partial<LocationItem> = {
      ...formData,
      category: category?.name || formData.category || 'General',
      subcategory: subcategoryString,
      status: targetStatus || formData.status || 'ACTIVE',
    };

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      let result: LocationItem;
      if (isEditMode && activePlaceId) {
        result = await placesApi.updatePlace(activePlaceId, payload);
        Alert.alert('Success', `Changes to "${result.name}" saved successfully.`);
      } else {
        result = await placesApi.createPlace(payload);
        Alert.alert('Place Created', `"${result.name}" has been registered.`);
      }

      handleSuccess(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save place to backend. Please check fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading place data from backend...</Text>
      </View>
    );
  }

  const formType =
    subcategories.find((s) => s.formType && s.formType !== 'general')?.formType ||
    subcategories[0]?.formType ||
    'general';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Place' : 'New Place Registration'}
        </Text>
        <TouchableOpacity
          onPress={() => handleSave(isEditMode ? formData.status : 'PUBLISHED')}
          disabled={isSubmitting}
          style={styles.headerSaveBtn}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.headerSaveBtnText}>{isEditMode ? 'Save' : 'Publish'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Error Banner */}
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Category & Subcategory Card */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryLabel}>CATEGORY & DOMAIN</Text>
            <Text style={styles.categoryName}>{category?.name || formData.category}</Text>

            <View style={styles.subcategoriesHeaderRow}>
              <Text style={styles.subcategoryLabel}>
                SUBCATEGORIES ({subcategories.length} SELECTED)
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation?.navigate('SubcategorySelect', {
                    categoryId: category?.id,
                    initialSelectedIds: subcategories.map((s) => s.id),
                  })
                }
              >
                <Text style={styles.changeSubcategoriesText}>Manage →</Text>
              </TouchableOpacity>
            </View>

            {/* Quick toggle chips */}
            <View style={styles.subcategoriesGrid}>
              {category?.subcategories.map((sub) => {
                const isSelected = subcategories.some(
                  (s) => s.id === sub.id || s.name === sub.name
                );
                return (
                  <TouchableOpacity
                    key={sub.id}
                    onPress={() => handleToggleSubcategory(sub)}
                    style={[
                      styles.subcategoryToggleChip,
                      isSelected && {
                        borderColor: category?.color?.primary || colors.primary,
                        backgroundColor: '#f0fdf4',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.subcategoryToggleChipText,
                        isSelected && {
                          color: category?.color?.primary || colors.primary,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {sub.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <StatusBadge status={formData.status || 'ACTIVE'} />
        </View>

        {/* 1. Basic Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>1. Basic Information</Text>

          <AppTextInput
            label="Official Name"
            required
            placeholder="e.g. Pavagada Taluk General Hospital"
            value={formData.name || ''}
            onChangeText={(t) => updateFormData({ name: t })}
          />

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Short / Display Name"
                placeholder="e.g. Taluk Hospital"
                value={formData.shortName || ''}
                onChangeText={(t) => updateFormData({ shortName: t })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Kannada Name"
                placeholder="e.g. ತಾಲೂಕು ಆಸ್ಪತ್ರೆ"
                value={formData.kannadaName || ''}
                onChangeText={(t) => updateFormData({ kannadaName: t })}
              />
            </View>
          </View>

          <AppTextInput
            label="Short Summary / Headline Description"
            required
            placeholder="1-2 sentences summarizing services, timing, or importance for citizen search cards..."
            value={formData.summary || ''}
            onChangeText={(t) => updateFormData({ summary: t })}
            multiline
          />

          <AppTextInput
            label="Detailed Description"
            placeholder="Comprehensive description of background, wards, facilities, or procedures..."
            value={formData.fullDescription || ''}
            onChangeText={(t) => updateFormData({ fullDescription: t })}
            multiline
          />

          <Text style={styles.fieldLabel}>Publication Status</Text>
          <View style={styles.statusChipsRow}>
            {(['PUBLISHED', 'DRAFT', 'TEMP_CLOSED', 'INACTIVE', 'ARCHIVED'] as PlaceStatus[]).map((st) => (
              <TouchableOpacity
                key={st}
                onPress={() => updateFormData({ status: st })}
                style={[styles.statusChip, formData.status === st && styles.statusChipActive]}
              >
                <Text style={[styles.statusChipText, formData.status === st && styles.statusChipTextActive]}>
                  {st.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. Category-Specific Dynamic Form */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>
            2.{' '}
            {subcategories.length > 0
              ? subcategories.map((s) => s.name).join(', ')
              : category?.name || 'Category'}{' '}
            Specifics
          </Text>
          <CategoryFormDispatcher
            formType={formType}
            subcategoryName={subcategories.map((s) => s.name).join(', ')}
            categoryData={formData.categoryData || {}}
            onChange={(cData) => updateFormData({ categoryData: cData })}
          />
        </View>

        {/* 3. Location & GPS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>3. Physical Location & Map</Text>

          <AppTextInput
            label="Full Physical Address"
            required
            placeholder="Door No, Street, Road, Near Landmark..."
            value={formData.address || ''}
            onChangeText={(t) => updateFormData({ address: t })}
            multiline
          />

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Area / Locality"
                required
                placeholder="e.g. Pavagada Town"
                value={formData.area || ''}
                onChangeText={(t) => updateFormData({ area: t })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Pincode"
                placeholder="561202"
                value={formData.pincode || '561202'}
                onChangeText={(t) => updateFormData({ pincode: t })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <AppTextInput
            label="Prominent Landmark"
            placeholder="e.g. Opposite Taluk Hospital, Near Clock Tower"
            value={formData.landmark || ''}
            onChangeText={(t) => updateFormData({ landmark: t })}
          />

          <CoordinatesPicker
            coordinates={formData.coordinates || { latitude: 14.1025, longitude: 77.2798 }}
            onChange={(coords) => updateFormData({ coordinates: coords })}
            mapReference={formData.mapReference}
            onMapReferenceChange={(ref) => updateFormData({ mapReference: ref })}
          />
        </View>

        {/* 4. Contact Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>4. Contact Details</Text>

          <AppTextInput
            label="Contact Person / Designation / Desk"
            placeholder="e.g. Medical Superintendent / Branch Manager / Helpdesk"
            value={formData.contact?.authority || ''}
            onChangeText={(t) =>
              updateFormData({ contact: { ...formData.contact, authority: t } })
            }
          />

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Primary Phone"
                placeholder="08136-244240"
                value={formData.contact?.phone || ''}
                onChangeText={(t) =>
                  updateFormData({ contact: { ...formData.contact, phone: t } })
                }
                keyboardType="phone-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Alternate Phone"
                placeholder="08136-244241"
                value={formData.contact?.alternatePhone || ''}
                onChangeText={(t) =>
                  updateFormData({ contact: { ...formData.contact, alternatePhone: t } })
                }
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="WhatsApp Number"
                placeholder="9449800000"
                value={formData.contact?.whatsapp || ''}
                onChangeText={(t) =>
                  updateFormData({ contact: { ...formData.contact, whatsapp: t } })
                }
                keyboardType="phone-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Official Email"
                placeholder="office@karnataka.gov.in"
                value={formData.contact?.email || ''}
                onChangeText={(t) =>
                  updateFormData({ contact: { ...formData.contact, email: t } })
                }
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <AppTextInput
            label="Official Website"
            placeholder="https://..."
            value={formData.contact?.website || ''}
            onChangeText={(t) =>
              updateFormData({ contact: { ...formData.contact, website: t } })
            }
            autoCapitalize="none"
          />
        </View>

        {/* 5. Operating Hours */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>5. Operating Hours & Schedule</Text>
          <OperatingHoursEditor
            value={formData.hours}
            onChange={(h) => updateFormData({ hours: h })}
          />
        </View>

        {/* 6. Photos */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>6. Photos & Media</Text>
          <PhotoManager
            entityType="location"
            entityId={editPlaceId}
            photos={formData.photos || []}
            primaryPhotoUrl={formData.primaryPhotoUrl}
            onPrimaryPhotoChange={(url) => updateFormData({ primaryPhotoUrl: url })}
            onPhotosChange={(pts) => updateFormData({ photos: pts })}
          />
        </View>

        {/* 7. Tags */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>7. Search & Discovery Tags</Text>
          <TagSelector
            selectedTags={formData.tags || []}
            onChange={(tags) => updateFormData({ tags })}
            suggestedTags={allSuggestedTags}
          />
        </View>

        {/* 8. Verification & Governance */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>8. Verification & Audit Trail</Text>

          <Text style={styles.fieldLabel}>Current Verification Status</Text>
          <View style={styles.statusChipsRow}>
            {(['VERIFIED', 'PENDING', 'NEEDS_REVERIFICATION', 'NOT_VERIFIED'] as VerificationStatus[]).map((vst) => (
              <TouchableOpacity
                key={vst}
                onPress={() =>
                  updateFormData({
                    verification: { ...formData.verification!, status: vst },
                  })
                }
                style={[
                  styles.statusChip,
                  formData.verification?.status === vst && styles.statusChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    formData.verification?.status === vst && styles.statusChipTextActive,
                  ]}
                >
                  {vst.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <AppTextInput
            label="Information Source"
            placeholder="Official Office / Physical Visit / Phone Verification"
            value={formData.verification?.source || 'Admin Verification'}
            onChangeText={(s) =>
              updateFormData({
                verification: { ...formData.verification!, source: s },
              })
            }
          />

          <AppTextInput
            label="Audit Notes"
            placeholder="e.g. Confirmed with Medical Superintendent on 08-Oct-2026."
            value={formData.verification?.notes || ''}
            onChangeText={(n) =>
              updateFormData({
                verification: { ...formData.verification!, notes: n },
              })
            }
            multiline
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomActions}>
          <AppButton
            title="Save as Draft"
            variant="outline"
            size="large"
            loading={isSubmitting}
            onPress={() => handleSave('DRAFT')}
            style={{ flex: 1 }}
          />
          <AppButton
            title={isEditMode ? 'Save Changes' : 'Publish Record'}
            size="large"
            loading={isSubmitting}
            onPress={() => handleSave(isEditMode ? formData.status : 'PUBLISHED')}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>

      {/* Duplicate Warning Modal */}
      <DuplicateAlertModal
        visible={isDuplicateModalOpen}
        duplicates={duplicates}
        onDismiss={() => {
          setIsDuplicateModalOpen(false);
          setHasDismissedDuplicates(true);
        }}
        onContinue={() => {
          setIsDuplicateModalOpen(false);
          setHasDismissedDuplicates(true);
        }}
        onViewExisting={(cand) => {
          setIsDuplicateModalOpen(false);
          handleViewExisting(cand.id);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  headerBtnText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
  },
  headerSaveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  headerSaveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.dangerDark,
    fontWeight: '700',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 10,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSubtle,
    letterSpacing: 0.5,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
    marginTop: 2,
  },
  subcategoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 1,
  },
  subcategoriesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 6,
  },
  subcategoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSubtle,
    letterSpacing: 0.5,
  },
  changeSubcategoriesText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  subcategoryToggleChip: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  subcategoryToggleChipText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  statusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  statusChip: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain,
  },
  statusChipTextActive: {
    color: '#ffffff',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Loader2,
  Eye,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Tag as TagIcon,
  ShieldCheck,
  Building,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { MAIN_CATEGORIES_TAXONOMY, MainCategoryMeta, SubcategoryMeta } from '../../data/categoryTaxonomy';
import { TextField } from '../common/TextField';
import { Textarea } from '../common/Textarea';
import { PhoneField } from '../common/PhoneField';
import { EmailField } from '../common/EmailField';
import { AddressField } from '../common/AddressField';
import { MapPicker } from '../common/MapPicker';
import { OperatingHours } from '../common/OperatingHours';
import { PhotoUploader, LocalPhoto } from '../common/PhotoUploader';
import { TagSelector } from '../common/TagSelector';
import { VerificationPanel } from '../common/VerificationPanel';
import { StatusSelector } from '../common/StatusSelector';
import { DuplicateAlert } from '../common/DuplicateAlert';
import { CategoryFieldsDispatcher } from './CategoryFieldsDispatcher';
import { adminApi } from '../../services/api';
import { LocationItem, PlaceStatus, DuplicateCandidate, VerificationInfo, StructuredHours, ContactInfo } from '../../types';

interface PlaceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (location: LocationItem) => void;
  initialData?: LocationItem | null;
}

const STEPS = [
  { id: 1, key: 'category', title: 'Main Category', icon: Building },
  { id: 2, key: 'subcategory', title: 'Subcategories', icon: Sparkles },
  { id: 3, key: 'basic', title: 'Basic Info', icon: Building },
  { id: 4, key: 'categoryDetails', title: 'Category Details', icon: Sparkles },
  { id: 5, key: 'location', title: 'Location & Map', icon: MapPin },
  { id: 6, key: 'contactHours', title: 'Contact & Hours', icon: Clock },
  { id: 7, key: 'photos', title: 'Photos', icon: ImageIcon },
  { id: 8, key: 'tags', title: 'Tags & Discovery', icon: TagIcon },
  { id: 9, key: 'verification', title: 'Verification', icon: ShieldCheck },
  { id: 10, key: 'review', title: 'Review & Publish', icon: Send },
];

const parseSubcategories = (subStr?: string): string[] => {
  if (!subStr) return [];
  return subStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

export const PlaceEntryModal: React.FC<PlaceEntryModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialData,
}) => {
  const isEditing = Boolean(initialData?.id);
  const [currentStep, setCurrentStep] = useState<number>(isEditing ? 3 : 1);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(() =>
    parseSubcategories(initialData?.subcategory)
  );

  // Form State
  const [formData, setFormData] = useState<Partial<LocationItem>>({
    name: '',
    shortName: '',
    kannadaName: '',
    category: 'EMERGENCY_CRITICAL_CARE',
    subcategory: 'Emergency Hospital',
    summary: '',
    fullDescription: '',
    address: 'Pavagada Town, Karnataka 561202',
    area: 'Pavagada Town',
    pincode: '561202',
    landmark: '',
    mapReference: '',
    coordinates: { latitude: 14.1025, longitude: 77.2798 },
    contact: {
      authority: '',
      phone: '',
      alternatePhone: '',
      whatsapp: '',
      email: '',
      website: '',
      onlineServiceUrl: '',
      customContacts: [],
    },
    hours: {
      open: '09:00 AM',
      close: '05:00 PM',
      days: 'Daily',
      is24Hours: false,
      isClosed: false,
      schedule: {},
    },
    categoryData: {},
    tags: [],
    verification: {
      status: 'PENDING',
      source: 'Direct Administrative Entry',
      verifiedBy: '',
      notes: '',
    },
    status: 'ACTIVE',
    primaryPhotoUrl: '',
  });

  const [localPhotos, setLocalPhotos] = useState<LocalPhoto[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [dismissedDuplicates, setDismissedDuplicates] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or reset when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      const parsedSubs = parseSubcategories(initialData.subcategory);
      setSelectedSubcategories(parsedSubs.length > 0 ? parsedSubs : ['Emergency Hospital']);
      setFormData({
        ...initialData,
        coordinates: {
          latitude: initialData.coordinates?.latitude || 14.1025,
          longitude: initialData.coordinates?.longitude || 77.2798,
        },
        contact: {
          authority: initialData.contact?.authority || '',
          phone: initialData.contact?.phone || '',
          alternatePhone: initialData.contact?.alternatePhone || '',
          whatsapp: initialData.contact?.whatsapp || '',
          email: initialData.contact?.email || '',
          website: initialData.contact?.website || '',
          onlineServiceUrl: initialData.contact?.onlineServiceUrl || '',
          customContacts: initialData.contact?.customContacts || [],
        },
        hours: {
          open: initialData.hours?.open || '09:00 AM',
          close: initialData.hours?.close || '05:00 PM',
          days: initialData.hours?.days || 'Daily',
          notes: initialData.hours?.notes || '',
          is24Hours: Boolean(initialData.hours?.is24Hours),
          isClosed: Boolean(initialData.hours?.isClosed),
          schedule: initialData.hours?.schedule || {},
        },
        categoryData: { ...(initialData.categoryData || {}) },
        verification: {
          status: initialData.verification?.status || 'PENDING',
          lastVerifiedAt: initialData.verification?.lastVerifiedAt || null,
          verifiedBy: initialData.verification?.verifiedBy || '',
          source: initialData.verification?.source || 'Direct Administrative Entry',
          notes: initialData.verification?.notes || '',
        },
        tags: [...(initialData.tags || [])],
        status: initialData.status || 'ACTIVE',
      });
      setCurrentStep(3);
    } else {
      setSelectedSubcategories(['Emergency Hospital']);
      setFormData({
        name: '',
        shortName: '',
        kannadaName: '',
        category: 'EMERGENCY_CRITICAL_CARE',
        subcategory: 'Emergency Hospital',
        summary: '',
        fullDescription: '',
        address: 'Pavagada Town, Karnataka 561202',
        area: 'Pavagada Town',
        pincode: '561202',
        landmark: '',
        mapReference: '',
        coordinates: { latitude: 14.1025, longitude: 77.2798 },
        contact: {
          authority: '',
          phone: '',
          alternatePhone: '',
          whatsapp: '',
          email: '',
          website: '',
          onlineServiceUrl: '',
          customContacts: [],
        },
        hours: {
          open: '09:00 AM',
          close: '05:00 PM',
          days: 'Daily',
          is24Hours: false,
          isClosed: false,
          schedule: {},
        },
        categoryData: {},
        tags: ['Emergency', '24/7', 'Pavagada'],
        verification: {
          status: 'PENDING',
          source: 'Direct Administrative Entry',
          verifiedBy: '',
          notes: '',
        },
        status: 'ACTIVE',
        primaryPhotoUrl: '',
      });
      setCurrentStep(1);
    }
    setDuplicates([]);
    setDismissedDuplicates(false);
    setFormError(null);
  }, [initialData, isOpen]);

  // Debounced duplicate detection when Name or Area changes
  const duplicateCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (dismissedDuplicates || !formData.name || formData.name.trim().length < 4) {
      setDuplicates([]);
      return;
    }

    if (duplicateCheckTimer.current) clearTimeout(duplicateCheckTimer.current);

    duplicateCheckTimer.current = setTimeout(async () => {
      try {
        setIsCheckingDuplicates(true);
        const res = await adminApi.checkDuplicate({
          name: formData.name!.trim(),
          category: formData.category,
          area: formData.area,
          excludeId: initialData?.id,
        });
        if (res.hasDuplicates) {
          setDuplicates(res.duplicates);
        } else {
          setDuplicates([]);
        }
      } catch {
        // silent fail for duplicate check
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 500);

    return () => {
      if (duplicateCheckTimer.current) clearTimeout(duplicateCheckTimer.current);
    };
  }, [formData.name, formData.category, formData.area, dismissedDuplicates, initialData?.id]);

  if (!isOpen) return null;

  const activeMainCat =
    MAIN_CATEGORIES_TAXONOMY.find((c) => c.id === formData.category) ||
    MAIN_CATEGORIES_TAXONOMY[0];
  const primarySubId = selectedSubcategories[0] || formData.subcategory;
  const activeSubMeta = activeMainCat.subcategories.find(
    (s) => selectedSubcategories.includes(s.id) || s.id === primarySubId || s.name === primarySubId
  );

  // Navigation handlers
  const handleNext = () => {
    setFormError(null);
    if (currentStep === 1) {
      if (!formData.category) {
        setFormError('Please select a main category.');
        return;
      }
    }
    if (currentStep === 2) {
      if (selectedSubcategories.length === 0) {
        setFormError('Please select at least one subcategory.');
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.name?.trim()) {
        setFormError('Official Name is required.');
        return;
      }
      if (!formData.summary?.trim()) {
        setFormError('Short description is required.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 10));
  };

  const handleBack = () => {
    setFormError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSelectCategory = (catId: string) => {
    const main = MAIN_CATEGORIES_TAXONOMY.find((c) => c.id === catId);
    const firstSub = main?.subcategories[0]?.id || '';
    const newSubs = firstSub ? [firstSub] : [];
    setSelectedSubcategories(newSubs);
    setFormData((prev) => ({
      ...prev,
      category: catId,
      subcategory: newSubs.join(', '),
      tags: Array.from(new Set([...(prev.tags || []), ...(main?.subcategories[0]?.suggestedTags || [])])),
    }));
    setCurrentStep(2);
  };

  const handleToggleSubcategory = (subId: string) => {
    setSelectedSubcategories((prev) => {
      const exists = prev.includes(subId);
      const updated = exists ? prev.filter((s) => s !== subId) : [...prev, subId];

      const allSuggestedTags = activeMainCat.subcategories
        .filter((s) => updated.includes(s.id) || updated.includes(s.name))
        .flatMap((s) => s.suggestedTags || []);

      setFormData((fPrev) => ({
        ...fPrev,
        subcategory: updated.join(', '),
        tags: Array.from(new Set([...(fPrev.tags || []), ...allSuggestedTags])),
      }));

      return updated;
    });
  };

  const updateFormSubcategories = (subs: string[]) => {
    setSelectedSubcategories(subs);
    const allSuggestedTags = activeMainCat.subcategories
      .filter((s) => subs.includes(s.id) || subs.includes(s.name))
      .flatMap((s) => s.suggestedTags || []);

    setFormData((fPrev) => ({
      ...fPrev,
      subcategory: subs.join(', '),
      tags: Array.from(new Set([...(fPrev.tags || []), ...allSuggestedTags])),
    }));
  };

  // Submit Handler
  const handleSave = async (targetStatus?: PlaceStatus) => {
    setFormError(null);

    if (!formData.name?.trim()) {
      setFormError('Official Name is mandatory.');
      setCurrentStep(3);
      return;
    }
    if (!formData.category) {
      setFormError('Category is mandatory.');
      setCurrentStep(1);
      return;
    }
    if (selectedSubcategories.length === 0 && !formData.subcategory) {
      setFormError('Please select at least one subcategory.');
      setCurrentStep(2);
      return;
    }

    try {
      setIsSaving(true);
      const subcategoryString =
        selectedSubcategories.length > 0
          ? selectedSubcategories.join(', ')
          : formData.subcategory || '';

      const payload: Partial<LocationItem> = {
        ...formData,
        subcategory: subcategoryString,
        status: targetStatus || formData.status || 'ACTIVE',
      };

      let result: LocationItem;
      if (isEditing && initialData?.id) {
        result = await adminApi.updateLocation(initialData.id, payload);
      } else {
        result = await adminApi.createLocation(payload);
      }

      onSaved(result);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save record.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate step completeness
  const isBasicComplete = Boolean(formData.name?.trim() && formData.summary?.trim());
  const isLocationComplete = Boolean(formData.address?.trim() && formData.coordinates?.latitude);
  const isContactComplete = Boolean(
    formData.contact?.phone?.trim() || formData.contact?.authority?.trim()
  );
  const isTagsComplete = Boolean(formData.tags && formData.tags.length > 0);
  const isVerificationComplete = Boolean(
    formData.verification?.status && formData.verification.status !== 'NOT_VERIFIED'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-white shadow-md shadow-forest/20">
              <Building size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {isEditing ? `Edit Place: ${formData.name}` : 'Add New Place / Civic Service'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-800 text-slate-300 border-slate-700">
                  Step {currentStep} of 10
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {activeMainCat.name} &bull; {formData.subcategory || 'Select Type'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 overflow-x-auto scrollbar-none shrink-0 flex items-center gap-1.5">
          {STEPS.map((s) => {
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            const StepIcon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : isCompleted
                    ? 'text-emerald-400 hover:bg-slate-800/60'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle size={12} className="text-emerald-400" />
                ) : (
                  <StepIcon size={12} />
                )}
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Error Notification */}
        {formError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2 shrink-0">
            <AlertCircle size={15} />
            <span>{formError}</span>
          </div>
        )}

        {/* Duplicate Warning Alert */}
        {duplicates.length > 0 && !dismissedDuplicates && (
          <div className="mx-6 mt-4 shrink-0">
            <DuplicateAlert
              candidates={duplicates}
              onDismiss={() => setDismissedDuplicates(true)}
              onViewCandidate={(id) => {
                window.open(`/admin/places/${id}`, '_blank');
              }}
            />
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* STEP 1: Main Category Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  1. Select Primary Functional Category
                </h4>
                <p className="text-xs text-slate-400">
                  Choose the core domain for this place. The CMS will adapt all questions,
                  attributes, and public filters to match this category.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MAIN_CATEGORIES_TAXONOMY.map((cat) => {
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500 shadow-xl ring-2 ring-emerald-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.color.badge}`}
                          >
                            {cat.shortCode}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {cat.subcategories.length} subcategories
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                          {cat.name}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {cat.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                        <span>Select & Proceed</span>
                        <ChevronRight size={13} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Subcategory Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white mb-0.5">
                      2. Select Subcategories / Entity Types
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                      Multi-Select
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Category: <strong className="text-emerald-400">{activeMainCat.name}</strong> •{' '}
                    <span className="text-slate-300 font-semibold">{selectedSubcategories.length} selected</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = activeMainCat.subcategories.map((s) => s.id);
                      updateFormSubcategories(allIds);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateFormSubcategories([]);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-slate-400 hover:text-white underline font-medium px-2 py-1"
                  >
                    Change Category
                  </button>
                </div>
              </div>

              {/* Selected Subcategories Chips Display */}
              {selectedSubcategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Selected:</span>
                  {selectedSubcategories.map((subId) => {
                    const meta = activeMainCat.subcategories.find(
                      (s) => s.id === subId || s.name === subId
                    ) || { name: subId };
                    return (
                      <span
                        key={subId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
                      >
                        <span>{meta.name}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSubcategory(subId)}
                          className="hover:text-white text-emerald-400 p-0.5 rounded transition-colors"
                          title="Remove subcategory"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {activeMainCat.subcategories.map((sub) => {
                  const isSelected =
                    selectedSubcategories.includes(sub.id) ||
                    selectedSubcategories.includes(sub.name);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleToggleSubcategory(sub.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/20 border-emerald-500 shadow-lg ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h5 className="text-xs font-bold text-white">{sub.name}</h5>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : 'border border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isSelected && <Check size={13} className="stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {sub.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Step 2 Bottom Continue CTA */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  {selectedSubcategories.length === 0 ? (
                    <span className="text-amber-400 font-medium">⚠️ Select at least one subcategory</span>
                  ) : (
                    <span>
                      <strong className="text-emerald-400 font-bold">{selectedSubcategories.length}</strong> subcategor{selectedSubcategories.length > 1 ? 'ies' : 'y'} selected
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedSubcategories.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-forest/20"
                >
                  <span>Continue to Basic Info</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Common Basic Information */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white mb-1">
                  3. Official Place & Service Identification
                </h4>
                <p className="text-xs text-slate-400">
                  Official name, local Kannada script title, short summary, and status.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Official Name"
                  required
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      shortName: prev.shortName || e.target.value,
                    }))
                  }
                  placeholder="e.g. Government Taluk General Hospital"
                  helperText="Full official legal or municipal title"
                />

                <TextField
                  label="Short Name / Common Alias"
                  value={formData.shortName || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shortName: e.target.value }))}
                  placeholder="e.g. Taluk Hospital / GH"
                  helperText="Display alias on cards and compact mobile badges"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Name in Kannada Script (ಕನ್ನಡ ಹೆಸರು)"
                  value={formData.kannadaName || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kannadaName: e.target.value }))}
                  placeholder="e.g. ಸರ್ಕಾರಿ ತಾಲ್ಲೂಕು ಸಾರ್ವಜನಿಕ ಆಸ್ಪತ್ರೆ"
                  helperText="Shown on bilingual public site and regional search"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Category Assignment
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-semibold flex-1">
                      {activeMainCat.name} &bull; {formData.subcategory}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>

              <Textarea
                label="Short Description"
                required
                rows={2}
                value={formData.summary || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="1 to 2 concise sentences explaining what this place is and its primary purpose..."
                helperText="Displayed prominently on map cards and search previews"
              />

              <Textarea
                label="Detailed Description & Background"
                rows={4}
                value={formData.fullDescription || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullDescription: e.target.value }))}
                placeholder="Comprehensive background, citizen guide, visiting advice, or departmental notes..."
                helperText="Displayed on the dedicated full-page view"
              />

              <StatusSelector
                value={formData.status || 'ACTIVE'}
                onChange={(st) => setFormData((prev) => ({ ...prev, status: st }))}
              />
            </div>
          )}

          {/* STEP 4: Category-Specific Dynamic Details */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    4. Category-Specific Attributes ({formData.subcategory})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Fields tailored strictly for {formData.subcategory}. Irrelevant attributes are
                    excluded.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-[11px] font-mono text-emerald-400">
                  {formData.category}
                </span>
              </div>

              <CategoryFieldsDispatcher
                categoryId={formData.category || 'EMERGENCY_CRITICAL_CARE'}
                subcategory={formData.subcategory || 'Emergency Hospital'}
                categoryData={formData.categoryData || {}}
                onChange={(catData) => setFormData((prev) => ({ ...prev, categoryData: catData }))}
              />
            </div>
          )}

          {/* STEP 5: Location & Map */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white mb-1">5. Physical Location & Map Picker</h4>
                <p className="text-xs text-slate-400">
                  Specify street address, taluk locality, landmark, and interactively pin coordinates.
                </p>
              </div>

              <AddressField
                address={formData.address || ''}
                area={formData.area || 'Pavagada Town'}
                pincode={formData.pincode || '561202'}
                landmark={formData.landmark || ''}
                onAddressChange={(val) => setFormData((prev) => ({ ...prev, address: val }))}
                onAreaChange={(val) => setFormData((prev) => ({ ...prev, area: val }))}
                onPincodeChange={(val) => setFormData((prev) => ({ ...prev, pincode: val }))}
                onLandmarkChange={(val) => setFormData((prev) => ({ ...prev, landmark: val }))}
              />

              <MapPicker
                latitude={formData.coordinates?.latitude || 14.1025}
                longitude={formData.coordinates?.longitude || 77.2798}
                onChange={(lat, lng) =>
                  setFormData((prev) => ({
                    ...prev,
                    coordinates: {
                      ...prev.coordinates,
                      latitude: lat,
                      longitude: lng,
                    },
                  }))
                }
              />
            </div>
          )}

          {/* STEP 6: Contact & Operating Hours */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white mb-1">
                  6. Contact Information & Operating Timings
                </h4>
                <p className="text-xs text-slate-400">
                  Citizen contact channels and weekly operating hours with multi-slot support.
                </p>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h5 className="text-xs font-bold text-white flex items-center gap-2">
                  <Phone size={15} className="text-emerald-400" />
                  <span>Public Contact Channels</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <PhoneField
                    label="Primary Official Phone"
                    required
                    value={formData.contact?.phone || ''}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, phone: val },
                      }))
                    }
                    placeholder="08136-244222 or 9449800000"
                  />

                  <PhoneField
                    label="Alternate Phone / Helpdesk"
                    value={formData.contact?.alternatePhone || ''}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, alternatePhone: val },
                      }))
                    }
                    placeholder="08136-244223"
                    helperText="Secondary contact number if primary is engaged"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <PhoneField
                    label="Official WhatsApp Support"
                    value={formData.contact?.whatsapp || ''}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, whatsapp: val },
                      }))
                    }
                    placeholder="9449800000"
                    helperText="For citizen messaging or document sharing"
                  />

                  <EmailField
                    label="Official Public Email"
                    value={formData.contact?.email || ''}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, email: val },
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField
                    label="Official Website URL"
                    value={formData.contact?.website || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, website: e.target.value },
                      }))
                    }
                    placeholder="https://..."
                  />

                  <TextField
                    label="Official Online Citizen Service URL"
                    value={formData.contact?.onlineServiceUrl || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, onlineServiceUrl: e.target.value },
                      }))
                    }
                    placeholder="https://sevasindhu.karnataka.gov.in/..."
                    helperText="Direct portal for bookings, forms, or applications"
                  />
                </div>
              </div>

              {/* Operating Hours Component */}
              <OperatingHours
                value={formData.hours}
                onChange={(hrs) => setFormData((prev) => ({ ...prev, hours: hrs }))}
              />
            </div>
          )}

          {/* STEP 7: Photos */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white mb-1">
                  7. Authentic Photographs & Media Archive
                </h4>
                <p className="text-xs text-slate-400">
                  Upload multiple authentic photographs. Designate a Primary Cover Photo and add
                  descriptive captions.
                </p>
              </div>

              <PhotoUploader
                entityType="location"
                entityId={initialData?.id || ''}
                primaryPhotoUrl={formData.primaryPhotoUrl}
                onPrimaryPhotoChange={(url) =>
                  setFormData((prev) => ({ ...prev, primaryPhotoUrl: url }))
                }
                onPhotosChange={(photos) => setLocalPhotos(photos)}
              />
            </div>
          )}

          {/* STEP 8: Tags & Discovery */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white mb-1">
                  8. Central Tagging & Smart Discoverability
                </h4>
                <p className="text-xs text-slate-400">
                  Tags power user search filters (e.g. "24/7", "UPI", "Snakebite", "Hostel",
                  "Wheelchair Accessible").
                </p>
              </div>

              <TagSelector
                selectedTags={formData.tags || []}
                suggestedTags={
                  Array.from(
                    new Set(
                      activeMainCat.subcategories
                        .filter(
                          (s) =>
                            selectedSubcategories.includes(s.id) ||
                            selectedSubcategories.includes(s.name)
                        )
                        .flatMap((s) => s.suggestedTags || [])
                    )
                  )
                }
                onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
              />
            </div>
          )}

          {/* STEP 9: Verification System */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white mb-1">
                  9. Data Verification & Freshness Guarantee
                </h4>
                <p className="text-xs text-slate-400">
                  Citizen trust requires verified sources. Mark the verification status and
                  provenance.
                </p>
              </div>

              <VerificationPanel
                value={formData.verification}
                onChange={(v) => setFormData((prev) => ({ ...prev, verification: v }))}
              />
            </div>
          )}

          {/* STEP 10: Review & Publish */}
          {currentStep === 10 && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white mb-1">10. Review & Final Publication</h4>
                <p className="text-xs text-slate-400">
                  Review completeness before saving as draft or publishing directly to Namma Pavagada.
                </p>
              </div>

              {/* Completeness Checklist Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { label: 'Basic Info', ok: isBasicComplete },
                  { label: 'Location & Map', ok: isLocationComplete },
                  { label: 'Contact', ok: isContactComplete },
                  { label: 'Tags', ok: isTagsComplete },
                  { label: 'Verification', ok: isVerificationComplete },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      item.ok
                        ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold">{item.label}</span>
                    {item.ok ? (
                      <CheckCircle size={15} className="text-emerald-400" />
                    ) : (
                      <span className="text-[11px] text-slate-500">○</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Citizen-Facing Preview Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {(formData.subcategory
                        ? formData.subcategory.split(',').map((s) => s.trim()).filter(Boolean)
                        : [activeMainCat.name]
                      ).map((sub) => (
                        <span
                          key={sub}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-950 text-emerald-300 border-emerald-800"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">{formData.name}</h3>
                    {formData.kannadaName && (
                      <p className="text-xs text-slate-400">{formData.kannadaName}</p>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      formData.status === 'DRAFT'
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    }`}
                  >
                    {formData.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{formData.summary}</p>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-emerald-400" />
                    <span>{formData.area}</span>
                  </span>
                  {formData.contact?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-emerald-400" />
                      <span>{formData.contact.phone}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-400" />
                    <span>{formData.verification?.status || 'PENDING'}</span>
                  </span>
                </div>

                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {formData.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Previous Step</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSave('DRAFT')}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Save size={14} />
              <span>Save as Draft</span>
            </button>

            {currentStep < 10 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all shadow-md shadow-forest/20"
              >
                <span>Save & Continue</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave('PUBLISHED')}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/30"
              >
                {isSaving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                <span>Publish to Public Site</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { surveyApi } from '../../api/surveyApi';
import { surveyOffline } from '../../utils/surveyOffline';
import { BuildingType, CommercialSubtype, OccupancyStatus, BuildingCondition, UnitType } from '../../types/survey';

const BUILDING_TYPES: BuildingType[] = [
  'Commercial',
  'Mixed-use',
  'Residential',
  'Institutional',
  'Government',
  'Religious',
  'Educational',
  'Healthcare',
  'Industrial',
  'Other',
];

const COMMERCIAL_SUBTYPES: { key: CommercialSubtype; label: string }[] = [
  { key: 'commercial_multibusiness', label: 'Commercial Complex (Multiple Businesses)' },
  { key: 'shopping_complex', label: 'Shopping Complex / Mall' },
  { key: 'independent_shop', label: 'Single Independent Shop' },
  { key: 'office_building', label: 'Office / Corporate Building' },
  { key: 'market_building', label: 'Market / Shandy Yard Building' },
];

const RELIGIOUS_SUBTYPES = [
  { key: 'temple', label: 'Temple / Devasthana (ದೇವಸ್ಥಾನ)' },
  { key: 'mosque_dargah', label: 'Mosque / Dargah / Masjid (ಮಸೀದಿ / ದರ್ಗಾ)' },
  { key: 'church', label: 'Church / Chapel (ಚರ್ಚ್)' },
  { key: 'mutt_ashram', label: 'Mutt / Matha / Ashram (ಮಠ / ಆಶ್ರಮ)' },
  { key: 'jain_basadi', label: 'Jain Temple / Basadi (ಬಸದಿ)' },
  { key: 'shrine_other', label: 'Other Sacred Shrine / Peetha' },
];

const OCCUPANCY_OPTIONS: OccupancyStatus[] = [
  'Fully occupied',
  'Partially occupied',
  'Vacant',
  'Under construction',
  'Unknown',
];

const CONDITION_OPTIONS: BuildingCondition[] = [
  'Excellent',
  'Good',
  'Average',
  'Poor',
  'Under construction',
];

export const BuildingWizardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const initialLat = route.params?.initialLat || 14.1025;
  const initialLng = route.params?.initialLng || 77.2798;
  const editBuildingId = route.params?.buildingId;

  // Single persistent draft ID for this survey session to prevent multiple drafts
  const [draftId] = useState<string>(
    () => route.params?.draftId || `draft_bld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  );

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  // Step 1: Identification
  const [name, setName] = useState<string>('');
  const [kannadaName, setKannadaName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [area, setArea] = useState<string>('Fort Road');
  const [street, setStreet] = useState<string>('');
  const [pincode, setPincode] = useState<string>('561202');
  const [landmark, setLandmark] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [sourceInfo, setSourceInfo] = useState<string>('Field Survey');

  // Step 2: Classification
  const [buildingType, setBuildingType] = useState<BuildingType>('Commercial');
  const [commercialSubtype, setCommercialSubtype] = useState<CommercialSubtype>('commercial_multibusiness');
  const [religiousSubtype, setReligiousSubtype] = useState<string>('temple');
  const [secondaryUsage, setSecondaryUsage] = useState<string>('');
  const [occupancyStatus, setOccupancyStatus] = useState<OccupancyStatus>('Partially occupied');
  const [buildingCondition, setBuildingCondition] = useState<BuildingCondition>('Good');

  // Step 3: Physical
  const [totalFloors, setTotalFloors] = useState<string>('1');
  const [commercialUnitsCount, setCommercialUnitsCount] = useState<string>('2');
  const [residentialUnitsCount, setResidentialUnitsCount] = useState<string>('0');
  const [vacantUnitsCount, setVacantUnitsCount] = useState<string>('0');
  const [approxSizeSqft, setApproxSizeSqft] = useState<string>('');
  const [twoWheelerParking, setTwoWheelerParking] = useState<boolean>(true);
  const [carParking, setCarParking] = useState<boolean>(false);
  const [liftAvailable, setLiftAvailable] = useState<boolean>(false);
  const [roadWidth, setRoadWidth] = useState<string>('Wide (Two lane)');

  // Step 4: Coordinates
  const [latitude, setLatitude] = useState<string>(String(initialLat));
  const [longitude, setLongitude] = useState<string>(String(initialLng));
  const [entranceLat, setEntranceLat] = useState<string>('');
  const [entranceLng, setEntranceLng] = useState<string>('');

  // Step 5: Photos
  const [photos, setPhotos] = useState<Array<{ url: string; photoType: string; caption?: string }>>([
    { url: '', photoType: 'Front View', caption: 'Main front facade' },
  ]);

  // Step 6: Floors & Units
  const [floors, setFloors] = useState<Array<{
    floorLevel: number;
    floorName: string;
    floorUsage: string;
    units: Array<{ unitNumber: string; unitName: string; unitType: UnitType; usage: 'Commercial' | 'Residential' | 'Storage' | 'Mixed'; occupancyStatus: 'Occupied' | 'Vacant' | 'Under Renovation' | 'Reserved' }>;
  }>>([
    {
      floorLevel: 0,
      floorName: 'Ground Floor',
      floorUsage: 'Commercial',
      units: [
        { unitNumber: 'Shop 001', unitName: '', unitType: 'Retail Shop', usage: 'Commercial', occupancyStatus: 'Occupied' },
      ],
    },
  ]);

  // Load existing data if editing
  useEffect(() => {
    if (editBuildingId) {
      loadBuilding(editBuildingId);
    }
  }, [editBuildingId]);

  const loadBuilding = async (id: string) => {
    try {
      setSubmitting(true);
      const bld = await surveyApi.getBuildingById(id);
      setName(bld.name);
      setKannadaName(bld.kannadaName || '');
      setAddress(bld.address);
      setArea(bld.area || 'Fort Road');
      setStreet(bld.street || '');
      setPincode(bld.pincode || '561202');
      setLandmark(bld.landmark || '');
      setNotes(bld.identificationNotes || '');
      setBuildingType(bld.buildingType);
      if (bld.commercialSubtype) {
        if (bld.buildingType === 'Religious') {
          setReligiousSubtype(bld.commercialSubtype);
        } else {
          setCommercialSubtype(bld.commercialSubtype);
        }
      }
      setOccupancyStatus(bld.occupancyStatus);
      setBuildingCondition(bld.buildingCondition);
      setTotalFloors(String(bld.totalFloors || 1));
      setCommercialUnitsCount(String(bld.commercialUnitsCount || 0));
      setResidentialUnitsCount(String(bld.residentialUnitsCount || 0));
      setLatitude(String(bld.latitude));
      setLongitude(String(bld.longitude));

      if (bld.entranceLatitude) setEntranceLat(String(bld.entranceLatitude));
      if (bld.entranceLongitude) setEntranceLng(String(bld.entranceLongitude));
      if (bld.approxSizeSqft) setApproxSizeSqft(String(bld.approxSizeSqft));
      if (bld.twoWheelerParking !== undefined) setTwoWheelerParking(bld.twoWheelerParking);
      if (bld.carParking !== undefined) setCarParking(bld.carParking);
      if (bld.liftAvailable !== undefined) setLiftAvailable(bld.liftAvailable);
      if (bld.roadAccessWidth) setRoadWidth(bld.roadAccessWidth);
      if (bld.vacantUnitsCount !== undefined) setVacantUnitsCount(String(bld.vacantUnitsCount));
      if (bld.secondaryUsage) setSecondaryUsage(bld.secondaryUsage);

      // Photos
      if (bld.photos && bld.photos.length > 0) {
        setPhotos(
          bld.photos.map((p) => ({
            url: p.url,
            photoType: p.photoType || 'Front View',
            caption: p.caption || '',
          }))
        );
      }

      // Floors & Units
      if (bld.floors && bld.floors.length > 0) {
        setFloors(
          bld.floors.map((f) => ({
            floorLevel: f.floorLevel,
            floorName: f.floorName,
            floorUsage: f.floorUsage,
            units: (f.units || []).map((u) => ({
              unitNumber: u.unitNumber,
              unitName: u.unitName || '',
              unitType: u.unitType || 'Retail Shop',
              usage: (u.usage as any) || 'Commercial',
              occupancyStatus: (u.occupancyStatus as any) || 'Occupied',
            })),
          }))
        );
      }
    } catch (e: any) {
      Alert.alert('Error', 'Failed to load building data');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-save draft on step transition
  const autoSaveDraft = async () => {
    const draftPayload = {
      name,
      kannadaName,
      address,
      area,
      street,
      pincode,
      landmark,
      identificationNotes: notes,
      sourceOfInformation: sourceInfo,
      buildingType,
      commercialSubtype:
        buildingType === 'Commercial'
          ? commercialSubtype
          : buildingType === 'Religious'
            ? (religiousSubtype as any)
            : undefined,
      secondaryUsage,
      occupancyStatus,
      buildingCondition,
      totalFloors: parseInt(totalFloors, 10) || floors.length,
      commercialUnitsCount: parseInt(commercialUnitsCount, 10) || 0,
      residentialUnitsCount: parseInt(residentialUnitsCount, 10) || 0,
      vacantUnitsCount: parseInt(vacantUnitsCount, 10) || 0,
      approxSizeSqft: approxSizeSqft ? parseFloat(approxSizeSqft) : undefined,
      twoWheelerParking,
      carParking,
      liftAvailable,
      roadAccessWidth: roadWidth,
      latitude: parseFloat(latitude) || initialLat,
      longitude: parseFloat(longitude) || initialLng,
      entranceLatitude: entranceLat ? parseFloat(entranceLat) : undefined,
      entranceLongitude: entranceLng ? parseFloat(entranceLng) : undefined,
      photos: photos.filter((p) => p.url.trim() !== ''),
      floors,
    };

    await surveyOffline.saveDraft({
      id: editBuildingId || draftId,
      type: 'BUILDING',
      title: name || 'Building Draft',
      subtitle: `${area} • ${buildingType}`,
      step,
      totalSteps: 6,
      data: draftPayload,
      updatedAt: new Date().toISOString(),
      synced: false,
    });
  };

  const nextStep = () => {
    if (step === 1 && !address.trim() && !name.trim()) {
      Alert.alert('Required Info', 'Please enter building name or an address/landmark.');
      return;
    }
    autoSaveDraft();
    setStep((prev) => Math.min(6, prev + 1));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Floor and Unit Helpers
  const handleAddFloor = () => {
    const nextLevel = floors.length;
    const isGround = nextLevel === 0;
    const floorLabel = isGround
      ? 'Ground Floor'
      : nextLevel === 1
        ? '1st Floor'
        : nextLevel === 2
          ? '2nd Floor'
          : `${nextLevel}th Floor`;

    const defaultUsage =
      buildingType === 'Residential'
        ? 'Residential'
        : buildingType === 'Religious'
          ? 'Religious'
          : 'Commercial';

    setFloors((prev) => [
      ...prev,
      {
        floorLevel: nextLevel,
        floorName: floorLabel,
        floorUsage: defaultUsage,
        units: [
          {
            unitNumber: isGround ? 'Unit G01' : `Unit ${nextLevel}01`,
            unitName: '',
            unitType: buildingType === 'Religious' ? 'Other' : 'Retail Shop',
            usage: buildingType === 'Residential' ? 'Residential' : 'Commercial',
            occupancyStatus: 'Occupied',
          },
        ],
      },
    ]);
  };

  const handleRemoveFloor = (floorIndex: number) => {
    if (floors.length <= 1) {
      Alert.alert(
        'Cannot Remove Floor',
        'A building must have at least one floor. You can add or remove individual units instead.'
      );
      return;
    }

    Alert.alert(
      'Remove Floor',
      `Are you sure you want to remove ${floors[floorIndex].floorName} and all its registered units?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFloors((prev) => {
              const updated = prev.filter((_, idx) => idx !== floorIndex);
              return updated.map((fl, newIdx) => ({
                ...fl,
                floorLevel: newIdx,
              }));
            });
          },
        },
      ]
    );
  };

  const handleAddUnit = (floorIndex: number) => {
    setFloors((prev) => {
      const updated = [...prev];
      const targetFloor = { ...updated[floorIndex] };
      const nextUnitNum = targetFloor.units.length + 1;
      const prefix = floorIndex === 0 ? 'G' : String(floorIndex);
      targetFloor.units = [
        ...targetFloor.units,
        {
          unitNumber: `Unit ${prefix}${nextUnitNum < 10 ? `0${nextUnitNum}` : nextUnitNum}`,
          unitName: '',
          unitType: buildingType === 'Religious' ? 'Other' : 'Retail Shop',
          usage: buildingType === 'Residential' ? 'Residential' : 'Commercial',
          occupancyStatus: 'Occupied',
        },
      ];
      updated[floorIndex] = targetFloor;
      return updated;
    });
  };

  const handleRemoveUnit = (floorIndex: number, unitIndex: number) => {
    setFloors((prev) => {
      const updated = [...prev];
      const targetFloor = { ...updated[floorIndex] };
      if (targetFloor.units.length <= 1) {
        Alert.alert(
          'Remove Last Unit?',
          'This is the only unit on this floor. Removing it will leave this floor with 0 units. Proceed?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: () => {
                setFloors((p) => {
                  const u = [...p];
                  u[floorIndex] = {
                    ...u[floorIndex],
                    units: u[floorIndex].units.filter((_, idx) => idx !== unitIndex),
                  };
                  return u;
                });
              },
            },
          ]
        );
        return updated;
      }
      targetFloor.units = targetFloor.units.filter((_, idx) => idx !== unitIndex);
      updated[floorIndex] = targetFloor;
      return updated;
    });
  };

  const handleUpdateUnit = (
    floorIndex: number,
    unitIndex: number,
    field: string,
    value: any
  ) => {
    setFloors((prev) => {
      const updated = [...prev];
      const targetFloor = { ...updated[floorIndex] };
      const targetUnits = [...targetFloor.units];
      targetUnits[unitIndex] = { ...targetUnits[unitIndex], [field]: value };
      targetFloor.units = targetUnits;
      updated[floorIndex] = targetFloor;
      return updated;
    });
  };

  const handleSaveBuilding = async () => {
    if (submitting) return;
    setSubmitting(true);
    const payload = {
      name: name.trim() || undefined,
      kannadaName: kannadaName.trim() || undefined,
      address: address.trim() || `Near ${landmark || area || 'Pavagada'}`,
      area,
      street,
      pincode,
      landmark,
      identificationNotes: notes,
      sourceOfInformation: sourceInfo,
      buildingType,
      commercialSubtype:
        buildingType === 'Commercial'
          ? commercialSubtype
          : buildingType === 'Religious'
            ? (religiousSubtype as any)
            : undefined,
      secondaryUsage,
      occupancyStatus,
      buildingCondition,
      totalFloors: parseInt(totalFloors, 10) || floors.length,
      commercialUnitsCount: parseInt(commercialUnitsCount, 10) || 0,
      residentialUnitsCount: parseInt(residentialUnitsCount, 10) || 0,
      vacantUnitsCount: parseInt(vacantUnitsCount, 10) || 0,
      approxSizeSqft: approxSizeSqft ? parseFloat(approxSizeSqft) : undefined,
      twoWheelerParking,
      carParking,
      liftAvailable,
      roadAccessWidth: roadWidth,
      latitude: parseFloat(latitude) || initialLat,
      longitude: parseFloat(longitude) || initialLng,
      entranceLatitude: entranceLat ? parseFloat(entranceLat) : undefined,
      entranceLongitude: entranceLng ? parseFloat(entranceLng) : undefined,
      photos: photos.filter((p) => p.url.trim() !== ''),
      floors,
    };

    try {
      let savedBuilding: any;
      if (editBuildingId) {
        savedBuilding = await surveyApi.updateBuilding(editBuildingId, payload);
      } else {
        savedBuilding = await surveyApi.createBuilding(payload);
      }

      // Clean up the local draft upon successful save to prevent duplicate re-sync
      await surveyOffline.deleteDraft(draftId);
      if (editBuildingId) {
        await surveyOffline.deleteDraft(editBuildingId);
      }

      setSubmitting(false);

      Alert.alert(
        editBuildingId ? 'Building Updated Successfully! 🎉' : 'Building Mapped Successfully! 🎉',
        editBuildingId
          ? `Changes to "${savedBuilding.name}" (${savedBuilding.code}) have been saved successfully.`
          : `Recorded "${savedBuilding.name}" (${savedBuilding.code}). +50 Surveyor Points Awarded!`,
        [
          {
            text: '+ Add Shop to this Building',
            onPress: () => {
              navigation.replace('BusinessWizard', {
                buildingId: savedBuilding.id,
                buildingName: savedBuilding.name,
              });
            },
          },
          {
            text: 'View Building Details',
            onPress: () => {
              navigation.replace('BuildingDetail', { buildingId: savedBuilding.id });
            },
          },
          {
            text: 'Back to Map',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    } catch (err: any) {
      setSubmitting(false);
      // If offline, save locally
      await autoSaveDraft();
      Alert.alert(
        'Saved as Offline Draft',
        `Unable to reach server (${err.message}). Your building has been saved as an offline draft and will sync automatically when network returns.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Wizard Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{editBuildingId ? 'Edit Building' : 'Building Survey'}</Text>
          <Text style={styles.headerSubtitle}>
            Step {step} of 6: {
              step === 1 ? 'Identification' :
                step === 2 ? 'Classification' :
                  step === 3 ? 'Physical Structure' :
                    step === 4 ? 'Location' :
                      step === 5 ? 'Photos' : 'Floors & Units'
            }
          </Text>
        </View>
        <TouchableOpacity onPress={autoSaveDraft} style={styles.draftBtn}>
          <Text style={styles.draftBtnText}>💾 Draft</Text>
        </TouchableOpacity>
      </View>

      {/* Step Progress Bar */}
      <View style={styles.stepBarBg}>
        <View style={[styles.stepBarFill, { width: `${(step / 6) * 100}%` }]} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* STEP 1: IDENTIFICATION */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Building Identification</Text>
            <Text style={styles.sectionDesc}>
              Enter known building name or leave blank to auto-generate from Taluk ID.
            </Text>

            <Text style={styles.fieldLabel}>Building Name (Optional if unnamed)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. SLV Complex, Fort View Residency"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.fieldLabel}>Kannada Name (ಕನ್ನಡ ಹೆಸರು)</Text>
            <TextInput
              style={styles.input}
              placeholder="ಉದಾ: ಶ್ರೀ ಲಕ್ಷ್ಮೀ ವೆಂಕಟೇಶ್ವರ ಕಾಂಪ್ಲೆಕ್ಸ್"
              value={kannadaName}
              onChangeText={setKannadaName}
            />

            <Text style={styles.fieldLabel}>Official or Commonly Used Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Fort Road, Near SBI Bank, Pavagada"
              multiline
              numberOfLines={2}
              value={address}
              onChangeText={setAddress}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Area / Locality</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Fort Road, MG Circle"
                  value={area}
                  onChangeText={setArea}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Pincode</Text>
                <TextInput
                  style={styles.input}
                  placeholder="561202"
                  keyboardType="numeric"
                  value={pincode}
                  onChangeText={setPincode}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Prominent Landmark</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Opposite KSRTC Bus Depot"
              value={landmark}
              onChangeText={setLandmark}
            />

            <Text style={styles.fieldLabel}>Street / Road Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kalyandurga Main Road"
              value={street}
              onChangeText={setStreet}
            />

            <Text style={styles.fieldLabel}>Surveyor Identification Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Yellow painted two-storey corner building"
              multiline
              numberOfLines={2}
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        )}

        {/* STEP 2: CLASSIFICATION */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Building Classification</Text>
            <Text style={styles.sectionDesc}>Specify the primary function and structural usage.</Text>

            <Text style={styles.fieldLabel}>Building Type *</Text>
            <View style={styles.chipsWrap}>
              {BUILDING_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, buildingType === t && styles.chipActive]}
                  onPress={() => setBuildingType(t)}
                >
                  <Text style={[styles.chipText, buildingType === t && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Conditional Commercial Subtype */}
            {buildingType === 'Commercial' && (
              <View style={styles.subBox}>
                <Text style={styles.fieldLabel}>Commercial Sub-classification</Text>
                {COMMERCIAL_SUBTYPES.map((sub) => (
                  <TouchableOpacity
                    key={sub.key}
                    style={[styles.radioItem, commercialSubtype === sub.key && styles.radioItemActive]}
                    onPress={() => setCommercialSubtype(sub.key)}
                  >
                    <Text style={styles.radioDot}>{commercialSubtype === sub.key ? '●' : '○'}</Text>
                    <Text style={styles.radioLabel}>{sub.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Conditional Religious Subtype */}
            {buildingType === 'Religious' && (
              <View style={styles.subBox}>
                <Text style={styles.fieldLabel}>Religious Place Classification *</Text>
                {RELIGIOUS_SUBTYPES.map((sub) => (
                  <TouchableOpacity
                    key={sub.key}
                    style={[styles.radioItem, religiousSubtype === sub.key && styles.radioItemActive]}
                    onPress={() => setReligiousSubtype(sub.key)}
                  >
                    <Text style={styles.radioDot}>{religiousSubtype === sub.key ? '●' : '○'}</Text>
                    <Text style={styles.radioLabel}>{sub.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.fieldLabel}>Occupancy Status</Text>
            <View style={styles.chipsWrap}>
              {OCCUPANCY_OPTIONS.map((occ) => (
                <TouchableOpacity
                  key={occ}
                  style={[styles.chip, occupancyStatus === occ && styles.chipActive]}
                  onPress={() => setOccupancyStatus(occ)}
                >
                  <Text style={[styles.chipText, occupancyStatus === occ && styles.chipTextActive]}>
                    {occ}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Building Condition</Text>
            <View style={styles.chipsWrap}>
              {CONDITION_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, buildingCondition === c && styles.chipActive]}
                  onPress={() => setBuildingCondition(c)}
                >
                  <Text style={[styles.chipText, buildingCondition === c && styles.chipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Secondary Usage (if any)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ground floor shops, First floor residence"
              value={secondaryUsage}
              onChangeText={setSecondaryUsage}
            />
          </View>
        )}

        {/* STEP 3: PHYSICAL DETAILS */}
        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Physical Specifications</Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Total Floors</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={totalFloors}
                  onChangeText={setTotalFloors}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Commercial Units</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={commercialUnitsCount}
                  onChangeText={setCommercialUnitsCount}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Residential Units</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={residentialUnitsCount}
                  onChangeText={setResidentialUnitsCount}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Vacant Units</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={vacantUnitsCount}
                  onChangeText={setVacantUnitsCount}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Approx. Total Space (Sq. Ft - optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2400"
              keyboardType="numeric"
              value={approxSizeSqft}
              onChangeText={setApproxSizeSqft}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Two-Wheeler Parking Available</Text>
              <Switch value={twoWheelerParking} onValueChange={setTwoWheelerParking} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Car / Four-Wheeler Parking Available</Text>
              <Switch value={carParking} onValueChange={setCarParking} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Elevator / Lift Available</Text>
              <Switch value={liftAvailable} onValueChange={setLiftAvailable} />
            </View>
          </View>
        )}

        {/* STEP 4: COORDINATES & LOCATION */}
        {step === 4 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Building Location Coordinates</Text>
            <Text style={styles.sectionDesc}>
              Captured from OpenStreetMap. You can adjust the exact pin or main entrance coordinates.
            </Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Latitude *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={latitude}
                  onChangeText={setLatitude}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Longitude *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={longitude}
                  onChangeText={setLongitude}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Main Entrance Latitude (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 14.102520"
              keyboardType="numeric"
              value={entranceLat}
              onChangeText={setEntranceLat}
            />

            <Text style={styles.fieldLabel}>Main Entrance Longitude (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 77.279810"
              keyboardType="numeric"
              value={entranceLng}
              onChangeText={setEntranceLng}
            />
          </View>
        )}

        {/* STEP 5: PHOTOGRAPHS */}
        {step === 5 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Building Photographs</Text>
            <Text style={styles.sectionDesc}>
              Document the front facade, entrance, nameboard, and street context.
            </Text>

            {photos.map((p, idx) => (
              <View key={idx} style={styles.photoItem}>
                <View style={styles.row}>
                  <Text style={styles.photoIndex}>Photo #{idx + 1} ({p.photoType})</Text>
                  {photos.length > 1 && (
                    <TouchableOpacity
                      onPress={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Image URL or S3 media link..."
                  value={p.url}
                  onChangeText={(val) => {
                    const updated = [...photos];
                    updated[idx].url = val;
                    setPhotos(updated);
                  }}
                />

                <TextInput
                  style={[styles.input, { marginTop: 6 }]}
                  placeholder="Caption (e.g. Front View, Nameboard)"
                  value={p.caption}
                  onChangeText={(val) => {
                    const updated = [...photos];
                    updated[idx].caption = val;
                    setPhotos(updated);
                  }}
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() =>
                setPhotos([...photos, { url: '', photoType: 'Entrance', caption: '' }])
              }
            >
              <Text style={styles.addBtnText}>+ Add Another Photograph</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 6: FLOORS & UNITS */}
        {step === 6 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Floors and Units Structure</Text>
            <Text style={styles.sectionDesc}>
              Structure the building by floors and commercial/residential units before registering businesses.
            </Text>

            {floors.map((floor, fIdx) => (
              <View key={fIdx} style={styles.floorCard}>
                <View style={styles.floorHeader}>
                  <Text style={styles.floorTitle}>🏢 {floor.floorName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.floorTag}>{floor.floorUsage}</Text>
                    {floors.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeFloorBtn}
                        onPress={() => handleRemoveFloor(fIdx)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.removeFloorText}>🗑️ Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <Text style={styles.subHeading}>Registered Units on this Floor:</Text>
                {floor.units.length === 0 ? (
                  <View style={styles.emptyUnitsNotice}>
                    <Text style={styles.emptyUnitsText}>No units on this floor yet. Tap "+ Add Unit" below.</Text>
                  </View>
                ) : (
                  floor.units.map((unit, uIdx) => (
                    <View key={uIdx} style={styles.unitRow}>
                      <Text style={styles.unitNumberBadge}>{unit.unitNumber}</Text>
                      <View style={{ flex: 1, marginRight: 6 }}>
                        <TextInput
                          style={styles.unitNameInput}
                          placeholder="Shop / Unit Name (optional)"
                          placeholderTextColor="#94A3B8"
                          value={unit.unitName}
                          onChangeText={(val) => handleUpdateUnit(fIdx, uIdx, 'unitName', val)}
                        />
                        <Text style={styles.unitSub}>{unit.unitType} • {unit.occupancyStatus}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeUnitBtn}
                        onPress={() => handleRemoveUnit(fIdx, uIdx)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.removeUnitText}>✕ Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}

                <TouchableOpacity
                  style={styles.addUnitBtn}
                  onPress={() => handleAddUnit(fIdx)}
                >
                  <Text style={styles.addUnitText}>+ Add Unit to {floor.floorName}</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addFloorBtn} onPress={handleAddFloor}>
              <Text style={styles.addFloorText}>+ Add Another Floor</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons Bottom Bar */}
      <View style={styles.bottomBar}>
        {step > 1 && (
          <TouchableOpacity style={styles.navBtnSecondary} onPress={prevStep}>
            <Text style={styles.navBtnSecondaryText}>Back</Text>
          </TouchableOpacity>
        )}

        {step < 6 ? (
          <TouchableOpacity style={styles.navBtnPrimary} onPress={nextStep}>
            <Text style={styles.navBtnPrimaryText}>Continue →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navBtnSuccess}
            onPress={handleSaveBuilding}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.navBtnSuccessText}>
                {editBuildingId ? '💾 Save Building Updates' : 'Complete Building Survey ✓'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  draftBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  draftBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  stepBarBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
  },
  stepBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  subBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  radioItemActive: {},
  radioDot: {
    fontSize: 16,
    color: colors.primary,
  },
  radioLabel: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  photoItem: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  photoIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  removeText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '700',
  },
  addBtn: {
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  floorCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
  },
  floorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  floorTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  floorTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: 'rgba(198, 93, 58, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
    gap: 8,
  },
  unitNumberBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unitTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  unitSub: {
    fontSize: 10,
    color: '#64748B',
  },
  removeFloorBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  removeFloorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  removeUnitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FEE2E2',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignSelf: 'center',
  },
  removeUnitText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  unitNameInput: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 2,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    marginBottom: 2,
  },
  emptyUnitsNotice: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  emptyUnitsText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  addUnitBtn: {
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  addUnitText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  addFloorBtn: {
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  addFloorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  navBtnSecondary: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  navBtnPrimary: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navBtnSuccess: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnSuccessText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

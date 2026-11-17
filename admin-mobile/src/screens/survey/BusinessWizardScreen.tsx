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
import { BuildingItem, ProductServiceItem, FootfallItem } from '../../types/survey';

const BUSINESS_MODELS = [
  'Retail',
  'Wholesale',
  'Service provider',
  'Retail + Wholesale',
  'Manufacturing',
  'Online + Offline',
  'Other',
];

const BUSINESS_STATUSES = [
  'Operating',
  'Temporarily closed',
  'Permanently closed',
  'Vacant',
  'Under setup',
  'Unknown',
];

const PRICE_POSITIONINGS = [
  'Budget',
  'Economical',
  'Mid-range',
  'Premium',
  'Unknown',
];

const PAYMENT_OPTIONS = ['Cash', 'UPI', 'Debit/Credit Card', 'Bank Transfer', 'Credit'];

const CUSTOMER_OPTIONS = [
  'Local Residents',
  'Farmers',
  'Students',
  'Contractors',
  'Businesses',
  'Government Departments',
  'Visitors',
  'Rural Customers',
];

const CHALLENGES_OPTIONS = [
  'Competition',
  'Customer acquisition',
  'Stock availability',
  'Supplier issues',
  'Rent',
  'Transportation',
  'Seasonal demand',
  'Employee availability',
  'Lack of online presence',
  'Pricing pressure',
  'Access to capital',
];

const ROAD_TYPES = ['Main Road', 'Side Road', 'Market Street', 'Residential Street'];

export const BusinessWizardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const buildingId = route.params?.buildingId;
  const unitId = route.params?.unitId;
  const editBusinessId = route.params?.editBusinessId || route.params?.businessId;

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loadingBusiness, setLoadingBusiness] = useState<boolean>(false);
  const [building, setBuilding] = useState<BuildingItem | null>(null);

  // 1. Identity
  const [name, setName] = useState<string>('');
  const [kannadaName, setKannadaName] = useState<string>('');
  const [shopNumber, setShopNumber] = useState<string>(route.params?.unitNumber || 'Shop 001');
  const [floorName, setFloorName] = useState<string>(route.params?.floorName || 'Ground Floor');
  const [yearEstablished, setYearEstablished] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownershipType, setOwnershipType] = useState<string>('Independent');
  const [businessModel, setBusinessModel] = useState<string>('Retail');
  const [businessStatus, setBusinessStatus] = useState<string>('Operating');

  // 2. Category
  const [categoryName, setCategoryName] = useState<string>('Retail & Commercial');
  const [subcategory, setSubcategory] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['Retail', 'Pavagada Market']);

  // 3. Products & Services
  const [productSummary, setProductSummary] = useState<string>('');
  const [sellsBranded, setSellsBranded] = useState<boolean>(false);
  const [manufacturesProducts, setManufacturesProducts] = useState<boolean>(false);
  const [offersHomeDelivery, setOffersHomeDelivery] = useState<boolean>(false);
  const [offersWholesale, setOffersWholesale] = useState<boolean>(false);
  const [offersCredit, setOffersCredit] = useState<boolean>(true);
  const [productsList, setProductsList] = useState<ProductServiceItem[]>([
    { itemType: 'PRODUCT', name: 'Primary Goods', isPopular: true, priceRange: 'Standard' },
  ]);

  // 4. Pricing & Payments
  const [pricePositioning, setPricePositioning] = useState<string>('Economical');
  const [lowestPrice, setLowestPrice] = useState<string>('');
  const [highestPrice, setHighestPrice] = useState<string>('');
  const [selectedPayments, setSelectedPayments] = useState<string[]>(['Cash', 'UPI']);

  // 5. Customers & Demand
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>(['Local Residents', 'Farmers']);
  const [servesVillages, setServesVillages] = useState<boolean>(true);
  const [whyCustomersChoose, setWhyCustomersChoose] = useState<string>('Quality products, trusted local service');

  // 6. Operations
  const [openTime, setOpenTime] = useState<string>('09:00');
  const [closeTime, setCloseTime] = useState<string>('21:00');
  const [weeklyHoliday, setWeeklyHoliday] = useState<string>('None');
  const [peakHours, setPeakHours] = useState<string>('Evening (5 PM - 8 PM)');
  const [employeeRange, setEmployeeRange] = useState<string>('1-2');
  const [ownerOperated, setOwnerOperated] = useState<boolean>(true);
  const [whatsappOrdering, setWhatsappOrdering] = useState<boolean>(false);

  // 7. Contact & Digital
  const [publicPhone, setPublicPhone] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState<string>('');
  const [isContactPublic, setIsContactPublic] = useState<boolean>(true);

  // 8. Performance
  const [dailyCustomersRange, setDailyCustomersRange] = useState<string>('25-50');
  const [growthTrend, setGrowthTrend] = useState<string>('Stable');
  const [seasonalDemand, setSeasonalDemand] = useState<boolean>(false);

  // 9. Challenges
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['Competition']);
  const [biggestChallenge, setBiggestChallenge] = useState<string>('');

  // 10. Replication Research (Analyst)
  const [initialInvestment, setInitialInvestment] = useState<string>('₹2L - ₹5L');
  const [requiredSpace, setRequiredSpace] = useState<string>('200 - 400 sq ft');
  const [supplierCategories, setSupplierCategories] = useState<string>('Bengaluru & Hindupur wholesalers');
  const [expansionOpportunities, setExpansionOpportunities] = useState<string>('');

  // 11. Optional Financial Research (Restricted)
  const [financialConsent, setFinancialConsent] = useState<boolean>(false);
  const [monthlyRevenueRange, setMonthlyRevenueRange] = useState<string>('Prefer not to disclose');
  const [monthlyRentRange, setMonthlyRentRange] = useState<string>('₹5,000 - ₹10,000');
  const [estimatedGrossMargin, setEstimatedGrossMargin] = useState<string>('15-25%');
  const [profitabilityAssessment, setProfitabilityAssessment] = useState<string>('Profitable');

  // 12. Location & Footfall
  const [roadType, setRoadType] = useState<string>('Main Road');
  const [pedestrianActivity, setPedestrianActivity] = useState<string>('Medium');
  const [competitorCount, setCompetitorCount] = useState<string>('2');
  const [footfallObservations, setFootfallObservations] = useState<FootfallItem[]>([
    { timeOfDay: 'Morning', activityLevel: 'Medium' },
    { timeOfDay: 'Afternoon', activityLevel: 'Low' },
    { timeOfDay: 'Evening', activityLevel: 'High' },
  ]);

  useEffect(() => {
    if (buildingId) {
      loadBuildingInfo(buildingId);
    }
  }, [buildingId]);

  useEffect(() => {
    if (editBusinessId) {
      loadBusinessDetails(editBusinessId);
    }
  }, [editBusinessId]);

  const loadBuildingInfo = async (bId: string) => {
    try {
      const b = await surveyApi.getBuildingById(bId);
      setBuilding(b);
    } catch {
      // ignore
    }
  };

  const loadBusinessDetails = async (id: string) => {
    try {
      setLoadingBusiness(true);
      const biz = await surveyApi.getBusinessById(id);
      if (biz) {
        if (biz.buildingId && !building) {
          loadBuildingInfo(biz.buildingId);
        }
        setName(biz.name || '');
        setKannadaName(biz.kannadaName || '');
        if (biz.shopOrUnitNumber) setShopNumber(biz.shopOrUnitNumber);
        if (biz.floorName) setFloorName(biz.floorName);
        if (biz.yearEstablished) setYearEstablished(String(biz.yearEstablished));
        if (biz.ownerName) setOwnerName(biz.ownerName);
        if (biz.ownershipType) setOwnershipType(biz.ownershipType);
        if (biz.businessModel) setBusinessModel(biz.businessModel);
        if (biz.businessStatus) setBusinessStatus(biz.businessStatus);
        if (biz.subcategory) setSubcategory(biz.subcategory);
        if (biz.tags && biz.tags.length > 0) setTags(biz.tags);
        if (biz.productSummary) setProductSummary(biz.productSummary);
        if (biz.sellsBranded !== undefined) setSellsBranded(biz.sellsBranded);
        if (biz.manufacturesProducts !== undefined) setManufacturesProducts(biz.manufacturesProducts);
        if (biz.offersHomeDelivery !== undefined) setOffersHomeDelivery(biz.offersHomeDelivery);
        if (biz.offersWholesale !== undefined) setOffersWholesale(biz.offersWholesale);
        if (biz.offersCreditToRegular !== undefined) setOffersCredit(biz.offersCreditToRegular);
        if (biz.pricePositioning) setPricePositioning(biz.pricePositioning);
        if (biz.lowestPrice) setLowestPrice(String(biz.lowestPrice));
        if (biz.highestPrice) setHighestPrice(String(biz.highestPrice));
        if (biz.paymentMethods && biz.paymentMethods.length > 0) setSelectedPayments(biz.paymentMethods);
        if (biz.customerTypes && biz.customerTypes.length > 0) setSelectedCustomers(biz.customerTypes);
        if (biz.servesNearbyVillages !== undefined) setServesVillages(biz.servesNearbyVillages);
        if (biz.whyCustomersChoose) setWhyCustomersChoose(biz.whyCustomersChoose);
        if (biz.openTime) setOpenTime(biz.openTime);
        if (biz.closeTime) setCloseTime(biz.closeTime);
        if (biz.weeklyHoliday) setWeeklyHoliday(biz.weeklyHoliday);
        if (biz.peakHours) setPeakHours(biz.peakHours);
        if (biz.employeeCountRange) setEmployeeRange(biz.employeeCountRange);
        if (biz.ownerOperated !== undefined) setOwnerOperated(biz.ownerOperated);
        if (biz.whatsappOrdering !== undefined) setWhatsappOrdering(biz.whatsappOrdering);
        if (biz.publicPhone) setPublicPhone(biz.publicPhone);
        if (biz.whatsappNumber) setWhatsappNumber(biz.whatsappNumber);
        if (biz.googleBusinessUrl) setGoogleBusinessUrl(biz.googleBusinessUrl);
        if (biz.isContactPublic !== undefined) setIsContactPublic(biz.isContactPublic);
        if (biz.approxDailyCustomersRange) setDailyCustomersRange(biz.approxDailyCustomersRange);
        if (biz.growthTrend) setGrowthTrend(biz.growthTrend);
        if (biz.seasonalDemand !== undefined) setSeasonalDemand(biz.seasonalDemand);
        if (biz.challenges && biz.challenges.length > 0) setSelectedChallenges(biz.challenges);
        if (biz.biggestChallenge) setBiggestChallenge(biz.biggestChallenge);
        if (biz.approxInitialInvestment) setInitialInvestment(biz.approxInitialInvestment);
        if (biz.requiredSpace) setRequiredSpace(biz.requiredSpace);
        if (biz.mainSupplierCategories) setSupplierCategories(biz.mainSupplierCategories);
        if (biz.expansionOpportunities) setExpansionOpportunities(biz.expansionOpportunities);
        if (biz.financialConsentGranted !== undefined) setFinancialConsent(biz.financialConsentGranted);
        if (biz.monthlyRevenueRange) setMonthlyRevenueRange(biz.monthlyRevenueRange);
        if (biz.monthlyRentRange) setMonthlyRentRange(biz.monthlyRentRange);
        if (biz.estimatedGrossMargin) setEstimatedGrossMargin(biz.estimatedGrossMargin);
        if (biz.profitabilityAssessment) setProfitabilityAssessment(biz.profitabilityAssessment);
        if (biz.roadType) setRoadType(biz.roadType);
        if (biz.pedestrianActivity) setPedestrianActivity(biz.pedestrianActivity);
        if (biz.competitorCountNearby !== undefined) setCompetitorCount(String(biz.competitorCountNearby));
        if (biz.products && biz.products.length > 0) setProductsList(biz.products);
        if (biz.footfallObservations && biz.footfallObservations.length > 0) setFootfallObservations(biz.footfallObservations);
      }
    } catch (e: any) {
      Alert.alert('Notice', 'Could not load business details: ' + (e.message || 'Error'));
    } finally {
      setLoadingBusiness(false);
    }
  };

  const autoSaveDraft = async () => {
    const draftPayload = {
      buildingId: buildingId || 'pending_bld',
      unitId,
      name,
      kannadaName,
      shopOrUnitNumber: shopNumber,
      floorName,
      yearEstablished: parseInt(yearEstablished, 10) || undefined,
      ownerName,
      ownershipType,
      businessModel,
      businessStatus,
      subcategory,
      tags,
      productSummary,
      sellsBranded,
      manufacturesProducts,
      offersHomeDelivery,
      offersWholesale,
      offersCreditToRegular: offersCredit,
      pricePositioning,
      lowestPrice: parseFloat(lowestPrice) || undefined,
      highestPrice: parseFloat(highestPrice) || undefined,
      paymentMethods: selectedPayments,
      customerTypes: selectedCustomers,
      servesNearbyVillages: servesVillages,
      whyCustomersChoose,
      openTime,
      closeTime,
      weeklyHoliday,
      peakHours,
      employeeCountRange: employeeRange,
      ownerOperated,
      whatsappOrdering,
      publicPhone,
      whatsappNumber,
      googleBusinessUrl,
      isContactPublic,
      approxDailyCustomersRange: dailyCustomersRange,
      growthTrend,
      seasonalDemand,
      challenges: selectedChallenges,
      biggestChallenge,
      approxInitialInvestment: initialInvestment,
      requiredSpace,
      mainSupplierCategories: supplierCategories,
      expansionOpportunities,
      financialConsentGranted: financialConsent,
      monthlyRevenueRange: financialConsent ? monthlyRevenueRange : undefined,
      monthlyRentRange: financialConsent ? monthlyRentRange : undefined,
      estimatedGrossMargin: financialConsent ? estimatedGrossMargin : undefined,
      profitabilityAssessment: financialConsent ? profitabilityAssessment : undefined,
      roadType,
      pedestrianActivity,
      competitorCountNearby: parseInt(competitorCount, 10) || 0,
      products: productsList,
      footfallObservations,
    };

    await surveyOffline.saveDraft({
      id: editBusinessId || `draft_biz_${Date.now()}`,
      type: 'BUSINESS',
      title: name || 'Business Survey Draft',
      subtitle: `${building?.name || 'Building'} • ${businessModel}`,
      step,
      totalSteps: 12,
      data: draftPayload,
      updatedAt: new Date().toISOString(),
      synced: false,
    });
  };

  const nextStep = () => {
    if (step === 1 && !name.trim()) {
      Alert.alert('Required', 'Please enter the Business or Shop Name.');
      return;
    }
    autoSaveDraft();
    setStep((prev) => Math.min(12, prev + 1));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const togglePayment = (method: string) => {
    setSelectedPayments((prev) =>
      prev.includes(method) ? prev.filter((p) => p !== method) : [...prev, method]
    );
  };

  const toggleCustomer = (cust: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(cust) ? prev.filter((c) => c !== cust) : [...prev, cust]
    );
  };

  const toggleChallenge = (ch: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleAddProduct = (itemType: 'PRODUCT' | 'SERVICE') => {
    setProductsList((prev) => [
      ...prev,
      {
        itemType,
        name: `New ${itemType === 'PRODUCT' ? 'Product' : 'Service'}`,
        priceRange: '',
        isPopular: false,
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please provide a valid business name.');
      return;
    }
    setSubmitting(true);

    const payload = {
      buildingId: buildingId || (building?.id),
      unitId,
      name: name.trim(),
      kannadaName: kannadaName.trim() || undefined,
      shopOrUnitNumber: shopNumber,
      floorName,
      yearEstablished: parseInt(yearEstablished, 10) || undefined,
      ownerName: ownerName.trim() || undefined,
      ownershipType,
      businessModel,
      businessStatus,
      subcategory: subcategory.trim() || undefined,
      tags,
      productSummary,
      sellsBranded,
      manufacturesProducts,
      offersHomeDelivery,
      offersWholesale,
      offersCreditToRegular: offersCredit,
      pricePositioning,
      lowestPrice: parseFloat(lowestPrice) || undefined,
      highestPrice: parseFloat(highestPrice) || undefined,
      paymentMethods: selectedPayments,
      customerTypes: selectedCustomers,
      servesNearbyVillages: servesVillages,
      whyCustomersChoose,
      openTime,
      closeTime,
      weeklyHoliday,
      peakHours,
      employeeCountRange: employeeRange,
      ownerOperated,
      whatsappOrdering,
      publicPhone,
      whatsappNumber,
      googleBusinessUrl,
      isContactPublic,
      approxDailyCustomersRange: dailyCustomersRange,
      growthTrend,
      seasonalDemand,
      challenges: selectedChallenges,
      biggestChallenge,
      approxInitialInvestment: initialInvestment,
      requiredSpace,
      mainSupplierCategories: supplierCategories,
      expansionOpportunities,
      financialConsentGranted: financialConsent,
      monthlyRevenueRange: financialConsent ? monthlyRevenueRange : undefined,
      monthlyRentRange: financialConsent ? monthlyRentRange : undefined,
      estimatedGrossMargin: financialConsent ? estimatedGrossMargin : undefined,
      profitabilityAssessment: financialConsent ? profitabilityAssessment : undefined,
      roadType,
      pedestrianActivity,
      competitorCountNearby: parseInt(competitorCount, 10) || 0,
      products: productsList,
      footfallObservations,
    };

    try {
      let saved: any;
      if (editBusinessId) {
        saved = await surveyApi.updateBusiness(editBusinessId, payload);
      } else {
        saved = await surveyApi.createBusiness(payload);
      }
      setSubmitting(false);

      if (editBusinessId) {
        Alert.alert(
          'Business Updated! 🛍️',
          `Changes for "${saved.name}" have been saved successfully!`,
          [
            {
              text: 'View Building',
              onPress: () => {
                const targetBldId = buildingId || saved.buildingId;
                if (targetBldId) {
                  navigation.replace('BuildingDetail', { buildingId: targetBldId });
                } else {
                  navigation.goBack();
                }
              },
            },
            {
              text: 'Back to Map',
              onPress: () => navigation.navigate('BuildingMap'),
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(
          'Business Registered! 🛍️',
          `Survey for "${saved.name}" completed successfully! +75 Surveyor Points Awarded!`,
          [
            {
              text: '+ Add Another Shop in this Building',
              onPress: () => {
                // Reset key fields for next shop
                setName('');
                setKannadaName('');
                setShopNumber(`Shop 00${Math.floor(Math.random() * 80) + 10}`);
                setStep(1);
              },
            },
            {
              text: 'View Building',
              onPress: () => {
                if (buildingId) {
                  navigation.replace('BuildingDetail', { buildingId });
                } else {
                  navigation.goBack();
                }
              },
            },
            {
              text: 'Back to Map',
              onPress: () => navigation.navigate('BuildingMap'),
              style: 'cancel',
            },
          ]
        );
      }
    } catch (err: any) {
      setSubmitting(false);
      await autoSaveDraft();
      Alert.alert(
        'Saved as Offline Draft',
        `Network unreachable (${err.message}). Business survey saved locally as draft and will sync automatically.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Wizard Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Exit</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            {editBusinessId ? (name ? `Edit: ${name}` : 'Edit Business') : 'Shop & Business Survey'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Step {step} of 12: {
              step === 1 ? 'Identity' :
              step === 2 ? 'Category' :
              step === 3 ? 'Products & Services' :
              step === 4 ? 'Pricing' :
              step === 5 ? 'Customers' :
              step === 6 ? 'Operations' :
              step === 7 ? 'Contact & Digital' :
              step === 8 ? 'Performance' :
              step === 9 ? 'Challenges' :
              step === 10 ? 'Replication Research' :
              step === 11 ? 'Financial Research' : 'Location & Footfall'
            }
          </Text>
        </View>
        <TouchableOpacity onPress={autoSaveDraft} style={styles.draftBtn}>
          <Text style={styles.draftBtnText}>💾 Draft</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.stepBarBg}>
        <View style={[styles.stepBarFill, { width: `${(step / 12) * 100}%` }]} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Parent Building Summary Banner */}
        {building && (
          <View style={styles.buildingBanner}>
            <Text style={styles.buildingBannerTag}>PARENT BUILDING</Text>
            <Text style={styles.buildingBannerName}>{building.name} ({building.code})</Text>
            <Text style={styles.buildingBannerLoc}>📍 {building.address}</Text>
          </View>
        )}

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Business Identity</Text>
            <Text style={styles.sectionDesc}>Basic commercial identity and unit details.</Text>

            <Text style={styles.fieldLabel}>Shop / Business Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Shri Manjunatha Traders, Pavagada Bakery"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.fieldLabel}>Kannada Name (ಕನ್ನಡ ಹೆಸರು)</Text>
            <TextInput
              style={styles.input}
              placeholder="ಉದಾ: ಶ್ರೀ ಮಂಜುನಾಥ ಟ್ರೇಡರ್ಸ್"
              value={kannadaName}
              onChangeText={setKannadaName}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Shop / Unit No.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Shop 001"
                  value={shopNumber}
                  onChangeText={setShopNumber}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Floor</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ground Floor"
                  value={floorName}
                  onChangeText={setFloorName}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Owner / Authorized Representative</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. K. R. Manjunath"
              value={ownerName}
              onChangeText={setOwnerName}
            />

            <Text style={styles.fieldLabel}>Business Model</Text>
            <View style={styles.chipsWrap}>
              {BUSINESS_MODELS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, businessModel === m && styles.chipActive]}
                  onPress={() => setBusinessModel(m)}
                >
                  <Text style={[styles.chipText, businessModel === m && styles.chipTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Operating Status</Text>
            <View style={styles.chipsWrap}>
              {BUSINESS_STATUSES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, businessStatus === s && styles.chipActive]}
                  onPress={() => setBusinessStatus(s)}
                >
                  <Text style={[styles.chipText, businessStatus === s && styles.chipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 2: CATEGORY */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Business Taxonomy</Text>
            <Text style={styles.sectionDesc}>Assign commercial classification and tags.</Text>

            <Text style={styles.fieldLabel}>Subcategory / Trade Type</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Grocery, Cloth Merchant, Mobile Service, Agro Feeds"
              value={subcategory}
              onChangeText={setSubcategory}
            />

            <Text style={styles.fieldLabel}>Keywords / Tags</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Wholesale, Seeds, Fertilizers, Retail"
              value={tags.join(', ')}
              onChangeText={(text) =>
                setTags(text.split(',').map((t) => t.trim()).filter(Boolean))
              }
            />
          </View>
        )}

        {/* STEP 3: PRODUCTS & SERVICES */}
        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Products and Services</Text>
            <Text style={styles.sectionDesc}>List key items sold or services provided.</Text>

            <Text style={styles.fieldLabel}>Overview Summary</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Sells organic groundnut seeds, agro pesticides, and animal feeds"
              value={productSummary}
              onChangeText={setProductSummary}
              multiline
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Offers Home Delivery</Text>
              <Switch value={offersHomeDelivery} onValueChange={setOffersHomeDelivery} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Provides Wholesale Supply</Text>
              <Switch value={offersWholesale} onValueChange={setOffersWholesale} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Provides Credit to Regular Customers</Text>
              <Switch value={offersCredit} onValueChange={setOffersCredit} />
            </View>

            <Text style={styles.subHeading}>Cataloged Products / Services:</Text>
            {productsList.map((item, idx) => (
              <View key={idx} style={styles.productCard}>
                <View style={styles.row}>
                  <Text style={styles.prodIdx}>Item #{idx + 1} ({item.itemType})</Text>
                  {productsList.length > 1 && (
                    <TouchableOpacity
                      onPress={() => setProductsList(productsList.filter((_, i) => i !== idx))}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Item Name (e.g. Groundnut Oil, Tyre Repair)"
                  value={item.name}
                  onChangeText={(val) => {
                    const updated = [...productsList];
                    updated[idx].name = val;
                    setProductsList(updated);
                  }}
                />

                <TextInput
                  style={[styles.input, { marginTop: 6 }]}
                  placeholder="Price Range (e.g. ₹50 - ₹120 / Kg)"
                  value={item.priceRange}
                  onChangeText={(val) => {
                    const updated = [...productsList];
                    updated[idx].priceRange = val;
                    setProductsList(updated);
                  }}
                />
              </View>
            ))}

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.addBtn, { flex: 1 }]}
                onPress={() => handleAddProduct('PRODUCT')}
              >
                <Text style={styles.addBtnText}>+ Add Product</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addBtn, { flex: 1 }]}
                onPress={() => handleAddProduct('SERVICE')}
              >
                <Text style={styles.addBtnText}>+ Add Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 4: PRICING */}
        {step === 4 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Pricing & Payments</Text>

            <Text style={styles.fieldLabel}>Market Price Positioning</Text>
            <View style={styles.chipsWrap}>
              {PRICE_POSITIONINGS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, pricePositioning === p && styles.chipActive]}
                  onPress={() => setPricePositioning(p)}
                >
                  <Text style={[styles.chipText, pricePositioning === p && styles.chipTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Accepted Payment Methods</Text>
            <View style={styles.chipsWrap}>
              {PAYMENT_OPTIONS.map((pay) => (
                <TouchableOpacity
                  key={pay}
                  style={[styles.chip, selectedPayments.includes(pay) && styles.chipActive]}
                  onPress={() => togglePayment(pay)}
                >
                  <Text style={[styles.chipText, selectedPayments.includes(pay) && styles.chipTextActive]}>
                    {selectedPayments.includes(pay) ? '✓ ' : ''}{pay}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 5: CUSTOMERS & DEMAND */}
        {step === 5 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Target Customers & Demand</Text>

            <Text style={styles.fieldLabel}>Primary Customer Groups</Text>
            <View style={styles.chipsWrap}>
              {CUSTOMER_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, selectedCustomers.includes(c) && styles.chipActive]}
                  onPress={() => toggleCustomer(c)}
                >
                  <Text style={[styles.chipText, selectedCustomers.includes(c) && styles.chipTextActive]}>
                    {selectedCustomers.includes(c) ? '✓ ' : ''}{c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Serves Surrounding Taluk Villages</Text>
              <Switch value={servesVillages} onValueChange={setServesVillages} />
            </View>

            <Text style={styles.fieldLabel}>Why Customers Prefer This Business</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Fast service, wholesale discounts, trusted since 1995"
              value={whyCustomersChoose}
              onChangeText={setWhyCustomersChoose}
              multiline
            />
          </View>
        )}

        {/* STEP 6: OPERATIONS */}
        {step === 6 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Operating Schedule & Staff</Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Opening Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09:00"
                  value={openTime}
                  onChangeText={setOpenTime}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Closing Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="21:00"
                  value={closeTime}
                  onChangeText={setCloseTime}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Weekly Holiday</Text>
                <TextInput
                  style={styles.input}
                  placeholder="None / Sunday"
                  value={weeklyHoliday}
                  onChangeText={setWeeklyHoliday}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Employees Count</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1-2 / 3-5"
                  value={employeeRange}
                  onChangeText={setEmployeeRange}
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Owner-Operated (Self)</Text>
              <Switch value={ownerOperated} onValueChange={setOwnerOperated} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>WhatsApp Ordering Available</Text>
              <Switch value={whatsappOrdering} onValueChange={setWhatsappOrdering} />
            </View>
          </View>
        )}

        {/* STEP 7: CONTACT & DIGITAL PRESENCE */}
        {step === 7 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Contact Information</Text>

            <Text style={styles.fieldLabel}>Public Contact Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9845012345"
              keyboardType="phone-pad"
              value={publicPhone}
              onChangeText={setPublicPhone}
            />

            <Text style={styles.fieldLabel}>WhatsApp Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9845012345"
              keyboardType="phone-pad"
              value={whatsappNumber}
              onChangeText={setWhatsappNumber}
            />

            <Text style={styles.fieldLabel}>Google Maps / Business Profile Link</Text>
            <TextInput
              style={styles.input}
              placeholder="https://maps.google.com/..."
              value={googleBusinessUrl}
              onChangeText={setGoogleBusinessUrl}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Public Consent for Directory Listing</Text>
              <Switch value={isContactPublic} onValueChange={setIsContactPublic} />
            </View>
          </View>
        )}

        {/* STEP 8: PERFORMANCE & TRENDS */}
        {step === 8 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Business Performance & Footfall</Text>

            <Text style={styles.fieldLabel}>Approx. Daily Footfall / Customers</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 20-50, 50-100, 100-200"
              value={dailyCustomersRange}
              onChangeText={setDailyCustomersRange}
            />

            <Text style={styles.fieldLabel}>Growth Trajectory</Text>
            <View style={styles.chipsWrap}>
              {['Growing', 'Stable', 'Declining'].map((trend) => (
                <TouchableOpacity
                  key={trend}
                  style={[styles.chip, growthTrend === trend && styles.chipActive]}
                  onPress={() => setGrowthTrend(trend)}
                >
                  <Text style={[styles.chipText, growthTrend === trend && styles.chipTextActive]}>
                    {trend}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 9: CHALLENGES */}
        {step === 9 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Key Business Challenges</Text>

            <View style={styles.chipsWrap}>
              {CHALLENGES_OPTIONS.map((ch) => (
                <TouchableOpacity
                  key={ch}
                  style={[styles.chip, selectedChallenges.includes(ch) && styles.chipActive]}
                  onPress={() => toggleChallenge(ch)}
                >
                  <Text style={[styles.chipText, selectedChallenges.includes(ch) && styles.chipTextActive]}>
                    {selectedChallenges.includes(ch) ? '✕ ' : ''}{ch}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Biggest Challenge Note</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. High shop rent and seasonal summer decline"
              value={biggestChallenge}
              onChangeText={setBiggestChallenge}
              multiline
            />
          </View>
        )}

        {/* STEP 10: REPLICATION RESEARCH */}
        {step === 10 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Market Replication Research (Analyst)</Text>
            <Text style={styles.sectionDesc}>Information for prospective local entrepreneurs.</Text>

            <Text style={styles.fieldLabel}>Approx. Setup / Initial Investment</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ₹2 Lakhs - ₹5 Lakhs"
              value={initialInvestment}
              onChangeText={setInitialInvestment}
            />

            <Text style={styles.fieldLabel}>Required Shop Area</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 250 - 400 sq. ft"
              value={requiredSpace}
              onChangeText={setRequiredSpace}
            />

            <Text style={styles.fieldLabel}>Main Supplier / Wholesaler Sourcing</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bengaluru Yeshwantpur, Hindupur market"
              value={supplierCategories}
              onChangeText={setSupplierCategories}
            />
          </View>
        )}

        {/* STEP 11: FINANCIAL RESEARCH (VOLUNTARY / RESTRICTED) */}
        {step === 11 && (
          <View style={styles.card}>
            <View style={styles.restrictedHeader}>
              <Text style={styles.restrictedBadge}>RESTRICTED RESEARCH SECTION</Text>
            </View>
            <Text style={styles.sectionHeading}>Voluntary Economic Research</Text>
            <Text style={styles.sectionDesc}>
              This section is optional, strictly confidential, and NEVER published publicly on the website.
            </Text>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { flex: 1, marginRight: 10 }]}>
                Explicit Consent Given for Research Data Collection
              </Text>
              <Switch value={financialConsent} onValueChange={setFinancialConsent} />
            </View>

            {financialConsent ? (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.fieldLabel}>Approx. Monthly Revenue Range</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ₹1L - ₹2.5L / Prefer not to disclose"
                  value={monthlyRevenueRange}
                  onChangeText={setMonthlyRevenueRange}
                />

                <Text style={styles.fieldLabel}>Approx. Monthly Rent Range</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ₹6,000 - ₹10,000"
                  value={monthlyRentRange}
                  onChangeText={setMonthlyRentRange}
                />

                <Text style={styles.fieldLabel}>Estimated Gross Margin %</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 15-20%"
                  value={estimatedGrossMargin}
                  onChangeText={setEstimatedGrossMargin}
                />
              </View>
            ) : (
              <View style={styles.consentNotice}>
                <Text style={styles.consentNoticeText}>
                  Consent not granted. Financial fields will be safely skipped.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 12: LOCATION & FOOTFALL OBSERVATION */}
        {step === 12 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Commercial Footfall & Road Context</Text>

            <Text style={styles.fieldLabel}>Road / Street Type</Text>
            <View style={styles.chipsWrap}>
              {ROAD_TYPES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, roadType === r && styles.chipActive]}
                  onPress={() => setRoadType(r)}
                >
                  <Text style={[styles.chipText, roadType === r && styles.chipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Nearby Direct Competitors Count</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2"
              keyboardType="numeric"
              value={competitorCount}
              onChangeText={setCompetitorCount}
            />

            <Text style={styles.subHeading}>Observed Footfall Density:</Text>
            <View style={styles.footfallTable}>
              {footfallObservations.map((f, i) => (
                <View key={i} style={styles.footfallRow}>
                  <Text style={styles.footfallTime}>{f.timeOfDay}</Text>
                  <View style={styles.footfallLevels}>
                    {(['Low', 'Medium', 'High'] as const).map((lvl) => (
                      <TouchableOpacity
                        key={lvl}
                        style={[styles.lvlBtn, f.activityLevel === lvl && styles.lvlBtnActive]}
                        onPress={() => {
                          const updated = [...footfallObservations];
                          updated[i].activityLevel = lvl;
                          setFootfallObservations(updated);
                        }}
                      >
                        <Text style={[styles.lvlBtnText, f.activityLevel === lvl && styles.lvlBtnTextActive]}>
                          {lvl}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation Bottom Bar */}
      <View style={styles.bottomBar}>
        {step > 1 && (
          <TouchableOpacity style={styles.navBtnSecondary} onPress={prevStep}>
            <Text style={styles.navBtnSecondaryText}>Back</Text>
          </TouchableOpacity>
        )}

        {step < 12 ? (
          <TouchableOpacity style={styles.navBtnPrimary} onPress={nextStep}>
            <Text style={styles.navBtnPrimaryText}>Continue →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navBtnSuccess}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.navBtnSuccessText}>
                {editBusinessId ? '💾 Save Business Updates' : 'Complete Shop Survey ✓'}
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
  buildingBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  buildingBannerTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1,
  },
  buildingBannerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  buildingBannerLoc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  subHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 14,
    marginBottom: 8,
  },
  productCard: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  prodIdx: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
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
  restrictedHeader: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  restrictedBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  consentNotice: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  consentNoticeText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  footfallTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  footfallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  footfallTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  footfallLevels: {
    flexDirection: 'row',
    gap: 6,
  },
  lvlBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
  },
  lvlBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  lvlBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  lvlBtnTextActive: {
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


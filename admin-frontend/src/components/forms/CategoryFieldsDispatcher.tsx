import React from 'react';
import { MAIN_CATEGORIES_TAXONOMY, MainCategoryMeta, SubcategoryMeta } from '../../data/categoryTaxonomy';
import { HospitalCategoryForm } from './category/HospitalCategoryForm';
import { ClinicDoctorCategoryForm } from './category/ClinicDoctorCategoryForm';
import { PharmacyCategoryForm } from './category/PharmacyCategoryForm';
import { FirePoliceCategoryForm } from './category/FirePoliceCategoryForm';
import { EducationCategoryForm } from './category/EducationCategoryForm';
import { CinemaTheatreCategoryForm } from './category/CinemaTheatreCategoryForm';
import { BankAtmCategoryForm } from './category/BankAtmCategoryForm';
import { HotelRestaurantCategoryForm } from './category/HotelRestaurantCategoryForm';
import { AgricultureCategoryForm } from './category/AgricultureCategoryForm';
import { DailyTradesCategoryForm } from './category/DailyTradesCategoryForm';
import { BusStopCategoryForm } from './category/BusStopCategoryForm';
import { ServiceList } from '../common/ServiceList';

interface CategoryFieldsDispatcherProps {
  categoryId: string;
  subcategory: string;
  categoryData: Record<string, any>;
  onChange: (categoryData: Record<string, any>) => void;
}

export const CategoryFieldsDispatcher: React.FC<CategoryFieldsDispatcherProps> = ({
  categoryId,
  subcategory,
  categoryData = {},
  onChange,
}) => {
  const mainCat = MAIN_CATEGORIES_TAXONOMY.find((c) => c.id === categoryId);
  const subList = (subcategory || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const primarySub = subList[0] || subcategory;
  const subMeta = mainCat?.subcategories.find(
    (s) => subList.includes(s.id) || s.id === primarySub || subList.includes(s.name) || s.name === primarySub
  );

  const formType = subMeta?.formType;
  const hasSub = (name: string) =>
    subList.some((s) => s.toLowerCase() === name.toLowerCase());
  const hasAnySub = (names: string[]) => names.some((n) => hasSub(n));

  // Render appropriate form based on subcategory formType or categoryId
  if (
    formType === 'hospital' ||
    hasAnySub(['Emergency Hospital', 'Hospital', 'Ambulance Service', 'Blood Bank / Blood Storage'])
  ) {
    return <HospitalCategoryForm data={categoryData} onChange={onChange} />;
  }

  if (
    formType === 'clinic_doctor' ||
    hasAnySub([
      'Clinic',
      'Doctor',
      'Diagnostic Laboratory',
      'Dental Clinic',
      'Eye Clinic',
      'ENT Clinic',
      'Veterinary Hospital',
      'Veterinary Clinic',
    ])
  ) {
    return <ClinicDoctorCategoryForm data={categoryData} onChange={onChange} />;
  }

  if (formType === 'pharmacy' || hasAnySub(['Pharmacy', 'Jan Aushadhi Kendra'])) {
    return <PharmacyCategoryForm data={categoryData} onChange={onChange} />;
  }

  if (formType === 'fire_station' || hasAnySub(['Fire Station', 'Disaster / Rescue Service'])) {
    return <FirePoliceCategoryForm type="fire_station" data={categoryData} onChange={onChange} />;
  }

  if (formType === 'police_station' || hasSub('Police Station')) {
    return <FirePoliceCategoryForm type="police_station" data={categoryData} onChange={onChange} />;
  }

  if (
    formType === 'government_services' ||
    categoryId === 'CIVIC_GOVERNANCE' ||
    subList.some(
      (s) =>
        s.includes('Municipality') ||
        s.includes('Taluk Office') ||
        s.includes('Government Office') ||
        s.includes('Grama One') ||
        s.includes('Karnataka One') ||
        s.includes('CSC') ||
        s.includes('Sub-Registrar') ||
        s.includes('Post Office') ||
        s.includes('Electricity') ||
        s.includes('Agricultural Office')
    )
  ) {
    const services = Array.isArray(categoryData.servicesOffered)
      ? categoryData.servicesOffered
      : [];

    return (
      <ServiceList
        services={services}
        onChange={(updatedServices) =>
          onChange({ ...categoryData, servicesOffered: updatedServices })
        }
        title="Official Government & Citizen Procedures"
        description="Add all official public services, certificates, application counters, and online links offered at this office."
      />
    );
  }

  if (formType === 'school' || hasAnySub(['Primary School', 'High School'])) {
    return <EducationCategoryForm isSchool={true} data={categoryData} onChange={onChange} />;
  }

  if (
    formType === 'college' ||
    hasAnySub([
      'PU College',
      'Degree College',
      'ITI',
      'Polytechnic',
      'Nursing / Paramedical Institute',
    ])
  ) {
    return <EducationCategoryForm isSchool={false} data={categoryData} onChange={onChange} />;
  }

  if (formType === 'cinema_theatre' || hasSub('Cinema Theatre')) {
    return <CinemaTheatreCategoryForm data={categoryData} onChange={onChange} />;
  }

  if (
    formType === 'bank' ||
    hasAnySub(['Bank', 'Rural Bank', 'Cooperative Bank', 'PACS'])
  ) {
    return <BankAtmCategoryForm isAtm={false} data={categoryData} onChange={onChange} />;
  }

  if (formType === 'atm' || hasAnySub(['ATM', 'Cash Deposit Machine'])) {
    return <BankAtmCategoryForm isAtm={true} data={categoryData} onChange={onChange} />;
  }

  if (formType === 'hotel' || hasAnySub(['Hotel', 'Lodge', 'Guest House'])) {
    return <HotelRestaurantCategoryForm isRestaurant={false} data={categoryData} onChange={onChange} />;
  }

  if (
    formType === 'restaurant' ||
    hasAnySub(['Restaurant', 'Cafe', 'Bakery', 'Caterer'])
  ) {
    return <HotelRestaurantCategoryForm isRestaurant={true} data={categoryData} onChange={onChange} />;
  }

  if (formType === 'agriculture_apmc' || hasSub('APMC')) {
    return <AgricultureCategoryForm isApmc={true} data={categoryData} onChange={onChange} />;
  }

  if (
    formType === 'agriculture_store' ||
    subList.some(
      (s) =>
        s.includes('Agri') ||
        s.includes('Seed') ||
        s.includes('Fertilizer') ||
        s.includes('Pesticide') ||
        s.includes('Farm Equipment')
    )
  ) {
    return <AgricultureCategoryForm isApmc={false} data={categoryData} onChange={onChange} />;
  }

  if (
    formType === 'bus_stop' ||
    hasAnySub(['Bus Stop', 'Bus Stand', 'Bus Depot'])
  ) {
    return <BusStopCategoryForm data={categoryData} onChange={onChange} />;
  }

  if (
    formType === 'daily_trades' ||
    categoryId === 'DAILY_UTILITIES_TRADES' ||
    hasAnySub([
      'Electrician',
      'Plumber',
      'Carpenter',
      'Mason',
      'Welder',
      'Fabrication',
      'Tractor Service',
      'Borewell Service',
    ])
  ) {
    return <DailyTradesCategoryForm data={categoryData} onChange={onChange} />;
  }

  // Fallback default custom attributes for miscellaneous places (Convention halls, temples, parks, etc.)
  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <h4 className="text-xs font-bold text-white">Specific Venue Attributes</h4>
      <p className="text-[11px] text-slate-500">
        Additional attributes specific to {subcategory || 'this location'}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
            Seating / Visitor Capacity
          </label>
          <input
            type="text"
            value={categoryData.visitorCapacity || ''}
            onChange={(e) => onChange({ ...categoryData, visitorCapacity: e.target.value })}
            placeholder="e.g. 500 Seating capacity / 1,000 Dining"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
            Special Rules / Guidelines
          </label>
          <input
            type="text"
            value={categoryData.specialGuidelines || ''}
            onChange={(e) => onChange({ ...categoryData, specialGuidelines: e.target.value })}
            placeholder="e.g. Traditional dress mandatory, Photography restricted"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

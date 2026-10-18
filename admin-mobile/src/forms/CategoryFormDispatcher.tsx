import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormCategoryType } from '../types';
import { colors } from '../theme/colors';
import { HospitalForm } from './HospitalForm';
import { ClinicDoctorForm } from './ClinicDoctorForm';
import { PharmacyForm } from './PharmacyForm';
import { FirePoliceForm } from './FirePoliceForm';
import { GovernmentOfficeForm } from './GovernmentOfficeForm';
import { EducationForm } from './EducationForm';
import { CinemaTheatreForm } from './CinemaTheatreForm';
import { BankAtmForm } from './BankAtmForm';
import { HotelRestaurantForm } from './HotelRestaurantForm';
import { AgricultureForm } from './AgricultureForm';
import { DailyTradesForm } from './DailyTradesForm';
import { BusStopForm } from './BusStopForm';

interface CategoryFormDispatcherProps {
  formType: FormCategoryType;
  categoryData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  subcategoryName: string;
}

export const CategoryFormDispatcher: React.FC<CategoryFormDispatcherProps> = ({
  formType,
  categoryData,
  onChange,
  subcategoryName,
}) => {
  switch (formType) {
    case 'hospital':
      return <HospitalForm data={categoryData} onChange={onChange} />;

    case 'clinic_doctor':
      return <ClinicDoctorForm data={categoryData} onChange={onChange} />;

    case 'pharmacy':
      return <PharmacyForm data={categoryData} onChange={onChange} />;

    case 'fire_station':
      return <FirePoliceForm data={categoryData} onChange={onChange} isFire />;

    case 'police_station':
      return <FirePoliceForm data={categoryData} onChange={onChange} isFire={false} />;

    case 'government_services':
      return <GovernmentOfficeForm data={categoryData} onChange={onChange} />;

    case 'school':
      return <EducationForm data={categoryData} onChange={onChange} isCollege={false} />;

    case 'college':
      return <EducationForm data={categoryData} onChange={onChange} isCollege />;

    case 'cinema_theatre':
      return <CinemaTheatreForm data={categoryData} onChange={onChange} />;

    case 'bank':
      return <BankAtmForm data={categoryData} onChange={onChange} isAtmOnly={false} />;

    case 'atm':
      return <BankAtmForm data={categoryData} onChange={onChange} isAtmOnly />;

    case 'hotel':
      return <HotelRestaurantForm data={categoryData} onChange={onChange} isHotel />;

    case 'restaurant':
      return <HotelRestaurantForm data={categoryData} onChange={onChange} isHotel={false} />;

    case 'agriculture_apmc':
      return <AgricultureForm data={categoryData} onChange={onChange} isApmc />;

    case 'agriculture_store':
      return <AgricultureForm data={categoryData} onChange={onChange} isApmc={false} />;

    case 'daily_trades':
      return <DailyTradesForm data={categoryData} onChange={onChange} />;

    case 'bus_stop':
      return <BusStopForm data={categoryData} onChange={onChange} />;

    case 'bus_route':
      return (
        <View style={styles.busRouteNotice}>
          <Text style={styles.noticeIcon}>🚌</Text>
          <Text style={styles.noticeTitle}>Specialized Bus Corridor Route</Text>
          <Text style={styles.noticeSub}>
            Bus routes and intermediate stage timings use the dedicated Route Manager with stop-order sequencing.
          </Text>
        </View>
      );

    case 'general':
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  busRouteNotice: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  noticeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  noticeSub: {
    fontSize: 12,
    color: '#b45309',
    textAlign: 'center',
    marginTop: 4,
  },
});

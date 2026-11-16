import { NavigatorScreenParams } from '@react-navigation/native';
import { PlaceStatus } from '../types';

export type MainTabParamList = {
  DashboardTab: undefined;
  PlacesTab: { status?: PlaceStatus; category?: string; query?: string } | undefined;
  SurveyTab: undefined;
  AddTab: undefined;
  BusesTab: { routeId?: string } | undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  CategorySelect: undefined;
  SubcategorySelect: { categoryId: string; initialSelectedIds?: string[] };
  PlaceForm: {
    categoryId?: string;
    subcategoryId?: string;
    subcategoryIds?: string[];
    placeId?: string;
    isEdit?: boolean;
  };
  PlaceDetail: { placeId: string };
  BusRouteManage: { routeId?: string } | undefined;
  BuildingMap: undefined;
  BuildingWizard: { initialLat?: number; initialLng?: number; buildingId?: string } | undefined;
  BusinessWizard: {
    buildingId?: string;
    buildingName?: string;
    unitId?: string;
    unitNumber?: string;
    floorName?: string;
    businessId?: string;
  } | undefined;
  BuildingDetail: { buildingId: string };
  SurveyDashboard: undefined;
};

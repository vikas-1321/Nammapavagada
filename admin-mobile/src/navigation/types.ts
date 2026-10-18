import { NavigatorScreenParams } from '@react-navigation/native';
import { PlaceStatus } from '../types';

export type MainTabParamList = {
  DashboardTab: undefined;
  PlacesTab: { status?: PlaceStatus; category?: string; query?: string } | undefined;
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
};

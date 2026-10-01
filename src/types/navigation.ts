export type PageRoute =
  | 'home'
  | 'about'
  | 'history'
  | 'places'
  | 'locations'
  | 'services'
  | 'map';

export interface NavItem {
  id: PageRoute;
  label: string;
  badge?: string;
  description: string;
}

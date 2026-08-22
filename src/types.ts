export type PlaceType = 'mosque' | 'hussainiya' | 'shrine';

export interface PlaceFeatures {
  shovadoon: boolean;
  shovadoonDepthMeters?: number;
  ladiesSection: boolean;
  wheelchairAccess: boolean;
  quranClasses: boolean;
  parking: boolean;
  liveBroadcast: boolean;
  wuduFacilities: boolean;
  library: boolean;
  coolingSystem: string;
}

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  isHistorical: boolean;
  historicalPeriod?: string;
  neighborhood: string;
  neighborhoodId: string;
  address: string;
  coordinates: [number, number]; // [lat, lng] (Dezful is ~ 32.38, 48.40)
  phone?: string;
  isCurrentlyOpen: boolean;
  openingHours: string;
  capacity: number;
  imamOrCustodian?: string;
  image: string;
  description: string;
  historySummary?: string;
  establishedYear?: string;
  features: PlaceFeatures;
  rating: number;
  eventsCountToday: number;
}

export interface EventServices {
  nazri: boolean;
  nazriDescription?: string;
  liveStream: boolean;
  womenSection: boolean;
  parking: boolean;
  shovadoonActive: boolean;
  quranRecitation: boolean;
}

export type EventCategory = 
  | 'komeyl_nodbeh'
  | 'mourning'
  | 'celebration'
  | 'speech'
  | 'quran'
  | 'prayer'
  | 'charity';

export interface EventItem {
  id: string;
  placeId: string;
  placeName: string;
  placeType: PlaceType;
  neighborhood: string;
  title: string;
  speaker?: string;
  eulogist?: string; // مداح
  qari?: string; // قاری قرآن
  date: string; // YYYY-MM-DD Jalali string
  dayOfWeek: string;
  timeStr: string;
  timeBadge: string;
  category: EventCategory;
  services: EventServices;
  coordinates: [number, number];
  isToday: boolean;
  isTonight: boolean;
  description?: string;
  contactPhone?: string;
  streamUrl?: string;
  attendeesCount?: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  description: string;
  mosquesCount: number;
  hussainiyasCount: number;
  historicalCount: number;
  isHistoricalDistrict: boolean;
  coordinates: [number, number];
  keyHighlights: string[];
}

export type ActiveTab = 'home' | 'map' | 'calendar' | 'neighborhoods' | 'submit';

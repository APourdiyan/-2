import { create } from 'zustand';
import { Place, EventItem } from '../types';

export interface AppState {
  selectedPlace: Place | null;
  userLocation: { lat: number; lng: number } | null;
  activeFilters: string[];
  isDarkMode: boolean;
  searchQuery: string;
  activeTab: 'home' | 'search' | 'events' | 'profile';
  isLoading: boolean;
  error: string | null;
  nearbyPlaces: Place[];
  todayEvents: EventItem[];

  // Actions
  setSelectedPlace: (place: Place | null) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  toggleFilter: (filter: string) => void;
  toggleDarkMode: () => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: 'home' | 'search' | 'events' | 'profile') => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setNearbyPlaces: (places: Place[]) => void;
  setTodayEvents: (events: EventItem[]) => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedPlace: null,
  userLocation: null,
  activeFilters: [],
  isDarkMode: typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  searchQuery: '',
  activeTab: 'home',
  isLoading: false,
  error: null,
  nearbyPlaces: [],
  todayEvents: [],

  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setUserLocation: (location) => set({ userLocation: location }),
  toggleFilter: (filter) =>
    set((state) => ({
      activeFilters: state.activeFilters.includes(filter)
        ? state.activeFilters.filter((f) => f !== filter)
        : [...state.activeFilters, filter]
    })),
  toggleDarkMode: () =>
    set((state) => {
      const nextMode = !state.isDarkMode;
      if (typeof document !== 'undefined') {
        if (nextMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { isDarkMode: nextMode };
    }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setNearbyPlaces: (places) => set({ nearbyPlaces: places }),
  setTodayEvents: (events) => set({ todayEvents: events }),
  resetFilters: () => set({ activeFilters: [] })
}));

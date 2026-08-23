import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Place } from '../types';

/**
 * ساختار State و Actionهای سراسری نرم‌افزار نقشه مذهبی دزفول
 */
export interface UserCoordinates {
  lat: number;
  lng: number;
}

interface AppState {
  // State
  selectedPlace: Place | null;
  userLocation: UserCoordinates | null;
  activeFilters: string[];
  isDarkMode: boolean;

  // Actions
  setSelectedPlace: (place: Place | null) => void;
  setUserLocation: (location: UserCoordinates | null) => void;
  toggleFilter: (filterId: string) => void;
  toggleDarkMode: () => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // وضعیت اولیه
      selectedPlace: null,
      userLocation: null,
      activeFilters: ['all'],
      isDarkMode: false,

      // تغییر مکان انتخاب شده
      setSelectedPlace: (place) =>
        set(
          () => ({ selectedPlace: place }),
          false,
          'setSelectedPlace'
        ),

      // به‌روزرسانی موقعیت جغرافیایی کاربر
      setUserLocation: (location) =>
        set(
          () => ({ userLocation: location }),
          false,
          'setUserLocation'
        ),

      // فعال/غیرفعال‌سازی فیلترهای دسته‌بندی
      toggleFilter: (filterId) =>
        set(
          (state) => {
            if (filterId === 'all') {
              return { activeFilters: ['all'] };
            }

            const current = state.activeFilters.filter((f) => f !== 'all');
            const exists = current.includes(filterId);

            let updated: string[];
            if (exists) {
              updated = current.filter((f) => f !== filterId);
              if (updated.length === 0) {
                updated = ['all'];
              }
            } else {
              updated = [...current, filterId];
            }

            return { activeFilters: updated };
          },
          false,
          'toggleFilter'
        ),

      // تغییر تم تاریک/روشن
      toggleDarkMode: () =>
        set(
          (state) => ({ isDarkMode: !state.isDarkMode }),
          false,
          'toggleDarkMode'
        ),

      // بازنشانی تمام فیلترها به حالت پیش‌فرض
      resetFilters: () =>
        set(
          () => ({ activeFilters: ['all'] }),
          false,
          'resetFilters'
        ),
    }),
    { name: 'DezfulReligiousMapStore' }
  )
);

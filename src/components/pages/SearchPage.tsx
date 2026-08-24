import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MapPin,
  Clock,
  History,
  X,
  Warehouse,
  Car,
  Users,
  Navigation,
  ChevronLeft,
  Trash2,
  Sparkles
} from 'lucide-react';
import { Place, EventItem } from '../../types';
import {
  toPersianDigits,
  calculateDistanceMeters,
  formatDistance
} from '../../utils/persianUtils';
import { EmptyState } from '../common/EmptyState';

export interface SearchPageProps {
  places: Place[];
  events?: EventItem[];
  userCoords?: [number, number] | null;
  onSelectPlace: (place: Place) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  places,
  events = [],
  userCoords,
  onSelectPlace
}) => {
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeChip, setActiveChip] = useState<string>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dezful_search_history');
      return saved ? JSON.parse(saved) : ['مسجد جامع دزفول', 'حسینیه ثارالله', 'محله قلعه', 'شوادون'];
    } catch {
      return [];
    }
  });

  // Debounce ۳۰۰ میلی‌ثانیه برای جستجوی روان
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(rawQuery);
      if (rawQuery.trim() && !searchHistory.includes(rawQuery.trim())) {
        const next = [rawQuery.trim(), ...searchHistory.filter((h) => h !== rawQuery.trim())].slice(0, 5);
        setSearchHistory(next);
        try {
          localStorage.setItem('dezful_search_history', JSON.stringify(next));
        } catch {
          // silent
        }
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [rawQuery]);

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('dezful_search_history');
    } catch {
      // silent
    }
  };

  // فیلتر و جستجوی زنده
  const searchResults = useMemo(() => {
    return places.filter((place) => {
      // فیلترهای چیپسی
      if (activeChip === 'mosque' && place.type !== 'mosque') return false;
      if (activeChip === 'hussainiya' && place.type !== 'hussainiya') return false;
      if (activeChip === 'parking' && !place.features.parking) return false;
      if (activeChip === 'women' && !place.features.ladiesSection) return false;
      if (activeChip === 'shovadoon' && !place.features.shovadoon) return false;

      // جستجو در نام مکان، محله، مراسمات، سخنران
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.trim().toLowerCase();
        const matchName = place.name.toLowerCase().includes(q);
        const matchNeighborhood = place.neighborhood.toLowerCase().includes(q);
        const matchAddress = place.address.toLowerCase().includes(q);
        const matchEvents = events
          .filter((e) => e.placeId === place.id)
          .some(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              (e.speaker && e.speaker.toLowerCase().includes(q)) ||
              (e.eulogist && e.eulogist.toLowerCase().includes(q))
          );

        if (!matchName && !matchNeighborhood && !matchAddress && !matchEvents) {
          return false;
        }
      }

      return true;
    });
  }, [places, events, debouncedQuery, activeChip]);

  // مرتب‌سازی بر اساس نزدیکی در صورت وجود لوکیشن
  const sortedResults = useMemo(() => {
    if (!userCoords) return searchResults;

    return [...searchResults].sort((a, b) => {
      const distA = calculateDistanceMeters(userCoords[0], userCoords[1], a.coordinates[0], a.coordinates[1]);
      const distB = calculateDistanceMeters(userCoords[0], userCoords[1], b.coordinates[0], b.coordinates[1]);
      return distA - distB;
    });
  }, [searchResults, userCoords]);

  return (
    <div
      id="search-page-container"
      className="max-w-4xl mx-auto space-y-6 font-['Vazirmatn'] pb-12 select-none"
      dir="rtl"
    >
      {/* نوار جستجوی بزرگ */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-[#0E7C86] absolute right-4 top-3.5" />
          <input
            type="text"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="جستجوی سریع مساجد، حسینیه‌ها، محلات دزفول، نام سخنران یا مراسم..."
            className="w-full pr-12 pl-10 py-3 text-sm md:text-base bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-[#0E7C86] text-stone-900 dark:text-white placeholder:text-stone-400 shadow-inner"
            autoFocus
          />
          {rawQuery && (
            <button
              onClick={() => setRawQuery('')}
              className="absolute left-4 top-3.5 p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* فیلترهای چیپسی سریع */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: 'همه اماکن' },
            { id: 'mosque', label: 'مساجد' },
            { id: 'hussainiya', label: 'حسینیه‌ها' },
            { id: 'shovadoon', label: 'دارای شوادون' },
            { id: 'parking', label: 'پارکینگ خودرو' },
            { id: 'women', label: 'بخش بانوان' }
          ].map((chip) => {
            const isActive = activeChip === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveChip(chip.id)}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap border transition-all ${
                  isActive
                    ? 'bg-[#0E7C86] text-white border-[#0E7C86] shadow-sm shadow-[#0E7C86]/25'
                    : 'bg-stone-50 dark:bg-slate-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-slate-700 hover:border-stone-400'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* تاریخچه جستجوهای اخیر */}
      {!rawQuery && searchHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs md:text-sm font-extrabold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <History className="w-4 h-4" />
              <span>جستجوهای اخیر</span>
            </h3>
            <button
              onClick={clearHistory}
              className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاک کردن تاریخچه</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setRawQuery(item)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* لیست نتایج جستجو */}
      <div>
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-xs font-extrabold text-stone-500 dark:text-stone-400">
            نتایج ({toPersianDigits(sortedResults.length)} مکان)
          </span>
        </div>

        {sortedResults.length === 0 ? (
          <EmptyState
            type="search"
            title="هیچ مکانی با این مشخصات یافت نشد"
            description="پیشنهاد: فیلترها را پاک کنید یا از املای صحیح نام مسجد یا محله اطمینان حاصل فرمایید."
            actionText="پاک کردن فیلترها"
            onAction={() => {
              setRawQuery('');
              setActiveChip('all');
            }}
            className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedResults.map((place) => {
              const isHussainiya = place.type === 'hussainiya';
              let distStr = '';
              if (userCoords) {
                const d = calculateDistanceMeters(userCoords[0], userCoords[1], place.coordinates[0], place.coordinates[1]);
                distStr = formatDistance(d);
              }

              return (
                <div
                  key={place.id}
                  onClick={() => onSelectPlace(place)}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 hover:border-[#0E7C86] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm md:text-base text-stone-900 dark:text-white group-hover:text-[#0E7C86] transition-colors">
                          {place.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isHussainiya
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {isHussainiya ? 'حسینیه' : 'مسجد'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                        <MapPin className="w-3.5 h-3.5 text-[#C26D47]" />
                        <span>محله {place.neighborhood}</span>
                        {distStr && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {distStr}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded-2xl bg-stone-100 dark:bg-slate-800 text-stone-400 group-hover:text-[#0E7C86] group-hover:bg-[#0E7C86]/10 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-stone-100 dark:border-slate-800 text-[11px] text-stone-500 dark:text-stone-400">
                    {place.features.shovadoon && (
                      <span className="flex items-center gap-1 text-[#0284C7] font-semibold">
                        <Warehouse className="w-3.5 h-3.5" />
                        <span>شوادون</span>
                      </span>
                    )}
                    {place.features.parking && (
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" />
                        <span>پارکینگ</span>
                      </span>
                    )}
                    {place.features.ladiesSection && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>بانوان</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

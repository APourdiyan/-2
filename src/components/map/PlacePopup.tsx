import React, { useState } from 'react';
import { Place } from '../../types';
import {
  MapPin,
  ExternalLink,
  ChevronLeft,
  Navigation,
  Warehouse,
  Sparkles
} from 'lucide-react';
import {
  toPersianDigits,
  calculateDistanceMeters,
  formatDistance,
  getRoutingLinks
} from '../../utils/persianUtils';

export interface PlacePopupProps {
  place: Place;
  userCoords?: [number, number] | null;
  onViewDetails: (place: Place) => void;
}

export const PlacePopup: React.FC<PlacePopupProps> = ({
  place,
  userCoords,
  onViewDetails
}) => {
  const [showRoutingMenu, setShowRoutingMenu] = useState(false);

  const isHussainiya = place.type === 'hussainiya';
  const isShrine = place.type === 'shrine';

  let distStr = '';
  if (userCoords) {
    const dist = calculateDistanceMeters(
      userCoords[0],
      userCoords[1],
      place.coordinates[0],
      place.coordinates[1]
    );
    distStr = formatDistance(dist);
  }

  const routingLinks = getRoutingLinks(
    place.coordinates[0],
    place.coordinates[1],
    place.name
  );

  return (
    <div
      id={`popup-card-${place.id}`}
      className="p-3.5 min-w-[240px] max-w-[290px] font-['Vazirmatn'] text-stone-800 dark:text-stone-100 select-none"
      dir="rtl"
    >
      {/* هدر پاپ‌آپ: نام مکان و تگ نوع */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-col min-w-0">
          <h3 className="font-extrabold text-sm md:text-base text-stone-900 dark:text-white leading-tight">
            {place.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            <span
              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                isHussainiya
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                  : isShrine
                  ? 'bg-teal-100 text-teal-900 dark:bg-teal-950/60 dark:text-teal-300'
                  : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}
            >
              {isHussainiya ? 'حسینیه' : isShrine ? 'بقعه متبرکه' : 'مسجد'}
            </span>

            {place.features.shovadoon && (
              <span className="flex items-center gap-0.5 text-[#C26D47] font-semibold text-[10px]">
                <Warehouse className="w-3 h-3" />
                <span>شوادون</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* محله و فاصله */}
      <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 mb-3 bg-stone-100/70 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl">
        <MapPin className="w-3.5 h-3.5 text-[#C26D47] shrink-0" />
        <span className="truncate">{place.neighborhood}</span>
        {distStr && (
          <>
            <span className="text-stone-400">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {distStr}
            </span>
          </>
        )}
      </div>

      {/* دکمه‌های اقدام: مشاهده جزئیات و مسیریابی */}
      <div className="flex items-center gap-2">
        <button
          id={`popup-btn-details-${place.id}`}
          onClick={() => onViewDetails(place)}
          className="flex-1 bg-[#0E7C86] hover:bg-[#0c6b74] active:scale-95 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-sm shadow-[#0E7C86]/25"
        >
          <span>مشاهده جزئیات</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          <button
            id={`popup-btn-routing-${place.id}`}
            onClick={() => setShowRoutingMenu(!showRoutingMenu)}
            title="مسیریابی"
            className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-slate-700 transition-colors"
          >
            <Navigation className="w-4 h-4 text-[#C26D47]" />
          </button>

          {/* منوی انتخاب نقشه مسیریابی */}
          {showRoutingMenu && (
            <div className="absolute left-0 bottom-full mb-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-xl p-1.5 flex flex-col gap-1 z-50 min-w-[120px] text-xs">
              <a
                href={routingLinks.neshan}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-700 dark:text-stone-300 flex items-center justify-between"
              >
                <span>نشان</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
              <a
                href={routingLinks.balad}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-700 dark:text-stone-300 flex items-center justify-between"
              >
                <span>بلد</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
              <a
                href={routingLinks.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-700 dark:text-stone-300 flex items-center justify-between"
              >
                <span>گوگل مپ</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlacePopup;

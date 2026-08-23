import React from 'react';
import { Place } from '../types';
import { toPersianDigits, formatDistance, calculateDistanceMeters, DEZFUL_PRAYER_TIMES } from '../utils/persianUtils';
import { MapPin, Warehouse, Users, Car, Accessibility, Clock } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onSelectPlace: () => void;
  userCoords: [number, number] | null;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onSelectPlace,
  userCoords,
}) => {
  const distanceMeters = userCoords
    ? calculateDistanceMeters(userCoords[0], userCoords[1], place.coordinates[0], place.coordinates[1])
    : null;

  return (
    <div
      onClick={onSelectPlace}
      className="bg-white rounded-3xl p-4 border border-[#E0D8C8] hover:border-[#0E7C86] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="relative h-36 rounded-2xl overflow-hidden mb-3 border border-[#E0D8C8]">
          <img
            src={place.image}
            alt={place.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* نوع و برچسب تاریخی */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-lg text-white ${
                place.type === 'hussainiya' ? 'bg-[#B4552D]' : 'bg-[#0E7C86]'
              }`}
            >
              {place.type === 'mosque' ? 'مسجد' : place.type === 'shrine' ? 'آستانه' : 'حسینیه'}
            </span>
            {place.isHistorical && (
              <span className="bg-[#E5B555] text-[#1F2430] text-[10px] font-black px-2 py-0.5 rounded-lg">
                ★ تاریخی
              </span>
            )}
          </div>

          <div className="absolute top-2.5 left-2.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                place.isCurrentlyOpen ? 'bg-emerald-600 text-white' : 'bg-stone-700/90 text-white'
              }`}
            >
              {place.isCurrentlyOpen ? 'باز الان' : 'بسته'}
            </span>
          </div>

          <div className="absolute bottom-2.5 right-2.5 left-2.5 text-white">
            <h3 className="text-base font-black leading-tight drop-shadow-sm">{place.name}</h3>
            <div className="flex items-center justify-between text-xs text-white/90 mt-0.5">
              <span>{place.neighborhood}</span>
              {distanceMeters !== null && (
                <span className="bg-black/40 px-2 py-0.5 rounded-md font-bold text-[11px] text-[#E5B555]">
                  {formatDistance(distanceMeters)}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-[#52525B] line-clamp-2 mb-2.5 leading-relaxed">
          {place.description}
        </p>

        {/* امکانات و ویژگی‌ها */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[10px] font-bold">
          {place.features.shovadoon && (
            <span className="bg-[#F7F3EC] text-[#B4552D] border border-[#DDD5C5] px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Warehouse className="w-3 h-3 text-[#B4552D]" />
              شوادون {toPersianDigits(place.features.shovadoonDepthMeters || 12)}م
            </span>
          )}
          {place.features.ladiesSection && (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
              بخش بانوان
            </span>
          )}
          {place.features.parking && (
            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg">
              پارکینگ
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-[#F2ECE1] text-xs">
        <span className="text-[11px] text-[#71717A] flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#0E7C86]" />
          <span>نماز مغرب: {DEZFUL_PRAYER_TIMES.maghrib}</span>
        </span>
        <span className="text-[#0E7C86] font-bold group-hover:underline">مشاهده جزئیات ←</span>
      </div>
    </div>
  );
};

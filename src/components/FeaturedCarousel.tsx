import React from 'react';
import { Sparkles, MapPin, Warehouse, ArrowLeft, Users, Clock } from 'lucide-react';
import { Place } from '../types';
import { toPersianDigits } from '../utils/persianUtils';

interface FeaturedCarouselProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  onViewAllFeatured?: () => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  places,
  onSelectPlace,
  onViewAllFeatured
}) => {
  // Filter historic or prominent places
  const featuredPlaces = places.filter((p) => p.isHistorical || p.rating >= 4.8);

  return (
    <section className="my-4 sm:my-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E5B555]/20 text-[#B4552D] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#B4552D]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1F2430]">اماکن شاخص و کهن دزفول</h2>
            <p className="text-[11px] text-[#71717A]">شاهکارهای معماری آجری، شبستان‌ها و بقاع زیارتی</p>
          </div>
        </div>

        <button
          onClick={onViewAllFeatured}
          className="flex items-center gap-1 text-xs font-bold text-[#0E7C86] hover:text-[#0b636b] transition-colors"
        >
          <span>مشاهده همه</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-3.5 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
        {featuredPlaces.map((place) => {
          const isHussainiya = place.type === 'hussainiya';
          const typeBadgeColor = isHussainiya
            ? 'bg-[#B4552D]/90 text-white'
            : place.type === 'shrine'
            ? 'bg-[#0E7C86] text-white'
            : 'bg-[#0E7C86]/90 text-white';

          return (
            <div
              key={place.id}
              onClick={() => onSelectPlace(place)}
              className="group relative w-72 sm:w-80 shrink-0 bg-white rounded-3xl overflow-hidden border border-[#E0D8C8] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Image Banner with Overlay */}
              <div className="relative h-44 w-full overflow-hidden bg-[#ECE4D4]">
                <img
                  src={place.image}
                  alt={`تصویر ${place.name}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl backdrop-blur-md shadow-xs ${typeBadgeColor}`}>
                    {place.type === 'mosque' ? 'مسجد تاریخی' : place.type === 'shrine' ? 'آستانه متبرکه' : 'حسینیه کهن'}
                  </span>
                  {place.features.shovadoon && (
                    <span className="text-[10px] font-bold bg-[#1F2430]/85 text-[#E5B555] px-2 py-1 rounded-xl backdrop-blur-md flex items-center gap-1">
                      <Warehouse className="w-3 h-3" />
                      شوادون {toPersianDigits(place.features.shovadoonDepthMeters || 12)}متر
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md ${
                    place.isCurrentlyOpen ? 'bg-emerald-500/90 text-white' : 'bg-gray-700/90 text-gray-200'
                  }`}>
                    {place.isCurrentlyOpen ? '● باز الان' : 'بسته'}
                  </span>
                </div>

                {/* Bottom title on image */}
                <div className="absolute bottom-2.5 right-2.5 left-2.5 z-10">
                  <h3 className="text-base font-black text-white drop-shadow-sm group-hover:text-[#E5B555] transition-colors line-clamp-1">
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/80 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#E5B555]" />
                    <span className="truncate">{place.neighborhood}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex flex-col gap-2.5 justify-between flex-1 bg-white">
                <p className="text-xs text-[#52525B] line-clamp-2 leading-relaxed">
                  {place.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE0] text-[11px] text-[#71717A]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#0E7C86]" />
                      <span>ظرفیت {toPersianDigits(place.capacity)} نفر</span>
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlace(place);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#0E7C86]/10 text-[#0E7C86] font-bold hover:bg-[#0E7C86] hover:text-white transition-all text-xs flex items-center gap-1 group-hover:bg-[#0E7C86] group-hover:text-white"
                  >
                    <span>جزئیات</span>
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

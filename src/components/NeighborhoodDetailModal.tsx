import React from 'react';
import { X, Building2, MapPin, Landmark, Flame, Sparkles, Warehouse, ArrowLeft } from 'lucide-react';
import { Neighborhood, Place } from '../types';
import { toPersianDigits } from '../utils/persianUtils';

interface NeighborhoodDetailModalProps {
  neighborhood: Neighborhood | null;
  places: Place[];
  onClose: () => void;
  onSelectPlace: (place: Place) => void;
}

export const NeighborhoodDetailModal: React.FC<NeighborhoodDetailModalProps> = ({
  neighborhood,
  places,
  onClose,
  onSelectPlace
}) => {
  if (!neighborhood) return null;

  const neighborhoodPlaces = places.filter(
    (p) => p.neighborhoodId === neighborhood.id || p.neighborhood.includes(neighborhood.name)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden z-10 border border-[#E0D8C8] animate-slideUp">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-l from-[#0E7C86] to-[#09575e] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">{neighborhood.name}</h3>
                {neighborhood.isHistoricalDistrict && (
                  <span className="bg-[#E5B555] text-[#1F2430] text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    بافت تاریخی دزفول
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80 mt-0.5">{neighborhood.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-around bg-[#F7F3EC] p-2.5 border-b border-[#E0D8C8] text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#0E7C86]">
            <Landmark className="w-4 h-4" />
            <span>{toPersianDigits(neighborhood.mosquesCount)} مسجد</span>
          </div>
          <div className="w-px h-4 bg-[#DDD5C5]" />
          <div className="flex items-center gap-1.5 font-bold text-[#B4552D]">
            <Flame className="w-4 h-4" />
            <span>{toPersianDigits(neighborhood.hussainiyasCount)} حسینیه</span>
          </div>
          <div className="w-px h-4 bg-[#DDD5C5]" />
          <div className="flex items-center gap-1.5 font-bold text-amber-700">
            <Sparkles className="w-4 h-4" />
            <span>{toPersianDigits(neighborhood.historicalCount)} اثر شاخص</span>
          </div>
        </div>

        {/* Places List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          <h4 className="text-xs font-bold text-[#1F2430]">اماکن ثبت شده در این منطقه:</h4>

          {neighborhoodPlaces.length === 0 ? (
            <div className="p-8 text-center bg-[#F7F3EC] rounded-2xl text-xs text-[#71717A]">
              اماکن این محله به زودی در پایگاه اضافه خواهد شد.
            </div>
          ) : (
            neighborhoodPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => {
                  onClose();
                  onSelectPlace(place);
                }}
                className="p-3.5 rounded-2xl bg-white border border-[#E0D8C8] hover:border-[#0E7C86] hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={place.image}
                    alt={place.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border border-[#E0D8C8] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                        place.type === 'hussainiya' ? 'bg-[#B4552D] text-white' : 'bg-[#0E7C86] text-white'
                      }`}>
                        {place.type === 'mosque' ? 'مسجد' : place.type === 'shrine' ? 'آستانه' : 'حسینیه'}
                      </span>
                      <h4 className="text-sm font-black text-[#1F2430] group-hover:text-[#0E7C86] transition-colors">
                        {place.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-0.5 line-clamp-1">{place.address}</p>
                    {place.features.shovadoon && (
                      <span className="text-[10px] text-[#B4552D] font-bold flex items-center gap-1 mt-0.5">
                        <Warehouse className="w-3 h-3" />
                        دارای شوادون {toPersianDigits(place.features.shovadoonDepthMeters || 12)} متری
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-[#F7F3EC] group-hover:bg-[#0E7C86] group-hover:text-white flex items-center justify-center text-[#71717A] shrink-0 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

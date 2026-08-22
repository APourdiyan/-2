import React from 'react';
import { Map, Landmark, Flame, Sparkles, ArrowLeft, Building2 } from 'lucide-react';
import { Neighborhood } from '../types';
import { toPersianDigits } from '../utils/persianUtils';

interface NeighborhoodsGridProps {
  neighborhoods: Neighborhood[];
  onSelectNeighborhood: (neighborhood: Neighborhood) => void;
}

export const NeighborhoodsGrid: React.FC<NeighborhoodsGridProps> = ({
  neighborhoods,
  onSelectNeighborhood
}) => {
  return (
    <section className="my-5 sm:my-7">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0E7C86]/10 text-[#0E7C86] flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1F2430]">محله‌های عرفی و اصیل دزفول</h2>
            <p className="text-[11px] text-[#71717A]">دسته‌بندی مساجد بر اساس بافت تاریخی و مناطق شهری</p>
          </div>
        </div>

        <span className="text-xs font-bold text-[#71717A] bg-[#F7F3EC] px-2.5 py-1 rounded-xl border border-[#DDD5C5]">
          {toPersianDigits(neighborhoods.length)} محله شاخص
        </span>
      </div>

      {/* Grid of Neighborhoods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {neighborhoods.map((nh) => {
          return (
            <div
              key={nh.id}
              onClick={() => onSelectNeighborhood(nh)}
              className="bg-white rounded-3xl p-3.5 sm:p-4 border border-[#E0D8C8] hover:border-[#0E7C86] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Header with Historic Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-[#1F2430] group-hover:text-[#0E7C86] transition-colors">
                    {nh.name}
                  </h3>
                  {nh.isHistoricalDistrict && (
                    <span className="text-[10px] font-bold bg-[#E5B555]/20 text-[#B4552D] px-2 py-0.5 rounded-lg border border-[#E5B555]/30 shrink-0">
                      بافت کهن
                    </span>
                  )}
                </div>

                {/* 1-Line Description */}
                <p className="text-xs text-[#52525B] line-clamp-2 leading-relaxed mb-3">
                  {nh.description}
                </p>
              </div>

              <div>
                {/* Counter Badges (مسجد / حسینیه / تاریخی) */}
                <div className="flex items-center justify-between bg-[#F7F3EC] p-2 rounded-2xl border border-[#E4DCB] text-xs mb-2.5">
                  <div className="flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-[#0E7C86]" />
                    <span className="font-bold text-[#1F2430]">{toPersianDigits(nh.mosquesCount)}</span>
                    <span className="text-[10px] text-[#71717A]">مسجد</span>
                  </div>

                  <div className="w-px h-3 bg-[#DDD5C5]" />

                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#B4552D]" />
                    <span className="font-bold text-[#1F2430]">{toPersianDigits(nh.hussainiyasCount)}</span>
                    <span className="text-[10px] text-[#71717A]">حسینیه</span>
                  </div>

                  <div className="w-px h-3 bg-[#DDD5C5]" />

                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5B555]" />
                    <span className="font-bold text-[#1F2430]">{toPersianDigits(nh.historicalCount)}</span>
                    <span className="text-[10px] text-[#71717A]">تاریخی</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between text-[11px] font-bold text-[#0E7C86]">
                  <span>مشاهده لیست اماکن</span>
                  <div className="w-6 h-6 rounded-full bg-[#0E7C86]/10 flex items-center justify-center group-hover:bg-[#0E7C86] group-hover:text-white transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

import React from 'react';
import { 
  Sparkles, 
  DoorOpen, 
  Navigation, 
  Landmark, 
  Flame, 
  Calendar, 
  BookOpen, 
  Users, 
  Accessibility, 
  Warehouse,
  Check
} from 'lucide-react';
import { toPersianDigits } from '../utils/persianUtils';

export interface FilterChipOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badgeColor?: string;
}

interface QuickFilterChipsProps {
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  counts: {
    all: number;
    openNow: number;
    historical: number;
    hussainiyas: number;
    todayEvents: number;
    quranClasses: number;
    ladiesSection: number;
    wheelchair: number;
    shovadoon: number;
  };
}

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  activeFilter,
  onFilterChange,
  counts
}) => {
  const chips: FilterChipOption[] = [
    { id: 'all', label: 'همه اماکن', icon: Sparkles, count: counts.all },
    { id: 'open_now', label: 'بازِ الان', icon: DoorOpen, count: counts.openNow, badgeColor: 'bg-emerald-500' },
    { id: 'nearest', label: 'نزدیک‌ترین', icon: Navigation },
    { id: 'historical', label: 'مساجد تاریخی', icon: Landmark, count: counts.historical },
    { id: 'hussainiyas', label: 'حسینیه‌ها', icon: Flame, count: counts.hussainiyas },
    { id: 'today_events', label: 'مراسم امروز', icon: Calendar, count: counts.todayEvents, badgeColor: 'bg-amber-500' },
    { id: 'shovadoon', label: 'دارای شوادون', icon: Warehouse, count: counts.shovadoon },
    { id: 'ladies', label: 'بخش بانوان', icon: Users, count: counts.ladiesSection },
    { id: 'quran', label: 'کلاس قرآن', icon: BookOpen, count: counts.quranClasses },
    { id: 'wheelchair', label: 'دسترسی معلولین', icon: Accessibility, count: counts.wheelchair },
  ];

  return (
    <section className="my-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-bold text-[#1F2430] flex items-center gap-1.5">
          <span>فیلترهای هوشمند</span>
          <span className="text-[11px] font-normal text-[#71717A]">دسته‌بندی و امکانات</span>
        </h3>
        {activeFilter !== 'all' && (
          <button
            onClick={() => onFilterChange('all')}
            className="text-[11px] font-medium text-[#B4552D] hover:underline"
          >
            حذف فیلتر
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar scroll-smooth">
        {chips.map((chip) => {
          const Icon = chip.icon;
          const isActive = activeFilter === chip.id;

          return (
            <button
              key={chip.id}
              onClick={() => onFilterChange(chip.id)}
              className={`group shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border select-none whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-[#0E7C86] text-white border-[#0E7C86] shadow-sm shadow-[#0E7C86]/30'
                  : 'bg-white text-[#52525B] border-[#DDD5C5] hover:border-[#0E7C86] hover:bg-[#F2ECE1] hover:text-[#1F2430]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8C8474] group-hover:text-[#0E7C86]'}`} />
              <span>{chip.label}</span>

              {chip.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F7F3EC] text-[#71717A] group-hover:bg-[#E4DCB]'
                  }`}
                >
                  {toPersianDigits(chip.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

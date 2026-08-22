import React from 'react';
import { Landmark, Flame, DoorOpen, CalendarCheck, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../utils/persianUtils';

interface StatsDashboardProps {
  mosquesCount: number;
  hussainiyasCount: number;
  openNowCount: number;
  eventsTodayCount: number;
  onFilterClick?: (filterType: string) => void;
  activeQuickFilter?: string;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  mosquesCount,
  hussainiyasCount,
  openNowCount,
  eventsTodayCount,
  onFilterClick,
  activeQuickFilter
}) => {
  const cards = [
    {
      id: 'mosques',
      title: 'تعداد مساجد',
      count: mosquesCount,
      subtitle: 'مسجد و نمازخانه فعال',
      icon: Landmark,
      color: 'from-[#0E7C86]/10 to-[#0E7C86]/5',
      borderColor: 'border-[#0E7C86]/30 hover:border-[#0E7C86]',
      iconBg: 'bg-[#0E7C86] text-white',
      accentText: 'text-[#0E7C86]',
      filterKey: 'mosques'
    },
    {
      id: 'hussainiyas',
      title: 'تعداد حسینیه‌ها',
      count: hussainiyasCount,
      subtitle: 'تکایا و مراکز مذهبی',
      icon: Flame,
      color: 'from-[#B4552D]/10 to-[#B4552D]/5',
      borderColor: 'border-[#B4552D]/30 hover:border-[#B4552D]',
      iconBg: 'bg-[#B4552D] text-white',
      accentText: 'text-[#B4552D]',
      filterKey: 'hussainiyas'
    },
    {
      id: 'open-now',
      title: 'بازِ الان',
      count: openNowCount,
      subtitle: 'آماده پذیرش نمازگزار',
      icon: DoorOpen,
      color: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/30 hover:border-emerald-600',
      iconBg: 'bg-emerald-600 text-white',
      accentText: 'text-emerald-700',
      filterKey: 'open_now',
      liveDot: true
    },
    {
      id: 'events-today',
      title: 'مراسم امروز',
      count: eventsTodayCount,
      subtitle: 'دعای کمیل، روضه و جلسات',
      icon: CalendarCheck,
      color: 'from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-500/30 hover:border-amber-600',
      iconBg: 'bg-amber-600 text-white',
      accentText: 'text-amber-700',
      filterKey: 'events_today'
    }
  ];

  return (
    <section className="my-3 sm:my-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeQuickFilter === card.filterKey;

          return (
            <button
              key={card.id}
              onClick={() => onFilterClick?.(card.filterKey)}
              className={`text-right w-full p-3 sm:p-4 rounded-2xl bg-white border ${
                isSelected ? 'border-2 border-[#0E7C86] ring-2 ring-[#0E7C86]/20 shadow-md' : card.borderColor
              } transition-all duration-200 hover:shadow-md active:scale-[0.98] group flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${card.iconBg} flex items-center justify-center shadow-xs transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {card.liveDot ? (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    هم‌اکنون
                  </span>
                ) : (
                  <span className="text-[10px] text-[#8C8474] bg-[#F7F3EC] px-1.5 py-0.5 rounded-md">
                    دزفول
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-xl sm:text-2xl font-black ${card.accentText} tracking-tight`}>
                    {toPersianDigits(card.count)}
                  </span>
                  <span className="text-xs font-medium text-[#71717A]">مکان</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1F2430] mt-0.5">{card.title}</h3>
                <p className="text-[10px] sm:text-[11px] text-[#71717A] truncate mt-0.5">{card.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Search, Bell, Clock, Compass, Sparkles, X, Check } from 'lucide-react';
import { toPersianDigits, DEZFUL_PRAYER_TIMES, getCurrentJalaliDateString } from '../utils/persianUtils';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSearchModal: () => void;
  onOpenPrayerTimes: () => void;
  onOpenNotifications: () => void;
  unreadRemindersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenSearchModal,
  onOpenPrayerTimes,
  onOpenNotifications,
  unreadRemindersCount
}) => {
  const jalaliDate = getCurrentJalaliDateString();

  return (
    <header className="sticky top-0 z-40 bg-[#F7F3EC]/90 backdrop-blur-md border-b border-[#E6DFC9] transition-all">
      {/* Top Banner / Prayer Ticker */}
      <div className="bg-[#0E7C86] text-white text-xs px-3 py-1.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E5B555] animate-pulse"></span>
          <span className="font-medium">شهر دارالمؤمنین دزفول</span>
          <span className="text-white/70 hidden sm:inline">|</span>
          <span className="text-white/85 text-[11px] hidden sm:inline">{jalaliDate.fullDate}</span>
        </div>
        <button
          onClick={onOpenPrayerTimes}
          className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 transition-all px-2 py-0.5 rounded-full text-[11px] font-medium"
        >
          <Clock className="w-3.5 h-3.5 text-[#E5B555]" />
          <span>اذان مغرب: {toPersianDigits(DEZFUL_PRAYER_TIMES.maghrib)}</span>
          <span className="text-[10px] text-white/80 underline decoration-dotted mr-1">اوقات شرعی</span>
        </button>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0E7C86] to-[#09575e] text-white flex items-center justify-center shadow-md shadow-[#0E7C86]/20 border border-[#0E7C86]/30">
            {/* Custom Dezful Geometric Arch Icon */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" stroke="currentColor" strokeWidth="0.5">
              <path d="M12 2C8.5 5.5 6 9 6 13v8h12v-8c0-4-2.5-7.5-6-11z" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M9 21v-5a3 3 0 0 1 6 0v5" fill="#E5B555" />
              <circle cx="12" cy="7" r="1.5" fill="#E5B555" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base sm:text-lg text-[#1F2430] tracking-tight">نقشه مذهبی دزفول</h1>
              <span className="bg-[#B4552D]/10 text-[#B4552D] border border-[#B4552D]/20 text-[10px] px-1.5 py-0.5 rounded-md font-semibold">دایرکتوری زنده</span>
            </div>
            <p className="text-[11px] text-[#71717A] hidden xs:block">مساجد، حسینیه‌ها و مراسمات کهن‌شهر دزفول</p>
          </div>
        </div>

        {/* Quick Search Input */}
        <div className="flex-1 max-w-md mx-1 sm:mx-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onClick={onOpenSearchModal}
              placeholder="جستجوی مسجد، حسینیه، محله، سخنران..."
              className="w-full bg-white border border-[#DDD5C5] focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/20 rounded-xl pr-9 pl-8 py-2 text-xs sm:text-sm text-[#1F2430] placeholder-[#8C8474] transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-[#8C8474] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C8474] hover:text-[#1F2430] p-1"
                aria-label="پاک کردن"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:block absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-[#F7F3EC] text-[#8C8474] px-1.5 py-0.5 rounded border border-[#E0D8C8]">
                فوری
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Notifications & Profile/Help */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenNotifications}
            className="relative p-2 sm:p-2.5 rounded-xl bg-white hover:bg-[#F2ECE1] border border-[#DDD5C5] text-[#1F2430] transition-colors shadow-xs"
            title="یادآوری‌ها و رویدادها"
          >
            <Bell className="w-4 h-4 text-[#52525B]" />
            {unreadRemindersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#B4552D] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {toPersianDigits(unreadRemindersCount)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Utensils, 
  Radio, 
  Warehouse, 
  Navigation, 
  Bell, 
  BellRing, 
  Filter, 
  BookOpen, 
  Flame, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { EventItem, EventCategory, Place } from '../types';
import { toPersianDigits, getRoutingLinks, getCurrentJalaliDateString } from '../utils/persianUtils';

interface CalendarViewProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onOpenPlaceDetailById: (placeId: string) => void;
  savedReminderIds: string[];
  onToggleReminder: (eventId: string, title: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onSelectEvent,
  onOpenPlaceDetailById,
  savedReminderIds,
  onToggleReminder
}) => {
  const [selectedDayTab, setSelectedDayTab] = useState<'today' | 'tomorrow' | 'all'>('today');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeRoutingEventId, setActiveRoutingEventId] = useState<string | null>(null);

  const jalali = getCurrentJalaliDateString();

  const categories = [
    { id: 'all', label: 'همه برنامه‌ها' },
    { id: 'komeyl_nodbeh', label: 'کمیل و ندبه' },
    { id: 'mourning', label: 'روضه و عزاداری' },
    { id: 'quran', label: 'محافل قرآنی' },
    { id: 'speech', label: 'سخنرانی و معرفت' },
  ];

  const filteredEvents = events.filter((ev) => {
    if (selectedDayTab === 'today' && !ev.isToday) return false;
    if (selectedDayTab === 'tomorrow' && ev.isToday) return false;
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-4">
      {/* Calendar Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E0D8C8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0E7C86] text-white flex items-center justify-center shadow-md">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#1F2430]">تقویم مراسمات مذهبی دزفول</h2>
              <span className="text-[11px] font-bold bg-[#E5B555]/20 text-[#B4552D] px-2 py-0.5 rounded-md">
                گاهشمار شمسی
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">{jalali.fullDate}</p>
          </div>
        </div>

        {/* Day Switcher */}
        <div className="flex items-center gap-1 bg-[#F7F3EC] p-1 rounded-2xl border border-[#DDD5C5] text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setSelectedDayTab('today')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition-all ${
              selectedDayTab === 'today'
                ? 'bg-[#0E7C86] text-white shadow-xs'
                : 'text-[#52525B] hover:text-[#1F2430]'
            }`}
          >
            امروز پنج‌شنبه
          </button>
          <button
            onClick={() => setSelectedDayTab('tomorrow')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition-all ${
              selectedDayTab === 'tomorrow'
                ? 'bg-[#0E7C86] text-white shadow-xs'
                : 'text-[#52525B] hover:text-[#1F2430]'
            }`}
          >
            فردا جمعه
          </button>
          <button
            onClick={() => setSelectedDayTab('all')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition-all ${
              selectedDayTab === 'all'
                ? 'bg-[#0E7C86] text-white shadow-xs'
                : 'text-[#52525B] hover:text-[#1F2430]'
            }`}
          >
            کل هفته
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat.id
                ? 'bg-[#B4552D] text-white border-[#B4552D] shadow-xs'
                : 'bg-white text-[#52525B] border-[#DDD5C5] hover:bg-[#F7F3EC]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3.5">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#E0D8C8]">
            <p className="text-sm font-bold text-[#71717A]">مراسمی با این فیلتر در تاریخ انتخابی یافت نشد.</p>
            <p className="text-xs text-[#8C8474] mt-1">می‌توانید فیلتر دسته‌بندی را روی «همه برنامه‌ها» بگذارید.</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isReminderSet = savedReminderIds.includes(event.id);
            const routing = getRoutingLinks(event.coordinates[0], event.coordinates[1], event.placeName);
            const isMenuOpen = activeRoutingEventId === event.id;

            return (
              <div
                key={event.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E0D8C8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div
                    onClick={() => onOpenPlaceDetailById(event.placeId)}
                    className="cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-[#0E7C86]/10 text-[#0E7C86] px-2 py-0.5 rounded-md">
                        {event.placeName}
                      </span>
                      <span className="text-[11px] text-[#71717A]">• {event.neighborhood}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-[#1F2430] group-hover:text-[#0E7C86] transition-colors mt-1">
                      {event.title}
                    </h3>
                  </div>

                  <span className="bg-[#F7F3EC] text-[#B4552D] border border-[#DDD5C5] text-xs font-black px-2.5 py-1 rounded-xl shrink-0">
                    {event.timeBadge}
                  </span>
                </div>

                {/* Speaker / Eulogist */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#52525B] my-2">
                  {event.speaker && (
                    <div>
                      <span className="text-[#0E7C86] font-bold">سخنران: </span>
                      <span className="font-semibold text-[#1F2430]">{event.speaker}</span>
                    </div>
                  )}
                  {event.eulogist && (
                    <div>
                      <span className="text-[#B4552D] font-bold">مداح: </span>
                      <span className="font-semibold text-[#1F2430]">{event.eulogist}</span>
                    </div>
                  )}
                </div>

                {/* Facilities */}
                <div className="flex flex-wrap items-center gap-1.5 my-2">
                  {event.services.nazri && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-amber-600" />
                      {event.services.nazriDescription || 'پذیرایی و نذری'}
                    </span>
                  )}
                  {event.services.womenSection && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Users className="w-3 h-3 text-emerald-600" />
                      ویژه خواهران و برادران
                    </span>
                  )}
                  {event.services.shovadoonActive && (
                    <span className="text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Warehouse className="w-3 h-3 text-[#B4552D]" />
                      برگزاری در شوادون کهن
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#F2ECE1] relative">
                  <div className="flex-1 relative">
                    <button
                      onClick={() => setActiveRoutingEventId(isMenuOpen ? null : event.id)}
                      className="w-full flex items-center justify-center gap-1.5 bg-[#0E7C86] hover:bg-[#0a5d65] text-white py-2 px-3 rounded-xl text-xs font-bold"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#E5B555]" />
                      <span>مسیریابی سریع</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute bottom-full mb-1 right-0 left-0 bg-white rounded-2xl p-2 border border-[#DDD5C5] shadow-xl z-20">
                        <div className="grid grid-cols-3 gap-1 text-center text-xs font-bold">
                          <a href={routing.neshan} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-[#F7F3EC] text-[#185ADB]">نشان</a>
                          <a href={routing.balad} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-[#F7F3EC] text-[#00A859]">بلد</a>
                          <a href={routing.googleMaps} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-[#F7F3EC] text-[#EA4335]">گوگل</a>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onToggleReminder(event.id, event.title)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isReminderSet
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-[#F7F3EC] text-[#52525B] border-[#DDD5C5] hover:bg-white hover:text-[#0E7C86]'
                    }`}
                  >
                    {isReminderSet ? <BellRing className="w-3.5 h-3.5 text-amber-600" /> : <Bell className="w-3.5 h-3.5" />}
                    <span>{isReminderSet ? 'یادآور فعال' : 'یادآوری'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

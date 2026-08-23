import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  MapPin, 
  Radio, 
  Utensils, 
  Users, 
  Warehouse, 
  Navigation, 
  Bell, 
  BellRing, 
  Share2, 
  Mic2, 
  Sparkles, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { EventItem, Place } from '../types';
import { toPersianDigits, getRoutingLinks } from '../utils/persianUtils';

interface LiveEventsFeedProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onOpenPlaceDetailById: (placeId: string) => void;
  savedReminderIds: string[];
  onToggleReminder: (eventId: string, eventTitle: string) => void;
}

export const LiveEventsFeed: React.FC<LiveEventsFeedProps> = ({
  events,
  onSelectEvent,
  onOpenPlaceDetailById,
  savedReminderIds,
  onToggleReminder
}) => {
  const [activeRoutingMenuEventId, setActiveRoutingMenuEventId] = useState<string | null>(null);

  // Filter tonight & today events first
  const sortedEvents = [...events].sort((a, b) => (b.isToday ? 1 : 0) - (a.isToday ? 1 : 0));

  return (
    <section className="my-5 sm:my-7">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B4552D]/10 dark:bg-amber-500/10 text-[#B4552D] dark:text-amber-400 flex items-center justify-center animate-pulse">
            <Flame className="w-4 h-4 text-[#B4552D] dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#1F2430] dark:text-slate-100">نبض شهر: مراسمات امشب دزفول</h2>
              <span className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                پخش زنده و حضوری
              </span>
            </div>
            <p className="text-[11px] text-[#71717A] dark:text-slate-400">اطلاع‌رسانی لحظه‌ای هیئات، مساجد، دعای کمیل و محافل قرآنی</p>
          </div>
        </div>

        <span className="text-xs font-bold text-[#0E7C86] dark:text-teal-400 bg-[#0E7C86]/10 dark:bg-teal-950/40 px-2.5 py-1 rounded-xl">
          {toPersianDigits(events.length)} مراسم فعال
        </span>
      </div>

      {/* Events Card List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {sortedEvents.map((event) => {
          const isHussainiya = event.placeType === 'hussainiya';
          const isShrine = event.placeType === 'shrine';
          const isReminderSet = savedReminderIds.includes(event.id);
          const routingLinks = getRoutingLinks(event.coordinates[0], event.coordinates[1], event.placeName);
          const isRoutingMenuOpen = activeRoutingMenuEventId === event.id;

          const avatarBg = isHussainiya
            ? 'bg-[#B4552D] text-white'
            : isShrine
            ? 'bg-amber-600 text-white'
            : 'bg-[#0E7C86] text-white';

          return (
            <div
              key={event.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-4.5 border border-[#E0D8C8] dark:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group"
            >
              {/* Top Row: Mosque Avatar & Time Badge */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div 
                  onClick={() => onOpenPlaceDetailById(event.placeId)}
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
                >
                  <div className={`w-10 h-10 rounded-2xl ${avatarBg} flex items-center justify-center font-black text-sm shrink-0 shadow-xs`}>
                    {event.placeName.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1F2430] dark:text-slate-100 hover:text-[#0E7C86] dark:hover:text-teal-400 transition-colors line-clamp-1">
                      {event.placeName}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-[#71717A] dark:text-slate-400">
                      <MapPin className="w-3 h-3 text-[#B4552D] dark:text-amber-400" />
                      <span>{event.neighborhood}</span>
                    </div>
                  </div>
                </div>

                {/* Time Badge */}
                <div className="flex items-center gap-1 bg-[#F7F3EC] dark:bg-slate-700/60 border border-[#DDD5C5] dark:border-slate-600 text-[#B4552D] dark:text-amber-400 px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{event.timeBadge}</span>
                </div>
              </div>

              {/* Event Title */}
              <div className="my-1.5">
                <h3 className="text-sm sm:text-base font-extrabold text-[#1F2430] dark:text-slate-100 leading-snug">
                  {event.title}
                </h3>

                {/* Speaker and Eulogist if present */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2 text-xs text-[#52525B] dark:text-slate-300">
                  {event.speaker && (
                    <div className="flex items-center gap-1">
                      <span className="text-[#0E7C86] dark:text-teal-400 font-bold">سخنران:</span>
                      <span className="font-semibold text-[#1F2430] dark:text-slate-100">{event.speaker}</span>
                    </div>
                  )}
                  {event.eulogist && (
                    <div className="flex items-center gap-1">
                      <span className="text-[#B4552D] dark:text-amber-400 font-bold">مداح:</span>
                      <span className="font-semibold text-[#1F2430] dark:text-slate-100">{event.eulogist}</span>
                    </div>
                  )}
                  {event.qari && (
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">قاری:</span>
                      <span className="font-semibold text-[#1F2430] dark:text-slate-100">{event.qari}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service & Facility Badges */}
              <div className="flex flex-wrap items-center gap-1.5 my-2.5 pt-2 border-t border-[#F2ECE1] dark:border-slate-700/60">
                {event.services.nazri && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-lg">
                    <Utensils className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>دارای نذری و پذیرایی</span>
                  </span>
                )}
                {event.services.womenSection && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 px-2 py-0.5 rounded-lg">
                    <Users className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>ویژه بانوان و آقایان</span>
                  </span>
                )}
                {event.services.liveStream && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700 px-2 py-0.5 rounded-lg">
                    <Radio className="w-3 h-3 text-red-600 dark:text-red-400 animate-pulse" />
                    <span>پخش زنده</span>
                  </span>
                )}
                {event.services.shovadoonActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-stone-100 dark:bg-slate-700 text-stone-800 dark:text-slate-200 border border-stone-300 dark:border-slate-600 px-2 py-0.5 rounded-lg">
                    <Warehouse className="w-3 h-3 text-[#B4552D] dark:text-amber-400" />
                    <span>برگزاری در شوادون</span>
                  </span>
                )}
              </div>

              {/* Action Buttons: 1. Routing 2. Reminder */}
              <div className="flex items-center gap-2 mt-1 relative">
                {/* Routing Button with Dropdown Trigger */}
                <div className="flex-1 relative">
                  <button
                    onClick={() => setActiveRoutingMenuEventId(isRoutingMenuOpen ? null : event.id)}
                    className="w-full flex items-center justify-center gap-1.5 bg-[#0E7C86] hover:bg-[#0b636b] dark:bg-teal-600 dark:hover:bg-teal-700 text-white text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl shadow-xs transition-all active:scale-[0.98]"
                  >
                    <Navigation className="w-4 h-4 text-[#E5B555]" />
                    <span>مسیریابی به مکان</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isRoutingMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Routing Apps Dropdown */}
                  {isRoutingMenuOpen && (
                    <div className="absolute bottom-full mb-1 right-0 left-0 bg-white dark:bg-slate-800 rounded-2xl p-2 border border-[#DDD5C5] dark:border-slate-700 shadow-xl z-30 animate-fadeIn">
                      <div className="text-[11px] font-bold text-[#71717A] dark:text-slate-400 px-2 py-1 border-b border-[#F2ECE1] dark:border-slate-700 mb-1">
                        انتخاب مسیریاب مورد نظر:
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <a
                          href={routingLinks.neshan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl hover:bg-[#F7F3EC] dark:hover:bg-slate-700 text-xs font-bold text-[#1F2430] dark:text-slate-200 flex flex-col items-center gap-1 transition-colors"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#185ADB] text-white flex items-center justify-center text-[10px]">ن</span>
                          <span>نشان</span>
                        </a>
                        <a
                          href={routingLinks.balad}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl hover:bg-[#F7F3EC] dark:hover:bg-slate-700 text-xs font-bold text-[#1F2430] dark:text-slate-200 flex flex-col items-center gap-1 transition-colors"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#00A859] text-white flex items-center justify-center text-[10px]">ب</span>
                          <span>بلد</span>
                        </a>
                        <a
                          href={routingLinks.googleMaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl hover:bg-[#F7F3EC] dark:hover:bg-slate-700 text-xs font-bold text-[#1F2430] dark:text-slate-200 flex flex-col items-center gap-1 transition-colors"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#EA4335] text-white flex items-center justify-center text-[10px]">G</span>
                          <span>گوگل</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reminder Button */}
                <button
                  onClick={() => onToggleReminder(event.id, event.title)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all active:scale-[0.98] ${
                    isReminderSet
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100 shadow-xs'
                      : 'bg-[#F7F3EC] dark:bg-slate-700/60 text-[#52525B] dark:text-slate-300 border-[#DDD5C5] dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 hover:border-[#0E7C86] hover:text-[#0E7C86]'
                  }`}
                  title={isReminderSet ? 'یادآوری تنظیم شد' : 'یادآوری کن'}
                >
                  {isReminderSet ? (
                    <>
                      <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-600/20" />
                      <span className="hidden xs:inline">یادآور فعال</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span className="hidden xs:inline">یادآوری کن</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

};

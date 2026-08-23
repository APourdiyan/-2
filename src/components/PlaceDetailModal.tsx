import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Clock, 
  Warehouse, 
  Users, 
  Accessibility, 
  BookOpen, 
  Radio, 
  Car, 
  Wind, 
  Share2, 
  Navigation, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown
} from 'lucide-react';
import { Place, EventItem } from '../types';
import { toPersianDigits, getRoutingLinks } from '../utils/persianUtils';

interface PlaceDetailModalProps {
  place: Place | null;
  events: EventItem[];
  onClose: () => void;
  onSelectEvent: (event: EventItem) => void;
  onToggleReminder: (eventId: string, title: string) => void;
  savedReminderIds: string[];
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  events,
  onClose,
  onSelectEvent,
  onToggleReminder,
  savedReminderIds
}) => {
  if (!place) return null;

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'events' | 'shovadoon'>('info');

  const placeEvents = events.filter((e) => e.placeId === place.id);
  const routing = getRoutingLinks(place.coordinates[0], place.coordinates[1], place.name);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: `اطلاعات و برنامه‌های ${place.name} در سامانه نقشه مذهبی دزفول`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Box */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden z-10 animate-slideUp border border-transparent dark:border-slate-700">
        {/* Top Handle for mobile */}
        <div className="sm:hidden w-12 h-1.5 bg-[#DDD5C5] dark:bg-slate-600 rounded-full mx-auto my-2" />

        {/* Cover Image & Header Controls */}
        <div className="relative h-52 sm:h-64 w-full bg-[#ECE4D4] dark:bg-slate-900 shrink-0">
          <img
            src={place.image}
            alt={place.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />


          {/* Top Actions */}
          <div className="absolute top-3 right-3 left-3 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-transform active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center gap-1 text-xs font-bold transition-transform active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'کپی شد!' : 'اشتراک‌گذاری'}</span>
              </button>
            </div>
          </div>

          {/* Place Title on Cover */}
          <div className="absolute bottom-3 right-3 left-3 z-10 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                place.type === 'hussainiya' ? 'bg-[#B4552D]' : 'bg-[#0E7C86]'
              }`}>
                {place.type === 'mosque' ? 'مسجد' : place.type === 'shrine' ? 'آستانه متبرکه' : 'حسینیه'}
              </span>
              {place.isHistorical && (
                <span className="text-[11px] font-bold bg-[#E5B555] text-[#1F2430] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  اثر تاریخی دزفول
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{place.name}</h2>
            <div className="flex items-center gap-1.5 text-xs text-white/85 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#E5B555]" />
              <span>{place.neighborhood}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E0D8C8] dark:border-slate-700 bg-[#F7F3EC] dark:bg-slate-800/80 px-4 py-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'info'
                ? 'bg-[#0E7C86] dark:bg-teal-600 text-white shadow-xs'
                : 'text-[#52525B] dark:text-slate-400 hover:text-[#1F2430] dark:hover:text-slate-200'
            }`}
          >
            اطلاعات و امکانات
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'events'
                ? 'bg-[#0E7C86] dark:bg-teal-600 text-white shadow-xs'
                : 'text-[#52525B] dark:text-slate-400 hover:text-[#1F2430] dark:hover:text-slate-200'
            }`}
          >
            <span>مراسمات و رویدادها</span>
            {placeEvents.length > 0 && (
              <span className="bg-[#B4552D] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {toPersianDigits(placeEvents.length)}
              </span>
            )}
          </button>
          {place.features.shovadoon && (
            <button
              onClick={() => setActiveTab('shovadoon')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'shovadoon'
                  ? 'bg-[#B4552D] text-white shadow-xs'
                  : 'text-[#B4552D] dark:text-amber-400 bg-[#B4552D]/10 dark:bg-amber-500/10 hover:bg-[#B4552D]/20'
              }`}
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>شوادون کهن</span>
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-[#1F2430] dark:text-slate-100">
          {activeTab === 'info' && (
            <>
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-2xl bg-[#F7F3EC] dark:bg-slate-700/50 border border-[#DDD5C5] dark:border-slate-600">
                  <div className="text-[10px] text-[#71717A] dark:text-slate-400 mb-0.5">وضعیت پذیرش</div>
                  <div className="font-bold flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {place.isCurrentlyOpen ? 'هم‌اکنون باز است' : 'بسته'}
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#F7F3EC] dark:bg-slate-700/50 border border-[#DDD5C5] dark:border-slate-600">
                  <div className="text-[10px] text-[#71717A] dark:text-slate-400 mb-0.5">ساعات فعالیت</div>
                  <div className="font-bold text-[#1F2430] dark:text-slate-100 truncate">{place.openingHours}</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#F7F3EC] dark:bg-slate-700/50 border border-[#DDD5C5] dark:border-slate-600 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-[#71717A] dark:text-slate-400 mb-0.5">ظرفیت شبستان</div>
                  <div className="font-bold text-[#1F2430] dark:text-slate-100">
                    {toPersianDigits(place.capacity)} نفر
                  </div>
                </div>
              </div>

              {/* Description & History */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#0E7C86] dark:text-teal-400">معرفی و تاریخچه:</h4>
                <p className="text-xs sm:text-sm text-[#4B5563] dark:text-slate-300 leading-relaxed">
                  {place.description}
                </p>
                {place.historySummary && (
                  <div className="p-3 rounded-2xl bg-[#FFF8EB] dark:bg-amber-950/30 border border-[#E5B555]/30 dark:border-amber-700/50 text-xs text-[#78350F] dark:text-amber-300 leading-relaxed">
                    <span className="font-bold">قدمت تاریخی: </span>
                    {place.historySummary} ({place.establishedYear})
                  </div>
                )}
              </div>

              {/* Facilities Checklist */}
              <div>
                <h4 className="text-xs font-bold text-[#1F2430] dark:text-slate-100 mb-2.5">امکانات و خدمات رفاهی:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    place.features.ladiesSection ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300' : 'bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500'
                  }`}>
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>بخش مجزای بانوان</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    place.features.wheelchairAccess ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300' : 'bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500'
                  }`}>
                    <Accessibility className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>دسترسی مناسب معلولین</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    place.features.quranClasses ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300' : 'bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500'
                  }`}>
                    <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>کانون و جلسات قرآنی</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    place.features.liveBroadcast ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300' : 'bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500'
                  }`}>
                    <Radio className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>سیستم پخش زنده</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    place.features.parking ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300' : 'bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500'
                  }`}>
                    <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>پارکینگ وسایل نقلیه</span>
                  </div>

                  <div className="p-2.5 rounded-xl border bg-cyan-50/50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-300 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
                    <span className="truncate">{place.features.coolingSystem}</span>
                  </div>
                </div>
              </div>

              {/* Address & Phone */}
              <div className="p-3 rounded-2xl bg-[#F7F3EC] dark:bg-slate-700/50 border border-[#DDD5C5] dark:border-slate-600 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-[#1F2430] dark:text-slate-100">
                  <MapPin className="w-4 h-4 text-[#B4552D] dark:text-amber-400 shrink-0" />
                  <span>{place.address}</span>
                </div>
                {place.phone && (
                  <div className="flex items-center gap-2 text-[#52525B] dark:text-slate-300">
                    <Phone className="w-4 h-4 text-[#0E7C86] dark:text-teal-400 shrink-0" />
                    <span dir="ltr">{place.phone}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'events' && (
            <div className="space-y-3">
              {placeEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#71717A] dark:text-slate-400">
                  در حال حاضر مراسم ثبت‌شده‌ای برای امروز ثبت نشده است.
                </div>
              ) : (
                placeEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3.5 rounded-2xl bg-[#F7F3EC] dark:bg-slate-700/50 border border-[#DDD5C5] dark:border-slate-600 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#B4552D] bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-[#DDD5C5] dark:border-slate-600">
                        {event.timeBadge}
                      </span>
                      <button
                        onClick={() => onToggleReminder(event.id, event.title)}
                        className="text-[#0E7C86] dark:text-teal-400 font-bold hover:underline"
                      >
                        {savedReminderIds.includes(event.id) ? '✓ یادآور فعال' : '+ تنظیم یادآوری'}
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-[#1F2430] dark:text-slate-100">{event.title}</h4>
                    {event.speaker && <div className="text-[#52525B] dark:text-slate-300">سخنران: {event.speaker}</div>}
                    {event.eulogist && <div className="text-[#52525B] dark:text-slate-300">مداح: {event.eulogist}</div>}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'shovadoon' && (
            <div className="space-y-3 text-xs leading-relaxed text-[#4B5563] dark:text-slate-300">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/50">
                <h4 className="text-sm font-bold text-[#B4552D] dark:text-amber-400 mb-1 flex items-center gap-1.5">
                  <Warehouse className="w-4 h-4" />
                  شوادون دزفول؛ شاهکار معماری اقلیمی
                </h4>
                <p>
                  این مکان دارای شوادون کهن دستکند با عمق تقریبی{' '}
                  <span className="font-bold text-[#1F2430] dark:text-slate-100">
                    {toPersianDigits(place.features.shovadoonDepthMeters || 12)} متر
                  </span>{' '}
                  است. شوادون‌ها در تابستان‌های بالای ۵۰ درجه دزفول دمایی معادل ۲۲ تا ۲۵ درجه سانتی‌گراد بدون نیاز به مصرف برق فراهم می‌کنند.
                </p>
              </div>
              <p>
                در ایام ماه مبارک رمضان، شب‌های جمعه و اعتکاف تابستانه، مراسمات و جلسات جزءخوانی قرآن در فضای شوادون این مکان برگزار می‌گردد.
              </p>
            </div>
          )}
        </div>

        {/* Sticky Routing Footer */}
        <div className="p-3.5 bg-white dark:bg-slate-800 border-t border-[#E0D8C8] dark:border-slate-700 flex items-center gap-2 shrink-0">
          <a
            href={routing.neshan}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#0E7C86] hover:bg-[#0a5d65] dark:bg-teal-600 dark:hover:bg-teal-700 text-white py-2.5 px-3 rounded-2xl text-xs font-bold shadow-sm transition-all"
          >
            <Navigation className="w-4 h-4 text-[#E5B555]" />
            <span>مسیریابی با نشان</span>
          </a>
          <a
            href={routing.balad}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#B4552D] hover:bg-[#964220] dark:bg-amber-600 dark:hover:bg-amber-700 text-white py-2.5 px-3 rounded-2xl text-xs font-bold shadow-sm transition-all"
          >
            <span>مسیریابی با بلد</span>
          </a>
          <a
            href={routing.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-2xl bg-[#F7F3EC] dark:bg-slate-700 border border-[#DDD5C5] dark:border-slate-600 text-[#1F2430] dark:text-slate-100 hover:bg-white text-xs font-bold"
            title="Google Maps"
          >
            گوگل‌مپ
          </a>
        </div>
      </div>
    </div>
  );
};

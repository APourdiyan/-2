import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Phone,
  Share2,
  Navigation,
  Warehouse,
  Car,
  Users,
  Accessibility,
  Droplets,
  Clock,
  Info,
  Calendar,
  ChevronDown,
  Bookmark,
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Place, EventItem } from '../../types';
import {
  toPersianDigits,
  getRoutingLinks,
  calculateDistanceMeters,
  formatDistance
} from '../../utils/persianUtils';
import { useToast } from '../common/Toast';

export interface PlaceDetailPageProps {
  place: Place;
  events?: EventItem[];
  userCoords?: [number, number] | null;
  onBack?: () => void;
}

export const PlaceDetailPage: React.FC<PlaceDetailPageProps> = ({
  place,
  events = [],
  userCoords,
  onBack
}) => {
  const { showToast } = useToast();
  const [activeAccordion, setActiveAccordion] = useState<string | null>('address');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dezful_saved_places');
      const list = saved ? JSON.parse(saved) : [];
      return list.includes(place.id);
    } catch {
      return false;
    }
  });

  const toggleBookmark = () => {
    try {
      const saved = localStorage.getItem('dezful_saved_places');
      let list = saved ? JSON.parse(saved) : [];
      if (list.includes(place.id)) {
        list = list.filter((id: string) => id !== place.id);
        setIsBookmarked(false);
        showToast('از ذخیره‌ها حذف شد', 'info');
      } else {
        list.push(place.id);
        setIsBookmarked(true);
        showToast('به مکان‌های ذخیره‌شده اضافه شد', 'success');
      }
      localStorage.setItem('dezful_saved_places', JSON.stringify(list));
    } catch {
      // silent
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: `${place.name} - واقع در محله ${place.neighborhood} دزفول`,
          url: window.location.href
        });
      } catch {
        // user cancel
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('لینک صفحه در کلیپ‌بورد کپی شد', 'success');
    }
  };

  const isHussainiya = place.type === 'hussainiya';
  const isShrine = place.type === 'shrine';
  const routingLinks = getRoutingLinks(
    place.coordinates[0],
    place.coordinates[1],
    place.name
  );

  let distStr = '';
  if (userCoords) {
    const d = calculateDistanceMeters(
      userCoords[0],
      userCoords[1],
      place.coordinates[0],
      place.coordinates[1]
    );
    distStr = formatDistance(d);
  }

  const featuresList = [
    {
      id: 'shovadoon',
      label: 'شوادون تاریخی',
      active: place.features.shovadoon,
      icon: Warehouse,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'parking',
      label: 'پارکینگ خودرو',
      active: place.features.parking,
      icon: Car,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'ladiesSection',
      label: 'بخش مجزای بانوان',
      active: place.features.ladiesSection,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800'
    },
    {
      id: 'wheelchairAccess',
      label: 'مناسب ویلچر / معلولین',
      active: place.features.wheelchairAccess,
      icon: Accessibility,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'wuduFacilities',
      label: 'وضوخانه و سرویس بهداشتی',
      active: place.features.wuduFacilities,
      icon: Droplets,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800'
    }
  ];

  const placeEvents = events.filter((e) => e.placeId === place.id);

  return (
    <div
      id={`place-detail-page-${place.id}`}
      className="max-w-4xl mx-auto space-y-6 font-['Vazirmatn'] pb-12 select-none"
      dir="rtl"
    >
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 transition-colors shadow-2xs"
        >
          <ChevronRight className="w-4 h-4" />
          <span>بازگشت به نقشه</span>
        </button>
      )}

      {/* ۱. بخش بالا: تصویر شاخص، عنوان، وضعیت */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-md">
        <div className="relative h-56 md:h-72 w-full bg-stone-200 dark:bg-slate-800">
          <img
            src={place.image || 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=800&auto=format&fit=crop&q=80'}
            alt={place.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-extrabold backdrop-blur-md ${
                  isHussainiya
                    ? 'bg-amber-500/90 text-white'
                    : isShrine
                    ? 'bg-teal-500/90 text-white'
                    : 'bg-emerald-600/90 text-white'
                }`}
              >
                {isHussainiya ? 'حسینیه' : isShrine ? 'بقعه متبرکه' : 'مسجد'}
              </span>
              {place.isHistorical && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#C26D47]/90 text-white backdrop-blur-md">
                  بافت کهن دزفول
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleBookmark}
                aria-label="نشان کردن"
                className="w-10 h-10 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                aria-label="اشتراک‌گذاری"
                className="w-10 h-10 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 left-4 text-white z-10">
            <h1 className="text-xl md:text-3xl font-black mb-1.5 leading-tight">
              {place.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-stone-200">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#C26D47]" />
                <span>محله {place.neighborhood}</span>
              </span>
              {distStr && (
                <span className="px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-emerald-300 font-bold">
                  فاصله: {distStr}
                </span>
              )}
              <span className="flex items-center gap-1 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{place.isCurrentlyOpen ? 'دایر و باز' : 'اقامه نماز در اوقات شرعی'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ۲. دکمه‌های ناوبری با اپلیکیشن‌های مسیریابی */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#0E7C86]" />
          <span>مسیریابی با اپلیکیشن‌های نقشه</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* نشان (سبز) */}
          <a
            href={routingLinks.neshan}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-[#00C853]/10 hover:bg-[#00C853]/20 border border-[#00C853]/30 text-[#00C853] dark:text-[#00E676] font-bold text-xs md:text-sm transition-all active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-[#00C853] text-white flex items-center justify-center text-[10px] font-black">
              ن
            </div>
            <span>مسیریاب نشان</span>
          </a>

          {/* بلد (آبی) */}
          <a
            href={routingLinks.balad}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-[#1E88E5]/10 hover:bg-[#1E88E5]/20 border border-[#1E88E5]/30 text-[#1E88E5] dark:text-[#42A5F5] font-bold text-xs md:text-sm transition-all active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-[10px] font-black">
              ب
            </div>
            <span>مسیریاب بلد</span>
          </a>

          {/* گوگل مپ (رنگی) */}
          <a
            href={routingLinks.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-[#EA4335]/10 hover:bg-[#EA4335]/20 border border-[#EA4335]/30 text-[#EA4335] dark:text-[#FF8A80] font-bold text-xs md:text-sm transition-all active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-[#EA4335] text-white flex items-center justify-center text-[10px] font-black">
              G
            </div>
            <span>Google Maps</span>
          </a>

          {/* ویز (بنفش/آبی) */}
          <a
            href={`https://waze.com/ul?ll=${place.coordinates[0]},${place.coordinates[1]}&navigate=yes`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-[#33CCFF]/10 hover:bg-[#33CCFF]/20 border border-[#33CCFF]/30 text-[#0099CC] dark:text-[#80D8FF] font-bold text-xs md:text-sm transition-all active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-[#33CCFF] text-stone-900 flex items-center justify-center text-[10px] font-black">
              W
            </div>
            <span>Waze</span>
          </a>
        </div>

        {place.phone && (
          <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-slate-800">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              شماره تماس مستقیم دفتر / خادم:
            </span>
            <a
              href={`tel:${place.phone}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-[#0E7C86] font-bold text-xs hover:bg-[#0E7C86] hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span dir="ltr">{toPersianDigits(place.phone)}</span>
            </a>
          </div>
        )}
      </div>

      {/* ۳. بخش امکانات */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C26D47]" />
          <span>امکانات و ویژگی‌های ساختمانی</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {featuresList.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.id}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                  f.active
                    ? f.color
                    : 'bg-stone-50 dark:bg-slate-800/40 border-stone-200/60 dark:border-slate-800 text-stone-400 opacity-60'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold leading-tight">{f.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ۴. مراسمات این مکان */}
      {placeEvents.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0E7C86]" />
            <span>برنامه مراسمات و هیئات مذهبی</span>
          </h3>

          <div className="space-y-2.5">
            {placeEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900 dark:text-white">
                      {ev.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#0E7C86]/10 text-[#0E7C86] text-[10px] font-bold">
                      {ev.timeBadge}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    با نوای / سخنرانی: {ev.speaker || ev.eulogist || 'مادحین اهل بیت (ع)'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
                  <Clock className="w-3.5 h-3.5 text-[#C26D47]" />
                  <span>{ev.dayOfWeek} - ساعت {toPersianDigits(ev.timeStr)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ۵. آکاردئون اطلاعات بیشتر */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#C26D47]" />
          <span>اطلاعات تکمیلی و تاریخچه</span>
        </h3>

        <div className="space-y-2">
          <div className="border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setActiveAccordion(activeAccordion === 'address' ? null : 'address')}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-slate-800/60 flex items-center justify-between text-xs md:text-sm font-bold text-stone-800 dark:text-stone-200"
            >
              <span>آدرس دقیق و دسترسی</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeAccordion === 'address' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {activeAccordion === 'address' && (
              <div className="p-4 text-xs md:text-sm text-stone-600 dark:text-stone-300 bg-white dark:bg-slate-900 leading-relaxed">
                {place.address}
              </div>
            )}
          </div>

          {(place.historySummary || place.description) && (
            <div className="border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'history' ? null : 'history')}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-slate-800/60 flex items-center justify-between text-xs md:text-sm font-bold text-stone-800 dark:text-stone-200"
              >
                <span>قدمت تاریخی و هویت معماری</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    activeAccordion === 'history' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {activeAccordion === 'history' && (
                <div className="p-4 text-xs md:text-sm text-stone-600 dark:text-stone-300 bg-white dark:bg-slate-900 leading-relaxed">
                  {place.historySummary || place.description}
                </div>
              )}
            </div>
          )}

          <div className="border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setActiveAccordion(activeAccordion === 'hours' ? null : 'hours')}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-slate-800/60 flex items-center justify-between text-xs md:text-sm font-bold text-stone-800 dark:text-stone-200"
            >
              <span>ساعات اقامه نماز جماعت و باز بودن درب‌ها</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeAccordion === 'hours' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {activeAccordion === 'hours' && (
              <div className="p-4 text-xs md:text-sm text-stone-600 dark:text-stone-300 bg-white dark:bg-slate-900 space-y-1.5">
                <p>• {place.openingHours}</p>
                <p>• ظرفیت تخمینی: {toPersianDigits(place.capacity)} نفر</p>
                {place.imamOrCustodian && <p>• امام جماعت / تولیت: {place.imamOrCustodian}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  Phone, 
  Share2, 
  Bookmark, 
  Navigation as NavigationIcon, 
  Sparkles, 
  Building2, 
  Warehouse, 
  Users, 
  Calendar, 
  ChevronDown, 
  BookOpen, 
  Accessibility, 
  Droplets, 
  Car, 
  Radio
} from 'lucide-react';
import { INITIAL_PLACES, INITIAL_EVENTS } from '../data/dezfulData';
import { Place, EventItem } from '../types';
import { 
  toPersianDigits, 
  getRoutingLinks, 
  calculateDistanceMeters, 
  formatDistance 
} from '../utils/persianUtils';
import { useAppStore } from '../store/appStore';
import { Navigation } from '../components/Navigation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useToast } from '../components/common/Toast';

/**
 * صفحه جزئیات کامل مسجد، حسینیه یا بقعه متبرکه در دزفول
 */
export const PlaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userLocation, toggleDarkMode } = useAppStore();
  const { showToast } = useToast();

  useKeyboardShortcuts({
    onOpenSearch: () => navigate('/search'),
    onCloseModals: () => navigate(-1),
    onNavigateToMap: () => navigate('/?tab=map'),
    onNavigateToEvents: () => navigate('/calendar'),
    onNavigateToHome: () => navigate('/'),
    onToggleDarkMode: () => toggleDarkMode()
  });

  const [place, setPlace] = useState<Place | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [allEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('dezful_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('address');

  useEffect(() => {
    const savedPlaces: Place[] = (() => {
      const saved = localStorage.getItem('dezful_places');
      return saved ? JSON.parse(saved) : INITIAL_PLACES;
    })();

    const found = savedPlaces.find((p) => p.id === id);
    if (found) {
      setPlace(found);
      const placeEvs = allEvents.filter((e) => e.placeId === found.id);
      setEvents(placeEvs);
    }

    try {
      const saved = localStorage.getItem('dezful_saved_places');
      const list: string[] = saved ? JSON.parse(saved) : [];
      if (id && list.includes(id)) {
        setIsSaved(true);
      }
    } catch {
      // silent
    }
  }, [id, allEvents]);

  if (!place) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 flex items-center justify-center font-['Vazirmatn'] p-4" dir="rtl">
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4 max-w-sm">
          <p className="text-sm font-bold text-stone-700 dark:text-stone-300">مکان مورد نظر یافت نشد.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-2xl bg-[#0E7C86] text-white text-xs font-bold"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  const toggleBookmark = () => {
    try {
      const saved = localStorage.getItem('dezful_saved_places');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(place.id)) {
        list = list.filter((pid) => pid !== place.id);
        setIsSaved(false);
        showToast('از نشان‌شده‌ها حذف شد', 'info');
      } else {
        list.push(place.id);
        setIsSaved(true);
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

  const routing = getRoutingLinks(place.coordinates[0], place.coordinates[1], place.name);

  let distStr = '';
  if (userLocation) {
    const d = calculateDistanceMeters(
      userLocation.lat,
      userLocation.lng,
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
      label: 'وضوخانه و سرویس',
      active: place.features.wuduFacilities,
      icon: Droplets,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800'
    },
    {
      id: 'liveBroadcast',
      label: 'پخش زنده مراسمات',
      active: place.features.liveBroadcast,
      icon: Radio,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 text-stone-900 dark:text-stone-100 flex flex-col font-['Vazirmatn'] select-none" dir="rtl">
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-12">
        {/* ۱. بخش بالا: تصویر + نام + نوع + وضعیت */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-md">
          <div className="relative h-64 md:h-80 w-full bg-stone-200 dark:bg-slate-800">
            <img
              src={place.image}
              alt={`تصویر ${place.name}`}
              loading="lazy"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 transition-all active:scale-95"
                title="بازگشت"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleBookmark}
                  aria-label="نشان کردن"
                  className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white transition-all active:scale-95"
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  aria-label="اشتراک‌گذاری"
                  className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white transition-all active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 left-4 text-white z-10 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black backdrop-blur-md ${
                    place.type === 'hussainiya'
                      ? 'bg-amber-500/90 text-white'
                      : place.type === 'shrine'
                      ? 'bg-teal-500/90 text-white'
                      : 'bg-emerald-600/90 text-white'
                  }`}
                >
                  {place.type === 'hussainiya' ? 'حسینیه' : place.type === 'shrine' ? 'بقعه متبرکه' : 'مسجد'}
                </span>
                {place.isHistorical && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#C26D47]/90 text-white backdrop-blur-md">
                    بافت کهن دزفول
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-3xl font-black">{place.name}</h1>

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

        {/* ۲. بخش وسط: دکمه‌های عملیاتی و مسیریابی با لوگوی واقعی اپلیکیشن‌ها */}
        <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <NavigationIcon className="w-4 h-4 text-[#0E7C86]" />
              <span>مسیریابی هوشمند با اپلیکیشن‌های نقشه</span>
            </h3>
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-[#0E7C86] font-bold text-xs hover:bg-[#0E7C86] hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>تماس ({toPersianDigits(place.phone)})</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* نشان (سبز) */}
            <a
              href={routing.neshan}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-[#00C853]/10 hover:bg-[#00C853]/20 border border-[#00C853]/30 text-[#00C853] dark:text-[#00E676] font-bold text-xs md:text-sm transition-all active:scale-95 shadow-2xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#00C853] text-white flex items-center justify-center text-xs font-black shadow-xs">
                ن
              </div>
              <span>مسیریاب نشان</span>
            </a>

            {/* بلد (آبی) */}
            <a
              href={routing.balad}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-[#1E88E5]/10 hover:bg-[#1E88E5]/20 border border-[#1E88E5]/30 text-[#1E88E5] dark:text-[#42A5F5] font-bold text-xs md:text-sm transition-all active:scale-95 shadow-2xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-xs font-black shadow-xs">
                ب
              </div>
              <span>مسیریاب بلد</span>
            </a>

            {/* گوگل مپ (رنگی) */}
            <a
              href={routing.googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-[#EA4335]/10 hover:bg-[#EA4335]/20 border border-[#EA4335]/30 text-[#EA4335] dark:text-[#FF8A80] font-bold text-xs md:text-sm transition-all active:scale-95 shadow-2xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#EA4335] text-white flex items-center justify-center text-xs font-black shadow-xs">
                G
              </div>
              <span>Google Maps</span>
            </a>

            {/* ویز (بنفش/آبی) */}
            <a
              href={`https://waze.com/ul?ll=${place.coordinates[0]},${place.coordinates[1]}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-[#33CCFF]/10 hover:bg-[#33CCFF]/20 border border-[#33CCFF]/30 text-[#0099CC] dark:text-[#80D8FF] font-bold text-xs md:text-sm transition-all active:scale-95 shadow-2xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#33CCFF] text-stone-900 flex items-center justify-center text-xs font-black shadow-xs">
                W
              </div>
              <span>Waze</span>
            </a>
          </div>
        </div>

        {/* ۳. بخش امکانات */}
        <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C26D47]" />
            <span>امکانات و ویژگی‌های ساختمانی و رفاهی</span>
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

        {/* ۴. بخش مراسمات این مکان */}
        {events.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0E7C86]" />
              <span>برنامه مراسمات و هیئات مذهبی این مکان</span>
            </h3>

            <div className="space-y-2.5">
              {events.map((ev) => (
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

        {/* ۵. بخش اطلاعات بیشتر: آکاردئون */}
        <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#C26D47]" />
            <span>اطلاعات تکمیلی، آدرس و پیشینه</span>
          </h3>

          <div className="space-y-2">
            {/* آدرس کامل */}
            <div className="border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'address' ? null : 'address')}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-slate-800/60 flex items-center justify-between text-xs md:text-sm font-bold text-stone-800 dark:text-stone-200"
              >
                <span>آدرس دقیق و دسترسی محلی</span>
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

            {/* پیشینه و تاریخچه */}
            {(place.historySummary || place.description) && (
              <div className="border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'history' ? null : 'history')}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-slate-800/60 flex items-center justify-between text-xs md:text-sm font-bold text-stone-800 dark:text-stone-200"
                >
                  <span>قدمت تاریخی و هویت معماری دزفول</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      activeAccordion === 'history' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeAccordion === 'history' && (
                  <div className="p-4 text-xs md:text-sm text-stone-600 dark:text-stone-300 bg-white dark:bg-slate-900 leading-relaxed space-y-2">
                    <p>{place.historySummary || place.description}</p>
                    {place.establishedYear && (
                      <p className="text-xs text-[#C26D47] font-bold">
                        دوره تاریخی ساخت: {place.establishedYear}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ساعات کاری و اقامه نماز */}
            <div className="border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'hours' ? null : 'hours')}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-slate-800/60 flex items-center justify-between text-xs md:text-sm font-bold text-stone-800 dark:text-stone-200"
              >
                <span>ساعات اقامه نماز و ظرفیت</span>
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
      </main>

      <Navigation
        activeTab="map"
        onTabChange={(tab) => {
          if (tab === 'home') navigate('/');
          else if (tab === 'calendar') navigate('/calendar');
          else if (tab === 'map') navigate('/?tab=map');
        }}
        todayEventsCount={allEvents.filter((e) => e.isToday || e.isTonight).length}
      />
    </div>
  );
};

export default PlaceDetailPage;

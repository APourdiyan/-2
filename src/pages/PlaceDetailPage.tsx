import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  Phone, 
  Share2, 
  Bookmark, 
  Navigation, 
  Sparkles, 
  Building2, 
  Warehouse, 
  Users, 
  Check, 
  X, 
  Calendar, 
  ChevronDown, 
  BookOpen, 
  Accessibility, 
  Droplets, 
  Car, 
  Layers, 
  HeartHandshake, 
  Bell, 
  BellRing, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { INITIAL_PLACES, INITIAL_EVENTS } from '../data/dezfulData';
import { Place, EventItem } from '../types';
import { 
  toPersianDigits, 
  getRoutingLinks, 
  DEZFUL_PRAYER_TIMES, 
  calculateDistanceMeters, 
  formatDistance 
} from '../utils/persianUtils';
import { useAppStore } from '../store/appStore';

/**
 * صفحه جزئیات کامل مسجد، حسینیه یا بقعه متبرکه در دزفول
 */
export const PlaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userLocation } = useAppStore();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isRoutingOpen, setIsRoutingOpen] = useState<boolean>(false);
  const [savedReminderIds, setSavedReminderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dezful_reminders');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // بارگذاری داده‌های مکان با هندلینگ کامل Loading و Error
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const storedPlaces: Place[] = JSON.parse(
        localStorage.getItem('dezful_places') || '[]'
      );
      const allPlaces = storedPlaces.length > 0 ? storedPlaces : INITIAL_PLACES;
      const found = allPlaces.find((p) => p.id === id);

      if (found) {
        setPlace(found);
      } else {
        setError('مکان مورد نظر در پایگاه داده مذهبی دزفول یافت نشد.');
      }
    } catch (err) {
      setError('خطا در خواندن اطلاعات مکان.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleReminder = (eventId: string, title: string) => {
    let updated: string[];
    if (savedReminderIds.includes(eventId)) {
      updated = savedReminderIds.filter((eId) => eId !== eventId);
      showToast(`یادآوری لغو شد.`);
    } else {
      updated = [...savedReminderIds, eventId];
      showToast(`یادآوری رویداد تنظیم شد.`);
    }
    setSavedReminderIds(updated);
    localStorage.setItem('dezful_reminders', JSON.stringify(updated));
  };

  const handleShare = async () => {
    if (!place) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: `${place.name} در محله ${place.neighborhood} دزفول`,
          url: window.location.href,
        });
      } catch (err) {
        // نادیده گرفتن لغو اشتراک‌گذاری
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('پیوند صفحه کپی شد.');
    }
  };

  // حالت بارگذاری
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#0E7C86] dark:border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-[#71717A] dark:text-slate-400">در حال بارگذاری مشخصات مکان...</p>
      </div>
    );
  }

  // حالت خطا
  if (error || !place) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E0D8C8] dark:border-slate-700 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-base font-black text-[#1F2430] dark:text-slate-100">{error || 'مکان پیدا نشد'}</h2>
          <p className="text-xs text-[#71717A] dark:text-slate-400">ممکن است شناسه مکان تغییر کرده یا حذف شده باشد.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#0E7C86] dark:bg-teal-600 text-white py-2.5 rounded-xl font-bold text-xs"
          >
            بازگشت به نقشه و خانه
          </button>
        </div>
      </div>
    );
  }

  const routing = getRoutingLinks(place.coordinates[0], place.coordinates[1], place.name);
  const distanceMeters = userLocation
    ? calculateDistanceMeters(userLocation.lat, userLocation.lng, place.coordinates[0], place.coordinates[1])
    : null;

  // رویدادهای مربوط به این مکان
  const storedEvents: EventItem[] = JSON.parse(
    localStorage.getItem('dezful_events') || '[]'
  );
  const allEvents = storedEvents.length > 0 ? storedEvents : INITIAL_EVENTS;
  const placeEvents = allEvents.filter((e) => e.placeId === place.id);

  // اماکن همسایه و نزدیک
  const nearbyPlaces = INITIAL_PLACES.filter(
    (p) => p.id !== place.id && (p.neighborhoodId === place.neighborhoodId || p.neighborhood === place.neighborhood)
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F7F3EC] dark:bg-slate-900 text-[#1F2430] dark:text-slate-100 pb-24 font-['Vazirmatn',sans-serif]">
      {/* پیام Toast */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1F2430] dark:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 animate-slideDown flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E5B555] animate-pulse"></span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ۱. هدر تصویری بزرگ */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-stone-900">
        <img
          src={place.image}
          alt={place.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2430] dark:from-slate-950 via-black/40 to-transparent" />

        {/* دکمه بازگشت بالا */}
        <div className="absolute top-4 right-4 left-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all"
            title="بازگشت"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all"
              title="اشتراک‌گذاری"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsSaved(!isSaved);
                showToast(!isSaved ? 'مکان به نشان‌شده‌ها افزوده شد.' : 'از نشان‌شده‌ها حذف شد.');
              }}
              className="w-10 h-10 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all"
              title="نشان کردن"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#E5B555] text-[#E5B555]' : ''}`} />
            </button>
          </div>
        </div>

        {/* عنوان و مشخصات روی تصویر */}
        <div className="absolute bottom-4 right-4 left-4 text-white space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg text-white ${
              place.type === 'hussainiya' ? 'bg-[#B4552D]' : 'bg-[#0E7C86]'
            }`}>
              {place.type === 'mosque' ? 'مسجد' : place.type === 'shrine' ? 'آستانه متبرکه' : 'حسینیه'}
            </span>
            {place.isHistorical && (
              <span className="bg-[#E5B555] text-[#1F2430] text-[10px] font-black px-2 py-0.5 rounded-lg">
                ★ اثر تاریخی شاخص
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
              place.isCurrentlyOpen ? 'bg-emerald-600 text-white' : 'bg-stone-700 text-white'
            }`}>
              {place.isCurrentlyOpen ? 'درب باز است' : 'هم‌اکنون بسته'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">{place.name}</h1>
          <div className="flex items-center gap-2 text-xs text-white/90">
            <MapPin className="w-3.5 h-3.5 text-[#E5B555]" />
            <span>محله {place.neighborhood}</span>
            {distanceMeters !== null && (
              <span>• فاصله از شما: {formatDistance(distanceMeters)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 mt-4 space-y-4">
        {/* ۲. نوار اقدام چسبان (Sticky Action Bar) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 sm:p-4 border border-[#E0D8C8] dark:border-slate-700 shadow-xs flex items-center gap-2 sticky top-3 z-30">
          <div className="flex-1 relative">
            <button
              onClick={() => setIsRoutingOpen(!isRoutingOpen)}
              className="w-full flex items-center justify-center gap-1.5 bg-[#0E7C86] hover:bg-[#0a5d65] dark:bg-teal-600 dark:hover:bg-teal-700 text-white py-2.5 px-3 rounded-2xl text-xs font-bold shadow-md transition-all"
            >
              <Navigation className="w-4 h-4 text-[#E5B555]" />
              <span>مسیریابی هوشمند</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isRoutingOpen && (
              <div className="absolute top-full mt-1.5 right-0 left-0 bg-white dark:bg-slate-800 rounded-2xl p-2 border border-[#DDD5C5] dark:border-slate-700 shadow-2xl z-40 grid grid-cols-3 gap-1 text-center text-xs font-bold animate-slideDown">
                <a href={routing.neshan} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-[#F7F3EC] dark:hover:bg-slate-700 text-[#185ADB] dark:text-blue-400">نشان</a>
                <a href={routing.balad} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-[#F7F3EC] dark:hover:bg-slate-700 text-[#00A859] dark:text-emerald-400">بلد</a>
                <a href={routing.googleMaps} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-[#F7F3EC] dark:hover:bg-slate-700 text-[#EA4335] dark:text-rose-400">گوگل</a>
              </div>
            )}
          </div>

          {place.phone ? (
            <a
              href={`tel:${place.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#F7F3EC] dark:bg-slate-700 hover:bg-[#E4DCB] dark:hover:bg-slate-600 text-[#1F2430] dark:text-slate-100 border border-[#DDD5C5] dark:border-slate-600 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all"
            >
              <Phone className="w-4 h-4 text-[#0E7C86] dark:text-teal-400" />
              <span>تماس ({toPersianDigits(place.phone)})</span>
            </a>
          ) : (
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#F7F3EC] dark:bg-slate-700 hover:bg-[#E4DCB] dark:hover:bg-slate-600 text-[#1F2430] dark:text-slate-100 border border-[#DDD5C5] dark:border-slate-600 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all"
            >
              <Share2 className="w-4 h-4 text-[#B4552D] dark:text-amber-400" />
              <span>ارسال به دوستان</span>
            </button>
          )}
        </div>

        {/* ۳. معرفی کوتاه و پیشینه */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E0D8C8] dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-sm font-black text-[#1F2430] dark:text-slate-100">
            <Building2 className="w-4 h-4 text-[#0E7C86] dark:text-teal-400" />
            <h2>معرفی و پیشینه تاریخی</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#52525B] dark:text-slate-300 leading-relaxed">
            {place.description}
          </p>
          {place.historySummary && (
            <div className="p-3 bg-[#F7F3EC] dark:bg-slate-700/60 rounded-2xl border border-[#DDD5C5] dark:border-slate-600 text-xs text-[#52525B] dark:text-slate-300 space-y-1">
              <span className="font-bold text-[#B4552D] dark:text-amber-400">قدمت و معماری: </span>
              <span>{place.historySummary}</span>
              {place.establishedYear && (
                <div className="text-[11px] text-[#71717A] dark:text-slate-400 mt-1 font-bold">
                  دوره ساخت: {place.establishedYear}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ۴. گرید امکانات (Features Grid) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E0D8C8] dark:border-slate-700 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-[#1F2430] dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E5B555]" />
            <span>امکانات و خدمات فعال</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {[
              { label: 'نماز جماعت یومیه', active: true, icon: Clock },
              { label: 'وضوخانه و سرویس', active: place.features.wuduFacilities, icon: Droplets },
              { label: 'بخش مجزای بانوان', active: place.features.ladiesSection, icon: Users },
              { label: 'پارکینگ خودرو', active: place.features.parking, icon: Car },
              { label: 'دسترسی سالمند و معلول', active: place.features.wheelchairAccess, icon: Accessibility },
              { label: 'کتابخانه مذهبی', active: place.features.library, icon: BookOpen },
              { label: 'کلاس قرآن و کانون', active: place.features.quranClasses, icon: BookOpen },
              { label: 'صندوق خیریه محلی', active: true, icon: HeartHandshake },
              { label: `شوادون سنتی (${toPersianDigits(place.features.shovadoonDepthMeters || 12)}م)`, active: place.features.shovadoon, icon: Warehouse },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between ${
                    f.active
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300 font-bold'
                      : 'bg-stone-50 dark:bg-slate-700/40 border-stone-200 dark:border-slate-700 text-stone-400 dark:text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${f.active ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-slate-500'}`} />
                    <span className="truncate text-[11px]">{f.label}</span>
                  </div>
                  {f.active ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[3]" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ۵. ساعات نماز جماعت (۳ کارت صبح، ظهر، مغرب) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E0D8C8] dark:border-slate-700 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-[#1F2430] dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0E7C86] dark:text-teal-400" />
            <span>ساعات اقامه نماز جماعت</span>
          </h2>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-[#F7F3EC] dark:bg-slate-700/60 rounded-2xl border border-[#DDD5C5] dark:border-slate-600">
              <span className="text-[11px] text-[#71717A] dark:text-slate-400 block font-bold">صبح</span>
              <span className="text-sm font-black text-[#1F2430] dark:text-slate-100 mt-1 block">
                {toPersianDigits(DEZFUL_PRAYER_TIMES.fajr)}
              </span>
              <span className="text-[10px] text-[#0E7C86] dark:text-teal-400 font-bold">اقامه اول وقت</span>
            </div>

            <div className="p-3 bg-[#F7F3EC] dark:bg-slate-700/60 rounded-2xl border border-[#DDD5C5] dark:border-slate-600">
              <span className="text-[11px] text-[#71717A] dark:text-slate-400 block font-bold">ظهر و عصر</span>
              <span className="text-sm font-black text-[#1F2430] dark:text-slate-100 mt-1 block">
                {toPersianDigits(DEZFUL_PRAYER_TIMES.dhuhr)}
              </span>
              <span className="text-[10px] text-[#0E7C86] dark:text-teal-400 font-bold">همراه با تعقیبات</span>
            </div>

            <div className="p-3 bg-[#0E7C86]/10 dark:bg-teal-950/40 rounded-2xl border border-[#0E7C86] dark:border-teal-500 ring-1 ring-[#0E7C86] dark:ring-teal-500">
              <span className="text-[11px] text-[#0E7C86] dark:text-teal-300 block font-black">مغرب و عشاء (برجسته)</span>
              <span className="text-sm font-black text-[#1F2430] dark:text-slate-100 mt-1 block">
                {toPersianDigits(DEZFUL_PRAYER_TIMES.maghrib)}
              </span>
              <span className="text-[10px] text-[#B4552D] dark:text-amber-400 font-bold">نوبت بعدی</span>
            </div>
          </div>
        </div>

        {/* ۶. برنامه‌های هفتگی ثابت */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E0D8C8] dark:border-slate-700 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-[#1F2430] dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#B4552D] dark:text-amber-400" />
            <span>برنامه‌های ثابت هفتگی</span>
          </h2>

          <div className="space-y-2 text-xs">
            {[
              { day: 'شنبه‌ها', title: 'جلسه انس با قرآن کریم و آموزش قرائت', time: 'ساعت ۱۸:۳۰' },
              { day: 'یکشنبه‌ها', title: 'حلقه معرفتی و تربیتی صالحین جوانان', time: 'ساعت ۲۰:۰۰' },
              { day: 'سه‌شنبه‌ها', title: 'قرائت دعای پرفیض توسل', time: 'بعد از نماز عشاء' },
              { day: 'پنج‌شنبه‌ها', title: 'قرائت دعای کمیل و روضه‌خوانی هفتگی', time: 'ساعت ۲۱:۳۰', highlight: true },
              { day: 'جمعه‌ها', title: 'قرائت دعای ندبه و صرف صبحانه نذری', time: 'ساعت ۰۶:۳۰ صبح' },
            ].map((prog, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  prog.highlight
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-300 font-bold'
                    : 'bg-[#F7F3EC] dark:bg-slate-700/60 border-[#DDD5C5] dark:border-slate-600 text-[#52525B] dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[10px] font-black border border-[#DDD5C5] dark:border-slate-600 text-[#1F2430] dark:text-slate-200">
                    {prog.day}
                  </span>
                  <span className="font-bold">{prog.title}</span>
                </div>
                <span className="text-[11px] font-black text-[#0E7C86] dark:text-teal-400 shrink-0">
                  {toPersianDigits(prog.time)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ۷. مراسمات پیش‌رو */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E0D8C8] dark:border-slate-700 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-[#1F2430] dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0E7C86] dark:text-teal-400" />
            <span>مراسمات پیش‌رو در این مکان</span>
          </h2>

          {placeEvents.length === 0 ? (
            <div className="p-6 text-center bg-[#F7F3EC] dark:bg-slate-700/60 rounded-2xl text-xs text-[#71717A] dark:text-slate-400">
              در حال حاضر رویداد خاصی برای روزهای آینده ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-2.5">
              {placeEvents.map((ev) => {
                const isReminder = savedReminderIds.includes(ev.id);
                return (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-[#F7F3EC] dark:bg-slate-700/60 border border-[#DDD5C5] dark:border-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#B4552D] text-white px-2 py-0.5 rounded-md text-[10px] font-black">
                          {ev.timeBadge}
                        </span>
                        <h3 className="font-black text-[#1F2430] dark:text-slate-100">{ev.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#71717A] dark:text-slate-400 mt-1">
                        {ev.speaker && <span>سخنران: {ev.speaker}</span>}
                        {ev.eulogist && <span>مداح: {ev.eulogist}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleReminder(ev.id, ev.title)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                        isReminder
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-white dark:bg-slate-800 text-[#52525B] dark:text-slate-300 border-[#DDD5C5] dark:border-slate-600 hover:text-[#0E7C86]'
                      }`}
                    >
                      {isReminder ? <BellRing className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <Bell className="w-3.5 h-3.5" />}
                      <span>{isReminder ? 'یادآور فعال' : 'یادآوری'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ۸. نشانی و دسترسی محلی */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E0D8C8] dark:border-slate-700 shadow-xs space-y-2">
          <h2 className="text-sm font-black text-[#1F2430] dark:text-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#B4552D] dark:text-amber-400" />
            <span>نشانی دقیق و نشانه‌های شهری دزفول</span>
          </h2>
          <p className="text-xs text-[#52525B] dark:text-slate-300 font-bold">{place.address}</p>
          <div className="p-3 bg-[#F7F3EC] dark:bg-slate-700/60 rounded-2xl border border-[#DDD5C5] dark:border-slate-600 text-xs text-[#71717A] dark:text-slate-400 space-y-1">
            <p>• راهنمای دسترسی: دسترسی سریع از خیابان‌های اصلی و بافت کهن دزفول.</p>
            <p>• مختصات جغرافیایی: {toPersianDigits(place.coordinates[0])} , {toPersianDigits(place.coordinates[1])}</p>
          </div>
        </div>

        {/* ۹. اماکن نزدیک و همسایه */}
        {nearbyPlaces.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E0D8C8] dark:border-slate-700 shadow-xs space-y-3">
            <h2 className="text-sm font-black text-[#1F2430] dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0E7C86] dark:text-teal-400" />
              <span>مساجد و حسینیه‌های همسایه در محله {place.neighborhood}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {nearbyPlaces.map((np) => (
                <div
                  key={np.id}
                  onClick={() => navigate(`/place/${np.id}`)}
                  className="p-3 rounded-2xl bg-[#F7F3EC] dark:bg-slate-700/60 hover:bg-[#E4DCB] dark:hover:bg-slate-700 border border-[#DDD5C5] dark:border-slate-600 transition-all cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={np.image}
                      alt={np.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-black text-[#1F2430] dark:text-slate-100">{np.name}</h4>
                      <p className="text-[10px] text-[#71717A] dark:text-slate-400">{np.neighborhood}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#71717A] dark:text-slate-400 rotate-180" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ۱۰. دکمه اصلاح و تکمیل اطلاعات */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-3xl border border-amber-200 dark:border-amber-800 text-center space-y-2">
          <p className="text-xs text-amber-900 dark:text-amber-300 font-bold">
            آیا خادم یا عضو هیئت‌امنای این مکان هستید یا اطلاعات تکمیلی دارید؟
          </p>
          <button
            onClick={() => showToast('درخواست شما برای بررسی خادمان ارسال شد.')}
            className="bg-[#B4552D] hover:bg-[#964220] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all"
          >
            اصلاح / تکمیل مشخصات مکان
          </button>
        </div>
      </div>
    </div>
  );
};


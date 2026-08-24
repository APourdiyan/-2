import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Bookmark, 
  Bell, 
  Moon, 
  Sun, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Settings, 
  Info, 
  ShieldCheck, 
  ChevronLeft,
  Clock
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { INITIAL_PLACES, INITIAL_EVENTS } from '../data/dezfulData';
import { Place, EventItem } from '../types';
import { toPersianDigits } from '../utils/persianUtils';
import { Navigation } from '../components/Navigation';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'favorites' | 'events' | 'settings'>('favorites');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  const [places] = useState<Place[]>(() => {
    const saved = localStorage.getItem('dezful_places');
    return saved ? JSON.parse(saved) : INITIAL_PLACES;
  });

  const [events] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('dezful_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const bookmarkedPlaces = useMemo(() => {
    try {
      const saved = localStorage.getItem('dezful_saved_places');
      const ids: string[] = saved ? JSON.parse(saved) : [];
      return places.filter((p) => ids.includes(p.id));
    } catch {
      return [];
    }
  }, [places, activeTab]);

  const savedEvents = useMemo(() => {
    try {
      const saved = localStorage.getItem('dezful_saved_events');
      const ids: string[] = saved ? JSON.parse(saved) : [];
      const list: Array<{ event: EventItem; place: Place }> = [];
      events.forEach((e) => {
        if (ids.includes(e.id)) {
          const place = places.find((p) => p.id === e.placeId) || ({
            name: e.placeName,
            neighborhood: e.neighborhood
          } as Place);
          list.push({ event: e, place });
        }
      });
      return list;
    } catch {
      return [];
    }
  }, [events, places, activeTab]);

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    showToast(
      !notificationsEnabled
        ? 'اعلان مراسمات مذهبی فعال شد'
        : 'اعلان مراسمات غیرفعال شد',
      'info'
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 text-stone-900 dark:text-stone-100 flex flex-col font-['Vazirmatn'] select-none" dir="rtl">
      {/* هدر پروفایل */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-stone-200 dark:border-slate-800 p-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="بازگشت"
              className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-stone-600 dark:text-stone-300" />
            </button>
            <h1 className="text-base md:text-lg font-bold text-stone-900 dark:text-white">
              پروفایل و تنظیمات کاربری
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-12">
        {/* کارت کاربر */}
        <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#0E7C86] to-[#C26D47] text-white flex items-center justify-center shadow-lg shadow-[#0E7C86]/20 shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-extrabold text-stone-900 dark:text-white">
                  کاربر گرامی نقشه دزفول
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[11px] font-black">
                  زائر / مجاور
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                دسترسی به مکان‌های نشان‌شده، مراسمات و تنظیمات کاربری
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 bg-stone-50 dark:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700">
              <span className="block font-extrabold text-sm text-[#0E7C86]">
                {toPersianDigits(bookmarkedPlaces.length)}
              </span>
              <span className="text-[10px] text-stone-500">نشان‌شده‌ها</span>
            </div>
            <div className="text-center px-4 py-2 bg-stone-50 dark:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700">
              <span className="block font-extrabold text-sm text-[#C26D47]">
                {toPersianDigits(savedEvents.length)}
              </span>
              <span className="text-[10px] text-stone-500">مراسمات من</span>
            </div>
          </div>
        </div>

        {/* تب‌های پروفایل */}
        <div className="flex items-center gap-2 p-1.5 bg-stone-200/60 dark:bg-slate-800/80 rounded-2xl">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
              activeTab === 'favorites'
                ? 'bg-white dark:bg-slate-900 text-[#0E7C86] dark:text-[#18a8b6] shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>مکان‌های مورد علاقه</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
              activeTab === 'events'
                ? 'bg-white dark:bg-slate-900 text-[#0E7C86] dark:text-[#18a8b6] shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>مراسمات من</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-900 text-[#0E7C86] dark:text-[#18a8b6] shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>تنظیمات و درباره</span>
          </button>
        </div>

        {/* ۱. مکان‌های مورد علاقه */}
        {activeTab === 'favorites' && (
          <div>
            {bookmarkedPlaces.length === 0 ? (
              <EmptyState
                type="saved"
                title="مکانی نشان نشده است"
                description="در صفحات اماکن مذهبی یا روی نقشه، با زدن آیکون بوکمارک می‌توانید مکان‌های منتخب خود را ذخیره کنید."
                actionText="مشاهده نقشه دزفول"
                onAction={() => navigate('/?tab=map')}
                className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarkedPlaces.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => navigate(`/place/${place.id}`)}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 hover:border-[#0E7C86] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm md:text-base text-stone-900 dark:text-white group-hover:text-[#0E7C86]">
                        {place.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <MapPin className="w-3.5 h-3.5 text-[#C26D47]" />
                        <span>محله {place.neighborhood}</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-[#0E7C86]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ۲. مراسمات من */}
        {activeTab === 'events' && (
          <div>
            {savedEvents.length === 0 ? (
              <EmptyState
                type="calendar"
                title="مراسمی ذخیره نشده است"
                description="از بخش تقویم مراسمات می‌توانید ادعیه و روضه‌های مورد نظر خود را ذخیره کنید تا یادآوری شود."
                actionText="مشاهده تقویم مراسمات"
                onAction={() => navigate('/calendar')}
                className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedEvents.map(({ event, place }) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-sm space-y-2"
                  >
                    <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">
                      {event.title}
                    </h4>
                    <p className="text-xs text-stone-500">
                      مکان: {place.name} (محله {place.neighborhood})
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#C26D47]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>ساعت {toPersianDigits(event.timeStr)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ۳. تنظیمات و درباره */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#0E7C86]" />
                <span>شخصی‌سازی و تنظیمات نمایش</span>
              </h3>

              {/* تم تاریک */}
              <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <div>
                    <span className="text-xs md:text-sm font-bold text-stone-800 dark:text-stone-200 block">
                      حالت تاریک (Dark Mode)
                    </span>
                    <span className="text-[11px] text-stone-500">مناسب محیط‌های کم‌نور و شب</span>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs font-bold hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {theme === 'dark' ? 'فعال' : 'غیرفعال'}
                </button>
              </div>

              {/* اعلان‌ها */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-[#0E7C86]" />
                  <div>
                    <span className="text-xs md:text-sm font-bold text-stone-800 dark:text-stone-200 block">
                      اعلان اوقات شرعی و مراسمات
                    </span>
                    <span className="text-[11px] text-stone-500">ارسال یادآور قبل از شروع مراسمات</span>
                  </div>
                </div>
                <button
                  onClick={toggleNotifications}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    notificationsEnabled
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-500'
                  }`}
                >
                  {notificationsEnabled ? 'روشن' : 'خاموش'}
                </button>
              </div>
            </div>

            {/* درباره سامانه */}
            <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-[#C26D47]" />
                <span>درباره سامانه جامع مذهبی دزفول</span>
              </h3>
              <p className="text-xs md:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                این پلتفرم به منظور تسهیل دسترسی شهروندان، مسافران و زائران به اطلاعات دقیق مساجد، حسینیه‌ها، شوادون‌های کهن و تقویم مراسمات مذهبی کهن‌شهر دزفول (پایتخت مقاومت ایران) توسعه یافته است.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-slate-800 text-xs text-stone-400">
                <span>نسخه: ۲.۴.۰ (نگارش دزفول)</span>
                <span className="flex items-center gap-1 text-[#0E7C86]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>داده‌های معتبر شهری</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Navigation
        activeTab="home"
        onTabChange={(tab) => {
          if (tab === 'home') navigate('/');
          else if (tab === 'calendar') navigate('/calendar');
          else if (tab === 'map') navigate('/?tab=map');
        }}
        todayEventsCount={events.filter((e) => e.isToday || e.isTonight).length}
      />
    </div>
  );
};

export default ProfilePage;

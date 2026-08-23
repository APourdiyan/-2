import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  Bell, 
  BellRing, 
  Navigation, 
  Sparkles, 
  ChevronLeft, 
  Users, 
  Building2, 
  UtensilsCrossed, 
  Radio, 
  Warehouse, 
  BookOpen, 
  HeartHandshake, 
  X,
  AlertCircle
} from 'lucide-react';
import { INITIAL_EVENTS, INITIAL_PLACES } from '../data/dezfulData';
import { EventItem, EventCategory } from '../types';
import { toPersianDigits, getRoutingLinks } from '../utils/persianUtils';
import { useAppStore } from '../store/appStore';

/**
 * صفحه تقویم جامع مراسمات و رویدادهای مذهبی دزفول (/calendar)
 */
export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { userLocation } = useAppStore();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyToday, setOnlyToday] = useState(false);
  const [onlyNazri, setOnlyNazri] = useState(false);

  const [savedReminderIds, setSavedReminderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dezful_reminders');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // بارگذاری داده‌ها با Loading و Error Handling
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const storedEvents: EventItem[] = JSON.parse(
        localStorage.getItem('dezful_events') || '[]'
      );
      const data = storedEvents.length > 0 ? storedEvents : INITIAL_EVENTS;
      setEvents(data);
    } catch (err) {
      setError('خطا در دریافت لیست مراسمات دزفول.');
    } finally {
      setLoading(false);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleReminder = (eventId: string) => {
    let updated: string[];
    if (savedReminderIds.includes(eventId)) {
      updated = savedReminderIds.filter((id) => id !== eventId);
      showToast('یادآوری لغو شد.');
    } else {
      updated = [...savedReminderIds, eventId];
      showToast('یادآوری رویداد در تقویم شما فعال شد.');
    }
    setSavedReminderIds(updated);
    localStorage.setItem('dezful_reminders', JSON.stringify(updated));
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        const matchTitle = ev.title.includes(q);
        const matchPlace = ev.placeName.includes(q);
        const matchNeigh = ev.neighborhood.includes(q);
        const matchSpeaker = ev.speaker?.includes(q);
        const matchEulogist = ev.eulogist?.includes(q);
        if (!matchTitle && !matchPlace && !matchNeigh && !matchSpeaker && !matchEulogist) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && ev.category !== selectedCategory) {
        return false;
      }

      if (onlyToday && !ev.isToday && !ev.isTonight) {
        return false;
      }

      if (onlyNazri && !ev.services.nazri) {
        return false;
      }

      return true;
    });
  }, [events, searchQuery, selectedCategory, onlyToday, onlyNazri]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#0E7C86] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-[#71717A]">در حال بارگذاری تقویم مراسمات دزفول...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E0D8C8] text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <h3 className="text-base font-black text-[#1F2430]">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#0E7C86] text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#1F2430] pb-24 font-['Vazirmatn',sans-serif]">
      {/* پیام Toast */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1F2430] text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 animate-slideDown flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E5B555] animate-pulse"></span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* هدر صفحه تقویم */}
      <div className="bg-[#1F2430] text-white pt-6 pb-8 px-4 border-b border-[#3A4050]">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E5B555]/20 text-[#E5B555] flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black">تقویم مراسمات و مجالس دزفول</h1>
                <p className="text-[11px] text-white/70">جدول رویدادها، هیئت‌ها و برنامه‌های هفتگی</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
            >
              بازگشت به نقشه
            </button>
          </div>

          {/* فیلد جستجو */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام هیئت، سخنران، مداح، مسجد یا موضوع مراسم..."
              className="w-full bg-[#2A3140] border border-[#3A4050] rounded-2xl pr-10 pl-8 py-2.5 text-xs text-white placeholder-white/50 focus:outline-none focus:border-[#0E7C86]"
            />
            <Search className="w-4 h-4 text-white/50 absolute right-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 -mt-3 space-y-4">
        {/* نوار فیلترهای دسته‌بندی */}
        <div className="bg-white rounded-2xl p-2.5 border border-[#E0D8C8] shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'همه مجالس' },
            { id: 'mourning', label: 'عزاداری و روضه' },
            { id: 'komeyl_nodbeh', label: 'کمیل و ندبه' },
            { id: 'celebration', label: 'جشن و میلاد' },
            { id: 'quran', label: 'محافل قرآنی' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#0E7C86] text-white shadow-xs'
                  : 'bg-[#F7F3EC] text-[#52525B] hover:bg-[#E4DCB]'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <button
            onClick={() => setOnlyToday(!onlyToday)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all ${
              onlyToday
                ? 'bg-[#B4552D] text-white shadow-xs'
                : 'bg-[#F7F3EC] text-[#52525B] hover:bg-[#E4DCB]'
            }`}
          >
            فقط امروز و امشب
          </button>

          <button
            onClick={() => setOnlyNazri(!onlyNazri)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all ${
              onlyNazri
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-[#F7F3EC] text-[#52525B] hover:bg-[#E4DCB]'
            }`}
          >
            دارای نذری و پذیرایی
          </button>
        </div>

        {/* لیست رویدادها */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#E0D8C8] space-y-3">
            <CalendarIcon className="w-12 h-12 text-[#C4B9A7] mx-auto" />
            <h3 className="text-base font-black text-[#1F2430]">رویدادی با این مشخصات یافت نشد</h3>
            <p className="text-xs text-[#71717A]">می‌توانید کلمات جستجو را تغییر دهید یا فیلترها را پاک کنید.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((ev) => {
              const isReminder = savedReminderIds.includes(ev.id);
              const routing = getRoutingLinks(ev.coordinates[0], ev.coordinates[1], ev.placeName);

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E0D8C8] hover:border-[#0E7C86] shadow-xs transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#B4552D] text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
                          {ev.timeBadge}
                        </span>
                        <span className="bg-[#0E7C86]/10 text-[#0E7C86] text-[10px] font-black px-2 py-0.5 rounded-lg">
                          {ev.dayOfWeek} {toPersianDigits(ev.date)}
                        </span>
                        {ev.services.nazri && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <UtensilsCrossed className="w-3 h-3 text-amber-700" />
                            نذری
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-[#1F2430] mt-1.5">
                        {ev.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-[#71717A] mt-1">
                        <Building2 className="w-3.5 h-3.5 text-[#0E7C86]" />
                        <span
                          onClick={() => navigate(`/place/${ev.placeId}`)}
                          className="font-bold text-[#0E7C86] hover:underline cursor-pointer"
                        >
                          {ev.placeName}
                        </span>
                        <span>• محله {ev.neighborhood}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleReminder(ev.id)}
                      className={`p-2.5 rounded-2xl border transition-all shrink-0 ${
                        isReminder
                          ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                          : 'bg-[#F7F3EC] text-[#71717A] border-[#DDD5C5] hover:text-[#0E7C86]'
                      }`}
                      title={isReminder ? 'یادآوری فعال است' : 'تنظیم یادآوری'}
                    >
                      {isReminder ? <BellRing className="w-5 h-5 text-amber-600" /> : <Bell className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* سخنران و مداح */}
                  {(ev.speaker || ev.eulogist || ev.description) && (
                    <div className="p-3 bg-[#F7F3EC] rounded-2xl border border-[#DDD5C5] text-xs space-y-1">
                      {ev.speaker && <div><span className="font-bold text-[#1F2430]">سخنران:</span> {ev.speaker}</div>}
                      {ev.eulogist && <div><span className="font-bold text-[#1F2430]">مداح و نوحه‌خوان:</span> {ev.eulogist}</div>}
                      {ev.description && <div className="text-[#71717A] mt-1">{ev.description}</div>}
                    </div>
                  )}

                  {/* دکمه‌های اقدام */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#F2ECE1]">
                    <button
                      onClick={() => navigate(`/place/${ev.placeId}`)}
                      className="flex-1 bg-[#0E7C86] hover:bg-[#0a5d65] text-white py-2 px-3 rounded-xl text-xs font-bold transition-all text-center"
                    >
                      مشخصات مکان و برنامه
                    </button>

                    <a
                      href={routing.neshan}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-[#F7F3EC] hover:bg-[#E4DCB] text-[#1F2430] border border-[#DDD5C5] py-2 px-3 rounded-xl text-xs font-bold"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#B4552D]" />
                      <span>مسیریابی</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

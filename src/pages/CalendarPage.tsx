import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  Bell, 
  BellRing, 
  Navigation as NavigationIcon, 
  Sparkles, 
  ChevronLeft, 
  Users, 
  Building2, 
  UtensilsCrossed, 
  Radio, 
  Warehouse, 
  BookOpen, 
  Bookmark,
  Share2
} from 'lucide-react';
import { INITIAL_EVENTS, INITIAL_PLACES } from '../data/dezfulData';
import { EventItem, Place } from '../types';
import { toPersianDigits, getRoutingLinks } from '../utils/persianUtils';
import { useAppStore } from '../store/appStore';
import { Navigation } from '../components/Navigation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

/**
 * صفحه تقویم جامع مراسمات و رویدادهای مذهبی دزفول (/calendar)
 */
export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { toggleDarkMode } = useAppStore();
  const { showToast } = useToast();

  useKeyboardShortcuts({
    onOpenSearch: () => navigate('/search'),
    onCloseModals: () => navigate(-1),
    onNavigateToMap: () => navigate('/?tab=map'),
    onNavigateToEvents: () => {},
    onNavigateToHome: () => navigate('/'),
    onToggleDarkMode: () => toggleDarkMode()
  });

  const [places] = useState<Place[]>(() => {
    const saved = localStorage.getItem('dezful_places');
    return saved ? JSON.parse(saved) : INITIAL_PLACES;
  });

  const [events] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('dezful_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedReminderIds, setSavedReminderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dezful_saved_events');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleSaveEvent = (eventId: string) => {
    setSavedReminderIds((prev) => {
      const next = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
      try {
        localStorage.setItem('dezful_saved_events', JSON.stringify(next));
      } catch {
        // silent
      }
      showToast(
        next.includes(eventId)
          ? 'مراسم در تقویم شما ذخیره شد'
          : 'مراسم از تقویم حذف شد',
        'success'
      );
      return next;
    });
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // تب زمان‌بندی
      if (activeTab === 'today' && !ev.isToday && !ev.isTonight) return false;
      if (activeTab === 'tomorrow' && !ev.dayOfWeek.includes('فردا')) return false;
      if (activeTab === 'week' && !ev.dayOfWeek.includes('پنج‌شنبه') && !ev.dayOfWeek.includes('جمعه') && !ev.isToday) return false;

      // فیلتر موضوع
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'komeil' && ev.category !== 'komeyl_nodbeh') return false;
        if (selectedCategory === 'mourning' && ev.category !== 'mourning') return false;
        if (selectedCategory === 'celebration' && ev.category !== 'celebration') return false;
        if (selectedCategory === 'speech' && ev.category !== 'speech') return false;
      }

      // جستجو
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchPlace = ev.placeName.toLowerCase().includes(q);
        const matchSpeaker = (ev.speaker || ev.eulogist || '').toLowerCase().includes(q);
        if (!matchTitle && !matchPlace && !matchSpeaker) return false;
      }

      return true;
    });
  }, [events, activeTab, selectedCategory, searchQuery]);

  const getTimingBadgeColor = (ev: EventItem) => {
    if (ev.isTonight || ev.isToday) {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-900';
    }
    if (ev.dayOfWeek.includes('فردا')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-900';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 text-stone-900 dark:text-stone-100 flex flex-col font-['Vazirmatn'] select-none" dir="rtl">
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-12">
        {/* هدر تقویم */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0E7C86] to-[#C26D47] text-white flex items-center justify-center shadow-md">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-extrabold text-stone-900 dark:text-white">
                تقویم مراسمات و هیئات مذهبی دزفول
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                ادعیه هفتگی (کمیل و ندبه)، روضه‌های هفتگی و جشن‌های اعیاد
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی مراسم، سخنران، مکان..."
              className="w-full pr-10 pl-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0E7C86] text-stone-900 dark:text-white"
            />
          </div>
        </div>

        {/* تب‌های زمانی: امروز | فردا | این هفته | همه */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 dark:bg-slate-800/80 rounded-2xl">
            {[
              { id: 'all', label: 'همه مراسمات' },
              { id: 'today', label: 'امروز / امشب' },
              { id: 'tomorrow', label: 'فردا' },
              { id: 'week', label: 'این هفته' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-[#0E7C86] dark:text-[#18a8b6] shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* فیلتر موضوعی: کمیل، ندبه، عزاداری، جشن */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'همه دسته‌ها' },
              { id: 'komeil', label: 'کمیل / ندبه' },
              { id: 'mourning', label: 'عزاداری و هیئت' },
              { id: 'celebration', label: 'جشن و میلاد' },
              { id: 'speech', label: 'سخنرانی' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap border transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#0E7C86] text-white border-[#0E7C86]'
                    : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-slate-800 hover:border-stone-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* لیست نتایج */}
        {filteredEvents.length === 0 ? (
          <EmptyState
            type="calendar"
            title="مراسمی برای فیلترهای انتخابی یافت نشد"
            description="می‌توانید فیلترهای روز یا دسته‌بندی را تغییر داده یا پاک کنید."
            actionText="پاک کردن فیلترها"
            onAction={() => {
              setActiveTab('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((ev) => {
              const isSaved = savedReminderIds.includes(ev.id);
              const relatedPlace = places.find((p) => p.id === ev.placeId);

              return (
                <div
                  key={ev.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black border ${getTimingBadgeColor(ev)}`}>
                        {ev.timeBadge}
                      </span>

                      <button
                        onClick={() => toggleSaveEvent(ev.id)}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          isSaved
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-500'
                            : 'border-stone-200 dark:border-slate-800 text-stone-400 hover:text-stone-700'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <h3 className="font-black text-base text-stone-900 dark:text-white leading-tight">
                      {ev.title}
                    </h3>

                    {(ev.speaker || ev.eulogist) && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                        <Users className="w-3.5 h-3.5 text-[#0E7C86] shrink-0" />
                        <span>
                          سخنران/مداح: {[ev.speaker, ev.eulogist].filter(Boolean).join(' • ')}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      <MapPin className="w-3.5 h-3.5 text-[#C26D47] shrink-0" />
                      <span className="font-bold text-stone-700 dark:text-stone-300">
                        {ev.placeName}
                      </span>
                      <span>(محله {ev.neighborhood})</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300">
                      <Clock className="w-4 h-4 text-[#C26D47]" />
                      <span>ساعت {toPersianDigits(ev.timeStr)}</span>
                    </div>

                    {relatedPlace && (
                      <button
                        onClick={() => navigate(`/place/${relatedPlace.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0E7C86]/10 hover:bg-[#0E7C86] text-[#0E7C86] hover:text-white font-bold text-xs transition-colors"
                      >
                        <span>مشاهده مکان</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Navigation
        activeTab="calendar"
        onTabChange={(tab) => {
          if (tab === 'home') navigate('/');
          else if (tab === 'map') navigate('/?tab=map');
        }}
        todayEventsCount={events.filter((e) => e.isToday || e.isTonight).length}
      />
    </div>
  );
};

export default CalendarPage;

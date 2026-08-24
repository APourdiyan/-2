import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Search,
  Filter,
  Users,
  Sparkles,
  ChevronLeft,
  Share2,
  Bookmark
} from 'lucide-react';
import { Place, EventItem, EventCategory } from '../../types';
import { toPersianDigits } from '../../utils/persianUtils';
import { EmptyState } from '../common/EmptyState';
import { useToast } from '../common/Toast';

export interface CalendarPageProps {
  places: Place[];
  events: EventItem[];
  onSelectPlace?: (place: Place) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  places,
  events,
  onSelectPlace
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'week' | 'all'>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dezful_saved_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleSaveEvent = (eventId: string) => {
    setSavedEventIds((prev) => {
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
          ? 'مراسم در تقویم من ذخیره شد'
          : 'مراسم از تقویم حذف شد',
        'success'
      );
      return next;
    });
  };

  // نگاشت مراسمات به همراه آبجکت مکان مربوطه
  const eventsWithPlace = useMemo(() => {
    return events.map((event) => {
      const place = places.find((p) => p.id === event.placeId) || {
        id: event.placeId,
        name: event.placeName,
        neighborhood: event.neighborhood,
        coordinates: event.coordinates,
        type: event.placeType
      } as Place;

      let timingBadge: 'tonight' | 'tomorrow' | 'weekly' | 'normal' = 'normal';
      if (event.isTonight || event.isToday) timingBadge = 'tonight';
      else if (event.dayOfWeek.includes('فردا')) timingBadge = 'tomorrow';
      else timingBadge = 'weekly';

      return { event, place, timingBadge };
    });
  }, [events, places]);

  // فیلتر کردن مراسمات
  const filteredEvents = useMemo(() => {
    return eventsWithPlace.filter(({ event, place, timingBadge }) => {
      // فیلتر تب زمان‌بندی
      if (activeTab === 'today' && !event.isToday && !event.isTonight) return false;
      if (activeTab === 'tomorrow' && timingBadge !== 'tomorrow') return false;
      if (activeTab === 'week' && timingBadge !== 'weekly' && !event.isToday) return false;

      // فیلتر نوع مراسم
      if (selectedEventType !== 'all') {
        if (selectedEventType === 'komeil' && event.category !== 'komeyl_nodbeh') return false;
        if (selectedEventType === 'mourning' && event.category !== 'mourning') return false;
        if (selectedEventType === 'celebration' && event.category !== 'celebration') return false;
        if (selectedEventType === 'speech' && event.category !== 'speech') return false;
      }

      // جستجوی متنی
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(q);
        const matchPlace = place.name.toLowerCase().includes(q);
        const matchSpeaker = (event.speaker || event.eulogist || '').toLowerCase().includes(q);
        if (!matchTitle && !matchPlace && !matchSpeaker) return false;
      }

      return true;
    });
  }, [eventsWithPlace, activeTab, selectedEventType, searchQuery]);

  const clearFilters = () => {
    setActiveTab('all');
    setSelectedEventType('all');
    setSearchQuery('');
  };

  const getBadgeStyle = (timing: 'tonight' | 'tomorrow' | 'weekly' | 'normal') => {
    switch (timing) {
      case 'tonight':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'tomorrow':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'weekly':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-slate-800 dark:text-stone-300 border-stone-200 dark:border-slate-700';
    }
  };

  const getBadgeText = (timing: 'tonight' | 'tomorrow' | 'weekly' | 'normal', event: EventItem) => {
    if (event.timeBadge) return event.timeBadge;
    switch (timing) {
      case 'tonight':
        return 'امشب';
      case 'tomorrow':
        return 'فردا';
      case 'weekly':
        return 'هفتگی';
      default:
        return 'به‌زودی';
    }
  };

  return (
    <div
      id="calendar-page-container"
      className="max-w-4xl mx-auto space-y-6 font-['Vazirmatn'] pb-12 select-none"
      dir="rtl"
    >
      {/* سربرگ صفحه تقویم */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0E7C86] to-[#C26D47] text-white flex items-center justify-center shadow-md">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base md:text-xl font-extrabold text-stone-900 dark:text-white">
              تقویم مراسمات و برنامه‌های مذهبی دزفول
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              هیئات، ادعیه هفتگی (کمیل، ندبه، سمات)، روضه‌ها و جشن‌های اعیاد
            </p>
          </div>
        </div>

        {/* فیلد جستجوی مراسمات */}
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

      {/* نوار تب‌های زمان‌بندی: امروز | فردا | این هفته | همه */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 dark:bg-slate-800/80 rounded-2xl">
          {[
            { id: 'all', label: 'همه مراسمات' },
            { id: 'today', label: 'امروز / امشب' },
            { id: 'tomorrow', label: 'فردا' },
            { id: 'week', label: 'این هفته' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-[#0E7C86] dark:text-[#18a8b6] shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* فیلتر نوع مراسم */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'همه موضوعات' },
            { id: 'komeil', label: 'کمیل / ندبه' },
            { id: 'mourning', label: 'عزاداری و هیئت' },
            { id: 'celebration', label: 'جشن و اعیاد' },
            { id: 'speech', label: 'سخنرانی' }
          ].map((type) => {
            const isActive = selectedEventType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedEventType(type.id)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap border transition-all ${
                  isActive
                    ? 'bg-[#0E7C86] text-white border-[#0E7C86]'
                    : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-slate-800 hover:border-stone-400'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* لیست مراسمات یا حالت خالی */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          type="calendar"
          title="مراسمی با این مشخصات یافت نشد"
          description="می‌توانید فیلترهای روز یا نوع مراسم را پاک کنید تا تمامی برنامه‌ها نمایش داده شوند."
          actionText="پاک کردن فیلترها"
          onAction={clearFilters}
          className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map(({ event, place, timingBadge }) => {
            const isSaved = savedEventIds.includes(event.id);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group relative"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black border ${getBadgeStyle(
                        timingBadge
                      )}`}
                    >
                      {getBadgeText(timingBadge, event)}
                    </span>

                    <button
                      onClick={() => toggleSaveEvent(event.id)}
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
                    {event.title}
                  </h3>

                  {(event.speaker || event.eulogist) && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                      <Users className="w-3.5 h-3.5 text-[#0E7C86] shrink-0" />
                      <span>
                        سخنران/مداح: {[event.speaker, event.eulogist].filter(Boolean).join(' • ')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <MapPin className="w-3.5 h-3.5 text-[#C26D47] shrink-0" />
                    <span className="font-bold text-stone-700 dark:text-stone-300">
                      {place.name}
                    </span>
                    <span>(محله {place.neighborhood})</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300">
                    <Clock className="w-4 h-4 text-[#C26D47]" />
                    <span>ساعت {toPersianDigits(event.timeStr)}</span>
                  </div>

                  {onSelectPlace && (
                    <button
                      onClick={() => onSelectPlace(place)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0E7C86]/10 hover:bg-[#0E7C86] text-[#0E7C86] hover:text-white font-bold text-xs transition-colors"
                    >
                      <span>مکان روی نقشه</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;

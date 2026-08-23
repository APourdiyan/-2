import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  Search, 
  Compass, 
  Map as MapIcon, 
  Calendar as CalendarIcon, 
  Warehouse, 
  Users, 
  Layers, 
  AlertCircle,
  Clock,
  Car
} from 'lucide-react';
import { INITIAL_PLACES, INITIAL_EVENTS, INITIAL_NEIGHBORHOODS } from '../data/dezfulData';
import { Place, EventItem, Neighborhood, ActiveTab } from '../types';
import { Header } from '../components/Header';
import { PlaceCard } from '../components/PlaceCard';
import { SubmitEventModal } from '../components/SubmitEventModal';
import { PrayerTimesModal } from '../components/PrayerTimesModal';
import { NotificationModal } from '../components/NotificationModal';
import { SearchModal } from '../components/SearchModal';
import { BottomNavigation } from '../components/BottomNavigation';
import { FullMapView } from '../components/FullMapView';
import { toPersianDigits } from '../utils/persianUtils';
import { useAppStore } from '../store/appStore';

/**
 * صفحه اصلی سامانه نقشه مذهبی دزفول
 */
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    userLocation, 
    setUserLocation,
    activeFilters,
    toggleFilter
  } = useAppStore();

  // داده‌های محلی
  const [places, setPlaces] = useState<Place[]>(() => {
    const saved = localStorage.getItem('dezful_places');
    return saved ? JSON.parse(saved) : INITIAL_PLACES;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('dezful_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [neighborhoods] = useState<Neighborhood[]>(INITIAL_NEIGHBORHOODS);

  // وضعیت تب فعال
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>('all');
  
  // مدال‌ها
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isPrayerTimesOpen, setIsPrayerTimesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const [savedReminderIds, setSavedReminderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dezful_reminders');
    return saved ? JSON.parse(saved) : [];
  });

  // موقعیت مکانی
  const handleRequestUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setUserLocation({ lat: 32.3838, lng: 48.4020 });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  useEffect(() => {
    handleRequestUserLocation();
  }, []);

  // فیلتر کردن اماکن
  const filteredPlaces = places.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const matchName = p.name.includes(q);
      const matchNeigh = p.neighborhood.includes(q);
      const matchAddr = p.address.includes(q);
      if (!matchName && !matchNeigh && !matchAddr) return false;
    }

    if (selectedNeighborhoodId !== 'all') {
      if (p.neighborhoodId !== selectedNeighborhoodId && !p.neighborhood.includes(selectedNeighborhoodId)) {
        return false;
      }
    }

    if (!activeFilters.includes('all')) {
      if (activeFilters.includes('mosque') && p.type === 'mosque') return true;
      if (activeFilters.includes('hussainiya') && p.type === 'hussainiya') return true;
      if (activeFilters.includes('shrine') && p.type === 'shrine') return true;
      if (activeFilters.includes('historical') && p.isHistorical) return true;
      if (activeFilters.includes('shovadoon') && p.features.shovadoon) return true;
      if (activeFilters.includes('open') && p.isCurrentlyOpen) return true;
      return false;
    }

    return true;
  });

  const todayEventsCount = events.filter((e) => e.isToday || e.isTonight).length;

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#1F2430] pb-20 font-['Vazirmatn',sans-serif]">
      {/* هدر بالایی */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenPrayerTimes={() => setIsPrayerTimesOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadRemindersCount={savedReminderIds.length}
      />

      {/* نمایش بر اساس تب */}
      {activeTab === 'map' ? (
        <FullMapView
          places={places}
          onBack={() => setActiveTab('home')}
          onSelectPlace={(p) => navigate(`/place/${p.id}`)}
          userCoords={userLocation ? [userLocation.lat, userLocation.lng] : null}
          onRequestUserLocation={handleRequestUserLocation}
        />
      ) : activeTab === 'neighborhoods' ? (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-[#1F2430] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0E7C86]" />
              <span>محله‌های عرفی و تاریخی دزفول</span>
            </h2>
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs font-bold text-[#0E7C86] hover:underline"
            >
              بازگشت به خانه
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {neighborhoods.map((nh) => (
              <div
                key={nh.id}
                onClick={() => {
                  setSelectedNeighborhoodId(nh.id);
                  setActiveTab('home');
                }}
                className="bg-white rounded-3xl p-4 border border-[#E0D8C8] hover:border-[#0E7C86] shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#1F2430]">{nh.name}</h3>
                  {nh.isHistoricalDistrict && (
                    <span className="bg-[#E5B555]/20 text-[#8F6B1E] text-[10px] font-black px-2 py-0.5 rounded-lg">
                      بافت تاریخی
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#52525B] leading-relaxed">{nh.description}</p>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#71717A] pt-2 border-t border-[#F2ECE1]">
                  <span>{toPersianDigits(nh.mosquesCount)} مسجد</span>
                  <span>•</span>
                  <span>{toPersianDigits(nh.hussainiyasCount)} حسینیه</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* تب اصلی خانه */
        <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
          {/* بنر رویداد شاخص یا میانبر تقویم */}
          <div className="bg-gradient-to-r from-[#1F2430] to-[#2C3444] rounded-3xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#E5B555] text-[#1F2430] text-[10px] font-black px-2 py-0.5 rounded-md">
                  تقویم مذهبی دزفول
                </span>
                <span className="text-xs text-white/80">مراسمات و برنامه‌های هفتگی</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                مشاهده جدول کامل مراسمات، دعای کمیل و هیئت‌ها
              </h2>
            </div>

            <button
              onClick={() => navigate('/calendar')}
              className="bg-[#0E7C86] hover:bg-[#0a5d65] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all whitespace-nowrap"
            >
              مشاهده تقویم مراسمات ←
            </button>
          </div>

          {/* چیپ‌های دسته‌بندی سریع */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'همه اماکن' },
              { id: 'mosque', label: 'مساجد' },
              { id: 'hussainiya', label: 'حسینیه‌ها' },
              { id: 'shrine', label: 'بقاع متبرکه' },
              { id: 'historical', label: 'آثار تاریخی' },
              { id: 'shovadoon', label: 'دارای شوادون' },
              { id: 'open', label: 'باز الان' },
            ].map((chip) => {
              const isActive = activeFilters.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  onClick={() => toggleFilter(chip.id)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-[#0E7C86] text-white border-[#0E7C86] shadow-xs'
                      : 'bg-white text-[#52525B] border-[#DDD5C5] hover:bg-[#F7F3EC]'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* فیلتر محله فعال */}
          {selectedNeighborhoodId !== 'all' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900">
                نمایش اماکن محله: {neighborhoods.find((n) => n.id === selectedNeighborhoodId)?.name}
              </span>
              <button
                onClick={() => setSelectedNeighborhoodId('all')}
                className="text-amber-800 font-black hover:underline"
              >
                نمایش تمام محلات
              </button>
            </div>
          )}

          {/* لیست اماکن */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-black text-[#1F2430] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0E7C86]" />
                <span>اماکن مذهبی دزفول</span>
                <span className="text-xs bg-[#DDD5C5] text-[#1F2430] px-2 py-0.5 rounded-full font-bold">
                  {toPersianDigits(filteredPlaces.length)}
                </span>
              </h2>

              <button
                onClick={() => setActiveTab('map')}
                className="flex items-center gap-1 text-xs font-bold text-[#0E7C86] hover:underline"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>نمایش روی نقشه دزفول</span>
              </button>
            </div>

            {filteredPlaces.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-[#E0D8C8] space-y-2">
                <AlertCircle className="w-10 h-10 text-[#C4B9A7] mx-auto" />
                <h3 className="text-sm font-black text-[#1F2430]">مکانی با این مشخصات یافت نشد</h3>
                <p className="text-xs text-[#71717A]">لطفاً عبارت جستجو یا فیلترهای اعمال شده را تغییر دهید.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onSelectPlace={() => navigate(`/place/${place.id}`)}
                    userCoords={userLocation ? [userLocation.lat, userLocation.lng] : null}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* مدال ثبت مراسم */}
      {isSubmitModalOpen && (
        <SubmitEventModal
          places={places}
          onClose={() => setIsSubmitModalOpen(false)}
          onAddEvent={(newEvent) => {
            const updated = [newEvent, ...events];
            setEvents(updated);
            localStorage.setItem('dezful_events', JSON.stringify(updated));
            setIsSubmitModalOpen(false);
          }}
        />
      )}

      {/* مدال اوقات شرعی */}
      {isPrayerTimesOpen && (
        <PrayerTimesModal
          onClose={() => setIsPrayerTimesOpen(false)}
        />
      )}

      {/* مدال یادآوری‌ها */}
      {isNotificationsOpen && (
        <NotificationModal
          savedReminderIds={savedReminderIds}
          events={events}
          onClose={() => setIsNotificationsOpen(false)}
          onRemoveReminder={(id) => {
            const updated = savedReminderIds.filter((eId) => eId !== id);
            setSavedReminderIds(updated);
            localStorage.setItem('dezful_reminders', JSON.stringify(updated));
          }}
          onSelectEvent={(e) => {
            setIsNotificationsOpen(false);
            navigate(`/place/${e.placeId}`);
          }}
        />
      )}

      {/* مدال جستجو */}
      {isSearchModalOpen && (
        <SearchModal
          places={places}
          events={events}
          neighborhoods={neighborhoods}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectPlace={(p) => {
            setIsSearchModalOpen(false);
            navigate(`/place/${p.id}`);
          }}
          onSelectEvent={(e) => {
            setIsSearchModalOpen(false);
            navigate(`/place/${e.placeId}`);
          }}
          onSelectNeighborhood={(n) => {
            setIsSearchModalOpen(false);
            setSelectedNeighborhoodId(n.id);
            setActiveTab('home');
          }}
        />
      )}

      {/* نوار ناوبری پایینی موبایل */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'calendar') {
            navigate('/calendar');
          } else if (tab === 'submit') {
            setIsSubmitModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        todayEventsCount={todayEventsCount}
      />
    </div>
  );
};

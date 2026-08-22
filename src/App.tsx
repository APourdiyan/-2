/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_PLACES, 
  INITIAL_EVENTS, 
  INITIAL_NEIGHBORHOODS, 
  CITY_STATS 
} from './data/dezfulData';
import { 
  Place, 
  EventItem, 
  Neighborhood, 
  ActiveTab 
} from './types';
import { calculateDistanceMeters } from './utils/persianUtils';

// Components
import { Header } from './components/Header';
import { StatsDashboard } from './components/StatsDashboard';
import { MiniMap } from './components/MiniMap';
import { QuickFilterChips } from './components/QuickFilterChips';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { LiveEventsFeed } from './components/LiveEventsFeed';
import { NeighborhoodsGrid } from './components/NeighborhoodsGrid';
import { CommunityBanner } from './components/CommunityBanner';
import { BottomNavigation } from './components/BottomNavigation';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { FullMapView } from './components/FullMapView';
import { CalendarView } from './components/CalendarView';
import { SubmitEventModal } from './components/SubmitEventModal';
import { NeighborhoodDetailModal } from './components/NeighborhoodDetailModal';
import { PrayerTimesModal } from './components/PrayerTimesModal';
import { SearchModal } from './components/SearchModal';
import { NotificationModal } from './components/NotificationModal';

export default function App() {
  // Primary State
  const [places, setPlaces] = useState<Place[]>(() => {
    const saved = localStorage.getItem('dezful_places');
    return saved ? JSON.parse(saved) : INITIAL_PLACES;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('dezful_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [neighborhoods] = useState<Neighborhood[]>(INITIAL_NEIGHBORHOODS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Modal / Selection State
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isPrayerTimesModalOpen, setIsPrayerTimesModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');

  // Geolocation & Nearest State
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [nearestPlace, setNearestPlace] = useState<Place | null>(null);

  // Reminders State
  const [savedReminderIds, setSavedReminderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dezful_reminders');
    return saved ? JSON.parse(saved) : ['ev-1'];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist places, events, and reminders in local storage
  useEffect(() => {
    localStorage.setItem('dezful_places', JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    localStorage.setItem('dezful_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('dezful_reminders', JSON.stringify(savedReminderIds));
  }, [savedReminderIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Find User GPS Location & Closest Mosque in Dezful
  const handleFindNearestMosque = () => {
    if (!navigator.geolocation) {
      showToast('دستگاه شما از موقعیت مکانی پشتیبانی نمی‌کند.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserCoords([userLat, userLng]);

        // Find closest place
        let closest: Place | null = null;
        let minDistance = Infinity;

        places.forEach((p) => {
          const dist = calculateDistanceMeters(userLat, userLng, p.coordinates[0], p.coordinates[1]);
          if (dist < minDistance) {
            minDistance = dist;
            closest = p;
          }
        });

        if (closest) {
          setNearestPlace(closest);
          showToast(`نزدیک‌ترین مکان: ${closest.name}`);
        }
      },
      (err) => {
        // Fallback to Dezful historical center
        const defaultUser: [number, number] = [32.3830, 48.4015];
        setUserCoords(defaultUser);
        setNearestPlace(places[0]);
        showToast('موقعیت پیش‌فرض در مرکز شهر دزفول انتخاب شد.');
      },
      { timeout: 8000 }
    );
  };

  const handleToggleReminder = (eventId: string, title: string) => {
    if (savedReminderIds.includes(eventId)) {
      setSavedReminderIds((prev) => prev.filter((id) => id !== eventId));
      showToast(`یادآوری برای «${title.slice(0, 20)}...» لغو شد.`);
    } else {
      setSavedReminderIds((prev) => [...prev, eventId]);
      showToast(`یادآوری «${title.slice(0, 20)}...» با موفقیت تنظیم شد.`);
    }
  };

  const handleAddNewEvent = (newEvent: EventItem) => {
    setEvents((prev) => [newEvent, ...prev]);
    showToast('مراسم جدید با موفقیت ثبت و منتشر گردید.');
  };

  const handleOpenPlaceDetailById = (placeId: string) => {
    const found = places.find((p) => p.id === placeId);
    if (found) {
      setSelectedPlace(found);
    }
  };

  // Filtered Places for Home list according to quick chips
  const filteredPlaces = places.filter((p) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim();
      const match =
        p.name.includes(q) ||
        p.neighborhood.includes(q) ||
        p.address.includes(q);
      if (!match) return false;
    }

    if (activeQuickFilter === 'all') return true;
    if (activeQuickFilter === 'open_now' || activeQuickFilter === 'open-now') return p.isCurrentlyOpen;
    if (activeQuickFilter === 'historical') return p.isHistorical;
    if (activeQuickFilter === 'hussainiyas') return p.type === 'hussainiya';
    if (activeQuickFilter === 'mosques') return p.type === 'mosque';
    if (activeQuickFilter === 'shovadoon') return p.features.shovadoon;
    if (activeQuickFilter === 'ladies') return p.features.ladiesSection;
    if (activeQuickFilter === 'quran') return p.features.quranClasses;
    if (activeQuickFilter === 'wheelchair') return p.features.wheelchairAccess;
    return true;
  });

  // Calculate live counts for quick filters
  const filterCounts = {
    all: places.length,
    openNow: places.filter((p) => p.isCurrentlyOpen).length,
    historical: places.filter((p) => p.isHistorical).length,
    hussainiyas: places.filter((p) => p.type === 'hussainiya').length,
    todayEvents: events.filter((e) => e.isToday).length,
    quranClasses: places.filter((p) => p.features.quranClasses).length,
    ladiesSection: places.filter((p) => p.features.ladiesSection).length,
    wheelchair: places.filter((p) => p.features.wheelchairAccess).length,
    shovadoon: places.filter((p) => p.features.shovadoon).length,
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#1F2430] flex flex-col font-['Vazirmatn',sans-serif] selection:bg-[#0E7C86] selection:text-white">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1F2430] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 animate-slideDown flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#E5B555] animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenPrayerTimes={() => setIsPrayerTimesModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        unreadRemindersCount={savedReminderIds.length}
      />

      {/* Main View Switcher */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 pb-24">
        {activeTab === 'home' && (
          <>
            {/* 2. Dashboard Statistics Cards */}
            <StatsDashboard
              mosquesCount={CITY_STATS.mosquesCount}
              hussainiyasCount={CITY_STATS.hussainiyasCount}
              openNowCount={filterCounts.openNow || CITY_STATS.openNowCount}
              eventsTodayCount={CITY_STATS.eventsTodayCount}
              onFilterClick={(filterKey) => {
                setActiveQuickFilter(filterKey);
              }}
              activeQuickFilter={activeQuickFilter}
            />

            {/* 3. Interactive Leaflet Mini Map */}
            <MiniMap
              places={filteredPlaces}
              onSelectPlace={(place) => setSelectedPlace(place)}
              onOpenFullMap={() => setActiveTab('map')}
              onFindNearest={handleFindNearestMosque}
              userCoords={userCoords}
              nearestPlace={nearestPlace}
            />

            {/* 4. Quick Filter Chips */}
            <QuickFilterChips
              activeFilter={activeQuickFilter}
              onFilterChange={(f) => {
                if (f === 'nearest') {
                  handleFindNearestMosque();
                } else {
                  setActiveQuickFilter(f);
                }
              }}
              counts={filterCounts}
            />

            {/* 5. Featured Historical Places Carousel */}
            <FeaturedCarousel
              places={places}
              onSelectPlace={(place) => setSelectedPlace(place)}
              onViewAllFeatured={() => setActiveQuickFilter('historical')}
            />

            {/* 6. Pulse of the City: Live Events Feed */}
            <LiveEventsFeed
              events={events}
              onSelectEvent={(ev) => {
                const p = places.find((item) => item.id === ev.placeId);
                if (p) setSelectedPlace(p);
              }}
              onOpenPlaceDetailById={handleOpenPlaceDetailById}
              savedReminderIds={savedReminderIds}
              onToggleReminder={handleToggleReminder}
            />

            {/* 7. Neighborhoods Grid */}
            <NeighborhoodsGrid
              neighborhoods={neighborhoods}
              onSelectNeighborhood={(nh) => setSelectedNeighborhood(nh)}
            />

            {/* 8. Community Khadems Banner */}
            <CommunityBanner
              onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            />
          </>
        )}

        {activeTab === 'map' && (
          <FullMapView
            places={places}
            onBack={() => setActiveTab('home')}
            onSelectPlace={(place) => setSelectedPlace(place)}
            userCoords={userCoords}
            onRequestUserLocation={handleFindNearestMosque}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            events={events}
            onSelectEvent={(ev) => {
              const p = places.find((item) => item.id === ev.placeId);
              if (p) setSelectedPlace(p);
            }}
            onOpenPlaceDetailById={handleOpenPlaceDetailById}
            savedReminderIds={savedReminderIds}
            onToggleReminder={handleToggleReminder}
          />
        )}

        {activeTab === 'neighborhoods' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E0D8C8] shadow-xs">
              <h2 className="text-base sm:text-lg font-black text-[#1F2430]">راهنمای جامع محلات دزفول</h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                مساجد، حسینیه‌ها و آثار مذهبی ثبت‌شده به تفکیک محله‌های اصیل و نوساز
              </p>
            </div>
            <NeighborhoodsGrid
              neighborhoods={neighborhoods}
              onSelectNeighborhood={(nh) => setSelectedNeighborhood(nh)}
            />
          </div>
        )}

        {activeTab === 'submit' && (
          <div className="max-w-xl mx-auto py-4">
            <SubmitEventModal
              places={places}
              onClose={() => setActiveTab('home')}
              onAddEvent={handleAddNewEvent}
            />
          </div>
        )}
      </main>

      {/* 9. Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'submit') {
            setIsSubmitModalOpen(true);
          } else {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        todayEventsCount={events.filter((e) => e.isToday).length}
      />

      {/* Place Detail Modal */}
      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          events={events}
          onClose={() => setSelectedPlace(null)}
          onSelectEvent={(ev) => {
            handleToggleReminder(ev.id, ev.title);
          }}
          onToggleReminder={handleToggleReminder}
          savedReminderIds={savedReminderIds}
        />
      )}

      {/* Neighborhood Places Modal */}
      {selectedNeighborhood && (
        <NeighborhoodDetailModal
          neighborhood={selectedNeighborhood}
          places={places}
          onClose={() => setSelectedNeighborhood(null)}
          onSelectPlace={(place) => {
            setSelectedNeighborhood(null);
            setSelectedPlace(place);
          }}
        />
      )}

      {/* Submit Event Modal */}
      {isSubmitModalOpen && (
        <SubmitEventModal
          places={places}
          onClose={() => setIsSubmitModalOpen(false)}
          onAddEvent={handleAddNewEvent}
        />
      )}

      {/* Prayer Times Modal */}
      {isPrayerTimesModalOpen && (
        <PrayerTimesModal
          onClose={() => setIsPrayerTimesModalOpen(false)}
        />
      )}

      {/* Global Search Modal */}
      {isSearchModalOpen && (
        <SearchModal
          places={places}
          events={events}
          neighborhoods={neighborhoods}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectPlace={(place) => {
            setIsSearchModalOpen(false);
            setSelectedPlace(place);
          }}
          onSelectEvent={(ev) => {
            setIsSearchModalOpen(false);
            const p = places.find((item) => item.id === ev.placeId);
            if (p) setSelectedPlace(p);
          }}
          onSelectNeighborhood={(nh) => {
            setIsSearchModalOpen(false);
            setSelectedNeighborhood(nh);
          }}
        />
      )}

      {/* Reminders / Notifications Modal */}
      {isNotificationsModalOpen && (
        <NotificationModal
          savedReminderIds={savedReminderIds}
          events={events}
          onClose={() => setIsNotificationsModalOpen(false)}
          onRemoveReminder={(id) => {
            setSavedReminderIds((prev) => prev.filter((i) => i !== id));
            showToast('یادآوری حذف شد.');
          }}
          onSelectEvent={(ev) => {
            setIsNotificationsModalOpen(false);
            const p = places.find((item) => item.id === ev.placeId);
            if (p) setSelectedPlace(p);
          }}
        />
      )}
    </div>
  );
}

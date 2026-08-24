import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MapPin,
  Warehouse,
  X,
  SlidersHorizontal,
  Navigation,
  ExternalLink,
  ChevronLeft,
  Bookmark,
  Plus,
  Minus,
  RotateCcw,
  Layers,
  Sparkles,
  Building2,
  Calendar
} from 'lucide-react';
import { Place, PlaceType } from '../../types';
import {
  toPersianDigits,
  calculateDistanceMeters,
  formatDistance,
  getRoutingLinks
} from '../../utils/persianUtils';
import { INITIAL_NEIGHBORHOODS } from '../../data/dezfulData';
import { useDevice } from '../../hooks/useDevice';
import { LocationButton } from './LocationButton';
import { createDezfulClusterIcon } from './MapCluster';
import { PlacePopup } from './PlacePopup';

export interface OptimizedMapProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  selectedPlaceId?: string | null;
  userCoords?: [number, number] | null;
  onUserCoordsChange?: (coords: [number, number]) => void;
}

const DEZFUL_CENTER: [number, number] = [32.3838, 48.4020];

export const OptimizedMap: React.FC<OptimizedMapProps> = ({
  places,
  onSelectPlace,
  selectedPlaceId = null,
  userCoords = null,
  onUserCoordsChange
}) => {
  const { isDesktop } = useDevice();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [activePlace, setActivePlace] = useState<Place | null>(() => {
    if (selectedPlaceId) {
      return places.find((p) => p.id === selectedPlaceId) || null;
    }
    return null;
  });
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dezful_saved_places');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      try {
        localStorage.setItem('dezful_saved_places', JSON.stringify(next));
      } catch {
        // silent
      }
      return next;
    });
  };

  // Sync selectedPlaceId prop
  useEffect(() => {
    if (selectedPlaceId) {
      const p = places.find((item) => item.id === selectedPlaceId);
      if (p) {
        setActivePlace(p);
        mapInstanceRef.current?.flyTo(p.coordinates, 16, { duration: 0.6 });
      }
    }
  }, [selectedPlaceId, places]);

  // Filter places
  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // جستجوی متنی
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = place.name.toLowerCase().includes(q);
        const matchNeigh = place.neighborhood.toLowerCase().includes(q);
        const matchAddr = place.address.toLowerCase().includes(q);
        if (!matchName && !matchNeigh && !matchAddr) return false;
      }

      // فیلتر دسته‌بندی
      if (selectedCategory === 'mosque' && place.type !== 'mosque') return false;
      if (selectedCategory === 'hussainiya' && place.type !== 'hussainiya') return false;
      if (selectedCategory === 'shovadoon' && !place.features.shovadoon) return false;
      if (selectedCategory === 'historical' && !place.isHistorical) return false;

      // فیلتر محله
      if (selectedNeighborhood !== 'all') {
        if (
          place.neighborhoodId !== selectedNeighborhood &&
          !place.neighborhood.includes(selectedNeighborhood)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [places, searchQuery, selectedCategory, selectedNeighborhood]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: DEZFUL_CENTER,
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      const tileUrl =
        mapStyle === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // MarkerClusterGroup
      const clusterGroup = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 45,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: createDezfulClusterIcon
      });

      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Update map tile
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      mapStyle === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
  }, [mapStyle]);

  // Invalidate size on desktop/mobile toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [isDesktop]);

  // Render Custom Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup) return;

    clusterGroup.clearLayers();
    markersMapRef.current.clear();

    filteredPlaces.forEach((place) => {
      const isSelected = activePlace?.id === place.id;
      const isMosque = place.type === 'mosque';
      const isHussainiya = place.type === 'hussainiya';
      const hasShovadoon = place.features.shovadoon;

      // رنگ‌بندی و آیکون اختصاصی طبق مشخصات:
      // مسجد: آیکون گنبد سبز (#0E7C86 یا زمردی)
      // حسینیه: آیکون پرچم مشکی (#1F2430 یا دزفولی #B85B35)
      // شوادون: آیکون آبی (#0284C7)
      let bgColor = '#0E7C86';
      let iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M12 2C8.5 5.5 6 9 6 13v8h12v-8c0-4-2.5-7.5-6-11z"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg>`;

      if (isHussainiya) {
        bgColor = '#1F2430'; // پرچم مشکی
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#C26D47" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`;
      } else if (hasShovadoon && !isMosque) {
        bgColor = '#0284C7'; // آبی شوادون
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 10v11"/><path d="M19 10v11"/><path d="M4 10a8 8 0 0 1 16 0"/></svg>`;
      }

      const size = isSelected ? 48 : 38;
      const pulseHtml = isSelected
        ? `<div style="position: absolute; inset: -8px; border-radius: 50%; background: #C26D47; opacity: 0.4; animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
        : '';

      const customDivIcon = L.divIcon({
        className: 'dezful-optimized-pin',
        html: `
          <div style="position: relative; width: ${size}px; height: ${size}px;">
            ${pulseHtml}
            <div style="
              width: 100%;
              height: 100%;
              background: ${bgColor};
              border: ${isSelected ? '3.5px solid #F59E0B' : '2.5px solid #FFFFFF'};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              box-shadow: ${isSelected ? '0 6px 20px rgba(0,0,0,0.45)' : '0 3px 10px rgba(0,0,0,0.25)'};
              cursor: pointer;
              transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
              transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
              ${iconSvg}
            </div>
            ${
              hasShovadoon
                ? `<div style="position: absolute; -bottom: 2px; -left: 2px; background: #0284C7; color: white; border: 1.5px solid white; border-radius: 50%; width: 15px; height: 15px; font-size: 8px; font-weight: 900; display: flex; align-items: center; justify-content: center;">ش</div>`
                : ''
            }
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker(place.coordinates, { icon: customDivIcon });

      marker.on('click', () => {
        handleSelectPlace(place, false);
      });

      clusterGroup.addLayer(marker);
      markersMapRef.current.set(place.id, marker);
    });
  }, [filteredPlaces, activePlace]);

  // Render User Live Location Marker (Blue circle + white border + pulse)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userCoords);
      } else {
        const userLocIcon = L.divIcon({
          className: 'user-pulse-marker',
          html: `
            <div style="position: relative; width: 26px; height: 26px;">
              <div style="position: absolute; inset: 0; background: #0284C7; border-radius: 50%; opacity: 0.45; animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: absolute; inset: 3px; background: #0284C7; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 10px rgba(2, 132, 199, 0.5);"></div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker(userCoords, { icon: userLocIcon }).addTo(map);
        userMarkerRef.current = marker;
      }
    }
  }, [userCoords]);

  // Handle select place
  const handleSelectPlace = (place: Place, flyTo: boolean = true) => {
    setActivePlace(place);
    if (flyTo && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(place.coordinates, 16, { duration: 0.6 });
    }

    if (isDesktop) {
      const cardEl = document.getElementById(`map-list-card-${place.id}`);
      if (cardEl && listScrollRef.current) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleLocationFound = (coords: { lat: number; lng: number }) => {
    const newCoords: [number, number] = [coords.lat, coords.lng];
    if (onUserCoordsChange) {
      onUserCoordsChange(newCoords);
    }
    mapInstanceRef.current?.flyTo(newCoords, 16, { duration: 0.7 });
  };

  return (
    <div
      id="optimized-map-layout"
      className="relative w-full h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-[#FAF7F2] dark:bg-slate-950 font-['Vazirmatn'] select-none"
      dir="rtl"
    >
      {/* ============================================================== */}
      {/* 🖥️ ۱. لیست ۴۰٪ در حالت دسکتاپ (Split View)                      */}
      {/* ============================================================== */}
      {isDesktop && (
        <aside
          id="desktop-map-sidebar"
          className="w-[40%] xl:w-[38%] h-full bg-white/95 dark:bg-slate-900/95 border-l border-stone-200/80 dark:border-slate-800 flex flex-col z-20 shadow-md overflow-hidden shrink-0"
        >
          {/* سربرگ جستجو و فیلتر */}
          <div className="p-4 border-b border-stone-200/80 dark:border-slate-800 space-y-3 bg-[#FAF7F2]/80 dark:bg-slate-900/80 shrink-0 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0E7C86]/10 text-[#0E7C86] flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-stone-900 dark:text-white">
                    اماکن مذهبی دزفول
                  </h2>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {toPersianDigits(filteredPlaces.length)} مکان روی نقشه
                  </p>
                </div>
              </div>
            </div>

            {/* فیلد جستجو */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام مسجد، حسینیه یا محله..."
                className="w-full pr-10 pl-8 py-2 text-xs bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0E7C86] text-stone-900 dark:text-white shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-2.5 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* چیپ‌های فیلتر سریع */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
              {[
                { id: 'all', label: 'همه' },
                { id: 'mosque', label: 'مساجد' },
                { id: 'hussainiya', label: 'حسینیه‌ها' },
                { id: 'shovadoon', label: 'دارای شوادون' },
                { id: 'historical', label: 'کهن' }
              ].map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#0E7C86] text-white shadow-sm shadow-[#0E7C86]/20'
                        : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-slate-700 hover:border-[#0E7C86]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* انتخاب محله */}
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl px-3 py-2 text-stone-700 dark:text-stone-300 focus:outline-none focus:border-[#0E7C86]"
            >
              <option value="all">همه محلات دزفول</option>
              {INITIAL_NEIGHBORHOODS.map((nh) => (
                <option key={nh.id} value={nh.name}>
                  محله {nh.name}
                </option>
              ))}
            </select>
          </div>

          {/* لیست اماکن در سایدبار دسکتاپ */}
          <div
            ref={listScrollRef}
            className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-stone-50/50 dark:bg-slate-900/50"
          >
            {filteredPlaces.map((place) => {
              const isSelected = activePlace?.id === place.id;
              const isHussainiya = place.type === 'hussainiya';
              const isBookmarked = bookmarkedIds.includes(place.id);

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

              return (
                <div
                  key={place.id}
                  id={`map-list-card-${place.id}`}
                  onClick={() => handleSelectPlace(place, true)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-[#0E7C86] ring-2 ring-[#0E7C86]/20 shadow-md'
                      : 'bg-white dark:bg-slate-800/80 border-stone-200/80 dark:border-slate-800 hover:border-stone-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-sm text-stone-900 dark:text-white truncate">
                          {place.name}
                        </h4>
                        {place.isHistorical && (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">
                            کهن
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C26D47] shrink-0" />
                        <span className="truncate">{place.neighborhood}</span>
                        {distStr && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {distStr}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(place.id);
                      }}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        isBookmarked
                          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-600'
                          : 'border-stone-200 dark:border-slate-700 text-stone-400 hover:text-stone-700'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* دکمه‌های سریع در حالت انتخاب */}
                  {isSelected && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 pt-2.5 border-t border-stone-100 dark:border-slate-700 flex items-center gap-2"
                    >
                      <button
                        onClick={() => onSelectPlace(place)}
                        className="flex-1 bg-[#0E7C86] hover:bg-[#0c6b74] text-white py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>مشاهده صفحه کامل</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* ============================================================== */}
      {/* 🗺️ ۲. کانتینر نقشه Leaflet (۶۰٪ دسکتاپ، ۱۰۰٪ موبایل)             */}
      {/* ============================================================== */}
      <main
        id="leaflet-map-canvas"
        className={`relative h-full flex-1 overflow-hidden ${
          isDesktop ? 'w-[60%] xl:w-[62%]' : 'w-full'
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* دکمه‌های زوم فقط در دسکتاپ */}
        {isDesktop && (
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-lg border border-stone-200/90 dark:border-slate-800 flex flex-col overflow-hidden backdrop-blur-md">
              <button
                onClick={() => mapInstanceRef.current?.zoomIn()}
                className="p-2.5 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors border-b border-stone-100 dark:border-slate-800"
                title="بزرگ‌نمایی"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => mapInstanceRef.current?.zoomOut()}
                className="p-2.5 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                title="کوچک‌نمایی"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => mapInstanceRef.current?.flyTo(DEZFUL_CENTER, 14, { duration: 0.6 })}
              className="p-2.5 bg-white/95 dark:bg-slate-900/95 text-[#C26D47] rounded-2xl shadow-lg border border-stone-200/90 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors backdrop-blur-md"
              title="مرکز دزفول"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMapStyle(mapStyle === 'streets' ? 'satellite' : 'streets')}
              className={`p-2.5 rounded-2xl shadow-lg border backdrop-blur-md transition-colors ${
                mapStyle === 'satellite'
                  ? 'bg-[#0E7C86] text-white border-[#0E7C86]'
                  : 'bg-white/95 dark:bg-slate-900/95 text-stone-700 dark:text-stone-300 border-stone-200/90 dark:border-slate-800'
              }`}
              title="تغییر لایه نقشه"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* دکمه شناور موقعیت من در گوشه پایین نقشه */}
        <div className="absolute bottom-6 right-4 z-20">
          <LocationButton onLocationFound={handleLocationFound} />
        </div>

        {/* ============================================================== */}
        {/* 📱 ۳. باتم‌شیت لمسی موبایل برای مکان انتخاب‌شده                 */}
        {/* ============================================================== */}
        <AnimatePresence>
          {!isDesktop && activePlace && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="absolute bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-t-3xl border-t border-stone-200 dark:border-slate-800 shadow-2xl p-4"
            >
              <div className="w-10 h-1.5 bg-stone-300 dark:bg-slate-700 rounded-full mx-auto mb-3 shrink-0" />
              <PlacePopup
                place={activePlace}
                userCoords={userCoords}
                onViewDetails={onSelectPlace}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default OptimizedMap;

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Search,
  MapPin,
  Warehouse,
  X,
  SlidersHorizontal,
  Navigation,
  Compass,
  Clock,
  ExternalLink,
  ChevronDown,
  Building2,
  Accessibility,
  Droplets,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Car,
  Users,
  Check,
  ChevronLeft,
  Share2,
  Bookmark,
  Layers,
  Map as MapIcon,
  List as ListIcon
} from 'lucide-react';
import { Place, PlaceType } from '../types';
import {
  toPersianDigits,
  calculateDistanceMeters,
  formatDistance,
  getRoutingLinks
} from '../utils/persianUtils';
import { INITIAL_NEIGHBORHOODS } from '../data/dezfulData';
import { EmptyState } from './EmptyState';
import { useDevice } from '../hooks/useDevice';
import { useAppStore } from '../store/appStore';

export interface MapViewProps {
  places: Place[];
  onBack?: () => void;
  onSelectPlace: (place: Place) => void;
  userCoords?: [number, number] | null;
  onRequestUserLocation?: () => void;
  initialSelectedPlaceId?: string | null;
}

export interface FilterState {
  type: 'all' | PlaceType | 'historical' | 'shovadoon';
  openOnly: boolean;
  neighborhoodId: string;
  facilities: {
    parking: boolean;
    ladiesSection: boolean;
    wuduFacilities: boolean;
    wheelchairAccess: boolean;
    shovadoon: boolean;
    quranClasses: boolean;
  };
}

const DEFAULT_FILTERS: FilterState = {
  type: 'all',
  openOnly: false,
  neighborhoodId: 'all',
  facilities: {
    parking: false,
    ladiesSection: false,
    wuduFacilities: false,
    wheelchairAccess: false,
    shovadoon: false,
    quranClasses: false,
  }
};

const DEZFUL_CENTER: [number, number] = [32.3838, 48.4020];

export const MapView: React.FC<MapViewProps> = ({
  places,
  onBack,
  onSelectPlace,
  userCoords = null,
  onRequestUserLocation,
  initialSelectedPlaceId = null
}) => {
  const { isMobile } = useDevice();
  const { isDarkMode } = useAppStore();
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dezful_saved_places');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleSavePlace = (id: string) => {
    setSavedPlaceIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      try {
        localStorage.setItem('dezful_saved_places', JSON.stringify(next));
      } catch {
        // silent
      }
      return next;
    });
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const placeListContainerRef = useRef<HTMLDivElement>(null);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(() => {
    if (initialSelectedPlaceId) {
      return places.find((p) => p.id === initialSelectedPlaceId) || null;
    }
    return null;
  });
  const [activeRoutingPlaceId, setActiveRoutingPlaceId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<'distance' | 'popular' | 'name'>('distance');
  const [mapTileStyle, setMapTileStyle] = useState<'streets' | 'satellite'>('streets');

  // Count active filters for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.openOnly) count++;
    if (filters.neighborhoodId !== 'all') count++;
    Object.values(filters.facilities).forEach((val) => {
      if (val) count++;
    });
    return count;
  }, [filters]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = place.name.toLowerCase().includes(q);
        const matchNeigh = place.neighborhood.toLowerCase().includes(q);
        const matchAddr = place.address.toLowerCase().includes(q);
        const matchHist = place.historySummary?.toLowerCase().includes(q);
        if (!matchName && !matchNeigh && !matchAddr && !matchHist) return false;
      }

      // 2. Type Filter
      if (filters.type === 'historical') {
        if (!place.isHistorical) return false;
      } else if (filters.type === 'shovadoon') {
        if (!place.features.shovadoon) return false;
      } else if (filters.type !== 'all') {
        if (place.type !== filters.type) return false;
      }

      // 3. Open Now
      if (filters.openOnly && !place.isCurrentlyOpen) {
        return false;
      }

      // 4. Neighborhood
      if (filters.neighborhoodId !== 'all') {
        if (place.neighborhoodId !== filters.neighborhoodId && !place.neighborhood.includes(filters.neighborhoodId)) {
          return false;
        }
      }

      // 5. Facilities
      const fac = filters.facilities;
      if (fac.parking && !place.features.parking) return false;
      if (fac.ladiesSection && !place.features.ladiesSection) return false;
      if (fac.wuduFacilities && !place.features.wuduFacilities) return false;
      if (fac.wheelchairAccess && !place.features.wheelchairAccess) return false;
      if (fac.shovadoon && !place.features.shovadoon) return false;
      if (fac.quranClasses && !place.features.quranClasses) return false;

      return true;
    });
  }, [places, searchQuery, filters]);

  // Sorted Places for Left Sidebar / List
  const sortedPlaces = useMemo(() => {
    const list = [...filteredPlaces];
    if (sortBy === 'distance' && userCoords) {
      list.sort((a, b) => {
        const distA = calculateDistanceMeters(userCoords[0], userCoords[1], a.coordinates[0], a.coordinates[1]);
        const distB = calculateDistanceMeters(userCoords[0], userCoords[1], b.coordinates[0], b.coordinates[1]);
        return distA - distB;
      });
    } else if (sortBy === 'popular') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
    }
    return list;
  }, [filteredPlaces, sortBy, userCoords]);

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

      const tileUrl = mapTileStyle === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Marker Cluster Group with Dezful terracotta styling
      const clusterGroup = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 40,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: (cluster: any) => {
          const childCount = cluster.getChildCount();
          const persianCount = toPersianDigits(childCount);
          let sizeClass = 'cluster-small';
          if (childCount >= 10) sizeClass = 'cluster-large';
          else if (childCount >= 5) sizeClass = 'cluster-medium';

          return L.divIcon({
            html: `<div class="dezful-cluster-marker ${sizeClass}"><span>${persianCount}</span></div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(44, 44),
            iconAnchor: [22, 22]
          });
        }
      });

      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Update tile layer if style changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl = mapTileStyle === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
  }, [mapTileStyle]);

  // Handle Resize whenever layout changes (e.g. mobile vs desktop switch)
  useEffect(() => {
    const handleResize = () => {
      mapInstanceRef.current?.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isMobile]);

  // Handle markers rendering
  useEffect(() => {
    const map = mapInstanceRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup) return;

    clusterGroup.clearLayers();
    markersMapRef.current.clear();

    filteredPlaces.forEach((place) => {
      const isHistorical = place.isHistorical;
      const isHussainiya = place.type === 'hussainiya';
      const isShrine = place.type === 'shrine';
      const isSelected = selectedPlace?.id === place.id;

      let bgColor = '#0E7C86';
      if (isHussainiya) bgColor = '#B4552D';
      if (isShrine) bgColor = '#0E7C86';

      const pinSize = isSelected ? 44 : 36;
      const borderStyle = isSelected ? '4px solid #E5B555' : '3px solid #FFFFFF';
      const scaleTransform = isSelected ? 'scale(1.18)' : 'scale(1)';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: ${pinSize}px; height: ${pinSize}px; background: ${bgColor}; border: ${borderStyle}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.35); color: #FFF; cursor: pointer; transform: ${scaleTransform}; transition: all 0.2s ease-in-out;">
            ${
              isHussainiya
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`
                : isShrine
                ? `<svg width="19" height="19" viewBox="0 0 24 24" fill="#E5B555" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
                : `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M12 2C8.5 5.5 6 9 6 13v8h12v-8c0-4-2.5-7.5-6-11z"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg>`
            }
            ${
              isHistorical
                ? `<div style="position: absolute; top: -5px; right: -5px; background: #E5B555; color: #1F2430; border-radius: 50%; width: 15px; height: 15px; font-size: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; box-shadow: 0 1px 4px rgba(0,0,0,0.3);">★</div>`
                : ''
            }
            ${
              place.features.shovadoon
                ? `<div style="position: absolute; bottom: -4px; left: -4px; background: #1F2430; color: #E5B555; border-radius: 50%; width: 14px; height: 14px; font-size: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 1px solid #DDD;">ش</div>`
                : ''
            }
          </div>
        `,
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize / 2],
      });

      const marker = L.marker(place.coordinates, { icon: customIcon });

      marker.on('click', () => {
        handleSelectPlace(place, false);
      });

      clusterGroup.addLayer(marker);
      markersMapRef.current.set(place.id, marker);
    });
  }, [filteredPlaces, selectedPlace]);

  // Handle user live location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userCoords);
      } else {
        const userIcon = L.divIcon({
          className: 'user-loc-marker',
          html: `
            <div style="position: relative; width: 22px; height: 22px;">
              <div style="position: absolute; inset: 0; background: #3B82F6; border-radius: 50%; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: absolute; inset: 3px; background: #2563EB; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker(userCoords, { icon: userIcon }).addTo(map);
        userMarkerRef.current = marker;
      }
    }
  }, [userCoords]);

  // Action: Select Place from List or Marker
  const handleSelectPlace = (place: Place, panMap: boolean = true) => {
    setSelectedPlace(place);
    setActiveRoutingPlaceId(null);

    if (panMap && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(place.coordinates, 16, { duration: 0.8 });
    }

    // If on desktop, scroll left sidebar to highlighted card
    if (!isMobile) {
      const cardEl = document.getElementById(`split-place-card-${place.id}`);
      if (cardEl && placeListContainerRef.current) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // Map Controls Helpers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetToDezful = () => {
    setSelectedPlace(null);
    mapInstanceRef.current?.flyTo(DEZFUL_CENTER, 14, { duration: 0.8 });
  };
  const handleGoToUserLocation = () => {
    if (userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userCoords, 16, { duration: 0.8 });
    } else if (onRequestUserLocation) {
      onRequestUserLocation();
    }
  };

  return (
    <div
      id="dezful-map-view-container"
      className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-56px)] flex flex-col md:flex-row overflow-hidden font-['Vazirmatn',sans-serif] select-none"
    >
      {/* ============================================================== */}
      {/* 🖥️ ۱. لیست ۴۰٪ سمت چپ برای دسکتاپ (Split View)                 */}
      {/* در چیدمان فارسی RTL:                                          */}
      {/* لیست در سمت چپ (order-2 یا دومین المنت در flex-row) قرار می‌گیرد */}
      {/* ============================================================== */}
      {!isMobile && (
        <aside
          id="split-view-places-sidebar"
          className="w-[40%] xl:w-[38%] h-full bg-white dark:bg-slate-900 border-r border-stone-200/80 dark:border-slate-800 flex flex-col z-20 shadow-lg overflow-hidden shrink-0 order-2 md:order-1"
        >
          {/* سربرگ لیست سمت چپ */}
          <div className="p-3.5 border-b border-stone-200 dark:border-slate-800 space-y-3 bg-[#FAF8F5] dark:bg-slate-900/90 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C26D47]/15 text-[#C26D47] flex items-center justify-center font-bold text-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                    اماکن مذهبی و کهن دزفول
                  </h3>
                  <p className="text-[10px] text-stone-500 dark:text-slate-400">
                    {toPersianDigits(filteredPlaces.length)} مکان یافت شد
                  </p>
                </div>
              </div>

              {/* دکمه بازگشت به خانه (اختیاری) */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>بازگشت</span>
                </button>
              )}
            </div>

            {/* نوار جستجوی زنده */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام، محله، شوادون یا تاریخچه..."
                className="w-full pr-9 pl-8 py-2 text-xs bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#C26D47] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* فیلترهای سریع افقی */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {[
                { id: 'all', label: 'همه' },
                { id: 'mosque', label: 'مساجد' },
                { id: 'hussainiya', label: 'حسینیه‌ها' },
                { id: 'shrine', label: 'بقاع متبرکه' },
                { id: 'shovadoon', label: 'دارای شوادون' },
                { id: 'historical', label: 'آثار کهن' },
              ].map((chip) => {
                const isActive = filters.type === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setFilters({ ...filters, type: chip.id as any })}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all font-medium ${
                      isActive
                        ? 'bg-[#C26D47] text-white shadow-2xs font-bold'
                        : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-slate-700 hover:border-[#C26D47]'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* فیلتر محله و مرتب‌سازی */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <select
                value={filters.neighborhoodId}
                onChange={(e) => setFilters({ ...filters, neighborhoodId: e.target.value })}
                className="text-[11px] bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg px-2 py-1 text-stone-700 dark:text-slate-300 focus:outline-none focus:border-[#C26D47] max-w-[150px] truncate"
              >
                <option value="all">همه محله‌های دزفول</option>
                {INITIAL_NEIGHBORHOODS.map((nh) => (
                  <option key={nh.id} value={nh.name}>
                    {nh.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <span>مرتب‌سازی:</span>
                <button
                  onClick={() => setSortBy(sortBy === 'distance' ? 'popular' : sortBy === 'popular' ? 'name' : 'distance')}
                  className="font-bold text-[#C26D47] hover:underline"
                >
                  {sortBy === 'distance' ? 'نزدیک‌ترین' : sortBy === 'popular' ? 'محبوب‌ترین' : 'بر اساس نام'}
                </button>
              </div>
            </div>
          </div>

          {/* بدنه اسکرول‌شونده لیست اماکن */}
          <div
            ref={placeListContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-stone-50/60 dark:bg-slate-900/60"
          >
            {sortedPlaces.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="مکانی یافت نشد"
                description="عبارت جستجو یا فیلترها را تغییر دهید."
                onReset={() => {
                  setSearchQuery('');
                  setFilters(DEFAULT_FILTERS);
                }}
              />
            ) : (
              sortedPlaces.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                const isHussainiya = place.type === 'hussainiya';
                const isShrine = place.type === 'shrine';
                const isBookmarked = savedPlaceIds.includes(place.id);

                let distStr = '';
                if (userCoords) {
                  const d = calculateDistanceMeters(userCoords[0], userCoords[1], place.coordinates[0], place.coordinates[1]);
                  distStr = formatDistance(d);
                }

                return (
                  <div
                    key={place.id}
                    id={`split-place-card-${place.id}`}
                    onClick={() => handleSelectPlace(place, true)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-[#C26D47] ring-2 ring-[#C26D47]/20 shadow-md scale-[1.01]'
                        : 'bg-white dark:bg-slate-800/90 border-stone-200/90 dark:border-slate-800 hover:border-[#C26D47]/50 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* تصویر بندانگشتی یا نشان دسته‌بندی */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 dark:bg-slate-700 shrink-0">
                        {place.image ? (
                          <img
                            src={place.image}
                            alt={place.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center text-white text-xs font-bold ${
                              isHussainiya ? 'bg-[#B4552D]' : isShrine ? 'bg-[#0E7C86]' : 'bg-[#0E7C86]'
                            }`}
                          >
                            {place.name.slice(0, 1)}
                          </div>
                        )}
                        {place.features.shovadoon && (
                          <span className="absolute bottom-0 right-0 left-0 bg-[#1F2430]/90 text-[#E5B555] text-[9px] py-0.5 text-center font-bold">
                            شوادون
                          </span>
                        )}
                      </div>

                      {/* اطلاعات مکان */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs text-stone-900 dark:text-white truncate">
                            {place.name}
                          </h4>
                          {place.isHistorical && (
                            <span className="text-[9px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded font-bold shrink-0">
                              کهن
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-stone-500 dark:text-slate-400 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{place.neighborhood}</span>
                          {distStr && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{distStr}</span>
                            </>
                          )}
                        </div>

                        <p className="text-[10px] text-stone-500 dark:text-slate-400 truncate mt-1">
                          {place.address}
                        </p>

                        {/* برچسب‌های امکانات */}
                        <div className="flex items-center gap-1 mt-2 text-[9px]">
                          {place.isCurrentlyOpen ? (
                            <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded font-bold">
                              باز الان
                            </span>
                          ) : (
                            <span className="text-stone-500 bg-stone-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              بسته
                            </span>
                          )}
                          {place.features.parking && (
                            <span className="bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                              پارکینگ
                            </span>
                          )}
                          {place.features.ladiesSection && (
                            <span className="bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                              خواهران
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* دکمه‌های اقدام سریع در صورت انتخاب بودن کارت */}
                    {isSelected && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 pt-2.5 border-t border-stone-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs animate-fadeIn"
                      >
                        <button
                          onClick={() => onSelectPlace(place)}
                          className="flex-1 bg-[#C26D47] hover:bg-[#a95733] text-white py-1.5 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs text-[11px]"
                        >
                          <span>مشاهده صفحه کامل</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setActiveRoutingPlaceId(activeRoutingPlaceId === place.id ? null : place.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-2.5 rounded-xl font-bold flex items-center gap-1 transition-colors text-[11px]"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>مسیریابی</span>
                          </button>

                          {activeRoutingPlaceId === place.id && (
                            <div className="absolute left-0 bottom-full mb-1.5 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 z-30 min-w-[130px] animate-slideUp">
                              {(() => {
                                const links = getRoutingLinks(place.coordinates[0], place.coordinates[1], place.name);
                                return (
                                  <>
                                    <a
                                      href={links.neshan}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 text-[11px] rounded-lg hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 flex items-center justify-between"
                                    >
                                      <span>نشان</span>
                                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                    </a>
                                    <a
                                      href={links.balad}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 text-[11px] rounded-lg hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 flex items-center justify-between"
                                    >
                                      <span>بلد</span>
                                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                    </a>
                                    <a
                                      href={links.googleMaps}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 text-[11px] rounded-lg hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 flex items-center justify-between"
                                    >
                                      <span>گوگل مپ</span>
                                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                    </a>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => toggleSavePlace(place.id)}
                          className={`p-1.5 rounded-xl border transition-colors ${
                            isBookmarked
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-600'
                              : 'border-stone-200 dark:border-slate-700 text-stone-500 hover:text-stone-800'
                          }`}
                          title="ذخیره مکان"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}

      {/* ============================================================== */}
      {/* 🗺️ ۲. بخش نقشه Leaflet:                                        */}
      {/* در دسکتاپ: ۶۰٪ سمت راست (order-1 یا اول در RTL)                  */}
      {/* در موبایل: ۱۰۰٪ تمام‌صفحه با دکمه‌ها و Bottom Sheet شناور       */}
      {/* ============================================================== */}
      <main
        id="leaflet-map-section"
        className={`relative h-full flex-1 overflow-hidden order-1 md:order-2 ${
          isMobile ? 'w-full' : 'w-[60%] xl:w-[62%]'
        }`}
      >
        {/* کانتینر اصلی نقشه Leaflet */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* دکمه‌های کنترل شناور روی نقشه (موبایل و دسکتاپ) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          {/* دکمه بازگشت در موبایل */}
          {isMobile && onBack && (
            <button
              onClick={onBack}
              className="p-2.5 bg-white/95 dark:bg-slate-900/95 text-stone-800 dark:text-white rounded-2xl shadow-lg border border-stone-200 dark:border-slate-800 backdrop-blur-sm"
              title="بازگشت"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* فیلترهای پیشرفته در موبایل */}
          {isMobile && (
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="relative p-2.5 bg-white/95 dark:bg-slate-900/95 text-stone-800 dark:text-white rounded-2xl shadow-lg border border-stone-200 dark:border-slate-800 backdrop-blur-sm"
              title="فیلترها"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#C26D47]" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B4552D] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {toPersianDigits(activeFiltersCount)}
                </span>
              )}
            </button>
          )}
        </div>

        {/* کنترل‌های سمت چپ نقشه (Zoom, Reset, Location, Style) */}
        <div className="absolute bottom-6 right-3 z-20 flex flex-col gap-2">
          {/* بزرگ‌نمایی و کوچک‌نمایی */}
          <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-lg border border-stone-200 dark:border-slate-800 flex flex-col overflow-hidden backdrop-blur-sm">
            <button
              onClick={handleZoomIn}
              className="p-2.5 text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors border-b border-stone-100 dark:border-slate-800"
              title="بزرگ‌نمایی"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2.5 text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              title="کوچک‌نمایی"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* موقعیت من */}
          <button
            onClick={handleGoToUserLocation}
            className="p-2.5 bg-white/95 dark:bg-slate-900/95 text-blue-600 dark:text-blue-400 rounded-2xl shadow-lg border border-stone-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors backdrop-blur-sm"
            title="موقعیت فعلی من"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* بازگشت به مرکز دزفول */}
          <button
            onClick={handleResetToDezful}
            className="p-2.5 bg-white/95 dark:bg-slate-900/95 text-[#C26D47] rounded-2xl shadow-lg border border-stone-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors backdrop-blur-sm"
            title="مرکز شهر دزفول"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* تغییر لایه نقشه (خیابان / ماهواره) */}
          <button
            onClick={() => setMapTileStyle(mapTileStyle === 'streets' ? 'satellite' : 'streets')}
            className={`p-2.5 rounded-2xl shadow-lg border backdrop-blur-sm transition-colors ${
              mapTileStyle === 'satellite'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white/95 dark:bg-slate-900/95 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-800'
            }`}
            title="تغییر لایه نقشه"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* نشانگر بالای نقشه: وضعیت راهنمای رنگ‌های دزفول */}
        <div className="absolute top-3 left-3 z-20 hidden sm:flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-stone-200/80 dark:border-slate-800 text-[10px] text-stone-700 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C86]"></span>
            <span>مسجد</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B4552D]"></span>
            <span>حسینیه</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5B555]"></span>
            <span>اثر کهن / شوادون</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 📱 ۳. باتم شیت موبایل (Bottom Sheet) هنگام کلیک روی مارکر     */}
        {/* ============================================================== */}
        <AnimatePresence>
          {isMobile && selectedPlace && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 90 || info.velocity.y > 400) {
                  setSelectedPlace(null);
                }
              }}
              className="absolute bottom-0 left-0 right-0 z-30 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-t-3xl border-t border-stone-200 dark:border-slate-800 shadow-2xl p-4 max-h-[75vh] flex flex-col"
            >
              {/* دستگیره لمسی کشیدن */}
              <div className="w-10 h-1.5 bg-stone-300 dark:bg-slate-700 rounded-full mx-auto mb-3 shrink-0" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-100 dark:bg-slate-800 shrink-0">
                    {selectedPlace.image ? (
                      <img
                        src={selectedPlace.image}
                        alt={selectedPlace.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center text-white text-sm font-bold ${
                          selectedPlace.type === 'hussainiya' ? 'bg-[#B4552D]' : 'bg-[#0E7C86]'
                        }`}
                      >
                        {selectedPlace.name.slice(0, 1)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-sm text-stone-900 dark:text-white truncate">
                        {selectedPlace.name}
                      </h3>
                      {selectedPlace.isHistorical && (
                        <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">
                          کهن
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-slate-400 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-[#C26D47] shrink-0" />
                      <span>{selectedPlace.neighborhood}</span>
                      {userCoords && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {formatDistance(
                              calculateDistanceMeters(
                                userCoords[0],
                                userCoords[1],
                                selectedPlace.coordinates[0],
                                selectedPlace.coordinates[1]
                              )
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlace(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* امکانات و شوادون */}
              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-[10px]">
                {selectedPlace.features.shovadoon && (
                  <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300/40 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                    <Warehouse className="w-3 h-3 text-amber-600" />
                    <span>دارای شوادون کهن</span>
                  </span>
                )}
                {selectedPlace.isCurrentlyOpen ? (
                  <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg font-bold">
                    باز الان
                  </span>
                ) : (
                  <span className="bg-stone-100 dark:bg-slate-800 text-stone-500 px-2 py-0.5 rounded-lg">
                    بسته
                  </span>
                )}
                {selectedPlace.features.parking && (
                  <span className="bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 px-2 py-0.5 rounded-lg">
                    پارکینگ
                  </span>
                )}
                {selectedPlace.features.ladiesSection && (
                  <span className="bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 px-2 py-0.5 rounded-lg">
                    بخش خواهران
                  </span>
                )}
              </div>

              {/* دکمه‌های عملیاتی باتم شیت */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-200 dark:border-slate-800">
                <button
                  onClick={() => onSelectPlace(selectedPlace)}
                  className="bg-[#C26D47] hover:bg-[#a95733] text-white py-2 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                >
                  <span>مشاهده جزئیات کامل</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setActiveRoutingPlaceId(activeRoutingPlaceId === selectedPlace.id ? null : selectedPlace.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>مسیریابی هوشمند</span>
                  </button>

                  {activeRoutingPlaceId === selectedPlace.id && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-40 animate-slideUp">
                      {(() => {
                        const links = getRoutingLinks(selectedPlace.coordinates[0], selectedPlace.coordinates[1], selectedPlace.name);
                        return (
                          <>
                            <a
                              href={links.neshan}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs rounded-xl hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 flex items-center justify-between font-bold"
                            >
                              <span>مسیریاب نشان</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                            <a
                              href={links.balad}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs rounded-xl hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 flex items-center justify-between font-bold"
                            >
                              <span>مسیریاب بلد</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                            <a
                              href={links.googleMaps}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs rounded-xl hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 flex items-center justify-between font-bold"
                            >
                              <span>گوگل مپ</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

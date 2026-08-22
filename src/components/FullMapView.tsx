import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  ArrowRight, 
  Layers, 
  Navigation, 
  Search, 
  Sparkles, 
  MapPin, 
  DoorOpen, 
  Warehouse, 
  X, 
  ChevronLeft,
  SlidersHorizontal,
  Map as MapIcon,
  List as ListIcon,
  Check,
  RotateCcw,
  Car,
  Users,
  Compass,
  Clock,
  ExternalLink,
  ChevronDown,
  Building2,
  BookOpen,
  Accessibility,
  Droplets,
  Plus,
  Minus,
  Navigation2
} from 'lucide-react';
import { Place, PlaceType } from '../types';
import { 
  toPersianDigits, 
  calculateDistanceMeters, 
  formatDistance, 
  getRoutingLinks,
  DEZFUL_PRAYER_TIMES 
} from '../utils/persianUtils';
import { INITIAL_NEIGHBORHOODS } from '../data/dezfulData';

interface FullMapViewProps {
  places: Place[];
  onBack: () => void;
  onSelectPlace: (place: Place) => void;
  userCoords: [number, number] | null;
  onRequestUserLocation: () => void;
}

interface FilterState {
  type: 'all' | PlaceType | 'historical';
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

export const FullMapView: React.FC<FullMapViewProps> = ({
  places,
  onBack,
  onSelectPlace,
  userCoords,
  onRequestUserLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedPinPlace, setSelectedPinPlace] = useState<Place | null>(null);
  const [activeRoutingPlaceId, setActiveRoutingPlaceId] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<'distance' | 'popular' | 'name'>('distance');

  const DEZFUL_CENTER: [number, number] = [32.3838, 48.4020];

  // Count active filters (for badge)
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

  // Filtered places list
  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        const matchName = place.name.includes(q);
        const matchNeigh = place.neighborhood.includes(q);
        const matchAddr = place.address.includes(q);
        const matchHist = place.historySummary?.includes(q);
        if (!matchName && !matchNeigh && !matchAddr && !matchHist) return false;
      }

      // 2. Type filter
      if (filters.type === 'historical') {
        if (!place.isHistorical) return false;
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

  // Sorted places for List view
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
    if (viewMode !== 'map') return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: DEZFUL_CENTER,
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map initialized when just switching views or cleanup on unmount
    };
  }, [viewMode]);

  // Sync Leaflet size when returning to Map view
  useEffect(() => {
    if (viewMode === 'map' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [viewMode]);

  // Render & Update Markers on Map
  useEffect(() => {
    if (viewMode !== 'map') return;
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredPlaces.forEach((place) => {
      const isHistorical = place.isHistorical;
      const isHussainiya = place.type === 'hussainiya';
      const isShrine = place.type === 'shrine';
      const isSelected = selectedPinPlace?.id === place.id;

      // Color coding:
      // Mosque: Turquoise #0E7C86
      // Hussainiya: Brick #B4552D
      // Shrine: Emerald/Gold Accent
      let bgColor = '#0E7C86';
      if (isHussainiya) bgColor = '#B4552D';
      if (isShrine) bgColor = '#0E7C86';

      const pinSize = isSelected ? 42 : 36;
      const borderStyle = isSelected ? '4px solid #E5B555' : '3px solid #FFFFFF';
      const scaleTransform = isSelected ? 'scale(1.15)' : 'scale(1)';

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
        setSelectedPinPlace(place);
        setActiveRoutingPlaceId(null);
        map.flyTo(place.coordinates, 16, { duration: 0.7 });
      });

      markersGroup.addLayer(marker);
    });

    // Render User Location
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-pin',
        html: `
          <div style="position: relative; width: 28px; height: 28px;">
            <div style="position: absolute; inset: 0; background: #0E7C86; border-radius: 50%; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; inset: 4px; background: #0E7C86; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userCoords);
      } else {
        userMarkerRef.current = L.marker(userCoords, { icon: userIcon }).addTo(markersGroup);
      }
    }
  }, [filteredPlaces, selectedPinPlace, userCoords, viewMode]);

  // Center on user GPS position
  const handleCenterOnUser = () => {
    onRequestUserLocation();
    if (userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userCoords, 16, { duration: 1 });
    }
  };

  // Zoom helpers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Open filter drawer with draft copy
  const handleOpenFilterDrawer = () => {
    setDraftFilters(JSON.parse(JSON.stringify(filters)));
    setIsFilterDrawerOpen(true);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setIsFilterDrawerOpen(false);
    setSelectedPinPlace(null);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
    setIsFilterDrawerOpen(false);
    setSelectedPinPlace(null);
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] pb-16 flex flex-col bg-[#F7F3EC] overflow-hidden">
      {/* 1. FLOATING TOP BAR */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 left-2 sm:left-3 z-[400] max-w-2xl mx-auto flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-[#DDD5C5] shadow-lg">
          {/* Back button */}
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-[#F7F3EC] hover:bg-[#E4DCB] flex items-center justify-center text-[#1F2430] shrink-0 transition-colors"
            title="بازگشت به خانه"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Search input field */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی مسجد، حسینیه، بقعه یا محله..."
              className="w-full bg-[#F7F3EC] border border-[#DDD5C5] rounded-xl pr-8 pl-7 py-1.5 text-xs text-[#1F2430] placeholder-[#8C8474] focus:outline-none focus:border-[#0E7C86] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#8C8474] absolute right-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C8474] hover:text-[#1F2430]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Map / List View Segmented Switch */}
          <div className="flex items-center bg-[#F7F3EC] p-0.5 rounded-xl border border-[#DDD5C5] shrink-0">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-[#0E7C86] text-white shadow-xs'
                  : 'text-[#52525B] hover:text-[#1F2430]'
              }`}
              title="نمای نقشه"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">نقشه</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-[#0E7C86] text-white shadow-xs'
                  : 'text-[#52525B] hover:text-[#1F2430]'
              }`}
              title="نمای لیست"
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>لیست</span>
              <span className={`text-[10px] px-1 py-0.2 rounded-full font-black ${
                viewMode === 'list' ? 'bg-white/20 text-white' : 'bg-[#DDD5C5] text-[#1F2430]'
              }`}>
                {toPersianDigits(filteredPlaces.length)}
              </span>
            </button>
          </div>

          {/* Filters Button with Active Filters Badge */}
          <button
            onClick={handleOpenFilterDrawer}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
              activeFiltersCount > 0
                ? 'bg-[#B4552D] text-white border-[#B4552D] shadow-xs'
                : 'bg-[#F7F3EC] hover:bg-[#E4DCB] text-[#1F2430] border-[#DDD5C5]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فیلترها</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#B4552D] text-[10px] font-black flex items-center justify-center">
                {toPersianDigits(activeFiltersCount)}
              </span>
            )}
          </button>
        </div>

        {/* Active Quick Filters Bar (Horizontal Chips) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, type: 'all' }))}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap backdrop-blur-md border transition-all ${
              filters.type === 'all'
                ? 'bg-[#1F2430] text-white border-[#1F2430] shadow-xs'
                : 'bg-white/90 text-[#52525B] border-[#DDD5C5] hover:bg-white'
            }`}
          >
            همه ({toPersianDigits(places.length)})
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, type: prev.type === 'mosque' ? 'all' : 'mosque' }))}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap backdrop-blur-md border transition-all ${
              filters.type === 'mosque'
                ? 'bg-[#0E7C86] text-white border-[#0E7C86] shadow-xs'
                : 'bg-white/90 text-[#52525B] border-[#DDD5C5] hover:bg-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#0E7C86]" />
            مساجد
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, type: prev.type === 'hussainiya' ? 'all' : 'hussainiya' }))}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap backdrop-blur-md border transition-all ${
              filters.type === 'hussainiya'
                ? 'bg-[#B4552D] text-white border-[#B4552D] shadow-xs'
                : 'bg-white/90 text-[#52525B] border-[#DDD5C5] hover:bg-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#B4552D]" />
            حسینیه‌ها
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, type: prev.type === 'shrine' ? 'all' : 'shrine' }))}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap backdrop-blur-md border transition-all ${
              filters.type === 'shrine'
                ? 'bg-[#0E7C86] text-white border-[#0E7C86] shadow-xs'
                : 'bg-white/90 text-[#52525B] border-[#DDD5C5] hover:bg-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#E5B555]" />
            بقاع و آستانه‌ها
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, openOnly: !prev.openOnly }))}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap backdrop-blur-md border transition-all ${
              filters.openOnly
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white/90 text-[#52525B] border-[#DDD5C5] hover:bg-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            باز الان
          </button>
          <button
            onClick={() => setFilters((prev) => ({
              ...prev,
              facilities: { ...prev.facilities, shovadoon: !prev.facilities.shovadoon }
            }))}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap backdrop-blur-md border transition-all ${
              filters.facilities.shovadoon
                ? 'bg-[#B4552D] text-white border-[#B4552D] shadow-xs'
                : 'bg-white/90 text-[#52525B] border-[#DDD5C5] hover:bg-white'
            }`}
          >
            <Warehouse className="w-3 h-3 text-[#E5B555]" />
            دارای شوادون
          </button>
        </div>
      </div>

      {/* 2. MAP VIEW CONTAINER */}
      <div className={`w-full h-full relative ${viewMode === 'map' ? 'block' : 'hidden'}`}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Map Controls (Right Side) */}
        <div className="absolute bottom-24 right-3 z-[400] flex flex-col gap-2 pointer-events-auto">
          {/* My Location GPS Button */}
          <button
            onClick={handleCenterOnUser}
            className="w-11 h-11 rounded-2xl bg-white hover:bg-[#F7F3EC] text-[#0E7C86] border border-[#DDD5C5] shadow-xl flex items-center justify-center transition-all active:scale-95 group"
            title="موقعیت من"
          >
            <Navigation2 className="w-5 h-5 group-hover:scale-110 transition-transform text-[#0E7C86]" />
          </button>

          {/* Zoom In & Out */}
          <div className="flex flex-col bg-white rounded-2xl border border-[#DDD5C5] shadow-xl overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 flex items-center justify-center text-[#1F2430] hover:bg-[#F7F3EC] border-b border-[#DDD5C5] transition-colors"
              title="بزرگ‌نمایی"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 flex items-center justify-center text-[#1F2430] hover:bg-[#F7F3EC] transition-colors"
              title="کوچک‌نمایی"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Counter on Map */}
        <div className="absolute bottom-20 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#DDD5C5] shadow-md text-xs font-bold text-[#1F2430] pointer-events-auto">
          <span>نمایش {toPersianDigits(filteredPlaces.length)} مکان</span>
        </div>
      </div>

      {/* 3. LIST VIEW CONTAINER */}
      {viewMode === 'list' && (
        <div className="w-full h-full overflow-y-auto pt-24 pb-20 px-3 sm:px-4 max-w-4xl mx-auto space-y-3">
          {/* Sorting Header */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-[#E0D8C8] shadow-xs text-xs">
            <div className="font-bold text-[#1F2430] flex items-center gap-1.5">
              <span>تعداد کل نتایج:</span>
              <span className="text-[#0E7C86] font-black">{toPersianDigits(sortedPlaces.length)} مکان</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#71717A]">مرتب‌سازی:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#F7F3EC] border border-[#DDD5C5] rounded-xl px-2.5 py-1 font-bold text-[#1F2430] focus:outline-none"
              >
                <option value="distance">نزدیک‌ترین به من</option>
                <option value="popular">محبوب‌ترین و شاخص</option>
                <option value="name">بر اساس حروف الفبا</option>
              </select>
            </div>
          </div>

          {/* Empty State */}
          {sortedPlaces.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#E0D8C8] space-y-3">
              <Building2 className="w-12 h-12 text-[#C4B9A7] mx-auto" />
              <h4 className="text-base font-black text-[#1F2430]">مکانی با فیلترهای انتخابی یافت نشد</h4>
              <p className="text-xs text-[#71717A]">می‌توانید فیلترهای جستجو را پاک کنید تا تمامی اماکن دزفول نمایش داده شوند.</p>
              <button
                onClick={handleClearFilters}
                className="bg-[#0E7C86] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#0a5d65] shadow-xs"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortedPlaces.map((place) => {
                const distanceMeters = userCoords
                  ? calculateDistanceMeters(userCoords[0], userCoords[1], place.coordinates[0], place.coordinates[1])
                  : null;
                const routing = getRoutingLinks(place.coordinates[0], place.coordinates[1], place.name);
                const isMenuOpen = activeRoutingPlaceId === place.id;

                return (
                  <div
                    key={place.id}
                    className="bg-white rounded-3xl p-4 border border-[#E0D8C8] hover:border-[#0E7C86] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Top Image + Badges */}
                      <div className="relative h-36 rounded-2xl overflow-hidden mb-3 border border-[#E0D8C8]">
                        <img
                          src={place.image}
                          alt={place.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Type & Status Badges */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm text-white ${
                            place.type === 'hussainiya' ? 'bg-[#B4552D]' : 'bg-[#0E7C86]'
                          }`}>
                            {place.type === 'mosque' ? 'مسجد' : place.type === 'shrine' ? 'آستانه متبرکه' : 'حسینیه'}
                          </span>
                          {place.isHistorical && (
                            <span className="bg-[#E5B555] text-[#1F2430] text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-0.5">
                              ★ تاریخی
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2.5 left-2.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1 ${
                            place.isCurrentlyOpen
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-700/80 text-white'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${place.isCurrentlyOpen ? 'bg-white animate-pulse' : 'bg-stone-400'}`} />
                            {place.isCurrentlyOpen ? 'باز اکنون' : 'بسته'}
                          </span>
                        </div>

                        {/* Title over image */}
                        <div className="absolute bottom-2.5 right-2.5 left-2.5 text-white">
                          <h3 className="text-base font-black leading-tight drop-shadow-sm">{place.name}</h3>
                          <div className="flex items-center justify-between text-xs text-white/90 mt-0.5">
                            <span className="truncate">{place.neighborhood}</span>
                            {distanceMeters !== null && (
                              <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md font-bold text-[11px] text-[#E5B555] shrink-0">
                                {formatDistance(distanceMeters)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description & Address */}
                      <p className="text-xs text-[#52525B] line-clamp-2 mb-2.5 leading-relaxed">
                        {place.description}
                      </p>

                      {/* Facility Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px] font-bold">
                        {place.features.shovadoon && (
                          <span className="bg-[#F7F3EC] text-[#B4552D] border border-[#DDD5C5] px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Warehouse className="w-3 h-3 text-[#B4552D]" />
                            شوادون {toPersianDigits(place.features.shovadoonDepthMeters || 12)} متری
                          </span>
                        )}
                        {place.features.ladiesSection && (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Users className="w-3 h-3 text-emerald-600" />
                            بخش بانوان
                          </span>
                        )}
                        {place.features.parking && (
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Car className="w-3 h-3 text-blue-600" />
                            پارکینگ
                          </span>
                        )}
                        {place.features.wheelchairAccess && (
                          <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Accessibility className="w-3 h-3 text-purple-600" />
                            دسترسی آسان
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 pt-2.5 border-t border-[#F2ECE1] relative">
                      <button
                        onClick={() => onSelectPlace(place)}
                        className="flex-1 bg-[#0E7C86] hover:bg-[#0a5d65] text-white py-2 px-3 rounded-xl text-xs font-bold transition-all text-center"
                      >
                        مشاهده جزئیات کامل
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setActiveRoutingPlaceId(isMenuOpen ? null : place.id)}
                          className="flex items-center gap-1 bg-[#F7F3EC] hover:bg-[#E4DCB] text-[#1F2430] border border-[#DDD5C5] py-2 px-3 rounded-xl text-xs font-bold"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#B4552D]" />
                          <span>مسیریابی</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute bottom-full mb-1 left-0 w-36 bg-white rounded-2xl p-1.5 border border-[#DDD5C5] shadow-xl z-30">
                            <a href={routing.neshan} target="_blank" rel="noopener noreferrer" className="block w-full text-right p-1.5 rounded-lg hover:bg-[#F7F3EC] text-xs font-bold text-[#185ADB]">نشان</a>
                            <a href={routing.balad} target="_blank" rel="noopener noreferrer" className="block w-full text-right p-1.5 rounded-lg hover:bg-[#F7F3EC] text-xs font-bold text-[#00A859]">بلد</a>
                            <a href={routing.googleMaps} target="_blank" rel="noopener noreferrer" className="block w-full text-right p-1.5 rounded-lg hover:bg-[#F7F3EC] text-xs font-bold text-[#EA4335]">گوگل مپ</a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. PIN CLICK BOTTOM SHEET CARD (ON MAP) */}
      {viewMode === 'map' && selectedPinPlace && (
        <div className="absolute bottom-20 right-3 left-3 z-[400] max-w-lg mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-[#DDD5C5] shadow-2xl animate-slideUp pointer-events-auto">
          <div className="flex items-start justify-between gap-3">
            {/* Thumbnail */}
            <img
              src={selectedPinPlace.image}
              alt={selectedPinPlace.name}
              referrerPolicy="no-referrer"
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-[#E0D8C8]"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                  selectedPinPlace.type === 'hussainiya' ? 'bg-[#B4552D] text-white' : 'bg-[#0E7C86] text-white'
                }`}>
                  {selectedPinPlace.type === 'mosque' ? 'مسجد' : selectedPinPlace.type === 'shrine' ? 'آستانه' : 'حسینیه'}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                  selectedPinPlace.isCurrentlyOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                }`}>
                  {selectedPinPlace.isCurrentlyOpen ? 'باز الان' : 'بسته'}
                </span>
                {userCoords && (
                  <span className="text-[10px] font-bold text-[#B4552D]">
                    • {formatDistance(calculateDistanceMeters(userCoords[0], userCoords[1], selectedPinPlace.coordinates[0], selectedPinPlace.coordinates[1]))}
                  </span>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-black text-[#1F2430] truncate mt-0.5">
                {selectedPinPlace.name}
              </h4>
              <p className="text-[11px] text-[#71717A] truncate mt-0.5">
                {selectedPinPlace.neighborhood}
              </p>

              {/* Next Prayer / Feature note */}
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#52525B]">
                <span className="flex items-center gap-1 bg-[#F7F3EC] px-1.5 py-0.5 rounded-md font-bold">
                  <Clock className="w-3 h-3 text-[#0E7C86]" />
                  نماز بعدی: {DEZFUL_PRAYER_TIMES.maghrib}
                </span>
                {selectedPinPlace.features.shovadoon && (
                  <span className="text-[#B4552D] font-bold">
                    شوادون {toPersianDigits(selectedPinPlace.features.shovadoonDepthMeters || 12)}م
                  </span>
                )}
              </div>
            </div>

            {/* Close pin card */}
            <button
              onClick={() => setSelectedPinPlace(null)}
              className="p-1 text-[#71717A] hover:text-[#1F2430] rounded-xl hover:bg-[#F7F3EC] shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#F2ECE1] relative">
            <button
              onClick={() => onSelectPlace(selectedPinPlace)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#0E7C86] hover:bg-[#0a5d65] text-white text-xs font-bold shadow-xs transition-colors text-center"
            >
              مشاهده جزئیات
            </button>

            {(() => {
              const routing = getRoutingLinks(selectedPinPlace.coordinates[0], selectedPinPlace.coordinates[1], selectedPinPlace.name);
              const isRoutingOpen = activeRoutingPlaceId === selectedPinPlace.id;

              return (
                <div className="flex-1 relative">
                  <button
                    onClick={() => setActiveRoutingPlaceId(isRoutingOpen ? null : selectedPinPlace.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#F7F3EC] hover:bg-[#E4DCB] text-[#1F2430] border border-[#DDD5C5] text-xs font-bold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#B4552D]" />
                    <span>مسیریابی</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {isRoutingOpen && (
                    <div className="absolute bottom-full mb-1 left-0 right-0 bg-white rounded-2xl p-1.5 border border-[#DDD5C5] shadow-2xl z-30">
                      <div className="grid grid-cols-3 gap-1 text-center text-xs font-bold">
                        <a href={routing.neshan} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-[#F7F3EC] text-[#185ADB]">نشان</a>
                        <a href={routing.balad} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-[#F7F3EC] text-[#00A859]">بلد</a>
                        <a href={routing.googleMaps} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-[#F7F3EC] text-[#EA4335]">گوگل</a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 5. ADVANCED FILTERS BOTTOM SHEET / MODAL */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E0D8C8] max-h-[88vh] flex flex-col overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#F2ECE1] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0E7C86]/10 text-[#0E7C86] flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1F2430]">فیلترهای پیشرفته نقشه دزفول</h3>
                  <p className="text-[11px] text-[#71717A]">انتخاب دقیق اماکن، محلات و امکانات</p>
                </div>
              </div>

              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-2 text-[#71717A] hover:text-[#1F2430] rounded-xl hover:bg-[#F7F3EC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* 1. Place Type Filter */}
              <div>
                <label className="block font-black text-[#1F2430] mb-2">نوع مکان:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'همه اماکن' },
                    { id: 'mosque', label: 'مسجد' },
                    { id: 'hussainiya', label: 'حسینیه' },
                    { id: 'shrine', label: 'بقعه و آستانه' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDraftFilters((prev) => ({ ...prev, type: t.id as any }))}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                        draftFilters.type === t.id
                          ? 'bg-[#0E7C86] text-white border-[#0E7C86] shadow-xs'
                          : 'bg-[#F7F3EC] text-[#52525B] border-[#DDD5C5] hover:bg-[#E4DCB]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Open Now Toggle */}
              <div className="p-3 bg-[#F7F3EC] rounded-2xl border border-[#DDD5C5] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1F2430]">فقط اماکن بازِ اکنون</h4>
                  <p className="text-[11px] text-[#71717A]">اماکنی که در این لحظه درب آن‌ها برای نماز یا مراسم باز است</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draftFilters.openOnly}
                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, openOnly: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#DDD5C5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* 3. Neighborhood Selector */}
              <div>
                <label className="block font-black text-[#1F2430] mb-2">محله دزفول:</label>
                <select
                  value={draftFilters.neighborhoodId}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, neighborhoodId: e.target.value }))}
                  className="w-full bg-[#F7F3EC] border border-[#DDD5C5] rounded-xl px-3 py-2.5 text-xs text-[#1F2430] font-bold focus:border-[#0E7C86] focus:outline-none"
                >
                  <option value="all">تمام محله‌های دزفول</option>
                  {INITIAL_NEIGHBORHOODS.map((nh) => (
                    <option key={nh.id} value={nh.id}>
                      {nh.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Facilities Checklist */}
              <div>
                <label className="block font-black text-[#1F2430] mb-2">امکانات و ویژگی‌ها:</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: 'shovadoon', label: 'شوادون سنتی دزفولی', icon: Warehouse, color: 'text-[#B4552D]' },
                    { key: 'ladiesSection', label: 'بخش مجزای بانوان', icon: Users, color: 'text-emerald-600' },
                    { key: 'parking', label: 'پارکینگ خودرو', icon: Car, color: 'text-blue-600' },
                    { key: 'wuduFacilities', label: 'وضوخانه و سرویس بهداشتی', icon: Droplets, color: 'text-cyan-600' },
                    { key: 'wheelchairAccess', label: 'دسترسی سالمند و معلول', icon: Accessibility, color: 'text-purple-600' },
                    { key: 'quranClasses', label: 'کلاس و کانون قرآن', icon: BookOpen, color: 'text-amber-600' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isChecked = (draftFilters.facilities as any)[item.key];

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setDraftFilters((prev) => ({
                            ...prev,
                            facilities: {
                              ...prev.facilities,
                              [item.key]: !isChecked
                            }
                          }));
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-right transition-all ${
                          isChecked
                            ? 'bg-[#0E7C86]/10 border-[#0E7C86] text-[#0E7C86] font-black'
                            : 'bg-[#F7F3EC] border-[#DDD5C5] text-[#52525B] hover:bg-[#E4DCB]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isChecked ? 'text-[#0E7C86]' : item.color}`} />
                          <span className="text-[11px]">{item.label}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-[#0E7C86] border-[#0E7C86] text-white' : 'border-[#DDD5C5] bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="p-4 bg-[#F7F3EC] border-t border-[#E0D8C8] flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex-1 bg-[#0E7C86] hover:bg-[#0a5d65] text-white py-2.5 px-4 rounded-xl font-bold shadow-md transition-all text-center"
              >
                اعمال فیلترها
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1 bg-white hover:bg-stone-100 text-[#71717A] border border-[#DDD5C5] py-2.5 px-3 rounded-xl font-bold transition-all"
                title="پاک کردن همه فیلترها"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>پاک کردن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

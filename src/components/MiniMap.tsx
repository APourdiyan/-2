import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Maximize2, Navigation, Layers, Compass, MapPin, Sparkles } from 'lucide-react';
import { Place } from '../types';
import { toPersianDigits, calculateDistanceMeters, formatDistance } from '../utils/persianUtils';

interface MiniMapProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  onOpenFullMap: () => void;
  onFindNearest: () => void;
  userCoords: [number, number] | null;
  nearestPlace: Place | null;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  places,
  onSelectPlace,
  onOpenFullMap,
  onFindNearest,
  userCoords,
  nearestPlace
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [activeLegend, setActiveLegend] = useState<'all' | 'mosque' | 'hussainiya' | 'historical'>('all');

  // Dezful Center Coordinates
  const DEZFUL_CENTER: [number, number] = [32.3838, 48.4020];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: DEZFUL_CENTER,
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // Add Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Add compact zoom control
      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      // Create MarkerClusterGroup with Persian styled cluster icon
      // @ts-expect-error markerClusterGroup is added by leaflet.markercluster plugin
      const clusterGroup = L.markerClusterGroup({
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

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when places or legend filter change
  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    clusterGroup.clearLayers();

    const filteredPlaces = places.filter((p) => {
      if (activeLegend === 'mosque') return p.type === 'mosque';
      if (activeLegend === 'hussainiya') return p.type === 'hussainiya';
      if (activeLegend === 'historical') return p.isHistorical;
      return true;
    });

    const markers: L.Marker[] = [];

    filteredPlaces.forEach((place) => {
      // Choose colors & icons
      const isHistorical = place.isHistorical;
      const isHussainiya = place.type === 'hussainiya';
      const bgColor = isHussainiya ? '#B4552D' : '#0E7C86';
      const starIcon = isHistorical
        ? `<div style="position: absolute; top: -5px; right: -5px; background: #E5B555; color: #1F2430; border-radius: 50%; width: 14px; height: 14px; font-size: 9px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">★</div>`
        : '';
      const shovadoonBadge = place.features.shovadoon
        ? `<div style="position: absolute; bottom: -3px; left: -3px; background: #1F2430; color: #FFF; border-radius: 4px; padding: 1px 3px; font-size: 8px; font-weight: bold;">شوادون</div>`
        : '';

      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `
          <div style="position: relative; width: 34px; height: 34px; background: ${bgColor}; border: 2.5px solid #FFFFFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25); color: #FFF; cursor: pointer;">
            ${
              isHussainiya
                ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2C8.5 5.5 6 9 6 13v8h12v-8c0-4-2.5-7.5-6-11z"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg>`
            }
            ${starIcon}
            ${shovadoonBadge}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const marker = L.marker(place.coordinates, { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div style="padding: 12px; min-width: 200px; text-align: right; direction: rtl; font-family: 'Vazirmatn', sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="background: ${isHussainiya ? '#FBEBE5' : '#E6F4F5'}; color: ${bgColor}; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px;">
              ${place.type === 'mosque' ? 'مسجد' : place.type === 'shrine' ? 'آستانه متبرکه' : 'حسینیه'}
            </span>
            ${place.isCurrentlyOpen ? '<span style="color: #059669; font-size: 10px; font-weight: 700;">● باز است</span>' : '<span style="color: #6B7280; font-size: 10px;">بسته</span>'}
          </div>
          <h4 style="font-size: 14px; font-weight: 800; color: #1F2430; margin: 0 0 4px 0;">${place.name}</h4>
          <p style="font-size: 11px; color: #4B5563; margin: 0 0 8px 0;">${place.neighborhood}</p>
          ${place.features.shovadoon ? `<div style="font-size: 10px; color: #B4552D; margin-bottom: 6px; font-weight: 600;">دارای شوادون کهن (${toPersianDigits(place.features.shovadoonDepthMeters || 12)} متر عمق)</div>` : ''}
          <button id="btn-view-place-${place.id}" style="width: 100%; background: #0E7C86; color: #FFF; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">
            مشاهده جزئیات و مراسمات
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-place-${place.id}`);
        if (btn) {
          btn.onclick = () => onSelectPlace(place);
        }
      });

      markers.push(marker);
    });

    clusterGroup.addLayers(markers);

    // Add User Location Pin if available
    if (userCoords && mapInstanceRef.current) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      const userIcon = L.divIcon({
        className: 'user-pin',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; inset: 0; background: #3B82F6; border-radius: 50%; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; inset: 3px; background: #2563EB; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      userMarkerRef.current = L.marker(userCoords, { icon: userIcon }).addTo(mapInstanceRef.current);
      userMarkerRef.current.bindPopup('<div style="font-family: \'Vazirmatn\'; text-align: center; padding: 6px; font-size: 12px; font-weight: 700;">موقعیت کنونی شما</div>');
    }
  }, [places, activeLegend, userCoords]);

  // Center map on nearest place if found
  useEffect(() => {
    if (nearestPlace && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(nearestPlace.coordinates, 16, { duration: 1.2 });
    }
  }, [nearestPlace]);

  return (
    <section className="my-4 sm:my-5">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 sm:p-4 border border-[#E0D8C8] dark:border-slate-700 shadow-xs transition-colors">
        {/* Header bar of map */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0E7C86]/10 dark:bg-teal-500/10 text-[#0E7C86] dark:text-teal-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#1F2430] dark:text-slate-100">نقشه تعاملی مساجد دزفول</h2>
              <p className="text-[11px] text-[#71717A] dark:text-slate-400">خوشه‌بندی هوشمند پین‌ها و مکان‌نماهای دزفول</p>
            </div>
          </div>

          {/* Quick Map Legend Filters */}
          <div className="flex items-center gap-1 bg-[#F7F3EC] dark:bg-slate-900/80 p-1 rounded-xl border border-[#E4DCB] dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveLegend('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLegend === 'all' 
                  ? 'bg-[#0E7C86] dark:bg-teal-600 text-white shadow-xs' 
                  : 'text-[#71717A] dark:text-slate-400 hover:text-[#1F2430] dark:hover:text-slate-200'
              }`}
            >
              همه ({toPersianDigits(places.length)})
            </button>
            <button
              onClick={() => setActiveLegend('mosque')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLegend === 'mosque' 
                  ? 'bg-[#0E7C86] dark:bg-teal-600 text-white shadow-xs' 
                  : 'text-[#71717A] dark:text-slate-400 hover:text-[#1F2430] dark:hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0E7C86] dark:bg-teal-400"></span>
              مساجد
            </button>
            <button
              onClick={() => setActiveLegend('hussainiya')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLegend === 'hussainiya' 
                  ? 'bg-[#B4552D] text-white shadow-xs' 
                  : 'text-[#71717A] dark:text-slate-400 hover:text-[#1F2430] dark:hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#B4552D]"></span>
              حسینیه‌ها
            </button>
            <button
              onClick={() => setActiveLegend('historical')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLegend === 'historical' 
                  ? 'bg-[#E5B555] text-[#1F2430] shadow-xs' 
                  : 'text-[#71717A] dark:text-slate-400 hover:text-[#1F2430] dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              تاریخی
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative rounded-2xl overflow-hidden border border-[#E0D8C8] dark:border-slate-700 h-64 sm:h-72 w-full z-10 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating Actions on Map */}
          <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
            <button
              onClick={onOpenFullMap}
              className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-800/95 hover:bg-white dark:hover:bg-slate-800 text-[#1F2430] dark:text-slate-100 text-xs font-bold px-3 py-2 rounded-xl shadow-md border border-[#E0D8C8] dark:border-slate-700 backdrop-blur-xs transition-all active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#0E7C86] dark:text-teal-400" />
              <span>نقشه تمام‌صفحه</span>
            </button>
          </div>

          <div className="absolute bottom-3 right-3 z-[400]">
            <button
              onClick={onFindNearest}
              className="flex items-center gap-2 bg-[#0E7C86] hover:bg-[#0b636b] dark:bg-teal-600 dark:hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-[#0E7C86]/30 border border-white/30 backdrop-blur-xs transition-all active:scale-95 animate-pulse-slow"
            >
              <Navigation className="w-4 h-4 text-[#E5B555]" />
              <span>نزدیک‌ترین مسجد به من</span>
            </button>
          </div>

          {/* Map Pin Guide on Bottom Left */}
          <div className="hidden sm:flex absolute bottom-3 left-12 z-[400] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E0D8C8] dark:border-slate-700 text-[11px] text-[#52525B] dark:text-slate-300 items-center gap-3 shadow-xs">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C86] inline-block"></span> مسجد
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B4552D] inline-block"></span> حسینیه
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="text-[#E5B555]">★</span> تاریخی
            </span>
          </div>
        </div>

        {/* Nearest Place Banner if found */}
        {nearestPlace && (
          <div className="mt-3 p-3 bg-[#E6F4F5] dark:bg-teal-950/40 border border-[#0E7C86]/30 dark:border-teal-700/40 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0E7C86] dark:bg-teal-600 text-white flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0E7C86] dark:text-teal-400">نزدیک‌ترین مکان به شما:</span>
                  <span className="text-xs font-black text-[#1F2430] dark:text-slate-100">{nearestPlace.name}</span>
                </div>
                <p className="text-[11px] text-[#52525B] dark:text-slate-400">{nearestPlace.neighborhood} • {nearestPlace.address}</p>
              </div>
            </div>
            <button
              onClick={() => onSelectPlace(nearestPlace)}
              className="px-3 py-1.5 rounded-xl bg-[#0E7C86] dark:bg-teal-600 text-white text-xs font-bold hover:bg-[#0a5d65] shrink-0"
            >
              مشاهده و مسیریابی
            </button>
          </div>
        )}
      </div>
    </section>
  );
};


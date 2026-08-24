import { Place, EventItem, Neighborhood } from '../types';
import { INITIAL_PLACES, INITIAL_NEIGHBORHOODS, INITIAL_EVENTS } from '../data/dezfulData';

// کش حافظه‌ای با مدت اعتبار ۵ دقیقه
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // ۵ دقیقه
const memoryCache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setToCache<T>(key: string, data: T): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * دریافت لیست کامل یا فیلتر شده اماکن مذهبی
 */
export async function fetchPlaces(params?: {
  type?: string;
  neighborhoodId?: string;
  search?: string;
  shovadoon?: boolean;
  openOnly?: boolean;
  isHistorical?: boolean;
}): Promise<Place[]> {
  const queryParams = new URLSearchParams();
  if (params?.type && params.type !== 'all') queryParams.append('type', params.type);
  if (params?.neighborhoodId && params.neighborhoodId !== 'all') queryParams.append('neighborhoodId', params.neighborhoodId);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.shovadoon) queryParams.append('shovadoon', 'true');
  if (params?.openOnly) queryParams.append('openOnly', 'true');
  if (params?.isHistorical) queryParams.append('isHistorical', 'true');

  const cacheKey = `places:${queryParams.toString()}`;
  const cached = getFromCache<Place[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `/api/places${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setToCache(cacheKey, json.data);
      return json.data;
    }
  } catch (err) {
    console.warn('API error fetching places, falling back to local dataset:', err);
  }

  // داده‌های پشتیبان لوکال
  let fallback = [...INITIAL_PLACES];
  if (params?.type && params.type !== 'all') fallback = fallback.filter((p) => p.type === params.type);
  if (params?.neighborhoodId && params.neighborhoodId !== 'all') fallback = fallback.filter((p) => p.neighborhoodId === params.neighborhoodId);
  if (params?.shovadoon) fallback = fallback.filter((p) => p.features.shovadoon);
  if (params?.openOnly) fallback = fallback.filter((p) => p.isCurrentlyOpen);
  if (params?.isHistorical) fallback = fallback.filter((p) => p.isHistorical);
  if (params?.search) {
    const q = params.search.toLowerCase();
    fallback = fallback.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  setToCache(cacheKey, fallback);
  return fallback;
}

/**
 * دریافت مشخصات یک مکان بر اساس شناسه
 */
export async function fetchPlaceById(id: string): Promise<Place | null> {
  const cacheKey = `place:${id}`;
  const cached = getFromCache<Place>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/places/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      setToCache(cacheKey, json.data);
      return json.data;
    }
  } catch (err) {
    console.warn(`API error fetching place ${id}, falling back:`, err);
  }

  const fallback = INITIAL_PLACES.find((p) => p.id === id) || null;
  if (fallback) setToCache(cacheKey, fallback);
  return fallback;
}

/**
 * دریافت اماکن نزدیک بر اساس موقعیت کاربر و شعاع مورد نظر
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radiusMeters: number = 5000
): Promise<(Place & { distanceMeters?: number; distanceKm?: number })[]> {
  const cacheKey = `nearby:${lat.toFixed(4)},${lng.toFixed(4)}:${radiusMeters}`;
  const cached = getFromCache<any[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/places/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setToCache(cacheKey, json.data);
      return json.data;
    }
  } catch (err) {
    console.warn('API error fetching nearby places, computing locally:', err);
  }

  // محاسبه محلی در صورت بروز خطا در سرور
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000;
    const toRad = (val: number) => (val * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const computed = INITIAL_PLACES.map((p) => {
    const dist = getDistance(lat, lng, p.coordinates[0], p.coordinates[1]);
    return {
      ...p,
      distanceMeters: Math.round(dist),
      distanceKm: parseFloat((dist / 1000).toFixed(2)),
    };
  })
    .filter((p) => p.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  setToCache(cacheKey, computed);
  return computed;
}

/**
 * دریافت لیست محله‌های دزفول
 */
export async function fetchNeighborhoods(): Promise<Neighborhood[]> {
  const cacheKey = 'neighborhoods:all';
  const cached = getFromCache<Neighborhood[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch('/api/neighborhoods');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setToCache(cacheKey, json.data);
      return json.data;
    }
  } catch (err) {
    console.warn('API error fetching neighborhoods, falling back:', err);
  }

  setToCache(cacheKey, INITIAL_NEIGHBORHOODS);
  return INITIAL_NEIGHBORHOODS;
}

/**
 * دریافت مشخصات یک محله همراه با اماکن آن
 */
export async function fetchNeighborhoodById(id: string): Promise<(Neighborhood & { places?: Place[] }) | null> {
  const cacheKey = `neighborhood:${id}`;
  const cached = getFromCache<any>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/neighborhoods/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      setToCache(cacheKey, json.data);
      return json.data;
    }
  } catch (err) {
    console.warn(`API error fetching neighborhood ${id}, falling back:`, err);
  }

  const fallbackN = INITIAL_NEIGHBORHOODS.find((n) => n.id === id || n.slug === id);
  if (!fallbackN) return null;
  const places = INITIAL_PLACES.filter((p) => p.neighborhoodId === fallbackN.id);
  const result = { ...fallbackN, places };
  setToCache(cacheKey, result);
  return result;
}

/**
 * دریافت رویدادها و مراسمات
 */
export async function fetchEvents(params?: {
  category?: string;
  isToday?: boolean;
  isTonight?: boolean;
  placeId?: string;
  nazri?: boolean;
  search?: string;
}): Promise<EventItem[]> {
  const queryParams = new URLSearchParams();
  if (params?.category && params.category !== 'all') queryParams.append('category', params.category);
  if (params?.isToday) queryParams.append('isToday', 'true');
  if (params?.isTonight) queryParams.append('isTonight', 'true');
  if (params?.placeId) queryParams.append('placeId', params.placeId);
  if (params?.nazri) queryParams.append('nazri', 'true');
  if (params?.search) queryParams.append('search', params.search);

  const cacheKey = `events:${queryParams.toString()}`;
  const cached = getFromCache<EventItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setToCache(cacheKey, json.data);
      return json.data;
    }
  } catch (err) {
    console.warn('API error fetching events, falling back:', err);
  }

  let fallback = [...INITIAL_EVENTS];
  if (params?.category && params.category !== 'all') fallback = fallback.filter((e) => e.category === params.category);
  if (params?.isToday) fallback = fallback.filter((e) => e.isToday);
  if (params?.isTonight) fallback = fallback.filter((e) => e.isTonight);
  if (params?.placeId) fallback = fallback.filter((e) => e.placeId === params.placeId);
  if (params?.nazri) fallback = fallback.filter((e) => e.services.nazri);
  if (params?.search) {
    const q = params.search.toLowerCase();
    fallback = fallback.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.speaker?.toLowerCase().includes(q) ||
        e.eulogist?.toLowerCase().includes(q) ||
        e.placeName.toLowerCase().includes(q)
    );
  }

  setToCache(cacheKey, fallback);
  return fallback;
}

/**
 * دریافت مراسمات امروز و امشب
 */
export async function fetchTodayEvents(): Promise<EventItem[]> {
  const cacheKey = 'events:today';
  const cached = getFromCache<EventItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch('/api/events/today');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setToCache(cacheKey, json.data);
      return json.data;
    }
  } catch (err) {
    console.warn('API error fetching today events, falling back:', err);
  }

  const fallback = INITIAL_EVENTS.filter((e) => e.isToday || e.isTonight);
  setToCache(cacheKey, fallback);
  return fallback;
}

/**
 * جستجوی همزمان در اماکن، مراسمات و محلات
 */
export async function searchAll(query: string): Promise<{
  places: Place[];
  events: EventItem[];
  neighborhoods: Neighborhood[];
}> {
  const q = query.trim().toLowerCase();
  if (!q) return { places: [], events: [], neighborhoods: [] };

  const cacheKey = `search:${q}`;
  const cached = getFromCache<{ places: Place[]; events: EventItem[]; neighborhoods: Neighborhood[] }>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      setToCache(cacheKey, json.data);
      return json.data;
    }
  } catch (err) {
    console.warn('API error in searchAll, falling back:', err);
  }

  const matchPlaces = INITIAL_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q)
  );

  const matchEvents = INITIAL_EVENTS.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.speaker?.toLowerCase().includes(q) ||
      e.eulogist?.toLowerCase().includes(q) ||
      e.placeName.toLowerCase().includes(q)
  );

  const matchNeighborhoods = INITIAL_NEIGHBORHOODS.filter(
    (n) =>
      n.name.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.keyHighlights.some((kh) => kh.toLowerCase().includes(q))
  );

  const result = {
    places: matchPlaces,
    events: matchEvents,
    neighborhoods: matchNeighborhoods,
  };

  setToCache(cacheKey, result);
  return result;
}

/**
 * ارسال و ثبت مراسم جدید
 */
export async function submitEvent(eventData: Partial<EventItem> & { [key: string]: any }): Promise<{
  success: boolean;
  message?: string;
  data?: EventItem;
  error?: string;
}> {
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const json = await res.json();
    // پاک کردن کش رویدادها تا لیست بلافاصله به‌روز شود
    memoryCache.clear();
    return json;
  } catch (err: any) {
    console.error('API error submitting event:', err);
    return {
      success: false,
      error: err.message || 'خطا در برقراری ارتباط با سرور',
    };
  }
}

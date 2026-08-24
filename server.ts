import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PLACES, INITIAL_NEIGHBORHOODS, INITIAL_EVENTS } from './src/data/dezfulData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

// میدل‌ورهای پایه
app.use(cors());
app.use(express.json());

/**
 * محاسبه فاصله کروی با استفاده از فرمول هاورساین (Haversine Formula) به متر
 */
function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // شعاع زمین به متر
  const toRad = (val: number) => (val * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * تبدیل رکورد دیتابیس به فرمت استاندارد مکان در فرانت‌اند
 */
function formatPlace(p: any) {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    isHistorical: p.isHistorical,
    historicalPeriod: p.historicalPeriod || undefined,
    neighborhood: p.neighborhood?.name || p.neighborhood || '',
    neighborhoodId: p.neighborhoodId,
    address: p.address,
    coordinates: [p.latitude, p.longitude] as [number, number],
    phone: p.phone || undefined,
    isCurrentlyOpen: p.isCurrentlyOpen,
    openingHours: p.openingHours || 'اذان صبح تا نماز عشاء',
    capacity: p.capacity || 0,
    imamOrCustodian: p.imamOrCustodian || undefined,
    image: p.image || '/assets/places/default.jpg',
    description: p.description || '',
    historySummary: p.historySummary || undefined,
    establishedYear: p.establishedYear || undefined,
    rating: p.rating || 4.8,
    eventsCountToday: p.events ? p.events.filter((e: any) => e.isToday || e.isTonight).length : (p.eventsCountToday || 0),
    features: {
      shovadoon: p.shovadoon ?? p.features?.shovadoon ?? false,
      shovadoonDepthMeters: p.shovadoonDepthMeters ?? p.features?.shovadoonDepthMeters,
      ladiesSection: p.ladiesSection ?? p.features?.ladiesSection ?? true,
      wheelchairAccess: p.wheelchairAccess ?? p.features?.wheelchairAccess ?? false,
      quranClasses: p.quranClasses ?? p.features?.quranClasses ?? false,
      parking: p.parking ?? p.features?.parking ?? false,
      liveBroadcast: p.liveBroadcast ?? p.features?.liveBroadcast ?? false,
      wuduFacilities: p.wuduFacilities ?? p.features?.wuduFacilities ?? true,
      library: p.library ?? p.features?.library ?? false,
      coolingSystem: p.coolingSystem ?? p.features?.coolingSystem ?? 'اسپلیت و شوادون',
    },
    neighborhoodData: p.neighborhood || undefined,
    events: p.events ? p.events.map(formatEvent) : undefined,
  };
}

/**
 * تبدیل رکورد دیتابیس به فرمت استاندارد رویداد در فرانت‌اند
 */
function formatEvent(e: any) {
  return {
    id: e.id,
    placeId: e.placeId,
    placeName: e.place?.name || e.placeName || '',
    placeType: e.place?.type || e.placeType || 'mosque',
    neighborhood: e.place?.neighborhood?.name || e.neighborhood || '',
    title: e.title,
    speaker: e.speaker || undefined,
    eulogist: e.eulogist || undefined,
    qari: e.qari || undefined,
    date: e.date,
    dayOfWeek: e.dayOfWeek || '',
    timeStr: e.timeStr || '',
    timeBadge: e.timeBadge || '',
    category: e.category,
    coordinates: [e.latitude, e.longitude] as [number, number],
    isToday: Boolean(e.isToday),
    isTonight: Boolean(e.isTonight),
    description: e.description || undefined,
    contactPhone: e.contactPhone || undefined,
    streamUrl: e.streamUrl || undefined,
    attendeesCount: e.attendeesCount || 0,
    services: {
      nazri: e.nazri ?? e.services?.nazri ?? false,
      nazriDescription: e.nazriDescription ?? e.services?.nazriDescription,
      liveStream: e.liveStream ?? e.services?.liveStream ?? false,
      womenSection: e.womenSection ?? e.services?.womenSection ?? true,
      parking: e.parking ?? e.services?.parking ?? false,
      shovadoonActive: e.shovadoonActive ?? e.services?.shovadoonActive ?? false,
      quranRecitation: e.quranRecitation ?? e.services?.quranRecitation ?? false,
    },
  };
}

// ----------------------------------------------------
// وضعیت سلامت سرور (GET /api/health)
// ----------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    server: 'Dezful Mosques & Hussainiyas API',
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// ۱. دریافت لیست اماکن مذهبی با فیلتر و جستجو (GET /api/places)
// ----------------------------------------------------
app.get('/api/places', async (req: Request, res: Response) => {
  try {
    const { type, neighborhoodId, search, shovadoon, openOnly, isHistorical } = req.query;

    let dbPlaces: any[] = [];
    let usedFallback = false;

    try {
      const whereClause: any = {};

      if (type && typeof type === 'string' && type !== 'all') {
        whereClause.type = type;
      }
      if (neighborhoodId && typeof neighborhoodId === 'string' && neighborhoodId !== 'all') {
        whereClause.neighborhoodId = neighborhoodId;
      }
      if (shovadoon === 'true') {
        whereClause.shovadoon = true;
      }
      if (openOnly === 'true') {
        whereClause.isCurrentlyOpen = true;
      }
      if (isHistorical === 'true') {
        whereClause.isHistorical = true;
      }
      if (search && typeof search === 'string' && search.trim() !== '') {
        const query = search.trim();
        whereClause.OR = [
          { name: { contains: query } },
          { address: { contains: query } },
          { description: { contains: query } },
          { imamOrCustodian: { contains: query } },
        ];
      }

      dbPlaces = await prisma.place.findMany({
        where: whereClause,
        include: {
          neighborhood: true,
          events: true,
        },
        orderBy: { rating: 'desc' },
      });
    } catch (dbErr) {
      console.warn('دیتابیس در دسترس نیست، استفاده از داده‌های پیش‌فرض:', dbErr);
      usedFallback = true;
    }

    if (usedFallback || !dbPlaces || dbPlaces.length === 0) {
      let filtered = [...INITIAL_PLACES];

      if (type && typeof type === 'string' && type !== 'all') {
        filtered = filtered.filter((p) => p.type === type);
      }
      if (neighborhoodId && typeof neighborhoodId === 'string' && neighborhoodId !== 'all') {
        filtered = filtered.filter((p) => p.neighborhoodId === neighborhoodId);
      }
      if (shovadoon === 'true') {
        filtered = filtered.filter((p) => p.features.shovadoon);
      }
      if (openOnly === 'true') {
        filtered = filtered.filter((p) => p.isCurrentlyOpen);
      }
      if (isHistorical === 'true') {
        filtered = filtered.filter((p) => p.isHistorical);
      }
      if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.address.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.neighborhood.toLowerCase().includes(q)
        );
      }

      const formatted = filtered.map((p) => {
        const n = INITIAL_NEIGHBORHOODS.find((item) => item.id === p.neighborhoodId);
        return {
          ...p,
          neighborhoodData: n,
        };
      });

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    }

    const formatted = dbPlaces.map(formatPlace);
    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('خطا در دریافت لیست اماکن:', error);
    res.status(500).json({ success: false, error: 'خطای سرور در بازیابی اماکن مذهبی' });
  }
});

// ----------------------------------------------------
// ۲. دریافت اطلاعات تک مکان مذهبی (GET /api/places/:id)
// ----------------------------------------------------
app.get('/api/places/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let place: any = null;
    try {
      place = await prisma.place.findUnique({
        where: { id },
        include: {
          neighborhood: true,
          events: true,
        },
      });
    } catch (dbErr) {
      console.warn('دیتابیس در دسترس نیست، جستجو در داده‌های پیش‌فرض:', dbErr);
    }

    if (!place) {
      const fallbackPlace = INITIAL_PLACES.find((p) => p.id === id);
      if (!fallbackPlace) {
        return res.status(404).json({ success: false, error: 'مکان مورد نظر یافت نشد' });
      }
      const neighborhood = INITIAL_NEIGHBORHOODS.find((n) => n.id === fallbackPlace.neighborhoodId);
      const events = INITIAL_EVENTS.filter((e) => e.placeId === id);
      return res.json({
        success: true,
        data: {
          ...fallbackPlace,
          neighborhoodData: neighborhood,
          events,
        },
      });
    }

    res.json({
      success: true,
      data: formatPlace(place),
    });
  } catch (error) {
    console.error('خطا در دریافت جزئیات مکان:', error);
    res.status(500).json({ success: false, error: 'خطای سرور در دریافت مشخصات مکان' });
  }
});

// ----------------------------------------------------
// ۳. اماکن نزدیک با فرمول Haversine (GET /api/places/nearby?lat=X&lng=Y)
// ----------------------------------------------------
app.get('/api/places/nearby', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const maxRadius = parseFloat(req.query.radius as string) || 5000; // پیش‌فرض ۵۰۰۰ متر (۵ کیلومتر)

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'پارامترهای lat و lng اجباری و باید عدد معتبر باشند.',
      });
    }

    let places: any[] = [];
    try {
      places = await prisma.place.findMany({
        include: {
          neighborhood: true,
          events: true,
        },
      });
    } catch (dbErr) {
      console.warn('دیتابیس در دسترس نیست، استفاده از داده‌های حافظه:', dbErr);
    }

    if (!places || places.length === 0) {
      places = INITIAL_PLACES.map((p) => ({
        ...p,
        latitude: p.coordinates[0],
        longitude: p.coordinates[1],
        neighborhood: INITIAL_NEIGHBORHOODS.find((n) => n.id === p.neighborhoodId),
      }));
    } else {
      places = places.map(formatPlace).map((p) => ({
        ...p,
        latitude: p.coordinates[0],
        longitude: p.coordinates[1],
      }));
    }

    // محاسبه فاصله با فرمول هاورساین، فیلتر کردن کمتر از maxRadius و مرتب‌سازی صعودی
    const nearbyPlaces = places
      .map((place) => {
        const distance = haversineDistanceMeters(lat, lng, place.latitude, place.longitude);
        return {
          ...place,
          distanceMeters: Math.round(distance),
          distanceKm: parseFloat((distance / 1000).toFixed(2)),
        };
      })
      .filter((place) => place.distanceMeters <= maxRadius)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    res.json({
      success: true,
      origin: { latitude: lat, longitude: lng },
      radiusMeters: maxRadius,
      count: nearbyPlaces.length,
      data: nearbyPlaces,
    });
  } catch (error) {
    console.error('خطا در محاسبه اماکن نزدیک:', error);
    res.status(500).json({ success: false, error: 'خطای سرور در محاسبه فاصله اماکن' });
  }
});

// ----------------------------------------------------
// ۴. لیست محلات دزفول (GET /api/neighborhoods)
// ----------------------------------------------------
app.get('/api/neighborhoods', async (req: Request, res: Response) => {
  try {
    let neighborhoods: any[] = [];
    try {
      neighborhoods = await prisma.neighborhood.findMany({
        include: {
          _count: {
            select: { places: true },
          },
        },
        orderBy: { mosquesCount: 'desc' },
      });
    } catch (dbErr) {
      console.warn('خطا در بارگذاری محلات از دیتابیس:', dbErr);
    }

    if (!neighborhoods || neighborhoods.length === 0) {
      return res.json({
        success: true,
        count: INITIAL_NEIGHBORHOODS.length,
        data: INITIAL_NEIGHBORHOODS,
      });
    }

    const formatted = neighborhoods.map((n) => ({
      id: n.id,
      name: n.name,
      slug: n.slug,
      description: n.description || '',
      mosquesCount: n.mosquesCount || n._count?.places || 0,
      hussainiyasCount: n.hussainiyasCount || 0,
      historicalCount: n.historicalCount || 0,
      isHistoricalDistrict: n.isHistoricalDistrict,
      coordinates: [n.latitude, n.longitude] as [number, number],
      keyHighlights: n.keyHighlights ? JSON.parse(n.keyHighlights) : [],
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('خطا در دریافت لیست محلات:', error);
    res.status(500).json({ success: false, error: 'خطای سرور در دریافت محله‌ها' });
  }
});

// ----------------------------------------------------
// ۵. دریافت مشخصات یک محله و اماکن آن (GET /api/neighborhoods/:id)
// ----------------------------------------------------
app.get('/api/neighborhoods/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let neighborhood: any = null;
    try {
      neighborhood = await prisma.neighborhood.findUnique({
        where: { id },
        include: {
          places: {
            include: { events: true },
          },
        },
      });
    } catch (dbErr) {
      console.warn('دیتابیس در دسترس نیست:', dbErr);
    }

    if (!neighborhood) {
      const fallbackN = INITIAL_NEIGHBORHOODS.find((n) => n.id === id || n.slug === id);
      if (!fallbackN) {
        return res.status(404).json({ success: false, error: 'محله مورد نظر یافت نشد' });
      }
      const places = INITIAL_PLACES.filter((p) => p.neighborhoodId === fallbackN.id);
      return res.json({
        success: true,
        data: {
          ...fallbackN,
          places,
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: neighborhood.id,
        name: neighborhood.name,
        slug: neighborhood.slug,
        description: neighborhood.description,
        mosquesCount: neighborhood.mosquesCount,
        hussainiyasCount: neighborhood.hussainiyasCount,
        historicalCount: neighborhood.historicalCount,
        isHistoricalDistrict: neighborhood.isHistoricalDistrict,
        coordinates: [neighborhood.latitude, neighborhood.longitude],
        keyHighlights: neighborhood.keyHighlights ? JSON.parse(neighborhood.keyHighlights) : [],
        places: neighborhood.places.map(formatPlace),
      },
    });
  } catch (error) {
    console.error('خطا در دریافت اطلاعات محله:', error);
    res.status(500).json({ success: false, error: 'خطای سرور در دریافت اطلاعات محله' });
  }
});

// ----------------------------------------------------
// ۶. دریافت رویدادها و مراسمات (GET /api/events)
// ----------------------------------------------------
app.get('/api/events', async (req: Request, res: Response) => {
  try {
    const { category, isToday, isTonight, placeId, nazri, search } = req.query;

    let events: any[] = [];
    let usedFallback = false;

    try {
      const whereClause: any = {};
      if (category && typeof category === 'string' && category !== 'all') {
        whereClause.category = category;
      }
      if (isToday === 'true') {
        whereClause.isToday = true;
      }
      if (isTonight === 'true') {
        whereClause.isTonight = true;
      }
      if (placeId && typeof placeId === 'string') {
        whereClause.placeId = placeId;
      }
      if (nazri === 'true') {
        whereClause.nazri = true;
      }
      if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.trim();
        whereClause.OR = [
          { title: { contains: q } },
          { speaker: { contains: q } },
          { eulogist: { contains: q } },
          { qari: { contains: q } },
        ];
      }

      events = await prisma.event.findMany({
        where: whereClause,
        include: {
          place: {
            include: { neighborhood: true },
          },
        },
        orderBy: { date: 'asc' },
      });
    } catch (dbErr) {
      console.warn('خطا در خواندن رویدادها از دیتابیس:', dbErr);
      usedFallback = true;
    }

    if (usedFallback || !events || events.length === 0) {
      let filtered = [...INITIAL_EVENTS];
      if (category && typeof category === 'string' && category !== 'all') {
        filtered = filtered.filter((e) => e.category === category);
      }
      if (isToday === 'true') {
        filtered = filtered.filter((e) => e.isToday);
      }
      if (isTonight === 'true') {
        filtered = filtered.filter((e) => e.isTonight);
      }
      if (placeId && typeof placeId === 'string') {
        filtered = filtered.filter((e) => e.placeId === placeId);
      }
      if (nazri === 'true') {
        filtered = filtered.filter((e) => e.services.nazri);
      }
      if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.speaker?.toLowerCase().includes(q) ||
            e.eulogist?.toLowerCase().includes(q) ||
            e.placeName.toLowerCase().includes(q)
        );
      }

      return res.json({
        success: true,
        count: filtered.length,
        data: filtered,
      });
    }

    const formatted = events.map(formatEvent);
    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('خطا در بازیابی رویدادها:', error);
    res.status(500).json({ success: false, error: 'خطای سرور در بازیابی رویدادها' });
  }
});

// ----------------------------------------------------
// ۷. مراسمات امروز و امشب (GET /api/events/today)
// ----------------------------------------------------
app.get('/api/events/today', async (req: Request, res: Response) => {
  try {
    let todayEvents: any[] = [];
    try {
      todayEvents = await prisma.event.findMany({
        where: {
          OR: [{ isToday: true }, { isTonight: true }],
        },
        include: {
          place: {
            include: { neighborhood: true },
          },
        },
      });
    } catch (dbErr) {
      console.warn('دیتابیس در دسترس نیست:', dbErr);
    }

    if (!todayEvents || todayEvents.length === 0) {
      const fallbackEvents = INITIAL_EVENTS.filter((e) => e.isToday || e.isTonight);
      return res.json({
        success: true,
        count: fallbackEvents.length,
        data: fallbackEvents,
      });
    }

    const formatted = todayEvents.map(formatEvent);
    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('خطا در دریافت رویدادهای امروز:', error);
    res.status(500).json({ success: false, error: 'خطای سرور در بازیابی رویدادهای امروز' });
  }
});

// ----------------------------------------------------
// ۸. جستجوی یکپارچه و هوشمند (GET /api/search?q=...)
// ----------------------------------------------------
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim().toLowerCase();
    if (!q) {
      return res.json({
        success: true,
        data: { places: [], events: [], neighborhoods: [] },
      });
    }

    let places: any[] = [];
    let events: any[] = [];
    let neighborhoods: any[] = [];

    try {
      [places, events, neighborhoods] = await Promise.all([
        prisma.place.findMany({
          where: {
            OR: [
              { name: { contains: q } },
              { address: { contains: q } },
              { description: { contains: q } },
              { imamOrCustodian: { contains: q } },
            ],
          },
          include: { neighborhood: true },
        }),
        prisma.event.findMany({
          where: {
            OR: [
              { title: { contains: q } },
              { speaker: { contains: q } },
              { eulogist: { contains: q } },
              { qari: { contains: q } },
              { description: { contains: q } },
            ],
          },
          include: { place: { include: { neighborhood: true } } },
        }),
        prisma.neighborhood.findMany({
          where: {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
            ],
          },
        }),
      ]);
    } catch (dbErr) {
      console.warn('دیتابیس در جستجو در دسترس نیست، استفاده از داده‌های حافظه:', dbErr);
    }

    if (places.length === 0 && events.length === 0 && neighborhoods.length === 0) {
      const matchPlaces = INITIAL_PLACES.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.neighborhood.toLowerCase().includes(q) ||
          p.imamOrCustodian?.toLowerCase().includes(q)
      );

      const matchEvents = INITIAL_EVENTS.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.speaker?.toLowerCase().includes(q) ||
          e.eulogist?.toLowerCase().includes(q) ||
          e.placeName.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      );

      const matchNeighborhoods = INITIAL_NEIGHBORHOODS.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.keyHighlights.some((kh) => kh.toLowerCase().includes(q))
      );

      return res.json({
        success: true,
        query: q,
        totalResults: matchPlaces.length + matchEvents.length + matchNeighborhoods.length,
        data: {
          places: matchPlaces,
          events: matchEvents,
          neighborhoods: matchNeighborhoods,
        },
      });
    }

    res.json({
      success: true,
      query: q,
      totalResults: places.length + events.length + neighborhoods.length,
      data: {
        places: places.map(formatPlace),
        events: events.map(formatEvent),
        neighborhoods: neighborhoods.map((n) => ({
          id: n.id,
          name: n.name,
          slug: n.slug,
          description: n.description,
          mosquesCount: n.mosquesCount,
          hussainiyasCount: n.hussainiyasCount,
          historicalCount: n.historicalCount,
          isHistoricalDistrict: n.isHistoricalDistrict,
          coordinates: [n.latitude, n.longitude],
          keyHighlights: n.keyHighlights ? JSON.parse(n.keyHighlights) : [],
        })),
      },
    });
  } catch (error) {
    console.error('خطا در جستجو:', error);
    res.status(500).json({ success: false, error: 'خطای سرور در پردازش جستجو' });
  }
});

// ----------------------------------------------------
// ۹. ثبت رویداد یا مراسم جدید (POST /api/events)
// ----------------------------------------------------
app.post('/api/events', async (req: Request, res: Response) => {
  try {
    const {
      placeId,
      title,
      speaker,
      eulogist,
      qari,
      date,
      dayOfWeek,
      timeStr,
      timeBadge,
      category,
      nazri,
      nazriDescription,
      liveStream,
      womenSection,
      parking,
      shovadoonActive,
      quranRecitation,
      latitude,
      longitude,
      description,
      contactPhone,
      streamUrl,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        error: 'عنوان مراسم و تاریخ برگزاری الزامی هستند.',
      });
    }

    let effectivePlaceId = placeId;
    let lat = latitude;
    let lng = longitude;

    // پیدا کردن یا اختصاص مکان پیش‌فرض اگر کاربر فقط نام انتخاب کرده باشد
    if (!effectivePlaceId) {
      const firstPlace = await prisma.place.findFirst();
      if (firstPlace) {
        effectivePlaceId = firstPlace.id;
        lat = lat || firstPlace.latitude;
        lng = lng || firstPlace.longitude;
      } else {
        effectivePlaceId = INITIAL_PLACES[0].id;
        lat = lat || INITIAL_PLACES[0].coordinates[0];
        lng = lng || INITIAL_PLACES[0].coordinates[1];
      }
    }

    let createdEvent: any = null;
    try {
      createdEvent = await prisma.event.create({
        data: {
          placeId: effectivePlaceId,
          title,
          speaker: speaker || null,
          eulogist: eulogist || null,
          qari: qari || null,
          date,
          dayOfWeek: dayOfWeek || 'امروز',
          timeStr: timeStr || 'بعد از نماز مغرب و عشاء',
          timeBadge: timeBadge || 'شب',
          category: category || 'mourning',
          nazri: Boolean(nazri),
          nazriDescription: nazriDescription || null,
          liveStream: Boolean(liveStream),
          womenSection: womenSection !== undefined ? Boolean(womenSection) : true,
          parking: Boolean(parking),
          shovadoonActive: Boolean(shovadoonActive),
          quranRecitation: Boolean(quranRecitation),
          latitude: Number(lat) || 32.3835,
          longitude: Number(lng) || 48.4010,
          isToday: true,
          isTonight: true,
          description: description || null,
          contactPhone: contactPhone || null,
          streamUrl: streamUrl || null,
        },
        include: {
          place: {
            include: { neighborhood: true },
          },
        },
      });
    } catch (dbErr) {
      console.warn('خطا در ثبت رویداد در دیتابیس، ساخت در حافظه:', dbErr);
      const newEvent = {
        id: `ev-${Date.now()}`,
        placeId: effectivePlaceId,
        placeName: 'مکان مذهبی دزفول',
        placeType: 'mosque' as const,
        neighborhood: 'دزفول',
        title,
        speaker,
        eulogist,
        qari,
        date,
        dayOfWeek: dayOfWeek || 'امروز',
        timeStr: timeStr || 'بعد از نماز عشاء',
        timeBadge: timeBadge || 'شب',
        category: category || 'mourning',
        coordinates: [Number(lat) || 32.3835, Number(lng) || 48.4010] as [number, number],
        isToday: true,
        isTonight: true,
        description,
        contactPhone,
        streamUrl,
        services: {
          nazri: Boolean(nazri),
          nazriDescription,
          liveStream: Boolean(liveStream),
          womenSection: womenSection !== undefined ? Boolean(womenSection) : true,
          parking: Boolean(parking),
          shovadoonActive: Boolean(shovadoonActive),
          quranRecitation: Boolean(quranRecitation),
        },
      };

      return res.status(201).json({
        success: true,
        message: 'مراسم با موفقیت ثبت شد',
        data: newEvent,
      });
    }

    res.status(201).json({
      success: true,
      message: 'مراسم با موفقیت در پایگاه داده ثبت شد',
      data: formatEvent(createdEvent),
    });
  } catch (error) {
    console.error('خطا در ثبت مراسم جدید:', error);
    res.status(500).json({ success: false, error: 'خطای سرور در ثبت مراسم جدید' });
  }
});

// ----------------------------------------------------
// ۱۰. اتصال به Vite Middleware در حالت توسعه یا فایل‌های استاتیک در پروداکشن
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 سرور اکسپرس دزفول با موفقیت روی پورت ${PORT} آماده پاسخگویی است.`);
  });
}

start();

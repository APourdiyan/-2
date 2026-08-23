import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PLACES, INITIAL_NEIGHBORHOODS } from './src/data/dezfulData.js';

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

// ----------------------------------------------------
// ۱. اندپوینت دریافت تمامی اماکن به همراه محله (GET /api/places)
// ----------------------------------------------------
app.get('/api/places', async (req: Request, res: Response) => {
  try {
    let places: any[] = [];
    try {
      places = await prisma.place.findMany({
        include: {
          neighborhood: true,
          events: true,
        },
        orderBy: { rating: 'desc' },
      });
    } catch (dbErr) {
      console.warn('دیتابیس در دسترس نیست، استفاده از داده‌های پیش‌فرض:', dbErr);
    }

    // در صورت خالی بودن دیتابیس یا قبل از seed، از داده‌های حافظه‌ای استفاده شود
    if (!places || places.length === 0) {
      places = INITIAL_PLACES.map((p) => {
        const n = INITIAL_NEIGHBORHOODS.find((item) => item.id === p.neighborhoodId);
        return {
          ...p,
          neighborhood: n || { id: p.neighborhoodId, name: p.neighborhood },
        };
      });
    }

    res.json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (error) {
    console.error('خطا در دریافت لیست اماکن:', error);
    res.status(500).json({ success: false, error: 'خطای سرور در بازیابی اماکن مذهبی' });
  }
});

// ----------------------------------------------------
// ۲. اندپوینت اماکن نزدیک با فرمول Haversine (GET /api/places/nearby?lat=X&lng=Y)
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
    }

    // محاسبه فاصله با فرمول هاورساین، فیلتر کردن کمتر از ۵۰۰۰ متر و مرتب‌سازی صعودی
    const nearbyPlaces = places
      .map((place) => {
        const distance = haversineDistanceMeters(
          lat,
          lng,
          place.latitude,
          place.longitude
        );
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

// اندپوینت وضعیت سلامت سرور
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', server: 'Dezful Religious Places API', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------
// ۳. اتصال به Vite Middleware در حالت توسعه یا فایل‌های استاتیک در پروداکشن
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

import { PrismaClient } from '@prisma/client';
import { INITIAL_NEIGHBORHOODS, INITIAL_PLACES, INITIAL_EVENTS } from '../src/data/dezfulData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 شروع عملیات بارگذاری اولیه داده‌های دزفول (Seeding)...');

  // ۱. پاکسازی رکوردهای قبلی برای جلوگیری از خطای کلید تکراری
  await prisma.event.deleteMany();
  await prisma.place.deleteMany();
  await prisma.neighborhood.deleteMany();

  // ۲. درج محلات دزفول (Neighborhoods)
  console.log(`📍 در حال ثبت ${INITIAL_NEIGHBORHOODS.length} محله دزفول...`);
  for (const n of INITIAL_NEIGHBORHOODS) {
    await prisma.neighborhood.create({
      data: {
        id: n.id,
        name: n.name,
        slug: n.slug,
        description: n.description,
        mosquesCount: n.mosquesCount,
        hussainiyasCount: n.hussainiyasCount,
        historicalCount: n.historicalCount,
        isHistoricalDistrict: n.isHistoricalDistrict,
        latitude: n.coordinates[0],
        longitude: n.coordinates[1],
        keyHighlights: JSON.stringify(n.keyHighlights),
      },
    });
  }

  // ۳. آماده‌سازی و درج اماکن مذهبی با createMany
  console.log(`🕌 در حال ثبت ${INITIAL_PLACES.length} مکان مذهبی دزفول...`);
  const placesData = INITIAL_PLACES.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    isHistorical: p.isHistorical,
    historicalPeriod: p.historicalPeriod || null,
    neighborhoodId: p.neighborhoodId,
    address: p.address,
    latitude: p.coordinates[0],
    longitude: p.coordinates[1],
    phone: p.phone || null,
    isCurrentlyOpen: p.isCurrentlyOpen,
    openingHours: p.openingHours || null,
    capacity: p.capacity || 0,
    imamOrCustodian: p.imamOrCustodian || null,
    image: p.image || null,
    description: p.description || null,
    historySummary: p.historySummary || null,
    establishedYear: p.establishedYear || null,
    shovadoon: p.features?.shovadoon || false,
    shovadoonDepthMeters: p.features?.shovadoonDepthMeters || null,
    ladiesSection: p.features?.ladiesSection ?? true,
    wheelchairAccess: p.features?.wheelchairAccess ?? false,
    quranClasses: p.features?.quranClasses ?? false,
    parking: p.features?.parking ?? false,
    liveBroadcast: p.features?.liveBroadcast ?? false,
    wuduFacilities: p.features?.wuduFacilities ?? true,
    library: p.features?.library ?? false,
    coolingSystem: p.features?.coolingSystem || null,
    rating: p.rating || 4.8,
  }));

  await prisma.place.createMany({
    data: placesData,
  });

  // ۴. آماده‌سازی و درج رویدادها و مراسمات
  console.log(`🌙 در حال ثبت ${INITIAL_EVENTS.length} رویداد و مراسم...`);
  const eventsData = INITIAL_EVENTS.map((e) => ({
    id: e.id,
    placeId: e.placeId,
    title: e.title,
    speaker: e.speaker || null,
    eulogist: e.eulogist || null,
    qari: e.qari || null,
    date: e.date,
    dayOfWeek: e.dayOfWeek || null,
    timeStr: e.timeStr || null,
    timeBadge: e.timeBadge || null,
    category: e.category,
    nazri: e.services?.nazri || false,
    nazriDescription: e.services?.nazriDescription || null,
    liveStream: e.services?.liveStream || false,
    womenSection: e.services?.womenSection ?? true,
    parking: e.services?.parking ?? false,
    shovadoonActive: e.services?.shovadoonActive ?? false,
    quranRecitation: e.services?.quranRecitation ?? false,
    latitude: e.coordinates[0],
    longitude: e.coordinates[1],
    isToday: e.isToday ?? false,
    isTonight: e.isTonight ?? false,
    description: e.description || null,
    contactPhone: e.contactPhone || null,
    streamUrl: e.streamUrl || null,
    attendeesCount: e.attendeesCount || 0,
  }));

  await prisma.event.createMany({
    data: eventsData,
  });

  console.log('✅ بارگذاری اولیه داده‌های دزفول با موفقیت کامل شد.');
}

main()
  .catch((e) => {
    console.error('❌ خطا در Seed کردن دیتابیس:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

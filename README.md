# 🕌 سامانه هوشمند نقشه و دایرکتوری اماکن مذهبی کهن‌شهر دزفول
> **جامع‌ترین پلتفرم تعاملی اطلاعات مساجد، حسینیه‌ها، بقاع متبرکه و تقویم لحظه‌ای مراسمات شهر دارالمؤمنین دزفول**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet.js](https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=Leaflet&logoColor=white)](https://leafletjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Express.js](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh/)

---

## 🕌 ۱. معرفی پروژه و اهداف
شهر کهن **دزفول (پایتخت مقاومت و شهر دارالمؤمنین)** با پیشینه‌ای چند هزار ساله، دارای صدها مسجد تاریخی با معماری آجرکاری خاص، حسینیه‌های پرشور با آیین‌های سنتی (نظیر علم‌داری و چوب‌بازی) و شاهکار معماری اقلیمی **شوادون (شبستان‌های زیرزمینی خنک)** است.

این سامانه به منظور رفع خلأهای زیر طراحی و پیاده‌سازی شده است:
- **دسترسی سریع شهروندان و گردشگران** به اطلاعات دقیق موقعیت مکانی، ساعات برپایی نماز جماعت، سخنرانان و مداحان مراسمات.
- **مسیریابی هوشمند چندگانه** با اتصال مستقیم به اپلیکیشن‌های بومی و بین‌المللی (نشان، بلد، گوگل مپ).
- **ثبت ویژگی‌های اقلیمی دزفول** از جمله شناسنامه شوادون، سیستم‌های سرمایشی، دسترسی معلولین و بخش بانوان.
- **اطلاع‌رسانی بلادرنگ رویدادها** و تنظیم یادآورهای شخصی با پشتیبانی کامل از تاریخ و تقویم شمسی جلالی.

---

## ✨ ۲. ویژگی‌های کلیدی سامانه
- 🗺️ **نقشه تعاملی و هوشمند دزفول (Leaflet & MarkerCluster):** نمایش پین‌های سفارشی بر اساس نوع مکان (مسجد، حسینیه، بقعه) با لایه‌های متنوع (روشن، ماهواره‌ای، دارک) و محاسبه فاصله هاورساین.
- 🤖 **دستیار هوشمند و جستجوی معنایی:** فیلتر آنی بر اساس محلات کهن (قلعه، کرناسیان، سیاه‌پوشان، کوپیته و...)، اسامی سخنرانان، مداحان یا نوع امکانات.
- 🏛️ **دانشنامه اختصاصی شوادون‌شناسی:** ثبت عمق شوادون‌های دستکند، هوای مطبوع زیرزمینی و وضعیت برگزاری مراسم در خنکای شوادون دزفول.
- 🌓 **پشتیبانی کامل از حالت تاریک (Dark Mode):** سازگار با تم رنگی آجری اصیل دزفول (`#B4552D` و `#0E7C86`) و تم Slate در تاریکی.
- ⏰ **اوقات شرعی دقیق دزفول و آلارم نماز:** تایمر اختصاصی اذان به افق دزفول همراه با وضعیت باز/بسته بودن درب اماکن.
- 🔔 **سیستم اعلان‌ها و یادآوری رویدادها:** ذخیره‌سازی محلی نوتیفیکیشن‌ها برای دعای کمیل، ندبه، جلسات قرآنی و هیئات با برچسب پذیرایی و نذری.
- 📱 **طراحی واکنش‌گرا و مدرن (PWA Ready):** رابط کاربری راست‌چین (RTL) با فونت استاندارد وزیرمتن (Vazirmatn) و باتم‌شیت اختصاصی موبایل.

---

## 🛠 ۳. استک فناوری (Tech Stack)

| لایه | فناوری‌ها و کتابخانه‌ها |
| :--- | :--- |
| **فرانت‌اند (Frontend)** | React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion (Framer Motion) |
| **نقشه‌نگاری (GIS & Maps)** | Leaflet.js, React-Leaflet, Leaflet.markercluster |
| **مدیریت وضعیت و تقویم** | Zustand Store, Date-fns Jalali (تقویم شمسی دقیق) |
| **بک‌اند و وب‌سرور** | Express.js, TypeScript (`tsx`), CORS, Dotenv |
| **دیتابیس و ORM** | Prisma ORM, SQLite / PostgreSQL |
| **ابزار بیلد و اجرای پرسرعت** | Bun / Node.js, Vite, ESBuild, Prettier |

---

## 🚀 ۴. راهنمای نصب و اجرای محلی (Quick Start)

### پیش‌نیازها:
- نصب [Bun](https://bun.sh) (توصیه شده) یا [Node.js](https://nodejs.org) (نسخه 18 به بالا).

### مراحل گام‌به‌گام:

```bash
# ۱. کلون کردن مخزن پروژه
git clone https://github.com/your-repo/dezful-religious-map.git
cd dezful-religious-map

# ۲. نصب پکیج‌ها و وابستگی‌ها با Bun (یا npm install)
bun install

# ۳. تنظیم فایل متغیرهای محیطی
cp .env.example .env

# ۴. تولید کلاینت Prisma و همگام‌سازی اسکیما با پایگاه داده
bunx prisma generate
bunx prisma db push

# ۵. بارگذاری داده‌های اولیه محلات و مساجد دزفول (Seed)
bun run db:seed

# ۶. اجرای سرور توسعه یکپارچه (Express + Vite روی پورت ۳۰۰۰)
bun run dev
```

سامانه روی آدرس `http://localhost:3000` آماده به کار خواهد بود.

---

## ⚙️ ۵. تنظیمات متغیرهای محیطی (`.env`)

نمونه فایل تنظیمات در `.env.example` قرار دارد:

```env
# کلید احراز هویت سرویس هوش مصنوعی گوگل جیمنای (سمت سرور)
GEMINI_API_KEY="your_gemini_api_key_here"

# کلید هوش مصنوعی در محیط کلاینت
VITE_GOOGLE_AI_API_KEY="your_api_key_here"

# آدرس ریشه برنامه
APP_URL="http://localhost:3000"

# رشته اتصال به پایگاه داده Prisma
DATABASE_URL="file:./dev.db"
# یا برای دیتابیس PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/dezful_map"
```

---

## 📂 ۶. ساختار پوشه‌بندی پروژه

```text
dezful-religious-map/
├── prisma/
│   ├── schema.prisma        # اسکیمای رابطه‌ای مدل‌های Neighborhood, Place, Event
│   └── seed.ts              # اسکریپت Seed بارگذاری اطلاعات اولیه دزفول
├── src/
│   ├── components/          # کامپوننت‌های ماژولار UI
│   │   ├── Header.tsx           # نوار هدر با سوییچ تم و اوقات شرعی
│   │   ├── MapView.tsx          # نقشه تعاملی لیفلت با لایه‌بندی و کلاستر
│   │   ├── PlaceCard.tsx        # کارت اطلاعات مسجد با نشان شوادون
│   │   ├── PlaceDetailModal.tsx # مودال و باتم‌شیت جزئیات کامل مکان
│   │   ├── NeighborhoodFilter.tsx # فیلتر تب‌های محلات عرفی دزفول
│   │   ├── LiveEventsFeed.tsx   # فید رویدادهای زنده، نذری و مداحان
│   │   └── SearchModal.tsx      # پنجره جستجوی پیشرفته و هوشمند
│   ├── data/
│   │   └── dezfulData.ts        # داده‌های اولیه غنی تاریخی و مذهبی دزفول
│   ├── pages/
│   │   ├── HomePage.tsx         # صفحه اصلی و داشبورد نقشه
│   │   ├── PlaceDetailPage.tsx  # صفحه اختصاصی و عمیق هر مکان
│   │   └── CalendarPage.tsx     # تقویم ماهانه و هفتگی رویدادهای مذهبی
│   ├── store/
│   │   └── appStore.ts          # مدیریت سراسری استیت با Zustand
│   ├── types.ts                 # تعاریف تایپ‌های TypeScript
│   ├── utils/
│   │   └── persianUtils.ts      # توابع محاسباتی تقویم جلالی و ارقام فارسی
│   ├── App.tsx                  # مسیریاب اصلی React Router
│   ├── main.tsx                 # نقطه ورود برنامه کلاینت
│   └── index.css                # پیکربندی استایل‌های Tailwind CSS و فونت
├── server.ts                # سرور فول‌استک Express با فرمول فاصله‌سنجی Haversine
├── .env.example             # نمونه متغیرهای محیطی
├── .prettierrc              # پیکربندی فرمت‌بندی استاندارد کدها
├── package.json             # تنظیمات وابستگی‌ها و اسکریپت‌های پروژه
└── README.md                # مستندات جامع پروژه
```

---

## 💻 ۷. اسکریپت‌های کاربردی (NPM Scripts)

- `bun run dev`: اجرای سرور Express و وب‌اپلیکیشن Vite
- `bun run build`: بیلد پروداکشن کلاینت و ساخت باندل سرور Node در `dist/server.cjs`
- `bun run start`: اجرای نسخه نهایی پروداکشن
- `bun run db:generate`: ساخت خودکار تایپ‌ها و کلاینت Prisma
- `bun run db:push`: اعمال تغییرات اسکیما روی دیتابیس
- `bun run db:seed`: درج داده‌های دزفول در دیتابیس
- `bun run lint`: بررسی خطاهای تایپ‌اسکریپت بدون خروجی
- `bun run format`: فرمت‌بندی خودکار کدها با Prettier

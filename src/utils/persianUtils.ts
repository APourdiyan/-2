// Persian typography and date helpers

export function toPersianDigits(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const str = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d, 10)]);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${toPersianDigits(Math.round(meters))} متر`;
  }
  return `${toPersianDigits((meters / 1000).toFixed(1))} کیلومتر`;
}

// Calculate distance between two GPS coordinates using Haversine formula (returns meters)
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function getRoutingLinks(lat: number, lng: number, title: string) {
  const encodedTitle = encodeURIComponent(title);
  return {
    neshan: `https://neshan.org/maps/@${lat},${lng},17z/search/${encodedTitle}`,
    balad: `https://balad.ir/location?latitude=${lat}&longitude=${lng}`,
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
  };
}

// Get current Persian Solar Date string
export function getCurrentJalaliDateString(): {
  fullDate: string;
  dayOfWeek: string;
  dayOfMonth: string;
  monthName: string;
  year: string;
} {
  const days = ['یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  
  const now = new Date();
  const dayOfWeek = days[now.getDay()];
  
  // Approximate Jalali conversion for display or Intl fallback
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    const parts = formatter.formatToParts(now);
    const day = parts.find(p => p.type === 'day')?.value || '۱';
    const month = parts.find(p => p.type === 'month')?.value || 'شهریور';
    const year = parts.find(p => p.type === 'year')?.value || '۱۴۰۵';
    
    return {
      fullDate: `${dayOfWeek}، ${day} ${month} ${year}`,
      dayOfWeek,
      dayOfMonth: day,
      monthName: month,
      year
    };
  } catch {
    return {
      fullDate: `${dayOfWeek}، ۱ شهریور ۱۴۰۵`,
      dayOfWeek,
      dayOfMonth: '۱',
      monthName: 'شهریور',
      year: '۱۴۰۵'
    };
  }
}

// Dezful today prayer times (approximate times for local atmosphere)
export const DEZFUL_PRAYER_TIMES = {
  fajr: '۰۴:۴۲',
  sunrise: '۰۶:۰۵',
  dhuhr: '۱۳:۱۵',
  asr: '۱۶:۴۵',
  maghrib: '۲۰:۰۲',
  isha: '۲۱:۱۵',
  midnight: '۰۰:۱۸'
};

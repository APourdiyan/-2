import React, { useState } from 'react';
import { Navigation, Loader2 } from 'lucide-react';

export interface LocationButtonProps {
  onLocationFound: (coords: { lat: number; lng: number }) => void;
  onError?: (errorMessage: string) => void;
  className?: string;
}

export const LocationButton: React.FC<LocationButtonProps> = ({
  onLocationFound,
  onError,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGetLocation = () => {
    setErrorMessage(null);

    if (!('geolocation' in navigator)) {
      const msg = 'مرورگر شما از قابلیت موقعیت‌یابی پشتیبانی نمی‌کند.';
      setErrorMessage(msg);
      onError?.(msg);
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        onLocationFound(coords);
      },
      (error) => {
        setIsLoading(false);
        let msg = 'برای یافتن نزدیک‌ترین مکان، دسترسی موقعیت لازم است';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'برای یافتن نزدیک‌ترین مکان، دسترسی موقعیت لازم است';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'سیگنال موقعیت مکانی در دسترس نیست.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'زمان درخواست موقعیت به پایان رسید.';
        }
        setErrorMessage(msg);
        onError?.(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className={`relative ${className}`}>
      <button
        id="btn-location-tracker"
        onClick={handleGetLocation}
        disabled={isLoading}
        aria-label="موقعیت مکانی من"
        title="موقعیت مکانی من"
        className="w-11 h-11 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-[#0E7C86] dark:text-[#18a8b6] hover:bg-stone-50 dark:hover:bg-slate-800 border border-stone-200/90 dark:border-slate-800 shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-60 backdrop-blur-md"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#0E7C86]" />
        ) : (
          <Navigation className="w-5 h-5 fill-[#0E7C86]/20 stroke-[2.2]" />
        )}
      </button>

      {/* پیام هشدار عدم دسترسی */}
      {errorMessage && (
        <div
          className="absolute bottom-full right-0 mb-2 w-64 p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/90 border border-amber-200 dark:border-amber-900/60 shadow-xl text-[11px] text-amber-900 dark:text-amber-200 font-medium z-50 text-right animate-fadeIn"
          dir="rtl"
        >
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default LocationButton;

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants/breakpoints';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  width: number;
  height: number;
}

export function useDevice(debounceMs: number = 100): DeviceInfo {
  const getDeviceInfo = (): DeviceInfo => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        width: 1280,
        height: 800,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // تشخیص دستگاه‌های لمسی
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      Boolean((navigator as any).msMaxTouchPoints > 0);

    // بررسی User-Agent برای دستگاه‌های موبایل و تبلت
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    const mobileUARegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const tabletUARegex = /iPad|Android(?!.*Mobile)|Tablet/i;

    const isMobileUA = mobileUARegex.test(userAgent);
    const isTabletUA = tabletUARegex.test(userAgent);

    // دسته‌بندی بر اساس نقاط شکست استاندارد و رفتار مرورگر
    const isMobile = width < BREAKPOINTS.tablet || (isMobileUA && width < BREAKPOINTS.laptop);
    const isTablet =
      (width >= BREAKPOINTS.tablet && width < BREAKPOINTS.laptop) ||
      (isTabletUA && width < BREAKPOINTS.desktop);
    const isDesktop = width >= BREAKPOINTS.laptop && !isMobileUA;

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      width,
      height,
    };
  };

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    // ارزیابی اولیه در هنگام mount
    setDeviceInfo(getDeviceInfo());

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [debounceMs]);

  return deviceInfo;
}

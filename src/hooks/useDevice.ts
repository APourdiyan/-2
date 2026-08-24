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

/**
 * هوک جامع تشخیص دستگاه، سایز پنجره، مدیا کوئری و قابلیت تاچ
 * به همراه ۲۰۰ میلی‌ثانیه debounce در رویدادهای resize و orientationchange
 */
export function useDevice(): DeviceInfo {
  const getDeviceState = (): DeviceInfo => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        width: 1280,
        height: 800
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < BREAKPOINTS.tablet;
    const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.laptop;
    const isDesktop = width >= BREAKPOINTS.laptop;
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      width,
      height
    };
  };

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceState);

  useEffect(() => {
    let timeoutId: number | undefined;

    const handleResize = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        setDeviceInfo(getDeviceState());
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}

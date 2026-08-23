import { useEffect } from 'react';
import { useDevice } from './useDevice';

export interface KeyboardShortcutsHandlers {
  onOpenSearch?: () => void;
  onCloseModals?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToEvents?: () => void;
  onNavigateToHome?: () => void;
  onToggleDarkMode?: () => void;
  onOpenSubmitEvent?: () => void;
}

/**
 * هوک مدیریت کلیدهای میانبر دسکتاپ (Keyboard Shortcuts)
 * فقط در حالت دسکتاپ (isDesktop) فعال است و تداخلی با تایپ در فیلدهای متنی ندارد.
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutsHandlers) {
  const { isDesktop } = useDevice();

  useEffect(() => {
    // اگر کاربر در موبایل یا تبلت باشد، شورت‌کات‌ها را غیرفعال نگه می‌داریم
    if (!isDesktop) return;

    const isEditableElement = (element: Element | null): boolean => {
      if (!element) return false;
      const tagName = element.tagName.toLowerCase();
      const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
      const isContentEditable = element.getAttribute('contenteditable') === 'true';
      return isInput || isContentEditable;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
      const activeEl = document.activeElement;
      const isTyping = isEditableElement(activeEl);

      // ۱. جستجوی سراسری: Ctrl + K یا Cmd + K
      if ((ctrlKey || metaKey) && key.toLowerCase() === 'k') {
        event.preventDefault();
        handlers.onOpenSearch?.();
        return;
      }

      // ۲. بستن مودال‌ها و پنجره‌ها با کلید Esc
      if (key === 'Escape' || key === 'Esc') {
        handlers.onCloseModals?.();
        return;
      }

      // ۳. تغییر تم تاریک/روشن: Alt + D
      if (altKey && key.toLowerCase() === 'd') {
        event.preventDefault();
        handlers.onToggleDarkMode?.();
        return;
      }

      // ۴. رفتن به خانه: Alt + 1
      if (altKey && key === '1') {
        event.preventDefault();
        handlers.onNavigateToHome?.();
        return;
      }

      // اگر کاربر در حال تایپ در فرم‌ها یا اینپوت‌ها باشد، کلیدهای تک‌حرفی زیر نباید اجرا شوند
      if (isTyping || ctrlKey || metaKey || altKey) {
        return;
      }

      // ۵. کلید اسلش (/) برای فوکوس روی جستجو
      if (key === '/') {
        event.preventDefault();
        handlers.onOpenSearch?.();
        return;
      }

      // ۶. کلید M یا m برای رفتن به نقشه
      if (key.toLowerCase() === 'm' || key === 'م') {
        event.preventDefault();
        handlers.onNavigateToMap?.();
        return;
      }

      // ۷. کلید E یا e برای رفتن به تقویم و مراسمات
      if (key.toLowerCase() === 'e' || key === 'ث') {
        event.preventDefault();
        handlers.onNavigateToEvents?.();
        return;
      }

      // ۸. کلید H یا h برای صفحه اصلی
      if (key.toLowerCase() === 'h' || key === 'ا') {
        event.preventDefault();
        handlers.onNavigateToHome?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDesktop, handlers]);
}

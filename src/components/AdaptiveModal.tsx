import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useDevice } from '../hooks/useDevice';

export interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-lg', 'max-w-2xl', 'max-w-3xl'
  maxHeight?: string; // e.g. 'max-h-[90vh]'
  showCloseButton?: boolean;
  showDragHandle?: boolean;
  className?: string;
  bodyClassName?: string;
  hideHeader?: boolean;
  customHeader?: React.ReactNode;
  zIndex?: number;
}

export const AdaptiveModal: React.FC<AdaptiveModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  maxHeight = 'max-h-[90vh]',
  showCloseButton = true,
  showDragHandle = true,
  className = '',
  bodyClassName = '',
  hideHeader = false,
  customHeader,
  zIndex = 50,
}) => {
  const { isMobile } = useDevice();

  // بستن مودال با کلید Escape در دسکتاپ
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    // قفل اسکرول بدنه صفحه در زمان باز بودن مودال
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="adaptive-modal-wrapper"
          style={{ zIndex }}
          className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden select-none font-sans"
        >
          {/* پس‌زمینه محو و تاریک (Backdrop with Blur) */}
          <motion.div
            id="adaptive-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* محفظه محتوای مودال (Bottom Sheet در موبایل و Centered Modal در دسکتاپ) */}
          {isMobile ? (
            /* ============================================================== */
            /* 📱 ۱. ساختار Bottom Sheet در موبایل (حرکت از پایین به بالا) */
            /* ============================================================== */
            <motion.div
              id="adaptive-modal-bottom-sheet"
              key="mobile-bottom-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                // در صورتی که کاربر کشیدن به سمت پایین را ادامه دهد، مودال بسته می‌شود
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  onClose();
                }
              }}
              className={`relative w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl ${maxHeight} flex flex-col overflow-hidden z-10 border-t border-stone-200 dark:border-slate-800 ${className}`}
            >
              {/* دستگیره سوایپ لمسی (Swipe Drag Handle) */}
              {showDragHandle && (
                <div className="pt-2 pb-1 shrink-0 flex justify-center cursor-grab active:cursor-grabbing">
                  <div className="w-12 h-1.5 bg-stone-300 dark:bg-slate-700 rounded-full" />
                </div>
              )}

              {/* سربرگ سفارشی یا استاندارد */}
              {customHeader ? (
                customHeader
              ) : !hideHeader && (title || showCloseButton) ? (
                <div className="px-4 py-3 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <div>
                    {title && <h3 className="font-bold text-base text-stone-900 dark:text-white">{title}</h3>}
                    {subtitle && <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{subtitle}</p>}
                  </div>
                  {showCloseButton && (
                    <button
                      id="close-bottom-sheet-btn"
                      onClick={onClose}
                      className="p-1.5 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                      aria-label="بستن"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ) : null}

              {/* بدنه محتوا با اسکرول مستقل */}
              <div className={`flex-1 overflow-y-auto overscroll-contain ${bodyClassName}`}>
                {children}
              </div>
            </motion.div>
          ) : (
            /* ============================================================== */
            /* 🖥️ ۲. ساختار Centered Modal در دسکتاپ و تبلت (وسط صفحه) */
            /* ============================================================== */
            <motion.div
              id="adaptive-modal-centered-box"
              key="desktop-centered-modal"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ${maxHeight} flex flex-col overflow-hidden z-10 border border-stone-200/80 dark:border-slate-800 ${className}`}
            >
              {/* سربرگ سفارشی یا استاندارد */}
              {customHeader ? (
                customHeader
              ) : !hideHeader && (title || showCloseButton) ? (
                <div className="px-6 py-4 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <div>
                    {title && <h3 className="font-extrabold text-lg text-stone-900 dark:text-white">{title}</h3>}
                    {subtitle && <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{subtitle}</p>}
                  </div>
                  {showCloseButton && (
                    <button
                      id="close-centered-modal-btn"
                      onClick={onClose}
                      className="p-2 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700 hover:text-stone-900 dark:hover:text-white transition-all active:scale-95"
                      aria-label="بستن پنجره"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ) : null}

              {/* بدنه محتوا با اسکرول مستقل */}
              <div className={`flex-1 overflow-y-auto overscroll-contain ${bodyClassName}`}>
                {children}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useDevice } from '../../hooks/useDevice';

export interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export const AdaptiveModal: React.FC<AdaptiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
  className = ''
}) => {
  const { isDesktop } = useDevice();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="adaptive-modal-portal"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center font-['Vazirmatn']"
          dir="rtl"
        >
          {/* Backdrop با افکت بلور و شفافیت ۶۰٪ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 dark:bg-black/75 backdrop-blur-md"
          />

          {isDesktop ? (
            /* 🖥️ مودال مرکزی دسکتاپ با انیمیشن Scale + Fade */
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`relative z-10 w-full ${maxWidth} max-h-[85vh] bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col mx-4 ${className}`}
            >
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900/50">
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-slate-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="p-6 overflow-y-auto flex-1">{children}</div>
            </motion.div>
          ) : (
            /* 📱 دراور باتم‌شیت موبایل با قابلیت درگ به پایین */
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 400) {
                  onClose();
                }
              }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`relative z-10 w-full max-h-[90vh] bg-white dark:bg-slate-900 border-t border-stone-200 dark:border-slate-800 rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col ${className}`}
            >
              {/* دستگیره درگ */}
              <div className="w-12 h-1.5 bg-stone-300 dark:bg-slate-700 rounded-full mx-auto my-3 shrink-0" />

              {title && (
                <div className="flex items-center justify-between px-5 pb-3 border-b border-stone-100 dark:border-slate-800">
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="p-5 overflow-y-auto flex-1 pb-10">{children}</div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdaptiveModal;

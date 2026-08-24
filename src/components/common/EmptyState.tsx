import React from 'react';
import { motion } from 'motion/react';
import { SearchX, CalendarX, MapPinOff, RefreshCw } from 'lucide-react';

export interface EmptyStateProps {
  type?: 'search' | 'calendar' | 'map' | 'saved' | 'general';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'search',
  title,
  description,
  actionText = 'پاک کردن فیلترها',
  onAction,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'calendar':
        return <CalendarX className="w-12 h-12 text-[#C26D47]" />;
      case 'map':
      case 'saved':
        return <MapPinOff className="w-12 h-12 text-[#0E7C86]" />;
      case 'search':
      default:
        return <SearchX className="w-12 h-12 text-[#0E7C86]" />;
    }
  };

  const defaultTitle =
    type === 'calendar'
      ? 'مراسمی برای این بازه زمانی یافت نشد'
      : type === 'saved'
      ? 'هنوز مکانی را ذخیره نکرده‌اید'
      : 'نتیجه‌ای یافت نشد';

  const defaultDesc =
    type === 'calendar'
      ? 'می‌توانید فیلتر نوع مراسم یا روزهای هفته را تغییر دهید.'
      : type === 'saved'
      ? 'با لمس آیکون نشان کردن در صفحه مکان‌ها، می‌توانید آن‌ها را اینجا ذخیره کنید.'
      : 'عبارت جستجو یا فیلترهای اعمال‌شده را بررسی کرده و مجدداً تلاش کنید.';

  return (
    <div
      id="empty-state-container"
      className={`flex flex-col items-center justify-center p-8 text-center font-['Vazirmatn'] ${className}`}
      dir="rtl"
    >
      {/* آیکون با انیمیشن ملایم شناور */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-3xl bg-stone-100 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 flex items-center justify-center mb-4 shadow-sm"
      >
        {getIcon()}
      </motion.div>

      <h3 className="text-base md:text-lg font-extrabold text-stone-900 dark:text-stone-100 mb-1.5">
        {title || defaultTitle}
      </h3>

      <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 max-w-sm mb-6 leading-relaxed">
        {description || defaultDesc}
      </p>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0E7C86] hover:bg-[#0c6b74] text-white text-xs md:text-sm font-bold shadow-md shadow-[#0E7C86]/20 active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;

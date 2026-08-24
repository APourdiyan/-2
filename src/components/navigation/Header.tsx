import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Moon, Sun, User, Bell } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useDevice } from '../../hooks/useDevice';

export interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenNotifications
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { isDesktop } = useDevice();

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      navigate('/search');
    }
  };

  return (
    <header
      id="app-header"
      className={`sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-stone-200/80 dark:border-slate-800 transition-all ${
        isDesktop ? 'h-16' : 'h-14'
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        {/* برند و عنوان */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-[#0E7C86] to-[#C26D47] text-white flex items-center justify-center shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-extrabold text-stone-900 dark:text-white leading-none">
              نقشه مذهبی دزفول
            </h1>
            <span className="text-[10px] text-[#C26D47] font-medium mt-0.5">
              مساجد، حسینیه‌ها و رویدادها
            </span>
          </div>
        </div>

        {/* فیلد جستجوی میانی در حالت دسکتاپ */}
        {isDesktop && (
          <div className="flex-1 max-w-lg mx-4">
            <div
              onClick={handleSearchClick}
              className="group flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-stone-100 dark:bg-slate-800/80 hover:bg-stone-200/70 dark:hover:bg-slate-700/80 border border-transparent hover:border-stone-300 dark:hover:border-slate-600 cursor-pointer transition-all text-stone-500 dark:text-stone-400"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-stone-400 group-hover:text-[#0E7C86] transition-colors" />
                <span className="text-xs md:text-sm">
                  جستجوی سریع مساجد، حسینیه‌ها، محلات دزفول...
                </span>
              </div>
              <kbd className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-[10px] font-mono text-stone-400">
                Ctrl + K
              </kbd>
            </div>
          </div>
        )}

        {/* اکشن‌های سمت چپ هدر */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* دکمه جستجو در موبایل */}
          {!isDesktop && (
            <button
              id="header-mobile-search-btn"
              onClick={handleSearchClick}
              aria-label="جستجو"
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* تغییر تم */}
          <button
            id="header-theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="تغییر تم رنگی"
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" />
            )}
          </button>

          {/* آیکون پروفایل در دسکتاپ */}
          {isDesktop && (
            <button
              id="header-profile-btn"
              onClick={() => navigate('/profile')}
              aria-label="پروفایل کاربری"
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

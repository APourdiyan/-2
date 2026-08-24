import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  MapPin,
  Calendar,
  Search,
  User,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  Settings,
  Bell
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: externalCollapsed,
  onToggleCollapse
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const navItems = [
    { path: '/', label: 'صفحه اصلی و نقشه', icon: Home },
    { path: '/search', label: 'جستجوی اماکن', icon: Search },
    { path: '/calendar', label: 'تقویم مراسمات', icon: Calendar },
    { path: '/profile', label: 'پروفایل و نشان‌ها', icon: User }
  ];

  return (
    <motion.aside
      id="desktop-sidebar"
      initial={false}
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="sticky top-0 h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-stone-200/80 dark:border-slate-800 flex flex-col justify-between z-30 select-none shadow-sm"
      dir="rtl"
    >
      {/* بخش بالای سایدبار: لوگو و هویت برند دزفول */}
      <div className="p-4 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0E7C86] to-[#C26D47] text-white flex items-center justify-center shadow-md shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col min-w-0"
              >
                <span className="font-extrabold text-stone-900 dark:text-white text-base leading-snug truncate">
                  نقشه مذهبی دزفول
                </span>
                <span className="text-[11px] text-[#C26D47] font-medium truncate">
                  دارالمؤمنین و پایتخت مقاومت
                </span>
              </motion.div>
            )}
          </div>

          <button
            id="sidebar-collapse-btn"
            onClick={handleToggle}
            aria-label={isCollapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'}
            className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 dark:text-stone-400 transition-colors"
          >
            {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* منوی ناوبری اصلی */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : undefined}
                className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-[#0E7C86] text-white shadow-md shadow-[#0E7C86]/20'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800/80 hover:text-stone-900 dark:hover:text-stone-200'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="absolute left-2 w-1.5 h-6 rounded-full bg-white/80" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* بخش پایین سایدبار: تنظیمات، تم و میانبرها */}
      <div className="p-4 border-t border-stone-200/80 dark:border-slate-800 flex flex-col gap-2">
        <button
          onClick={toggleTheme}
          title={isCollapsed ? 'تغییر تم رنگی' : undefined}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-500 shrink-0" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-500 shrink-0" />
          )}
          {!isCollapsed && (
            <span className="truncate">
              {theme === 'dark' ? 'حالت روز' : 'حالت شب'}
            </span>
          )}
        </button>

        {!isCollapsed && (
          <div className="mt-2 p-3 rounded-2xl bg-stone-100/70 dark:bg-slate-800/50 border border-stone-200/60 dark:border-slate-700/50 text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span>جستجو:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 text-[10px]">
                Ctrl + K
              </kbd>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>تغییر تم:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 text-[10px]">
                Alt + D
              </kbd>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;

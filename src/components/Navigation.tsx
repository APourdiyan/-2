import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  MapPin,
  Calendar,
  Building2,
  Search,
  PlusCircle,
  Clock,
  Warehouse,
  Bell,
  Sun,
  Moon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Map,
  Compass,
  Command,
  Heart,
  Bookmark,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDevice } from '../hooks/useDevice';
import { useAppStore } from '../store/appStore';
import { ActiveTab } from '../types';
import { toPersianDigits } from '../utils/persianUtils';

export interface NavigationProps {
  activeTab?: ActiveTab;
  onTabChange?: (tab: ActiveTab) => void;
  todayEventsCount?: number;
  onOpenSearch?: () => void;
  onOpenPrayerTimes?: () => void;
  onOpenSubmitEvent?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab = 'home',
  onTabChange,
  todayEventsCount = 3,
  onOpenSearch,
  onOpenPrayerTimes,
  onOpenSubmitEvent,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  className = '',
}) => {
  const { isMobile, isTablet, isDesktop } = useDevice();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useAppStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNeighborhoodsOpen, setIsNeighborhoodsOpen] = useState(true);

  // میانبرهای کیبورد برای دسکتاپ
  useEffect(() => {
    if (!isDesktop) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K یا Cmd+K یا کلید / برای جستجو
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        onOpenSearch ? onOpenSearch() : navigate('/?search=true');
      }
      // Alt+D برای دارک‌مود
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDarkMode();
      }
      // Alt+1 تا 4 برای تب‌ها
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        onTabChange ? onTabChange('home') : navigate('/');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        onTabChange ? onTabChange('calendar') : navigate('/calendar');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        onTabChange ? onTabChange('neighborhoods') : navigate('/?tab=neighborhoods');
      } else if (e.altKey && e.key === '4') {
        e.preventDefault();
        onOpenSubmitEvent ? onOpenSubmitEvent() : onTabChange?.('submit');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, onOpenSearch, onOpenSubmitEvent, onTabChange, navigate, toggleDarkMode]);

  const handleTabClick = (tab: ActiveTab) => {
    if (tab === 'submit' && onOpenSubmitEvent) {
      onOpenSubmitEvent();
      return;
    }
    if (onTabChange) {
      onTabChange(tab);
    } else {
      if (tab === 'home') navigate('/');
      else if (tab === 'map') navigate('/');
      else if (tab === 'calendar') navigate('/calendar');
    }
  };

  /* ============================================================== */
  /* 📱 ۱. ناوبری موبایل (< 768px): Bottom Navigation با ۴ تب اصلی */
  /* ============================================================== */
  if (isMobile) {
    const mobileTabs = [
      {
        id: 'home' as ActiveTab,
        label: 'اماکن و نقشه',
        icon: Home,
      },
      {
        id: 'calendar' as ActiveTab,
        label: 'تقویم مراسم',
        icon: Calendar,
        badge: todayEventsCount > 0 ? toPersianDigits(todayEventsCount) : undefined,
      },
      {
        id: 'neighborhoods' as ActiveTab,
        label: 'محله‌های کهن',
        icon: Building2,
      },
      {
        id: 'submit' as ActiveTab,
        label: 'ثبت مراسم',
        icon: PlusCircle,
        isAction: true,
      },
    ];

    return (
      <nav
        id="mobile-app-navigation"
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-stone-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1 safe-area-bottom ${className}`}
      >
        <div className="max-w-md mx-auto grid grid-cols-4 items-center">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`mobile-nav-btn-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all relative select-none ${
                  isActive
                    ? 'text-[#C26D47] font-bold'
                    : 'text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-9 h-7 flex items-center justify-center rounded-xl transition-all ${
                      isActive ? 'bg-[#C26D47]/10 dark:bg-[#C26D47]/20 scale-105' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  </div>
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-[#B4552D] text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] mt-0.5 whitespace-nowrap ${isActive ? 'font-black' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="w-1.5 h-1.5 rounded-full bg-[#C26D47] mt-0.5"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  /* ============================================================== */
  /* 🖥️ ۲. ناوبری دسکتاپ و تبلت: سایدبار سبک Notion / Slack با آیکون و متن */
  /* ============================================================== */
  return (
    <motion.aside
      id="desktop-notion-sidebar"
      initial={false}
      animate={{
        width: isSidebarCollapsed ? (isTablet ? 72 : 80) : isTablet ? 240 : 270,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
      className={`h-screen sticky top-0 z-30 bg-[#FBF9F5] dark:bg-slate-900 border-l border-stone-200/80 dark:border-slate-800 flex flex-col justify-between select-none shadow-sm transition-colors duration-200 ${className}`}
    >
      {/* سربرگ سایدبار - سبک Workspace در Notion / Slack */}
      <div className="p-3 border-b border-stone-200/60 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors group flex-1 min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C26D47] to-[#8C3A16] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <span>د</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-xs text-stone-900 dark:text-white truncate">اماکن مذهبی دزفول</h2>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/40">
                    کهن‌شهر
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 dark:text-slate-400 truncate">دارالمؤمنین و پایتخت آجر</p>
              </div>
            )}
          </div>

          <button
            id="toggle-sidebar-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-stone-200/60 dark:hover:bg-slate-800 transition-colors shrink-0"
            title={isSidebarCollapsed ? 'گسترش منو' : 'جمع کردن منو'}
          >
            {isSidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* کادر جستجوی سریع Notion-like */}
        {!isSidebarCollapsed && (
          <button
            id="notion-style-search-bar"
            onClick={onOpenSearch}
            className="mt-2.5 w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-stone-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-lg border border-stone-200/80 dark:border-slate-700/80 shadow-2xs transition-all group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C26D47] transition-colors" />
              <span>جستجوی سریع...</span>
            </span>
            <span className="flex items-center gap-0.5 font-mono text-[9px] bg-stone-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-stone-200 dark:border-slate-700">
              <Command className="w-2.5 h-2.5" /> K
            </span>
          </button>
        )}
      </div>

      {/* بخش بدنه آیتم‌های سایدبار (لیست عمودی آیکون + متن) */}
      <div className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
        {/* دسته ۱: فضاهای اصلی */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-stone-400 dark:text-slate-500 uppercase">
              بخش‌های اصلی
            </div>
          )}
          <div className="space-y-0.5">
            {[
              {
                id: 'home' as ActiveTab,
                label: 'خانه و اماکن دزفول',
                icon: Home,
                shortcut: 'Alt+1',
              },
              {
                id: 'map' as ActiveTab,
                label: 'نقشه جامع جغرافیایی',
                icon: Map,
              },
              {
                id: 'calendar' as ActiveTab,
                label: 'تقویم مراسمات و مناسبت‌ها',
                icon: Calendar,
                badge: todayEventsCount > 0 ? toPersianDigits(todayEventsCount) : undefined,
                badgeColor: 'bg-[#B4552D] text-white',
                shortcut: 'Alt+2',
              },
              {
                id: 'neighborhoods' as ActiveTab,
                label: 'محله‌های تاریخی و کهن',
                icon: Building2,
                shortcut: 'Alt+3',
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`notion-nav-item-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#C26D47] text-white shadow-xs font-bold'
                      : 'text-stone-700 dark:text-slate-300 hover:bg-stone-200/60 dark:hover:bg-slate-800 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${item.badgeColor || 'bg-stone-200 dark:bg-slate-800'}`}>
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <span className="hidden group-hover:inline-block font-mono text-[9px] opacity-75">
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* دسته ۲: ابزارها و امکانات شهری */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-stone-400 dark:text-slate-500 uppercase">
              امکانات ویژه دزفول
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={onOpenPrayerTimes}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-stone-700 dark:text-slate-300 hover:bg-stone-200/60 dark:hover:bg-slate-800 hover:text-stone-900 dark:hover:text-white transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                {!isSidebarCollapsed && <span className="truncate">اوقات شرعی به افق دزفول</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded font-bold">
                  برخط
                </span>
              )}
            </button>

            <button
              onClick={() => {
                handleTabClick('home');
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-stone-700 dark:text-slate-300 hover:bg-stone-200/60 dark:hover:bg-slate-800 hover:text-stone-900 dark:hover:text-white transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Warehouse className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                {!isSidebarCollapsed && <span className="truncate">شوادون‌های دستکند تاریخی</span>}
              </div>
            </button>

            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-stone-700 dark:text-slate-300 hover:bg-stone-200/60 dark:hover:bg-slate-800 hover:text-stone-900 dark:hover:text-white transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
                  {!isSidebarCollapsed && <span className="truncate">پیام‌ها و اطلاعیه‌ها</span>}
                </div>
                {!isSidebarCollapsed && unreadNotificationsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* دکمه برجسته Slack/Notion-like برای ثبت رویداد مردمی */}
        <div className="pt-2">
          <button
            id="notion-submit-event-btn"
            onClick={onOpenSubmitEvent ? onOpenSubmitEvent : () => handleTabClick('submit')}
            className={`w-full flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 transition-all group ${
              isSidebarCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#C26D47] group-hover:rotate-90 transition-transform duration-200 shrink-0" />
            {!isSidebarCollapsed && (
              <div className="text-right">
                <div className="text-xs font-bold text-stone-900 dark:text-white">ثبت مراسم و برنامه</div>
                <div className="text-[10px] text-stone-500 dark:text-slate-400">اطلاع‌رسانی عمومی رایگان</div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* پاورقی سایدبار دسکتاپ - وضعیت تم و نگارش */}
      <div className="p-2 border-t border-stone-200/60 dark:border-slate-800/80 space-y-1">
        <button
          id="notion-theme-toggle"
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-slate-400 hover:bg-stone-200/60 dark:hover:bg-slate-800 hover:text-stone-900 dark:hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            {!isSidebarCollapsed && <span>{isDarkMode ? 'حالت روز' : 'حالت شب'}</span>}
          </div>
          {!isSidebarCollapsed && (
            <span className="font-mono text-[9px] text-stone-400 dark:text-slate-500">Alt+D</span>
          )}
        </button>

        {!isSidebarCollapsed && (
          <div className="px-2.5 py-1 flex items-center justify-between text-[10px] text-stone-400 dark:text-slate-500">
            <span>دزفول • خوزستان</span>
            <span>نسخه ۲.۴</span>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

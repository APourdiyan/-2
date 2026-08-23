import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Calendar,
  Compass,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  Command,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDevice } from '../hooks/useDevice';
import { useAppStore } from '../store/appStore';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  onOpenSearch?: () => void;
  onQuickLocate?: () => void;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  onOpenSearch,
  onQuickLocate,
}) => {
  const { isMobile, isTablet, isDesktop } = useDevice();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useAppStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // میانبرهای صفحه‌کلید در دسکتاپ (Keyboard Shortcuts)
  useEffect(() => {
    if (!isDesktop) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // میانبر جستجو: Ctrl+K یا Cmd+K یا کلید /
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch?.();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        onOpenSearch?.();
      }

      // میانبر تغییر تم دارک‌مود: Alt+D
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDarkMode();
      }

      // ناوبری سریع
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        navigate('/');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        navigate('/calendar');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, onOpenSearch, toggleDarkMode, navigate]);

  const navItems = [
    {
      id: 'map',
      label: 'نقشه و اماکن',
      path: '/',
      icon: MapPin,
      badge: '۱۲ مکان',
      shortcut: 'Alt + 1',
    },
    {
      id: 'calendar',
      label: 'تقویم مراسمات',
      path: '/calendar',
      icon: Calendar,
      badge: 'امروز',
      shortcut: 'Alt + 2',
    },
  ];

  return (
    <div id="dezful-responsive-root" className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 text-stone-800 dark:text-stone-100 flex flex-col transition-colors duration-300 font-sans">
      {/* ============================================================== */}
      {/* 🖥️ ۱. دسکتاپ (> 1024px) و تبلت (768-1024px) - سایدبار + محتوای اصلی */}
      {/* ============================================================== */}
      {!isMobile ? (
        <div className="flex-1 flex w-full relative overflow-hidden">
          {/* سایدبار ناوبری */}
          <motion.aside
            id="desktop-tablet-sidebar"
            initial={false}
            animate={{
              width: isTablet
                ? isSidebarCollapsed ? 80 : 260
                : isSidebarCollapsed ? 88 : 280,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`h-screen sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-amber-900/10 dark:border-slate-800 flex flex-col justify-between shadow-xl transition-colors duration-300`}
          >
            {/* سربرگ سایدبار */}
            <div className="p-4 border-b border-amber-900/10 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C26D47] to-[#984521] text-white flex items-center justify-center shadow-md shadow-[#C26D47]/20 group-hover:scale-105 transition-transform duration-200">
                    <span className="font-bold text-lg">د</span>
                  </div>
                  {(!isSidebarCollapsed || !isTablet) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      <h1 className="font-extrabold text-base tracking-tight text-stone-900 dark:text-white leading-tight">
                        اماکن مذهبی دزفول
                      </h1>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        دارالمؤمنین و کهن‌شهر آجر
                      </p>
                    </motion.div>
                  )}
                </Link>

                {/* دکمه جمع کردن سایدبار در تبلت و دسکتاپ */}
                <button
                  id="toggle-sidebar-collapse-btn"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                  title={isSidebarCollapsed ? 'باز کردن منو' : 'بستن منو'}
                >
                  {isSidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>

              {/* کادر میانبر جستجوی سریع در دسکتاپ */}
              {isDesktop && !isSidebarCollapsed && (
                <button
                  id="desktop-search-trigger"
                  onClick={onOpenSearch}
                  className="mt-4 w-full flex items-center justify-between px-3 py-2 text-xs text-stone-500 dark:text-stone-400 bg-stone-100/80 dark:bg-slate-800/80 hover:bg-stone-200/80 dark:hover:bg-slate-700/80 rounded-xl border border-stone-200/60 dark:border-slate-700 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-stone-400 group-hover:text-[#C26D47] transition-colors" />
                    جستجوی سریع...
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-stone-300 dark:border-slate-700 shadow-2xs">
                    <Command className="w-3 h-3" /> K
                  </span>
                </button>
              )}
            </div>

            {/* لیست آیتم‌های ناوبری اصلی */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    id={`nav-link-${item.id}`}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-[#C26D47] text-white shadow-md shadow-[#C26D47]/25'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-amber-900/5 dark:hover:bg-slate-800 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      {(!isSidebarCollapsed || !isTablet) && (
                        <span className="whitespace-nowrap">{item.label}</span>
                      )}
                    </div>

                    {(!isSidebarCollapsed || !isTablet) && (
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-stone-200/70 dark:bg-slate-800 text-stone-600 dark:text-stone-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* راهنمای میانبر کیبورد در دسکتاپ هنگام هاور */}
                    {isDesktop && !isSidebarCollapsed && (
                      <span className="hidden group-hover:inline-block absolute left-2 text-[10px] opacity-75 font-mono">
                        {item.shortcut}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* بخش پاورقی سایدبار: سوییچ تم و اطلاعات دزفول */}
            <div className="p-3 border-t border-amber-900/10 dark:border-slate-800 space-y-2">
              <button
                id="sidebar-theme-toggle-btn"
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors font-medium text-xs"
              >
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                  {(!isSidebarCollapsed || !isTablet) && (
                    <span>{isDarkMode ? 'حالت روز' : 'حالت شب'}</span>
                  )}
                </div>
                {isDesktop && !isSidebarCollapsed && (
                  <span className="text-[10px] font-mono text-stone-400">Alt+D</span>
                )}
              </button>

              {(!isSidebarCollapsed || !isTablet) && (
                <div className="p-3 bg-amber-500/10 dark:bg-amber-500/5 rounded-xl border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200/90 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>شوادون‌های تاریخی دزفول</span>
                  </div>
                  <span>شبستان‌های زیرزمینی با خنکای طبیعی تابستان در قلب مساجد کهن</span>
                </div>
              )}
            </div>
          </motion.aside>

          {/* بدنه و صفحات (۲ ستونه در تبلت، ۳ ستونه در دسکتاپ) */}
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {children}
          </main>
        </div>
      ) : (
        /* ============================================================== */
        /* 📱 ۲. حالت موبایل (< 768px): محتوای تمام‌صفحه + Bottom Navigation */
        /* ============================================================== */
        <div className="flex-1 flex flex-col w-full pb-20">
          {/* محتوای اصلی تمام‌عرض */}
          <main className="flex-1 w-full">
            {children}
          </main>

          {/* ناوبری پایینی چسبان (Fixed Bottom Navigation) */}
          <nav
            id="mobile-bottom-navigation"
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-stone-200/80 dark:border-slate-800 px-4 py-2 flex items-center justify-around shadow-2xl safe-area-bottom"
          >
            <Link
              to="/"
              id="mobile-tab-home"
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                location.pathname === '/'
                  ? 'text-[#C26D47] font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span className="text-[11px]">نقشه</span>
            </Link>

            <button
              id="mobile-search-btn"
              onClick={onOpenSearch}
              className="flex flex-col items-center gap-1 py-1 px-3 text-stone-500 dark:text-stone-400 hover:text-[#C26D47] transition-colors"
            >
              <Search className="w-5 h-5" />
              <span className="text-[11px]">جستجو</span>
            </button>

            <Link
              to="/calendar"
              id="mobile-tab-calendar"
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                location.pathname === '/calendar'
                  ? 'text-[#C26D47] font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[11px]">مراسمات</span>
            </Link>

            <button
              id="mobile-theme-toggle"
              onClick={toggleDarkMode}
              className="flex flex-col items-center gap-1 py-1 px-3 text-stone-500 dark:text-stone-400 hover:text-amber-500 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              <span className="text-[11px]">{isDarkMode ? 'روز' : 'شب'}</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

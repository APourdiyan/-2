import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Calendar, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navTabs = [
    { path: '/', label: 'خانه', icon: Home },
    { path: '/search', label: 'جستجو', icon: Search },
    { path: '/calendar', label: 'مراسمات', icon: Calendar },
    { path: '/profile', label: 'پروفایل', icon: User }
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-stone-200/80 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] transition-all shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      dir="rtl"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);

          return (
            <button
              key={tab.path}
              id={`nav-tab-${tab.path.replace('/', '') || 'home'}`}
              onClick={() => navigate(tab.path)}
              className={`group flex-1 flex flex-col items-center justify-center py-1 relative transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[#0E7C86] dark:text-[#18a8b6] font-bold'
                  : 'text-stone-500 dark:text-stone-400 font-medium hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {/* نشانگر بالای تب فعال */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 rounded-full bg-[#0E7C86] dark:bg-[#18a8b6]" />
              )}

              <div
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'stroke-[2.4] fill-[#0E7C86]/15' : 'stroke-[1.8]'
                  }`}
                />
              </div>

              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;

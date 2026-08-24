import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { Header } from '../navigation/Header';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useThemeStore } from '../../store/themeStore';

export interface DesktopLayoutProps {
  children: React.ReactNode;
  onOpenSearch?: () => void;
  onCloseModals?: () => void;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  onOpenSearch,
  onCloseModals
}) => {
  const navigate = useNavigate();
  const { toggleTheme } = useThemeStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // شورت‌کات‌های کیبورد دسکتاپ
  useKeyboardShortcuts({
    onOpenSearch: () => {
      if (onOpenSearch) onOpenSearch();
      else navigate('/search');
    },
    onCloseModals: () => {
      if (onCloseModals) onCloseModals();
    },
    onNavigateToMap: () => navigate('/?tab=map'),
    onNavigateToEvents: () => navigate('/calendar'),
    onNavigateToHome: () => navigate('/'),
    onToggleDarkMode: () => toggleTheme()
  });

  return (
    <div
      id="desktop-layout-wrapper"
      className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 text-stone-900 dark:text-stone-100 flex font-['Vazirmatn'] selection:bg-[#C26D47]/20"
      dir="rtl"
    >
      {/* سایدبار ثابت سمت راست/چپ در RTL */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* ناحیه محتوای اصلی دسکتاپ */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* هدر بالای دسکتاپ (۶۴px) */}
        <Header onOpenSearch={onOpenSearch} />

        {/* بدنه محتوای مرکزی با محدودیت عرض ۱۴۰۰ پیکسل */}
        <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DesktopLayout;

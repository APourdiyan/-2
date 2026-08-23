import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PlaceDetailPage } from './pages/PlaceDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { useAppStore } from './store/appStore';

/**
 * کامپوننت اصلی مسیریابی (Routing) و مدیریت صفحات وب‌اپلیکیشن نقشه مذهبی دزفول
 */
export const App: React.FC = () => {
  const { isDarkMode } = useAppStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-[#F7F3EC] text-[#1F2430]'}`}>
      <BrowserRouter>
        <Routes>
          {/* ۱. صفحه اصلی و نقشه */}
          <Route path="/" element={<HomePage />} />

          {/* ۲. صفحه جزئیات کامل مکان (مسجد، حسینیه، بقعه) */}
          <Route path="/place/:id" element={<PlaceDetailPage />} />

          {/* ۳. صفحه تقویم و رویدادهای مذهبی دزفول */}
          <Route path="/calendar" element={<CalendarPage />} />

          {/* مسیر پیش‌فرض برای هدایت به خانه در صورت آدرس اشتباه */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;


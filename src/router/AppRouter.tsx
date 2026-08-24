import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSpinner } from '../components/LoadingSpinner';

// بارگذاری تنبل (Lazy Loading) صفحات برای عملکرد بهینه
const HomePage = lazy(() => import('../pages/HomePage'));
const PlaceDetailPage = lazy(() =>
  import('../pages/PlaceDetailPage').then((m) => ({ default: m.PlaceDetailPage }))
);
const CalendarPage = lazy(() =>
  import('../pages/CalendarPage').then((m) => ({ default: m.CalendarPage }))
);
const SearchPage = lazy(() => import('../pages/SearchPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-slate-950">
              <LoadingSpinner size="large" text="در حال بارگذاری سامانه نقشه دزفول..." />
            </div>
          }
        >
          <Routes>
            {/* صفحه اصلی (نقشه تعاملی + لیست محلات و اماکن) */}
            <Route path="/" element={<HomePage />} />

            {/* جزئیات مکان */}
            <Route path="/place/:id" element={<PlaceDetailPage />} />

            {/* تقویم رویدادها و مراسمات */}
            <Route path="/calendar" element={<CalendarPage />} />

            {/* صفحه جستجو */}
            <Route path="/search" element={<SearchPage />} />

            {/* صفحه پروفایل و تنظیمات */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* صفحه ۴۰۴ */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;

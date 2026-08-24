import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, ArrowRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 text-stone-900 dark:text-stone-100 flex flex-col items-center justify-center p-4 font-['Vazirmatn'] text-center"
      dir="rtl"
    >
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 shadow-sm">
          <MapPin className="w-10 h-10" />
        </div>

        <h1 className="text-4xl font-extrabold text-[#C26D47] mb-2 font-mono">۴۰۴</h1>
        <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
          صفحه مورد نظر در نقشه دزفول یافت نشد
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
          آدرس وارد شده اشتباه است یا ممکن است صفحه جابجا شده باشد.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0E7C86] hover:bg-[#0c6b73] text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>صفحه اصلی</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-medium text-sm transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

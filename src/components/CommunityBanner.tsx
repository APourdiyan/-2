import React from 'react';
import { PlusCircle, HandHeart, Sparkles, Megaphone } from 'lucide-react';

interface CommunityBannerProps {
  onOpenSubmitModal: () => void;
}

export const CommunityBanner: React.FC<CommunityBannerProps> = ({ onOpenSubmitModal }) => {
  return (
    <section className="my-6 sm:my-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#B4552D] via-[#9e4622] to-[#0E7C86] p-5 sm:p-7 text-white shadow-lg border border-[#B4552D]/30">
        {/* Background Islamic / Dezful Brick Pattern Accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 rounded-full bg-black/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-right">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/25 shadow-inner">
              <Megaphone className="w-6 h-6 text-[#E5B555]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">خادم یا متولی مسجد هستید؟</h3>
                <span className="text-[10px] font-bold bg-[#E5B555] text-[#1F2430] px-2 py-0.5 rounded-full">
                  رایگان
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 mt-0.5 leading-relaxed">
                برنامه‌ها، سخنرانان، مراسمات عزاداری و جلسات قرآنی مسجد خود را به اطلاع شهروندان دزفول برسانید.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSubmitModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#B4552D] hover:bg-[#F7F3EC] text-xs sm:text-sm font-extrabold px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#B4552D]" />
            <span>ثبت مراسم جدید</span>
          </button>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Header } from '../navigation/Header';
import { BottomNavigation } from '../navigation/BottomNavigation';
import { MessageCircle } from 'lucide-react';

export interface MobileLayoutProps {
  children: React.ReactNode;
  onOpenChatBot?: () => void;
  onOpenSearch?: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  onOpenChatBot,
  onOpenSearch
}) => {
  return (
    <div
      id="mobile-layout-wrapper"
      className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 text-stone-900 dark:text-stone-100 flex flex-col font-['Vazirmatn'] selection:bg-[#C26D47]/20"
      dir="rtl"
    >
      {/* هدر ثابت ۵۶px */}
      <Header onOpenSearch={onOpenSearch} />

      {/* محتوای اصلی با اسکرول آزاد و padding پایین برای نوار ناوبری */}
      <main className="flex-1 w-full max-w-lg mx-auto pb-20 overflow-y-auto">
        {children}
      </main>

      {/* دکمه شناور FAB چت‌بات هوشمند در گوشه پایین چپ/راست */}
      {onOpenChatBot && (
        <button
          id="mobile-chatbot-fab"
          onClick={onOpenChatBot}
          aria-label="گفتگو با راهنمای زنده دزفول"
          className="fixed bottom-20 left-4 z-40 w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#0E7C86] to-[#C26D47] text-white flex items-center justify-center shadow-lg shadow-[#0E7C86]/30 active:scale-90 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* نوار ناوبری پایین صفحه */}
      <BottomNavigation />
    </div>
  );
};

export default MobileLayout;

import React from 'react';
import { Home, Map, Calendar, Building2, PlusCircle } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  todayEventsCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  todayEventsCount
}) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'خانه', icon: Home },
    { id: 'map' as ActiveTab, label: 'نقشه دزفول', icon: Map },
    { id: 'calendar' as ActiveTab, label: 'تقویم مراسم', icon: Calendar, badge: todayEventsCount },
    { id: 'neighborhoods' as ActiveTab, label: 'محله‌ها', icon: Building2 },
    { id: 'submit' as ActiveTab, label: 'ثبت مراسم', icon: PlusCircle, isAction: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#DDD5C5] shadow-lg shadow-black/10 py-1.5 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center -mt-4 group relative"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  isActive
                    ? 'bg-[#B4552D] text-white ring-4 ring-[#B4552D]/20'
                    : 'bg-gradient-to-tr from-[#0E7C86] to-[#129aa7] text-white hover:scale-105'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold mt-1 transition-colors ${
                  isActive ? 'text-[#B4552D]' : 'text-[#71717A]'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-[#0E7C86] font-extrabold'
                  : 'text-[#71717A] hover:text-[#1F2430]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-[#B4552D] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-0.5">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C86] mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

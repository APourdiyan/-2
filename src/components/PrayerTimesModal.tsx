import React from 'react';
import { Clock, Sun, Moon, Sunrise, Sunset, Compass } from 'lucide-react';
import { DEZFUL_PRAYER_TIMES, toPersianDigits, getCurrentJalaliDateString } from '../utils/persianUtils';
import { AdaptiveModal } from './AdaptiveModal';

interface PrayerTimesModalProps {
  onClose: () => void;
}

export const PrayerTimesModal: React.FC<PrayerTimesModalProps> = ({ onClose }) => {
  const jalali = getCurrentJalaliDateString();

  const times = [
    { label: 'اذان صبح', time: DEZFUL_PRAYER_TIMES.fajr, icon: Moon, color: 'text-indigo-600' },
    { label: 'طلوع آفتاب', time: DEZFUL_PRAYER_TIMES.sunrise, icon: Sunrise, color: 'text-amber-500' },
    { label: 'اذان ظهر', time: DEZFUL_PRAYER_TIMES.dhuhr, icon: Sun, color: 'text-amber-600' },
    { label: 'غروب آفتاب', time: DEZFUL_PRAYER_TIMES.asr, icon: Sunset, color: 'text-orange-500' },
    { label: 'اذان مغرب', time: DEZFUL_PRAYER_TIMES.maghrib, icon: Moon, color: 'text-[#0E7C86]', isHighlight: true },
    { label: 'نیمه‌شب شرعی', time: DEZFUL_PRAYER_TIMES.midnight, icon: Moon, color: 'text-slate-600' },
  ];

  return (
    <AdaptiveModal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-md"
      title="اوقات شرعی شهر دزفول"
      subtitle={jalali.fullDate}
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* Times Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {times.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  item.isHighlight
                    ? 'bg-[#0E7C86]/10 border-[#0E7C86] ring-1 ring-[#0E7C86]'
                    : 'bg-[#F7F3EC] dark:bg-slate-800/60 border-[#DDD5C5] dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs font-bold text-[#1F2430] dark:text-slate-200">{item.label}</span>
                </div>
                <span className="text-sm font-black text-[#1F2430] dark:text-white tracking-wider">
                  {toPersianDigits(item.time)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Qibla Indicator note */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
          <span>جهت قبله در دزفول: ۲۲۲ درجه (جنوب غربی) با انحراف ملایم به سمت جنوب</span>
        </div>

        <button
          onClick={onClose}
          className="w-full min-h-[44px] bg-[#0E7C86] hover:bg-[#0a5d65] text-white py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          بستن
        </button>
      </div>
    </AdaptiveModal>
  );
};


import React from 'react';
import { X, Clock, Sun, Moon, Sunrise, Sunset, Compass } from 'lucide-react';
import { DEZFUL_PRAYER_TIMES, toPersianDigits, getCurrentJalaliDateString } from '../utils/persianUtils';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 border border-[#E0D8C8] animate-slideUp">
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0E7C86]/10 text-[#0E7C86] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1F2430]">اوقات شرعی شهر دزفول</h3>
              <p className="text-[11px] text-[#71717A]">{jalali.fullDate}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#71717A] hover:text-[#1F2430] rounded-xl hover:bg-[#F7F3EC]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Times Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          {times.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  item.isHighlight
                    ? 'bg-[#0E7C86]/10 border-[#0E7C86] ring-1 ring-[#0E7C86]'
                    : 'bg-[#F7F3EC] border-[#DDD5C5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs font-bold text-[#1F2430]">{item.label}</span>
                </div>
                <span className="text-sm font-black text-[#1F2430] tracking-wider">
                  {toPersianDigits(item.time)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Qibla Indicator note */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-700 shrink-0" />
          <span>جهت قبله در دزفول: ۲۲۲ درجه (جنوب غربی) با انحراف ملایم به سمت جنوب</span>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-[#0E7C86] hover:bg-[#0a5d65] text-white py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          بستن
        </button>
      </div>
    </div>
  );
};

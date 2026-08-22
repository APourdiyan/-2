import React from 'react';
import { X, Bell, Trash2, Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { EventItem } from '../types';

interface NotificationModalProps {
  savedReminderIds: string[];
  events: EventItem[];
  onClose: () => void;
  onRemoveReminder: (eventId: string) => void;
  onSelectEvent: (event: EventItem) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  savedReminderIds,
  events,
  onClose,
  onRemoveReminder,
  onSelectEvent
}) => {
  const reminderEvents = events.filter((e) => savedReminderIds.includes(e.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 border border-[#E0D8C8] max-h-[85vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1F2430]">یادآوری‌های من</h3>
              <p className="text-[11px] text-[#71717A]">مراسمات و رویدادهای نشان‌شده</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#71717A] hover:text-[#1F2430] rounded-xl hover:bg-[#F7F3EC]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 overflow-y-auto flex-1 space-y-3 mt-3 text-xs">
          {reminderEvents.length === 0 ? (
            <div className="py-12 text-center text-[#71717A] space-y-2">
              <Bell className="w-10 h-10 mx-auto text-[#C4B9A7]" />
              <p className="font-bold">هنوز هیچ یادآوری تنظیم نشده است.</p>
              <p className="text-[11px] text-[#8C8474]">با زدن دکمه «یادآوری کن» در کارت مراسمات، آن‌ها را در اینجا ذخیره کنید.</p>
            </div>
          ) : (
            reminderEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-2xl bg-[#F7F3EC] border border-[#DDD5C5] flex items-center justify-between gap-2"
              >
                <div 
                  onClick={() => {
                    onClose();
                    onSelectEvent(ev);
                  }}
                  className="cursor-pointer flex-1"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#B4552D]">
                    <span>{ev.placeName}</span>
                    <span>•</span>
                    <span>{ev.timeBadge}</span>
                  </div>
                  <h4 className="font-bold text-[#1F2430] mt-0.5">{ev.title}</h4>
                </div>

                <button
                  onClick={() => onRemoveReminder(ev.id)}
                  className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                  title="حذف یادآوری"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 bg-[#0E7C86] hover:bg-[#0a5d65] text-white py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          بستن
        </button>
      </div>
    </div>
  );
};

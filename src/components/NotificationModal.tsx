import React from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { EventItem } from '../types';
import { AdaptiveModal } from './AdaptiveModal';

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
    <AdaptiveModal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-md"
      title="یادآوری‌های من"
      subtitle="مراسمات و رویدادهای نشان‌شده"
    >
      <div className="p-4 sm:p-5 flex flex-col space-y-4">
        {/* Content */}
        <div className="overflow-y-auto flex-1 space-y-3 text-xs">
          {reminderEvents.length === 0 ? (
            <div className="py-12 text-center text-[#71717A] dark:text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-[#C4B9A7]" />
              <p className="font-bold">هنوز هیچ یادآوری تنظیم نشده است.</p>
              <p className="text-[11px] text-[#8C8474] dark:text-slate-400">با زدن دکمه «یادآوری کن» در کارت مراسمات، آن‌ها را در اینجا ذخیره کنید.</p>
            </div>
          ) : (
            reminderEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-2xl bg-[#F7F3EC] dark:bg-slate-800/60 border border-[#DDD5C5] dark:border-slate-700 flex items-center justify-between gap-2"
              >
                <div 
                  onClick={() => {
                    onClose();
                    onSelectEvent(ev);
                  }}
                  className="cursor-pointer flex-1"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#B4552D] dark:text-amber-400">
                    <span>{ev.placeName}</span>
                    <span>•</span>
                    <span>{ev.timeBadge}</span>
                  </div>
                  <h4 className="font-bold text-[#1F2430] dark:text-slate-100 mt-0.5">{ev.title}</h4>
                </div>

                <button
                  onClick={() => onRemoveReminder(ev.id)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="حذف یادآوری"
                  aria-label="حذف یادآوری"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
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


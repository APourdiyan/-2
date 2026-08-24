import React, { useState } from 'react';
import { PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Place, EventItem, EventCategory } from '../types';
import { submitEvent } from '../services/api';
import { AdaptiveModal } from './AdaptiveModal';

interface SubmitEventModalProps {
  places: Place[];
  onClose: () => void;
  onAddEvent: (newEvent: EventItem) => void;
}

export const SubmitEventModal: React.FC<SubmitEventModalProps> = ({
  places,
  onClose,
  onAddEvent
}) => {
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0]?.id || '');
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [eulogist, setEulogist] = useState('');
  const [category, setCategory] = useState<EventCategory>('komeyl_nodbeh');
  const [timeStr, setTimeStr] = useState('۲۱:۰۰');
  const [hasNazri, setHasNazri] = useState(false);
  const [nazriDesc, setNazriDesc] = useState('');
  const [hasWomenSection, setHasWomenSection] = useState(true);
  const [hasLiveStream, setHasLiveStream] = useState(false);
  const [isShovadoon, setIsShovadoon] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('لطفاً عنوان مراسم را وارد نمایید.');
      return;
    }

    const place = places.find((p) => p.id === selectedPlaceId) || places[0];

    const newEvent: EventItem = {
      id: `ev-user-${Date.now()}`,
      placeId: place.id,
      placeName: place.name,
      placeType: place.type,
      neighborhood: place.neighborhood,
      title: title.trim(),
      speaker: speaker.trim() || undefined,
      eulogist: eulogist.trim() || undefined,
      date: 'امروز',
      dayOfWeek: 'پنج‌شنبه',
      timeStr: timeStr,
      timeBadge: `امشب ساعت ${timeStr}`,
      category: category,
      services: {
        nazri: hasNazri,
        nazriDescription: nazriDesc.trim() || undefined,
        liveStream: hasLiveStream,
        womenSection: hasWomenSection,
        parking: place.features.parking,
        shovadoonActive: isShovadoon,
        quranRecitation: category === 'quran'
      },
      coordinates: place.coordinates,
      isToday: true,
      isTonight: true,
      contactPhone: contactPhone.trim() || undefined,
      attendeesCount: 50
    };

    try {
      await submitEvent({
        placeId: place.id,
        title: title.trim(),
        speaker: speaker.trim() || undefined,
        eulogist: eulogist.trim() || undefined,
        category,
        timeStr,
        timeBadge: `امشب ساعت ${timeStr}`,
        date: 'امروز',
        dayOfWeek: 'پنج‌شنبه',
        nazri: hasNazri,
        nazriDescription: nazriDesc.trim() || undefined,
        liveStream: hasLiveStream,
        womenSection: hasWomenSection,
        parking: place.features.parking,
        shovadoonActive: isShovadoon,
        quranRecitation: category === 'quran',
        latitude: place.coordinates[0],
        longitude: place.coordinates[1],
        contactPhone: contactPhone.trim() || undefined,
      });
    } catch (err) {
      console.warn('Could not post to server, handled locally:', err);
    }

    onAddEvent(newEvent);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <AdaptiveModal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-xl"
      title="ثبت مراسم مذهبی جدید"
      subtitle="اطلاع‌رسانی مراسم در نقشه و گاهشمار دزفول"
    >
      <div className="p-4 sm:p-6">
        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-black text-[#1F2430] dark:text-white">مراسم با موفقیت ثبت گردید!</h4>
            <p className="text-xs text-[#52525B] dark:text-slate-400">اطلاعات هم‌اکنون در صفحه اصلی و تقویم دزفول نمایش داده می‌شود.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Select Place */}
            <div>
              <label className="block font-bold text-[#1F2430] dark:text-slate-200 mb-1.5">محل برگزاری (مسجد یا حسینیه):</label>
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full bg-[#F7F3EC] dark:bg-slate-800 border border-[#DDD5C5] dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-[#1F2430] dark:text-slate-100 focus:border-[#0E7C86] focus:outline-none"
              >
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            {/* Event Title */}
            <div>
              <label className="block font-bold text-[#1F2430] dark:text-slate-200 mb-1.5">عنوان مراسم یا رویداد: *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="مثال: قرائت دعای کمیل و عزاداری شهادت با حضور جوانان"
                className="w-full bg-[#F7F3EC] dark:bg-slate-800 border border-[#DDD5C5] dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-[#1F2430] dark:text-slate-100 focus:border-[#0E7C86] focus:outline-none"
                required
              />
            </div>

            {/* Speaker & Eulogist in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#1F2430] dark:text-slate-200 mb-1.5">سخنران:</label>
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="نام سخنران یا واعظ محترم"
                  className="w-full bg-[#F7F3EC] dark:bg-slate-800 border border-[#DDD5C5] dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-[#1F2430] dark:text-slate-100 focus:border-[#0E7C86] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#1F2430] dark:text-slate-200 mb-1.5">مداح / ذاکر اهل بیت:</label>
                <input
                  type="text"
                  value={eulogist}
                  onChange={(e) => setEulogist(e.target.value)}
                  placeholder="نام مداح اهل بیت (ع)"
                  className="w-full bg-[#F7F3EC] dark:bg-slate-800 border border-[#DDD5C5] dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-[#1F2430] dark:text-slate-100 focus:border-[#0E7C86] focus:outline-none"
                />
              </div>
            </div>

            {/* Category & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#1F2430] dark:text-slate-200 mb-1.5">دسته‌بندی مراسم:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full bg-[#F7F3EC] dark:bg-slate-800 border border-[#DDD5C5] dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-[#1F2430] dark:text-slate-100 focus:border-[#0E7C86] focus:outline-none"
                >
                  <option value="komeyl_nodbeh">دعای کمیل یا ندبه</option>
                  <option value="mourning">روضه و عزاداری</option>
                  <option value="celebration">جشن و ولادت</option>
                  <option value="speech">سخنرانی و حلقه معرفتی</option>
                  <option value="quran">محفل انس با قرآن کریم</option>
                  <option value="prayer">نماز جماعت و ادعیه</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1F2430] dark:text-slate-200 mb-1.5">زمان شروع:</label>
                <input
                  type="text"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  placeholder="مثال: ۲۱:۳۰ یا همزمان با نماز مغرب"
                  className="w-full bg-[#F7F3EC] dark:bg-slate-800 border border-[#DDD5C5] dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-[#1F2430] dark:text-slate-100 focus:border-[#0E7C86] focus:outline-none"
                />
              </div>
            </div>

            {/* Services Toggles */}
            <div className="p-3 bg-[#F7F3EC] dark:bg-slate-800/60 rounded-2xl border border-[#DDD5C5] dark:border-slate-700 space-y-2">
              <span className="block font-bold text-[#1F2430] dark:text-slate-100 mb-1">امکانات و شرایط مراسم:</span>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasNazri}
                    onChange={(e) => setHasNazri(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B4552D] focus:ring-0"
                  />
                  <span>دارای پذیرایی یا نذری</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWomenSection}
                    onChange={(e) => setHasWomenSection(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0E7C86] focus:ring-0"
                  />
                  <span>ویژه بانوان و آقایان</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLiveStream}
                    onChange={(e) => setHasLiveStream(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0"
                  />
                  <span>پخش زنده اینترنتی</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isShovadoon}
                    onChange={(e) => setIsShovadoon(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F2430] dark:text-slate-100 focus:ring-0"
                  />
                  <span>برگزاری در شوادون</span>
                </label>
              </div>

              {hasNazri && (
                <input
                  type="text"
                  value={nazriDesc}
                  onChange={(e) => setNazriDesc(e.target.value)}
                  placeholder="توضیح نذری (مثلاً: توزیع آش محلی یا شربت)"
                  className="w-full bg-white dark:bg-slate-900 border border-[#DDD5C5] dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-[#1F2430] dark:text-slate-100 mt-1"
                />
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 min-h-[44px] bg-[#B4552D] hover:bg-[#964220] text-white py-2.5 px-4 rounded-xl font-bold shadow-md transition-all active:scale-[0.98]"
              >
                ثبت و انتشار مراسم
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] bg-[#F7F3EC] dark:bg-slate-800 hover:bg-[#E4DCB] text-[#52525B] dark:text-slate-300 py-2.5 px-4 rounded-xl font-bold transition-all"
              >
                انصراف
              </button>
            </div>
          </form>
        )}
      </div>
    </AdaptiveModal>
  );
};


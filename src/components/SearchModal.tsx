import React, { useState } from 'react';
import { X, Search, MapPin, Calendar, Building2, Landmark, Flame, ArrowLeft } from 'lucide-react';
import { Place, EventItem, Neighborhood } from '../types';
import { AdaptiveModal } from './AdaptiveModal';

interface SearchModalProps {
  places: Place[];
  events: EventItem[];
  neighborhoods: Neighborhood[];
  onClose: () => void;
  onSelectPlace: (place: Place) => void;
  onSelectEvent: (event: EventItem) => void;
  onSelectNeighborhood: (neighborhood: Neighborhood) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  places,
  events,
  neighborhoods,
  onClose,
  onSelectPlace,
  onSelectEvent,
  onSelectNeighborhood
}) => {
  const [query, setQuery] = useState('');

  const filteredPlaces = query.trim()
    ? places.filter(
        (p) =>
          p.name.includes(query) ||
          p.neighborhood.includes(query) ||
          p.address.includes(query) ||
          (p.historySummary && p.historySummary.includes(query))
      )
    : places.slice(0, 4);

  const filteredEvents = query.trim()
    ? events.filter(
        (e) =>
          e.title.includes(query) ||
          e.placeName.includes(query) ||
          (e.speaker && e.speaker.includes(query)) ||
          (e.eulogist && e.eulogist.includes(query))
      )
    : events.slice(0, 3);

  const filteredNeighborhoods = query.trim()
    ? neighborhoods.filter(
        (n) => n.name.includes(query) || n.description.includes(query)
      )
    : [];

  return (
    <AdaptiveModal
      isOpen={true}
      onClose={onClose}
      hideHeader={true}
      maxWidth="max-w-xl"
      maxHeight="max-h-[85vh]"
      bodyClassName="flex flex-col"
    >
      {/* Search Bar Input Header */}
      <div className="p-3 sm:p-4 border-b border-stone-200 dark:border-slate-800 flex items-center gap-2 shrink-0 bg-white dark:bg-slate-900">
        <Search className="w-5 h-5 text-[#0E7C86] dark:text-teal-400 shrink-0" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی نام مسجد، حسینیه، محله، سخنران، مداح یا شوادون..."
          className="flex-1 text-sm bg-transparent border-none focus:outline-none text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onClose}
          className="px-2.5 py-1 text-xs font-bold text-stone-500 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          بستن
        </button>
      </div>

      {/* Results Body */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs bg-white dark:bg-slate-900">
        {/* Quick Suggestions if empty */}
        {!query.trim() && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-[11px] text-stone-500 dark:text-slate-400">پیشنهادهای پرطرفدار:</span>
            {['مسجد جامع دزفول', 'سبزقبا', 'دعای کمیل', 'شوادون', 'سیاهپوشان', 'حسینیه اعظم'].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="bg-[#F7F3EC] dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 text-[11px] px-2.5 py-1 rounded-lg border border-stone-200 dark:border-slate-700 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Places Results */}
        <div>
          <h4 className="text-xs font-bold text-[#0E7C86] dark:text-teal-400 mb-2 flex items-center gap-1">
            <Landmark className="w-3.5 h-3.5" />
            <span>مساجد و حسینیه‌ها ({filteredPlaces.length})</span>
          </h4>
          <div className="space-y-2">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => {
                  onClose();
                  onSelectPlace(place);
                }}
                className="p-2.5 rounded-2xl bg-[#F7F3EC] dark:bg-slate-800/70 hover:bg-stone-200/70 dark:hover:bg-slate-700/70 transition-colors cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs ${
                    place.type === 'hussainiya' ? 'bg-[#B4552D]' : 'bg-[#0E7C86]'
                  }`}>
                    {place.name.slice(0, 1)}
                  </div>
                  <div>
                    <h5 className="font-bold text-stone-900 dark:text-white">{place.name}</h5>
                    <p className="text-[11px] text-stone-500 dark:text-slate-400 truncate">{place.neighborhood}</p>
                  </div>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Events Results */}
        {filteredEvents.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-[#B4552D] dark:text-amber-400 mb-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>مراسمات و رویدادها ({filteredEvents.length})</span>
            </h4>
            <div className="space-y-2">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    onClose();
                    onSelectEvent(ev);
                  }}
                  className="p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 border border-amber-200/50 dark:border-amber-900/50 transition-colors cursor-pointer flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-[#B4552D] dark:text-amber-400 font-bold">
                      <span>{ev.placeName}</span>
                      <span>•</span>
                      <span>{ev.timeBadge}</span>
                    </div>
                    <h5 className="font-bold text-stone-900 dark:text-white mt-0.5">{ev.title}</h5>
                    {ev.speaker && <p className="text-[10px] text-stone-500 dark:text-slate-400">سخنران: {ev.speaker}</p>}
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Neighborhoods Results */}
        {filteredNeighborhoods.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-stone-600 dark:text-slate-300 mb-2 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>محله‌ها</span>
            </h4>
            <div className="space-y-2">
              {filteredNeighborhoods.map((nh) => (
                <div
                  key={nh.id}
                  onClick={() => {
                    onClose();
                    onSelectNeighborhood(nh);
                  }}
                  className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 hover:border-[#0E7C86] dark:hover:border-teal-500 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-stone-900 dark:text-white">{nh.name}</h5>
                    <p className="text-[11px] text-stone-500 dark:text-slate-400">{nh.description}</p>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdaptiveModal>
  );
};


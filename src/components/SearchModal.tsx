import React, { useState } from 'react';
import { X, Search, MapPin, Calendar, Building2, Landmark, Flame, ArrowLeft } from 'lucide-react';
import { Place, EventItem, Neighborhood } from '../types';

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
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-12 sm:pt-16 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden z-10 border border-[#E0D8C8] animate-slideUp">
        {/* Search Bar Input */}
        <div className="p-3 sm:p-4 border-b border-[#E0D8C8] flex items-center gap-2">
          <Search className="w-5 h-5 text-[#0E7C86] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی نام مسجد، حسینیه، محله، سخنران، مداح یا شوادون..."
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-[#1F2430] placeholder-[#8C8474]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#8C8474] hover:text-[#1F2430]">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-bold text-[#71717A] hover:bg-[#F7F3EC] rounded-lg"
          >
            بستن
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Quick Suggestions if empty */}
          {!query.trim() && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[11px] text-[#71717A]">پیشنهادهای پرطرفدار:</span>
              {['مسجد جامع دزفول', 'سبزقبا', 'دعای کمیل', 'شوادون', 'سیاهپوشان', 'حسینیه اعظم'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="bg-[#F7F3EC] hover:bg-[#E4DCB] text-[#1F2430] text-[11px] px-2.5 py-1 rounded-lg border border-[#DDD5C5]"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Places Results */}
          <div>
            <h4 className="text-xs font-bold text-[#0E7C86] mb-2 flex items-center gap-1">
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
                  className="p-2.5 rounded-2xl bg-[#F7F3EC] hover:bg-[#E4DCB] transition-colors cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs ${
                      place.type === 'hussainiya' ? 'bg-[#B4552D]' : 'bg-[#0E7C86]'
                    }`}>
                      {place.name.slice(0, 1)}
                    </div>
                    <div>
                      <h5 className="font-bold text-[#1F2430]">{place.name}</h5>
                      <p className="text-[11px] text-[#71717A] truncate">{place.neighborhood}</p>
                    </div>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-[#71717A]" />
                </div>
              ))}
            </div>
          </div>

          {/* Events Results */}
          {filteredEvents.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#B4552D] mb-2 flex items-center gap-1">
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
                    className="p-2.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/50 transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1 text-[10px] text-[#B4552D] font-bold">
                        <span>{ev.placeName}</span>
                        <span>•</span>
                        <span>{ev.timeBadge}</span>
                      </div>
                      <h5 className="font-bold text-[#1F2430] mt-0.5">{ev.title}</h5>
                      {ev.speaker && <p className="text-[10px] text-[#71717A]">سخنران: {ev.speaker}</p>}
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-[#71717A]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Neighborhoods Results */}
          {filteredNeighborhoods.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#52525B] mb-2 flex items-center gap-1">
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
                    className="p-2.5 rounded-2xl bg-white border border-[#DDD5C5] hover:border-[#0E7C86] transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-[#1F2430]">{nh.name}</h5>
                      <p className="text-[11px] text-[#71717A]">{nh.description}</p>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-[#71717A]" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

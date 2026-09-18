import React, { useRef } from 'react';
import {
  Flame,
  Waves,
  Sparkles,
  TreePine,
  Building2,
  Palmtree,
  Wheat,
  Landmark,
  Snowflake,
  Sun,
  Tent,
  Castle,
  Trees,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'Trending', label: 'Trending', icon: Flame },
  { id: 'Beachfront', label: 'Beachfront', icon: Waves },
  { id: 'Amazing Pools', label: 'Amazing Pools', icon: Sparkles },
  { id: 'Luxury', label: 'Luxe Stays', icon: Building2 },
  { id: 'Cabins', label: 'Cabins', icon: TreePine },
  { id: 'Mansions', label: 'Mansions', icon: Castle },
  { id: 'Islands', label: 'Islands', icon: Palmtree },
  { id: 'Iconic Cities', label: 'Iconic Cities', icon: Landmark },
  { id: 'Countryside', label: 'Countryside', icon: Wheat },
  { id: 'Desert', label: 'Desert', icon: Sun },
  { id: 'Ski-in/out', label: 'Ski-in/out', icon: Snowflake },
  { id: 'Arctic', label: 'Arctic', icon: Snowflake },
  { id: 'Treehouses', label: 'Treehouses', icon: Trees },
  { id: 'Camping', label: 'Camping', icon: Tent },
];

export default function CategoryBar({
  selectedCategory,
  onSelectCategory,
  onOpenFilter,
  showTotalWithTaxes,
  setShowTotalWithTaxes,
  activeFilterCount = 0,
}) {
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-20 z-30 bg-slate-50/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left / Right Scroll Controls */}
        <div className="relative flex-1 flex items-center min-w-0">
          <button
            onClick={() => handleScroll('left')}
            className="hidden md:flex absolute left-0 z-10 p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:scale-105 transition-all -ml-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Categories Carousel */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-7 overflow-x-auto no-scrollbar scroll-smooth px-2 py-1"
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex flex-col items-center gap-1.5 pb-2 border-b-2 whitespace-nowrap transition-all duration-200 group shrink-0 ${
                    isSelected
                      ? 'border-brand text-brand dark:text-brand font-semibold'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 transition-transform duration-200 group-hover:scale-110 ${
                      isSelected ? 'text-brand' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-medium tracking-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleScroll('right')}
            className="hidden md:flex absolute right-0 z-10 p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:scale-105 transition-all -mr-2"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter and Tax Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Filters Button */}
          <button
            onClick={onOpenFilter}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl border text-xs font-semibold shadow-sm transition-all duration-200 ${
              activeFilterCount > 0
                ? 'bg-brand/10 border-brand text-brand dark:bg-brand/20 dark:border-brand'
                : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Total Before Taxes Switch (Airbnb signature feature) */}
          <div className="hidden xl:flex items-center gap-2.5 py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm">
            <span>Display total before taxes</span>
            <button
              onClick={() => setShowTotalWithTaxes(!showTotalWithTaxes)}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                showTotalWithTaxes ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  showTotalWithTaxes ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

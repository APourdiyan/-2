import React from 'react';
import { LucideIcon, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onReset?: () => void;
  resetButtonText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  onReset,
  resetButtonText = 'پاک‌کردن فیلترها و جستجو'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-slate-800/80 rounded-3xl border border-[#E0D8C8] dark:border-slate-700 shadow-xs transition-colors my-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0E7C86]/10 dark:bg-teal-500/10 text-[#0E7C86] dark:text-teal-400 flex items-center justify-center mb-4 transition-transform hover:scale-105">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.75]" />
      </div>
      
      <h3 className="text-base sm:text-lg font-bold text-[#1F2430] dark:text-slate-100 mb-1.5">
        {title}
      </h3>
      
      {description && (
        <p className="text-xs sm:text-sm text-[#71717A] dark:text-slate-400 max-w-md mb-5 leading-relaxed">
          {description}
        </p>
      )}

      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#09575e] dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{resetButtonText}</span>
        </button>
      )}
    </div>
  );
};

import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text = 'در حال بارگذاری...',
  className = ''
}) => {
  const dotSizes = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm font-medium',
    large: 'text-base font-bold'
  };

  return (
    <div
      id="loading-spinner-container"
      className={`flex flex-col items-center justify-center gap-3 p-6 ${className}`}
    >
      <div className="flex items-center gap-2" role="status" aria-label="بارگذاری">
        <span
          className={`${dotSizes[size]} rounded-full bg-[#0E7C86] animate-bounce`}
          style={{ animationDelay: '0ms', animationDuration: '750ms' }}
        />
        <span
          className={`${dotSizes[size]} rounded-full bg-[#C26D47] animate-bounce`}
          style={{ animationDelay: '150ms', animationDuration: '750ms' }}
        />
        <span
          className={`${dotSizes[size]} rounded-full bg-[#0E7C86] animate-bounce`}
          style={{ animationDelay: '300ms', animationDuration: '750ms' }}
        />
      </div>
      {text && (
        <span className={`text-stone-600 dark:text-stone-300 select-none ${textSizes[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

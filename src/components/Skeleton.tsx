import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'circle' | 'card' | 'image';
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  className = '',
  width,
  height
}) => {
  const baseClasses =
    'relative overflow-hidden bg-stone-200/80 dark:bg-slate-800/80 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 dark:before:via-white/10 before:to-transparent';

  let variantClasses = '';
  switch (variant) {
    case 'circle':
      variantClasses = 'rounded-full';
      break;
    case 'card':
      variantClasses = 'rounded-2xl h-48 w-full';
      break;
    case 'image':
      variantClasses = 'rounded-xl h-40 w-full';
      break;
    case 'text':
    default:
      variantClasses = 'h-4 w-full rounded-md';
      break;
  }

  const customStyle: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined
  };

  return (
    <div
      aria-hidden="true"
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={customStyle}
    />
  );
};

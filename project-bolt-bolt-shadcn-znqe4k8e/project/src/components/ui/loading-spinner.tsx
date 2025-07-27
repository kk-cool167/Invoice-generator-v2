import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

/**
 * Eine wiederverwendbare Ladeanimations-Komponente mit verschiedenen Größen und Farben.
 * Kann als Inline-Element oder im Vollbildmodus angezeigt werden.
 */
export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  // Größen für den Spinner
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Farben für den Spinner
  const colorClasses = {
    primary: 'text-purple-600',
    secondary: 'text-blue-600',
    neutral: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  };

  const spinnerElement = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-t-transparent border-current',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {text && (
        <p className={cn(
          'text-sm font-medium text-center',
          colorClasses[color]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center z-50">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
}

/**
 * Ein Überlagernder Lader, der über eine komplette Komponente gelegt werden kann
 */
export function LoadingOverlay({
  show,
  text,
  children,
}: {
  show: boolean;
  text?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {show && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-md">
          <LoadingSpinner text={text} size="md" />
        </div>
      )}
    </div>
  );
}

export default LoadingSpinner; 
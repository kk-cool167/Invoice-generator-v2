import React from 'react';
import { cn } from '@/lib/utils';

import { StepDefinition } from '../steps/stepDefinitions';

interface StepIndicatorProps {
  stepNumber: number;
  isCompleted?: boolean;
  isActive?: boolean;
  isOptional?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'guide' | 'form';
  showIcon?: boolean;
  icon?: React.ReactNode;
}

export function StepIndicator({
  stepNumber,
  isCompleted = false,
  isActive = false,
  isOptional = false,
  className,
  size = 'sm',
  variant = 'form',
  showIcon = false,
  icon
}: StepIndicatorProps) {
  // Size classes for the step circle
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  // State-based styling
  const getStateClasses = () => {
    if (isCompleted) {
      return 'bg-green-500 text-white border-green-500';
    }
    
    if (isActive) {
      return variant === 'guide' 
        ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-300 ring-offset-2'
        : 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-300 ring-offset-2';
    }
    
    if (isOptional) {
      return 'bg-gray-400 text-white border-gray-400';
    }
    
    return 'bg-purple-600 text-white border-purple-600';
  };

  // Variant-specific adjustments
  const variantClasses = variant === 'guide' 
    ? 'shadow-sm hover:shadow-md transition-shadow duration-200'
    : '';

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Step Circle */}
      <div className={cn(
        "flex-shrink-0 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2",
        sizeClasses[size],
        getStateClasses(),
        variantClasses
      )}>
        {isCompleted ? '✓' : stepNumber}
      </div>

      {/* Optional Icon for guide variant */}
      {showIcon && icon && variant === 'guide' && (
        <div className={cn(
          "flex-shrink-0 rounded-lg flex items-center justify-center transition-all duration-300",
          size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10',
          isCompleted 
            ? 'bg-green-100 text-green-600' 
            : isActive
              ? 'bg-purple-100 text-purple-600'
              : 'bg-purple-50 text-purple-500'
        )}>
          {icon}
        </div>
      )}
    </div>
  );
}

// Convenience component for form steps (maintains backward compatibility)
export function FormStepIndicator(props: Omit<StepIndicatorProps, 'variant'>) {
  return <StepIndicator {...props} variant="form" />;
}

// Convenience component for guide steps  
export function GuideStepIndicator(props: Omit<StepIndicatorProps, 'variant'>) {
  return <StepIndicator {...props} variant="guide" showIcon={true} />;
}
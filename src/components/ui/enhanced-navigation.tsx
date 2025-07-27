import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isActive: boolean;
  isOptional?: boolean;
}

interface EnhancedNavigationProps {
  steps: NavigationStep[];
  onStepClick?: (stepId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function EnhancedNavigation({
  steps,
  onStepClick,
  orientation = 'horizontal',
  className = ""
}: EnhancedNavigationProps) {
  const completedCount = steps.filter(step => step.isCompleted).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  if (orientation === 'vertical') {
    return (
      <div className={cn("bg-white rounded-2xl border-2 border-purple-300/60 shadow-xl p-6", className)}>
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Invoice Creation</h3>
          <div className="text-sm text-gray-500 mb-4">
            {completedCount} of {steps.length} completed
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Vertical Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          <motion.div
            className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-purple-500 to-purple-600"
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(0, ((completedCount - 1) / (steps.length - 1)) * 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className={cn(
                  "flex items-center cursor-pointer group",
                  onStepClick && (step.isCompleted || step.isActive) && "hover:scale-105"
                )}
                onClick={() => onStepClick && (step.isCompleted || step.isActive) && onStepClick(step.id)}
                whileHover={onStepClick && (step.isCompleted || step.isActive) ? { x: 4 } : {}}
                transition={{ duration: 0.2 }}
              >
                {/* Step Circle */}
                <div className={cn(
                  "relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                  step.isCompleted 
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                    : step.isActive
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 ring-4 ring-purple-300 ring-offset-2"
                      : "bg-gray-300 text-gray-600"
                )}>
                  {step.isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Content */}
                <div className="ml-4 flex-1">
                  <div className={cn(
                    "font-semibold transition-colors duration-300",
                    step.isCompleted 
                      ? "text-green-700"
                      : step.isActive
                        ? "text-purple-700"
                        : "text-gray-600"
                  )}>
                    {step.title}
                  </div>
                  
                  {step.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {step.description}
                    </div>
                  )}
                  
                  {step.isOptional && (
                    <div className="text-xs text-gray-400 mt-1">Optional</div>
                  )}
                </div>

                {/* Arrow for clickable steps */}
                {onStepClick && (step.isCompleted || step.isActive) && (
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={cn("bg-white rounded-2xl border-2 border-purple-300/60 shadow-xl p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Invoice Creation</h3>
        <div className="text-sm text-gray-500">
          {completedCount} of {steps.length} completed
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Horizontal Steps */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200" />
        <motion.div
          className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, ((completedCount - 1) / (steps.length - 1)) * 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={cn(
                "flex flex-col items-center cursor-pointer group",
                onStepClick && (step.isCompleted || step.isActive) && "hover:scale-105"
              )}
              onClick={() => onStepClick && (step.isCompleted || step.isActive) && onStepClick(step.id)}
              whileHover={onStepClick && (step.isCompleted || step.isActive) ? { y: -2 } : {}}
              transition={{ duration: 0.2 }}
            >
              {/* Step Circle */}
              <div className={cn(
                "relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                step.isCompleted 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                  : step.isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 ring-4 ring-purple-300 ring-offset-2"
                    : "bg-gray-300 text-gray-600"
              )}>
                {step.isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center">
                <div className={cn(
                  "font-semibold text-sm transition-colors duration-300",
                  step.isCompleted 
                    ? "text-green-700"
                    : step.isActive
                      ? "text-purple-700"
                      : "text-gray-600"
                )}>
                  {step.title}
                </div>
                
                {step.isOptional && (
                  <div className="text-xs text-gray-400 mt-1">Optional</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
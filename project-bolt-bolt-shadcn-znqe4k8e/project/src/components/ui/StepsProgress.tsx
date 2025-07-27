import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { StepIndicator } from './StepIndicator';
import { WORKFLOW_STEPS } from '../steps/stepDefinitions';

interface StepsProgressProps {
  completedSteps: string[];
  currentStep?: string;
  className?: string;
}

export function StepsProgress({ 
  completedSteps = [], 
  currentStep,
  className = '' 
}: StepsProgressProps) {
  const { t } = useLanguage();

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl border border-purple-200 p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2">
        {WORKFLOW_STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center min-w-0 flex-1">
              <StepIndicator 
                stepNumber={index + 1}
                isCompleted={completedSteps.includes(step.id)}
                isActive={currentStep === step.id}
                isOptional={!step.required}
                size="sm"
                variant="form"
              />
              <div className="text-xs text-center mt-1 px-1">
                <div className={`font-medium truncate ${
                  completedSteps.includes(step.id) 
                    ? 'text-green-600' 
                    : currentStep === step.id 
                      ? 'text-purple-600' 
                      : 'text-gray-500'
                }`}>
                  {t(step.key)}
                </div>
                {!step.required && (
                  <div className="text-gray-400 text-xs">Optional</div>
                )}
              </div>
            </div>
            
            {/* Connection line between steps */}
            {index < WORKFLOW_STEPS.length - 1 && (
              <div className="flex-shrink-0 w-8 h-px bg-gray-300 mx-1 mt-[-10px]"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { StepIndicator } from './StepIndicator';
import { WORKFLOW_STEPS } from '../steps/stepDefinitions';

interface EnhancedStepsProgressProps {
  completedSteps: string[];
  currentStep?: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function EnhancedStepsProgress({ 
  completedSteps = [], 
  currentStep,
  onStepClick,
  className = '',
  orientation = 'horizontal'
}: EnhancedStepsProgressProps) {
  const { t } = useLanguage();

  // Shortened labels for better UX
  const shortLabels = {
    chooseMode: 'Modus',
    logoUpload: 'Logo',
    vendorData: 'Daten',
    enterItems: 'Artikel',
    preview: 'Vorschau'
  };

  if (orientation === 'vertical') {
    return (
      <div className={`bg-white rounded-2xl border-2 border-purple-300/60 shadow-xl shadow-purple-500/20 p-6 ${className}`}>
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Rechnung erstellen</h3>
          <div className="text-sm text-gray-500">
            {completedSteps.length} von {WORKFLOW_STEPS.length} abgeschlossen
          </div>
        </div>

        {/* Vertical Step Navigation */}
        <div className="relative">
          {/* Background Progress Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>
          <div 
            className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-purple-500 to-purple-600 z-0 transition-all duration-500"
            style={{ 
              height: `${Math.max(0, ((completedSteps.length - 1) / (WORKFLOW_STEPS.length - 1)) * 100)}%` 
            }}
          ></div>

          {/* Steps */}
          <div className="relative z-10 space-y-6">
            {WORKFLOW_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStep === step.id;
              const isClickable = onStepClick && (isCompleted || isActive);

              return (
                <div 
                  key={step.id} 
                  className={`flex items-center cursor-pointer transition-all duration-300 group ${
                    isClickable ? 'hover:scale-105' : ''
                  }`}
                  onClick={() => isClickable && onStepClick(step.id)}
                >
                  {/* Step Circle */}
                  <div className={`relative ${isActive ? 'transform scale-110' : ''} transition-transform duration-300`}>
                    <StepIndicator 
                      stepNumber={index + 1}
                      isCompleted={isCompleted}
                      isActive={isActive}
                      isOptional={!step.required}
                      size="md"
                      variant="form"
                      className={`shadow-lg ${
                        isActive 
                          ? 'ring-4 ring-purple-300 ring-offset-2 shadow-purple-500/30' 
                          : isCompleted
                            ? 'shadow-green-500/20'
                            : 'shadow-purple-500/20'
                      }`}
                    />
                    
                    {/* Active Step Pulse Effect */}
                    {isActive && (
                      <div className="absolute -inset-2 rounded-full bg-purple-500/20 animate-pulse"></div>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="ml-4 flex-1">
                    <div className={`font-semibold text-sm transition-colors duration-300 ${
                      isCompleted 
                        ? 'text-green-700' 
                        : isActive 
                          ? 'text-purple-700 font-bold' 
                          : 'text-gray-600'
                    }`}>
                      {shortLabels[step.key as keyof typeof shortLabels] || t(step.key)}
                    </div>
                    
                    {!step.required && (
                      <div className="text-xs text-gray-400 mt-1">Optional</div>
                    )}

                    {/* Progress indicator for active step */}
                    {isActive && (
                      <div className="mt-2 w-16 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Description */}
        {currentStep && (
          <div className="mt-6 p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg border border-purple-200">
            <div className="text-xs text-purple-800 font-medium">
              Aktuell: {shortLabels[WORKFLOW_STEPS.find(s => s.id === currentStep)?.key as keyof typeof shortLabels] || ''}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border-2 border-purple-300/60 shadow-xl shadow-purple-500/20 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Rechnung erstellen</h3>
        <div className="text-sm text-gray-500">
          {completedSteps.length} von {WORKFLOW_STEPS.length} abgeschlossen
        </div>
      </div>

      {/* Enhanced Step Navigation */}
      <div className="relative">
        {/* Background Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 z-0"></div>
        <div 
          className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 z-0 transition-all duration-500"
          style={{ 
            width: `${Math.max(0, ((completedSteps.length - 1) / (WORKFLOW_STEPS.length - 1)) * 100)}%` 
          }}
        ></div>

        {/* Steps */}
        <div className="relative z-10 flex items-center justify-between">
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = currentStep === step.id;
            const isClickable = onStepClick && (isCompleted || isActive);

            return (
              <div 
                key={step.id} 
                className={`flex flex-col items-center cursor-pointer transition-all duration-300 group ${
                  isClickable ? 'hover:scale-105' : ''
                }`}
                onClick={() => isClickable && onStepClick(step.id)}
              >
                {/* Enhanced Step Circle */}
                <div className={`relative ${isActive ? 'transform scale-110' : ''} transition-transform duration-300`}>
                  <StepIndicator 
                    stepNumber={index + 1}
                    isCompleted={isCompleted}
                    isActive={isActive}
                    isOptional={!step.required}
                    size="lg"
                    variant="form"
                    className={`shadow-lg ${
                      isActive 
                        ? 'ring-4 ring-purple-300 ring-offset-2 shadow-purple-500/30' 
                        : isCompleted
                          ? 'shadow-green-500/20'
                          : 'shadow-purple-500/20'
                    }`}
                  />
                  
                  {/* Active Step Pulse Effect */}
                  {isActive && (
                    <div className="absolute -inset-2 rounded-full bg-purple-500/20 animate-pulse"></div>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center min-w-0">
                  <div className={`font-semibold text-sm transition-colors duration-300 ${
                    isCompleted 
                      ? 'text-green-700' 
                      : isActive 
                        ? 'text-purple-700 font-bold' 
                        : 'text-gray-600'
                  }`}>
                    {shortLabels[step.key as keyof typeof shortLabels] || t(step.key)}
                  </div>
                  
                  {!step.required && (
                    <div className="text-xs text-gray-400 mt-1">Optional</div>
                  )}

                  {/* Progress indicator for active step */}
                  {isActive && (
                    <div className="mt-2 w-12 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto"></div>
                  )}
                </div>

                {/* Tooltip on Hover */}
                {isClickable && (
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                    {t(step.key)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Description */}
      {currentStep && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-800 font-medium">
            Aktueller Schritt: {t(WORKFLOW_STEPS.find(s => s.id === currentStep)?.key || '')}
          </div>
        </div>
      )}
    </div>
  );
}
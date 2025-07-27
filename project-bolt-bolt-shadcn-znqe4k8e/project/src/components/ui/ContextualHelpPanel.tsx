import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { StepIndicator } from './StepIndicator';
import { ChevronRight, Info, CheckCircle } from 'lucide-react';

interface HelpStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isOptional?: boolean;
}

interface ContextualHelpPanelProps {
  currentStep: string;
  completedSteps: string[];
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ContextualHelpPanel({
  currentStep,
  completedSteps,
  className = '',
  isCollapsed = false,
  onToggleCollapse
}: ContextualHelpPanelProps) {
  const { t } = useLanguage();

  // Contextual help content for each main step
  const stepHelpContent = {
    mode: {
      title: t('chooseMode'),
      description: t('chooseModeDesc'),
      tips: [
        'MM für Materialwirtschaft mit Bestellungen',
        'FI für einfache Rechnungsstellung',
        'Template bestimmt das Design'
      ]
    },
    logo: {
      title: t('logoUpload'),
      description: t('logoUploadDesc'),
      tips: [
        'PNG oder JPG Format empfohlen',
        'Optimale Größe: 200x60 Pixel',
        'Position und Größe anpassbar'
      ]
    },
    data: {
      title: t('vendorData'),
      description: t('vendorDataDesc'),
      tips: [
        'Lieferant und Empfänger auswählen',
        'Rechnungsnummer eindeutig vergeben',
        'Datum für Bestellung und Lieferung'
      ]
    },
    items: {
      title: t('enterItems'),
      description: t('enterItemsDesc'),
      tips: [
        'Materialien aus der Datenbank wählen',
        'Mengen und Preise prüfen',
        'Synchronisation zwischen Dokumenten möglich'
      ]
    },
    preview: {
      title: t('preview'),
      description: t('previewDesc'),
      tips: [
        'PDF-Vorschau vor Finalisierung',
        'XML-Export für Buchhaltung',
        'Dokumente in Datenbank speichern'
      ]
    }
  };

  const currentStepContent = stepHelpContent[currentStep as keyof typeof stepHelpContent];
  
  // Map step to number for proper display
  const stepNumbers = {
    'mode': 1,
    'logo': 2, 
    'data': 3,
    'items': 4,
    'preview': 5
  };
  
  const currentStepNumber = stepNumbers[currentStep as keyof typeof stepNumbers] || 1;

  if (isCollapsed) {
    return (
      <div className={`bg-white/90 backdrop-blur-sm rounded-xl border border-purple-200 p-3 shadow-sm ${className}`}>
        <button 
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center xl:justify-between text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden xl:inline">Hilfe</span>
          </span>
          <ChevronRight className="h-4 w-4 hidden xl:block" />
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl border border-purple-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-2 rounded-xl">
              <Info className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Schritt-Hilfe</h3>
          </div>
          <button 
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="h-4 w-4 transform rotate-180" />
          </button>
        </div>
      </div>

      {/* Current Step Content */}
      <div className="p-4">
        {currentStepContent ? (
          <>
            <div className="flex items-start gap-3 mb-4">
              <StepIndicator 
                stepNumber={currentStepNumber}
                isCompleted={completedSteps.includes(currentStep)}
                isActive={true}
                size="md"
                variant="guide"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">
                    {currentStepContent.title}
                  </h4>
                  {completedSteps.includes(currentStep) && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {currentStepContent.description}
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Tipps
              </h5>
              <ul className="space-y-2">
                {currentStepContent.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <Info className="h-8 w-8 text-purple-500" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Schritt {currentStepNumber}</h4>
            <p className="text-sm text-gray-600">
              Hilfe für diesen Schritt wird geladen...
            </p>
          </div>
        )}
      </div>

      {/* Progress Summary */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-b-xl border-t border-purple-100">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-purple-800">
            Fortschritt
          </span>
          <span className="text-purple-600 font-semibold">
            {completedSteps.length} / 5 Schritte
          </span>
        </div>
        <div className="mt-2 w-full h-2 bg-purple-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.length / 5) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
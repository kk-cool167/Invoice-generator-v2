import React, { useState } from 'react';
import { Button } from './ui/button';
import { Wand2, Brain, Zap, Settings } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from './ui/use-toast';
import { 
  generateAIEnhancedVendorData, 
  generateAIEnhancedRecipientData, 
  generateAIEnhancedMaterialData,
  initializeAIModels 
} from '@/lib/aiDataGenerator';
import { 
  generateUniqueVendorData, 
  generateUniqueRecipientData, 
  generateUniqueMaterialData 
} from '@/lib/demoDataGenerator';
import type { Vendor, Recipient, Material } from '@/lib/types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface AIEnhancedDemoFillerProps {
  type: 'vendor' | 'recipient' | 'material';
  existingData?: Vendor[] | Recipient[] | Material[];
  companyCode?: string;
  onFillData: (data: any) => void;
  className?: string;
}

type GenerationMode = 'ai' | 'standard' | 'smart';

export function AIEnhancedDemoFiller({
  type,
  existingData = [],
  companyCode = '1000',
  onFillData,
  className = ''
}: AIEnhancedDemoFillerProps) {
  const { currentLanguage } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('smart');
  const [aiModelsReady, setAiModelsReady] = useState(false);

  // Initialize AI models on first use
  const initializeAI = async () => {
    if (!aiModelsReady) {
      toast({
        title: currentLanguage === 'de' ? '🤖 KI-Modelle laden...' : '🤖 Loading AI models...',
        description: currentLanguage === 'de' 
          ? 'Erstmaliges Laden kann einen Moment dauern'
          : 'First-time loading may take a moment',
      });

      try {
        await initializeAIModels();
        setAiModelsReady(true);
        toast({
          title: currentLanguage === 'de' ? '✅ KI bereit' : '✅ AI Ready',
          description: currentLanguage === 'de' 
            ? 'Intelligente Datengenerierung aktiviert'
            : 'Smart data generation activated',
          });
      } catch (error) {
        console.warn('AI initialization failed:', error);
        toast({
          title: currentLanguage === 'de' ? '⚠️ KI nicht verfügbar' : '⚠️ AI Unavailable',
          description: currentLanguage === 'de' 
            ? 'Verwende Standard-Datengenerierung'
            : 'Using standard data generation',
          variant: 'destructive'
        });
      }
    }
  };

  const generateData = async (mode: GenerationMode) => {
    setIsGenerating(true);
    
    try {
      let data;
      const lang = currentLanguage as 'de' | 'en';

      if (mode === 'ai' || (mode === 'smart' && aiModelsReady)) {
        // Use AI-enhanced generation
        if (!aiModelsReady) await initializeAI();
        
        switch (type) {
          case 'vendor':
            data = await generateAIEnhancedVendorData(existingData as Vendor[], lang, companyCode);
            break;
          case 'recipient':
            data = await generateAIEnhancedRecipientData(existingData as Recipient[], lang, companyCode);
            break;
          case 'material':
            data = await generateAIEnhancedMaterialData(existingData as Material[], lang, companyCode);
            break;
        }

        toast({
          title: currentLanguage === 'de' ? '🧠 KI-Daten generiert' : '🧠 AI Data Generated',
          description: currentLanguage === 'de' 
            ? 'Intelligente, kontextbewusste Daten erstellt'
            : 'Intelligent, context-aware data created',
          });
      } else {
        // Use standard generation
        switch (type) {
          case 'vendor':
            data = generateUniqueVendorData(existingData as Vendor[], lang, companyCode);
            break;
          case 'recipient':
            data = generateUniqueRecipientData(existingData as Recipient[], lang, companyCode);
            break;
          case 'material':
            data = generateUniqueMaterialData(existingData as Material[], lang, companyCode);
            break;
        }

        toast({
          title: currentLanguage === 'de' ? '⚡ Standard-Daten generiert' : '⚡ Standard Data Generated',
          description: currentLanguage === 'de' 
            ? 'Zufällige Beispieldaten erstellt'
            : 'Random sample data created',
          });
      }

      onFillData(data);
    } catch (error) {
      console.error('Data generation failed:', error);
      toast({
        title: currentLanguage === 'de' ? '❌ Fehler' : '❌ Error',
        description: currentLanguage === 'de' 
          ? 'Datengenerierung fehlgeschlagen'
          : 'Data generation failed',
        type: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getModeIcon = (mode: GenerationMode) => {
    switch (mode) {
      case 'ai': return <Brain className="h-4 w-4" />;
      case 'smart': return <Wand2 className="h-4 w-4" />;
      case 'standard': return <Zap className="h-4 w-4" />;
    }
  };

  const getModeLabel = (mode: GenerationMode) => {
    const labels = {
      de: {
        ai: 'KI-Modus',
        smart: 'Smart-Modus',
        standard: 'Standard-Modus'
      },
      en: {
        ai: 'AI Mode',
        smart: 'Smart Mode', 
        standard: 'Standard Mode'
      }
    };
    return labels[currentLanguage as keyof typeof labels][mode];
  };

  const getModeDescription = (mode: GenerationMode) => {
    const descriptions = {
      de: {
        ai: 'Lokale KI-Modelle für intelligente Daten',
        smart: 'Automatisch beste verfügbare Methode',
        standard: 'Schnelle regelbasierte Generierung'
      },
      en: {
        ai: 'Local AI models for intelligent data',
        smart: 'Automatically best available method',
        standard: 'Fast rule-based generation'
      }
    };
    return descriptions[currentLanguage as keyof typeof descriptions][mode];
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        type="button"
        onClick={() => generateData(generationMode)}
        disabled={isGenerating}
        className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transform transition-all duration-300 hover:scale-105"
      >
        {isGenerating ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          getModeIcon(generationMode)
        )}
        <span>
          {isGenerating 
            ? (currentLanguage === 'de' ? 'Generiere...' : 'Generating...')
            : (currentLanguage === 'de' ? 'Demo' : 'Demo')
          }
        </span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 border-purple-200 hover:border-purple-300"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            {currentLanguage === 'de' ? 'Generierungsmodus' : 'Generation Mode'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setGenerationMode('smart')}
            className={generationMode === 'smart' ? 'bg-purple-50' : ''}
          >
            <div className="flex items-start gap-3">
              <Wand2 className="h-4 w-4 mt-0.5 text-purple-600" />
              <div className="flex-1">
                <div className="font-medium">{getModeLabel('smart')}</div>
                <div className="text-sm text-muted-foreground">
                  {getModeDescription('smart')}
                </div>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => setGenerationMode('ai')}
            className={generationMode === 'ai' ? 'bg-purple-50' : ''}
          >
            <div className="flex items-start gap-3">
              <Brain className="h-4 w-4 mt-0.5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium">{getModeLabel('ai')}</div>
                <div className="text-sm text-muted-foreground">
                  {getModeDescription('ai')}
                </div>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => setGenerationMode('standard')}
            className={generationMode === 'standard' ? 'bg-purple-50' : ''}
          >
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 mt-0.5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium">{getModeLabel('standard')}</div>
                <div className="text-sm text-muted-foreground">
                  {getModeDescription('standard')}
                </div>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <div className="px-2 py-1 text-xs text-muted-foreground">
            {currentLanguage === 'de' 
              ? 'KI-Modelle laufen lokal - keine API-Kosten' 
              : 'AI models run locally - no API costs'
            }
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Simplified component for inline use
export function QuickAIDemoButton({ 
  onClick, 
  className = '' 
}: { 
  onClick: () => void;
  className?: string;
}) {
  const { currentLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      ) : (
        <Brain className="h-4 w-4" />
      )}
      {isLoading 
        ? (currentLanguage === 'de' ? 'KI arbeitet...' : 'AI working...')
        : (currentLanguage === 'de' ? 'KI Demo' : 'AI Demo')
      }
    </Button>
  );
}
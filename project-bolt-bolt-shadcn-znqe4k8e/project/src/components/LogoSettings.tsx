import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { 
  RotateCcw, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Maximize,
  Minimize,
  Zap
} from 'lucide-react';

interface LogoConfig {
  maxWidth: number;
  maxHeight: number;
  containerWidth: number;
  containerHeight: number;
  alignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'middle' | 'bottom';
}

interface LogoSettingsProps {
  logoConfig: LogoConfig;
  onLogoConfigChange: (config: LogoConfig) => void;
  templateName: string;
  className?: string;
  showTitle?: boolean;
  showPreview?: boolean;
}

// Standard-Konfigurationen für verschiedene Templates
const getDefaultConfig = (templateName: string): LogoConfig => {
  const configs: Record<string, LogoConfig> = {
    'businessstandard': {
      maxWidth: 240,
      maxHeight: 50,
      containerWidth: 260,
      containerHeight: 60,
      alignment: 'right',
      verticalAlignment: 'middle'
    },
    'classic': {
      maxWidth: 300,
      maxHeight: 60,
      containerWidth: 320,
      containerHeight: 70,
      alignment: 'right',
      verticalAlignment: 'middle'
    },
    'professional': {
      maxWidth: 300,
      maxHeight: 60,
      containerWidth: 320,
      containerHeight: 70,
      alignment: 'right',
      verticalAlignment: 'middle'
    },
    'businessgreen': {
      maxWidth: 300,
      maxHeight: 60,
      containerWidth: 320,
      containerHeight: 70,
      alignment: 'right',
      verticalAlignment: 'middle'
    },
    'allrauer2': {
      maxWidth: 300,
      maxHeight: 60,
      containerWidth: 320,
      containerHeight: 70,
      alignment: 'center',
      verticalAlignment: 'middle'
    }
  };
  
  return configs[templateName] || configs['businessstandard'];
};

// Quick-Presets für verschiedene Logo-Typen
const logoPresets = [
  {
    name: 'Business Standard',
    icon: Minimize,
    config: { maxWidth: 240, maxHeight: 50 },
    description: 'Optimal für Business Standard Template'
  },
  {
    name: 'Rechteckig (Banner)',
    icon: Maximize,
    config: { maxWidth: 300, maxHeight: 60 },
    description: 'Optimal für Banner-Logos'
  },
  {
    name: 'Quadratisch',
    icon: Minimize,
    config: { maxWidth: 120, maxHeight: 120 },
    description: 'Optimal für quadratische Logos'
  },
  {
    name: 'Kompakt',
    icon: Zap,
    config: { maxWidth: 180, maxHeight: 45 },
    description: 'Kleiner und kompakt'
  }
];

export function LogoSettings({ 
  logoConfig, 
  onLogoConfigChange, 
  templateName, 
  className,
  showTitle = true,
  showPreview = false
}: LogoSettingsProps) {
  const { t } = useLanguage();
  const [lastTemplateName, setLastTemplateName] = useState<string>(templateName);
  const [isUpdating, setIsUpdating] = useState(false);

  // Ensure logoConfig is never undefined
  const safeLogoConfig = logoConfig || getDefaultConfig(templateName);

  // Nur bei Template-Wechsel die Defaults laden
  useEffect(() => {
    if (templateName !== lastTemplateName) {
      const defaultConfig = getDefaultConfig(templateName);
      onLogoConfigChange(defaultConfig);
      setLastTemplateName(templateName);
    }
  }, [templateName, lastTemplateName, onLogoConfigChange]);

  const handleConfigChange = (updates: Partial<LogoConfig>) => {
    if (isUpdating) return; // Prevent duplicate updates
    
    setIsUpdating(true);
    const newConfig = { ...safeLogoConfig, ...updates };
    onLogoConfigChange(newConfig);
    
    // Use setTimeout to reset flag, preventing rapid consecutive updates
    setTimeout(() => setIsUpdating(false), 100);
  };

  const resetToDefault = () => {
    const defaultConfig = getDefaultConfig(templateName);
    onLogoConfigChange(defaultConfig);
  };

  const applyPreset = (preset: typeof logoPresets[0]) => {
    handleConfigChange(preset.config);
  };

  return (
    <Card className={cn("w-full border-2 border-purple-300/60 shadow-lg shadow-purple-500/10", className)}>
      {showTitle && (
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-50/30 to-purple-100/20 border-b border-purple-200/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-800">
              {t('logo.settings') || 'Logo-Einstellungen'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="h-8 px-3 text-sm bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('buttons.reset') || 'Zurücksetzen'}
            </Button>
          </div>
        </CardHeader>
      )}
      {!showTitle && (
        <div className="p-3 pb-0">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="h-8 px-3 text-sm bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      )}

      <CardContent className="space-y-5">
        {/* Quick-Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">{t('logo.quickSettings')}</Label>
          <div className="grid grid-cols-1 gap-2">
            {logoPresets.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="justify-start h-10 p-3 text-left hover:bg-purple-50 hover:border-purple-200 transition-colors"
              >
                <div className="flex items-center gap-3 w-full">
                  <preset.icon className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{preset.name}</span>
                      <Badge variant="secondary" className="text-xs px-2 py-1 h-5 bg-purple-100 text-purple-700">
                        {preset.config.maxWidth}×{preset.config.maxHeight}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Größeneinstellungen - verbessert */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">{t('logo.adjustSize')}</Label>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-600">
                  {t('logo.width')}
                </Label>
                <Badge variant="outline" className="text-sm font-mono h-6 px-3 bg-blue-50 text-blue-700 border-blue-200">
                  {safeLogoConfig.maxWidth}px
                </Badge>
              </div>
              <Slider
                value={[safeLogoConfig.maxWidth]}
                onValueChange={([value]) => handleConfigChange({ maxWidth: value })}
                min={20}
                max={300}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-600">
                  {t('logo.height')}
                </Label>
                <Badge variant="outline" className="text-sm font-mono h-6 px-3 bg-green-50 text-green-700 border-green-200">
                  {safeLogoConfig.maxHeight}px
                </Badge>
              </div>
              <Slider
                value={[safeLogoConfig.maxHeight]}
                onValueChange={([value]) => handleConfigChange({ maxHeight: value })}
                min={20}
                max={300}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Ausrichtung - verbessert */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">{t('logo.position')}</Label>
          
          <div className="flex gap-2">
            {[
              { value: 'left', icon: AlignLeft, label: 'L' },
              { value: 'center', icon: AlignCenter, label: 'M' },
              { value: 'right', icon: AlignRight, label: 'R' }
            ].map(({ value, icon: Icon, label }) => (
              <Button
                key={value}
                variant={safeLogoConfig.alignment === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleConfigChange({ alignment: value as any })}
                className={cn(
                  "flex-1 h-10 flex items-center justify-center gap-2 transition-all duration-200",
                  safeLogoConfig.alignment === value 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' 
                    : 'hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700'
                )}
                title={value === 'left' ? t('logo.alignment.left') : value === 'right' ? t('logo.alignment.right') : t('logo.alignment.center')}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {value === 'left' ? t('logo.alignment.left') : value === 'right' ? t('logo.alignment.right') : t('logo.alignment.center')}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Aktuelle Konfiguration - verbessert */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
          <Label className="text-sm font-medium text-purple-700 mb-3 block">{t('logo.currentValues')}</Label>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('logo.size')}:</span>
              <span className="text-sm font-mono bg-white px-2 py-1 rounded border">{safeLogoConfig.maxWidth}×{safeLogoConfig.maxHeight}px</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('logo.position')}:</span>
              <span className="text-sm font-medium bg-white px-2 py-1 rounded border">
                {safeLogoConfig.alignment === 'left' ? t('logo.alignment.left') : safeLogoConfig.alignment === 'right' ? t('logo.alignment.right') : t('logo.alignment.center')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
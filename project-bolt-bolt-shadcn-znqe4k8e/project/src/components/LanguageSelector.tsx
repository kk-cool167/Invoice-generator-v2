import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center">
      <div className="text-sm text-gray-600 mr-2">
        <span>{t('language')}:</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-3 py-1.5 rounded-md bg-transparent hover:bg-purple-50"
          >
            <span className="text-sm font-medium text-purple-700 flex items-center">
              <Globe className="h-3.5 w-3.5 text-purple-600 mr-1.5" />
              {currentLanguage === 'en' ? 'English' : 'Deutsch'}
            </span>
            <span className="sr-only">{t('language')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border border-purple-200/60 shadow-md rounded-md p-1 min-w-[120px]">
          <DropdownMenuItem 
            onClick={() => setLanguage('en')}
            className={`rounded-sm transition-colors cursor-pointer mb-1 ${currentLanguage === 'en' ? 'bg-purple-100 text-purple-700' : 'hover:bg-purple-50'}`}
          >
            <Globe className="h-3.5 w-3.5 mr-2" />
            English
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setLanguage('de')}
            className={`rounded-sm transition-colors cursor-pointer ${currentLanguage === 'de' ? 'bg-purple-100 text-purple-700' : 'hover:bg-purple-50'}`}
          >
            <Globe className="h-3.5 w-3.5 mr-2" />
            Deutsch
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;
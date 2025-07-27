import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from './ui/button';
// Dialog components are now handled by parent component
import { ScrollArea } from './ui/scroll-area';
import { LoadingSpinner } from './ui/loading-spinner';
import { History, RefreshCw, FileClock, Trash, Edit, FileCheck, Check, X, FileBarChart, FileStack } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from './ui/input';
import { Version } from '@/hooks/useAutoSave';

// Anstatt ein eigenes Interface zu verwenden, importieren wir das Version-Interface
interface FormVersionsProps<T> {
  versions: Version<T>[];
  onLoadVersion: (timestamp: number) => void;
  onClearAll: () => void;
  onDeleteVersion?: (timestamp: number) => void;
  onRenameVersion?: (timestamp: number, newName: string) => void;
  onSaveNamed?: (name: string) => void;
  onClose: () => void;
}

/**
 * Komponente zur Anzeige und Verwaltung gespeicherter Formular-Versionen
 */
export function FormVersions<T>({
  versions,
  onLoadVersion,
  onClearAll,
  onDeleteVersion,
  onRenameVersion,
  onSaveNamed,
  onClose,
}: FormVersionsProps<T>) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [editingName, setEditingName] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newVersionName, setNewVersionName] = useState('');
  const [showSaveNew, setShowSaveNew] = useState(false);
  
  // Versionen nach Datum sortieren (neueste zuerst)
  const sortedVersions = [...versions].sort((a, b) => b.timestamp - a.timestamp);
  
  const handleLoadVersion = (timestamp: number) => {
    try {
      setLoading(timestamp);
      // Direkt die Version laden, ohne Verzögerung
      onLoadVersion(timestamp);
      // Dialog schließen
      onClose();
      // Loading-Status zurücksetzen
      setLoading(null);
    } catch (error) {
      console.error('Error loading version:', error);
      setLoading(null);
    }
  };
  
  const handleClearAll = () => {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };
  
  const startEditName = (timestamp: number, currentName?: string) => {
    setEditingName(timestamp);
    setNewName(currentName || '');
  };
  
  const saveNameEdit = () => {
    if (editingName && onRenameVersion) {
      onRenameVersion(editingName, newName);
      setEditingName(null);
    }
  };
  
  const cancelNameEdit = () => {
    setEditingName(null);
  };
  
  const handleDeleteVersion = (timestamp: number) => {
    if (onDeleteVersion) {
      onDeleteVersion(timestamp);
    }
  };
  
  const handleSaveNamed = () => {
    if (onSaveNamed && newVersionName.trim()) {
      try {
        onSaveNamed(newVersionName.trim());
        setNewVersionName('');
        setShowSaveNew(false);
      } catch (error) {
        console.error('Error saving named version:', error);
      }
    }
  };
  
  // Helper-Funktion für den Versionsnamen
  const getVersionDisplayName = (version: Version<T>) => {
    if (version.name) return version.name;
    
    const modeText = version.mode 
      ? ` (${version.mode})`
      : '';
      
    return `${t('formVersions.unnamed')}${modeText}`;
  };
  
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-purple-600" />
        <span className="text-lg font-semibold">{t('formVersions.title')}</span>
      </div>
        
        {/* Speichern mit Namen */}
        {onSaveNamed && (
          <div className="mb-4">
            {showSaveNew ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={t('formVersions.enterName')}
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleSaveNamed}
                  disabled={!newVersionName.trim()}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setShowSaveNew(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowSaveNew(true)}
                className="w-full justify-start gap-2"
              >
                <FileCheck className="h-4 w-4" />
                {t('formVersions.saveCurrentVersion')}
              </Button>
            )}
          </div>
        )}
        
        {sortedVersions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <FileClock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>{t('formVersions.noVersions')}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px] pr-3">
            <div className="space-y-2 pt-2">
              {sortedVersions.map((version) => (
                <div
                  key={version.timestamp}
                  className="flex flex-col p-3 rounded-md border border-purple-200/60 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingName === version.timestamp ? (
                        <div className="flex gap-1 items-center">
                          <Input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="h-7 text-sm"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={saveNameEdit}
                            className="h-7 w-7"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelNameEdit}
                            className="h-7 w-7"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileStack className="h-3.5 w-3.5 text-purple-500" />
                          <span className="text-sm font-medium">
                            {getVersionDisplayName(version)}
                          </span>
                          {version.mode && (
                            <span className="text-xs bg-purple-100 px-1.5 py-0.5 rounded">
                              {version.mode}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span>
                          {format(version.timestamp, 'PPP', { locale: de })}
                        </span>
                        <span className="text-gray-300 mx-1">•</span>
                        <span>
                          {format(version.timestamp, 'HH:mm:ss')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {onRenameVersion && editingName !== version.timestamp && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditName(version.timestamp, version.name)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      
                      {onDeleteVersion && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVersion(version.timestamp)}
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadVersion(version.timestamp)}
                        disabled={loading !== null}
                        className="gap-1"
                      >
                        {loading === version.timestamp ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        {t('formVersions.load')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="flex gap-2 justify-between mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t('formVersions.close')}
          </Button>
          
          {sortedVersions.length > 0 && (
            <Button
              variant={confirmClear ? "destructive" : "outline"}
              onClick={handleClearAll}
              className="gap-1"
            >
              <Trash className="h-4 w-4" />
              {confirmClear ? t('formVersions.confirmClear') : t('formVersions.clearAll')}
            </Button>
          )}
        </div>
    </>
  );
}

export default FormVersions; 
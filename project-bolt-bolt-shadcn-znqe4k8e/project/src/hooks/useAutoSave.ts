import { useState, useEffect, useCallback, useRef } from 'react';
import { APP_CONFIG } from '@/lib/config';

interface AutoSaveOptions<T> {
  /**
   * Die Daten, die gespeichert werden sollen
   */
  data: T;
  
  /**
   * Der Schlüssel, unter dem die Daten im localStorage gespeichert werden
   */
  key: string;
  
  /**
   * Intervall in Millisekunden, in dem die Daten automatisch gespeichert werden
   */
  interval?: number;
  
  /**
   * Funktion, die aufgerufen wird, bevor die Daten gespeichert werden
   */
  onBeforeSave?: (data: T) => void;
  
  /**
   * Funktion, die aufgerufen wird, nachdem die Daten gespeichert wurden
   */
  onAfterSave?: (data: T) => void;
  
  /**
   * Funktion, die aufgerufen wird, wenn beim Speichern ein Fehler auftritt
   */
  onSaveError?: (error: Error) => void;
  
  /**
   * Maximale Anzahl der Versionen, die im localStorage gespeichert werden
   */
  maxVersions?: number;
}

// Erweiterte Version-Schnittstelle mit optionalem Namen
export interface Version<T> {
  timestamp: number;
  data: T;
  name?: string;
  isAutoSave?: boolean;
  mode?: 'MM' | 'FI';
}

interface AutoSaveReturnType<T> {
  /**
   * Manuelles Speichern der Daten
   */
  save: () => void;
  
  /**
   * Manuelles Speichern der Daten mit einem Namen
   */
  saveNamed: (name: string) => void;
  
  /**
   * Gespeicherte Versionen der Daten
   */
  versions: Array<Version<T>>;
  
  /**
   * Lädt eine gespeicherte Version
   */
  loadVersion: (timestamp: number) => T | null;
  
  /**
   * Löscht alle gespeicherten Versionen
   */
  clearAll: () => void;
  
  /**
   * Löscht eine bestimmte Version
   */
  deleteVersion: (timestamp: number) => void;
  
  /**
   * Umbenennt eine Version
   */
  renameVersion: (timestamp: number, newName: string) => void;
  
  /**
   * Der Zeitstempel der letzten Speicherung
   */
  lastSaved: number | null;
  
  /**
   * Gibt an, ob gerade gespeichert wird
   */
  isSaving: boolean;
}

/**
 * Hook für automatisches Speichern von Formulardaten im localStorage
 */
export function useAutoSave<T extends object>({
  data,
  key,
  interval = APP_CONFIG.AUTO_SAVE_INTERVAL * 60 * 1000, // Konvertiere Minuten in Millisekunden
  onBeforeSave,
  onAfterSave,
  onSaveError,
  maxVersions = APP_CONFIG.MAX_FORM_HISTORY,
}: AutoSaveOptions<T>): AutoSaveReturnType<T> {
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [versions, setVersions] = useState<Array<Version<T>>>([]);
  const dataRef = useRef(data);
  
  // Daten-Referenz aktualisieren, wenn sich die Daten ändern
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  
  // Gespeicherte Versionen beim Laden des Hooks laden
  useEffect(() => {
    try {
      const savedVersionsString = localStorage.getItem(`${key}_versions`);
      if (savedVersionsString) {
        const savedVersions = JSON.parse(savedVersionsString);
        setVersions(savedVersions);
      }
    } catch (error) {
      // Error loading autosave versions
    }
  }, [key]);
  
  // Interne Speicherfunktion
  const saveData = useCallback(
    async (name?: string, isAutoSave = false) => {
      if (!dataRef.current) return;
      
      setIsSaving(true);
      
      try {
        // onBeforeSave-Hook aufrufen, wenn vorhanden
        if (onBeforeSave) {
          onBeforeSave(dataRef.current);
        }
        
        const timestamp = Date.now();
        
        // Daten im localStorage speichern
        localStorage.setItem(key, JSON.stringify(dataRef.current));
        
        // Ermittle den Modus aus den Daten, wenn verfügbar
        const mode = 'mode' in dataRef.current ? dataRef.current.mode as 'MM' | 'FI' : undefined;
        
        // Neue Version hinzufügen
        const newVersion: Version<T> = { 
          timestamp, 
          data: dataRef.current,
          isAutoSave: false, // Da automatisches Speichern deaktiviert ist, alle Speicherungen als manuell markieren
          mode,
        };
        
        // Namen hinzufügen, wenn angegeben
        if (name) {
          newVersion.name = name;
        }
        
        const updatedVersions = [newVersion, ...versions].slice(0, maxVersions || 10);
        
        // Versionen speichern
        localStorage.setItem(`${key}_versions`, JSON.stringify(updatedVersions));
        setVersions(updatedVersions);
        
        // Zeitstempel der letzten Speicherung setzen
        setLastSaved(timestamp);
        
        // onAfterSave-Hook aufrufen, wenn vorhanden
        if (onAfterSave) {
          onAfterSave(dataRef.current);
        }
      } catch (error) {
        // onSaveError-Hook aufrufen, wenn vorhanden
        if (onSaveError && error instanceof Error) {
          onSaveError(error);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [key, maxVersions, onAfterSave, onBeforeSave, onSaveError, versions]
  );
  
  // Normales Speichern ohne Namen
  const save = useCallback(() => {
    saveData(undefined, false);
  }, [saveData]);
  
  // Benanntes Speichern
  const saveNamed = useCallback(
    (name: string) => {
      saveData(name, false);
    },
    [saveData]
  );
  
  // Automatisches Speichern, wenn das Intervall gesetzt ist
  useEffect(() => {
    if (!interval || interval <= 0) return;
    
    const intervalId = setInterval(save, interval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [interval, save]);
  
  // Funktion zum Laden einer Version
  const loadVersion = useCallback(
    (timestamp: number) => {
      const version = versions.find((v) => v.timestamp === timestamp);
      if (version) {
        return version.data;
      }
      return null;
    },
    [versions]
  );
  
  // Funktion zum Löschen aller Versionen
  const clearAll = useCallback(() => {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_versions`);
    setVersions([]);
    setLastSaved(null);
  }, [key]);
  
  // Funktion zum Löschen einer bestimmten Version
  const deleteVersion = useCallback(
    (timestamp: number) => {
      const filteredVersions = versions.filter(v => v.timestamp !== timestamp);
      localStorage.setItem(`${key}_versions`, JSON.stringify(filteredVersions));
      setVersions(filteredVersions);
    },
    [key, versions]
  );
  
  // Funktion zum Umbenennen einer Version
  const renameVersion = useCallback(
    (timestamp: number, newName: string) => {
      const updatedVersions = versions.map(v => 
        v.timestamp === timestamp ? { ...v, name: newName } : v
      );
      localStorage.setItem(`${key}_versions`, JSON.stringify(updatedVersions));
      setVersions(updatedVersions);
    },
    [key, versions]
  );
  
  return {
    save,
    saveNamed,
    versions,
    loadVersion,
    clearAll,
    deleteVersion,
    renameVersion,
    lastSaved,
    isSaving,
  };
}

export default useAutoSave; 
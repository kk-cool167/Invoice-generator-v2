/**
 * Übersetzungs-Hilfsfunktionen für die UI
 * 
 * Diese Datei enthält Funktionen, die helfen, UI-Elemente zu übersetzen.
 */

import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Übersetzt alle Schlüssel-Wert-Paare in den angegebenen HTML-Elementen
 * Sucht nach data-i18n-key Attributen und ersetzt den Inhalt mit der Übersetzung
 */
export function applyTranslations() {
  const { t } = useLanguage();
  
  // Elemente mit data-i18n-key Attribut finden
  const elements = document.querySelectorAll('[data-i18n-key]');
  
  // Apply translation to each element
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n-key');
    if (key && element instanceof HTMLElement) {
      element.textContent = t(key);
    }
  });
  
  // Translate placeholders in input fields
  const inputElements = document.querySelectorAll('input[data-i18n-placeholder]');
  inputElements.forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && element instanceof HTMLInputElement) {
      element.placeholder = t(key);
    }
  });
}

/**
 * Diesen Hook kann man in jeder Komponente verwenden, um sie automatisch zu übersetzen
 */
export function useTranslateUI() {
  const { currentLanguage } = useLanguage();
  
  // Apply translations when language changes
  useEffect(() => {
    applyTranslations();
  }, [currentLanguage]);
  
  return { applyTranslations };
} 
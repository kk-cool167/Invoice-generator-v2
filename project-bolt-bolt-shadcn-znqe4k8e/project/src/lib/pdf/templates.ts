/**
 * PDF-Templates Registry
 * 
 * Diese Datei enthält die Definitionsexporte für alle PDF-Vorlagen.
 * Jede Vorlage wird als separates Modul importiert, um die Codestruktur
 * sauber zu halten.
 */

// Importiere die tatsächlichen Template-Implementierungen
import type { PDFGeneratorOptions } from '../pdfTypes';
import { PDF_CONFIG } from '../config';

// Tatsächliche Importe der Template-Module
import BusinessStandardTemplate from './templates/business-standard/index';
import ClassicTemplate from './templates/classic/index';
import BusinessGreenTemplate from './templates/business-green/index';
import ProfessionalTemplate from './templates/professional/index';
import AllrauerTemplate from './templates/allrauer/index';

// Definiere einen Typ für Template-Komponenten mit optionaler t-Funktion
export interface PDFTemplate {
  (props: { data: PDFGeneratorOptions; t?: (key: string) => string }): JSX.Element;
}

/**
 * Exportiert alle verfügbaren Templates als Map
 */
const templates = {
  businessstandard: BusinessStandardTemplate,
  classic: ClassicTemplate,
  professional: ProfessionalTemplate,
  businessgreen: BusinessGreenTemplate,
  allrauer2: AllrauerTemplate
};

/**
 * Überprüfe, ob alle konfigurierten Templates tatsächlich existieren
 */
PDF_CONFIG.AVAILABLE_TEMPLATES.forEach(templateName => {
  // @ts-ignore - Das Template könnte in der Konfiguration existieren, aber noch nicht implementiert sein
  if (!templates[templateName]) {
    // Template not implemented warning
  }
});

export type TemplateName = keyof typeof templates;

export default templates; 
/**
 * PDF Generation Wrapper
 * 
 * Diese Datei stellt eine einheitliche Schnittstelle für die PDF-Generierung bereit
 * und unterstützt sowohl Blob-Rückgabe als auch direkte Downloads.
 */

import { generatePDF as generatePDFCore, generatePDFPreview } from './pdf/generator';
import type { PDFGeneratorOptions } from './pdfTypes';
import type { TemplateName } from './pdf/templates';
import { useLanguage } from '@/context/LanguageContext';

export interface PDFOptions {
  template?: 'classic' | 'professional' | 'businessstandard' | 'businessgreen' | 'allrauer2';
  logo?: string;
  logoConfig?: any;
  mode?: 'MM' | 'FI';
  returnBlob?: boolean;
}

/**
 * Generiert ein PDF-Dokument
 * 
 * @param data - Die Daten für das PDF-Dokument
 * @param options - Optionen für die PDF-Generierung
 * @returns Promise<Blob> wenn returnBlob=true, sonst wird das PDF heruntergeladen
 */
export async function generatePDF(
  data: any,
  options: PDFOptions = {}
): Promise<Blob | void> {
  const {
    template = 'businessstandard',
    logo,
    logoConfig,
    mode = 'MM',
    returnBlob = false
  } = options;

  // Daten für PDF-Generator aufbereiten
  const pdfData: PDFGeneratorOptions = {
    ...data,
    logo,
    logoConfig,
    mode,
    template
  };

  try {
    // PDF-Blob generieren - template als TemplateName übergeben
    const blob = await generatePDFCore(pdfData, template as TemplateName);
    
    if (returnBlob) {
      return blob;
    } else {
      // PDF herunterladen
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.invoiceNumber || 'document'}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Erstellt eine PDF-Vorschau-URL
 */
export async function createPDFPreview(
  data: any,
  options: PDFOptions = {}
): Promise<string> {
  const {
    template = 'businessstandard',
    logo,
    logoConfig,
    mode = 'MM'
  } = options;

  const pdfData: PDFGeneratorOptions = {
    ...data,
    logo,
    logoConfig,
    mode,
    template
  };

  return generatePDFPreview(pdfData, template as TemplateName);
} 
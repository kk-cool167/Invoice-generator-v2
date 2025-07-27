/**
 * PDF Generator
 * 
 * Zentrale Funktionen zur Erstellung von PDF-Dokumenten.
 * Verwendet die PDF-Vorlagen aus dem templates-Verzeichnis.
 */

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import type { PDFGeneratorOptions } from '../pdfTypes';
import { useLanguage } from '@/context/LanguageContext';

import templates, { TemplateName } from './templates';

/**
 * Generiert ein PDF-Dokument basierend auf den bereitgestellten Daten und Template
 * 
 * @param data - Die Daten für das PDF-Dokument
 * @param templateName - Der Name des zu verwendenden Templates (Standard: 'businessstandard')
 * @param t - Übersetzungsfunktion für mehrsprachige Inhalte
 * @returns Ein Promise, das zu einem Blob mit dem PDF-Dokument auflöst
 */
export const generatePDF = async (
  data: PDFGeneratorOptions,
  templateName: TemplateName = 'businessstandard',
  t?: (key: string) => string,
  currentLanguage?: string
): Promise<Blob> => {
  try {
    // Validate input data
    if (!data) {
      throw new Error('PDF data is required');
    }
    
    if (!data.items || data.items.length === 0) {
      throw new Error('At least one item is required for PDF generation');
    }

    // Set global language for templates to access
    if (currentLanguage) {
      (globalThis as any).currentLanguage = currentLanguage;
    }

    const TemplateComponent = templates[templateName];
    if (!TemplateComponent) {
      throw new Error(`Template "${templateName}" not found. Available templates: ${Object.keys(templates).join(', ')}`);
    }

    const doc = <TemplateComponent data={data} t={t} />;
    const blob = await pdf(doc).toBlob();
    
    // Validate generated blob
    if (!blob || blob.size === 0) {
      throw new Error('Failed to generate PDF - empty blob returned');
    }
    
    return blob;
  } catch (error) {
    // Re-throw with context for better error handling
    throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Erstellt eine Vorschau für ein PDF-Dokument
 * 
 * @param data - Die Daten für das PDF-Dokument
 * @param templateName - Der Name des zu verwendenden Templates
 * @param t - Übersetzungsfunktion
 * @returns Ein Promise mit dem PDF-Blob für die Vorschau
 */
export const generatePDFPreview = async (
  data: PDFGeneratorOptions,
  templateName: TemplateName = 'businessstandard',
  t?: (key: string) => string,
  currentLanguage?: string
): Promise<Blob> => {
  return await generatePDF(data, templateName, t, currentLanguage);
};

/**
 * Alternative Funktion für spezielle Anwendungsfälle
 * 
 * @param data Die Daten für das PDF-Dokument
 * @param templateName Der Name des zu verwendenden Templates
 * @param t Übersetzungsfunktion für Internationalisierung
 * @returns Ein Promise, das zu einem Blob mit dem PDF-Dokument auflöst
 */
export async function generateWorkingPDF(
  data: PDFGeneratorOptions,
  templateName: TemplateName = 'businessstandard',
  t?: (key: string) => string
): Promise<Blob> {
  return generatePDF(data, templateName, t);
} 
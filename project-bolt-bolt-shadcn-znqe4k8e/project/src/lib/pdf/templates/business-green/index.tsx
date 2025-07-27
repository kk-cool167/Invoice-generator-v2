import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { Header, Footer, ItemsTable, BillingInfo } from '../../components';
import type { PDFGeneratorOptions } from '../../../pdfTypes';
import styles from './styles';

interface BusinessGreenTemplateProps {
  data: PDFGeneratorOptions & { 
    locale?: 'de' | 'en';
    localeStyles?: any;
    logoConfig?: any;
  };
  t?: (key: string) => string;
}

/**
 * BusinessGreenBanner-Komponente für das Business Green-Template
 * Zeigt eine spezielle Nachricht im Business-Design mit grünen Akzenten an (nur wenn nötig)
 */
const BusinessGreenBanner: React.FC<{ data: PDFGeneratorOptions; t?: (key: string) => string }> = ({ data, t }) => {
  // Prüfen ob relevante Inhalte vorhanden sind
  const hasRelevantContent = data.paymentTerms || data.processor;
  
  if (!hasRelevantContent) {
    return null; // Keine Komponente rendern wenn keine relevanten Daten vorhanden
  }

  return (
    <View style={styles.allrauerBanner}>
      <Text style={styles.allrauerBannerTitle}>
        {t ? t('pdf.invoiceInformation') : 'Information zur Rechnung'}
      </Text>
      
      {data.paymentTerms && (
        <Text style={styles.allrauerBannerText}>
          {t ? t('pdf.thankYouOrder') : 'Wir danken Ihnen für Ihren Auftrag. Diese Rechnung ist gemäß unseren aktuellen Geschäftsbedingungen zu bezahlen'} {data.paymentTerms}.
        </Text>
      )}
      
      {data.processor && (
        <Text style={styles.allrauerBannerText}>
          {t ? t('pdf.contactAvailable') : 'Für Rückfragen zu dieser Rechnung steht Ihnen'} {data.processor} {t ? t('pdf.contactAvailableSuffix') : 'gerne zur Verfügung.'}
        </Text>
      )}
    </View>
  );
};

/**
 * BusinessGreenContact-Komponente für das Business Green-Template
 * Zeigt Kontaktinformationen im Business-Design an (nur wenn Daten vorhanden)
 */
const BusinessGreenContact: React.FC<{ data: PDFGeneratorOptions; t?: (key: string) => string }> = ({ data, t }) => {
  // Prüfen ob überhaupt Kontaktdaten vorhanden sind
  const hasContactData = data.vendor?.cphone || data.vendor?.cemail || data.vendor?.curl;
  
  if (!hasContactData) {
    return null; // Keine Komponente rendern wenn keine Daten vorhanden
  }

  return (
    <View style={styles.allrauerContact}>
      {data.vendor?.cphone && (
        <View style={styles.allrauerContactItem}>
          <Text style={styles.allrauerContactLabel}>
            {t ? t('pdf.contactPhone') : 'Tel'}:
          </Text>
          <Text style={styles.allrauerContactValue}>{data.vendor.cphone}</Text>
        </View>
      )}
      
      {data.vendor?.cemail && (
        <View style={styles.allrauerContactItem}>
          <Text style={styles.allrauerContactLabel}>
            {t ? t('pdf.contactEmail') : 'E-Mail'}:
          </Text>
          <Text style={styles.allrauerContactValue}>{data.vendor.cemail}</Text>
        </View>
      )}
      
      {data.vendor?.curl && (
        <View style={styles.allrauerContactItem}>
          <Text style={styles.allrauerContactLabel}>
            {t ? t('pdf.contactWeb') : 'Web'}:
          </Text>
          <Text style={styles.allrauerContactValue}>{data.vendor.curl}</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Business Green PDF-Template
 * Ein modernes, professionelles Design mit grünen Akzentfarben
 */
export const BusinessGreenTemplate: React.FC<BusinessGreenTemplateProps> = ({ data, t }) => {
  return (
    <Document style={styles.document}>
      <Page size="A4" style={styles.page} wrap>
        {/* Header mit Firmenlogo und -informationen */}
        <Header data={data} styles={styles} t={t} templateName="business-green" />
        
        {/* Empfänger und Rechnungsdetails */}
        <BillingInfo data={data} styles={styles} t={t} />
        
        {/* Business Green-spezifische Kontaktinformationen */}
        <BusinessGreenContact data={data} t={t} />
        
        {/* Artikeltabelle und Summen */}
        <ItemsTable data={data} styles={styles} t={t} />
        
        {/* Business Green-spezifischer Zahlungshinweis */}
        <BusinessGreenBanner data={data} t={t} />
        
        {/* Footer mit Kontaktdaten, Banking-Informationen */}
        <Footer data={data} styles={styles} t={t} />
      </Page>
    </Document>
  );
};

export default BusinessGreenTemplate; 
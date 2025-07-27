/**
 * Klassisches PDF-Template
 * 
 * Vorübergehend wird hier das moderne Template re-exportiert.
 * Dies wird später durch eine eigene Implementierung ersetzt.
 */

import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { Header, Footer, ItemsTable, BillingInfo } from '../../components';
import type { PDFGeneratorOptions } from '../../../pdfTypes';
import styles from './styles';

interface ClassicTemplateProps {
  data: PDFGeneratorOptions & { 
    locale?: 'de' | 'en';
    localeStyles?: any;
    logoConfig?: any;
  };
  t?: (key: string) => string;
}

/**
 * ClassicPaymentInfo-Komponente für das Classic-Template
 * Zeigt Zahlungsbedingungen in einer umrandeten Box an
 */
const ClassicPaymentInfo: React.FC<{ data: PDFGeneratorOptions; t?: (key: string) => string }> = ({ data, t }) => (
  <View style={styles.classicBox}>
    <Text style={styles.classicBoxTitle}>
      {t ? t('pdf.paymentTerms') : 'Zahlungsbedingungen'}
    </Text>
    <Text style={styles.classicBoxText}>
      {(data.paymentTerms && !data.paymentTerms.toLowerCase().includes('30 day') && !data.paymentTerms.toLowerCase().includes('30 tag')) 
        ? data.paymentTerms 
        : (t ? t('pdf.defaultPayment') : 'Bitte überweisen Sie den Rechnungsbetrag auf unser unten angegebenes Konto.')}
    </Text>
    
    {data.processor && (
      <Text style={styles.classicBoxText}>
        {t ? t('pdf.contactAvailable') : 'Für Rückfragen steht Ihnen'} {data.processor} {t ? t('pdf.contactAvailableSuffix') : 'gerne zur Verfügung.'}
      </Text>
    )}
  </View>
);

/**
 * Unterschriften-Komponente speziell für das Classic-Template
 */
const ClassicSignature: React.FC<{ t?: (key: string) => string }> = ({ t }) => (
  <View style={styles.classicSign}>
    <View>
      <View style={styles.classicSignLine} />
      <Text style={styles.classicSignText}>
        {t ? 'Signature / Company Stamp' : 'Unterschrift / Firmenstempel'}
      </Text>
    </View>
  </View>
);

/**
 * Classic PDF-Template
 * Ein traditionelles, zeitloses Design mit Serientypen und klassischen Elementen
 */
export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ data, t }) => {
  const currentDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return (
    <Document style={styles.document}>
      <Page size="A4" style={styles.page} wrap>
        {/* Header mit Firmenlogo und -informationen */}
        <Header data={data} styles={styles} t={t} templateName="classic" />
        
        {/* Empfänger und Rechnungsdetails */}
        <BillingInfo data={data} styles={styles} t={t} />
        
        {/* Artikeltabelle und Summen */}
        <ItemsTable data={data} styles={styles} t={t} />
        
        {/* Klassische Box für Zahlungsinformationen */}
        <ClassicPaymentInfo data={data} t={t} />
        
        {/* Unterschriftenzeile */}
        <ClassicSignature t={t} />
        
        {/* Abschließende Notiz */}
        <Text style={styles.classicNote}>
          {t ? 'This invoice was created electronically and is valid without signature.' : 'Diese Rechnung wurde elektronisch erstellt und ist auch ohne Unterschrift gültig.'}
          {t ? ` Issued on ${currentDate}.` : ` Ausgestellt am ${currentDate}.`}
        </Text>
        
        {/* Footer mit Kontaktdaten, Banking-Informationen */}
        <Footer data={data} styles={styles} t={t} />
      </Page>
    </Document>
  );
};

export default ClassicTemplate; 
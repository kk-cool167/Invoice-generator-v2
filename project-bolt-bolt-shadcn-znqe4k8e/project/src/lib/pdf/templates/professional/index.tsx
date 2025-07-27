import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { Header, Footer, ItemsTable, BillingInfo } from '../../components';
import type { PDFGeneratorOptions } from '../../../pdfTypes';
import styles from './styles';
import { LogoContainer } from '../../components/LogoContainer';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ProfessionalTemplateProps {
  data: PDFGeneratorOptions & { 
    locale?: 'de' | 'en';
    localeStyles?: any;
    logoConfig?: any;
  };
  t?: (key: string) => string;
}

/**
 * Spezielle Komponente für das Professional Template
 * Zeigt Zahlungsbedingungen und zusätzliche Informationen in einem speziell gestalteten Bereich an
 */
const PaymentInfo: React.FC<{ data: PDFGeneratorOptions; t?: (key: string) => string }> = ({ data, t }) => (
  <View style={styles.professionalBox}>
    <Text style={styles.professionalBoxTitle}>
      {t ? t('pdf.paymentTerms') : 'Zahlungsbedingungen'}
    </Text>
    <Text style={styles.professionalBoxText}>
      {(data.paymentTerms && !data.paymentTerms.toLowerCase().includes('30 day') && !data.paymentTerms.toLowerCase().includes('30 tag')) 
        ? data.paymentTerms 
        : (t ? t('pdf.defaultPayment') : 'Bitte überweisen Sie den Rechnungsbetrag auf unser unten angegebenes Konto.')}
    </Text>
    
    {data.processor && (
      <Text style={styles.professionalBoxText}>
        {t ? t('pdf.contactAvailable') : 'Für Rückfragen steht Ihnen'} {data.processor} {t ? t('pdf.contactAvailableSuffix') : 'gerne zur Verfügung.'}
      </Text>
    )}
  </View>
);

/**
 * Professional PDF-Template
 * Ein elegantes, geschäftliches Design mit dunkelblauen Akzenten
 */
export const ProfessionalTemplate: React.FC<ProfessionalTemplateProps> = ({ data, t }) => {
  return (
    <Document style={styles.document}>
      <Page size="A4" style={styles.page} wrap>
        {/* Header mit Firmenlogo und -informationen */}
        <Header data={data} styles={styles} t={t} templateName="professional" />
        
        {/* Empfänger und Rechnungsdetails */}
        <BillingInfo data={data} styles={styles} t={t} />
        
        {/* Artikeltabelle und Summen */}
        <ItemsTable data={data} styles={styles} t={t} />
        
        {/* Spezielle Zahlungsinformationen für das Professional Template */}
        <PaymentInfo data={data} t={t} />
        
        {/* Footer mit Kontaktdaten, Banking-Informationen */}
        <Footer data={data} styles={styles} t={t} />
      </Page>
    </Document>
  );
};

export default ProfessionalTemplate; 
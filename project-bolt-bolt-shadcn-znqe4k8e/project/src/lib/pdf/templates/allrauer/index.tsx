import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import type { PDFGeneratorOptions } from '../../../pdfTypes';
import styles from './styles';
import { LogoContainer } from '../../components/LogoContainer';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface AllrauerTemplateProps {
  data: PDFGeneratorOptions & { 
    locale?: 'de' | 'en';
    localeStyles?: any;
    logoConfig?: any;
  };
  t?: (key: string) => string;
}

/**
 * Formatiert ein Datum in yyyy-MM-dd Format
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd', { locale: de });
  } catch (e) {
    return dateString;
  }
};

/**
 * Allrauer PDF-Template
 * EXAKTE Nachbildung des ursprünglichen Allrauer Rechnungsformats
 */
export const AllrauerTemplate: React.FC<AllrauerTemplateProps> = ({ data, t }) => {
  // Determine the primary currency from all items
  const getCurrency = () => {
    // Collect all currencies from items
    const currencies = data.items
      .map(item => item.currency)
      .filter(Boolean);
    
    if (currencies.length === 0) return 'EUR';
    
    // If all items have the same currency, use it
    const uniqueCurrencies = [...new Set(currencies)];
    if (uniqueCurrencies.length === 1) {
      return uniqueCurrencies[0];
    }
    
    // If multiple currencies, find the most common one
    const currencyCount = currencies.reduce((acc, curr) => {
      if (curr) {
        acc[curr] = (acc[curr] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonCurrency = Object.entries(currencyCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
    
    return mostCommonCurrency || 'EUR';
  };

  const currency = getCurrency();

  // Funktion zur Berechnung der Steuer nach Steuersätzen
  const calculateTaxByRate = () => {
    if (!data.items || data.items.length === 0) {
      return [
        { rate: 19, netAmount: 129.99, taxAmount: 24.70, grossAmount: 154.69 }
      ];
    }

    const taxGroups: { [key: number]: { netAmount: number; taxAmount: number; grossAmount: number } } = {};
    
    data.items.forEach(item => {
      const rate = Number(item.taxRate) || 19;
      const netAmount = Number(item.total) || 0;
      const taxAmount = netAmount * (rate / 100);
      const grossAmount = netAmount + taxAmount;
      
      if (!taxGroups[rate]) {
        taxGroups[rate] = { netAmount: 0, taxAmount: 0, grossAmount: 0 };
      }
      
      taxGroups[rate].netAmount += netAmount;
      taxGroups[rate].taxAmount += taxAmount;
      taxGroups[rate].grossAmount += grossAmount;
    });

    return Object.entries(taxGroups).map(([rate, amounts]) => ({
      rate: Number(rate),
      netAmount: amounts.netAmount,
      taxAmount: amounts.taxAmount,
      grossAmount: amounts.grossAmount
    })).sort((a, b) => b.rate - a.rate); // Sortiere nach Steuersatz absteigend
  };

  const taxCalculations = calculateTaxByRate();

  return (
    <Document style={styles.document}>
      <Page size="A4" style={styles.page} wrap>
        
        {/* HEADER: Firmenadresse und Logo */}
        <View style={styles.headerSection}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyHeader}>
              {data.vendor?.cname || 'Firmenname'}, {data.vendor?.cstreet || 'Straße'}, {data.vendor?.czip || 'PLZ'} {data.vendor?.ccity || 'Stadt'}
            </Text>
            <View style={styles.spacer} />
            
            {/* EMPFÄNGERADRESSE */}
            <Text style={styles.recipientName}>
              {data.recipient?.cname || ''}
            </Text>
            <Text style={styles.recipientAddress}>
              {data.recipient?.cstreet || ''}
            </Text>
            <View style={styles.spacer} />
            <Text style={styles.recipientAddress}>
              {data.recipient?.czip || ''} {data.recipient?.ccity || ''}
            </Text>
          </View>
          
          {data.logo && (
            <LogoContainer
              logoUrl={data.logo}
              maxWidth={data.logoConfig?.maxWidth || 300}
              maxHeight={data.logoConfig?.maxHeight || 60}
              containerWidth={data.logoConfig?.containerWidth || 320}
              containerHeight={data.logoConfig?.containerHeight || 70}
              alignment={data.logoConfig?.alignment || 'center'}
              verticalAlignment={data.logoConfig?.verticalAlignment || 'middle'}
              styles={styles}
            />
          )}
        </View>

        {/* RECHNUNG TITEL */}
        <Text style={styles.invoiceTitle}>{t ? t('allrauer.invoice') : 'Rechnung'}</Text>

        {/* RECHNUNGSDETAILS - Zweispaltig wie im Original */}
        <View style={styles.invoiceDetailsSection}>
          <View style={styles.detailsLeft}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t ? t('allrauer.invoiceNumber') : 'RechnungsNr.'} :</Text>
              <Text style={styles.detailValue}>{data.invoiceNumber || 'HKI2024050230'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t ? t('allrauer.invoiceDate') : 'Rechnungsdatum'} :</Text>
              <Text style={styles.detailValue}>{formatDate(data.invoiceDate)}</Text>
            </View>
            {data.mode === 'MM' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t ? t('allrauer.deliveryNoteNumber') : 'LieferscheinNr.'} :</Text>
                <Text style={styles.detailValue}>
                  {data.deliveryNote?.cdnnumberexternal || data.deliveryNoteNumber || 'LS20200094'}
                </Text>
              </View>
            )}
            {data.mode === 'MM' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t ? t('allrauer.deliveryDate') : 'Lieferdatum'} :</Text>
                <Text style={styles.detailValue}>{formatDate(data.deliveryDate)}</Text>
              </View>
            )}
            {data.mode === 'MM' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t ? t('allrauer.orderDate') : 'Auftragsdatum'} :</Text>
                <Text style={styles.detailValue}>{formatDate(data.orderDate)}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailsRight}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t ? t('allrauer.customerNumber') : 'Ihre Kundennummer'} :</Text>
              <Text style={styles.detailValue}>{data.customerNumber || '236744'}</Text>
            </View>
            {data.mode === 'MM' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t ? t('allrauer.orderNumber') : 'Ihre Bestellnummer'} :</Text>
                <Text style={styles.detailValue}>
                  {data.order?.cponumber || data.orderNumber || ''}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t ? t('allrauer.vatId') : 'Ihre USTID'} :</Text>
              <Text style={styles.detailValue}>{data.vendor?.cvatnumber || 'DE123456789'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t ? t('allrauer.processor') : 'Ihr Bearbeiter'} :</Text>
              <Text style={styles.detailValue}>{data.processor || 'Herr Max Mustermann'}</Text>
            </View>
          </View>
        </View>

        {/* TEXT OBERHALB DER ITEMS-TABELLE */}
        <View style={styles.preTableText}>
          <Text style={styles.preTableLine}>
            {t ? t('allrauer.termsText1') : 'Für alle Warenhandelsgeschäfte gelten unsere umseitig aufgeführten AGB. Lieferzeiten sind unverbindliche Angaben!'}
          </Text>
          <Text style={styles.preTableLineBold}>
            {t ? t('allrauer.termsText2') : 'Rücksendungen ohne Fehlerbeschreibung und RMA. Nummer können nicht bearbeitet werden!'}
          </Text>
          <Text style={styles.preTableLine}>
            {t ? t('allrauer.termsText3') : 'Sparen Sie jetzt Telefonkosten mit dem ICO-Tarifmanager. Info-Hotline: 02151 - 371137'}
          </Text>
        </View>

        {/* ARTIKELTABELLE - URSPRÜNGLICHES ALLRAUER FORMAT */}
        <View style={styles.itemsTable}>
          {/* Tabellen-Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colBezeichnung]}>{t ? t('allrauer.description') : 'Bezeichnung'}</Text>
            <Text style={[styles.tableHeaderCell, styles.colMenge]}>{t ? t('allrauer.quantity') : 'Menge'}</Text>
            <Text style={[styles.tableHeaderCell, styles.colEinheit]}>{t ? t('allrauer.unit') : 'Einheit'}</Text>
            <Text style={[styles.tableHeaderCell, styles.colSatz]}>{t ? t('allrauer.rate') : 'Satz'}</Text>
            <Text style={[styles.tableHeaderCell, styles.colEinzelpreis]}>{t ? t('allrauer.unitPrice') : 'Einzelpreis'}</Text>
            <Text style={[styles.tableHeaderCell, styles.colGesamtpreis]}>{t ? t('allrauer.totalPrice') : 'Gesamtpreis'}</Text>
          </View>
          
          {/* Tabellen-Zeilen */}
          {data.items && data.items.length > 0 ? (
            data.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colBezeichnung]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colMenge]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colEinheit]}>{item.unit || 'ST'}</Text>
                <Text style={[styles.tableCell, styles.colSatz]}>{item.taxRate || 19}</Text>
                <Text style={[styles.tableCell, styles.colEinzelpreis]}>
                  {Number(item.price) ? Number(item.price).toFixed(2).replace('.', ',') : '0,00'}
                </Text>
                <Text style={[styles.tableCell, styles.colGesamtpreis]}>
                  {Number(item.total) ? Number(item.total).toFixed(2).replace('.', ',') : '0,00'}
                </Text>
              </View>
            ))
          ) : (
            // Fallback: Beispielitem
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colBezeichnung]}>Batterie AGM 80Ah</Text>
              <Text style={[styles.tableCell, styles.colMenge]}>1</Text>
              <Text style={[styles.tableCell, styles.colEinheit]}>ST</Text>
              <Text style={[styles.tableCell, styles.colSatz]}>19</Text>
              <Text style={[styles.tableCell, styles.colEinzelpreis]}>129,99</Text>
              <Text style={[styles.tableCell, styles.colGesamtpreis]}>129,99</Text>
            </View>
          )}
        </View>

        {/* UMSATZ-TABELLE - Getrennt von Gesamt */}
        <View style={styles.totalsTable}>
          {/* Umsatz-Tabelle Header */}
          <View style={styles.totalsHeader}>
            <Text style={[styles.totalsHeaderCell, styles.colEmpty]}></Text>
            <Text style={[styles.totalsHeaderCell, styles.colNetto]}>{t ? t('allrauer.net') : 'Netto'}</Text>
            <Text style={[styles.totalsHeaderCell, styles.colMwStSatz]}>{t ? t('allrauer.vatRate') : 'MwSt-Satz'}</Text>
            <Text style={[styles.totalsHeaderCell, styles.colMwSt]}>{t ? t('allrauer.vat') : 'MwSt'}</Text>
            <Text style={[styles.totalsHeaderCell, styles.colBrutto]}>{t ? t('allrauer.gross') : 'Brutto'}</Text>
          </View>
          
          {/* Berechnete Summen für jeden Steuersatz */}
          {taxCalculations.map((taxCalc, index) => (
            <View key={index} style={styles.totalsRow}>
              <Text style={[styles.totalsCell, styles.colEmpty]}></Text>
              <Text style={[styles.totalsCell, styles.colNetto]}>
                {taxCalc.netAmount.toFixed(2).replace('.', ',') + ' ' + currency}
              </Text>
              <Text style={[styles.totalsCell, styles.colMwStSatz]}>
                {taxCalc.rate.toFixed(2).replace('.', ',')}
              </Text>
              <Text style={[styles.totalsCell, styles.colMwSt]}>
                {taxCalc.taxAmount.toFixed(2).replace('.', ',') + ' ' + currency}
              </Text>
              <Text style={[styles.totalsCell, styles.colBrutto]}>
                {taxCalc.grossAmount.toFixed(2).replace('.', ',') + ' ' + currency}
              </Text>
            </View>
          ))}
          
          {/* Leere Zeilen falls weniger als 3 Steuersätze */}
          {Array.from({ length: Math.max(0, 3 - taxCalculations.length) }, (_, index) => (
            <View key={`empty-${index}`} style={styles.totalsRow}>
              <Text style={[styles.totalsCell, styles.colEmpty]}></Text>
              <Text style={[styles.totalsCell, styles.colNetto]}>{currency}</Text>
              <Text style={[styles.totalsCell, styles.colMwStSatz]}></Text>
              <Text style={[styles.totalsCell, styles.colMwSt]}>{currency}</Text>
              <Text style={[styles.totalsCell, styles.colBrutto]}>{currency}</Text>
            </View>
          ))}
        </View>

        {/* GESAMT-TABELLE - Getrennt */}
        <View style={styles.gesamtTable}>
          <View style={styles.gesamtRow}>
            <Text style={[styles.gesamtCell, styles.colGesamtLabel]}>{t ? t('allrauer.total') : 'Gesamt'}</Text>
            <Text style={[styles.gesamtCell, styles.colGesamtNetto]}>
              {taxCalculations.reduce((sum, calc) => sum + calc.netAmount, 0).toFixed(2).replace('.', ',') + ' ' + currency}
            </Text>
            <Text style={[styles.gesamtCell, styles.colGesamtMwStSatz]}></Text>
            <Text style={[styles.gesamtCell, styles.colGesamtMwSt]}>
              {taxCalculations.reduce((sum, calc) => sum + calc.taxAmount, 0).toFixed(2).replace('.', ',') + ' ' + currency}
            </Text>
            <Text style={[styles.gesamtCellBetrag, styles.colGesamtBrutto]}>
              {taxCalculations.reduce((sum, calc) => sum + calc.grossAmount, 0).toFixed(2).replace('.', ',') + ' ' + currency}
            </Text>
          </View>
        </View>

        {/* ZAHLUNGSHINWEIS */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentText}>
            {t ? t('allrauer.paymentText1') : 'Überweisen Sie bitte den ausstehenden Betrag von'}
          </Text>
          <Text style={styles.paymentAmount}>
            {taxCalculations.reduce((sum, calc) => sum + calc.grossAmount, 0).toFixed(2).replace('.', ',') + ' ' + currency}
          </Text>
          <Text style={styles.paymentText}>
            {t ? t('allrauer.paymentText2') : 'auf eins der unten angegebenen Konten.'}
          </Text>
        </View>

        {/* FOOTER - Dynamische Daten */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerText}>{data.vendor?.cstreet || ''}</Text>
              <Text style={styles.footerText}>{data.vendor?.czip || ''} {data.vendor?.ccity || ''}</Text>
              <View style={styles.spacer} />
              <Text style={styles.footerText}>Tel.: {data.vendor?.cphone || data.vendor?.cfon || ''}</Text>
              {data.vendor?.cfax && (
                <Text style={styles.footerText}>Fax: {data.vendor.cfax}</Text>
              )}
              {data.vendor?.curl && (
                <Text style={styles.footerText}>{data.vendor.curl}</Text>
              )}
            </View>
            
            <View style={styles.footerColumn}>
              <Text style={styles.footerText}>{t ? t('allrauer.bankConnections') : 'Bankverbindungen'}:</Text>
              <Text style={styles.footerText}>{data.vendor?.ciban || ''}</Text>
              <Text style={styles.footerText}>{data.vendor?.cbankname || data.vendor?.bank_name || ''}</Text>
            </View>
            
            <View style={styles.footerColumn}>
              <Text style={styles.footerText}>
                USTID {data.vendor?.cvatnumber || ''}
              </Text>
              {data.vendor?.cemail && (
                <Text style={styles.footerText}>E-Mail: {data.vendor.cemail}</Text>
              )}
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default AllrauerTemplate;
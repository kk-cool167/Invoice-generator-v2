import React from 'react';
import { Document, Page, StyleSheet, View, Text, Image } from '@react-pdf/renderer';
import type { PDFGeneratorOptions } from '../../../pdfTypes';
import styles from './styles';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { LogoContainer } from '../../components/LogoContainer';

interface BusinessStandardTemplateProps {
  data: PDFGeneratorOptions & { 
    locale?: 'de' | 'en';
    localeStyles?: any;
    logoConfig?: any;
  };
  t?: (key: string) => string;
}

/**
 * Business Standard Rechnungstemplate nach DIN 5008
 * Traditioneller deutscher Geschäftsstil mit klassischer Struktur
 * Sachlich, professionell und DIN-konform - optimiert für 4+ Items pro Seite
 */
const BusinessStandardTemplate: React.FC<BusinessStandardTemplateProps> = ({ data, t }) => {
  // Determine the primary currency from all items
  const getCurrency = () => {
    // Collect all currencies from items
    const currencies = data.items
      .map(item => item.currency)
      .filter(Boolean);
    
    if (currencies.length === 0) {
      // Use centralized currency determination
      const { getCurrencyForContext } = require('../../../currencyManager');
      return getCurrencyForContext({ companyCode: data.vendor.ccompanycode || '1000' });
    }
    
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
    
    if (!mostCommonCurrency) {
      // Use centralized currency determination as final fallback
      const { getCurrencyForContext } = require('../../../currencyManager');
      return getCurrencyForContext({ companyCode: data.vendor.ccompanycode || '1000' });
    }
    return mostCommonCurrency;
  };

  const currency = getCurrency();

  const formatCurrency = (amount: number, itemCurrency?: string) => {
    // Use item-specific currency if provided, otherwise use primary currency
    const currencyToUse = itemCurrency || currency;
    const locale = currencyToUse === 'GBP' ? 'en-GB' : 
                   currencyToUse === 'CHF' ? 'de-CH' : 'de-DE';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyToUse
    }).format(amount);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd', { locale: de });
    } catch (e) {
      return dateString;
    }
  };

  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const vatAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.price * item.taxRate / 100), 0);
  const total = subtotal + vatAmount;

  return (
    <Document style={styles.document}>
      <Page size="A4" style={styles.page} wrap>
        
        {/* Briefkopf nach DIN 5008 */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{data.vendor?.cname || 'Ihr Unternehmen'}</Text>
            <Text style={styles.companyAddress}>
              {data.vendor?.cstreet} • {data.vendor?.czip} {data.vendor?.ccity} • {data.vendor?.ccountry}
            </Text>
          </View>
          
          {data.logo && (
            <LogoContainer
              logoUrl={data.logo}
              maxWidth={data.logoConfig?.maxWidth || 240}
              maxHeight={data.logoConfig?.maxHeight || 50}
              containerWidth={data.logoConfig?.containerWidth || 260}
              containerHeight={data.logoConfig?.containerHeight || 60}
              alignment={data.logoConfig?.alignment || 'right'}
              verticalAlignment={data.logoConfig?.verticalAlignment || 'middle'}
              styles={styles}
            />
          )}
        </View>

        {/* Anschriftenfeld */}
        <View style={styles.addressSection}>
          
          {/* Empfängeradresse */}
          <View style={styles.recipientAddress}>
            <Text style={styles.recipientName}>{data.recipient?.cname || 'Empfängername'}</Text>
            <Text style={styles.recipientText}>{data.recipient?.cstreet}</Text>
            <Text style={styles.recipientText}>{data.recipient?.czip} {data.recipient?.ccity}</Text>
            {data.recipient?.ccountry && data.recipient.ccountry !== 'DE' && data.recipient.ccountry !== 'Deutschland' && (
              <Text style={styles.recipientText}>{data.recipient.ccountry}</Text>
            )}
          </View>
        </View>

        {/* Datum rechtsbündig */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{formatDate(data.invoiceDate)}</Text>
        </View>

        {/* Betreff */}
        <View style={styles.subjectSection}>
          <Text style={styles.subjectText}>
            {data.mode === 'MM' ? 
              (t ? t('pdf.invoice') : 'Rechnung') : 
              (t ? t('pdf.financialInvoice') : 'Finanzrechnung')} Nr. {data.invoiceNumber}
          </Text>
        </View>

        {/* Anrede und Einleitungstext */}
        <View style={styles.salutationSection}>
          <Text style={styles.salutationText}>
            {t ? t('pdf.salutation') : 'Sehr geehrte Damen und Herren,'}
          </Text>
          <Text style={styles.introText}>
            {t ? t('pdf.introText') : 'hiermit stellen wir Ihnen die nachfolgend aufgeführten Leistungen in Rechnung:'}
          </Text>
        </View>

        {/* Rechnungsdetails */}
        <View style={styles.invoiceDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t ? t('pdf.invoiceNumber') : 'Rechnungsnummer'}:
            </Text>
            <Text style={styles.detailValue}>{data.invoiceNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t ? t('pdf.invoiceDate') : 'Rechnungsdatum'}:
            </Text>
            <Text style={styles.detailValue}>{formatDate(data.invoiceDate)}</Text>
          </View>
          {data.mode === 'MM' && data.orderNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t ? t('pdf.orderNumber') : 'Bestellnr.'}:
              </Text>
              <Text style={styles.detailValue}>
                {data.order?.cponumber || data.orderNumber}
              </Text>
            </View>
          )}
          {data.mode === 'MM' && data.orderDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t ? t('pdf.orderDate') : 'Bestelldatum'}:
              </Text>
              <Text style={styles.detailValue}>{formatDate(data.orderDate)}</Text>
            </View>
          )}
          {data.mode === 'MM' && data.deliveryNoteNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t ? t('pdf.deliveryNoteNumber') : 'Lieferscheinnr.'}:
              </Text>
              <Text style={styles.detailValue}>
                {data.deliveryNote?.cdnnumberexternal || data.deliveryNoteNumber}
              </Text>
            </View>
          )}
          {data.mode === 'MM' && data.deliveryDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t ? t('pdf.deliveryDate') : 'Lieferdatum'}:
              </Text>
              <Text style={styles.detailValue}>{formatDate(data.deliveryDate)}</Text>
            </View>
          )}
          {data.processor && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t ? t('pdf.processor') : 'Sachbearbeiter'}:
              </Text>
              <Text style={styles.detailValue}>{data.processor}</Text>
            </View>
          )}
          {data.customerNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t ? t('pdf.customerNumber') : 'Kundennummer'}:
              </Text>
              <Text style={styles.detailValue}>{data.customerNumber}</Text>
            </View>
          )}
        </View>

        {/* Hauptinhalt */}
        <View style={styles.mainContent}>
          {/* Leistungstabelle */}
          <View style={styles.itemsTable}>
            {/* Tabellenkopf */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colPos]}>
                {t ? t('pdf.position') : 'Pos.'}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>
                {t ? t('pdf.description') : 'Bezeichnung'}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colQuantity]}>
                {t ? t('pdf.quantity') : 'Menge'}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colUnit]}>
                {t ? t('pdf.unit') : 'Einheit'}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>
                {t ? t('pdf.unitPrice') : 'Einzelpreis'}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>
                {t ? t('pdf.totalPrice') : 'Gesamtpreis'}
              </Text>
            </View>

            {/* Tabellenzeilen */}
            {data.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colPos]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQuantity]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colUnit]}>{item.unit}</Text>
                <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(item.price, item.currency)}</Text>
                <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(item.quantity * item.price, item.currency)}</Text>
              </View>
            ))}
          </View>

          {/* Summentabelle */}
          <View style={styles.summarySection}>
            <View style={styles.summaryTable}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {t ? t('pdf.net') : 'Zwischensumme (netto)'}:
                </Text>
                <Text style={styles.summaryValue}>{formatCurrency(subtotal, currency)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {t ? t('pdf.vat') : 'Umsatzsteuer'} {data.items[0]?.taxRate || 19}%:
                </Text>
                <Text style={styles.summaryValue}>{formatCurrency(vatAmount, currency)}</Text>
              </View>
              <View style={styles.summaryRowTotal}>
                <Text style={styles.summaryLabelTotal}>
                  {t ? t('pdf.total') : 'Rechnungsbetrag (brutto)'}:
                </Text>
                <Text style={styles.summaryValueTotal}>{formatCurrency(total, currency)}</Text>
              </View>
            </View>
          </View>

          {/* Zahlungshinweise - nur wenn explizit angegeben und nicht die problematische "30 days" Nachricht */}
          {data.paymentTerms && !data.paymentTerms.toLowerCase().includes('30 day') && !data.paymentTerms.toLowerCase().includes('30 tag') && (
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentText}>
                {data.paymentTerms}
              </Text>
            </View>
          )}

          {/* Grußformel */}
          <View style={styles.closingSection}>
            <Text style={styles.closingText}>
              {t ? t('pdf.closing') : 'Mit freundlichen Grüßen'}
            </Text>
            <Text style={styles.companyNameClosing}>{data.vendor?.cname}</Text>
          </View>
        </View>

        {/* Fußzeile mit Geschäftsangaben - am Ende der Seite */}
        <View style={styles.footer}>
          <View style={styles.footerSection}>
            <Text style={styles.footerHeader}>
              {t ? t('pdf.bankDetails') : 'Bankverbindung'}
            </Text>
            {data.vendor?.cbankname && <Text style={styles.footerText}>{data.vendor.cbankname}</Text>}
            {data.vendor?.ciban && <Text style={styles.footerText}>IBAN: {data.vendor.ciban}</Text>}
            {data.vendor?.cbic && <Text style={styles.footerText}>BIC: {data.vendor.cbic}</Text>}
          </View>
          
          <View style={styles.footerSection}>
            <Text style={styles.footerHeader}>
              {t ? t('pdf.businessDetails') : 'Geschäftsangaben'}
            </Text>
            {data.vendor?.ctaxnumber && <Text style={styles.footerText}>
              {t ? t('pdf.taxNumber') : 'Steuernr.'}: {data.vendor.ctaxnumber}
            </Text>}
            {data.vendor?.cvatnumber && <Text style={styles.footerText}>
              {t ? t('pdf.vatNumber') : 'USt-IdNr.'}: {data.vendor.cvatnumber}
            </Text>}
            {data.vendor?.cregistration && <Text style={styles.footerText}>{data.vendor.cregistration}</Text>}
          </View>
          
          <View style={styles.footerSection}>
            <Text style={styles.footerHeader}>
              {t ? t('pdf.contact') : 'Kontakt'}
            </Text>
            {data.vendor?.cfon && <Text style={styles.footerText}>
              {t ? t('pdf.phone') : 'Tel'}: {data.vendor.cfon}
            </Text>}
            {data.vendor?.cfax && <Text style={styles.footerText}>
              {t ? t('pdf.fax') : 'Fax'}: {data.vendor.cfax}
            </Text>}
            {data.vendor?.cemail && <Text style={styles.footerText}>E-Mail: {data.vendor.cemail}</Text>}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default BusinessStandardTemplate; 
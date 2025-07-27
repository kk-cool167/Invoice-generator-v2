import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { PDFGeneratorOptions } from '../../pdfTypes';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface BillingInfoProps {
  data: PDFGeneratorOptions;
  styles?: any;
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
 * Wiederverwendbare Komponente für Rechnungsinformationen
 * Zeigt Empfängerdaten und Rechnungsdetails an
 */
export const BillingInfo: React.FC<BillingInfoProps> = ({ data, styles = {}, t }) => {
  return (
    <View style={[defaultStyles.recipientSection, styles.recipientSection]}>
      {/* Empfängerinformationen */}
      <View style={[defaultStyles.recipientInfo, styles.recipientInfo]}>
        <Text style={[defaultStyles.recipientTitle, styles.recipientTitle]}>
          {t ? t('pdf.billTo') : 'Rechnungsempfänger'}
        </Text>
        <Text style={defaultStyles.recipientName}>
          {data.recipient?.cname || 'Empfängername'}
        </Text>
        <Text style={defaultStyles.recipientDetail}>
          {data.recipient?.cstreet || 'Empfängeranschrift'}
        </Text>
        <Text style={defaultStyles.recipientDetail}>
          {data.recipient?.czip || ''} {data.recipient?.ccity || 'Empfängerort'}
        </Text>
        {data.recipient?.ccountry && (
          <Text style={defaultStyles.recipientDetail}>
            {data.recipient.ccountry}
          </Text>
        )}
        
        {/* Kundennummer wenn vorhanden */}
        {data.customerNumber && (
          <Text style={defaultStyles.customerNumber}>
            {t ? t('pdf.customerNumber') : 'Kundennummer'}: {data.customerNumber}
          </Text>
        )}
      </View>

      {/* Rechnungsdetails */}
      <View style={[defaultStyles.invoiceDetails, styles.invoiceDetails]}>
        <Text style={[defaultStyles.invoiceTitle, styles.invoiceTitle]}>
          {data.mode === 'MM' ? 
            (t ? t('pdf.invoice') : 'Rechnung') : 
            (t ? t('pdf.financialInvoice') : 'Finanzrechnung')}
        </Text>
        
        <View style={defaultStyles.detailRow}>
          <Text style={defaultStyles.detailLabel}>
            {t ? t('pdf.invoiceNumber') : 'Rechnungsnr.'}:
          </Text>
          <Text style={defaultStyles.detailValue}>{data.invoiceNumber}</Text>
        </View>
        
        <View style={defaultStyles.detailRow}>
          <Text style={defaultStyles.detailLabel}>
            {t ? t('pdf.invoiceDate') : 'Rechnungsdatum'}:
          </Text>
          <Text style={defaultStyles.detailValue}>{formatDate(data.invoiceDate)}</Text>
        </View>
        
        {data.mode === 'MM' && data.orderNumber && (
          <View style={defaultStyles.detailRow}>
            <Text style={defaultStyles.detailLabel}>
              {t ? t('pdf.orderNumber') : 'Bestellnr.'}:
            </Text>
            <Text style={defaultStyles.detailValue}>
              {data.order?.cponumber || data.orderNumber}
            </Text>
          </View>
        )}
        
        {data.mode === 'MM' && data.orderDate && (
          <View style={defaultStyles.detailRow}>
            <Text style={defaultStyles.detailLabel}>
              {t ? t('pdf.orderDate') : 'Bestelldatum'}:
            </Text>
            <Text style={defaultStyles.detailValue}>{formatDate(data.orderDate)}</Text>
          </View>
        )}
        
        {data.mode === 'MM' && data.deliveryNoteNumber && (
          <View style={defaultStyles.detailRow}>
            <Text style={defaultStyles.detailLabel}>
              {t ? t('pdf.deliveryNoteNumber') : 'Lieferscheinnr.'}:
            </Text>
            <Text style={defaultStyles.detailValue}>
              {data.deliveryNote?.cdnnumberexternal || data.deliveryNoteNumber}
            </Text>
          </View>
        )}
        
        {data.mode === 'MM' && data.deliveryDate && (
          <View style={defaultStyles.detailRow}>
            <Text style={defaultStyles.detailLabel}>
              {t ? t('pdf.deliveryDate') : 'Lieferdatum'}:
            </Text>
            <Text style={defaultStyles.detailValue}>{formatDate(data.deliveryDate)}</Text>
          </View>
        )}
        
        {data.processor && (
          <View style={defaultStyles.detailRow}>
            <Text style={defaultStyles.detailLabel}>
              {t ? t('pdf.processor') : 'Sachbearbeiter'}:
            </Text>
            <Text style={defaultStyles.detailValue}>{data.processor}</Text>
          </View>
        )}
        
        {data.vendor?.cvatnumber && (
          <View style={defaultStyles.detailRow}>
            <Text style={defaultStyles.detailLabel}>
              {t ? t('pdf.contactVatId') : 'USt-ID'}:
            </Text>
            <Text style={defaultStyles.detailValue}>{data.vendor.cvatnumber}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  recipientSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  recipientInfo: {
    width: '50%',
  },
  recipientTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  recipientName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  recipientDetail: {
    fontSize: 10,
    marginBottom: 2,
  },
  customerNumber: {
    fontSize: 10,
    marginTop: 5,
    fontWeight: 'bold',
  },
  invoiceDetails: {
    width: '40%',
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
});

export default BillingInfo; 
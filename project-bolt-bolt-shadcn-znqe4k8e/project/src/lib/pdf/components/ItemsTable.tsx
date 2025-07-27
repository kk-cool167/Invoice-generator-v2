import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { PDFGeneratorOptions } from '../../pdfTypes';

interface ItemsTableProps {
  data: PDFGeneratorOptions;
  styles: any;
  t?: (key: string) => string;
}

/**
 * Formatiert einen Geldbetrag mit Währungssymbol
 */
const formatCurrency = (amount: number, currency: string = 'EUR') => {
  // 根据货币类型选择合适的区域设置
  const locale = currency === 'GBP' ? 'en-GB' : 'de-DE';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Wiederverwendbare Komponente für die Artikeltabelle in PDF-Dokumenten
 */
export const ItemsTable: React.FC<ItemsTableProps> = ({ data, styles, t }) => {
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
  
  // 确保所有项目都有必要的数据
  const validItems = data.items.filter(item => item.description || item.quantity);
  
  const subtotal = validItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const vatAmount = validItems.reduce((sum, item) => sum + (item.quantity * item.price * item.taxRate / 100), 0);
  const total = subtotal + vatAmount;

  return (
    <View style={styles.table}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCellHeader, styles.colDescription]}>
          {t ? t('pdf.description') : 'Beschreibung'}
        </Text>
        <Text style={[styles.tableCellHeader, styles.colQuantity]}>
          {t ? t('pdf.quantity') : 'Menge'}
        </Text>
        <Text style={[styles.tableCellHeader, styles.colUnit]}>
          {t ? t('pdf.unit') : 'Einheit'}
        </Text>
        <Text style={[styles.tableCellHeader, styles.colPrice]}>
          {t ? t('pdf.price') : 'Preis'}
        </Text>
        <Text style={[styles.tableCellHeader, styles.colTotal]}>
          {t ? t('pdf.total') : 'Gesamt'}
        </Text>
      </View>

      {/* Table Rows */}
      {data.items.map((item, index) => {
        // 确保项目有效
        if (!item || (!item.description && !item.quantity)) return null;
        
        return (
          <View 
            key={index} 
            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}
          >
            <Text style={[styles.tableCell, styles.colDescription]}>
              {item.description || (t ? t('pdf.noDescription') : 'Ohne Beschreibung')}
            </Text>
            <Text style={[styles.tableCell, styles.colQuantity]}>
              {item.quantity || 0}
            </Text>
            <Text style={[styles.tableCell, styles.colUnit]}>
              {item.unit || '-'}
            </Text>
            <Text style={[styles.tableCellBold, styles.colPrice]}>
              {formatCurrency(item.price || 0, currency)}
            </Text>
            <Text style={[styles.tableCellBold, styles.colTotal]}>
              {formatCurrency((item.quantity || 0) * (item.price || 0), currency)}
            </Text>
          </View>
        );
      }).filter(Boolean)}

      {/* Totals Section */}
      <View style={styles.summarySection}>
        <View style={styles.summaryTable}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t ? t('pdf.subtotal') : 'Zwischensumme'}
            </Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(subtotal, currency)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t ? t('pdf.vat') : 'MwSt'} {validItems[0]?.taxRate || 19}%:
            </Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(vatAmount, currency)}
            </Text>
          </View>
          
          <View style={styles.summaryRowTotal}>
            <Text style={styles.summaryTotal}>
              {t ? t('pdf.totalAmount') : 'Gesamtbetrag'}
            </Text>
            <Text style={styles.summaryTotal}>
              {formatCurrency(total, currency)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ItemsTable; 
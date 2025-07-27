import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { PDFGeneratorOptions } from '../../pdfTypes';

interface FooterProps {
  data: PDFGeneratorOptions;
  styles?: any;
  t?: (key: string) => string;
  currentPage?: number;
  totalPages?: number;
}

/**
 * Wiederverwendbare Footer-Komponente für PDF-Dokumente
 * Zeigt Kontaktdaten, Zahlungsinformationen und Seitenzahlen an
 */
export const Footer: React.FC<FooterProps> = ({ 
  data, 
  styles = {},
  t,
  currentPage = 1,
  totalPages = 1,
}) => (
  <View style={[defaultStyles.footer, styles.footer]} fixed>
    <View style={defaultStyles.footerContent}>
      <View style={defaultStyles.leftSection}>
        {data.vendor?.cemail && (
          <Text style={defaultStyles.footerText}>
            {t ? t('pdf.contactEmail') : 'E-Mail'}: {data.vendor.cemail}
          </Text>
        )}
        {data.vendor?.cphone && (
          <Text style={defaultStyles.footerText}>
            {t ? t('pdf.contactPhone') : 'Tel'}: {data.vendor.cphone}
          </Text>
        )}
        {data.vendor?.cfax && (
          <Text style={defaultStyles.footerText}>
            Fax: {data.vendor.cfax}
          </Text>
        )}
      </View>
      
      <View style={defaultStyles.middleSection}>
        {data.vendor?.ciban && (
          <Text style={defaultStyles.footerText}>
            IBAN: {data.vendor.ciban}
          </Text>
        )}
        {data.vendor?.cbic && (
          <Text style={defaultStyles.footerText}>
            BIC: {data.vendor.cbic}
          </Text>
        )}
        {data.vendor?.cbankname && (
          <Text style={defaultStyles.footerText}>
            Bank: {data.vendor.cbankname}
          </Text>
        )}
      </View>
      
      <View style={defaultStyles.rightSection}>
        <Text style={defaultStyles.pageNumber}>
          {t ? 'Page' : 'Seite'} {currentPage} {t ? 'of' : 'von'} {totalPages}
        </Text>
      </View>
    </View>
    
    <Text style={defaultStyles.footerNote}>
      {t ? 'Document created with Invoice Generator' : 'Dokument erstellt mit Invoice Generator'}
    </Text>
  </View>
);

const defaultStyles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 2,
  },
  pageNumber: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 2,
  },
  footerNote: {
    fontSize: 8,
    color: '#999999',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Footer; 
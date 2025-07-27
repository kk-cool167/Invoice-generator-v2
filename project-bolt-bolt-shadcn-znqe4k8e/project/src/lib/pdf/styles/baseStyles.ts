import { StyleSheet } from '@react-pdf/renderer';

/**
 * Gemeinsame Basis-Stile für alle PDF-Templates
 * Eliminiert Code-Duplikation und sorgt für Konsistenz
 */

// Design-Token für einheitliche Werte
export const designTokens = {
  // Abstände
  spacing: {
    xs: 4,
    sm: 8,
    md: 15,
    lg: 20,
    xl: 30,
    xxl: 40,
  },
  
  // Schriftgrößen
  fontSize: {
    xs: 8,
    sm: 9,
    md: 10,
    lg: 11,
    xl: 12,
    xxl: 14,
    xxxl: 16,
    giant: 18,
    mega: 20,
  },
  
  // Farben
  colors: {
    black: '#000000',
    white: '#FFFFFF',
    gray: {
      50: '#FAFAFA',
      100: '#F6F6F6',
      200: '#EEEEEE',
      300: '#E5E7EB',
      400: '#D1D5DB',
      500: '#9CA3AF',
      600: '#6B7280',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      muted: '#999999',
    }
  },
  
  // Spaltenbreiten (standardisiert)
  columnWidths: {
    description: '40%',
    quantity: '15%',
    price: '15%',
    tax: '15%',
    total: '15%',
    summaryLabel: '25%',
    summaryValue: '15%',
  },
  
  // Border-Radien
  borderRadius: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
  },
};

// Basis-Stile die von allen Templates verwendet werden
export const baseStyles = StyleSheet.create({
  // Layout-Grundlagen
  page: {
    backgroundColor: designTokens.colors.white,
  },
  
  // Flexbox-Layouts
  flexRow: {
    flexDirection: 'row',
  },
  
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  flexRowEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  
  // Text-Ausrichtung
  textRight: {
    textAlign: 'right',
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  // Standard-Spaltenbreiten für Tabellen
  col1: { width: designTokens.columnWidths.description },
  col2: { width: designTokens.columnWidths.quantity },
  col3: { width: designTokens.columnWidths.price },
  col4: { width: designTokens.columnWidths.tax },
  col5: { 
    width: designTokens.columnWidths.total, 
    textAlign: 'right' 
  },
  
  // Empfängerbereich (standardisiert)
  recipientSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: designTokens.spacing.xl,
  },
  
  recipientInfo: {
    width: '50%',
  },
  
  invoiceDetails: {
    width: '40%',
  },
  
  // Detail-Zeilen
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: designTokens.spacing.xs,
  },
  
  // Tabellen-Basis
  table: {
    marginVertical: designTokens.spacing.lg,
  },
  
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
  },
  
  tableRow: {
    flexDirection: 'row',
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
  },
  
  // Summen-Bereich
  summarySection: {
    marginTop: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.sm,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: designTokens.spacing.xs,
  },
  
  summaryLabel: {
    width: designTokens.columnWidths.summaryLabel,
    textAlign: 'right',
    paddingRight: designTokens.spacing.sm,
  },
  
  summaryValue: {
    width: designTokens.columnWidths.summaryValue,
    textAlign: 'right',
  },
  
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: designTokens.spacing.sm,
    paddingTop: designTokens.spacing.sm,
  },
  
  totalLabel: {
    width: designTokens.columnWidths.summaryLabel,
    textAlign: 'right',
    paddingRight: designTokens.spacing.sm,
  },
  
  totalValue: {
    width: designTokens.columnWidths.summaryValue,
    textAlign: 'right',
  },
  
  // Footer-Basis
  footer: {
    paddingTop: designTokens.spacing.md,
    marginTop: designTokens.spacing.xl,
  },
});

// Utility-Funktionen für Theme-spezifische Stile
export const createThemeStyles = (theme: {
  primaryColor: string;
  accentColor?: string;
  fontFamily: string;
  headerBorderColor?: string;
  tableBorderColor?: string;
}) => {
  return StyleSheet.create({
    document: {
      fontFamily: theme.fontFamily,
      fontSize: designTokens.fontSize.md,
      color: designTokens.colors.text.primary,
    },
    
    companyName: {
      color: theme.primaryColor,
      fontWeight: 'bold',
    },
    
    recipientTitle: {
      color: theme.primaryColor,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    
    invoiceTitle: {
      color: theme.primaryColor,
      fontWeight: 'bold',
      textAlign: 'right',
    },
    
    tableHeader: {
      ...baseStyles.tableHeader,
      backgroundColor: theme.accentColor || theme.primaryColor,
      color: designTokens.colors.white,
    },
    
    totalLabel: {
      ...baseStyles.totalLabel,
      color: theme.primaryColor,
      fontWeight: 'bold',
    },
    
    totalValue: {
      ...baseStyles.totalValue,
      color: theme.primaryColor,
      fontWeight: 'bold',
    },
  });
}; 
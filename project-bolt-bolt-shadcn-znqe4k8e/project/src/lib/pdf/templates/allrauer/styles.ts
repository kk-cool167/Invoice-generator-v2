import { StyleSheet } from '@react-pdf/renderer';

/**
 * Allrauer Template Styles
 * Einfaches, klassisches Format wie im ursprünglichen Allrauer-Design
 */
const styles = StyleSheet.create({
  document: {
    fontFamily: 'Helvetica',
  },
  
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 25,
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 25,
    lineHeight: 1.3,
  },

  // Header Section (deutsche Standards)
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  
  companyInfo: {
    flex: 1,
  },
  
  companyHeader: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 20,
  },
  
  recipientName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  
  recipientAddress: {
    fontSize: 10,
    marginBottom: 2,
    lineHeight: 1.2,
  },
  
  logoContainer: {
    width: 320,
    height: 70,
    marginLeft: 25,
  },
  
  logo: {
    width: 300,
    height: 60,
    objectFit: 'contain',
  },

  spacer: {
    height: 10,
  },

  // Invoice Title (deutsche Standards)
  invoiceTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
    marginTop: 15,
  },

  // Invoice Details Section (deutsche Formatierung)
  invoiceDetailsSection: {
    flexDirection: 'row',
    marginBottom: 25,
    fontSize: 10,
  },
  
  detailsLeft: {
    flex: 1,
    marginRight: 30,
  },
  
  detailsRight: {
    flex: 1,
  },
  
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  
  detailLabel: {
    width: 110,
    fontSize: 10,
  },
  
  detailValue: {
    fontSize: 10,
    fontFamily: 'Helvetica',
  },

  // Items Table (deutsche Standards)
  itemsTable: {
    marginBottom: 20,
    border: '1pt solid black',
  },
  
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottom: '1pt solid black',
  },
  
  tableHeaderCell: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    minHeight: 20,
  },
  
  tableCell: {
    fontSize: 9,
    paddingHorizontal: 3,
    lineHeight: 1.2,
  },

  // Pre-table text (deutsche Standards)
  preTableText: {
    marginBottom: 20,
    fontSize: 9,
    lineHeight: 1.3,
  },
  
  preTableLine: {
    marginBottom: 3,
  },
  
  preTableLineBold: {
    marginBottom: 3,
    fontSize: 9,
    color: '#000000',
    fontFamily: 'Helvetica-Bold',
  },

  // Column widths for items table
  colBezeichnung: { width: '35%' },
  colMenge: { width: '10%', textAlign: 'center' },
  colEinheit: { width: '10%', textAlign: 'center' },
  colSatz: { width: '10%', textAlign: 'center' },
  colEinzelpreis: { width: '15%', textAlign: 'right' },
  colGesamtpreis: { width: '20%', textAlign: 'right' },

  // Umsatz Table (deutsche Standards)
  totalsTable: {
    marginBottom: 8,
    border: '1pt solid black',
    width: '100%',
  },
  
  totalsHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottom: '1pt solid black',
  },
  
  totalsHeaderCell: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  
  totalsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    minHeight: 18,
  },
  
  totalsCell: {
    fontSize: 9,
    textAlign: 'center',
  },

  // Gesamt Table (deutsche Standards)
  gesamtTable: {
    marginBottom: 25,
    border: '1pt solid black',
    width: '100%',
  },
  
  gesamtRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  
  gesamtCell: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  
  // Spezielle Formatierung für Endbetrag (deutsche Standards)
  gesamtCellBetrag: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },

  // Column widths for totals tables (mit leerer erster Spalte)
  colEmpty: { width: '20%' },
  colNetto: { width: '20%' },
  colMwStSatz: { width: '20%' },
  colMwSt: { width: '20%' },
  colBrutto: { width: '20%' },
  
  // For gesamt table
  colGesamtLabel: { width: '20%' },
  colGesamtNetto: { width: '20%' },
  colGesamtMwStSatz: { width: '20%' },
  colGesamtMwSt: { width: '20%' },
  colGesamtBrutto: { width: '20%' },

  // Payment Section (deutsche Standards)
  paymentSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 25,
    fontSize: 9,
    lineHeight: 1.4,
  },
  
  paymentText: {
    fontSize: 9,
    marginHorizontal: 2,
  },
  
  paymentAmount: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    marginHorizontal: 2,
  },

  // Payment Note (alte Version - falls noch verwendet)
  paymentNote: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  
  bold: {
    fontWeight: 'bold',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 25,
    right: 25,
    fontSize: 7,
    color: '#666666',
  },
  
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  footerColumn: {
    flex: 1,
    marginRight: 10,
  },
  
  footerText: {
    fontSize: 7,
    marginBottom: 2,
  },
});

export default styles; 
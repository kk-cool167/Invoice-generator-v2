import { StyleSheet } from '@react-pdf/renderer';

/**
 * Business Green Template Styles
 * Kompaktes Design für einseitige Rechnungen mit grünen Akzentfarben - optimiert für mehr Items pro Seite
 */

const styles = StyleSheet.create({
  // === DOCUMENT & PAGE ===
  document: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1a1a1a',
  },
  
  page: {
    paddingTop: 18,
    paddingLeft: 18,
    paddingRight: 15,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    lineHeight: 1.3,
  },

  // === HEADER SECTION ===
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '2px solid #059669',
  },
  
  companyInfo: {
    flex: 1,
    maxWidth: '60%',
  },
  
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 6,
  },
  
  companyDetails: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.3,
  },
  
  logo: {
    width: 300,
    height: 60,
    objectFit: 'contain',
    marginLeft: 15,
  },

  // === BILLING SECTION ===
  billingSection: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 15,
  },
  
  billingInfo: {
    flex: 1,
  },
  
  recipientTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  
  recipientDetails: {
    fontSize: 9,
    lineHeight: 1.3,
    color: '#333333',
  },
  
  invoiceDetails: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    border: '1px solid #BBF7D0',
  },
  
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  
  detailLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: 'medium',
  },
  
  detailValue: {
    fontSize: 9,
    color: '#1E293B',
    fontWeight: 'bold',
  },

  // === BUSINESS GREEN SPECIFIC STYLES ===
  allrauerContact: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    marginBottom: 10,
    borderRadius: 6,
    border: '1px solid #BBF7D0',
  },
  
  allrauerContactItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  
  allrauerContactLabel: {
    fontSize: 8,
    color: '#059669',
    fontWeight: 'bold',
    width: 40,
  },
  
  allrauerContactValue: {
    fontSize: 8,
    color: '#374151',
    flex: 1,
  },
  
  allrauerBanner: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: '1px solid #BBF7D0',
  },
  
  allrauerBannerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 6,
  },
  
  allrauerBannerText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.3,
    marginBottom: 4,
  },

  // === TABLE SECTION ===
  table: {
    marginBottom: 12,
    border: '1px solid #D1D5DB',
    borderRadius: 6,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#059669',
    padding: 6,
  },
  
  tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottom: '1px solid #F3F4F6',
    minHeight: 18,
    alignItems: 'center',
  },
  
  tableRowAlternate: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #F3F4F6',
    minHeight: 18,
    alignItems: 'center',
  },
  
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  
  tableCell: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.2,
  },
  
  tableCellBold: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  // === COLUMN WIDTHS ===
  colDescription: { 
    width: '45%',
    paddingRight: 6,
  },
  colQuantity: { 
    width: '10%', 
    textAlign: 'center',
    paddingRight: 3,
  },
  colUnit: { 
    width: '10%', 
    textAlign: 'center',
    paddingRight: 3,
  },
  colPrice: { 
    width: '15%', 
    textAlign: 'right',
    paddingRight: 3,
  },
  colTotal: { 
    width: '20%', 
    textAlign: 'right',
  },

  // === SUMMARY SECTION ===
  summarySection: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  
  summaryTable: {
    width: '45%',
    border: '1px solid #D1D5DB',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    borderBottom: '1px solid #F3F4F6',
  },
  
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    backgroundColor: '#059669',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  
  summaryLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: 'medium',
  },
  
  summaryValue: {
    fontSize: 8,
    color: '#1E293B',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  
  summaryTotal: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // === FOOTER SECTION ===
  footer: {
    marginTop: 8,
    paddingTop: 6,
    borderTop: '1px solid #D1D5DB',
    fontSize: 7,
    color: '#64748B',
    lineHeight: 1.2,
  },
  
  paymentTerms: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#ECFDF5',
    borderLeft: '4px solid #059669',
    borderRadius: 4,
  },
  
  paymentTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  
  paymentText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.3,
  },

  // === UTILITY STYLES ===
  textCenter: {
    textAlign: 'center',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  textBold: {
    fontWeight: 'bold',
  },
  
  mb1: {
    marginBottom: 4,
  },
  
  mb2: {
    marginBottom: 8,
  },
  
  mb3: {
    marginBottom: 12,
  },
});

export default styles; 
import { StyleSheet } from '@react-pdf/renderer';

/**
 * Professional PDF-Template - Geschäftliches, professionelles Design
 * Einheitliches kompaktes Design für alle Sprachen - optimiert für mehr Items pro Seite
 */

const styles = StyleSheet.create({
  // === DOCUMENT & PAGE ===
  document: {
    fontFamily: 'Helvetica',
    fontSize: 9,         // Reduziert von 10 auf 9
    color: '#1a1a1a',
  },
  
  page: {
    paddingTop: 18,      // Reduziert von 25 auf 18
    paddingLeft: 18,     // Reduziert von 25 auf 18
    paddingRight: 18,    // Reduziert von 25 auf 18
    paddingBottom: 12,   // Reduziert von 20 auf 12
    backgroundColor: '#FFFFFF',
    lineHeight: 1.2,     // Reduziert von 1.3 auf 1.2
  },

  // === HEADER SECTION ===
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,     // Reduziert von 12 auf 8
    paddingBottom: 6,    // Reduziert von 8 auf 6
    borderBottom: '1px solid #D1D5DB',
  },
  
  companyInfo: {
    flex: 1,
    maxWidth: '65%',
  },
  
  companyName: {
    fontSize: 18,        // Reduziert von 24 auf 18
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 6,     // Reduziert von 8 auf 6
    letterSpacing: 0.5,
  },
  
  companyDetails: {
    fontSize: 9,         // Reduziert von 10 auf 9
    color: '#666666',
    lineHeight: 1.4,     // Reduziert von 1.6 auf 1.4
  },
  
  logo: {
    width: 300,          // Optimiert für rechteckige Logos
    height: 60,          // Optimiert für rechteckige Logos
    objectFit: 'contain',
    marginLeft: 15,      // Reduziert von 20 auf 15
  },

  // === BILLING SECTION ===
  billingSection: {
    flexDirection: 'row',
    marginBottom: 10,    // Reduziert von 15 auf 10
    gap: 15,             // Reduziert von 25 auf 15
  },
  
  billingInfo: {
    flex: 1,
  },
  
  recipientTitle: {
    fontSize: 10,        // Reduziert von 11 auf 10
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 6,     // Reduziert von 8 auf 6
    letterSpacing: 0.5,
  },
  
  recipientDetails: {
    fontSize: 9,         // Reduziert von 11 auf 9
    lineHeight: 1.4,     // Reduziert von 1.6 auf 1.4
    color: '#333333',
  },
  
  invoiceDetails: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,         // Reduziert von 20 auf 12
    borderRadius: 8,
    border: '1px solid #E5E7EB',
  },
  
  invoiceTitle: {
    fontSize: 14,        // Reduziert von 20 auf 14
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,     // Reduziert von 15 auf 8
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,     // Reduziert von 8 auf 5
    alignItems: 'center',
  },
  
  detailLabel: {
    fontSize: 9,         // Reduziert von 10 auf 9
    color: '#64748B',
    width: '50%',
  },
  
  detailValue: {
    fontSize: 9,         // Reduziert von 11 auf 9
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'right',
    width: '50%',
  },

  // === TABLE SECTION ===
  table: {
    marginBottom: 10,    // Reduziert von 15 auf 10
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E3A8A',
    padding: 8,          // Reduziert von 12 auf 8
  },
  
  tableRow: {
    flexDirection: 'row',
    padding: 4,          // Reduziert von 6 auf 4
    borderBottom: '1px solid #E5E7EB',
    minHeight: 18,       // Reduziert von 24 auf 18
    alignItems: 'center',
  },
  
  tableRowAlternate: {
    flexDirection: 'row',
    padding: 4,          // Reduziert von 6 auf 4
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E5E7EB',
    minHeight: 18,       // Reduziert von 24 auf 18
    alignItems: 'center',
  },
  
  tableCellHeader: {
    fontSize: 9,         // Reduziert von 10 auf 9
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  tableCell: {
    fontSize: 8,         // Reduziert von 9 auf 8
    color: '#374151',
    lineHeight: 1.2,     // Reduziert von 1.3 auf 1.2
  },
  
  tableCellBold: {
    fontSize: 8,         // Reduziert von 9 auf 8
    fontWeight: 'bold',
    color: '#1E293B',
  },

  // === COLUMN WIDTHS ===
  colDescription: { 
    width: '45%',
    paddingRight: 8,     // Reduziert von 10 auf 8
  },
  colQuantity: { 
    width: '10%', 
    textAlign: 'center',
    paddingRight: 4,     // Reduziert von 5 auf 4
  },
  colUnit: { 
    width: '10%', 
    textAlign: 'center',
    paddingRight: 4,     // Reduziert von 5 auf 4
  },
  colPrice: { 
    width: '15%', 
    textAlign: 'right',
    paddingRight: 4,     // Reduziert von 5 auf 4
  },
  colTotal: { 
    width: '20%', 
    textAlign: 'right',
  },

  // === SUMMARY SECTION ===
  summarySection: {
    marginTop: 8,        // Reduziert von 10 auf 8
    alignItems: 'flex-end',
  },
  
  summaryTable: {
    width: '45%',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,          // Reduziert auf 6
    borderBottom: '1px solid #F3F4F6',
  },
  
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,          // Reduziert auf 8
    backgroundColor: '#1E3A8A',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  
  summaryLabel: {
    fontSize: 9,         // Reduziert auf 9
    color: '#64748B',
    fontWeight: 'medium',
  },
  
  summaryValue: {
    fontSize: 9,         // Reduziert auf 9
    color: '#1E293B',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  
  summaryTotal: {
    fontSize: 10,        // Reduziert auf 10
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // === FOOTER SECTION ===
  footer: {
    marginTop: 8,        // Reduziert auf 8
    paddingTop: 6,       // Reduziert auf 6
    borderTop: '1px solid #E5E7EB',
    fontSize: 7,         // Reduziert auf 7
    color: '#64748B',
    lineHeight: 1.2,     // Reduziert auf 1.2
  },
  
  paymentTerms: {
    marginTop: 10,       // Reduziert auf 10
    padding: 8,          // Reduziert auf 8
    backgroundColor: '#EFF6FF',
    borderLeft: '4px solid #1E3A8A',
    borderRadius: 4,
  },
  
  paymentTitle: {
    fontSize: 10,        // Reduziert auf 10
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 5,     // Reduziert auf 5
  },
  
  paymentText: {
    fontSize: 9,         // Reduziert auf 9
    color: '#475569',
    lineHeight: 1.4,
  },

  // Professional-spezifische Komponenten
  professionalBox: {
    marginTop: 12,       // Reduziert auf 12
    padding: 8,          // Reduziert auf 8
    backgroundColor: '#EFF6FF',
    borderLeft: '4px solid #1E3A8A',
    borderRadius: 4,
  },
  
  professionalBoxTitle: {
    fontSize: 10,        // Reduziert auf 10
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,     // Reduziert auf 4
  },
  
  professionalBoxText: {
    fontSize: 9,         // Reduziert auf 9
    color: '#475569',
    lineHeight: 1.3,     // Reduziert auf 1.3
    marginBottom: 3,     // Reduziert auf 3
  },
});

export default styles; 
import { StyleSheet } from '@react-pdf/renderer';

/**
 * Classic PDF-Template - Traditionelles, zeitloses Design
 * Einheitliches kompaktes Design für alle Sprachen - optimiert für mehr Items pro Seite
 */

const styles = StyleSheet.create({
  // === DOCUMENT & PAGE ===
  document: {
    fontFamily: 'Times-Roman',
    fontSize: 9,         // Reduziert von 10 auf 9
    color: '#1a1a1a',
  },
  
  page: {
    paddingTop: 12,      // Reduziert von 15 auf 12
    paddingLeft: 12,     // Reduziert von 15 auf 12
    paddingRight: 12,    // Reduziert von 15 auf 12
    paddingBottom: 8,    // Reduziert von 10 auf 8
    backgroundColor: '#FFFFFF',
    lineHeight: 1.1,     // Reduziert von 1.2 auf 1.1
  },

  // === HEADER SECTION ===
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,     // Reduziert von 10 auf 8
    paddingBottom: 4,    // Reduziert von 5 auf 4
    borderBottom: '1px solid #000000',
  },
  
  companyInfo: {
    flex: 1,
    maxWidth: '60%',
  },
  
  companyName: {
    fontSize: 18,        // Reduziert von 20 auf 18
    fontFamily: 'Times-Bold',
    color: '#000000',
    marginBottom: 3,     // Reduziert von 4 auf 3
  },
  
  companyDetails: {
    fontSize: 8,         // Reduziert von 9 auf 8
    color: '#333333',
    lineHeight: 1.2,     // Reduziert von 1.3 auf 1.2
  },
  
  logo: {
    width: 300,          // Optimiert für rechteckige Logos
    height: 60,          // Optimiert für rechteckige Logos
    objectFit: 'contain',
    marginLeft: 12,      // Reduziert von 15 auf 12
  },

  // === BILLING SECTION ===
  billingSection: {
    flexDirection: 'row',
    marginBottom: 8,     // Reduziert von 10 auf 8
    gap: 12,             // Reduziert von 15 auf 12
  },
  
  billingInfo: {
    flex: 1,
  },
  
  recipientTitle: {
    fontSize: 10,        // Reduziert von 11 auf 10
    fontFamily: 'Times-Bold',
    color: '#000000',
    marginBottom: 6,     // Reduziert von 8 auf 6
  },
  
  recipientDetails: {
    fontSize: 9,         // Reduziert von 10 auf 9
    lineHeight: 1.3,     // Reduziert von 1.5 auf 1.3
    color: '#333333',
  },
  
  invoiceDetails: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    padding: 8,          // Reduziert von 10 auf 8
    border: '1px solid #CCCCCC',
  },
  
  invoiceTitle: {
    fontSize: 14,        // Reduziert von 16 auf 14
    fontFamily: 'Times-Bold',
    color: '#000000',
    marginBottom: 6,     // Reduziert von 8 auf 6
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,     // Reduziert von 4 auf 3
    alignItems: 'center',
  },
  
  detailLabel: {
    fontSize: 9,         // Reduziert von 10 auf 9
    color: '#666666',
    width: '50%',
  },
  
  detailValue: {
    fontSize: 9,         // Reduziert von 10 auf 9
    fontFamily: 'Times-Bold',
    color: '#000000',
    textAlign: 'right',
    width: '50%',
  },

  // === TABLE SECTION ===
  table: {
    marginBottom: 10,    // Reduziert von 15 auf 10
    border: '1px solid #CCCCCC',
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    padding: 4,          // Reduziert von 6 auf 4
    borderBottom: '1px solid #000000',
  },
  
  tableRow: {
    flexDirection: 'row',
    padding: 2,          // Reduziert von 3 auf 2
    borderBottom: '0.5px solid #CCCCCC',
    minHeight: 16,       // Reduziert von 18 auf 16
    alignItems: 'center',
  },
  
  tableRowAlternate: {
    flexDirection: 'row',
    padding: 2,          // Reduziert von 3 auf 2
    backgroundColor: '#FAFAFA',
    borderBottom: '0.5px solid #CCCCCC',
    minHeight: 16,       // Reduziert von 18 auf 16
    alignItems: 'center',
  },
  
  tableCellHeader: {
    fontSize: 9,         // Reduziert von 10 auf 9
    fontFamily: 'Times-Bold',
    color: '#000000',
  },
  
  tableCell: {
    fontSize: 8,         // Reduziert von 9 auf 8
    color: '#333333',
    lineHeight: 1.2,     // Reduziert von 1.3 auf 1.2
  },
  
  tableCellBold: {
    fontSize: 8,         // Reduziert von 9 auf 8
    fontFamily: 'Times-Bold',
    color: '#000000',
  },

  // === COLUMN WIDTHS ===
  colDescription: { 
    width: '45%',
    paddingRight: 6,     // Reduziert von 8 auf 6
  },
  colQuantity: { 
    width: '10%', 
    textAlign: 'center',
    paddingRight: 3,     // Reduziert von 4 auf 3
  },
  colUnit: { 
    width: '10%', 
    textAlign: 'center',
    paddingRight: 3,     // Reduziert von 4 auf 3
  },
  colPrice: { 
    width: '15%', 
    textAlign: 'right',
    paddingRight: 3,     // Reduziert von 4 auf 3
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
    border: '1px solid #CCCCCC',
    backgroundColor: '#FFFFFF',
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,          // Reduziert von 6 auf 4
    borderBottom: '0.5px solid #CCCCCC',
  },
  
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,          // Reduziert von 8 auf 6
    backgroundColor: '#EEEEEE',
    borderBottom: '1px solid #000000',
  },
  
  summaryLabel: {
    fontSize: 9,         // Reduziert von 10 auf 9
    color: '#666666',
  },
  
  summaryValue: {
    fontSize: 9,         // Reduziert von 10 auf 9
    color: '#333333',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  
  summaryTotal: {
    fontSize: 10,        // Reduziert von 11 auf 10
    fontFamily: 'Times-Bold',
    color: '#000000',
  },

  // === FOOTER SECTION ===
  footer: {
    marginTop: 6,        // Reduziert von 8 auf 6
    paddingTop: 3,       // Reduziert von 4 auf 3
    borderTop: '1px solid #000000',
    fontSize: 7,         // Bleibt bei 7
    color: '#666666',
    lineHeight: 1.1,     // Reduziert von 1.2 auf 1.1
  },
  
  paymentTerms: {
    marginTop: 4,        // Reduziert von 5 auf 4
    padding: 4,          // Reduziert von 5 auf 4
    backgroundColor: '#F5F5F5',
    border: '0.5px solid #CCCCCC',
  },
  
  paymentTitle: {
    fontSize: 10,        // Reduziert von 11 auf 10
    fontFamily: 'Times-Bold',
    color: '#000000',
    marginBottom: 4,     // Reduziert von 6 auf 4
  },
  
  paymentText: {
    fontSize: 8,         // Reduziert von 9 auf 8
    color: '#333333',
    lineHeight: 1.3,     // Reduziert von 1.4 auf 1.3
  },

  // Classic-spezifische Komponenten
  classicBox: {
    marginTop: 15,       // Reduziert von 25 auf 15
    padding: 10,         // Reduziert von 15 auf 10
    border: '0.5px solid #CCCCCC',
  },
  
  classicBoxTitle: {
    fontSize: 10,        // Reduziert von 11 auf 10
    fontFamily: 'Times-Bold',
    marginBottom: 4,     // Reduziert von 6 auf 4
  },
  
  classicBoxText: {
    fontSize: 9,         // Reduziert von 10 auf 9
    lineHeight: 1.3,     // Reduziert von 1.4 auf 1.3
    marginBottom: 3,     // Reduziert von 4 auf 3
  },
  
  classicNote: {
    fontSize: 7,         // Reduziert von 8 auf 7
    fontFamily: 'Times-Italic',
    color: '#666666',
    marginTop: 10,       // Reduziert von 15 auf 10
    paddingTop: 6,       // Reduziert von 8 auf 6
    borderTop: '0.5px dashed #CCCCCC',
  },
  
  classicSign: {
    marginTop: 20,       // Reduziert von 30 auf 20
    paddingTop: 10,      // Reduziert von 15 auf 10
    borderTop: '0.5px solid #CCCCCC',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  
  classicSignLine: {
    width: 120,          // Reduziert von 150 auf 120
    borderBottom: '0.5px solid #000000',
  },
  
  classicSignText: {
    fontSize: 7,         // Reduziert von 8 auf 7
    color: '#666666',
    marginTop: 4,        // Reduziert von 5 auf 4
    textAlign: 'center',
  },
});

export default styles; 
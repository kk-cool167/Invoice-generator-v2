import { StyleSheet } from '@react-pdf/renderer';

/**
 * Business Standard Rechnungsstyles
 * Klassischer, sachlicher Geschäftsstil - optimiert für 4+ Items pro Seite
 * Professionell und konservativ, typisch für deutsche Geschäftsbriefe
 */

const styles = StyleSheet.create({
  // === DOCUMENT & PAGE ===
  document: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000000',
  },
  
  page: {
    paddingTop: 20,
    paddingLeft: 25,
    paddingRight: 20,
    paddingBottom: 20, // Minimaler Platz für Seitenende
    backgroundColor: '#FFFFFF',
    lineHeight: 1.2,
  },

  // === BRIEFKOPF (Header) ===
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '1px solid #000000',
    minHeight: 70,
  },
  
  companyInfo: {
    flex: 1,
    alignSelf: 'flex-start',
    paddingRight: 20,
  },
  
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  
  companyAddress: {
    fontSize: 9,
    color: '#000000',
    lineHeight: 1.3,
  },
  
  logoContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 10,
  },

  logo: {
    width: 240,
    height: 50,
    objectFit: 'contain',
  },

  // === ANSCHRIFTENFELD ===
  addressSection: {
    marginBottom: 10,
    width: '60%',
  },

  returnAddress: {
    fontSize: 7,
    color: '#666666',
    borderBottom: '0.5px solid #CCCCCC',
    paddingBottom: 2,
    marginBottom: 5,
  },

  recipientAddress: {
    marginTop: 5,
  },

  recipientName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 3,
  },

  recipientText: {
    fontSize: 10,
    color: '#000000',
    lineHeight: 1.3,
  },

  // === DATUM ===
  dateSection: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },

  dateText: {
    fontSize: 10,
    color: '#000000',
  },

  // === BETREFF ===
  subjectSection: {
    marginBottom: 10,
  },

  subjectText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },

  // === ANREDE ===
  salutationSection: {
    marginBottom: 10,
  },

  salutationText: {
    fontSize: 10,
    color: '#000000',
    marginBottom: 8,
  },

  introText: {
    fontSize: 10,
    color: '#000000',
    lineHeight: 1.4,
  },

  // === HAUPTINHALT ===
  mainContent: {
    marginBottom: 10,
  },

  // === RECHNUNGSDETAILS ===
  invoiceDetails: {
    marginBottom: 10,
    backgroundColor: '#F8F8F8',
    padding: 8,
    border: '1px solid #DDDDDD',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },

  detailLabel: {
    fontSize: 9,
    color: '#333333',
    width: '50%',
  },

  detailValue: {
    fontSize: 9,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'right',
    width: '50%',
  },

  // === LEISTUNGSTABELLE ===
  itemsTable: {
    marginBottom: 10,
    border: '1px solid #000000',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    padding: 8,
    borderBottom: '1px solid #000000',
  },

  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000000',
  },

  tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottom: '0.5px solid #CCCCCC',
    minHeight: 16,
    alignItems: 'center',
  },

  tableCell: {
    fontSize: 9,
    color: '#000000',
    lineHeight: 1.2,
  },

  // === SPALTENBREITEN ===
  colPos: { 
    width: '8%',
    textAlign: 'center',
  },
  colDescription: { 
    width: '42%',
    paddingRight: 4,
  },
  colQuantity: { 
    width: '10%', 
    textAlign: 'center',
  },
  colUnit: { 
    width: '10%', 
    textAlign: 'center',
  },
  colPrice: { 
    width: '15%', 
    textAlign: 'right',
  },
  colTotal: { 
    width: '15%', 
    textAlign: 'right',
    fontWeight: 'bold',
  },

  // === SUMMENTABELLE ===
  summarySection: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },

  summaryTable: {
    width: '50%',
    border: '1px solid #000000',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    borderBottom: '0.5px solid #CCCCCC',
  },

  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#E8E8E8',
    borderBottom: '1px solid #000000',
  },

  summaryLabel: {
    fontSize: 9,
    color: '#333333',
  },

  summaryValue: {
    fontSize: 9,
    color: '#000000',
    fontWeight: 'bold',
  },

  summaryLabelTotal: {
    fontSize: 10,
    color: '#000000',
    fontWeight: 'bold',
  },

  summaryValueTotal: {
    fontSize: 11,
    color: '#000000',
    fontWeight: 'bold',
  },

  // === ZAHLUNGSHINWEISE ===
  paymentInfo: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#F5F5F5',
    border: '1px solid #DDDDDD',
  },

  paymentText: {
    fontSize: 9,
    color: '#000000',
    lineHeight: 1.4,
    marginBottom: 4,
  },

  // === GRUSSFORMEL ===
  closingSection: {
    marginBottom: 10,
  },

  closingText: {
    fontSize: 10,
    color: '#000000',
    marginBottom: 20,
  },

  companyNameClosing: {
    fontSize: 10,
    color: '#000000',
  },

  // === FUSSZEILE - AM SEITENENDE ===
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 8,
    borderTop: '1px solid #000000',
    fontSize: 8,
  },

  footerSection: {
    flex: 1,
    marginRight: 12,
  },

  footerHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  footerText: {
    fontSize: 7,
    color: '#333333',
    lineHeight: 1.3,
    marginBottom: 2,
  },
});

export default styles; 
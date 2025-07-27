// Simple XML generator for invoice data
export const generateInvoiceXML = (data: any): string => {
  // Helper function to convert value to XML-safe string
  const safeValue = (value: any): string => {
    if (value === undefined || value === null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // Build XML header
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<Invoice>\n';

  // Invoice header data
  xml += '  <Header>\n';
  xml += `    <InvoiceNumber>${safeValue(data.invoiceNumber)}</InvoiceNumber>\n`;
  xml += `    <InvoiceDate>${safeValue(data.invoiceDate)}</InvoiceDate>\n`;
  xml += `    <CustomerNumber>${safeValue(data.customerNumber)}</CustomerNumber>\n`;
  
  if (data.mode === 'MM') {
    xml += `    <OrderNumber>${safeValue(data.order?.cponumber || data.orderNumber)}</OrderNumber>\n`;
    xml += `    <DeliveryNoteNumber>${safeValue(data.deliveryNote?.cdnnumberexternal || data.deliveryNoteNumber)}</DeliveryNoteNumber>\n`;
  }
  
  xml += '  </Header>\n';

  // Vendor data
  xml += '  <Vendor>\n';
  xml += `    <VendorID>${safeValue(data.vendor.cid)}</VendorID>\n`;
  xml += `    <Name>${safeValue(data.vendor.cname)}</Name>\n`;
  xml += `    <Street>${safeValue(data.vendor.cstreet)}</Street>\n`;
  xml += `    <ZIP>${safeValue(data.vendor.czip)}</ZIP>\n`;
  xml += `    <City>${safeValue(data.vendor.ccity)}</City>\n`;
  xml += `    <Country>${safeValue(data.vendor.ccountry)}</Country>\n`;
  xml += `    <VATNumber>${safeValue(data.vendor.cvatnumber)}</VATNumber>\n`;
  xml += '  </Vendor>\n';

  // Recipient data
  xml += '  <Recipient>\n';
  xml += `    <RecipientID>${safeValue(data.recipient.cid)}</RecipientID>\n`;
  xml += `    <Name>${safeValue(data.recipient.cname)}</Name>\n`;
  xml += `    <Street>${safeValue(data.recipient.cstreet)}</Street>\n`;
  xml += `    <ZIP>${safeValue(data.recipient.czip)}</ZIP>\n`;
  xml += `    <City>${safeValue(data.recipient.ccity)}</City>\n`;
  xml += `    <Country>${safeValue(data.recipient.ccountry)}</Country>\n`;
  xml += '  </Recipient>\n';

  // Items
  xml += '  <Items>\n';
  data.items.forEach((item: any, index: number) => {
    xml += '    <Item>\n';
    xml += `      <Position>${index + 1}</Position>\n`;
    xml += `      <MaterialID>${safeValue(item.materialId)}</MaterialID>\n`;
    xml += `      <Description>${safeValue(item.description)}</Description>\n`;
    xml += `      <Quantity>${safeValue(item.quantity)}</Quantity>\n`;
    xml += `      <Unit>${safeValue(item.unit)}</Unit>\n`;
    xml += `      <Price>${safeValue(item.price)}</Price>\n`;
    xml += `      <TaxRate>${safeValue(item.taxRate)}</TaxRate>\n`;
    xml += `      <TotalAmount>${safeValue(item.total)}</TotalAmount>\n`;
    xml += '    </Item>\n';
  });
  xml += '  </Items>\n';

  // Totals
  xml += '  <Totals>\n';
  xml += `    <NetAmount>${safeValue(data.totalNet)}</NetAmount>\n`;
  xml += `    <TaxAmount>${safeValue((data.totalGross || 0) - (data.totalNet || 0))}</TaxAmount>\n`;
  xml += `    <GrossAmount>${safeValue(data.totalGross)}</GrossAmount>\n`;
  xml += '  </Totals>\n';

  // Close root element
  xml += '</Invoice>';

  return xml;
};

// Function to download XML file
export const downloadXML = (xmlContent: string, filename: string): void => {
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
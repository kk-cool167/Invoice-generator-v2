import type { Vendor, Recipient } from './types';
import type { ExtendedVendor, ExtendedRecipient, PDFGeneratorOptions } from './pdfTypes';

// Helper functions to extend vendor and recipient with additional fields
export const extendVendor = (vendor: Vendor): ExtendedVendor => {
  return {
    ...vendor,
    // Map bank_name to cbankname for PDF template compatibility
    cbankname: vendor.bank_name || vendor.cbankname,
  };
};

export const extendRecipient = (recipient: Recipient): ExtendedRecipient => {
  return {
    ...recipient,
  };
};

// Function to ensure all required PDF data is present
export const validatePDFData = (data: PDFGeneratorOptions): PDFGeneratorOptions => {
  // Validate basic fields
  if (!data.mode || !['MM', 'FI'].includes(data.mode)) {
    throw new Error('Valid mode (MM or FI) is required');
  }
  if (!data.invoiceNumber) {
    throw new Error('Invoice number is required');
  }
  if (!data.invoiceDate) {
    throw new Error('Invoice date is required');
  }
  if (!data.vendor) {
    throw new Error('Vendor information is required');
  }
  if (!data.recipient) {
    throw new Error('Recipient information is required');
  }
  if (!data.items || data.items.length === 0) {
    throw new Error('At least one item is required');
  }

  // Validate vendor and recipient required fields
  if (!data.vendor.cname || !data.vendor.cstreet || !data.vendor.czip || !data.vendor.ccity) {
    throw new Error('Vendor address information is incomplete');
  }
  if (!data.recipient.cname || !data.recipient.cstreet || !data.recipient.czip || !data.recipient.ccity) {
    throw new Error('Recipient address information is incomplete');
  }

  // Safe default values
  const validatedData = {
    ...data,
    customerNumber: data.customerNumber || '-',
    totalNet: data.totalNet || 0,
    totalGross: data.totalGross || 0,
  };

  return validatedData;
};

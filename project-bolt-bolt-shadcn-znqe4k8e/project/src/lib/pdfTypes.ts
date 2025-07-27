import { Vendor as BaseVendor, Recipient as BaseRecipient } from './types';

export interface ExtendedVendor extends BaseVendor {
  cstreet?: string;
  czip?: string;
  ccity?: string;
  ccountry?: string;
  cpozip?: string;
  cvatnumber?: string;
  cfon?: string;
  cfax?: string;
  cemail?: string;
  curl?: string;
  bank_name?: string;
  ciban?: string;
  cbic?: string;
  cbankname?: string;
  cphone?: string;
  cregistration?: string;
  cpobox?: string;
  cpoboxzip?: string;
  cpoboxcity?: string;
  cmanager?: string;
  ctaxnumber?: string;
  ccourt?: string;
}

export interface ExtendedRecipient extends BaseRecipient {
  cstreet?: string;
  czip?: string;
  ccity?: string;
  ccountry?: string;
  crecipientid: string;
  ccompanycode: string;
  ccontact?: string;
  ccustomerNumber?: string;
  cvatid?: string;
  cvatnumber?: string;
}

export interface PDFItem {
  materialId: string;
  description?: string;
  materialNumber?: string;
  materialType?: string;
  currency?: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  total: number;
}

export interface PDFGeneratorOptions {
  mode: 'MM' | 'FI';
  logo?: string;
  logoConfig?: any; // Logo-Konfiguration für Größe und Position
  vendor: ExtendedVendor;
  recipient: ExtendedRecipient;
  invoiceNumber: string;
  invoiceDate: string;
  date?: string;
  customerNumber?: string;
  orderNumber?: string;
  orderDate?: string;
  deliveryNoteNumber?: string;
  deliveryDate?: string;
  processor?: string;
  paymentTerms?: string;
  order?: {
    cponumber: string;
  };
  deliveryNote?: {
    cdnnumberexternal: string;
  };
  items: PDFItem[];
  totalNet: number;
  totalGross: number;
  subtotal?: number;
  tax?: number;
  total?: number;
  deliveryNumber?: string;
  purchaseOrder?: string;
  taxAmount?: number;
}

// Helper function to ensure all required fields are present
export const validateVendor = (vendor: ExtendedVendor): boolean => {
  return !!(
    vendor.cname &&
    vendor.ccompanycode &&
    vendor.cstreet &&
    vendor.czip &&
    vendor.ccity &&
    vendor.ccountry &&
    vendor.cvatnumber
  );
};

export const validateRecipient = (recipient: ExtendedRecipient): boolean => {
  return !!(
    recipient.cname &&
    recipient.ccompanycode &&
    recipient.crecipientid &&
    recipient.cstreet &&
    recipient.czip &&
    recipient.ccity &&
    recipient.ccountry
  );
};

export const validatePDFItem = (item: PDFItem): boolean => {
  return !!(
    item.materialId &&
    item.quantity > 0 &&
    item.unit &&
    item.price >= 0 &&
    item.taxRate >= 0
  );
};

export const validatePDFOptions = (options: PDFGeneratorOptions): boolean => {
  return !!(
    options.vendor &&
    options.recipient &&
    options.invoiceNumber &&
    options.invoiceDate &&
    options.items.length > 0 &&
    validateVendor(options.vendor) &&
    validateRecipient(options.recipient) &&
    options.items.every(validatePDFItem)
  );
};

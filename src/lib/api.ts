import type { Vendor, Recipient, Material, TaxCode, ExchangeRate } from './types';
import type { PurchaseOrder, PurchaseOrderItem, DeliveryNote, DeliveryNoteItem } from './dataProcessing';
import apiClient, { APIError } from './apiClient';
import { useLanguage } from '@/context/LanguageContext';

// Mock data for fallback when API is unavailable
const mockVendors: Vendor[] = [
  {
    cid: 1,
    cvendorid: 'V001',
    ccompanycode: '1000',
    cname: 'TechFlow Solutions GmbH',
    cname2: 'Technology Services',
    cstreet: 'Hauptstraße 123',
    czip: '10115',
    ccity: 'Berlin',
    ccountry: 'DE',
    cpozip: '10115',
    cvatnumber: 'DE123456789',
    ctaxnumber: '12345/67890',
    cfon: '+49 30 123456',
    cfax: '+49 30 123457',
    cemail: 'info@techflow.de',
    curl: 'www.techflow.de',
    ctopid: 1,
    conetime: 0,
    calwayswithpo: 0,
    calwayswithoutpo: 0,
    bank_name: 'Deutsche Bank AG',
    ciban: 'DE89370400440532013000',
    cbic: 'DEUTDEBBXXX'
  },
  {
    cid: 2,
    cvendorid: 'V002',
    ccompanycode: '2000',
    cname: 'Digital Services Ltd',
    cname2: 'UK Technology Services',
    cstreet: '20 Primrose Street',
    czip: 'EC2A 2EW',
    ccity: 'London',
    ccountry: 'GB',
    cpozip: 'EC2A 2EW',
    cvatnumber: 'GB987654321',
    ctaxnumber: 'GB987654321',
    cfon: '+44 20 7123 4567',
    cfax: '+44 20 7123 4568',
    cemail: 'info@digitalservices.co.uk',
    curl: 'www.digitalservices.co.uk',
    ctopid: 1,
    conetime: 0,
    calwayswithpo: 0,
    calwayswithoutpo: 0,
    bank_name: 'Barclays Bank PLC',
    ciban: 'GB82WEST12345698765432',
    cbic: 'BARCGB22XXX'
  }
];

const mockRecipients: Recipient[] = [
  {
    cid: 1,
    crecipientid: '1000001',
    ccompanycode: '1000',
    cname: 'SER Solutions Deutschland GmbH',
    cname2: 'Software Engineering',
    cstreet: 'Joseph-Schumpeter-Allee 19',
    czip: '53227',
    ccity: 'Bonn',
    ccountry: 'DE',
    cpozip: '53227',
    cfon: '+49 228 90896-0',
    cfax: '+49 228 90896-100',
    cemail: 'info@ser.de',
    curl: 'www.ser.de',
    cvatnumber: 'DE123456789'
  },
  {
    cid: 2,
    crecipientid: '2000001',
    ccompanycode: '2000',
    cname: 'SER Solutions UK Ltd',
    cname2: 'UK Operations',
    cstreet: '20 Primrose Street',
    czip: 'EC2A 2EW',
    ccity: 'London',
    ccountry: 'GB',
    cpozip: 'EC2A 2EW',
    cfon: '+44 20 7123 4567',
    cemail: 'info@ser.co.uk',
    curl: 'www.ser.co.uk',
    cvatnumber: 'GB987654321'
  }
];

const mockMaterials: Material[] = [
  {
    cid: 1,
    cmaterialnumber: 'MAT-001',
    cdescription: 'Professional Laptop',
    ctype: 'good',
    ctaxcode: 'V1',
    ctaxrate: 0.19,
    cunit: 'ST',
    cnetamount: 1200.00,
    ccurrency: 'EUR'
  },
  {
    cid: 2,
    cmaterialnumber: 'MAT-002',
    cdescription: 'Software License',
    ctype: 'software',
    ctaxcode: 'V1',
    ctaxrate: 0.19,
    cunit: 'ST',
    cnetamount: 500.00,
    ccurrency: 'EUR'
  },
  {
    cid: 3,
    cmaterialnumber: 'MAT-003',
    cdescription: 'Consulting Hours',
    ctype: 'service',
    ctaxcode: 'V1',
    ctaxrate: 0.19,
    cunit: 'H',
    cnetamount: 150.00,
    ccurrency: 'EUR'
  },
  {
    cid: 4,
    cmaterialnumber: 'MAT-004',
    cdescription: 'UK Consulting Service',
    ctype: 'service',
    ctaxcode: 'GB20',
    ctaxrate: 0.20,
    cunit: 'H',
    cnetamount: 120.00,
    ccurrency: 'GBP'
  }
];

const mockTaxCodes: TaxCode[] = [
  {
    cid: 1,
    ccompanycode: '1000',
    cvalidfrom: '2024-01-01',
    cvalidto: '2024-12-31',
    cscenario: 'default',
    ccountry: 'DE',
    ccode: 'V0',
    crate: 0,
    cdescription: 'Tax-free'
  },
  {
    cid: 2,
    ccompanycode: '1000',
    cvalidfrom: '2024-01-01',
    cvalidto: '2024-12-31',
    cscenario: 'default',
    ccountry: 'DE',
    ccode: 'V1',
    crate: 19,
    cdescription: 'Standard VAT 19%'
  },
  {
    cid: 3,
    ccompanycode: '2000',
    cvalidfrom: '2024-01-01',
    cvalidto: '2024-12-31',
    cscenario: 'default',
    ccountry: 'GB',
    ccode: 'GB20',
    crate: 20,
    cdescription: 'UK Standard VAT 20%'
  }
];

const mockExchangeRates: ExchangeRate[] = [
  { ccurrency: 'EUR', crate: 1.0 },
  { ccurrency: 'GBP', crate: 0.85 },
  { ccurrency: 'CHF', crate: 0.95 },
  { ccurrency: 'USD', crate: 1.1 }
];

/**
 * Übersetzbare Fehlermeldungen
 */
const ERROR_MESSAGES = {
  FETCH_VENDORS: 'Failed to fetch vendors',
  FETCH_RECIPIENTS: 'Failed to fetch recipients',
  FETCH_MATERIALS: 'Failed to fetch materials',
  FETCH_TAXCODES: 'Failed to fetch tax codes',
  FETCH_EXCHANGERATES: 'Failed to fetch exchange rates',
  SAVE_PURCHASE_ORDER: 'Failed to save purchase order',
  SAVE_DELIVERY_NOTE: 'Failed to save delivery note',
  FETCH_SAVED_DATA: 'Failed to fetch saved data',
  DELETE_PURCHASE_ORDER: 'Failed to delete purchase order',
  DELETE_DELIVERY_NOTE: 'Failed to delete delivery note'
};

// API Base URL - direkt zum Server
// const API_BASE_URL = `/api/v1`;
const API_BASE_URL = `/api/v1`;

// Existing API Functions
export async function getVendors(): Promise<Vendor[]> {
  try {
    return await apiClient.get<Vendor[]>('vendors');
  } catch (error) {
    console.warn('API call failed, using mock vendors:', error);
    return mockVendors;
  }
}

export async function getRecipients(): Promise<Recipient[]> {
  try {
    return await apiClient.get<Recipient[]>('recipients');
  } catch (error) {
    console.warn('API call failed, using mock recipients:', error);
    return mockRecipients;
  }
}

export async function getMaterials(): Promise<Material[]> {
  try {
    return await apiClient.get<Material[]>('articles');
  } catch (error) {
    console.warn('API call failed, using mock materials:', error);
    return mockMaterials;
  }
}

export async function getTaxCodes(): Promise<TaxCode[]> {
  try {
    return await apiClient.get<TaxCode[]>('taxcodes');
  } catch (error) {
export async function getMaterials(): Promise<Material[]> {
  try {
    return await apiClient.get<Material[]>('articles');
    console.warn('API call failed, using mock tax codes:', error);
    return mockTaxCodes;
  }
}

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  try {
    return await apiClient.get<ExchangeRate[]>('exchangerates');
  } catch (error) {
    console.warn('API call failed, using mock exchange rates:', error);
    return mockExchangeRates;
  }
}

export async function createMaterial(material: Omit<Material, 'cid'>): Promise<Material> {
  try {
    return await apiClient.post<Material>('articles', material);
  } catch (error) {
    throw new APIError(
      ERROR_MESSAGES.CREATE_MATERIAL,
      error instanceof APIError ? error.status : 500,
      error instanceof APIError ? error.statusText : 'Unknown Error',
      'articles',
      error
    );
  }
}

export async function createVendor(vendor: Omit<Vendor, 'cid'>): Promise<Vendor> {
  try {
    return await apiClient.post<Vendor>('vendors', vendor);
  } catch (error) {
    throw new APIError(
      ERROR_MESSAGES.CREATE_VENDOR,
      error instanceof APIError ? error.status : 500,
      error instanceof APIError ? error.statusText : 'Unknown Error',
      'vendors',
      error
    );
  }
}

export async function createRecipient(recipient: Omit<Recipient, 'cid'>): Promise<Recipient> {
  try {
    return await apiClient.post<Recipient>('recipients', recipient);
  } catch (error) {
    throw new APIError(
      ERROR_MESSAGES.CREATE_RECIPIENT,
      error instanceof APIError ? error.status : 500,
      error instanceof APIError ? error.statusText : 'Unknown Error',
      'recipients',
      error
    );
  }
}

// New API Functions for Purchase Orders and Delivery Notes
export async function createPurchaseOrder(
  order: Omit<PurchaseOrder, 'cid'>,
  items: Omit<PurchaseOrderItem, 'cid'>[]
): Promise<{ order: PurchaseOrder; items: PurchaseOrderItem[] }> {
  try {
    return await apiClient.post<{ order: PurchaseOrder; items: PurchaseOrderItem[] }>(
      'purchase-orders', 
      { order, items }
    );
  } catch (error) {
    throw new APIError(
      ERROR_MESSAGES.CREATE_PO,
      error instanceof APIError ? error.status : 500,
      error instanceof APIError ? error.statusText : 'Unknown Error',
      'purchase-orders',
      error
    );
  }
}

export async function createDeliveryNote(
  note: Omit<DeliveryNote, 'cid'>,
  items: Omit<DeliveryNoteItem, 'cid'>[]
): Promise<{ note: DeliveryNote; items: DeliveryNoteItem[] }> {
  try {
    // Debug: Log the data being sent
    console.log('📤 Sending delivery note to API:', {
      note,
      items,
      itemsCount: items.length,
      noteKeys: Object.keys(note),
      firstItemKeys: items[0] ? Object.keys(items[0]) : 'no items'
    });

    return await apiClient.post<{ note: DeliveryNote; items: DeliveryNoteItem[] }>(
      'delivery-notes', 
      { note, items }
    );
  } catch (error) {
    console.error('❌ API Error creating delivery note:', error);
    throw new APIError(
      ERROR_MESSAGES.CREATE_DN,
      error instanceof APIError ? error.status : 500,
      error instanceof APIError ? error.statusText : 'Unknown Error',
      'delivery-notes',
      error
    );
  }
}

// Funktion zum Abrufen der letzten gespeicherten Daten (inkl. Nummern)
export async function getLastNumbers(): Promise<{
  lastPONumber: string;
  lastDNNumber: string;
}> {
  try {
    const response = await apiClient.get<{
      purchaseOrders: any[];
      deliveryNotes: any[];
      lastPONumber?: string;
      lastDNNumber?: string;
    }>('saved-data');
    
    // Die API gibt bereits lastPONumber und lastDNNumber direkt zurück
    const lastPONumber = response.lastPONumber || '4500000000';
    const lastDNNumber = response.lastDNNumber || 'L2BRL0000';
    
    return {
      lastPONumber,
      lastDNNumber
    };
  } catch (error) {
    console.warn('API call failed, using default numbers:', error);
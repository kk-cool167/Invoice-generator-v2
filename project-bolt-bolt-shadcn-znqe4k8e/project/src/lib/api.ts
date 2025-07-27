import type { Vendor, Recipient, Material, TaxCode, ExchangeRate } from './types';
import type { PurchaseOrder, PurchaseOrderItem, DeliveryNote, DeliveryNoteItem } from './dataProcessing';
import apiClient, { APIError } from './apiClient';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Übersetzbare Fehlermeldungen
 */
export const ERROR_MESSAGES = {
  FETCH_VENDORS: 'errors.fetchVendors',
  FETCH_RECIPIENTS: 'errors.fetchRecipients',
  FETCH_MATERIALS: 'errors.fetchMaterials',
  FETCH_TAXCODES: 'errors.fetchTaxcodes',
  FETCH_EXCHANGERATES: 'errors.fetchExchangerates',
  CREATE_MATERIAL: 'errors.createMaterial',
  CREATE_VENDOR: 'errors.createVendor',
  CREATE_RECIPIENT: 'errors.createRecipient',
  CREATE_PO: 'errors.createPurchaseOrder',
  CREATE_DN: 'errors.createDeliveryNote',
};

// API Base URL - direkt zum Server
// const API_BASE_URL = `/api/v1`;
const API_BASE_URL = `http://localhost:3003/api/v1`;

// Existing API Functions
export async function getVendors(): Promise<Vendor[]> {
  try {
    return await apiClient.get<Vendor[]>('vendors');
  } catch (error) {
    throw new APIError(
      ERROR_MESSAGES.FETCH_VENDORS,
      error instanceof APIError ? error.status : 500,
      error instanceof APIError ? error.statusText : 'Unknown Error',
      'vendors',
      error
    );
  }
}

export async function getRecipients(): Promise<Recipient[]> {
  try {
    return await apiClient.get<Recipient[]>('recipients');
  } catch (error) {
    throw new APIError(
      ERROR_MESSAGES.FETCH_RECIPIENTS,
      error instanceof APIError ? error.status : 500,
      error instanceof APIError ? error.statusText : 'Unknown Error',
      'recipients',
      error
    );
  }
}

export async function getMaterials(): Promise<Material[]> {
  try {
    return await apiClient.get<Material[]>('articles');
  } catch (error) {
    throw new APIError(
      ERROR_MESSAGES.FETCH_MATERIALS,
      error instanceof APIError ? error.status : 500,
      error instanceof APIError ? error.statusText : 'Unknown Error',
      'articles',
      error
    );
  }
}

export async function getTaxCodes(): Promise<TaxCode[]> {
  try {
    return await apiClient.get<TaxCode[]>('taxcodes');
  } catch (error) {
    throw new APIError(
      ERROR_MESSAGES.FETCH_TAXCODES,
      error instanceof APIError ? error.status : 500,
      error instanceof APIError ? error.statusText : 'Unknown Error',
      'taxcodes',
      error
    );
  }
}

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  try {
    return await apiClient.get<ExchangeRate[]>('exchangerates');
  } catch (error) {
    throw new APIError(
      ERROR_MESSAGES.FETCH_EXCHANGERATES,
      error instanceof APIError ? error.status : 500,
      error instanceof APIError ? error.statusText : 'Unknown Error',
      'exchangerates',
      error
    );
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
    // Im Fehlerfall Default-Werte zurückgeben
    return {
      lastPONumber: '4500000000',
      lastDNNumber: 'L2BRL0000'
    };
  }
}

/**
 * Formatiert eine API-Fehlermeldung ohne Hook-Abhängigkeit
 * Diese Funktion sollte nur in React-Komponenten mit der t-Funktion verwendet werden
 */
export function formatAPIError(error: unknown, t?: (key: string) => string): string {
  if (error instanceof APIError) {
    // Verwende übersetzten Text wenn t-Funktion verfügbar ist, sonst Fallback
    return t ? t(error.message) : error.message;
  }
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return t ? t('errors.unknown') : errorMessage;
}

// Re-export types
export type { 
  Vendor, 
  Recipient, 
  Material,
  TaxCode,
  ExchangeRate,
  PurchaseOrder,
  PurchaseOrderItem,
  DeliveryNote,
  DeliveryNoteItem,
};

// Export APIError as a value
export { APIError };

// 导出apiClient以供其他模块使用
export { apiClient };

import type { Vendor, Material, Recipient } from "../lib/types";

export interface BasicInfo {
  invoiceNumber: string;
  vendorId: string;
  recipientId: string;
  invoiceDate: string;
  orderDate?: string;
  deliveryDate?: string;
  customerNumber: string;
  processor: string;
}

export interface ValidationErrors {
  basicInfo?: {
    invoiceNumber?: string;
    vendorId?: string;
    recipientId?: string;
    invoiceDate?: string;
    orderDate?: string;
    deliveryDate?: string;
    customerNumber?: string;
  };
  items?: string;
  submit?: string;
}

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
}

export interface BasicInfoProps {
  data: BasicInfo;
  onChange: (data: BasicInfo) => void;
  vendors?: Vendor[];
  recipients?: Recipient[];
  errors?: ValidationErrors['basicInfo'];
  mode?: 'MM' | 'FI';
}

export interface MMItemsSectionProps {
  title: string;
  items: MMItem[];
  materials?: Material[];
  error?: string;
  companyCode?: string;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, item: MMItem) => void;
  onMaterialSelect: (materialId: string, index: number) => void;
  onItemChange?: (index: number, item: MMItem) => void;
}

export interface FIItemsSectionProps {
  title?: string;
  items: FIItem[];
  materials?: Material[];
  error?: string;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, item: FIItem) => void;
  onMaterialSelect?: (materialId: string, index: number) => void;
  getTaxCodeInfo?: (taxCode?: string) => { taxRate: number; currency: string; companyCode: string };
}

export interface MMItem {
  materialId: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  total: number;
  currency?: string; // Determined by CurrencyManager based on context
  deliveredQuantity?: number;
  deliveredPrice?: number;
}

export interface FIItem {
  materialId: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  total: number;
  currency?: string; // Determined by CurrencyManager based on context
  description?: string;
  materialNumber?: string;
  materialType?: string;
}

export const defaultMMItem: MMItem = {
  materialId: '',
  quantity: 1,
  unit: 'ST',
  price: 0,
  taxRate: 19,
  total: 0,
  currency: 'EUR' // Default to EUR, will be updated by CurrencyManager
};

export const defaultFIItem: FIItem = {
  materialId: '',
  quantity: 1,
  unit: 'H',
  price: 0,
  taxRate: 19,
  total: 0,
  currency: 'EUR', // Default to EUR, will be updated by CurrencyManager
  description: '' // Add default description
};


import { MMItem, FIItem } from '../types/forms';
import { calculateTotalWithTax } from './utils';
import { Material } from './types';

export interface InvoiceItem {
  materialId: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  deliveredQuantity?: number;
  deliveredPrice?: number;
  description?: string;
  currency?: string;
}

// Matches the database table 'public.pos'
export interface PurchaseOrder {
  cid?: string;
  cponumber: string;
  cdate: string;
  ccompanycode: string;
  crecipientid: string;
  cvendorid: string;
  ctopid: string;
}

// Matches the database table 'public.poitems'
export interface PurchaseOrderItem {
  cid?: string;
  cpoitemnumber: string;
  cpoid: string;
  cpoitemid?: string;
  cnetamount: number;
  cquantity: number;
  cunit: string;
  ccurrency: string;
  ctype?: string;
  carticlenocustomer?: string;
  carticlenovendor?: string;
  cdescription?: string;
  ctaxrate?: number;
  ctaxcode?: string;
  camountupperlimit?: number;
  cgrexpected?: number;
  cgrpostpergr?: number;
  cdifferentvendorid?: string;
}

// Matches the database table 'public.deliverynotes'
export interface DeliveryNote {
  cid?: string;
  cdnnumber: string;
  cdnnumberexternal: string;
  ctype: string;
  cdate: string;
}

// Matches the database table 'public.deliverynoteitems'
export interface DeliveryNoteItem {
  cid?: string;
  cdnitemnumber: string;
  cdnid: string;
  cpoid: string;
  cpoitemid?: string;
  materialId?: string;
  cnetamount: number;
  cquantity: number;
  cunit: string;
  ctotalamount: number;
  ccurrency: string;
}

export const processInvoiceItems = (items: InvoiceItem[]): MMItem[] => {
  return items.map(item => ({
    materialId: item.materialId,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    taxRate: item.taxRate,
    total: calculateTotalWithTax(item.quantity * item.price, item.taxRate)
  }));
};

export const createPurchaseOrder = (
  basicInfo: { vendorId: string; recipientId: string; orderDate: string; cponumber?: string; ccompanycode?: string },
  items: InvoiceItem[],
  materials: Material[]
): { order: PurchaseOrder; items: PurchaseOrderItem[] } => {
  console.log('=== createPurchaseOrder DEBUG ===');
  console.log('Input basicInfo:', basicInfo);
  console.log('vendorId type:', typeof basicInfo.vendorId, 'value:', basicInfo.vendorId);
  console.log('recipientId type:', typeof basicInfo.recipientId, 'value:', basicInfo.recipientId);
  
  const order: PurchaseOrder = {
    cponumber: basicInfo.cponumber || '', // Leerer String, der Server generiert die richtige Nummer
    cdate: basicInfo.orderDate,
    ccompanycode: basicInfo.ccompanycode || '1000', // Use provided company code or default
    crecipientid: basicInfo.recipientId,
    cvendorid: basicInfo.vendorId,
    ctopid: '1' // Default top ID
  };
  
  console.log('Created order object:', order);
  console.log('Order crecipientid:', order.crecipientid, 'type:', typeof order.crecipientid);
  console.log('Order cvendorid:', order.cvendorid, 'type:', typeof order.cvendorid);

  const orderItems: PurchaseOrderItem[] = items.map((item, index) => {
    const material = materials.find(m => m.cid.toString() === item.materialId);
    return {
      cpoitemnumber: (index + 1).toString().padStart(2, '0'),
      cpoid: '1', // This will be replaced with the actual PO ID after creation
      cpoitemid: item.materialId,
      ctype: 'good',
      carticlenocustomer: material?.cmaterialnumber || '',
      carticlenovendor: material?.cmaterialnumber || '',
      cdescription: material?.cdescription || '',
      ctaxrate: material?.ctaxrate || 0.19,
      ctaxcode: material?.ctaxcode || 'V1',
      cnetamount: item.quantity * item.price,
      cquantity: item.quantity,
      cunit: item.unit,
      ccurrency: material?.ccurrency || (() => {
        const { getCurrencyForContext } = require('./currencyManager');
        return getCurrencyForContext({ companyCode: order.ccompanycode || '1000' });
      })(),
      camountupperlimit: (item.quantity * item.price) * 1.1, // 10% Puffer on total amount
      cgrexpected: 1,
      cgrpostpergr: 1
    };
  });

  return { order, items: orderItems };
};

export const createDeliveryNote = (
  basicInfo: { deliveryDate: string; cdnnumberexternal?: string },
  items: InvoiceItem[],
  purchaseOrderId: string
): { note: DeliveryNote; items: DeliveryNoteItem[] } => {
  const note: DeliveryNote = {
    cdnnumber: `DN${Date.now()}`, // Generate a unique delivery note number
    cdnnumberexternal: '', // Leerer String, der Server generiert die richtige Nummer
    ctype: 'delivery',
    cdate: basicInfo.deliveryDate
  };

  const deliveryItems: DeliveryNoteItem[] = items.map((item, index) => ({
    cdnitemnumber: (index + 1).toString().padStart(2, '0'),
    cdnid: '1', // This will be replaced with the actual DN ID after creation
    cpoid: purchaseOrderId,
    materialId: item.materialId,
    cnetamount: (item.deliveredQuantity || item.quantity) * (item.deliveredPrice || item.price),
    cquantity: item.deliveredQuantity || item.quantity,
    cunit: item.unit,
    ctotalamount: calculateTotalWithTax(
      (item.deliveredQuantity || item.quantity) * (item.deliveredPrice || item.price),
      item.taxRate
    ),
    ccurrency: item.currency || (() => {
      const { getCurrencyForContext } = require('./currencyManager');
      return getCurrencyForContext({ companyCode: '1000' }); // Default company code since delivery notes don't have company code field
    })() // Use item's currency or get from company context
  }));

  return { note, items: deliveryItems };
};

export const processFIItems = (items: FIItem[]): FIItem[] => {
  return items.map(item => ({
    ...item,
    total: calculateTotalWithTax(item.quantity * item.price, item.taxRate)
  }));
};

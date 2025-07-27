import { useState } from 'react';
import { MMItem, FIItem } from '../types/forms';

interface BasicInfo {
  invoiceNumber: string;
  vendorId: string;
  recipientId: string;
  invoiceDate: string;
  orderDate?: string;
  deliveryDate?: string;
  customerNumber: string;
  processor: string;
}

interface ValidationErrors {
  basicInfo?: {
    invoiceNumber?: string;
    vendorId?: string;
    recipientId?: string;
    orderDate?: string;
    deliveryDate?: string;
    customerNumber?: string;
  };
  items?: string;
  submit?: string;
}

interface MMInvoice {
  type: 'MM';
  invoiceNumber: string;
  vendorId: string;
  recipientId: string;
  invoiceDate: string;
  orderDate: string;
  deliveryDate: string;
  customerNumber: string;
  processor: string;
  invoiceItems: MMItem[];
  orderItems: MMItem[];
  deliveryItems: MMItem[];
}

interface FIInvoice {
  type: 'FI';
  invoiceNumber: string;
  vendorId: string;
  recipientId: string;
  invoiceDate: string;
  customerNumber: string;
  processor: string;
  items: FIItem[];
}

interface UseInvoiceFormProps {
  onSubmit: (data: MMInvoice | FIInvoice) => Promise<void>;
}

export function useInvoiceForm({ onSubmit }: UseInvoiceFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateBasicInfo = (info: BasicInfo, mode: 'MM' | 'FI'): boolean => {
    const newErrors: ValidationErrors = {};

    if (!info.invoiceNumber.trim()) {
      newErrors.basicInfo = {
        ...newErrors.basicInfo,
        invoiceNumber: 'Invoice number is required'
      };
    }

    if (!info.vendorId) {
      newErrors.basicInfo = {
        ...newErrors.basicInfo,
        vendorId: 'Vendor is required'
      };
    }

    if (!info.customerNumber.trim()) {
      newErrors.basicInfo = {
        ...newErrors.basicInfo,
        customerNumber: 'Customer number is required'
      };
    }

    // Recipient is now optional, so we remove the validation

    // Only validate orderDate and deliveryDate for MM mode
    if (mode === 'MM') {
      if (!info.orderDate) {
        newErrors.basicInfo = {
          ...newErrors.basicInfo,
          orderDate: 'Order date is required'
        };
      }

      if (!info.deliveryDate) {
        newErrors.basicInfo = {
          ...newErrors.basicInfo,
          deliveryDate: 'Delivery date is required'
        };
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMMItems = (
    invoiceItems: MMItem[],
    orderItems: MMItem[],
    deliveryItems: MMItem[]
  ): boolean => {
    const validateItems = (items: MMItem[]): boolean => {
      return items.every(item => {
        // Skip validation if no material is selected yet
        if (!item.materialId) return true;
        return (
          item.quantity > 0 &&
          item.unit &&
          item.price >= 0 &&
          item.taxRate >= 0
        );
      });
    };

    const isValid = validateItems(invoiceItems) &&
      validateItems(orderItems) &&
      validateItems(deliveryItems);

    if (!isValid) {
      setErrors(prev => ({
        ...prev,
        items: 'All items must have valid values'
      }));
    }

    return isValid;
  };

  const validateFIItems = (items: FIItem[]): boolean => {
    const isValid = items.every(item => {
      // Skip validation if no material is selected yet
      if (!item.materialId) return true;
      return (
        item.quantity > 0 &&
        item.unit &&
        item.price >= 0 &&
        item.taxRate >= 0
      );
    });

    if (!isValid) {
      setErrors(prev => ({
        ...prev,
        items: 'All items must have valid values'
      }));
    }

    return isValid;
  };

  const handleSubmit = async (
    mode: 'MM' | 'FI',
    basicInfo: BasicInfo,
    invoiceItems: MMItem[],
    orderItems: MMItem[],
    deliveryItems: MMItem[],
    fiItems: FIItem[]
  ) => {
    setErrors({});
    setIsSubmitting(true);

    try {
      const isBasicInfoValid = validateBasicInfo(basicInfo, mode);
      const isItemsValid = mode === 'MM'
        ? validateMMItems(invoiceItems, orderItems, deliveryItems)
        : validateFIItems(fiItems);

      if (!isBasicInfoValid || !isItemsValid) {
        return;
      }

      // Jetzt bereiten wir nur die Daten vor und rufen onSubmit auf
      // Die API-Aufrufe werden NICHT hier gemacht, sondern in der onSubmit-Funktion
      if (mode === 'MM' && basicInfo.orderDate && basicInfo.deliveryDate) {
        // Submit the complete MM invoice - keine API-Aufrufe hier!
        const mmInvoice: MMInvoice = {
          type: 'MM',
          ...basicInfo,
          orderDate: basicInfo.orderDate,
          deliveryDate: basicInfo.deliveryDate,
          invoiceItems,
          orderItems,
          deliveryItems,
        };
        await onSubmit(mmInvoice);
      } else if (mode === 'FI') {
        const { orderDate, deliveryDate, ...fiBasicInfo } = basicInfo;
        const fiInvoice: FIInvoice = {
          type: 'FI',
          ...fiBasicInfo,
          items: fiItems,
        };
        await onSubmit(fiInvoice);
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit invoice. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    errors,
    isSubmitting,
    handleSubmit,
  };
}

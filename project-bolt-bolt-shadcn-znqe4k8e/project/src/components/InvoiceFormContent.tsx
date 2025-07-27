import { Dispatch, SetStateAction } from 'react';
import { Sliders, Settings } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { FormStepIndicator } from './ui/StepIndicator';
import { LogoUpload } from './LogoUpload';
import { InvoiceBasicInfo } from './InvoiceBasicInfo';
import { MMItemsSection } from './MMItemsSection';
import { FIItemsSection } from './FIItemsSection';
import { InvoiceFormActions } from './InvoiceFormActions';
import { useLanguage } from '@/context/LanguageContext';
import { MMItem, FIItem, BasicInfo } from '../types/forms';
import { type Material, type Vendor, type Recipient } from '../lib/api';
import { type Logo } from '../lib/logoManager';
import { type TemplateName } from '../lib/pdf/templates';
import { UseFormReturn } from 'react-hook-form';

interface InvoiceFormContentProps {
  mode: 'MM' | 'FI';
  syncMaterials: boolean;
  setSyncMaterials: Dispatch<SetStateAction<boolean>>;
  logo: Logo | null;
  setLogo: Dispatch<SetStateAction<Logo | null>>;
  logoConfig: any;
  setLogoConfig: Dispatch<SetStateAction<any>>;
  setIsLogoDialogOpen: Dispatch<SetStateAction<boolean>>;
  vendors: Vendor[];
  recipients: Recipient[];
  invoiceItems: MMItem[];
  setInvoiceItems: Dispatch<SetStateAction<MMItem[]>>;
  orderItems: MMItem[];
  setOrderItems: Dispatch<SetStateAction<MMItem[]>>;
  deliveryItems: MMItem[];
  setDeliveryItems: Dispatch<SetStateAction<MMItem[]>>;
  fiItems: FIItem[];
  setFIItems: Dispatch<SetStateAction<FIItem[]>>;
  filteredMaterials: Material[];
  getTaxCodeInfo: (taxCode?: string) => { taxRate: number; currency: string; companyCode: string };
  // PDF Preview Props
  template: TemplateName;
  methods: UseFormReturn<BasicInfo>;
  pdfBlob: Blob | null;
  isPreviewLoading: boolean;
  previewDocument: any;
  handlePreviewPDF: () => void;
  handlePreviewMMPDF: () => void;
  handleDownloadXML: () => void;
  handleDownloadPDF: () => void;
  handleCreateMMDocument: () => void;
}

export function InvoiceFormContent({
  mode,
  syncMaterials,
  setSyncMaterials,
  logo,
  setLogo,
  logoConfig,
  setLogoConfig,
  setIsLogoDialogOpen,
  vendors,
  recipients,
  invoiceItems,
  setInvoiceItems,
  orderItems,
  setOrderItems,
  deliveryItems,
  setDeliveryItems,
  fiItems,
  setFIItems,
  filteredMaterials,
  getTaxCodeInfo,
  // PDF Preview Props
  template,
  methods,
  pdfBlob,
  isPreviewLoading,
  previewDocument,
  handlePreviewPDF,
  handlePreviewMMPDF,
  handleDownloadXML,
  handleDownloadPDF,
  handleCreateMMDocument,
}: InvoiceFormContentProps) {
  const { t } = useLanguage();
  
  // Get current recipient's company code for language detection
  const currentRecipientId = methods.watch('recipientId');
  const currentRecipient = recipients.find(r => r.cid?.toString() === currentRecipientId);
  const currentCompanyCode = currentRecipient?.ccompanycode || '1000';

  // Check completion status for steps
  const currentVendorId = methods.watch('vendorId');
  const currentInvoiceNumber = methods.watch('invoiceNumber');
  const isStep3Completed = currentVendorId && currentRecipientId && currentInvoiceNumber;
  const isStep2Completed = logo !== null;
  const isStep4Completed = mode === 'MM' 
    ? invoiceItems.some(item => item.materialId?.trim())
    : fiItems.some(item => item.description?.trim());

  const handleItemChange = (section: 'invoice' | 'order' | 'delivery', index: number, item: MMItem) => {
    if (syncMaterials) {
      // Synchronize across all three sections
      setInvoiceItems(prev => {
        const newItems = [...prev];
        newItems[index] = item;
        return newItems;
      });
      setOrderItems(prev => {
        const newItems = [...prev];
        newItems[index] = item;
        return newItems;
      });
      setDeliveryItems(prev => {
        const newItems = [...prev];
        newItems[index] = item;
        return newItems;
      });
    } else {
      // Update only the specific section
      switch (section) {
        case 'invoice':
          setInvoiceItems(prev => {
            const newItems = [...prev];
            newItems[index] = item;
            return newItems;
          });
          break;
        case 'order':
          setOrderItems(prev => {
            const newItems = [...prev];
            newItems[index] = item;
            return newItems;
          });
          break;
        case 'delivery':
          setDeliveryItems(prev => {
            const newItems = [...prev];
            newItems[index] = item;
            return newItems;
          });
          break;
      }
    }
  };

  const handleMaterialSelect = (section: 'invoice' | 'order' | 'delivery', materialId: string, index: number) => {
    const material = filteredMaterials.find((m) => m.cid.toString() === materialId);
    if (!material) return;

    const taxInfo = getTaxCodeInfo(material.ctaxcode);
    const newItem: MMItem = {
      materialId,
      quantity: 1,
      unit: material.cunit || 'ST',
      price: material.cnetamount || 0,
      taxRate: taxInfo.taxRate,
      total: material.cnetamount || 0,
      currency: taxInfo.currency,
    };

    handleItemChange(section, index, newItem);
  };

  return (
    <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl shadow-purple-500/20 border-2 border-purple-300/60 p-6 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">{t('enterItems')}</h3>
          {mode === 'MM' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sync-materials"
                checked={syncMaterials}
                onChange={(e) => setSyncMaterials(e.target.checked)}
                className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="sync-materials" className="text-sm font-medium text-gray-700">
                {t('form.sync')}
              </label>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-6">

          {mode === 'MM' && (
            <>
              {/* Invoice Items Section */}
              <MMItemsSection
                title={t('form.invoiceItems')}
                items={invoiceItems}
                materials={filteredMaterials}
                companyCode={currentCompanyCode}
                onAddItem={() => {
                  const newItem = {
                    materialId: '',
                    quantity: 1,
                    unit: '',
                    price: 0,
                    taxRate: 19,
                    total: 0,
                    currency: undefined,
                  };
                  if (syncMaterials) {
                    setInvoiceItems([...invoiceItems, newItem]);
                    setOrderItems([...orderItems, newItem]);
                    setDeliveryItems([...deliveryItems, newItem]);
                  } else {
                    setInvoiceItems([...invoiceItems, newItem]);
                  }
                }}
                onRemoveItem={(index) => {
                  if (syncMaterials) {
                    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
                    setOrderItems(orderItems.filter((_, i) => i !== index));
                    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
                  } else {
                    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
                  }
                }}
                onUpdateItem={(index, item) => handleItemChange('invoice', index, item)}
                onMaterialSelect={(materialId, index) => handleMaterialSelect('invoice', materialId, index)}
              />

              {/* Order Items Section */}
              <MMItemsSection
                title={t('form.orderItems')}
                items={orderItems}
                materials={filteredMaterials}
                companyCode={currentCompanyCode}
                onAddItem={() => {
                  const newItem = {
                    materialId: '',
                    quantity: 1,
                    unit: '',
                    price: 0,
                    taxRate: 19,
                    total: 0,
                    currency: undefined,
                  };
                  if (syncMaterials) {
                    setInvoiceItems([...invoiceItems, newItem]);
                    setOrderItems([...orderItems, newItem]);
                    setDeliveryItems([...deliveryItems, newItem]);
                  } else {
                    setOrderItems([...orderItems, newItem]);
                  }
                }}
                onRemoveItem={(index) => {
                  if (syncMaterials) {
                    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
                    setOrderItems(orderItems.filter((_, i) => i !== index));
                    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
                  } else {
                    setOrderItems(orderItems.filter((_, i) => i !== index));
                  }
                }}
                onUpdateItem={(index, item) => handleItemChange('order', index, item)}
                onMaterialSelect={(materialId, index) => handleMaterialSelect('order', materialId, index)}
              />

              {/* Delivery Items Section */}
              <MMItemsSection
                title={t('form.deliveryItems')}
                items={deliveryItems}
                materials={filteredMaterials}
                companyCode={currentCompanyCode}
                onAddItem={() => {
                  const newItem = {
                    materialId: '',
                    quantity: 1,
                    unit: '',
                    price: 0,
                    taxRate: 19,
                    total: 0,
                    currency: undefined,
                  };
                  if (syncMaterials) {
                    setInvoiceItems([...invoiceItems, newItem]);
                    setOrderItems([...orderItems, newItem]);
                    setDeliveryItems([...deliveryItems, newItem]);
                  } else {
                    setDeliveryItems([...deliveryItems, newItem]);
                  }
                }}
                onRemoveItem={(index) => {
                  if (syncMaterials) {
                    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
                    setOrderItems(orderItems.filter((_, i) => i !== index));
                    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
                  } else {
                    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
                  }
                }}
                onUpdateItem={(index, item) => handleItemChange('delivery', index, item)}
                onMaterialSelect={(materialId, index) => handleMaterialSelect('delivery', materialId, index)}
              />
            </>
          )}

          {mode === 'FI' && (
            <FIItemsSection
              title={t('form.fiItems')}
              items={fiItems}
              materials={filteredMaterials}
              getTaxCodeInfo={getTaxCodeInfo}
              onAddItem={() => {
                setFIItems([...fiItems, {
                  materialId: '',
                  quantity: 1,
                  unit: '',
                  price: 0,
                  taxRate: 19,
                  total: 0,
                  currency: undefined,
                  description: ''
                }]);
              }}
              onRemoveItem={(index) => {
                setFIItems(fiItems.filter((_, i) => i !== index));
              }}
              onUpdateItem={(index, item) => {
                const newItems = [...fiItems];
                newItems[index] = item as FIItem;
                setFIItems(newItems);
              }}
              onMaterialSelect={(materialId, index) => {
                const material = filteredMaterials.find((m) => m.cid.toString() === materialId);
                if (!material) return;

                const taxInfo = getTaxCodeInfo(material.ctaxcode);

                setFIItems((prev) => {
                  const newItems = [...prev];
                  newItems[index] = {
                    materialId,
                    quantity: 1,
                    unit: material.cunit || 'ST',
                    price: material.cnetamount || 0,
                    taxRate: taxInfo.taxRate,
                    total: material.cnetamount || 0,
                    currency: taxInfo.currency,
                    description: material.cdescription || `Material ${material.cmaterialnumber}`,
                  };
                  return newItems;
                });
              }}
            />
          )}
      </div>
    </div>
  );
}
import { Dispatch, SetStateAction } from 'react';
import { Building2, UserPlus, History } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FormStepIndicator } from './ui/StepIndicator';
// Dropdown menu imports removed - no longer needed
import { DemoDataFiller } from './DemoDataFiller';
import { useLanguage } from '@/context/LanguageContext';
import { type TemplateName } from '../lib/pdf/templates';
import { MMItem, FIItem } from '@/types/forms';

interface InvoiceFormHeaderProps {
  mode: 'MM' | 'FI';
  setMode: Dispatch<SetStateAction<'MM' | 'FI'>>;
  template: TemplateName;
  setTemplate: Dispatch<SetStateAction<TemplateName>>;
  setIsVendorModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreditorModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsBulkMaterialModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsVersionsModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsConfirmDialogOpen: Dispatch<SetStateAction<boolean>>;
  // Demo Data Props
  vendors: any[];
  recipients: any[];
  materials: any[];
  currentVendorId?: string;
  currentRecipientId?: string;
  onFillData: (data: {
    basicInfo?: {
      invoiceNumber?: string;
      vendorId?: string;
      recipientId?: string;
      invoiceDate?: string;
      orderDate?: string;
      deliveryDate?: string;
      customerNumber?: string;
      processor?: string;
    };
    invoiceItems?: MMItem[];
    orderItems?: MMItem[];
    deliveryItems?: MMItem[];
    fiItems?: FIItem[];
  }) => void;
}

export function InvoiceFormHeader({
  mode,
  setMode,
  template,
  setTemplate,
  setIsVendorModalOpen,
  setIsCreditorModalOpen,
  setIsBulkMaterialModalOpen,
  setIsVersionsModalOpen,
  setIsConfirmDialogOpen,
  vendors,
  recipients,
  materials,
  currentVendorId,
  currentRecipientId,
  onFillData,
}: InvoiceFormHeaderProps) {
  const { t } = useLanguage();

  // Check if Step 1 is completed (mode and template are selected)
  const isStep1Completed = mode && template;

  return (
    <>
      {/* Enhanced Action Buttons with integrated Mode & Template */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white backdrop-blur-sm rounded-2xl border-2 border-purple-300/60 shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Selection integriert */}
          <div className="flex items-center gap-2 mr-4">
            <label className="font-semibold text-purple-800 text-sm">Mode:</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                type="button"
                variant={mode === 'MM' ? 'default' : 'outline'}
                className={mode === 'MM' 
                  ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95' 
                  : 'border-purple-200/60 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:border-purple-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95'
                }
                onClick={() => setMode('MM')}
              >
                MM
              </Button>
              <Button
                size="sm"
                type="button"
                variant={mode === 'FI' ? 'default' : 'outline'}
                className={mode === 'FI' 
                  ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95' 
                  : 'border-purple-200/60 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:border-purple-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95'
                }
                onClick={() => setMode('FI')}
              >
                FI
              </Button>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="border-purple-200/60 bg-white/90 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:border-purple-300 h-10 px-4 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
            type="button"
            onClick={() => {
              setIsConfirmDialogOpen(false);
              setIsVendorModalOpen(true);
            }}
          >
            <Building2 className="h-4 w-4 mr-2" />
            {t('create.vendor')}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="border-purple-200/60 bg-white/90 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:border-purple-300 h-10 px-4 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
            type="button"
            onClick={() => {
              setIsConfirmDialogOpen(false);
              setIsCreditorModalOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t('create.recipient')}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="border-purple-200/60 bg-white/90 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:border-purple-300 h-10 px-4 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
            type="button"
            onClick={() => {
              setIsConfirmDialogOpen(false);
              setIsBulkMaterialModalOpen(true);
            }}
          >
            <div className="h-4 w-4 mr-2 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-sm"></div>
              </div>
            </div>
            {t('material.createBulk')}
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Template Selection integriert */}
          <div className="flex items-center gap-2">
            <label className="font-semibold text-purple-800 text-sm">Template:</label>
            <div className="w-44">
              <Select value={template} onValueChange={(value) => setTemplate(value as TemplateName)}>
                <SelectTrigger className="border-purple-200/60 focus:border-purple-400 focus:ring-purple-100 bg-white/90 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="businessstandard">{t('template.businessstandard')}</SelectItem>
                  <SelectItem value="classic">{t('template.classic')}</SelectItem>
                  <SelectItem value="professional">{t('template.professional')}</SelectItem>
                  <SelectItem value="businessgreen">{t('template.businessgreen')}</SelectItem>
                  <SelectItem value="allrauer2">{t('template.allrauer2')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DemoDataFiller
            mode={mode}
            vendors={vendors}
            recipients={recipients}
            materials={materials}
            currentVendorId={currentVendorId}
            currentRecipientId={currentRecipientId}
            onFillData={onFillData}
          />
          
          <Button
            size="sm"
            variant="outline"
            className="border-purple-200/60 bg-white/90 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:border-purple-300 h-10 px-4 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
            type="button"
            onClick={() => setIsVersionsModalOpen(true)}
          >
            <History className="h-4 w-4 mr-2" />
            {t('versions.title')}
          </Button>
        </div>
      </div>
    </>
  );
}
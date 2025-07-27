import { FormProvider, useForm } from 'react-hook-form';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { generateInvoiceXML, downloadXML } from '@/lib/xmlGenerator';
import { validatePDFData, extendVendor, extendRecipient } from '../lib/dataTransforms';
import { useInvoiceForm } from '../hooks/useInvoiceForm';
import { type Logo } from '../lib/logoManager';
import { useLanguage } from '@/context/LanguageContext';
import { type PDFGeneratorOptions } from '../lib/pdfTypes';
import { type TemplateName } from '../lib/pdf/templates';
import { generatePDF } from '../lib/pdf/generator';
import { EnhancedStepsProgress } from './ui/EnhancedStepsProgress';
import { ContextualHelpPanel } from './ui/ContextualHelpPanel';
import { useStepTracking } from '../hooks/useStepTracking';
import {
  createPurchaseOrder,
  createDeliveryNote,
  formatAPIError,
  APIError,
  getLastNumbers,
} from '../lib/api';
import { createPurchaseOrder as createPO, createDeliveryNote as createDN } from '../lib/dataProcessing';
import { MMItem, FIItem, defaultMMItem, defaultFIItem, type BasicInfo } from '../types/forms';

// Import new split components
import { InvoiceFormHeader } from './InvoiceFormHeader';
import { InvoiceFormContent } from './InvoiceFormContent';
import { InvoiceFormActions } from './InvoiceFormActions';
import { InvoiceFormModals } from './InvoiceFormModals';
import { InvoiceBasicInfo } from './InvoiceBasicInfo';
import { LogoUpload } from './LogoUpload';
import { useInvoiceFormData } from '../hooks/useInvoiceFormData';

// UI Components
import { LoadingSpinner } from './ui/loading-spinner';
import useToast from './ui/toast';
import useAutoSave from '@/hooks/useAutoSave';
import { createStandardToastHandlers, ErrorTypes } from '../lib/errorHandling';

const INITIAL_ORDER_NUMBER = 4500000000;
const INITIAL_DELIVERY_NOTE_NUMBER = 1;

// TypeScript interface for global variable
declare global {
  interface Window {
    _lastSubmitResult?: {
      order?: {
        cid?: string;
        cponumber?: string;
      };
      note?: {
        cid?: string;
        cdnnumberexternal?: string;
      };
    };
  }
}

interface InvoiceFormProps {
  onSubmitSuccess?: () => void;
}

export function InvoiceForm({ onSubmitSuccess }: InvoiceFormProps): JSX.Element {
  const queryClient = useQueryClient();
  const { t, currentLanguage } = useLanguage();
  const { showToast, ToastContainer: toastContainer } = useToast();
  const standardToast = createStandardToastHandlers(showToast, t);

  // React Hook Form Setup
  const methods = useForm<BasicInfo>({
    defaultValues: {
      invoiceNumber: '',
      vendorId: '',
      recipientId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      orderDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
      })(),
      deliveryDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() - 2);
        return date.toISOString().split('T')[0];
      })(),
      customerNumber: '',
      processor: '',
    },
    mode: 'onChange',
  });

  // Use custom hook for data fetching and filtering
  const {
    vendors,
    materials,
    recipients,
    taxCodes,
    exchangeRates,
    filteredMaterials,
    recipientCompanyCode,
    getTaxCodeInfo,
    getExchangeRate,
    isLoading,
    hasError,
    errorDetails,
  } = useInvoiceFormData(methods);

  // Workflow status for PDF checking
  const [workflowState, setWorkflowState] = useState<'initial' | 'previewGenerated' | 'submitted'>('initial');
  const [previewDocument, setPreviewDocument] = useState<any>(null);

  // Counters for PO and Delivery Note
  const [orderNumberCounter, setOrderNumberCounter] = useState(INITIAL_ORDER_NUMBER);
  const [deliveryNoteCounter, setDeliveryNoteCounter] = useState(INITIAL_DELIVERY_NOTE_NUMBER);
  const [numbersLoaded, setNumbersLoaded] = useState(false);

  // Submit results state
  const [submitResults, setSubmitResults] = useState<{ 
    order?: any, 
    note?: any 
  } | null>(null);

  // Main form state
  const [mode, setMode] = useState<'MM' | 'FI'>('MM');
  const [syncMaterials, setSyncMaterials] = useState(false);
  const [logo, setLogo] = useState<Logo | null>(null);
  const [logoConfig, setLogoConfig] = useState<any>(null);
  const [template, setTemplate] = useState<TemplateName>('businessstandard');

  // Loading states
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  // UI state for help panel
  const [isHelpCollapsed, setIsHelpCollapsed] = useState(false);

  // Modal states
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isBulkMaterialModalOpen, setIsBulkMaterialModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isCreditorModalOpen, setIsCreditorModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoadingVersion, setIsLoadingVersion] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);

  // XML and PDF states
  const [xmlGenerationData, setXmlGenerationData] = useState<any>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Items state
  const [invoiceItems, setInvoiceItems] = useState<MMItem[]>([defaultMMItem]);
  const [orderItems, setOrderItems] = useState<MMItem[]>([defaultMMItem]);
  const [deliveryItems, setDeliveryItems] = useState<MMItem[]>([defaultMMItem]);
  const [fiItems, setFIItems] = useState<FIItem[]>([defaultFIItem]);

  // AutoSave Integration
  const formData = {
    ...methods.getValues(),
    mode,
    template,
    invoiceItems,
    orderItems,
    deliveryItems,
    fiItems,
    orderNumberCounter,
    deliveryNoteCounter,
  };

  const {
    save: saveForm,
    versions,
    loadVersion: loadVersionData,
    clearAll: clearVersions,
    lastSaved,
    isSaving,
    saveNamed,
    deleteVersion,
    renameVersion
  } = useAutoSave({
    data: formData,
    key: 'invoice_form',
    interval: 0,
    onAfterSave: (data) => {
      standardToast.showSuccess('autosave.saved', new Date().toLocaleTimeString());
    },
    onSaveError: (error) => {
      standardToast.showError(ErrorTypes.SAVE_ERROR, error);
    },
  });

  // Version loading function that properly updates form state
  const loadVersion = useCallback((timestamp: number) => {
    try {
      const versionData = loadVersionData(timestamp);
      if (versionData) {
        // Update React Hook Form
        methods.reset(versionData.basicInfo || {});
        
        // Update other form data through setter functions
        if (versionData.mode) setMode(versionData.mode);
        if (versionData.template) setTemplate(versionData.template);
        if (versionData.invoiceItems) setInvoiceItems(versionData.invoiceItems);
        if (versionData.orderItems) setOrderItems(versionData.orderItems);
        if (versionData.deliveryItems) setDeliveryItems(versionData.deliveryItems);
        if (versionData.fiItems) setFIItems(versionData.fiItems);
        if (versionData.logo) setLogo(versionData.logo);
        if (versionData.logoConfig) setLogoConfig(versionData.logoConfig);
        
        standardToast.showSuccess('versions.loaded', '');
        return versionData;
      } else {
        standardToast.showError('versions.loadError', 'Version not found');
        return null;
      }
    } catch (error) {
      console.error('Error loading version:', error);
      standardToast.showError('versions.loadError', error);
      return null;
    }
  }, [loadVersionData, methods, setMode, setTemplate, setInvoiceItems, setOrderItems, setDeliveryItems, setFIItems, setLogo, setLogoConfig, standardToast]);

  // Load last numbers on component mount
  useEffect(() => {
    if (!numbersLoaded) {
      getLastNumbers()
        .then(({ lastPONumber, lastDNNumber }) => {
          const poNumber = parseInt(lastPONumber) || INITIAL_ORDER_NUMBER;
          // Extrahiere nur die numerische Zahl aus L2BRL Format (z.B. L2BRL0047 -> 47)
          const dnMatch = lastDNNumber.match(/L2BRL0*(\d+)/);
          const dnNumber = dnMatch ? parseInt(dnMatch[1]) : INITIAL_DELIVERY_NOTE_NUMBER;
          
          setOrderNumberCounter(poNumber);
          setDeliveryNoteCounter(dnNumber);
          setNumbersLoaded(true);
        })
        .catch(error => {
          console.warn('Could not load last numbers, using defaults:', error);
          setNumbersLoaded(true);
        });
    }
  }, [numbersLoaded]);

  // Use centralized step tracking
  const stepTracking = useStepTracking({
    context: 'form',
    methods,
    mode,
    template,
    logo,
    invoiceItems,
    fiItems,
    pdfBlob
  });

  // Memoized expensive operations for performance
  const memoizedValidItems = useMemo(() => {
    return invoiceItems.filter(item => item.materialId?.trim());
  }, [invoiceItems]);

  const memoizedMappedItems = useMemo(() => {
    return memoizedValidItems.map(item => {
      const material = materials.find(m => m.cid?.toString() === item.materialId);
      return {
        item,
        material,
        isValid: !!material
      };
    });
  }, [memoizedValidItems, materials]);

  // PDF generation handlers
  const handlePreviewPDF = async () => {
    setIsPreviewLoading(true);
    try {
      const formData = methods.getValues();
      const currentVendor = vendors.find(v => v.cid?.toString() === formData.vendorId);
      const currentRecipient = recipients.find(r => r.cid?.toString() === formData.recipientId);

      if (!currentVendor || !currentRecipient) {
        throw new Error('Vendor and recipient must be selected');
      }

      // Validate vendor bank data
      if (!currentVendor.bank_name || !currentVendor.ciban || !currentVendor.cbic) {
        console.warn('Vendor bank data incomplete - PDF may have missing payment information');
      }

      // Prepare PDF data for FI mode
      const pdfData: PDFGeneratorOptions = {
        invoiceNumber: formData.invoiceNumber || 'PREVIEW-001',
        invoiceDate: formData.invoiceDate,
        orderDate: formData.orderDate,
        deliveryDate: formData.deliveryDate,
        customerNumber: formData.customerNumber,
        processor: formData.processor,
        vendor: extendVendor(currentVendor),
        recipient: extendRecipient(currentRecipient),
        items: fiItems.filter(item => item.description?.trim()).map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity?.toString() || '0') || 0,
          unit: item.unit || 'ST',
          price: parseFloat(item.price?.toString() || '0') || 0,
          total: parseFloat(item.total?.toString() || '0') || 0,
          currency: item.currency || 'EUR',
          taxCode: item.taxCode,
          taxRate: item.taxRate || 0
        })),
        logo: logo?.dataUrl,
        logoConfig: logoConfig,
        mode: 'FI',
        template: template
      };

      // Validate PDF data (validatePDFData throws on validation errors)
      const validatedData = validatePDFData(pdfData);

      // Generate PDF
      const blob = await generatePDF(validatedData, template, t, currentLanguage) as Blob;

      // PDF generated successfully - verify blob and set for preview
      if (blob && blob.size > 0) {
        setPdfBlob(blob);
        setPreviewDocument(validatedData);
        setWorkflowState('previewGenerated');
        standardToast.showSuccess('pdf.generated', 'PDF preview generated successfully');
      } else {
        throw new Error('Generated PDF blob is empty or invalid');
      }

    } catch (error) {
      console.error('Error generating PDF preview:', error);
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast({
        title: 'PDF Generation Failed',
        message: `Failed to generate PDF: ${errorMessage}`,
        type: 'error'
      });
      
      standardToast.showError(ErrorTypes.PDF_GENERATION_ERROR, error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handlePreviewMMPDF = async () => {
    setIsPreviewLoading(true);
    try {
      const formData = methods.getValues();
      const currentVendor = vendors.find(v => v.cid?.toString() === formData.vendorId);
      const currentRecipient = recipients.find(r => r.cid?.toString() === formData.recipientId);

      if (!currentVendor || !currentRecipient) {
        throw new Error('Vendor and recipient must be selected');
      }

      // Validate vendor bank data for MM mode
      if (!currentVendor.bank_name || !currentVendor.ciban || !currentVendor.cbic) {
        console.warn('Vendor bank data incomplete - MM PDF may have missing payment information');
      }

      // Use memoized items for better performance
      if (memoizedValidItems.length === 0) {
        throw new Error('No valid items found. Please add at least one item with a valid material.');
      }

      // Check if all materials are found
      const invalidItems = memoizedMappedItems.filter(mapped => !mapped.isValid);
      if (invalidItems.length > 0) {
        const invalidIds = invalidItems.map(mapped => mapped.item.materialId).join(', ');
        throw new Error(`Materials not found for IDs: ${invalidIds}. Please select valid materials.`);
      }

      // Prepare PDF data for MM mode  
      const nextOrderNumber = `${orderNumberCounter + 1}`;
      const nextDeliveryNoteNumber = `L2BRL${(deliveryNoteCounter + 1).toString().padStart(4, '0')}`;
      
      
      const pdfData: PDFGeneratorOptions = {
        invoiceNumber: formData.invoiceNumber || 'PREVIEW-001',
        invoiceDate: formData.invoiceDate,
        orderDate: formData.orderDate,
        deliveryDate: formData.deliveryDate,
        orderNumber: nextOrderNumber,
        deliveryNoteNumber: nextDeliveryNoteNumber,
        customerNumber: formData.customerNumber,
        processor: formData.processor,
        vendor: extendVendor(currentVendor),
        recipient: extendRecipient(currentRecipient),
        items: memoizedMappedItems.map(mapped => {
          const { item, material } = mapped;
          return {
            description: material!.cmaterialname || material!.cdescription || `Material ${item.materialId}`,
            quantity: parseFloat(item.quantity?.toString() || '0') || 0,
            unit: item.unit || material!.cunit || 'ST',
            price: parseFloat(item.price?.toString() || '0') || 0,
            total: parseFloat(item.total?.toString() || '0') || 0,
            currency: item.currency || material!.ccurrency || 'EUR',
            materialId: item.materialId,
            taxCode: material!.ctaxcode || '',
            taxRate: item.taxRate || material!.ctaxrate || 0
          };
        }),
        logo: logo?.dataUrl,
        logoConfig: logoConfig,
        mode: 'MM',
        template: template
      };

      // Validate PDF data (validatePDFData throws on validation errors)
      const validatedData = validatePDFData(pdfData);

      // Generate PDF
      const blob = await generatePDF(validatedData, template, t, currentLanguage) as Blob;

      // PDF generated successfully - verify blob and set for preview
      if (blob && blob.size > 0) {
        setPdfBlob(blob);
        setPreviewDocument(validatedData);
        setWorkflowState('previewGenerated');
        standardToast.showSuccess('pdf.generated', 'PDF preview generated successfully');
      } else {
        throw new Error('Generated PDF blob is empty or invalid');
      }

    } catch (error) {
      console.error('Error generating MM PDF preview:', error);
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast({
        title: 'MM PDF Generation Failed',
        message: `Failed to generate MM PDF: ${errorMessage}`,
        type: 'error'
      });
      
      standardToast.showError(ErrorTypes.PDF_GENERATION_ERROR, error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownloadXML = () => {
    if (xmlGenerationData) {
      const filename = `invoice-${new Date().toISOString().split('T')[0]}.xml`;
      downloadXML(xmlGenerationData, filename);
    }
  };

  const handleDownloadPDF = useCallback(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up URL to prevent memory leaks
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }, [pdfBlob]);

  const handleCreateMMDocument = async () => {
    console.log('Creating MM document...');
    
    // Check if we have necessary data
    const formData = methods.getValues();
    const currentVendor = vendors.find(v => v.cid?.toString() === formData.vendorId);
    const currentRecipient = recipients.find(r => r.cid?.toString() === formData.recipientId);

    if (!currentVendor || !currentRecipient) {
      showToast({
        title: 'Validation Error',
        message: 'Please select both vendor and recipient before creating MM document',
        type: 'error'
      });
      return;
    }

    if (!invoiceItems.some(item => item.materialId?.trim())) {
      showToast({
        title: 'Validation Error',
        message: 'Please add at least one item before creating MM document',
        type: 'error'
      });
      return;
    }

    // Show confirmation dialog
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSubmitToDatabase = async () => {
    setIsConfirmDialogOpen(false);
    
    try {
      const formData = methods.getValues();
      console.log('=== FORM DEBUG ===');
      console.log('Form Data:', { vendorId: formData.vendorId, recipientId: formData.recipientId });
      console.log('Available Vendors:', vendors.map(v => ({ cid: v.cid, name: v.cname })));
      console.log('Available Recipients:', recipients.map(r => ({ cid: r.cid, name: r.cname })));
      
      const currentVendor = vendors.find(v => v.cid?.toString() === formData.vendorId);
      const currentRecipient = recipients.find(r => r.cid?.toString() === formData.recipientId);

      console.log('Found Vendor:', currentVendor ? { cid: currentVendor.cid, name: currentVendor.cname } : null);
      console.log('Found Recipient:', currentRecipient ? { cid: currentRecipient.cid, name: currentRecipient.cname } : null);

      if (!currentVendor || !currentRecipient) {
        throw new Error('Vendor and recipient must be selected');
      }

      // Prepare basic info for PO/DN creation - convert form string IDs to database format
      const basicInfo = {
        vendorId: currentVendor.cid?.toString() || '', // Use actual database ID as string
        recipientId: currentRecipient.cid?.toString() || '', // Use actual database ID as string
        orderDate: formData.orderDate,
        ccompanycode: currentRecipient.ccompanycode
      };

      console.log('BasicInfo for API:', basicInfo);
      console.log('Current Vendor:', { id: currentVendor.cid, name: currentVendor.cname });
      console.log('Current Recipient:', { id: currentRecipient.cid, name: currentRecipient.cname });

      // Create Purchase Order
      console.log('Creating PO with basicInfo:', basicInfo);
      console.log('Invoice items:', invoiceItems);
      const orderData = createPO(basicInfo, invoiceItems, materials);
      console.log('Order data created:', orderData);
      console.log('Order data structure:', {
        order: orderData.order,
        items: orderData.items?.length || 0
      });
      const orderResult = await createPurchaseOrder(orderData.order, orderData.items);

      // Create Delivery Note
      const deliveryBasicInfo = {
        deliveryDate: basicInfo.orderDate, // Use order date as delivery date
        cdnnumberexternal: '' // Will be generated by server
      };
      const noteData = createDN(deliveryBasicInfo, invoiceItems, orderResult.order.cid.toString());
      const noteResult = await createDeliveryNote(noteData.note, noteData.items);

      // Update counters
      setOrderNumberCounter(orderNumberCounter + 1);
      setDeliveryNoteCounter(deliveryNoteCounter + 1);

      // Store results globally for reference
      window._lastSubmitResult = {
        order: orderResult.order,
        note: noteResult.note
      };

      showToast({
        title: 'Success',
        message: `MM Document created successfully!\nPO: ${orderResult.order.cponumber}\nDN: ${noteResult.note.cdnnumberexternal}`,
        type: 'success'
      });

      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

    } catch (error) {
      console.error('Error submitting MM document:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast({
        title: 'Submission Failed',
        message: `Failed to create MM document: ${errorMessage}`,
        type: 'error'
      });
    }
  };

  // Handle demo data filling
  const handleFillDemoData = (data: any) => {
    // Fill basic info
    if (data.basicInfo) {
      Object.keys(data.basicInfo).forEach(key => {
        methods.setValue(key as any, data.basicInfo[key]);
      });
    }

    // Fill items based on mode - force new array creation to trigger re-render
    if (data.invoiceItems) {
      setInvoiceItems([...data.invoiceItems]); // Force new array
    }
    if (data.orderItems) {
      setOrderItems([...data.orderItems]); // Force new array
    }
    if (data.deliveryItems) {
      setDeliveryItems([...data.deliveryItems]); // Force new array
    }
    if (data.fiItems) {
      setFIItems([...data.fiItems]); // Force new array
    }
  };

  // Show loading spinner while data is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state with detailed information

  /*
  if (hasError) {
    const failedServices = Object.entries(errorDetails)
      .filter(([, error]) => error)
      .map(([service]) => service);

    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold text-red-600 mb-4">
          {t('errors.load.title')}
        </h3>
        <div className="space-y-3">
          <p className="text-gray-600">
            {t('errors.load.message')}
          </p>
          {failedServices.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-2">
                Failed to load:
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                {failedServices.map(service => (
                  <li key={service}>• {service}</li>
                ))}
              </ul>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  */

  return (
    <FormProvider {...methods}>
      <div className="p-4">
        <form onSubmit={methods.handleSubmit(() => {})}>
          <div className="min-h-screen px-2 space-y-4">
            
            {/* Main Layout: Fixed Left Sidebar + Right Main Area */}
            <div className="flex gap-4 min-h-screen">
              
              {/* Fixed Left Sidebar: Wizard + Help (240px width für bessere Nutzung) */}
              <div className="w-60 flex-shrink-0">
                <div className="sticky top-4 space-y-4">
                  <EnhancedStepsProgress
                    completedSteps={stepTracking.completedSteps}
                    currentStep={stepTracking.currentStep || undefined}
                    orientation="vertical"
                  />
                  
                  {/* Help Panel direkt unter Wizard */}
                  {!isHelpCollapsed && (
                    <ContextualHelpPanel
                      currentStep={stepTracking.currentStep || 'mode'}
                      completedSteps={stepTracking.completedSteps}
                      isCollapsed={isHelpCollapsed}
                      onToggleCollapse={() => setIsHelpCollapsed(!isHelpCollapsed)}
                    />
                  )}
                  
                  {/* Collapsed Help Toggle */}
                  {isHelpCollapsed && (
                    <button
                      onClick={() => setIsHelpCollapsed(false)}
                      className="w-full bg-gradient-to-br from-purple-500 to-purple-700 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                      title="Hilfe anzeigen"
                    >
                      <svg className="h-5 w-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Main Area: Shared Toolbar + 3 Columns für optimale Viewport-Nutzung */}
              <div className="flex-1 space-y-4">
                
                {/* Shared Toolbar (full width above both columns) */}
                <InvoiceFormHeader
                  mode={mode}
                  setMode={setMode}
                  template={template}
                  setTemplate={setTemplate}
                  setIsVendorModalOpen={setIsVendorModalOpen}
                  setIsCreditorModalOpen={setIsCreditorModalOpen}
                  setIsBulkMaterialModalOpen={setIsBulkMaterialModalOpen}
                  setIsVersionsModalOpen={setIsVersionsModalOpen}
                  setIsConfirmDialogOpen={setIsConfirmDialogOpen}
                  vendors={vendors}
                  recipients={recipients}
                  materials={materials}
                  currentVendorId={methods.watch('vendorId')}
                  currentRecipientId={methods.watch('recipientId')}
                  onFillData={handleFillDemoData}
                />

                {/* Main Content: 3 Columns für bessere Viewport-Nutzung */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  
                  {/* Column 1: Configuration + Basic Info */}
                  <div className="space-y-4">
                    {/* Configuration Section */}
                    <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl shadow-purple-500/20 border-2 border-purple-300/60 p-4 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
                      <h3 className="font-semibold text-gray-900 flex items-center text-base mb-4 tracking-tight">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-purple-500/30">
                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                          </svg>
                        </div>
                        Logo
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Logo Upload */}
                        <LogoUpload 
                          onSuccess={(selectedLogo) => {
                            setLogo(selectedLogo);
                            const defaultConfig = {
                              maxWidth: 200,
                              maxHeight: 60,
                              alignment: 'right'
                            };
                            setLogoConfig(defaultConfig);
                          }}
                          onDialogChange={setIsLogoDialogOpen}
                          onLogoConfigChange={setLogoConfig}
                        />
                      </div>
                    </div>

                    {/* Basic Information - 2-spaltig innerhalb */}
                    <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl shadow-purple-500/20 border-2 border-purple-300/60 p-4 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
                      <InvoiceBasicInfo mode={mode} vendors={vendors} recipients={recipients} />
                    </div>
                  </div>

                  {/* Column 2: Items */}
                  <div>
                    <InvoiceFormContent
                      mode={mode}
                      syncMaterials={syncMaterials}
                      setSyncMaterials={setSyncMaterials}
                      logo={logo}
                      setLogo={setLogo}
                      logoConfig={logoConfig}
                      setLogoConfig={setLogoConfig}
                      setIsLogoDialogOpen={setIsLogoDialogOpen}
                      vendors={vendors}
                      recipients={recipients}
                      invoiceItems={invoiceItems}
                      setInvoiceItems={setInvoiceItems}
                      orderItems={orderItems}
                      setOrderItems={setOrderItems}
                      deliveryItems={deliveryItems}
                      setDeliveryItems={setDeliveryItems}
                      fiItems={fiItems}
                      setFIItems={setFIItems}
                      filteredMaterials={filteredMaterials}
                      getTaxCodeInfo={getTaxCodeInfo}
                      template={template}
                      methods={methods}
                      pdfBlob={pdfBlob}
                      isPreviewLoading={isPreviewLoading}
                      previewDocument={previewDocument}
                      handlePreviewPDF={handlePreviewPDF}
                      handlePreviewMMPDF={handlePreviewMMPDF}
                      handleDownloadXML={handleDownloadXML}
                      handleDownloadPDF={handleDownloadPDF}
                      handleCreateMMDocument={handleCreateMMDocument}
                    />
                  </div>

                  {/* Column 3: PDF Preview & Actions */}
                  <div>
                    <div className="sticky top-24">
                      <InvoiceFormActions
                        mode={mode}
                        template={template}
                        vendors={vendors}
                        recipients={recipients}
                        methods={methods}
                        pdfBlob={pdfBlob}
                        isPreviewLoading={isPreviewLoading}
                        previewDocument={previewDocument}
                        handlePreviewPDF={handlePreviewPDF}
                        handlePreviewMMPDF={handlePreviewMMPDF}
                        handleDownloadXML={handleDownloadXML}
                        handleDownloadPDF={handleDownloadPDF}
                        handleCreateMMDocument={handleCreateMMDocument}
                      />
                    </div>
                  </div>
                  
                </div>
              </div>
            </div> 
          </div>
        </form>

        {/* All Modal Dialogs */}
        <InvoiceFormModals
          isBulkMaterialModalOpen={isBulkMaterialModalOpen}
          setIsBulkMaterialModalOpen={setIsBulkMaterialModalOpen}
          isVendorModalOpen={isVendorModalOpen}
          setIsVendorModalOpen={setIsVendorModalOpen}
          isCreditorModalOpen={isCreditorModalOpen}
          setIsCreditorModalOpen={setIsCreditorModalOpen}
          isVersionsModalOpen={isVersionsModalOpen}
          setIsVersionsModalOpen={setIsVersionsModalOpen}
          isConfirmDialogOpen={isConfirmDialogOpen}
          setIsConfirmDialogOpen={setIsConfirmDialogOpen}
          isLoadingVersion={isLoadingVersion}
          materials={materials}
          vendors={vendors}
          recipients={recipients}
          versions={versions}
          loadVersion={loadVersion}
          deleteVersion={deleteVersion}
          renameVersion={renameVersion}
          clearVersions={clearVersions}
          lastSaved={lastSaved}
          saveForm={saveForm}
          saveNamed={saveNamed}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            queryClient.invalidateQueries({ queryKey: ['recipients'] });
            queryClient.invalidateQueries({ queryKey: ['materials'] });
          }}
          onConfirmSubmit={handleConfirmSubmitToDatabase}
        />

        {/* Toast Container */}
        {toastContainer}
      </div>
    </FormProvider>
  );
}
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
import { DemoDataFiller } from './DemoDataFiller';
import { Building2, UserPlus, History, Package, FileText, Eye, Settings, Sparkles, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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
        logo: logo?.content,
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
        logo: logo?.content,
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

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50">
        <form onSubmit={methods.handleSubmit(() => {})}>
          
          {/* Clean Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Invoice Generator</h1>
                    <p className="text-sm text-gray-500">Create professional invoices with ease</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  {/* Mode Selection */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Mode:</span>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setMode('MM')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          mode === 'MM' 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        MM
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('FI')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          mode === 'FI' 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        FI
                      </button>
                    </div>
                  </div>

                  {/* Template Selection */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Template:</span>
                    <Select value={template} onValueChange={(value) => setTemplate(value as TemplateName)}>
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="businessstandard">Business Standard</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="businessgreen">Business Green</SelectItem>
                        <SelectItem value="allrauer2">Allrauer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      onClick={() => setIsVersionsModalOpen(true)}
                      variant="outline"
                      size="sm"
                    >
                      <History className="h-4 w-4 mr-1" />
                      Versions
                    </Button>
                    <DemoDataFiller
                      mode={mode}
                      vendors={vendors}
                      recipients={recipients}
                      materials={materials}
                      currentVendorId={methods.watch('vendorId')}
                      currentRecipientId={methods.watch('recipientId')}
                      onFillData={handleFillDemoData}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-12 gap-6">
              
              {/* Left Sidebar - Progress */}
              <div className="col-span-3">
                <div className="sticky top-24 space-y-4">
                  {/* Progress Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EnhancedStepsProgress
                        completedSteps={stepTracking.completedSteps}
                        currentStep={stepTracking.currentStep || undefined}
                        orientation="vertical"
                        className="border-0 shadow-none p-0"
                      />
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        type="button"
                        onClick={() => setIsVendorModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Add Vendor
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsCreditorModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Recipient
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsBulkMaterialModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Add Materials
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-6 space-y-6">
                
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Invoice Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InvoiceBasicInfo mode={mode} vendors={vendors} recipients={recipients} />
                  </CardContent>
                </Card>

                {/* Logo & Branding */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      Logo & Branding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>

                {/* Invoice Items */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        Invoice Items
                      </CardTitle>
                      {mode === 'MM' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="sync-materials"
                            checked={syncMaterials}
                            onChange={(e) => setSyncMaterials(e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <label htmlFor="sync-materials" className="text-sm text-gray-700">
                            Sync Materials
                          </label>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - PDF Preview */}
              <div className="col-span-3">
                <div className="sticky top-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-orange-600" />
                        PDF Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>
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
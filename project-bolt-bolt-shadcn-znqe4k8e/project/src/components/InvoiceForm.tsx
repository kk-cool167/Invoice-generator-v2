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

// Import components
import { InvoiceBasicInfo } from './InvoiceBasicInfo';
import { LogoUpload } from './LogoUpload';
import { MMItemsSection } from './MMItemsSection';
import { FIItemsSection } from './FIItemsSection';
import { PDFViewer } from './PDFViewer';
import { InvoiceFormModals } from './InvoiceFormModals';
import { useInvoiceFormData } from '../hooks/useInvoiceFormData';
import { DemoDataFiller } from './DemoDataFiller';

// UI Components
import { LoadingSpinner } from './ui/loading-spinner';
import { useToast } from './ui/toast';
import useAutoSave from '@/hooks/useAutoSave';
import { createStandardToastHandlers, ErrorTypes } from '../lib/errorHandling';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  FileText, 
  Building2, 
  UserPlus, 
  Package, 
  History, 
  Globe, 
  Wand2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Eye,
  Download,
  Save,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

const INITIAL_ORDER_NUMBER = 4500000000;
const INITIAL_DELIVERY_NOTE_NUMBER = 1;

interface InvoiceFormProps {
  onSubmitSuccess?: () => void;
}

export function InvoiceForm({ onSubmitSuccess }: InvoiceFormProps): JSX.Element {
  const queryClient = useQueryClient();
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { showToast, ToastContainer } = useToast();
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

  // Use custom hook for data fetching
  const {
    vendors,
    materials,
    recipients,
    filteredMaterials,
    getTaxCodeInfo,
    isLoading,
  } = useInvoiceFormData(methods);

  // Main form state
  const [mode, setMode] = useState<'MM' | 'FI'>('MM');
  const [template, setTemplate] = useState<TemplateName>('businessstandard');
  const [activeTab, setActiveTab] = useState('basic');

  // Items state
  const [invoiceItems, setInvoiceItems] = useState<MMItem[]>([defaultMMItem]);
  const [orderItems, setOrderItems] = useState<MMItem[]>([defaultMMItem]);
  const [deliveryItems, setDeliveryItems] = useState<MMItem[]>([defaultMMItem]);
  const [fiItems, setFIItems] = useState<FIItem[]>([defaultFIItem]);
  const [syncMaterials, setSyncMaterials] = useState(false);

  // Logo and PDF state
  const [logo, setLogo] = useState<Logo | null>(null);
  const [logoConfig, setLogoConfig] = useState<any>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<any>(null);

  // Modal states
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isBulkMaterialModalOpen, setIsBulkMaterialModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isCreditorModalOpen, setIsCreditorModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);

  // Counters and workflow
  const [orderNumberCounter, setOrderNumberCounter] = useState(INITIAL_ORDER_NUMBER);
  const [deliveryNoteCounter, setDeliveryNoteCounter] = useState(INITIAL_DELIVERY_NOTE_NUMBER);
  const [numbersLoaded, setNumbersLoaded] = useState(false);

  // AutoSave Integration
  const formData = {
    ...methods.getValues(),
    mode,
    template,
    invoiceItems,
    orderItems,
    deliveryItems,
    fiItems,
  };

  const {
    save: saveForm,
    versions,
    loadVersion: loadVersionData,
    clearAll: clearVersions,
    lastSaved,
    saveNamed,
    deleteVersion,
    renameVersion,
    isSaving
  } = useAutoSave({
    data: formData,
    key: 'invoice_form',
    interval: 0,
  });

  // Step tracking
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

  // Load last numbers on mount
  useEffect(() => {
    if (!numbersLoaded) {
      getLastNumbers()
        .then(({ lastPONumber, lastDNNumber }) => {
          const poNumber = parseInt(lastPONumber) || INITIAL_ORDER_NUMBER;
          const dnMatch = lastDNNumber.match(/L2BRL0*(\d+)/);
          const dnNumber = dnMatch ? parseInt(dnMatch[1]) : INITIAL_DELIVERY_NOTE_NUMBER;
          
          setOrderNumberCounter(poNumber);
          setDeliveryNoteCounter(dnNumber);
          setNumbersLoaded(true);
        })
        .catch(() => setNumbersLoaded(true));
    }
  }, [numbersLoaded]);

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
          taxRate: item.taxRate || 0
        })),
        logo: logo?.content,
        logoConfig: logoConfig,
        mode: 'FI',
        template: template
      };

      const validatedData = validatePDFData(pdfData);
      const blob = await generatePDF(validatedData, template, t, currentLanguage) as Blob;

      if (blob && blob.size > 0) {
        setPdfBlob(blob);
        setPreviewDocument(validatedData);
        setActiveTab('preview'); // Auto-switch to preview tab
        standardToast.showSuccess('pdf.generated', 'PDF preview generated successfully');
      } else {
        throw new Error('Generated PDF blob is empty or invalid');
      }

    } catch (error) {
      console.error('Error generating PDF preview:', error);
      standardToast.showError(ErrorTypes.PDF_GENERATION_ERROR, error);
    } finally {
      setIsPreviewLoading(false);
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
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }, [pdfBlob]);

  const handleDownloadXML = useCallback(() => {
    try {
      const formData = methods.getValues();
      const currentVendor = vendors.find(v => v.cid?.toString() === formData.vendorId);
      const currentRecipient = recipients.find(r => r.cid?.toString() === formData.recipientId);

      if (!currentVendor || !currentRecipient) {
        throw new Error('Vendor and recipient must be selected');
      }

      const xmlData = {
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        customerNumber: formData.customerNumber,
        vendor: currentVendor,
        recipient: currentRecipient,
        items: mode === 'FI' ? fiItems : invoiceItems,
        mode
      };

      const xmlContent = generateInvoiceXML(xmlData);
      downloadXML(xmlContent, `invoice-${formData.invoiceNumber || 'export'}.xml`);
      
      standardToast.showSuccess('xml.generated', 'XML file downloaded successfully');
    } catch (error) {
      console.error('Error generating XML:', error);
      standardToast.showError(ErrorTypes.XML_GENERATION_ERROR, error);
    }
  }, [methods, vendors, recipients, fiItems, invoiceItems, mode, standardToast]);

  const handleFillDemoData = (data: any) => {
    if (data.basicInfo) {
      Object.keys(data.basicInfo).forEach(key => {
        methods.setValue(key as any, data.basicInfo[key]);
      });
    }
    if (data.invoiceItems) setInvoiceItems([...data.invoiceItems]);
    if (data.orderItems) setOrderItems([...data.orderItems]);
    if (data.deliveryItems) setDeliveryItems([...data.deliveryItems]);
    if (data.fiItems) setFIItems([...data.fiItems]);
  };

  const loadVersion = useCallback((timestamp: number) => {
    try {
      const versionData = loadVersionData(timestamp);
      if (versionData) {
        methods.reset(versionData.basicInfo || {});
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
      }
    } catch (error) {
      standardToast.showError('versions.loadError', error);
      return null;
    }
  }, [loadVersionData, methods, standardToast]);

  // Show loading spinner while data is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading invoice data..." />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50">
        
        {/* Simple Top Toolbar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              
              {/* Left: Title */}
              <div className="flex items-center space-x-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Invoice Generator</h1>
                  <p className="text-sm text-gray-500">Create professional invoices</p>
                </div>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center space-x-4">
                {/* Mode Toggle */}
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

                {/* Template Select */}
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

                {/* Actions */}
                <DemoDataFiller
                  mode={mode}
                  vendors={vendors}
                  recipients={recipients}
                  materials={materials}
                  currentVendorId={methods.watch('vendorId')}
                  currentRecipientId={methods.watch('recipientId')}
                  onFillData={handleFillDemoData}
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVersionsModalOpen(true)}
                >
                  <History className="h-4 w-4 mr-1" />
                  Versions
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(currentLanguage === 'en' ? 'de' : 'en')}
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {currentLanguage.toUpperCase()}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="basic" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Basic Info</span>
              </TabsTrigger>
              <TabsTrigger value="items" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Items</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Invoice Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Invoice Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InvoiceBasicInfo mode={mode} vendors={vendors} recipients={recipients} />
                  </CardContent>
                </Card>

                {/* Logo & Branding */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-purple-600" />
                      <span>Logo & Branding</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LogoUpload 
                      onSuccess={(selectedLogo) => {
                        setLogo(selectedLogo);
                        setLogoConfig({
                          maxWidth: 200,
                          maxHeight: 60,
                          alignment: 'right'
                        });
                      }}
                      onDialogChange={setIsLogoDialogOpen}
                      onLogoConfigChange={setLogoConfig}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsVendorModalOpen(true)}
                      className="flex items-center space-x-2"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Add Vendor</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreditorModalOpen(true)}
                      className="flex items-center space-x-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Add Recipient</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsBulkMaterialModalOpen(true)}
                      className="flex items-center space-x-2"
                    >
                      <Package className="h-4 w-4" />
                      <span>Add Materials</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items" className="space-y-6">
              {mode === 'MM' && (
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Invoice Items</h2>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sync-materials"
                      checked={syncMaterials}
                      onChange={(e) => setSyncMaterials(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="sync-materials" className="text-sm text-gray-700">
                      Sync Materials
                    </label>
                  </div>
                </div>
              )}

              {mode === 'FI' ? (
                <FIItemsSection
                  items={fiItems}
                  materials={filteredMaterials}
                  getTaxCodeInfo={getTaxCodeInfo}
                  onAddItem={() => setFIItems([...fiItems, defaultFIItem])}
                  onRemoveItem={(index) => setFIItems(fiItems.filter((_, i) => i !== index))}
                  onUpdateItem={(index, item) => {
                    const newItems = [...fiItems];
                    newItems[index] = item as FIItem;
                    setFIItems(newItems);
                  }}
                />
              ) : (
                <Tabs defaultValue="invoice" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="invoice">Invoice Items</TabsTrigger>
                    <TabsTrigger value="order">Order Items</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery Items</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="invoice" className="mt-6">
                    <MMItemsSection
                      title="Invoice Items"
                      items={invoiceItems}
                      materials={filteredMaterials}
                      onAddItem={() => setInvoiceItems([...invoiceItems, defaultMMItem])}
                      onRemoveItem={(index) => setInvoiceItems(invoiceItems.filter((_, i) => i !== index))}
                      onUpdateItem={(index, item) => {
                        const newItems = [...invoiceItems];
                        newItems[index] = item;
                        setInvoiceItems(newItems);
                      }}
                      onMaterialSelect={(materialId, index) => {
                        const material = filteredMaterials.find(m => m.cid.toString() === materialId);
                        if (material) {
                          const newItems = [...invoiceItems];
                          newItems[index] = {
                            ...newItems[index],
                            materialId,
                            price: material.cnetamount || 0,
                            unit: material.cunit || 'ST',
                            taxRate: Math.round((material.ctaxrate || 0.19) * 100),
                          };
                          setInvoiceItems(newItems);
                        }
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="order" className="mt-6">
                    <MMItemsSection
                      title="Order Items"
                      items={orderItems}
                      materials={filteredMaterials}
                      onAddItem={() => setOrderItems([...orderItems, defaultMMItem])}
                      onRemoveItem={(index) => setOrderItems(orderItems.filter((_, i) => i !== index))}
                      onUpdateItem={(index, item) => {
                        const newItems = [...orderItems];
                        newItems[index] = item;
                        setOrderItems(newItems);
                      }}
                      onMaterialSelect={(materialId, index) => {
                        const material = filteredMaterials.find(m => m.cid.toString() === materialId);
                        if (material) {
                          const newItems = [...orderItems];
                          newItems[index] = {
                            ...newItems[index],
                            materialId,
                            price: material.cnetamount || 0,
                            unit: material.cunit || 'ST',
                            taxRate: Math.round((material.ctaxrate || 0.19) * 100),
                          };
                          setOrderItems(newItems);
                        }
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="delivery" className="mt-6">
                    <MMItemsSection
                      title="Delivery Items"
                      items={deliveryItems}
                      materials={filteredMaterials}
                      onAddItem={() => setDeliveryItems([...deliveryItems, defaultMMItem])}
                      onRemoveItem={(index) => setDeliveryItems(deliveryItems.filter((_, i) => i !== index))}
                      onUpdateItem={(index, item) => {
                        const newItems = [...deliveryItems];
                        newItems[index] = item;
                        setDeliveryItems(newItems);
                      }}
                      onMaterialSelect={(materialId, index) => {
                        const material = filteredMaterials.find(m => m.cid.toString() === materialId);
                        if (material) {
                          const newItems = [...deliveryItems];
                          newItems[index] = {
                            ...newItems[index],
                            materialId,
                            price: material.cnetamount || 0,
                            unit: material.cunit || 'ST',
                            taxRate: Math.round((material.ctaxrate || 0.19) * 100),
                          };
                          setDeliveryItems(newItems);
                        }
                      }}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">PDF Preview</h2>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handlePreviewPDF}
                    disabled={isPreviewLoading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isPreviewLoading ? 'Generating...' : 'Generate Preview'}
                  </Button>
                  {pdfBlob && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleDownloadXML}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Download XML
                      </Button>
                      <Button onClick={handleDownloadPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <PDFViewer
                pdfBlob={pdfBlob}
                templateName={template}
                title="PDF Preview"
                showControls={true}
                onPreviewPDF={handlePreviewPDF}
                onDownloadPDF={handleDownloadPDF}
                onDownloadXML={handleDownloadXML}
                isPreviewLoading={isPreviewLoading}
                hasPreviewDocument={!!previewDocument}
                mode={mode}
                canGenerateActions={!!methods.getValues('vendorId') && !!methods.getValues('recipientId')}
                className="w-full"
              />
            </TabsContent>
          </Tabs>
        </div>

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
          isLoadingVersion={false}
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
          onConfirmSubmit={() => {}}
        />

        {/* Toast Container */}
        <ToastContainer />
      </div>
    </FormProvider>
  );
}
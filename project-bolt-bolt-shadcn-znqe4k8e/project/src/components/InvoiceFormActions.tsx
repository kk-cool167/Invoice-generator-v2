import { FileText } from 'lucide-react';
import { PDFViewer } from './PDFViewer';
import { FormStepIndicator } from './ui/StepIndicator';
import { useLanguage } from '@/context/LanguageContext';
import { type TemplateName } from '../lib/pdf/templates';
import { type Vendor, type Recipient } from '../lib/api';
import { UseFormReturn } from 'react-hook-form';
import { BasicInfo } from '../types/forms';

interface InvoiceFormActionsProps {
  mode: 'MM' | 'FI';
  template: TemplateName;
  vendors: Vendor[];
  recipients: Recipient[];
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

export function InvoiceFormActions({
  mode,
  template,
  vendors,
  recipients,
  methods,
  pdfBlob,
  isPreviewLoading,
  previewDocument,
  handlePreviewPDF,
  handlePreviewMMPDF,
  handleDownloadXML,
  handleDownloadPDF,
  handleCreateMMDocument,
}: InvoiceFormActionsProps) {
  const { t } = useLanguage();
  
  // Check if Step 5 is completed (has PDF preview)
  const isStep5Completed = pdfBlob !== null;

  return (
    <>
      {(mode === 'FI' || mode === 'MM') && vendors.length > 0 && recipients.length > 0 && (
        <div className="sticky top-24">
          <PDFViewer
            pdfBlob={pdfBlob}
            templateName={template}
            title="PDF-Vorschau"
            showControls={true}
            onPreviewPDF={mode === 'FI' ? handlePreviewPDF : handlePreviewMMPDF}
            onDownloadXML={handleDownloadXML}
            onDownloadPDF={handleDownloadPDF}
            onCreateAndSubmit={mode === 'FI' ? handlePreviewPDF : handleCreateMMDocument}
            isPreviewLoading={isPreviewLoading}
            hasPreviewDocument={!!previewDocument}
            mode={mode}
            canGenerateActions={!!methods.getValues('vendorId') && !!methods.getValues('recipientId')}
            onDownload={handleDownloadPDF}
            onExternalOpen={() => {
              if (pdfBlob) {
                const url = URL.createObjectURL(pdfBlob);
                window.open(url, '_blank');
              }
            }}
            className="w-full h-full"
          />
        </div>
      )}
      
      {/* Fallback when no PDF preview is available */}
      {(!vendors.length || !recipients.length) && (
        <div className="sticky top-24">
          <div className="p-8 bg-white/90 backdrop-blur-sm rounded-xl border border-purple-200 shadow-lg h-96 flex flex-col justify-center">
            <div className="text-center text-gray-500">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-10 w-10 text-purple-400" />
              </div>
              <h4 className="font-semibold mb-3 text-gray-700 text-lg">PDF-Vorschau</h4>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
                Wählen Sie einen Lieferanten und Empfänger aus, um die PDF-Vorschau zu aktivieren.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
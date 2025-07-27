import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  Play,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

// PDF.js Worker konfigurieren - lokale Datei mit CDN-Fallback
if (typeof window !== 'undefined') {
  // Erste Option: Lokale Worker-Datei (keine CORS-Probleme)
  pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';
}

interface PDFViewerProps {
  pdfUrl?: string;
  pdfBlob?: Blob | null;
  templateName?: string;
  className?: string;
  showControls?: boolean;
  onDownload?: () => void;
  onExternalOpen?: () => void;
  title?: string;
  onPreviewPDF?: () => void;
  onDownloadXML?: () => void;
  onDownloadPDF?: () => void;
  onCreateAndSubmit?: () => void;
  isPreviewLoading?: boolean;
  hasPreviewDocument?: boolean;
  mode?: 'FI' | 'MM';
  canGenerateActions?: boolean;
}

export function PDFViewer({ 
  pdfUrl, 
  pdfBlob,
  templateName = 'businessstandard',
  className,
  showControls = true,
  onDownload,
  onExternalOpen,
  title = 'PDF-Vorschau',
  onPreviewPDF,
  onDownloadXML,
  onDownloadPDF,
  onCreateAndSubmit,
  isPreviewLoading = false,
  hasPreviewDocument = false,
  mode = 'FI',
  canGenerateActions = false
}: PDFViewerProps) {
  const { t } = useLanguage();
  
  // States
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.8);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | Blob | null>(null);

  // Template-Namen Mapping
  const getTemplateName = (name: string) => {
    const names: Record<string, string> = {
      'businessstandard': 'Business Standard',
      'classic': 'Classic',
      'professional': 'Professional',
      'businessgreen': 'Business Green',
      'allrauer2': 'Allrauer'
    };
    return names[name] || name;
  };

  // PDF-Daten setzen
  useEffect(() => {
    if (pdfBlob) {
      setPdfData(pdfBlob);
      setError(null);
    } else if (pdfUrl) {
      setPdfData(pdfUrl);
      setError(null);
    } else {
      setPdfData(null);
    }
  }, [pdfUrl, pdfBlob]);

  // Callbacks
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    
    // Spezielle Behandlung für Worker-Fehler
    if (error.message.includes('worker') || error.message.includes('Worker')) {
      setError('PDF-Worker konnte nicht geladen werden. Versuchen Sie, die Seite neu zu laden.');
    } else {
      setError(`PDF konnte nicht geladen werden: ${error.message}`);
    }
    setIsLoading(false);
  }, []);

  const onPageLoadSuccess = useCallback(() => {
    setIsLoading(false);
  }, []);

  const onPageLoadError = useCallback((error: Error) => {
    console.error('Page load error:', error);
    setError('Seite konnte nicht geladen werden');
    setIsLoading(false);
  }, []);

  // Navigation
  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  // Retry-Funktion
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    if (onPreviewPDF) {
      onPreviewPDF();
    }
  };

  // Wenn keine PDF-Daten vorhanden sind und nicht lädt
  if (!pdfData && !isPreviewLoading) {
    return (
      <Card className={cn("w-full border-2 border-purple-300/60 shadow-lg shadow-purple-500/10", className)}>
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-50/30 to-purple-100/20 border-b border-purple-200/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {title}
              </CardTitle>
              {templateName && (
                <Badge variant="secondary" className="text-xs">
                  {getTemplateName(templateName)}
                </Badge>
              )}
            </div>
            
            {/* Wichtige Action Buttons */}
            {canGenerateActions && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs bg-gray-100 hover:bg-gray-200 border-gray-300"
                  onClick={onDownloadXML}
                  disabled={!canGenerateActions}
                  title={t ? t('buttons.downloadXml') : 'XML herunterladen'}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create XML
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 px-3 text-xs bg-purple-600 hover:bg-purple-700"
                  onClick={onCreateAndSubmit}
                  disabled={!canGenerateActions}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {mode === 'FI' 
                    ? 'PDF erstellen' 
                    : 'PDF erstellen'
                  }
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] bg-white/90 backdrop-blur-sm rounded-lg border-2 border-dashed border-purple-300">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500 mb-6">
                {canGenerateActions 
                  ? 'PDF wird nach Eingabe der Daten automatisch erstellt'
                  : (t ? t('pdf.selectVendorRecipientFirst') : 'Wählen Sie zuerst einen Lieferanten und Empfänger aus')
                }
              </p>
              {canGenerateActions && (
                <Button
                  onClick={onPreviewPDF}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="default"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  PDF erstellen
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full h-fit shadow-xl shadow-purple-500/20 border-2 border-purple-300/60 bg-white backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300", className)}>
      <CardHeader className="pb-4 bg-gradient-to-r from-white/95 to-purple-50/30 backdrop-blur-sm border-b border-purple-200/40">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CardTitle className="text-base font-semibold flex items-center gap-3 text-gray-900 tracking-tight">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                {title}
              </CardTitle>
              {templateName && (
                <Badge variant="secondary" className="text-sm px-3 py-1.5 bg-gradient-to-r from-purple-100/90 to-purple-50/90 text-purple-800 border border-purple-200/60 font-medium shadow-sm">
                  {getTemplateName(templateName)}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Action Buttons - Enhanced Modern Layout */}
          {showControls && canGenerateActions && (
            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-sm bg-white/90 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                onClick={onPreviewPDF}
                disabled={isPreviewLoading}
                title="PDF aktualisieren"
              >
                {isPreviewLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                <span className="hidden xs:inline">{t ? t('buttons.refresh') : 'Aktualisieren'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-sm bg-white/90 border-purple-200/60 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                onClick={onDownloadXML}
                disabled={!canGenerateActions}
                title={t ? t('buttons.downloadXml') : 'XML herunterladen'}
              >
                <FileText className="h-4 w-4 mr-2" />
                XML
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-sm bg-white/90 border-purple-200/60 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                onClick={onDownloadPDF}
                disabled={isPreviewLoading}
                title={t ? t('buttons.downloadPdf') : 'PDF herunterladen'}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>

              {mode === 'MM' && (
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-4 text-sm bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md transition-all duration-200"
                  onClick={onCreateAndSubmit}
                  disabled={!canGenerateActions}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {t ? t('buttons.createPdf') : 'Erstellen'}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Loading State */}
        {(isLoading || isPreviewLoading) && (
          <div className="flex items-center justify-center h-[450px] bg-white/90 backdrop-blur-sm rounded-lg border border-purple-200">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-purple-500 mx-auto mb-4 animate-spin" />
              <p className="text-base font-medium text-gray-700 mb-2">PDF wird erstellt...</p>
              <p className="text-sm text-gray-500">{t ? t('loading.pleaseWait') : 'Dies kann einen Moment dauern'}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isPreviewLoading && (
          <div className="flex items-center justify-center h-[350px] bg-red-50 rounded-lg border border-red-200">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-base text-red-600 font-medium mb-2">{t ? t('errors.loadingFailed') : 'Fehler beim Laden'}</p>
              <p className="text-sm text-red-500 mb-4">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="text-sm px-3 py-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t ? t('buttons.retry') : 'Erneut versuchen'}
              </Button>
            </div>
          </div>
        )}

        {/* PDF Document */}
        {!isLoading && !isPreviewLoading && !error && pdfData && (
          <div className="space-y-4">
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              error={null}
              className="flex justify-center"
            >
              <div className="relative bg-white rounded-xl shadow-2xl border-2 border-purple-200 overflow-hidden transform hover:scale-[1.02] transition-transform duration-200">
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  onLoadSuccess={onPageLoadSuccess}
                  onLoadError={onPageLoadError}
                  loading={null}
                  error={null}
                  className="rounded-xl"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            </Document>

            {/* Navigation Controls - 只在多页时显示 */}
            {numPages > 1 && (
              <div className="flex items-center justify-center gap-6 pt-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl py-4 border-2 border-purple-100">
                <Button
                  variant="outline"
                  size="default"
                  className="h-11 px-6 text-base border-purple-200 hover:bg-purple-50"
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t ? t('buttons.back') : 'Zurück'}
                </Button>
                
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-gray-700">{t ? t('pdf.page') : 'Seite'}</span>
                  <Badge variant="outline" className="text-base px-4 py-2 bg-white border-purple-200">
                    {pageNumber} / {numPages}
                  </Badge>
                </div>
                
                <Button
                  variant="outline"
                  size="default"
                  className="h-11 px-6 text-base border-purple-200 hover:bg-purple-50"
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                >
                  {t ? t('buttons.next') : 'Weiter'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

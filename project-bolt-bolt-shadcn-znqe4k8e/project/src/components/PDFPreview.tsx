import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  ExternalLink,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface PDFPreviewProps {
  logoUrl?: string;
  logoConfig?: {
    maxWidth: number;
    maxHeight: number;
    containerWidth: number;
    containerHeight: number;
    alignment: 'left' | 'center' | 'right';
    verticalAlignment: 'top' | 'middle' | 'bottom';
  };
  templateName?: string;
  documentData?: {
    invoiceNumber?: string;
    invoiceDate?: string;
    vendor?: { cname?: string; caddress?: string };
    recipient?: { cname?: string; caddress?: string };
    items?: Array<{
      description: string;
      quantity: number;
      unit: string;
      price: number;
      total: number;
    }>;
  };
  className?: string;
  showControls?: boolean;
  onGeneratePDF?: () => void;
}

export function PDFPreview({ 
  logoUrl, 
  logoConfig, 
  templateName = 'businessstandard',
  documentData,
  className,
  showControls = true,
  onGeneratePDF
}: PDFPreviewProps) {
  const { t } = useLanguage();
  const [zoom, setZoom] = useState(0.8);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Beispieldaten falls keine echten Daten vorhanden
  const mockData = {
    invoiceNumber: documentData?.invoiceNumber || 'RE-2024-001',
    invoiceDate: documentData?.invoiceDate || new Date().toLocaleDateString('de-DE'),
    vendorName: documentData?.vendor?.cname || 'Musterfirma GmbH',
    vendorAddress: documentData?.vendor?.caddress || 'Musterstraße 123\n12345 Musterstadt',
    recipientName: documentData?.recipient?.cname || 'Kunde GmbH',
    recipientAddress: documentData?.recipient?.caddress || 'Kundenstraße 456\n67890 Kundenstadt',
    items: documentData?.items || [
      { description: 'Dienstleistung 1', quantity: 1, unit: 'Std', price: 75.00, total: 75.00 },
      { description: 'Material ABC', quantity: 2, unit: 'Stk', price: 25.50, total: 51.00 }
    ]
  };

  const totalAmount = mockData.items.reduce((sum: number, item: { total: number | string }) => {
    const itemTotal = typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0;
    return sum + itemTotal;
  }, 0);

  // Determine primary currency from document data or default to EUR
  const getPrimaryCurrency = () => {
    // Check if documentData has currency info
    if (documentData?.items) {
      const currencies = documentData.items
        .map((item: any) => item.currency)
        .filter(Boolean);
      
      if (currencies.length > 0) {
        // Find most common currency
        const currencyCount = currencies.reduce((acc: Record<string, number>, curr: string) => {
          acc[curr] = (acc[curr] || 0) + 1;
          return acc;
        }, {});
        
        const mostCommon = Object.entries(currencyCount)
          .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0];
        
        return mostCommon || 'EUR';
      }
    }
    
    // Enhanced fallback: check vendor/recipient location data if available
    if (documentData?.vendor || documentData?.recipient) {
      const vendorCountry = (documentData.vendor as any)?.ccountry;
      const recipientCountry = (documentData.recipient as any)?.ccountry;
      
      // Use vendor country for currency determination
      if (vendorCountry === 'GB') return 'GBP';
      if (vendorCountry === 'CH') return 'CHF';
      if (vendorCountry === 'US') return 'USD';
      
      // Or recipient country as secondary option
      if (recipientCountry === 'GB') return 'GBP';
      if (recipientCountry === 'CH') return 'CHF';
      if (recipientCountry === 'US') return 'USD';
    }
    
    return 'EUR'; // Default
  };

  return (
    <Card className={cn("w-full border-2 border-purple-300/60 shadow-lg shadow-purple-500/10", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50/30 to-purple-100/20 border-b border-purple-200/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t('pdf.preview')}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {getTemplateName(templateName)}
            </Badge>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
                className="h-7 w-7 p-0"
                title={t('pdf.zoomOut')}
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                className="h-7 w-7 p-0"
                title={t('pdf.zoomIn')}
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Separator orientation="vertical" className="h-4 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 w-7 p-0"
                title={isExpanded ? t('pdf.minimize') : t('pdf.fullscreen')}
              >
                {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* PDF Document Preview */}
          <div 
            className={cn(
              "mx-auto bg-white border-2 border-purple-200 shadow-lg rounded-lg overflow-hidden transition-all duration-300",
              isExpanded ? "w-full" : "max-w-md"
            )}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center'
            }}
          >
            {/* PDF Header */}
            <div className="bg-purple-50/50 border-b border-purple-200/60 p-4">
              <div className="flex justify-between items-start">
                {/* Vendor Info */}
                <div className="text-sm space-y-1">
                  <div className="font-bold text-gray-800">{mockData.vendorName}</div>
                  <div className="text-gray-600 text-xs whitespace-pre-line">
                    {mockData.vendorAddress}
                  </div>
                </div>
                
                {/* Logo Container */}
                {logoUrl && logoConfig && (
                  <div 
                    className="flex border border-purple-200/60 bg-white rounded"
                    style={{
                      width: `${logoConfig.containerWidth || 200}px`,
                      height: `${logoConfig.containerHeight || 60}px`,
                      alignItems: logoConfig.verticalAlignment === 'top' ? 'flex-start' : 
                                logoConfig.verticalAlignment === 'bottom' ? 'flex-end' : 'center',
                      justifyContent: logoConfig.alignment === 'left' ? 'flex-start' : 
                                     logoConfig.alignment === 'right' ? 'flex-end' : 'center',
                      padding: '4px'
                    }}
                  >
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="object-contain"
                      style={{
                        maxWidth: `${logoConfig.maxWidth || 180}px`,
                        maxHeight: `${logoConfig.maxHeight || 50}px`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* PDF Content */}
            <div className="p-4 space-y-4">
              {/* Recipient Address */}
              <div className="text-sm">
                <div className="font-semibold text-gray-800">{mockData.recipientName}</div>
                <div className="text-gray-600 text-xs whitespace-pre-line">
                  {mockData.recipientAddress}
                </div>
              </div>

              {/* Invoice Header */}
              <div className="space-y-2">
                <div className="text-lg font-bold text-gray-800">
                  Rechnung Nr. {mockData.invoiceNumber}
                </div>
                <div className="text-sm text-gray-600">
                  Datum: {mockData.invoiceDate}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-purple-200/60 rounded">
                {/* Table Header */}
                <div className="bg-purple-100/50 border-b border-purple-200/60 p-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-700">
                    <div className="col-span-5">Beschreibung</div>
                    <div className="col-span-2 text-center">Menge</div>
                    <div className="col-span-2 text-center">Einheit</div>
                    <div className="col-span-3 text-right">Gesamt</div>
                  </div>
                </div>
                
                {/* Table Rows */}
                {mockData.items.map((item: { description: string; quantity: number; unit: string; total: number }, index: number) => (
                  <div key={index} className="border-b border-purple-100 p-2 last:border-b-0">
                    <div className="grid grid-cols-12 gap-2 text-xs text-gray-700">
                      <div className="col-span-5">{item.description}</div>
                      <div className="col-span-2 text-center">{item.quantity}</div>
                      <div className="col-span-2 text-center">{item.unit}</div>
                      <div className="col-span-3 text-right font-medium">
{formatCurrency(typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0, (item as any).currency || getPrimaryCurrency())}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="bg-purple-50/50 border-t border-purple-200/60 p-2">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-9"></div>
                    <div className="col-span-3 text-right">
                      <div className="text-sm font-bold text-gray-800">
Gesamt: {formatCurrency(totalAmount, getPrimaryCurrency())}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-xs text-gray-500 pt-4 border-t border-purple-200/60">
                Vielen Dank für Ihr Vertrauen!
              </div>
            </div>
          </div>

          {/* Controls */}
          {showControls && onGeneratePDF && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onGeneratePDF}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {t('pdf.open')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onGeneratePDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t('pdf.download')}
              </Button>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-800 space-y-1">
              <div className="font-medium">Vorschau-Informationen:</div>
              <div className="grid grid-cols-2 gap-2">
                <div>Template: {getTemplateName(templateName)}</div>
                <div>Skalierung: {Math.round(zoom * 100)}%</div>
                {logoConfig && (
                  <>
                    <div>Logo-Größe: {logoConfig.maxWidth}×{logoConfig.maxHeight}px</div>
                    <div>{t ? t('logo.position') : 'Position'}: {logoConfig.alignment === 'left' ? (t ? t('logo.alignment.left') : 'Links') : logoConfig.alignment === 'right' ? (t ? t('logo.alignment.right') : 'Rechts') : (t ? t('logo.alignment.center') : 'Zentriert')}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
import { Button } from './ui/button';
import { Sparkles, Wand2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { MMItem, FIItem } from '@/types/forms';
import { toast } from './ui/use-toast';
import { formatDbId } from '@/lib/idUtils';

interface DemoDataFillerProps {
  mode: 'MM' | 'FI';
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

export function DemoDataFiller({
  mode,
  vendors,
  recipients,
  materials,
  currentVendorId,
  currentRecipientId,
  onFillData
}: DemoDataFillerProps) {
  const { t } = useLanguage();

  const generateDemoData = () => {
    let selectedVendor = null;
    let selectedRecipient = null;
    
    // Use existing vendor if selected, otherwise pick random
    if (currentVendorId) {
      selectedVendor = vendors.find(v => v.cid?.toString() === currentVendorId);
    }
    if (!selectedVendor) {
      selectedVendor = vendors[Math.floor(Math.random() * vendors.length)];
    }
    
    // Use existing recipient if selected and matches vendor's company code
    if (currentRecipientId) {
      const existingRecipient = recipients.find(r => r.cid?.toString() === currentRecipientId);
      if (existingRecipient?.ccompanycode === selectedVendor?.ccompanycode) {
        selectedRecipient = existingRecipient;
      }
    }
    
    // If no valid recipient yet, find one with matching company code
    if (!selectedRecipient) {
      const matchingRecipients = recipients.filter(r => 
        r.ccompanycode === selectedVendor?.ccompanycode
      );
      selectedRecipient = matchingRecipients.length > 0 
        ? matchingRecipients[Math.floor(Math.random() * matchingRecipients.length)]
        : null;
    }
    
    // If no matching recipient found, show error
    if (!selectedRecipient) {
      toast({
        title: t('demo.error.noMatchingRecipient') || 'No matching recipient',
        description: t('demo.error.noMatchingRecipientDesc') || 'No recipient found with matching company code',
        variant: 'destructive'
      });
      return;
    }
    
    // Filter materials by company code (business logic: materials should match the business relationship)
    // Company 1000 = EUR region, Company 2000 = GBP region, Company 3000 = CHF region
    const companyCurrency = selectedRecipient?.ccompanycode === '2000' ? 'GBP' : 
                           selectedRecipient?.ccompanycode === '3000' ? 'CHF' : 'EUR';
    
    const currencyFilteredMaterials = materials.filter(material => 
      material.ccurrency === companyCurrency
    );
    
    // If no materials match currency (e.g., CHF), fall back to EUR materials
    const availableMaterials = currencyFilteredMaterials.length > 0 ? currencyFilteredMaterials : 
                              materials.filter(m => m.ccurrency === 'EUR');
    
    // Get 3-5 random materials
    const numItems = Math.floor(Math.random() * 3) + 3; // 3-5 items
    const randomMaterials = [...availableMaterials]
      .sort(() => Math.random() - 0.5)
      .slice(0, numItems);

    // Generate dates
    const today = new Date();
    const invoiceDate = today.toISOString().split('T')[0];
    const orderDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    const deliveryDate = new Date(today.setDate(today.getDate() + 5)).toISOString().split('T')[0];

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const customerNumber = `CUST-${Math.floor(Math.random() * 9000 + 1000)}`;

    // Generate items based on mode
    if (mode === 'MM') {
      const mmItems: MMItem[] = randomMaterials.map(material => ({
        materialId: formatDbId(material.cid),
        quantity: Math.floor(Math.random() * 10) + 1,
        unit: material.cunit || 'ST',
        price: material.cnetamount || Math.floor(Math.random() * 500) + 50,
        taxRate: material.ctaxrate || 19,
        total: 0, // Will be calculated
        currency: material.ccurrency || 'EUR'
      }));

      // Calculate totals
      mmItems.forEach(item => {
        item.total = item.quantity * item.price * (1 + item.taxRate / 100);
      });


      // Fill all three item sections with variations
      const orderItems = mmItems.map(item => ({
        ...item,
        quantity: Math.max(1, item.quantity + Math.floor(Math.random() * 3) - 1)
      }));

      const deliveryItems = mmItems.map(item => ({
        ...item,
        quantity: Math.max(1, item.quantity - Math.floor(Math.random() * 2))
      }));

      onFillData({
        basicInfo: {
          invoiceNumber,
          vendorId: formatDbId(selectedVendor?.cid),
          recipientId: formatDbId(selectedRecipient?.cid),
          invoiceDate,
          orderDate,
          deliveryDate,
          customerNumber,
          processor: t('demo.processor.mm')
        },
        invoiceItems: mmItems,
        orderItems,
        deliveryItems
      });
    } else {
      // FI mode
      const fiItems: FIItem[] = randomMaterials.map(material => ({
        materialId: formatDbId(material.cid),
        description: material.cdescription || `Service ${Math.floor(Math.random() * 100)}`,
        account: `${4000 + Math.floor(Math.random() * 1000)}`, // Random account 4000-4999
        costCenter: `CC${Math.floor(Math.random() * 900) + 100}`, // CC100-CC999
        internalOrder: `IO${Math.floor(Math.random() * 9000) + 1000}`, // IO1000-IO9999
        quantity: Math.floor(Math.random() * 20) + 1,
        unit: material.cunit || 'H',
        price: material.cnetamount || Math.floor(Math.random() * 200) + 50,
        taxRate: material.ctaxrate || 19,
        total: 0, // Will be calculated
        currency: material.ccurrency || 'EUR'
      }));

      // Calculate totals
      fiItems.forEach(item => {
        item.total = item.quantity * item.price * (1 + item.taxRate / 100);
      });

      onFillData({
        basicInfo: {
          invoiceNumber,
          vendorId: formatDbId(selectedVendor?.cid),
          recipientId: formatDbId(selectedRecipient?.cid),
          invoiceDate,
          orderDate,
          customerNumber,
          processor: t('demo.processor.fi')
        },
        fiItems
      });
    }

    // Show success message
    toast({
      title: t('demo.success.title'),
      description: t('demo.success.description'),
    });
  };

  return (
    <Button
      type="button"
      onClick={generateDemoData}
      size="sm"
      className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md transform transition-all duration-200 hover:scale-105 h-10 px-4"
      disabled={!vendors.length || !recipients.length || !materials.length}
    >
      <Wand2 className="h-4 w-4" />
      <span className="hidden sm:inline">
        {t('demo.data')}
      </span>
      <span className="sm:hidden">{t('demo.short')}</span>
    </Button>
  );
}

/**
 * Standalone demo button for quick testing
 */
export function QuickDemoButton({ onClick }: { onClick: () => void }) {
  const { t } = useLanguage();
  
  return (
    <Button
      type="button"
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 left-6 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
    >
      <Sparkles className="h-5 w-5" />
      {t('demo.quick')}
    </Button>
  );
}
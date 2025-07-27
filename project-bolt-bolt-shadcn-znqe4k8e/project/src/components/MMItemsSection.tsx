import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Plus, Trash2, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn, formatCurrency } from "@/lib/utils";
import type { MMItemsSectionProps, MMItem } from "../types/forms";
import type { Material } from "../lib/api";
import { getEffectiveLanguage } from "@/lib/companyMappings";
import { findMaterialById, formatDbId } from "../lib/idUtils";
import { createTranslatedUnits } from "@/lib/unitTranslations";

// Column configuration for different table types
const columnConfig = {
  'Invoice Items': ['material', 'quantity', 'unit', 'price', 'taxRate', 'total'],
  'Order Items': ['material', 'quantity', 'unit', 'price', 'taxRate', 'total'],
  'Delivery Items': ['material', 'quantity', 'unit', 'price', 'taxRate', 'total'],
};

const getColumnHeaders = (primaryCurrency: string, t: any) => ({
  material: t('table.material'),
  quantity: t('table.quantity'),
  unit: t('table.unit'),
  price: `${t('table.price').replace('(€)', '')}(${primaryCurrency})`,
  taxRate: t('table.taxRate'),
  total: t('table.total'),
});

const columnPlaceholders = {
  quantity: 'placeholder.enterQuantity',
  unit: 'placeholder.enterUnit',
  price: 'placeholder.enterPrice',
  taxRate: 'placeholder.enterTaxRate',
};

// Optimized grid templates for better visibility
const gridTemplates = {
  6: 'md:grid-cols-[1.8fr,1fr,0.8fr,1fr,0.9fr,1.1fr,0.6fr]',
  4: 'md:grid-cols-[1.8fr,1fr,0.8fr,1.1fr,0.6fr]',
};

export function MMItemsSection({
  title,
  items,
  materials = [],
  error,
  companyCode,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onMaterialSelect,
  onItemChange,
}: MMItemsSectionProps) {
  const { t, currentLanguage } = useLanguage();
  const [units, setUnits] = useState<Array<{ value: string; label: string; code: string }>>([]);

  // Fetch German units (for codes) but translate labels for UI
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        // Always fetch German units to ensure compatibility with material unit codes
        const url = `/units?lang=de`;
        console.log('Fetching German units for translation:', url);
        
        const response = await fetch(`http://localhost:3003/api/v1${url}`);
        
        if (response.ok) {
          const responseText = await response.text();
          
          try {
            const germanUnitsData = JSON.parse(responseText);
            if (Array.isArray(germanUnitsData) && germanUnitsData.length > 0) {
              console.log('Successfully loaded', germanUnitsData.length, 'German units for translation');
              
              // Create translated units for UI display while keeping German codes
              const translatedUnits = createTranslatedUnits(germanUnitsData, currentLanguage as 'de' | 'en');
              setUnits(translatedUnits);
              return;
            }
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error(`Invalid JSON response: ${parseError.message}`);
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        console.error('Error fetching units, using fallback:', error);
        // Fallback to common German units with translation
        const fallbackGermanUnits = [
          { cabbreviation: 'ST', cdescription: 'Stück' },
          { cabbreviation: 'KG', cdescription: 'Kilogramm' },
          { cabbreviation: 'L', cdescription: 'Liter' },
          { cabbreviation: 'M', cdescription: 'Meter' },
          { cabbreviation: 'SET', cdescription: 'Set' },
          { cabbreviation: 'H', cdescription: 'Stunden' }
        ];
        const translatedFallback = createTranslatedUnits(fallbackGermanUnits, currentLanguage as 'de' | 'en');
        setUnits(translatedFallback);
      }
    };

    // Add a small delay to ensure backend is ready
    const timer = setTimeout(fetchUnits, 1000);
    return () => clearTimeout(timer);
  }, [currentLanguage]); // Re-translate when language changes

  const activeColumns = columnConfig[title as keyof typeof columnConfig] || columnConfig['Invoice Items'];
  const gridClass = gridTemplates[activeColumns.length as keyof typeof gridTemplates] || gridTemplates[6];
  
  // Get currency for individual item with fallback logic
  const getItemCurrency = (item: any) => {
    // If item has currency, use it
    if (item.currency) {
      return item.currency;
    }
    
    // Fallback: Try to determine from materials if available
    if (materials && materials.length > 0) {
      const material = findMaterialById(materials, item.materialId);
      
      if (material?.ctaxcode && companyCode) {
        // Use backend's company code to currency mapping (consistent with server.js)
        const currency = companyCode === '2000' ? 'GBP' :
                        companyCode === '3000' ? 'CHF' :
                        'EUR'; // Default for 1000 and others
        
        return currency;
      }
      
      // Check if material has its own currency field
      if (material && (material as any).ccurrency) {
        return (material as any).ccurrency;
      }
    }
    
    // Default fallback
    return 'EUR';
  };

  // Determine the primary currency from items
  const getPrimaryCurrency = () => {
    // Get currencies from items, using getItemCurrency for accurate detection
    const currencies = items.map(item => getItemCurrency(item)).filter(Boolean);
    
    if (currencies.length === 0) return 'EUR';
    
    // Find most common currency
    const currencyCount = currencies.reduce((acc, curr) => {
      if (curr) acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommon = Object.entries(currencyCount)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0];
    
    return mostCommon || 'EUR';
  };
  
  const primaryCurrency = getPrimaryCurrency();
  const columnHeaders = getColumnHeaders(primaryCurrency, t);

  const handleMaterialUpdate = (value: string, index: number) => {
    // Call the sync callback first
    if (onMaterialSelect) {
      onMaterialSelect(value, index);
    }
    
    // Then update the local item as before
    const material = findMaterialById(materials, value);
    if (material && items[index]) {
      const updatedItem = {
        ...items[index],
        materialId: formatDbId(material.cid),
        price: material.cnetamount || 0,
        unit: material.cunit || 'ST',
        description: material.cdescription || `Material ${material.cmaterialnumber}`,
        taxRate: Math.round((material.ctaxrate || 0.19) * 100),
      };
      onUpdateItem(index, updatedItem);
    }
  };

  // Helper function to handle item updates with sync
  const handleItemUpdate = (index: number, updatedItem: MMItem) => {
    // Update the local item
    onUpdateItem(index, updatedItem);
    
    // Call sync callback if available
    if (onItemChange) {
      onItemChange(index, updatedItem);
    }
  };

  const calculateItemTotal = (item: any) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return quantity * price;
  };

  const totalAmount = items.reduce((sum, item) => {
    return sum + calculateItemTotal(item);
  }, 0);

  const translatedTitle = () => {
    // Title is now passed as a translated string from parent component
    return title;
  };

  return (
    <Card className="rounded-xl shadow-xl shadow-purple-500/20 border-2 border-purple-300/60 bg-white backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 overflow-hidden">
      <CardHeader className="py-5 bg-gradient-to-r from-white/95 to-purple-50/30 backdrop-blur-sm border-b border-purple-200/40">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-purple-500/30">
            <FileSpreadsheet className="h-4 w-4 text-white" />
          </div>
          {translatedTitle()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-5 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Enhanced Responsive Table Container */}
        <div className="rounded-xl border-2 border-purple-300 shadow-sm overflow-hidden">
          {/* Desktop Header */}
          <div className={cn("hidden md:grid gap-x-2 px-4 py-3 text-xs font-semibold text-gray-800 bg-gradient-to-r from-purple-50/80 to-purple-100/50 border-b border-purple-200", gridClass)}>
            {activeColumns.map(col => (
              <div key={col} className={cn('', { 'text-right': ['quantity', 'price', 'taxRate', 'total'].includes(col) })}>
                {columnHeaders[col as keyof typeof columnHeaders]}
              </div>
            ))}
            <div className="text-center">
              {t('table.actions')}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white">
            {items.map((item, index) => (
              <div key={index} className="group">
                {/* Desktop Layout */}
                <div className={cn("hidden md:grid gap-x-2 items-center px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50/40 hover:to-purple-100/30 transition-all duration-200", gridClass, {
                  'border-b border-purple-200': index < items.length - 1
                })}>
                    
                    {activeColumns.includes('material') && (
                      <div className="min-w-0 w-full">
                        <Select
                          value={item.materialId || ''}
                          onValueChange={(value) => handleMaterialUpdate(value, index)}
                        >
                          <SelectTrigger className="h-8 text-xs truncate rounded-lg">
                            <SelectValue placeholder={t('placeholder.selectMaterial')} />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((material) => (
                              <SelectItem key={material.cid} value={formatDbId(material.cid)}>
                                <span className="text-xs truncate">{material.cdescription}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {activeColumns.includes('quantity') && (
                      <div className="w-full min-w-0">
                        <Input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleItemUpdate(index, { ...item, quantity: parseFloat(e.target.value) || 0 })} 
                          className="text-center h-8 text-xs w-full min-w-0 rounded-lg" 
                          placeholder="1" 
                        />
                      </div>
                    )}
                    
                    {activeColumns.includes('unit') && (
                      <div className="w-full min-w-0">
                        <Select 
                          value={item.unit} 
                          onValueChange={(value) => handleItemUpdate(index, { ...item, unit: value })}
                        >
                          <SelectTrigger className="h-8 text-xs w-full min-w-0 rounded-lg">
                            <SelectValue placeholder="St" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {activeColumns.includes('price') && (
                      <div className="w-full min-w-0">
                        <Input 
                          type="number" 
                          step="0.01" 
                          value={item.price} 
                          onChange={(e) => handleItemUpdate(index, { ...item, price: parseFloat(e.target.value) || 0 })} 
                          className="text-right h-8 text-xs w-full min-w-0 rounded-lg" 
                          placeholder="0.00" 
                        />
                      </div>
                    )}
                    
                    {activeColumns.includes('taxRate') && (
                      <div className="w-full min-w-0">
                        <div className="h-8 px-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-medium text-gray-700 flex items-center justify-center text-xs w-full min-w-0">
                          {item.taxRate}%
                        </div>
                      </div>
                    )}
                    
                    {activeColumns.includes('total') && (
                      <div className="w-full min-w-0">
                        <div className="h-8 px-2 bg-gradient-to-r from-purple-50/60 to-purple-100/40 border border-purple-200/50 rounded-lg text-right font-semibold text-gray-900 flex items-center justify-end text-xs w-full min-w-0 truncate shadow-sm">
{formatCurrency((item.quantity || 0) * (item.price || 0) * (1 + (item.taxRate || 0) / 100), getItemCurrency(item))}
                        </div>
                      </div>
                    )}
                    
                    {/* Delete button */}
                    <div className="flex justify-center w-full min-w-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem(index)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className={cn("md:hidden p-4 space-y-4", {
                    'border-b border-purple-200': index < items.length - 1
                  })}>
                    {/* Material Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">{t('table.material')}</label>
                      <div className="flex gap-2">
                        <Select
                          value={item.materialId || ''}
                          onValueChange={(value) => handleMaterialUpdate(value, index)}
                        >
                          <SelectTrigger className="flex-1 rounded-lg">
                            <SelectValue placeholder={t('placeholder.selectMaterial')} />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((material) => (
                              <SelectItem key={material.cid} value={formatDbId(material.cid)}>
                                {material.cdescription}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {activeColumns.includes('quantity') && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">{t('table.quantity')}</label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemUpdate(index, { ...item, quantity: parseFloat(e.target.value) || 0 })}
                            className="text-center rounded-lg"
                            placeholder="1"
                          />
                        </div>
                      )}
                      
                      {activeColumns.includes('unit') && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">{t('table.unit')}</label>
                          <Select 
                            value={item.unit} 
                            onValueChange={(value) => handleItemUpdate(index, { ...item, unit: value })}
                          >
                            <SelectTrigger className="text-center rounded-lg">
                              <SelectValue placeholder="St" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {activeColumns.includes('price') && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">{t('table.price')}</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => handleItemUpdate(index, { ...item, price: parseFloat(e.target.value) || 0 })}
                            className="text-right rounded-lg"
                            placeholder="0.00"
                          />
                        </div>
                      )}
                      
                      {activeColumns.includes('taxRate') && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">{t('table.taxRate')}</label>
                          <div className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-center font-medium text-gray-700 flex items-center justify-center">
                            {item.taxRate}%
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    {activeColumns.includes('total') && (
                      <div className="pt-3 border-t border-purple-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{t('table.total')}:</span>
                          <span className="text-lg font-bold text-purple-700">
{formatCurrency((item.quantity || 0) * (item.price || 0), getItemCurrency(item))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            ))}
            </div>
          </div>

        {/* Enhanced Add Item Button */}
        <div className="flex justify-center pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onAddItem}
            className="flex items-center gap-2 text-purple-600 border-purple-200/60 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            {t('buttons.addItem')}
          </Button>
        </div>

        {/* Enhanced Summary */}
        <div className="pt-4 border-t border-purple-200 bg-gradient-to-r from-purple-50/60 to-purple-100/40 rounded-xl p-4 shadow-inner">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-600">
              {t('summary.totalItems')}: <span className="font-bold text-gray-800">{items.length}</span>
            </span>
            <span className="font-medium text-gray-600">
{t('summary.totalAmount')}: <span className="text-lg font-bold text-purple-700">{formatCurrency(totalAmount, getPrimaryCurrency())}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

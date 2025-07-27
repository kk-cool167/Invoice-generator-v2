import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Trash2, FileText } from 'lucide-react';
import { Alert, AlertDescription } from "./ui/alert";
import type { FIItemsSectionProps } from "../types/forms";
import type { Material } from "../lib/api";
import { useLanguage } from '@/context/LanguageContext';
import { findMaterialById, formatDbId } from "../lib/idUtils";
import { formatCurrency as currencyFormat, getCurrencyForContext } from '../lib/currencyManager';
import { cn } from '@/lib/utils';

export function FIItemsSection({
  items,
  materials = [],
  error,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onMaterialSelect,
  getTaxCodeInfo,
}: FIItemsSectionProps) {
  const { t } = useLanguage();
  
  const formatCurrency = (amount: number, itemCurrency?: string) => {
    return currencyFormat(amount, itemCurrency);
  };

  const calculateItemTotal = (quantity: number, price: number) => {
    return quantity * price;
  };

  const totalAmount = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + (quantity * price);
  }, 0);

  const handleMaterialUpdate = (value: string, index: number) => {
    const material = findMaterialById(materials, value);
    onMaterialSelect?.(value, index);
    if (material) {
      const taxInfo = getTaxCodeInfo?.(material.ctaxcode) || { companyCode: '1000' };
      const currency = getCurrencyForContext({ 
        companyCode: taxInfo.companyCode,
        materialCurrency: material.ccurrency 
      });
      
      onUpdateItem(index, {
        ...items[index],
        materialId: value,
        description: material.cdescription,
        unit: material.cunit,
        price: material.cnetamount,
        taxRate: Math.round(material.ctaxrate * 100),
        currency: currency,
        total: calculateItemTotal(items[index].quantity || 0, material.cnetamount)
      });
    }
  };

  const handleItemUpdate = (index: number, updatedItem: any) => {
    onUpdateItem(index, updatedItem);
  };

  return (
    <Card className="rounded-xl shadow-xl shadow-purple-500/20 border-2 border-purple-300/60 bg-white backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 overflow-hidden">
      <CardHeader className="py-5 bg-gradient-to-r from-white/95 to-purple-50/30 backdrop-blur-sm border-b border-purple-200/40">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-purple-500/30">
            <FileText className="h-4 w-4 text-white" />
          </div>
          {t('form.invoiceItems')}
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
          <div className="hidden md:grid grid-cols-7 gap-x-2 px-4 py-3 text-xs font-semibold text-gray-800 bg-gradient-to-r from-purple-50/80 to-purple-100/50 border-b border-purple-200">
            <div className="col-span-2">{t('table.material')}</div>
            <div>{t('table.quantity')}</div>
            <div>{t('table.unit')}</div>
            <div className="text-right">{t('table.price')}</div>
            <div className="text-right">{t('table.total')}</div>
            <div className="text-center">{t('table.actions')}</div>
          </div>

          {/* Items */}
          <div className="bg-white">
            {items.map((item, index) => {
              const selectedMaterial = findMaterialById(materials, item.materialId);
              
              return (
                <div key={index} className="group">
                  {/* Desktop Layout */}
                  <div className={cn("hidden md:grid grid-cols-7 gap-x-2 items-center px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50/40 hover:to-purple-100/30 transition-all duration-200", {
                    'border-b border-purple-200': index < items.length - 1
                  })}>
                    
                    {/* Material Selection */}
                    <div className="col-span-2 min-w-0 w-full">
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
                    
                    {/* Quantity */}
                    <div className="w-full min-w-0">
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => handleItemUpdate(index, { ...item, quantity: parseFloat(e.target.value) || 0 })} 
                        className="text-center h-8 text-xs w-full min-w-0 rounded-lg" 
                        placeholder="1" 
                      />
                    </div>
                    
                    {/* Unit */}
                    <div className="w-full min-w-0">
                      <div className="h-8 px-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-medium text-gray-700 flex items-center justify-center text-xs w-full min-w-0">
                        {selectedMaterial?.cunit || item.unit || 'Stk'}
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="w-full min-w-0">
                      <div className="h-8 px-2 bg-gray-50 border border-gray-200 rounded-lg text-right font-medium text-gray-700 flex items-center justify-end text-xs w-full min-w-0">
                        {formatCurrency(selectedMaterial?.cnetamount || item.price || 0, item.currency)}
                      </div>
                    </div>
                    
                    {/* Total */}
                    <div className="w-full min-w-0">
                      <div className="h-8 px-2 bg-gradient-to-r from-purple-50/60 to-purple-100/40 border border-purple-200/50 rounded-lg text-right font-semibold text-gray-900 flex items-center justify-end text-xs w-full min-w-0 truncate shadow-sm">
                        {formatCurrency((item.quantity || 0) * (item.price || 0), item.currency)}
                      </div>
                    </div>
                    
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
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">{t('table.unit')}</label>
                        <div className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-center font-medium text-gray-700 flex items-center justify-center">
                          {selectedMaterial?.cunit || item.unit || 'Stk'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">{t('table.price')}</label>
                        <div className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-right font-medium text-gray-700 flex items-center justify-end">
                          {formatCurrency(selectedMaterial?.cnetamount || item.price || 0, item.currency)}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">{t('table.taxRate')}</label>
                        <div className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-center font-medium text-gray-700 flex items-center justify-center">
                          {selectedMaterial ? Math.round(selectedMaterial.ctaxrate * 100) : item.taxRate || 0}%
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="pt-3 border-t border-purple-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{t('table.total')}:</span>
                        <span className="text-lg font-bold text-purple-700">
                          {formatCurrency((item.quantity || 0) * (item.price || 0), item.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
              {t('summary.totalAmount')}: <span className="text-lg font-bold text-purple-700">{formatCurrency(totalAmount, 'EUR')}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
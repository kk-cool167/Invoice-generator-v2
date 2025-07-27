import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Package } from 'lucide-react';
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { CreateMaterialData, Material } from "@/lib/types";
import { createMaterial } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { getEffectiveLanguage } from "@/lib/companyMappings";
import { createStandardToastHandlers, ErrorTypes } from "../lib/errorHandling";
import { AIEnhancedDemoFiller } from "./AIEnhancedDemoFiller";
import { createTranslatedUnits } from "@/lib/unitTranslations";

const createMaterialSchema = (t: (key: string) => string) => z.object({
  cmaterialnumber: z.string().min(1, t('validation.materialNumberRequired')),
  cdescription: z.string().min(1, t('validation.descriptionRequired')),
  ctaxcode: z.string().min(1, t('validation.taxCodeRequired')),
  cunit: z.string().min(1, t('validation.unitRequired')),
  cnetamount: z.number().min(0, t('validation.netAmountPositive')),
  ctype: z.string().min(1, t('validation.typeRequired')),
  ccompanycode: z.enum(["1000", "2000", "3000"], {
    errorMap: () => ({ message: t('validation.companyCodeInvalid') }),
  })
});

interface CreateMaterialProps {
  onSuccess: (material: CreateMaterialData) => void;
  onClose: () => void;
  existingMaterials?: Material[];
}

export function CreateMaterial({ onSuccess, onClose, existingMaterials = [] }: CreateMaterialProps) {
  const { t, currentLanguage } = useLanguage();
  const standardToast = createStandardToastHandlers(toast, t);
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxCodes, setTaxCodes] = useState<Array<{ code: string; rate: number; label: string }>>([]);
  const [units, setUnits] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('1000');

  const form = useForm<CreateMaterialData>({
    resolver: zodResolver(createMaterialSchema(t)),
    defaultValues: {
      cmaterialnumber: '',
      cdescription: '',
      ctype: 'good',
      ctaxcode: '',
      cunit: '',
      cnetamount: 0,
      ccompanycode: '1000'
    },
  });

  // Fetch tax codes and units from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tax codes from backend 
        const taxResponse = await fetch(`http://localhost:3003/api/v1/taxcodes`);
        if (taxResponse.ok) {
          const taxData = await taxResponse.json();
          console.log('CreateMaterial: Loaded all tax codes:', taxData.length, 'codes');
          
          // Filter tax codes by company code on frontend (fallback until backend filtering works)
          const filteredTaxData = taxData.filter((tc: any) => tc.ccompanycode === selectedCompanyCode);
          console.log('CreateMaterial: Filtered tax codes for company', selectedCompanyCode, ':', filteredTaxData.length, 'codes');
          console.log('CreateMaterial: Sample filtered tax codes:', filteredTaxData.slice(0, 3));
          
          const formattedTaxCodes = filteredTaxData.map((tc: any) => ({
            code: tc.ccode,
            rate: tc.crate,
            label: `${tc.ccode} (${(tc.crate * 100).toFixed(1)}%)`
          }));
          console.log('CreateMaterial: Formatted tax codes:', formattedTaxCodes.length, 'codes');
          
          setTaxCodes(formattedTaxCodes);
        }

        // Fetch German units (for codes) but translate labels for UI
        const unitsResponse = await fetch(`http://localhost:3003/api/v1/units?lang=de`);
        if (unitsResponse.ok) {
          const germanUnitsData = await unitsResponse.json();
          console.log('CreateMaterial: Loaded German units:', germanUnitsData.length, 'units');
          console.log('CreateMaterial: Sample units:', germanUnitsData.slice(0, 3));
          
          // Create translated units for UI display while keeping German codes
          const translatedUnits = createTranslatedUnits(germanUnitsData, currentLanguage as 'de' | 'en');
          console.log('CreateMaterial: Translated units:', translatedUnits.length, 'units');
          console.log('CreateMaterial: Sample translated:', translatedUnits.slice(0, 3));
          
          setUnits(translatedUnits);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to minimal hardcoded values if API fails
        setTaxCodes([{ code: 'V1', rate: 0.19, label: 'V1 (19.0%)' }]);
        const fallbackGermanUnits = [{ cabbreviation: 'ST', cdescription: 'Stück' }];
        const translatedFallback = createTranslatedUnits(fallbackGermanUnits, currentLanguage as 'de' | 'en');
        setUnits(translatedFallback);
      }
    };

    fetchData();
  }, [selectedCompanyCode, currentLanguage]); // Re-translate when language changes

  // Watch for company code changes in the form
  const companyCodeValue = form.watch('ccompanycode');
  useEffect(() => {
    if (companyCodeValue && companyCodeValue !== selectedCompanyCode) {
      setSelectedCompanyCode(companyCodeValue);
    }
  }, [companyCodeValue, selectedCompanyCode]);

  const onSubmit = async (data: CreateMaterialData) => {
    setIsSubmitting(true);
    try {
      const materialData = {
        ...data,
        ctype: 'good' // Set default type
        // Tax rate will be automatically determined by backend based on ctaxcode
        // Currency will be automatically set by backend based on ccompanycode
      };

      // Call the API to create the material - backend handles tax rate and currency
      const createdMaterial = await createMaterial(materialData);

      // Show success message
      standardToast.showSuccess('success.materialCreated', data.cdescription);

      // Call the success callback with the material data we sent (includes ccompanycode)
      onSuccess(materialData);
      
      // Reset form and close dialog
      form.reset();
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      setIsSubmitting(false);
      standardToast.showError(ErrorTypes.DATABASE_ERROR, error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleFillDemoData = (demoData: Partial<Material> & { ccompanycode?: string }) => {
    console.log('CreateMaterial: Filling demo data:', demoData);
    
    // Fill basic form fields first
    Object.keys(demoData).forEach((key) => {
      const value = demoData[key as keyof typeof demoData];
      if (value !== undefined && key !== 'ccompanycode' && key !== 'ctaxcode' && key !== 'cunit') {
        console.log(`Setting ${key}:`, value);
        form.setValue(key as keyof CreateMaterialData, value as any);
      }
    });
    
    // Set company code and trigger data reload if needed
    if (demoData.ccompanycode && demoData.ccompanycode !== selectedCompanyCode) {
      setSelectedCompanyCode(demoData.ccompanycode);
      form.setValue('ccompanycode', demoData.ccompanycode);
    }
    
    // Wait a bit for tax codes and units to load, then set random values
    setTimeout(() => {
      // Set random tax code from available options
      if (taxCodes.length > 0) {
        const randomTaxCode = taxCodes[Math.floor(Math.random() * taxCodes.length)];
        console.log('Setting random tax code:', randomTaxCode.code);
        form.setValue('ctaxcode', randomTaxCode.code);
        form.trigger('ctaxcode'); // Force UI update
      }
      
      // Set intelligent unit based on material description with advanced pattern matching
      if (units.length > 0) {
        const materialDescription = demoData.cdescription?.toLowerCase() || '';
        let selectedUnit = units[0]; // fallback
        
        // Zeit-basierte Services -> Stunden, Minuten, Tage
        if (materialDescription.includes('beratung') || materialDescription.includes('consulting') || 
            materialDescription.includes('stunde') || materialDescription.includes('hour') || 
            materialDescription.includes('wartung') || materialDescription.includes('maintenance') ||
            materialDescription.includes('support') || materialDescription.includes('entwicklung') || 
            materialDescription.includes('development') || materialDescription.includes('schulung') ||
            materialDescription.includes('training') || materialDescription.includes('projektmanagement') ||
            materialDescription.includes('analyse') || materialDescription.includes('konzeption')) {
          const timeUnits = units.filter(u => 
            u.value === 'H' || u.value === 'STD' || u.value === 'MIN' || u.value === 'TAG' || u.value === 'WO'
          );
          // Bevorzuge Stunden für die meisten Services
          selectedUnit = units.find(u => u.value === 'H') || timeUnits[0] || units[0];
        }
        
        // Verträge und Abonnements -> Monate, Jahre
        else if (materialDescription.includes('vertrag') || materialDescription.includes('contract') || 
                 materialDescription.includes('abo') || materialDescription.includes('subscription') ||
                 materialDescription.includes('lizenz') && materialDescription.includes('monat') ||
                 materialDescription.includes('license') && materialDescription.includes('month')) {
          const periodUnits = units.filter(u => 
            u.value === 'MON' || u.value === 'JAHR' || u.value === 'QU'
          );
          selectedUnit = units.find(u => u.value === 'MON') || periodUnits[0] || units[0];
        }
        
        // Software und Lizenzen -> Stück
        else if (materialDescription.includes('software') || materialDescription.includes('lizenz') || 
                 materialDescription.includes('license') || materialDescription.includes('app') || 
                 materialDescription.includes('programm') || materialDescription.includes('tool') ||
                 materialDescription.includes('plugin') || materialDescription.includes('extension')) {
          const pieceUnits = units.filter(u => 
            u.value === 'ST' || u.value === 'PCS' || u.value === 'STÜCK'
          );
          selectedUnit = units.find(u => u.value === 'ST') || pieceUnits[0] || units[0];
        }
        
        // Hardware und Geräte -> Stück
        else if (materialDescription.includes('laptop') || materialDescription.includes('computer') || 
                 materialDescription.includes('monitor') || materialDescription.includes('drucker') || 
                 materialDescription.includes('printer') || materialDescription.includes('tastatur') || 
                 materialDescription.includes('keyboard') || materialDescription.includes('maus') || 
                 materialDescription.includes('mouse') || materialDescription.includes('server') ||
                 materialDescription.includes('router') || materialDescription.includes('switch') ||
                 materialDescription.includes('tablet') || materialDescription.includes('smartphone')) {
          const pieceUnits = units.filter(u => 
            u.value === 'ST' || u.value === 'PCS' || u.value === 'STÜCK'
          );
          selectedUnit = units.find(u => u.value === 'ST') || pieceUnits[0] || units[0];
        }
        
        // Flüssigkeiten -> Liter
        else if (materialDescription.includes('öl') || materialDescription.includes('benzin') || 
                 materialDescription.includes('wasser') || materialDescription.includes('tinte') ||
                 materialDescription.includes('farbe') || materialDescription.includes('lack')) {
          const liquidUnits = units.filter(u => 
            u.value === 'L' || u.value === 'ML'
          );
          selectedUnit = units.find(u => u.value === 'L') || liquidUnits[0] || units[0];
        }
        
        // Gewichts-basierte Materialien -> Kilogramm, Gramm
        else if (materialDescription.includes('metall') || materialDescription.includes('stahl') || 
                 materialDescription.includes('aluminium') || materialDescription.includes('kupfer') ||
                 materialDescription.includes('material') || materialDescription.includes('rohstoff') ||
                 materialDescription.includes('pulver') || materialDescription.includes('granulat')) {
          const weightUnits = units.filter(u => 
            u.value === 'KG' || u.value === 'G' || u.value === 'T'
          );
          selectedUnit = units.find(u => u.value === 'KG') || weightUnits[0] || units[0];
        }
        
        // Längen-basierte Materialien -> Meter
        else if (materialDescription.includes('kabel') || materialDescription.includes('rohr') || 
                 materialDescription.includes('draht') || materialDescription.includes('schlauch') ||
                 materialDescription.includes('leitung') || materialDescription.includes('band')) {
          const lengthUnits = units.filter(u => 
            u.value === 'M' || u.value === 'CM' || u.value === 'MM'
          );
          selectedUnit = units.find(u => u.value === 'M') || lengthUnits[0] || units[0];
        }
        
        // Flächen-basierte Materialien -> Quadratmeter
        else if (materialDescription.includes('folie') || materialDescription.includes('plane') || 
                 materialDescription.includes('teppich') || materialDescription.includes('fliese')) {
          const areaUnits = units.filter(u => 
            u.value === 'QM' || u.value === 'M2'
          );
          selectedUnit = units.find(u => u.value === 'QM') || areaUnits[0] || units[0];
        }
        
        // Verpackungs-Einheiten -> Karton, Palette, Kiste
        else if (materialDescription.includes('verpackung') || materialDescription.includes('karton') || 
                 materialDescription.includes('palette') || materialDescription.includes('kiste')) {
          const packagingUnits = units.filter(u => 
            u.value === 'KAR' || u.value === 'PAL' || u.value === 'KISTE'
          );
          selectedUnit = packagingUnits[0] || units.find(u => u.value === 'ST') || units[0];
        }
        
        // Sätze und Sets -> Set, Paar
        else if (materialDescription.includes('set') || materialDescription.includes('kit') || 
                 materialDescription.includes('satz') || materialDescription.includes('paar') ||
                 materialDescription.includes('garnitur')) {
          const setUnits = units.filter(u => 
            u.value === 'SET' || u.value === 'PAAR' || u.value === 'SATZ'
          );
          selectedUnit = units.find(u => u.value === 'SET') || setUnits[0] || units.find(u => u.value === 'ST') || units[0];
        }
        
        // Default: Intelligent fallback basierend auf verfügbaren Units
        else {
          // Bevorzuge ST (Stück) als Standard für physische Gegenstände
          selectedUnit = units.find(u => u.value === 'ST') || units[0];
        }
        
        console.log('Setting intelligent unit for', materialDescription, ':', selectedUnit.value, '(', selectedUnit.label, ')');
        form.setValue('cunit', selectedUnit.value);
        form.trigger('cunit'); // Force UI update
      }
      
      // Trigger validation for all fields to ensure UI is in sync
      form.trigger();
    }, 500); // Small delay to ensure data is loaded
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <span>{t('material.createNew')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('material.createDescription')}
          </DialogDescription>
          <div className="flex justify-end">
            <AIEnhancedDemoFiller
              type="material"
              existingData={existingMaterials}
              companyCode={form.getValues('ccompanycode')}
              onFillData={handleFillDemoData}
            />
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cmaterialnumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('material.materialNumber')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('material.enterMaterialNumber')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ccompanycode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('material.companyCode')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('material.selectCompanyCode')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1000">1000</SelectItem>
                        <SelectItem value="2000">2000</SelectItem>
                        <SelectItem value="3000">3000</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cunit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('material.unit')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('placeholder.selectUnit')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent 
                        className="max-h-[200px] overflow-y-auto z-[100]"
                        position="popper"
                        sideOffset={4}
                      >
                        {units.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value} className="text-sm">
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnetamount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('material.netAmount')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={t('material.enterNetAmount')}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cdescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('material.description')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('material.enterDescription')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ctaxcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('material.taxCode')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('placeholder.selectTaxCode')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent 
                      className="max-h-[200px] overflow-y-auto z-[100]"
                      position="popper"
                      sideOffset={4}
                    >
                      {taxCodes.map((tc) => (
                        <SelectItem key={tc.code} value={tc.code} className="text-sm">
                          {tc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('buttons.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('buttons.creating') : t('buttons.create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Package, Plus, Trash2, Download, Upload, Wand2, FileSpreadsheet, AlertCircle, Sparkles, X, Trash, Info } from 'lucide-react';
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Textarea } from "./ui/textarea";
import { useLanguage } from "@/context/LanguageContext";
import { CreateMaterialData, Material } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { createTranslatedUnits } from "@/lib/unitTranslations";
import { createStandardToastHandlers, ErrorTypes } from "../lib/errorHandling";
import { generateAIEnhancedMaterialData, initializeAIModels, currentModelInfo } from "@/lib/aiDataGenerator";

// Bulk material row interface
interface BulkMaterialRow extends CreateMaterialData {
  id: string;
  status: 'draft' | 'validating' | 'valid' | 'invalid' | 'creating' | 'created' | 'failed';
  errors?: Record<string, string>;
}

// Bulk creation schema
const createBulkMaterialSchema = (t: (key: string) => string) => z.object({
  materials: z.array(z.object({
    id: z.string(),
    cmaterialnumber: z.string().min(1, t('validation.materialNumberRequired')),
    cdescription: z.string().min(1, t('validation.descriptionRequired')),
    ctaxcode: z.string().min(1, t('validation.taxCodeRequired')),
    cunit: z.string().min(1, t('validation.unitRequired')),
    cnetamount: z.number().min(0, t('validation.netAmountPositive')),
    ctype: z.string().min(1, t('validation.typeRequired')),
    ccompanycode: z.enum(["1000", "2000", "3000"]),
    status: z.string().optional(),
    errors: z.record(z.string()).optional()
  })).min(1, t('validation.atLeastOneMaterial')).max(50, t('validation.maxMaterialsExceeded'))
});

interface CreateBulkMaterialsProps {
  onSuccess: (materials: CreateMaterialData[]) => void;
  onClose: () => void;
  existingMaterials?: Material[];
}

export function CreateBulkMaterials({ onSuccess, onClose, existingMaterials = [] }: CreateBulkMaterialsProps) {
  const { t, currentLanguage } = useLanguage();
  const standardToast = createStandardToastHandlers(toast, t);
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxCodes, setTaxCodes] = useState<Array<{ code: string; rate: number; label: string }>>([]);
  const [units, setUnits] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('1000');
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, successful: 0, failed: 0 });
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingFromPrompt, setIsGeneratingFromPrompt] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const form = useForm({
    resolver: zodResolver(createBulkMaterialSchema(t)),
    defaultValues: {
      materials: [createEmptyMaterialRow()]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "materials"
  });

  function createEmptyMaterialRow(): BulkMaterialRow {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      cmaterialnumber: '',
      cdescription: '',
      ctype: 'good',
      ctaxcode: '',
      cunit: '',
      cnetamount: 0,
      ccompanycode: selectedCompanyCode,
      status: 'draft'
    };
  }

  // Fetch tax codes and units
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tax codes
        const taxResponse = await fetch(`http://localhost:3003/api/v1/taxcodes`);
        if (taxResponse.ok) {
          const taxData = await taxResponse.json();
          const filteredTaxData = taxData.filter((tc: any) => tc.ccompanycode === selectedCompanyCode);
          const formattedTaxCodes = filteredTaxData.map((tc: any) => ({
            code: tc.ccode,
            rate: tc.crate,
            label: `${tc.ccode} (${(tc.crate * 100).toFixed(1)}%)`
          }));
          setTaxCodes(formattedTaxCodes);
        }

        // Fetch German units with translations
        const unitsResponse = await fetch(`http://localhost:3003/api/v1/units?lang=de`);
        if (unitsResponse.ok) {
          const germanUnitsData = await unitsResponse.json();
          const translatedUnits = createTranslatedUnits(germanUnitsData, currentLanguage as 'de' | 'en');
          setUnits(translatedUnits);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        standardToast.showError(ErrorTypes.NETWORK_ERROR, error);
      }
    };

    fetchData();
  }, [selectedCompanyCode, currentLanguage]);

  const addNewRow = () => {
    append(createEmptyMaterialRow());
  };

  const removeRow = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const deleteAllRows = () => {
    // Remove all but keep one empty row
    const currentMaterials = form.getValues('materials');
    if (currentMaterials.length > 1) {
      // Clear the form and add one empty row
      form.setValue('materials', [createEmptyMaterialRow()]);
      standardToast.showSuccess('success.allMaterialsCleared');
    }
  };


  // CSV Import Functions
  const parseCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(/[,;]/).map(h => h.trim());
        
        // Map CSV headers to our field names
        const fieldMapping: Record<string, string> = {
          'materialnumber': 'cmaterialnumber',
          'material number': 'cmaterialnumber',
          'materialnummer': 'cmaterialnumber',
          'description': 'cdescription',
          'beschreibung': 'cdescription',
          'type': 'ctype',
          'typ': 'ctype',
          'taxcode': 'ctaxcode',
          'tax code': 'ctaxcode',
          'steuercode': 'ctaxcode',
          'unit': 'cunit',
          'einheit': 'cunit',
          'netamount': 'cnetamount',
          'net amount': 'cnetamount',
          'nettobetrag': 'cnetamount',
          'price': 'cnetamount',
          'preis': 'cnetamount',
          'companycode': 'ccompanycode',
          'company code': 'ccompanycode',
          'firmennummer': 'ccompanycode'
        };

        // Parse data rows
        const parsedData = lines.slice(1).map((line, index) => {
          const values = line.split(/[,;]/);
          const row: any = {
            id: Date.now().toString() + index + Math.random().toString(36).substr(2, 9),
            status: 'draft'
          };

          headers.forEach((header, i) => {
            const normalizedHeader = header.toLowerCase().replace(/['"]/g, '');
            const fieldName = fieldMapping[normalizedHeader];
            
            if (fieldName && values[i]) {
              const value = values[i].trim().replace(/['"]/g, '');
              
              // Type conversion based on field
              if (fieldName === 'cnetamount') {
                row[fieldName] = parseFloat(value.replace(',', '.')) || 0;
              } else if (fieldName === 'ctype' && !value) {
                row[fieldName] = 'good'; // Default type
              } else {
                row[fieldName] = value;
              }
            }
          });

          // Set defaults for missing fields
          row.ctype = row.ctype || 'good';
          row.ccompanycode = row.ccompanycode || selectedCompanyCode;
          row.cnetamount = row.cnetamount || 0;

          return row as BulkMaterialRow;
        });

        setCsvPreview(parsedData);
        setShowCsvImport(true);
      } catch (error) {
        console.error('CSV parse error:', error);
        standardToast.showError(ErrorTypes.VALIDATION_ERROR, 'Invalid CSV format');
      }
    };

    reader.readAsText(file);
  };

  const handleCsvImport = () => {
    if (csvPreview.length > 0) {
      form.setValue('materials', csvPreview);
      setShowCsvImport(false);
      setCsvPreview([]);
      standardToast.showSuccess('success.csvImported', csvPreview.length.toString());
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        parseCsvFile(file);
      } else {
        standardToast.showError(ErrorTypes.VALIDATION_ERROR, 'Please select a CSV file');
      }
    }
  };

  const downloadCsvTemplate = () => {
    const template = `Material Number,Description,Type,Tax Code,Unit,Net Amount,Company Code
MAT-001,Sample Material 1,good,V1,ST,100.00,1000
MAT-002,Sample Service,service,V1,H,150.00,1000
MAT-003,Sample Software,software,V0,ST,2500.00,1000`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'material_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // AI Prompt-based Generation - Direct prompt to Kimi
  const generateFromAIPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGeneratingFromPrompt(true);
    try {
      // Initialize AI models if needed
      await initializeAIModels();
      
      // Create structured prompt with explicit rules for Kimi
      const structuredPrompt = `AUFGABE: Erstelle Materialien basierend auf folgender Anfrage: "${aiPrompt}"

REGELN:
1. Erstelle NUR eine einfache nummerierte Liste
2. Format: "1. Materialname", "2. Materialname", etc.
3. KEINE zusätzlichen Erklärungen, Eigenschaften oder Beschreibungen
4. KEINE Bullet Points (-)
5. KEINE Markdown Formatierung (**)
6. Jede Zeile = ein Material
7. Materialname sollte 2-4 Wörter haben

BEISPIEL:
1. Hydraulikzylinder
2. Pneumatikventil  
3. Kugellager
4. Servomotor
5. Linearführung

Jetzt erstelle die Liste:`;

      // Send structured prompt to Kimi
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "moonshotai/kimi-k2",
          "messages": [
            {
              "role": "user", 
              "content": structuredPrompt
            }
          ],
          "temperature": 0.7,
          "max_tokens": 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const kimiResponse = data.choices?.[0]?.message?.content || '';
      
      console.log('🤖 Kimi Response:', kimiResponse);
      
      // Parse Kimi's response to extract material items
      const newMaterials: BulkMaterialRow[] = [];
      
      console.log('🔍 Parsing Kimi response:', kimiResponse);
      
      // Split response into lines 
      const lines = kimiResponse.split('\n');
      console.log('📄 Lines found:', lines.length);
      
      let materialCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        console.log(`📋 Line ${i}: "${line}"`);
        
        // Skip completely empty lines
        if (!line) continue;
        
        // Skip obvious headers/formatting and sub-bullets
        if (line.startsWith('#') || 
            line.includes('---') || 
            line.startsWith('|') ||
            line.toLowerCase().includes('hier sind') ||
            line.toLowerCase().includes('materials:') ||
            line.toLowerCase().includes('artikel:') ||
            line.toLowerCase().includes('eigenschaften:') ||
            line.toLowerCase().includes('einsatz:') ||
            line.toLowerCase().includes('**eigenschaften') ||
            line.toLowerCase().includes('**einsatz') ||
            line.length > 150 || // Skip very long descriptive lines
            line.toLowerCase().includes('diese palette') ||
            line.toLowerCase().includes('typische anwendung')) {
          console.log(`⏭️ Skipping header/formatting: "${line}"`);
          continue;
        }
        
        let materialName = '';
        let price = Math.floor(Math.random() * 400) + 50; // Random price 50-450
        let type = 'good';
        let unit = 'ST';
        
        // Extract material from different formats - ONLY numbered items for main materials
        if (line.match(/^\d+\.\s*(.+)/)) {
          // Numbered list: "1. **Stahl S235JR (früher St37-2)**"
          materialName = line.replace(/^\d+\.\s*/, '');
          console.log(`🔢 Found numbered item: "${materialName}"`);
        } else {
          // Skip all other formats (bullets, regular lines) to avoid sub-items
          console.log(`❌ Skipping non-numbered line: "${line}"`);
          continue;
        }
        
        // Skip if no material name
        if (!materialName) {
          console.log(`❌ No material name found in: "${line}"`);
          continue;
        }
        
        // Clean material name - remove markdown and brackets
        materialName = materialName
          // Remove markdown formatting
          .replace(/\*\*/g, '') // Remove **bold**
          .replace(/\*/g, '') // Remove *italic*
          // Split at first opening bracket to get main name
          .split(' (')[0]
          .split('(')[0]
          // Remove other separators
          .split(' - ')[0]
          .split(':')[0]
          .split('€')[0]
          .split('EUR')[0]
          // Clean up whitespace
          .replace(/\s+/g, ' ')
          .trim();
        
        // Skip if cleaned name is too short
        if (materialName.length < 3) {
          console.log(`❌ Material name too short after cleaning: "${materialName}"`);
          continue;
        }
        
        // Determine type from keywords
        const lowerName = materialName.toLowerCase();
        if (lowerName.includes('beratung') || lowerName.includes('service') || 
            lowerName.includes('wartung') || lowerName.includes('support') ||
            lowerName.includes('consulting') || lowerName.includes('stunde')) {
          type = 'service';
          unit = 'H';
          price = Math.floor(Math.random() * 200) + 80; // 80-280 for services
        } else if (lowerName.includes('software') || lowerName.includes('lizenz') || 
                   lowerName.includes('app') || lowerName.includes('system')) {
          type = 'software';
          unit = 'ST';
          price = Math.floor(Math.random() * 2000) + 500; // 500-2500 for software
        }
        
        console.log(`✅ Creating material: "${materialName}" (${type}, ${price}€)`);
        
        // Create material entry
        newMaterials.push({
          id: Date.now().toString() + materialCount + Math.random().toString(36).substr(2, 9),
          cmaterialnumber: `MAT-${Date.now().toString().slice(-6)}-${String(materialCount + 1).padStart(3, '0')}`,
          cdescription: materialName,
          ctype: type,
          ctaxcode: 'V1',
          cunit: unit,
          cnetamount: price,
          ccompanycode: selectedCompanyCode,
          status: 'draft'
        });
        
        materialCount++;
        
        // Limit to max 20 materials
        if (materialCount >= 20) {
          console.log('🛑 Reached max 20 materials');
          break;
        }
      }
      
      console.log(`📊 Total materials created: ${newMaterials.length}`);
      
      // If no materials were parsed, create a fallback
      if (newMaterials.length === 0) {
        console.log('⚠️ No materials parsed, creating fallback');
        newMaterials.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          cmaterialnumber: `MAT-${Date.now().toString().slice(-6)}`,
          cdescription: 'AI Generated Material',
          ctype: 'good',
          ctaxcode: 'V1', 
          cunit: 'ST',
          cnetamount: 100,
          ccompanycode: selectedCompanyCode,
          status: 'draft'
        });
      }
      
      // Set materials in form
      form.setValue('materials', newMaterials);
      
      standardToast.showSuccess('success.aiPromptGenerated', newMaterials.length.toString());
      setShowAIPrompt(false);
      setAiPrompt('');
    } catch (error) {
      console.error('AI prompt generation failed:', error);
      standardToast.showError(ErrorTypes.GENERATION_ERROR, error);
    } finally {
      setIsGeneratingFromPrompt(false);
    }
  };

  const validateRow = (rowData: BulkMaterialRow, index: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (!rowData.cmaterialnumber.trim()) {
      errors.cmaterialnumber = t('validation.materialNumberRequired');
    }
    if (!rowData.cdescription.trim()) {
      errors.cdescription = t('validation.descriptionRequired');
    }
    if (!rowData.ctaxcode.trim()) {
      errors.ctaxcode = t('validation.taxCodeRequired');
    }
    if (!rowData.cunit.trim()) {
      errors.cunit = t('validation.unitRequired');
    }
    if (rowData.cnetamount <= 0) {
      errors.cnetamount = t('validation.netAmountPositive');
    }

    // Check for duplicate material numbers within the form
    const currentMaterials = form.getValues('materials');
    const duplicates = currentMaterials.filter((m, i) => 
      i !== index && m.cmaterialnumber === rowData.cmaterialnumber && rowData.cmaterialnumber.trim()
    );
    if (duplicates.length > 0) {
      errors.cmaterialnumber = t('validation.duplicateMaterialNumber');
    }

    const isValid = Object.keys(errors).length === 0;
    
    // Update row status and errors
    form.setValue(`materials.${index}.status`, isValid ? 'valid' : 'invalid');
    form.setValue(`materials.${index}.errors`, errors);
    
    return isValid;
  };

  const bulkCreateMaterials = async (materials: BulkMaterialRow[]) => {
    setIsSubmitting(true);
    setBulkProgress({ current: 0, total: materials.length, successful: 0, failed: 0 });

    try {
      const results = [];
      
      for (let i = 0; i < materials.length; i++) {
        setBulkProgress(prev => ({ ...prev, current: i + 1 }));
        
        try {
          // Update row status to creating
          form.setValue(`materials.${i}.status`, 'creating');
          
          const material = materials[i];
          const { id, status, errors, ...materialData } = material;
          
          // Create individual material via existing API
          const response = await fetch('http://localhost:3003/api/v1/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(materialData)
          });

          if (response.ok) {
            const createdMaterial = await response.json();
            form.setValue(`materials.${i}.status`, 'created');
            setBulkProgress(prev => ({ ...prev, successful: prev.successful + 1 }));
            results.push(createdMaterial);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Creation failed');
          }
        } catch (error) {
          console.error(`Failed to create material ${i}:`, error);
          form.setValue(`materials.${i}.status`, 'failed');
          form.setValue(`materials.${i}.errors`, { 
            general: error instanceof Error ? error.message : 'Unknown error' 
          });
          setBulkProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
        }
      }

      // Show summary
      const { successful, failed } = bulkProgress;
      if (successful > 0) {
        standardToast.showSuccess('success.bulkMaterialsCreated', `${successful}/${materials.length}`);
        onSuccess(results);
      }
      if (failed > 0) {
        standardToast.showWarning('warning.partialBulkSuccess', `${failed}/${materials.length}`);
      }

    } catch (error) {
      standardToast.showError(ErrorTypes.DATABASE_ERROR, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: { materials: BulkMaterialRow[] }) => {
    // Validate all rows
    let allValid = true;
    data.materials.forEach((material, index) => {
      const isValid = validateRow(material, index);
      if (!isValid) allValid = false;
    });

    if (!allValid) {
      standardToast.showError(ErrorTypes.VALIDATION_ERROR, 'Please fix validation errors');
      return;
    }

    await bulkCreateMaterials(data.materials);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const getRowStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'secondary', text: 'Draft' },
      valid: { color: 'outline', text: 'Valid' },
      invalid: { color: 'destructive', text: 'Invalid' },
      creating: { color: 'default', text: 'Creating...' },
      created: { color: 'default', text: 'Created' },
      failed: { color: 'destructive', text: 'Failed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.color as any}>{config.text}</Badge>;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <span>{t('material.createBulk')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('material.createBulkDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <Button type="button" onClick={addNewRow} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              {t('buttons.addRow')}
            </Button>
            
            <Button
              type="button"
              onClick={deleteAllRows}
              size="sm"
              variant="outline"
              disabled={fields.length <= 1 || isSubmitting}
              className="border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash className="h-4 w-4 mr-1" />
              {t('buttons.deleteAll')}
            </Button>
            
            <div className="border-l pl-2 ml-2 flex items-center gap-2">
              <Button
                type="button"
                onClick={() => setShowAIPrompt(true)}
                size="sm"
                variant="outline"
                className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-cyan-100"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {t('buttons.aiPrompt')}
              </Button>
            </div>
            
            <div className="border-l pl-2 ml-2 flex items-center gap-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Upload className="h-4 w-4 mr-1" />
                {t('buttons.importCSV')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                onClick={downloadCsvTemplate}
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4 mr-1" />
                {t('buttons.downloadTemplate')}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{fields.length} {t('material.materials')}</span>
            
            {/* AI Model Debug Info */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="h-6 px-2 text-xs"
            >
              <Info className="h-3 w-3 mr-1" />
              AI: {currentModelInfo.modelName.split(' ')[0]}
            </Button>
            
            {isSubmitting && (
              <div className="flex items-center gap-2">
                <Progress value={(bulkProgress.current / bulkProgress.total) * 100} className="w-24" />
                <span>{bulkProgress.current}/{bulkProgress.total}</span>
              </div>
            )}
          </div>
        </div>

        {/* Debug Info Panel */}
        {showDebugInfo && (
          <div className="bg-gray-50 border rounded-lg p-3 mb-4">
            <div className="text-sm font-medium mb-2">🤖 AI Model Status</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><strong>Model:</strong> {currentModelInfo.modelName}</div>
              <div><strong>Device:</strong> {currentModelInfo.device}</div>
              <div><strong>Status:</strong> {currentModelInfo.isLoaded ? '✅ Loaded' : '❌ Not Loaded'}</div>
              <div><strong>Load Time:</strong> {currentModelInfo.loadTime}ms</div>
            </div>
            {currentModelInfo.ollamaModels && currentModelInfo.ollamaModels.length > 0 && (
              <div className="text-xs mt-2">
                <strong>Available Models:</strong> {currentModelInfo.ollamaModels.join(', ')}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              {currentModelInfo.device === 'ollama' 
                ? 'Using Ollama API at localhost:11434'
                : 'Check browser console for detailed AI generation logs'}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
            {/* Bulk Materials Table */}
            <ScrollArea className="flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-32">{t('material.materialNumber')}</TableHead>
                    <TableHead className="w-48">{t('material.description')}</TableHead>
                    <TableHead className="w-24">{t('material.type')}</TableHead>
                    <TableHead className="w-32">{t('material.taxCode')}</TableHead>
                    <TableHead className="w-24">{t('material.unit')}</TableHead>
                    <TableHead className="w-24">{t('material.netAmount')}</TableHead>
                    <TableHead className="w-20">{t('material.companyCode')}</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id} className="group">
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      
                      {/* Material Number */}
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`materials.${index}.cmaterialnumber`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="MAT-001"
                                  className="h-8"
                                  {...inputField}
                                  onChange={(e) => {
                                    inputField.onChange(e);
                                    setTimeout(() => validateRow(form.getValues(`materials.${index}`), index), 100);
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`materials.${index}.cdescription`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={t('material.enterDescription')}
                                  className="h-8"
                                  {...inputField}
                                  onChange={(e) => {
                                    inputField.onChange(e);
                                    setTimeout(() => validateRow(form.getValues(`materials.${index}`), index), 100);
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`materials.${index}.ctype`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <Select onValueChange={inputField.onChange} value={inputField.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="good">Good</SelectItem>
                                  <SelectItem value="service">Service</SelectItem>
                                  <SelectItem value="software">Software</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* Tax Code */}
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`materials.${index}.ctaxcode`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <Select onValueChange={inputField.onChange} value={inputField.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {taxCodes.map((tc) => (
                                    <SelectItem key={tc.code} value={tc.code}>
                                      {tc.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* Unit */}
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`materials.${index}.cunit`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <Select onValueChange={inputField.onChange} value={inputField.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {units.map((unit) => (
                                    <SelectItem key={unit.value} value={unit.value}>
                                      {unit.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* Net Amount */}
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`materials.${index}.cnetamount`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  className="h-8"
                                  {...inputField}
                                  onChange={(e) => {
                                    inputField.onChange(parseFloat(e.target.value) || 0);
                                    setTimeout(() => validateRow(form.getValues(`materials.${index}`), index), 100);
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* Company Code */}
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`materials.${index}.ccompanycode`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <Select onValueChange={inputField.onChange} value={inputField.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1000">1000</SelectItem>
                                  <SelectItem value="2000">2000</SelectItem>
                                  <SelectItem value="3000">3000</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {getRowStatusBadge(form.watch(`materials.${index}.status`) || 'draft')}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(index)}
                          disabled={fields.length <= 1 || isSubmitting}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {bulkProgress.total > 0 && (
                  <span>
                    ✅ {bulkProgress.successful} erfolgreiche, ❌ {bulkProgress.failed} fehlgeschlagen
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  {t('buttons.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting || fields.length === 0}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      {t('buttons.creating')} ({bulkProgress.current}/{bulkProgress.total})
                    </>
                  ) : (
                    `${t('buttons.create')} ${fields.length} ${t('material.materials')}`
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    {/* CSV Import Preview Dialog */}
    <Dialog open={showCsvImport} onOpenChange={setShowCsvImport}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>{t('csv.previewTitle')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('csv.previewDescription').replace('{0}', csvPreview.length.toString())}
          </DialogDescription>
        </DialogHeader>

        {csvPreview.length > 0 && (
          <>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('csv.importWarning')}
              </AlertDescription>
            </Alert>

            <ScrollArea className="flex-1 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('material.materialNumber')}</TableHead>
                    <TableHead>{t('material.description')}</TableHead>
                    <TableHead>{t('material.type')}</TableHead>
                    <TableHead>{t('material.taxCode')}</TableHead>
                    <TableHead>{t('material.unit')}</TableHead>
                    <TableHead>{t('material.netAmount')}</TableHead>
                    <TableHead>{t('material.companyCode')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvPreview.slice(0, 20).map((material, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {material.cmaterialnumber || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {material.cdescription || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{material.ctype || 'good'}</Badge>
                      </TableCell>
                      <TableCell>{material.ctaxcode || '-'}</TableCell>
                      <TableCell>{material.cunit || '-'}</TableCell>
                      <TableCell className="text-right">
                        {material.cnetamount ? material.cnetamount.toFixed(2) : '0.00'}
                      </TableCell>
                      <TableCell>{material.ccompanycode || selectedCompanyCode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {csvPreview.length > 20 && (
              <div className="text-sm text-muted-foreground text-center py-2">
                {t('csv.showingFirst20').replace('{0}', csvPreview.length.toString())}
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setShowCsvImport(false)}>
            {t('buttons.cancel')}
          </Button>
          <Button 
            type="button" 
            onClick={handleCsvImport}
            disabled={csvPreview.length === 0}
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('buttons.importMaterials').replace('{0}', csvPreview.length.toString())}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* AI Prompt Dialog */}
    <Dialog open={showAIPrompt} onOpenChange={setShowAIPrompt}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>{t('ai.promptTitle')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('ai.promptDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Textarea
              placeholder={t('ai.promptPlaceholder')}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="min-h-[150px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{t('ai.examplePrompts')}</p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setAiPrompt(currentLanguage === 'de' 
                  ? "Erstelle 5 Beratungsstunden für IT-Dienstleistungen zwischen 100-300€"
                  : "Create 5 consulting hours for IT services between 100-300€"
                )}
                className="w-full text-left text-sm p-2 rounded hover:bg-gray-100 transition-colors"
              >
                • {currentLanguage === 'de' 
                    ? "Erstelle 5 Beratungsstunden für IT-Dienstleistungen zwischen 100-300€"
                    : "Create 5 consulting hours for IT services between 100-300€"}
              </button>
              <button
                type="button"
                onClick={() => setAiPrompt(currentLanguage === 'de' 
                  ? "10 Hardware-Artikel für Büroausstattung"
                  : "10 hardware items for office equipment"
                )}
                className="w-full text-left text-sm p-2 rounded hover:bg-gray-100 transition-colors"
              >
                • {currentLanguage === 'de' 
                    ? "10 Hardware-Artikel für Büroausstattung"
                    : "10 hardware items for office equipment"}
              </button>
              <button
                type="button"
                onClick={() => setAiPrompt(currentLanguage === 'de' 
                  ? "Erstelle mir bitte 3 Software-Lizenzen für Projektmanagement"
                  : "Please create 3 software licenses for project management"
                )}
                className="w-full text-left text-sm p-2 rounded hover:bg-gray-100 transition-colors"
              >
                • {currentLanguage === 'de' 
                    ? "Erstelle mir bitte 3 Software-Lizenzen für Projektmanagement"
                    : "Please create 3 software licenses for project management"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowAIPrompt(false);
              setAiPrompt('');
            }}
            disabled={isGeneratingFromPrompt}
          >
            {t('buttons.cancel')}
          </Button>
          <Button
            type="button"
            onClick={generateFromAIPrompt}
            disabled={!aiPrompt.trim() || isGeneratingFromPrompt}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          >
            {isGeneratingFromPrompt ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                {t('buttons.generating')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t('buttons.generate')}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
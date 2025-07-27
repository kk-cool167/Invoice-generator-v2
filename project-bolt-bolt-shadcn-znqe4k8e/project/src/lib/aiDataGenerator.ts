/**
 * AI-powered data generator using Ollama local models
 * Provides intelligent, context-aware business data generation with superior quality
 * Using local Ollama API for reliable, fast text generation
 */

import type { Vendor, Recipient, Material } from './types';

// OpenRouter configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = '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';
let isOpenRouterAvailable = false;

// Debug info for model status
export let currentModelInfo = {
  modelName: 'moonshotai/kimi-k2',
  device: 'openrouter',
  loadTime: 0,
  isLoaded: false,
  availableModels: ['moonshotai/kimi-k2'] as string[]
};

// OpenRouter API functions
async function checkOpenRouterAvailable(): Promise<boolean> {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "moonshotai/kimi-k2",
        "messages": [{"role": "user", "content": "test"}],
        "max_tokens": 1
      })
    });
    return response.ok || response.status === 400; // 400 might indicate API is available but request invalid
  } catch (error) {
    return false;
  }
}

async function getOpenRouterModels(): Promise<string[]> {
  // OpenRouter has many models, we'll use our preferred ones
  return ['moonshotai/kimi-k2'];
}

async function generateWithOpenRouter(prompt: string, model: string = 'moonshotai/kimi-k2'): Promise<string> {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ],
        "temperature": 0.7,
        "max_tokens": 50,
        "stop": ['\n', '.', '!', '?', ',', ';']
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.warn('OpenRouter generation failed:', error);
    throw error;
  }
}

// Initialize OpenRouter connection
export async function initializeAIModels(): Promise<void> {
  const startTime = Date.now();
  console.log('🚀 Starting OpenRouter AI model initialization...');
  
  try {
    // Check if OpenRouter is available
    isOpenRouterAvailable = await checkOpenRouterAvailable();
    
    if (isOpenRouterAvailable) {
      console.log('✅ OpenRouter is available!');
      
      // Get available models
      const models = await getOpenRouterModels();
      console.log('📋 Available OpenRouter models:', models);
      
      const selectedModel = 'moonshotai/kimi-k2';
      
      currentModelInfo = {
        modelName: selectedModel,
        device: 'openrouter',
        loadTime: Date.now() - startTime,
        isLoaded: true,
        availableModels: models
      };
      console.log(`✅ Using OpenRouter model: ${selectedModel}`);
      console.log('📊 Model info:', currentModelInfo);
    } else {
      throw new Error('OpenRouter not available');
    }
  } catch (error) {
    console.warn('❌ OpenRouter initialization failed:', error);
    isOpenRouterAvailable = false;
    currentModelInfo = {
      modelName: 'Rule-based generation (OpenRouter not available)',
      device: 'none',
      loadTime: Date.now() - startTime,
      isLoaded: false,
      availableModels: []
    };
    console.log('📊 Fallback to rule-based generation');
  }
}

// Industry categories for intelligent business matching
const BUSINESS_INDUSTRIES = {
  technology: ['Software', 'Hardware', 'IT Services', 'Cloud Computing', 'AI/ML', 'Cybersecurity'],
  manufacturing: ['Automotive', 'Electronics', 'Machinery', 'Textiles', 'Chemicals', 'Food Production'],
  services: ['Consulting', 'Marketing', 'Legal', 'Accounting', 'HR Services', 'Design'],
  healthcare: ['Medical Devices', 'Pharmaceuticals', 'Healthcare IT', 'Biotechnology'],
  finance: ['Banking', 'Insurance', 'Investment', 'Fintech', 'Asset Management'],
  retail: ['E-commerce', 'Fashion', 'Consumer Goods', 'Hospitality', 'Food & Beverage'],
  logistics: ['Transportation', 'Warehousing', 'Supply Chain', 'Courier Services'],
  energy: ['Renewable Energy', 'Oil & Gas', 'Utilities', 'Green Technology'],
  construction: ['Building Materials', 'Architecture', 'Civil Engineering', 'Property Development'],
  education: ['Training Services', 'Educational Software', 'Learning Materials', 'Academic Research'],
  media: ['Content Creation', 'Broadcasting', 'Publishing', 'Digital Media'],
  agriculture: ['Farming Equipment', 'Agricultural Services', 'Food Processing', 'Biotechnology']
};

// Smart business name generation using AI
export async function generateIntelligentBusinessName(
  industry: string,
  language: 'de' | 'en',
  businessType: 'vendor' | 'recipient'
): Promise<{ name: string; description: string; industry: string }> {
  console.log(`🎯 Generating business name with ${currentModelInfo.modelName} for ${industry} industry`);
  
  try {
    if (!isOpenRouterAvailable) {
      console.log('⚠️ OpenRouter not available, using fallback generation');
      return fallbackBusinessGeneration(industry, language, businessType);
    }

    // Create Kimi-optimized prompt
    const prompt = language === 'de' 
      ? `Generiere einen professionellen deutschen Firmennamen für ein ${businessType === 'vendor' ? 'Lieferanten' : 'Kunden'}unternehmen im Bereich ${industry}.
Format: [Firmenname] [Rechtsform]
Beispiele: "TechFlow Solutions GmbH", "Digital Services AG", "Innovation Labs GmbH"
Firmenname:`
      : `Generate a professional company name for a ${businessType} business in the ${industry} industry.
Format: [Company Name] [Legal Form]
Examples: "TechFlow Solutions Inc", "Digital Services Corp", "Innovation Labs LLC"
Company name:`;

    const generatedText = await generateWithOpenRouter(prompt, currentModelInfo.modelName);
    const cleanName = extractCompanyName(generatedText, language);

    // Classify the business for better context
    const classification = await classifyBusiness(cleanName, Object.keys(BUSINESS_INDUSTRIES));
    const detectedIndustry = classification?.label || industry;
    const subIndustries = BUSINESS_INDUSTRIES[detectedIndustry as keyof typeof BUSINESS_INDUSTRIES] || [industry];
    const specificIndustry = subIndustries[Math.floor(Math.random() * subIndustries.length)];

    return {
      name: cleanName,
      description: `${specificIndustry} ${businessType === 'vendor' ? 'Supplier' : 'Customer'}`,
      industry: specificIndustry
    };

  } catch (error) {
    console.warn('AI generation failed, using fallback:', error);
    return fallbackBusinessGeneration(industry, language, businessType);
  }
}

// Intelligent material/service generation
export async function generateIntelligentMaterial(
  companyIndustry: string,
  language: 'de' | 'en'
): Promise<{ name: string; description: string; type: string; unit: string }> {
  try {
    if (!isOpenRouterAvailable) {
      return fallbackMaterialGeneration(companyIndustry, language);
    }

    const prompt = language === 'de'
      ? `Erstelle einen professionellen Produkt- oder Servicenamen für die ${companyIndustry} Branche.
Antworte nur mit dem Produktnamen (maximal 4 Wörter).
Beispiel: "Cloud Hosting Service"
Produktname:`
      : `Create a professional product or service name for the ${companyIndustry} industry.
Reply only with the product name (maximum 4 words).
Example: "Cloud Hosting Service"
Product name:`;

    const generatedText = await generateWithOpenRouter(prompt, currentModelInfo.modelName);
    const cleanName = extractProductName(generatedText, language);

    // Determine product type and unit based on industry
    const { type, unit } = determineProductTypeAndUnit(companyIndustry, cleanName);

    return {
      name: cleanName,
      description: `Professional ${cleanName.toLowerCase()} for ${companyIndustry}`,
      type,
      unit
    };

  } catch (error) {
    console.warn('AI material generation failed, using fallback:', error);
    return fallbackMaterialGeneration(companyIndustry, language);
  }
}

// Classify business type using zero-shot classification
async function classifyBusiness(businessName: string, categories: string[]): Promise<{ label: string; score: number } | null> {
  try {
    if (!classificationPipeline) return null;

    const result = await classificationPipeline(businessName, categories);
    return result.labels.length > 0 ? { label: result.labels[0], score: result.scores[0] } : null;
  } catch (error) {
    console.warn('Business classification failed:', error);
    return null;
  }
}

// Clean and format company names
function extractCompanyName(generatedText: string, language: 'de' | 'en'): string {
  // Remove common prefixes and clean up
  let name = generatedText
    .split('\n')[0] // Take first line only
    .replace(/[^\w\s&.-]/g, '') // Remove special chars except business-relevant ones
    .trim();

  // Add appropriate business suffix if missing
  const suffixes = language === 'de' 
    ? ['GmbH', 'AG', 'KG', 'GbR', '& Co']
    : ['Corp', 'Inc', 'Ltd', 'LLC', 'Group'];

  const hasSuffix = suffixes.some(suffix => name.toLowerCase().includes(suffix.toLowerCase()));
  if (!hasSuffix && name.length > 3) {
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    name = `${name} ${randomSuffix}`;
  }

  return name || (language === 'de' ? 'Innovative Lösungen GmbH' : 'Innovation Solutions Inc');
}

// Clean and format product names
function extractProductName(generatedText: string, language: 'de' | 'en'): string {
  let name = generatedText
    .split('\n')[0]
    .replace(/[^\w\s-]/g, '')
    .trim();

  return name || (language === 'de' ? 'Premium Service' : 'Professional Service');
}

// Determine product type and unit based on industry context
function determineProductTypeAndUnit(industry: string, productName: string): { type: string; unit: string } {
  const industryLower = industry.toLowerCase();
  const productLower = productName.toLowerCase();

  // Service indicators -> time-based units
  if (productLower.includes('service') || productLower.includes('consulting') || 
      productLower.includes('beratung') || productLower.includes('stunde') || 
      productLower.includes('support') || productLower.includes('wartung') || 
      productLower.includes('entwicklung') || industryLower.includes('service') ||
      industryLower.includes('consulting')) {
    return { type: 'service', unit: 'H' };
  }

  // Software indicators -> piece-based units
  if (productLower.includes('software') || productLower.includes('app') || 
      productLower.includes('system') || productLower.includes('lizenz') ||
      productLower.includes('license') || industryLower.includes('software')) {
    return { type: 'software', unit: 'ST' };
  }

  // Hardware indicators -> piece-based units
  if (productLower.includes('laptop') || productLower.includes('computer') || 
      productLower.includes('monitor') || productLower.includes('drucker') || 
      productLower.includes('tastatur') || productLower.includes('maus') || 
      productLower.includes('hardware') || industryLower.includes('hardware')) {
    return { type: 'good', unit: 'ST' };
  }

  // Default to goods with pieces
  return { type: 'good', unit: 'ST' };
}

// Enhanced fallback generation when AI models fail
function fallbackBusinessGeneration(industry: string, language: 'de' | 'en', businessType: 'vendor' | 'recipient') {
  console.log(`🎯 Using enhanced rule-based generation for ${industry} ${businessType}`);
  
  const industrySpecific = {
    technology: {
      prefixes: language === 'de' ? ['TechFlow', 'Digital', 'Cyber', 'Smart', 'Cloud'] : ['TechFlow', 'Digital', 'Cyber', 'Smart', 'Cloud'],
      terms: language === 'de' ? ['Systeme', 'Lösungen', 'Tech'] : ['Systems', 'Solutions', 'Tech']
    },
    services: {
      prefixes: language === 'de' ? ['Beratung', 'Service', 'Consulting', 'Experten'] : ['Consulting', 'Service', 'Expert', 'Advisory'],
      terms: language === 'de' ? ['Group', 'Partner', 'Services'] : ['Group', 'Partners', 'Services']
    },
    manufacturing: {
      prefixes: language === 'de' ? ['Industrie', 'Produktion', 'Fertigung', 'Maschinen'] : ['Industrial', 'Production', 'Manufacturing', 'Precision'],
      terms: language === 'de' ? ['Werke', 'Industries', 'Manufacturing'] : ['Works', 'Industries', 'Manufacturing']
    }
  };

  // Get industry-specific or default terms
  const industryKey = Object.keys(industrySpecific).find(key => 
    industry.toLowerCase().includes(key)
  ) as keyof typeof industrySpecific;
  
  const spec = industrySpecific[industryKey] || {
    prefixes: language === 'de' ? ['Premium', 'Professional', 'Elite', 'Advanced'] : ['Premium', 'Professional', 'Elite', 'Advanced'],
    terms: language === 'de' ? ['Solutions', 'Group', 'Services'] : ['Solutions', 'Group', 'Services']
  };

  const legalForms = language === 'de' 
    ? ['GmbH', 'AG', 'KG', 'GbR', '& Co. KG']
    : ['Corp', 'Inc', 'Ltd', 'LLC', 'Group'];

  const prefix = spec.prefixes[Math.floor(Math.random() * spec.prefixes.length)];
  const term = spec.terms[Math.floor(Math.random() * spec.terms.length)];
  const legalForm = legalForms[Math.floor(Math.random() * legalForms.length)];
  
  // Create more realistic company names
  const companyName = Math.random() > 0.5 
    ? `${prefix} ${term} ${legalForm}`
    : `${prefix}${term} ${legalForm}`;
  
  const description = language === 'de'
    ? `Spezialisiert auf ${industry} ${businessType === 'vendor' ? 'Lieferungen' : 'Lösungen'}`
    : `Specialized ${industry} ${businessType === 'vendor' ? 'supplier' : 'solutions'}`;
  
  return {
    name: companyName,
    description,
    industry
  };
}

function fallbackMaterialGeneration(industry: string, language: 'de' | 'en') {
  console.log(`🎯 Using enhanced rule-based material generation for ${industry}`);
  
  const industryMaterials = {
    technology: {
      products: language === 'de' 
        ? ['Cloud Hosting Service', 'Software Lizenz', 'IT Beratung', 'System Integration', 'Cybersecurity Audit']
        : ['Cloud Hosting Service', 'Software License', 'IT Consulting', 'System Integration', 'Cybersecurity Audit'],
      types: ['service', 'software', 'service', 'service', 'service'],
      units: ['H', 'ST', 'H', 'H', 'H']
    },
    services: {
      products: language === 'de'
        ? ['Strategieberatung', 'Projektmanagement', 'Schulung', 'Wartungsservice', 'Support-Paket']
        : ['Strategy Consulting', 'Project Management', 'Training Service', 'Maintenance Service', 'Support Package'],
      types: ['service', 'service', 'service', 'service', 'service'],
      units: ['H', 'H', 'H', 'H', 'H']
    },
    manufacturing: {
      products: language === 'de'
        ? ['Präzisionsbauteil', 'Qualitätsprüfung', 'Maschinenkomponente', 'Produktionsservice', 'Automatisierungslösung', 
           'Hydraulikzylinder', 'Pneumatikventil', 'Kugellager', 'Industrieroboter', 'CNC-Fräsmaschine',
           'Schweißroboter', 'Fördertechnik', 'Druckluftanlagen', 'Industriekamera', 'Servomotor',
           'Frequenzumrichter', 'SPS-Steuerung', 'Schrittmotor', 'Linearführung', 'Zahnriemen']
        : ['Precision Component', 'Quality Inspection', 'Machine Component', 'Production Service', 'Automation Solution',
           'Hydraulic Cylinder', 'Pneumatic Valve', 'Ball Bearing', 'Industrial Robot', 'CNC Milling Machine',
           'Welding Robot', 'Conveyor Technology', 'Compressed Air Systems', 'Industrial Camera', 'Servo Motor',
           'Frequency Converter', 'PLC Control', 'Stepper Motor', 'Linear Guide', 'Timing Belt'],
      types: ['good', 'service', 'good', 'service', 'good', 'good', 'good', 'good', 'good', 'good',
              'good', 'good', 'good', 'good', 'good', 'good', 'good', 'good', 'good', 'good'],
      units: ['ST', 'H', 'ST', 'H', 'ST', 'ST', 'ST', 'ST', 'ST', 'ST',
              'ST', 'ST', 'ST', 'ST', 'ST', 'ST', 'ST', 'ST', 'ST', 'M']
    },
    healthcare: {
      products: language === 'de'
        ? ['Medizingerät', 'Laboranalyse', 'Patientenbetreuung', 'Medikament', 'Diagnostik-Service']
        : ['Medical Device', 'Laboratory Analysis', 'Patient Care', 'Pharmaceutical', 'Diagnostic Service'],
      types: ['good', 'service', 'service', 'good', 'service'],
      units: ['ST', 'H', 'H', 'ST', 'H']
    },
    finance: {
      products: language === 'de'
        ? ['Finanzberatung', 'Versicherungspolice', 'Investment-Analyse', 'Kredit-Service', 'Audit Service']
        : ['Financial Advisory', 'Insurance Policy', 'Investment Analysis', 'Credit Service', 'Audit Service'],
      types: ['service', 'service', 'service', 'service', 'service'],
      units: ['H', 'ST', 'H', 'H', 'H']
    },
    retail: {
      products: language === 'de'
        ? ['Verkaufsartikel', 'Kundenservice', 'Warenwirtschaft', 'Marketing-Kampagne', 'E-Commerce Lösung']
        : ['Retail Product', 'Customer Service', 'Inventory Management', 'Marketing Campaign', 'E-Commerce Solution'],
      types: ['good', 'service', 'service', 'service', 'software'],
      units: ['ST', 'H', 'H', 'H', 'ST']
    },
    construction: {
      products: language === 'de'
        ? ['Baumaterial', 'Bauleistung', 'Architekturplanung', 'Bauüberwachung', 'Vermessungsservice']
        : ['Building Material', 'Construction Service', 'Architectural Planning', 'Construction Supervision', 'Survey Service'],
      types: ['good', 'service', 'service', 'service', 'service'],
      units: ['M2', 'H', 'H', 'H', 'H']
    },
    education: {
      products: language === 'de'
        ? ['Schulungsservice', 'E-Learning Kurs', 'Trainingsmaterial', 'Coaching Session', 'Zertifizierung']
        : ['Training Service', 'E-Learning Course', 'Training Material', 'Coaching Session', 'Certification'],
      types: ['service', 'software', 'good', 'service', 'service'],
      units: ['H', 'ST', 'ST', 'H', 'ST']
    }
  };

  // Get industry-specific or default materials
  const industryKey = Object.keys(industryMaterials).find(key => 
    industry.toLowerCase().includes(key)
  ) as keyof typeof industryMaterials;
  
  const materials = industryMaterials[industryKey] || {
    products: language === 'de' 
      ? ['Professional Service', 'Premium Lösung', 'Business Consulting', 'Technische Beratung']
      : ['Professional Service', 'Premium Solution', 'Business Consulting', 'Technical Advisory'],
    types: ['service', 'service', 'service', 'service'],
    units: ['H', 'H', 'H', 'H']
  };

  const randomIndex = Math.floor(Math.random() * materials.products.length);
  const productName = materials.products[randomIndex];
  const productType = materials.types[randomIndex];
  const productUnit = materials.units[randomIndex];
  
  const description = language === 'de'
    ? `${productName} für ${industry} Branche`
    : `${productName} for ${industry} industry`;
  
  return {
    name: productName,
    description,
    type: productType,
    unit: productUnit
  };
}

// Enhanced demo data generators using AI
export async function generateAIEnhancedVendorData(
  existingVendors: Vendor[],
  language: 'de' | 'en' = 'en',
  companyCode: string = '1000'
): Promise<Partial<Vendor>> {
  // Initialize AI models if not already done
  await initializeAIModels();

  // Pick a random industry
  const industries = Object.keys(BUSINESS_INDUSTRIES);
  const randomIndustry = industries[Math.floor(Math.random() * industries.length)];

  // Generate intelligent business data
  const businessData = await generateIntelligentBusinessName(randomIndustry, language, 'vendor');

  // Generate unique vendor ID
  let vendorId: string;
  let attempts = 0;
  do {
    vendorId = `V${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    attempts++;
  } while (existingVendors.some(v => v.cvendorid === vendorId) && attempts < 100);

  // Generate contextual location data
  const locationData = generateContextualLocation(language);

  return {
    cvendorid: vendorId,
    ccompanycode: companyCode,
    cname: businessData.name,
    cname2: businessData.description,
    cstreet: locationData.street,
    czip: locationData.zip,
    ccity: locationData.city,
    ccountry: locationData.country,
    cvatnumber: generateVATNumber(locationData.country),
    ctaxnumber: generateTaxNumber(locationData.country),
    cfon: generatePhoneNumber(locationData.country),
    cfax: generateFaxNumber(locationData.country),
    cemail: generateBusinessEmail(businessData.name, locationData.country),
    curl: generateWebsite(businessData.name, locationData.country),
    ciban: generateIBAN(locationData.country),
    cbic: generateBIC(locationData.country),
    bank_name: generateBankName(locationData.country, language)
  };
}

export async function generateAIEnhancedRecipientData(
  existingRecipients: Recipient[],
  language: 'de' | 'en' = 'en',
  companyCode: string = '1000'
): Promise<Partial<Recipient>> {
  await initializeAIModels();

  const industries = Object.keys(BUSINESS_INDUSTRIES);
  const randomIndustry = industries[Math.floor(Math.random() * industries.length)];

  const businessData = await generateIntelligentBusinessName(randomIndustry, language, 'recipient');

  let recipientId: string;
  let attempts = 0;
  do {
    recipientId = `R${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    attempts++;
  } while (existingRecipients.some(r => r.crecipientid === recipientId) && attempts < 100);

  const locationData = generateContextualLocation(language);

  return {
    crecipientid: recipientId,
    ccompanycode: companyCode,
    cname: businessData.name,
    cname2: businessData.description,
    cstreet: locationData.street,
    czip: locationData.zip,
    ccity: locationData.city,
    ccountry: locationData.country,
    cfon: generatePhoneNumber(locationData.country),
    cfax: generateFaxNumber(locationData.country),
    cemail: generateBusinessEmail(businessData.name, locationData.country),
    curl: generateWebsite(businessData.name, locationData.country),
    cvatnumber: generateVATNumber(locationData.country)
  };
}

export async function generateAIEnhancedMaterialData(
  existingMaterials: Material[],
  language: 'de' | 'en' = 'en',
  companyCode: string = '1000',
  relatedIndustry?: string
): Promise<Partial<Material> & { ccompanycode: string }> {
  await initializeAIModels();

  const industry = relatedIndustry || Object.keys(BUSINESS_INDUSTRIES)[Math.floor(Math.random() * Object.keys(BUSINESS_INDUSTRIES).length)];
  const materialData = await generateIntelligentMaterial(industry, language);

  let materialNumber: string;
  let attempts = 0;
  do {
    materialNumber = `MAT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    attempts++;
  } while (existingMaterials.some(m => m.cmaterialnumber === materialNumber) && attempts < 100);

  // Generate intelligent pricing based on type
  const price = generateIntelligentPrice(materialData.type, industry);
  
  // Tax codes based on company code
  const getTaxCodesForCompany = (companyCode: string) => {
    switch (companyCode) {
      case '1000': return ['V0', 'V1', 'V2']; // Germany: 0%, 19%, 7%
      case '2000': return ['GB00', 'GB05', 'GB20']; // UK: 0%, 5%, 20%
      case '3000': return ['CH00', 'CH25', 'CH37', 'CH77']; // Switzerland: 0%, 2.5%, 3.7%, 7.7%
      default: return ['V0', 'V1', 'V2'];
    }
  };
  
  const taxCodes = getTaxCodesForCompany(companyCode);
  const taxCode = taxCodes[Math.floor(Math.random() * taxCodes.length)];
  
  // Tax rates based on code
  const getTaxRate = (code: string) => {
    const rates: Record<string, number> = {
      'V0': 0, 'V1': 19, 'V2': 7,
      'GB00': 0, 'GB05': 5, 'GB20': 20,
      'CH00': 0, 'CH25': 2.5, 'CH37': 3.7, 'CH77': 7.7
    };
    return rates[code] || 19;
  };
  
  const taxRate = getTaxRate(taxCode);
  
  // Currency based on company code
  const getCurrencyForCompany = (companyCode: string) => {
    switch (companyCode) {
      case '1000': return 'EUR'; // Germany
      case '2000': return 'GBP'; // UK
      case '3000': return 'CHF'; // Switzerland
      default: return 'EUR';
    }
  };

  return {
    cmaterialnumber: materialNumber,
    cdescription: materialData.description,
    ctype: materialData.type,
    ctaxcode: taxCode,
    ctaxrate: taxRate / 100, // Convert to decimal for database
    cunit: materialData.unit,
    cnetamount: price,
    ccurrency: getCurrencyForCompany(companyCode),
    ccompanycode: companyCode
  };
}

// Helper functions for contextual data generation
function generateContextualLocation(language: 'de' | 'en') {
  const locations = language === 'de' ? {
    cities: [
      { name: 'Berlin', zip: '10115', country: 'DE' },
      { name: 'München', zip: '80331', country: 'DE' },
      { name: 'Hamburg', zip: '20095', country: 'DE' },
      { name: 'Köln', zip: '50667', country: 'DE' },
      { name: 'Frankfurt', zip: '60311', country: 'DE' }
    ],
    streets: ['Hauptstraße', 'Bahnhofstraße', 'Industriestraße', 'Technologiepark', 'Business Center']
  } : {
    cities: [
      { name: 'London', zip: 'SW1A 1AA', country: 'GB' },
      { name: 'Manchester', zip: 'M1 1AE', country: 'GB' },
      { name: 'Birmingham', zip: 'B1 1AA', country: 'GB' },
      { name: 'Leeds', zip: 'LS1 1UR', country: 'GB' }
    ],
    streets: ['High Street', 'Business Park', 'Technology Drive', 'Innovation Center', 'Corporate Avenue']
  };

  const city = locations.cities[Math.floor(Math.random() * locations.cities.length)];
  const street = locations.streets[Math.floor(Math.random() * locations.streets.length)];
  const streetNumber = Math.floor(Math.random() * 200) + 1;

  return {
    street: `${street} ${streetNumber}`,
    zip: city.zip,
    city: city.name,
    country: city.country
  };
}

function generateVATNumber(country: string): string {
  return country === 'DE' 
    ? `DE${Math.floor(Math.random() * 900000000) + 100000000}`
    : `GB${Math.floor(Math.random() * 900000000) + 100000000}`;
}

function generateTaxNumber(country: string): string {
  return `${Math.floor(Math.random() * 90000) + 10000}/${Math.floor(Math.random() * 900) + 100}/${Math.floor(Math.random() * 90000) + 10000}`;
}

function generatePhoneNumber(country: string): string {
  const countryCode = country === 'DE' ? '49' : '44';
  return `+${countryCode} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000000) + 1000000}`;
}

function generateFaxNumber(country: string): string {
  const countryCode = country === 'DE' ? '49' : '44';
  return `+${countryCode} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000000) + 1000001}`;
}

function generateBusinessEmail(companyName: string, country: string): string {
  const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
  const tld = country === 'DE' ? 'de' : 'com';
  return `info@${domain}.${tld}`;
}

function generateWebsite(companyName: string, country: string): string {
  const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
  const tld = country === 'DE' ? 'de' : 'com';
  return `www.${domain}.${tld}`;
}

function generateIBAN(country: string): string {
  return country === 'DE' 
    ? `DE${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 900000000000000000) + 100000000000000000}`
    : `GB${Math.floor(Math.random() * 90) + 10}ABCD${Math.floor(Math.random() * 90000000000000) + 10000000000000}`;
}

function generateBIC(country: string): string {
  const codes = country === 'DE' 
    ? ['DEUTDEFF', 'DEUTDEBB', 'DEUTDEMM']
    : ['BARCGBNL', 'BARCGBLL', 'BARCGBMM'];
  return codes[Math.floor(Math.random() * codes.length)] + 'XXX';
}

function generateBankName(country: string, language: 'de' | 'en'): string {
  const banks = country === 'DE' ? [
    'Deutsche Bank AG', 'Commerzbank AG', 'DZ Bank AG', 'Sparkasse', 'Volksbank eG'
  ] : [
    'Barclays Bank PLC', 'HSBC Bank PLC', 'Lloyds Bank PLC', 'NatWest Bank PLC'
  ];
  return banks[Math.floor(Math.random() * banks.length)];
}

function generateIntelligentPrice(type: string, industry: string): number {
  const basePrice = type === 'service' ? 150 : type === 'software' ? 2500 : 800;
  const industryMultiplier = industry.toLowerCase().includes('premium') ? 1.5 : 
                           industry.toLowerCase().includes('enterprise') ? 2.0 : 1.0;
  
  const variance = 0.3; // 30% variance
  const multiplier = 1 + (Math.random() - 0.5) * 2 * variance;
  
  return Math.round(basePrice * industryMultiplier * multiplier);
}
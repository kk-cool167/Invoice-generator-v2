/**
 * Demo data generator with uniqueness checks to avoid duplicates
 */

import { Vendor, Recipient, Material } from './types';

// Common German and English company names
const COMPANY_PREFIXES = {
  de: ['Schmidt', 'Müller', 'Weber', 'Wagner', 'Becker', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter'],
  en: ['Global', 'Tech', 'Smart', 'Digital', 'Prime', 'Elite', 'Pro', 'Advanced', 'Superior', 'Premium']
};

const COMPANY_SUFFIXES = {
  de: ['GmbH', 'AG', 'KG', 'OHG', 'GbR', '& Co. KG', 'SE'],
  en: ['Corp', 'Inc', 'Ltd', 'LLC', 'Group', 'Solutions', 'Industries', 'Enterprises']
};

const INDUSTRIES = {
  de: ['Technologie', 'Handel', 'Beratung', 'Logistik', 'Produktion', 'Service', 'Software', 'Hardware'],
  en: ['Technology', 'Trading', 'Consulting', 'Logistics', 'Manufacturing', 'Services', 'Software', 'Hardware']
};

// Street names
const STREET_NAMES = {
  de: ['Hauptstraße', 'Bahnhofstraße', 'Gartenstraße', 'Schulstraße', 'Kirchstraße', 'Industriestraße', 'Parkstraße', 'Waldstraße'],
  en: ['Main Street', 'High Street', 'Park Avenue', 'Market Street', 'Church Road', 'Industrial Drive', 'Tech Boulevard', 'Business Park']
};

// Cities
const CITIES = {
  de: [
    { name: 'Berlin', zip: '10115' },
    { name: 'Hamburg', zip: '20095' },
    { name: 'München', zip: '80331' },
    { name: 'Köln', zip: '50667' },
    { name: 'Frankfurt', zip: '60311' },
    { name: 'Stuttgart', zip: '70173' },
    { name: 'Düsseldorf', zip: '40213' },
    { name: 'Leipzig', zip: '04109' }
  ],
  en: [
    { name: 'London', zip: 'SW1A 1AA' },
    { name: 'Manchester', zip: 'M1 1AE' },
    { name: 'Birmingham', zip: 'B1 1AA' },
    { name: 'Liverpool', zip: 'L1 1AA' },
    { name: 'Leeds', zip: 'LS1 1UR' },
    { name: 'Glasgow', zip: 'G1 1AA' },
    { name: 'Edinburgh', zip: 'EH1 1AA' },
    { name: 'Bristol', zip: 'BS1 1AA' }
  ]
};

// Materials/Products
const MATERIALS = {
  de: [
    { name: 'Laptop Professional', unit: 'ST', type: 'Hardware' },
    { name: 'Desktop Computer', unit: 'ST', type: 'Hardware' },
    { name: 'Software Lizenz', unit: 'ST', type: 'Software' },
    { name: 'Beratungsstunden', unit: 'H', type: 'Service' },
    { name: 'Entwicklungsstunden', unit: 'H', type: 'Service' },
    { name: 'Drucker Multifunktion', unit: 'ST', type: 'Hardware' },
    { name: 'Monitor 27 Zoll', unit: 'ST', type: 'Hardware' },
    { name: 'Tastatur Mechanisch', unit: 'ST', type: 'Hardware' },
    { name: 'Maus Ergonomisch', unit: 'ST', type: 'Hardware' },
    { name: 'Wartungsvertrag', unit: 'MON', type: 'Service' }
  ],
  en: [
    { name: 'Professional Laptop', unit: 'ST', type: 'Hardware' },
    { name: 'Desktop Computer', unit: 'ST', type: 'Hardware' },
    { name: 'Software License', unit: 'ST', type: 'Software' },
    { name: 'Consulting Hours', unit: 'H', type: 'Service' },
    { name: 'Development Hours', unit: 'H', type: 'Service' },
    { name: 'Multifunction Printer', unit: 'ST', type: 'Hardware' },
    { name: '27" Monitor', unit: 'ST', type: 'Hardware' },
    { name: 'Mechanical Keyboard', unit: 'ST', type: 'Hardware' },
    { name: 'Ergonomic Mouse', unit: 'ST', type: 'Hardware' },
    { name: 'Maintenance Contract', unit: 'MON', type: 'Service' }
  ]
};

// Generate unique timestamp-based ID
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Check if vendor ID already exists
export function isVendorIdUnique(vendorId: string, existingVendors: Vendor[]): boolean {
  return !existingVendors.some(v => v.cvendorid === vendorId);
}

// Check if recipient ID already exists
export function isRecipientIdUnique(recipientId: string, existingRecipients: Recipient[]): boolean {
  return !existingRecipients.some(r => r.crecipientid === recipientId);
}

// Check if material number already exists
export function isMaterialNumberUnique(materialNumber: string, existingMaterials: Material[]): boolean {
  return !existingMaterials.some(m => m.cmaterialnumber === materialNumber);
}

// Generate unique vendor data
export function generateUniqueVendorData(
  existingVendors: Vendor[], 
  language: 'de' | 'en' = 'en',
  companyCode: string = '1000'
): Partial<Vendor> {
  const isGerman = language === 'de';
  const prefixes = COMPANY_PREFIXES[language];
  const suffixes = COMPANY_SUFFIXES[language];
  const industries = INDUSTRIES[language];
  const streets = STREET_NAMES[language];
  const cities = CITIES[language];

  // Generate unique vendor ID
  let vendorId: string;
  let attempts = 0;
  do {
    vendorId = `V${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    attempts++;
  } while (!isVendorIdUnique(vendorId, existingVendors) && attempts < 100);

  // Random selections
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const industry = industries[Math.floor(Math.random() * industries.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const streetNumber = Math.floor(Math.random() * 200) + 1;

  // Generate company name with industry to ensure uniqueness
  const companyName = `${prefix} ${industry} ${suffix}`;

  // Generate tax numbers
  const vatNumber = isGerman 
    ? `DE${Math.floor(Math.random() * 900000000) + 100000000}`
    : `GB${Math.floor(Math.random() * 900000000) + 100000000}`;

  return {
    cvendorid: vendorId,
    ccompanycode: companyCode,
    cname: companyName,
    cname2: industry,
    cstreet: `${street} ${streetNumber}`,
    czip: city.zip,
    ccity: city.name,
    ccountry: isGerman ? 'DE' : 'GB',
    cvatnumber: vatNumber,
    ctaxnumber: `${Math.floor(Math.random() * 90000) + 10000}/${Math.floor(Math.random() * 900) + 100}/${Math.floor(Math.random() * 90000) + 10000}`,
    cfon: `+${isGerman ? '49' : '44'} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000000) + 1000000}`,
    cfax: `+${isGerman ? '49' : '44'} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000000) + 1000001}`,
    cemail: `${prefix.toLowerCase().replace(/\s/g, '')}@${industry.toLowerCase()}.${isGerman ? 'de' : 'com'}`,
    curl: `www.${prefix.toLowerCase().replace(/\s/g, '')}-${industry.toLowerCase()}.${isGerman ? 'de' : 'com'}`,
    // Bank data
    ciban: isGerman 
      ? `DE${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 900000000000000000) + 100000000000000000}`
      : `GB${Math.floor(Math.random() * 90) + 10}ABCD${Math.floor(Math.random() * 90000000000000) + 10000000000000}`,
    cbic: isGerman 
      ? `DEUT${['DEFF', 'DEBB', 'DEMM'][Math.floor(Math.random() * 3)]}XXX`
      : `BARC${['GBNL', 'GBLL', 'GBMM'][Math.floor(Math.random() * 3)]}XXX`
  };
}

// Generate unique recipient data
export function generateUniqueRecipientData(
  existingRecipients: Recipient[], 
  language: 'de' | 'en' = 'en',
  companyCode: string = '1000'
): Partial<Recipient> {
  const isGerman = language === 'de';
  const prefixes = COMPANY_PREFIXES[language];
  const suffixes = COMPANY_SUFFIXES[language];
  const industries = INDUSTRIES[language];
  const streets = STREET_NAMES[language];
  const cities = CITIES[language];

  // Generate unique recipient ID
  let recipientId: string;
  let attempts = 0;
  do {
    recipientId = `R${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    attempts++;
  } while (!isRecipientIdUnique(recipientId, existingRecipients) && attempts < 100);

  // Random selections (different from vendor to ensure variety)
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const industry = industries[Math.floor(Math.random() * industries.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const streetNumber = Math.floor(Math.random() * 200) + 1;

  // Generate company name
  const companyName = `${prefix} ${industry} ${suffix}`;

  return {
    crecipientid: recipientId,
    ccompanycode: companyCode,
    cname: companyName,
    cname2: `${industry} Division`,
    cstreet: `${street} ${streetNumber}`,
    czip: city.zip,
    ccity: city.name,
    ccountry: isGerman ? 'DE' : 'GB',
    cfon: `+${isGerman ? '49' : '44'} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000000) + 1000000}`,
    cfax: `+${isGerman ? '49' : '44'} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000000) + 1000001}`,
    cemail: `info@${prefix.toLowerCase().replace(/\s/g, '')}.${isGerman ? 'de' : 'com'}`,
    curl: `www.${prefix.toLowerCase().replace(/\s/g, '')}.${isGerman ? 'de' : 'com'}`,
    cvatnumber: isGerman 
      ? `DE${Math.floor(Math.random() * 900000000) + 100000000}` 
      : `GB${Math.floor(Math.random() * 900000000) + 100000000}`
  };
}

// Generate unique material data
export function generateUniqueMaterialData(
  existingMaterials: Material[], 
  language: 'de' | 'en' = 'en',
  companyCode: string = '1000'
): Partial<Material> & { ccompanycode: string } {
  const materials = MATERIALS[language];
  
  // Generate unique material number
  let materialNumber: string;
  let attempts = 0;
  do {
    materialNumber = `MAT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    attempts++;
  } while (!isMaterialNumberUnique(materialNumber, existingMaterials) && attempts < 100);

  // Select random material template
  const template = materials[Math.floor(Math.random() * materials.length)];
  
  // Add variation to make it unique
  const variation = Math.floor(Math.random() * 100);
  const description = `${template.name} v${variation}`;

  // Generate price based on type
  let price: number;
  switch (template.type) {
    case 'Hardware':
      price = Math.floor(Math.random() * 2000) + 500; // 500-2500
      break;
    case 'Software':
      price = Math.floor(Math.random() * 5000) + 1000; // 1000-6000
      break;
    case 'Service':
      price = Math.floor(Math.random() * 200) + 100; // 100-300 per hour
      break;
    default:
      price = Math.floor(Math.random() * 1000) + 100;
  }

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
    cdescription: description,
    ctype: template.type.toLowerCase(),
    ctaxcode: taxCode,
    ctaxrate: taxRate / 100, // Convert to decimal for database
    cunit: template.unit,
    cnetamount: price,
    ccurrency: getCurrencyForCompany(companyCode),
    ccompanycode: companyCode
  };
}
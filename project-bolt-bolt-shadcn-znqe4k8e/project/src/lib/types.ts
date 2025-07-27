export interface Vendor {
  cid: number; // Fixed: Database uses bigint, not string
  cvendorid: string; // Added: Missing critical field from database
  ccompanycode: string;
  cname: string;
  cname2?: string; // Added: Missing field from database
  cstreet?: string;
  czip?: string;
  ccity?: string;
  ccountry?: string; // Database: char(2)
  ccountryoforigin?: string; // Added: Missing field from database
  cpozip?: string;
  cpobox?: string; // Added: Missing field from database
  cvatnumber?: string;
  ctaxnumber?: string; // Added: Missing field from database
  cfon?: string;
  cfax?: string;
  cemail?: string;
  curl?: string;
  ctopid?: number; // Added: Missing field from database
  conetime?: number; // Added: Missing field from database
  calwayswithpo?: number; // Added: Missing field from database
  calwayswithoutpo?: number; // Added: Missing field from database
  // Bank data (from joined queries)
  bank_name?: string;
  ciban?: string;
  cbic?: string;
}

export interface Material {
  cid: number; // Fixed: Database uses integer with auto-increment, not string
  cmaterialnumber?: string; // Fixed: Database allows NULL
  cdescription?: string; // Fixed: Database allows NULL
  ctype?: string; // Fixed: Database allows NULL
  ctaxcode?: string; // Fixed: Database allows NULL
  ctaxrate?: number; // Fixed: Database allows NULL
  cunit?: string; // Fixed: Database allows NULL
  cnetamount?: number; // Fixed: Database allows NULL
  ccurrency?: string; // Fixed: Database allows NULL, max 3 chars
  // Note: ccompanycode does NOT exist in materials table - removed!
}

export interface TaxCode {
  cid: number; // Fixed: Database uses bigint, not string
  ccompanycode?: string; // Fixed: Database allows NULL
  cvalidfrom: string; // Added: Missing critical field (date)
  cvalidto: string; // Added: Missing critical field (date)
  cscenario: string; // Added: Missing critical field
  ccountry?: string; // Fixed: Database allows NULL, char(2)
  ccode: string; // Database: NOT NULL
  crate: number; // Database: NOT NULL
  cdescription?: string; // Fixed: Database allows NULL
}

export interface ExchangeRate {
  ccurrency: string;
  crate: number; // Exchange rate relative to EUR (base currency)
}

// Currency-related interfaces for centralized management
export interface CurrencyContext {
  companyCode?: string;
  materialCurrency?: string;
  userPreference?: string;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}

// Company currency mapping - should match CurrencyManager
export type CompanyCode = '1000' | '2000' | '3000';
export type SupportedCurrency = 'EUR' | 'GBP' | 'CHF' | 'USD';

export interface Recipient {
  cid: number; // Fixed: Database uses bigint, not string
  crecipientid: string; // Added: Missing critical field from database
  ccompanycode: string;
  cname: string;
  cname2?: string; // Added: Missing field from database
  cstreet?: string;
  czip?: string;
  ccity?: string;
  ccountry?: string; // Database: char(2)
  cpozip?: string; // Added: Missing field from database
  cpobox?: string; // Added: Missing field from database
  cfon?: string;
  cfax?: string; // Added: Missing field from database
  cemail?: string;
  curl?: string; // Added: Missing field from database
  cvatnumber?: string;
  ctaxnumber?: string; // Added: Missing field from database
  cmatchcodepos?: string; // Added: Missing field from database
  cmatchcodeneg?: string; // Added: Missing field from database
  ccompanyformanchor?: string; // Added: Missing field from database
  ccompanyformform?: string; // Added: Missing field from database
  vatNumbers?: Array<{ cvatnumber: string }>;
  authorizedVendors?: string[];
}

export interface InvoiceData {
  cid?: number; // Fixed: Database uses bigint with auto-increment
  cdocguid?: string; // Added: Missing field from database (36 chars)
  cdochcsid?: string; // Added: Missing field from database
  cdociecm: string; // Added: Missing critical field from database
  cdocmimetype: string; // Added: Missing critical field from database
  cdoccr?: string; // Added: Missing field from database
  cdocid?: string; // Added: Missing field from database
  cdocwebcube: string; // Added: Missing critical field from database
  cerpnumber?: string; // Added: Missing field from database
  cerpstatus: number; // Added: Missing field from database (default: 0)
  cerpmessage?: string; // Added: Missing field from database
  cinumberexternal?: string; // Added: Missing field from database
  cidateexternal: string; // Added: Missing critical field from database (date)
  ccompanycode?: string; // Fixed: Database allows NULL
  crecipientid: number; // Fixed: Database uses bigint, not string
  crecipientvatnumber?: string; // Added: Missing field from database
  crecipienttransferto?: string; // Added: Missing field from database (char 2)
  cvendorid: number; // Fixed: Database uses bigint, not string
  cvendorvatnumber?: string; // Added: Missing field from database
  cvendortransferfrom?: string; // Added: Missing field from database (char 2)
  cvendorbankid?: string; // Added: Missing field from database
  // OTV (One Time Vendor) fields
  cotvname?: string;
  cotvname2?: string;
  cotvstreet?: string;
  cotvzip?: string;
  cotvcity?: string;
  cotvcountry?: string; // char(2)
  cotvtaxnumber?: string;
  cotvbankname?: string;
  cotviban?: string; // 34 chars max
  cotvbic?: string; // 14 chars max
  cotvbankcode?: string;
  cotvbankaccountnumber?: string;
  cotvbankcountry?: string; // char(2)
  // Financial fields
  cfiscalyear?: number;
  cdate?: string; // date
  cperiod?: number;
  ctype: string; // NOT NULL, default: 'invoice'
  cordertype: string; // NOT NULL - 'MM' | 'FI'
  cscbindicator?: string;
  csubsequentdebit: number; // NOT NULL, default: 0
  cnetamount: number; // NOT NULL
  ctaxamount: number; // NOT NULL
  cgrosstotal: number; // NOT NULL
  cgrossdiscount: number; // NOT NULL
  ctotalamount: number; // NOT NULL
  ccurrency: string; // NOT NULL, char(3)
  cbaselinedate?: string; // date
  // Terms of payment
  ctopid?: number;
  ctopdays1?: number;
  ctopdiscount1?: number;
  ctopdays2?: number;
  ctopdiscount2?: number;
  ctopdays3?: number;
  ctopdiscount3?: number;
  ctopduedays?: number;
  cpaymentblock: number; // NOT NULL, default: 0
  ctext?: string; // 500 chars max
  cpaymentdate?: string; // date
  cpaymentmethod?: string;
  cesrreferencenumber?: string;
  
  // Legacy fields for backward compatibility
  type?: 'MM' | 'FI'; // Maps to cordertype
  vendorId?: string; // Maps to cvendorid (as string for compatibility)
  recipientId?: string; // Maps to crecipientid (as string for compatibility)
  orderDate?: string; // Maps to cidateexternal
  deliveryDate?: string; // Custom field, not in database
  items?: Array<{
    materialId: string;
    quantity: number;
    unit: string;
    price: number;
    taxRate: number;
  }>;
}

export interface InvoiceItem {
  cid?: number; // Fixed: Database uses bigint with auto-increment
  ciitemnumber: string; // Added: Missing critical field from database (50 chars max)
  ciid: number; // Fixed: Database uses bigint, not string - references invoices.cid
  cpoid?: number; // Added: Missing field from database (references purchase order)
  cpoitemid?: number; // Added: Missing field from database (references purchase order item)
  cdnid?: number; // Added: Missing field from database (references delivery note)
  cdnitemid?: number; // Added: Missing field from database (references delivery note item)
  ctype: string; // Added: Missing critical field from database (22 chars max)
  cdescription?: string; // Added: Missing field from database (100 chars max)
  ctaxrate: number; // Fixed: Database NOT NULL
  ctaxcode: string; // Added: Missing critical field from database (10 chars max)
  cnetunitamount: number; // Fixed: Database NOT NULL
  ctaxamount: number; // Fixed: Database NOT NULL
  cquantity?: number; // Fixed: Database allows NULL
  cunit?: string; // Fixed: Database allows NULL (10 chars max)
  cnettotalamount: number; // Fixed: Database NOT NULL
  ccurrency: string; // Added: Missing critical field from database (char 3)
  ccostcenterid?: number; // Added: Missing field from database
  cglaccountid?: number; // Added: Missing field from database
  cinternalorderid?: number; // Added: Missing field from database
  cwbsid?: number; // Added: Missing field from database
  cassetid?: number; // Added: Missing field from database
  ctext?: string; // Added: Missing field from database (200 chars max)
  
  // Legacy fields for backward compatibility
  materialId?: string; // Maps to material reference
  quantity?: number; // Maps to cquantity
  unit?: string; // Maps to cunit
  price?: number; // Maps to cnetunitamount
  taxRate?: number; // Maps to ctaxrate
  total?: number; // Maps to cnettotalamount
}

// Extended types for forms
export type CreateVendorData = Omit<Vendor, 'cid'>;
export type CreateRecipientData = Omit<Recipient, 'cid' | 'crecipientid'>;
export type CreateMaterialData = Omit<Material, 'cid'> & {
  ccompanycode: string; // Added: Required for material creation logic even though not stored in materials table
};
export type CreateInvoiceData = Omit<InvoiceData, 'cid'>;
export type CreateInvoiceItemData = Omit<InvoiceItem, 'cid' | 'ciid'>;


export interface GraphicElement {
  
  type: 'circle' | 'rectangle' | 'line' | 'triangle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color?: string;
  gradient?: {
    colors: string[];
    angle?: number;
  };
  rotation?: number;
  opacity?: number;
  blur?: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  strokeWidth?: number;
  strokeColor?: string;
  strokeDashArray?: number[];
  pattern?: {
    type: 'dots' | 'lines' | 'grid';
    size: number;
    spacing: number;
    color: string;
  };
  mask?: {
    type: 'circle' | 'rectangle' | 'triangle';
    invert?: boolean;
  };
}

export interface TextEffect {
  type: 'shadow' | 'outline' | 'gradient' | 'glow' | 'pattern';
  settings: {
    // Shadow settings
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    // Outline settings
    outlineColor?: string;
    outlineWidth?: number;
    // Gradient settings
    gradientColors?: string[];
    gradientAngle?: number;
    // Glow settings
    glowColor?: string;
    glowRadius?: number;
    glowIntensity?: number;
    // Pattern settings
    patternType?: 'dots' | 'lines' | 'grid';
    patternSize?: number;
    patternSpacing?: number;
    patternColor?: string;
  };
}

export interface TextElement {
  type: 'text';
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  letterSpacing?: number;
  lineHeight?: number;
  uppercase?: boolean;
  effects?: TextEffect[];
  zIndex?: number;
  opacity?: number;
  rotation?: number;
  transform?: {
    rotate?: number;
    scaleX?: number;
    scaleY?: number;
    skewX?: number;
    skewY?: number;
  };
}

export interface Layer {
  id: string;
  type: 'text' | 'graphic';
  name: string;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  element: TextElement | GraphicElement;
}

export type TemplateElement = Layer;

export interface LogoTemplate {
  id: string;
  name: string;
  category: 'modern' | 'minimal' | 'bold' | 'tech' | 'creative';
  tags: string[];
  elements: TemplateElement[];
  backgroundColor: string;
  description?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ElementStyles {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  letterSpacing?: number;
  lineHeight?: number;
  effects?: TextEffect[];
  transform?: {
    rotate?: number;
    scale?: number;
    skew?: number;
  };
}

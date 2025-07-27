/**
 * Unit translations - keeps German unit codes for database consistency
 * but provides translated labels for UI
 */

export interface UnitTranslation {
  code: string;
  de: string;
  en: string;
}

export const unitTranslations: Record<string, UnitTranslation> = {
  'ST': { code: 'ST', de: 'Stück', en: 'Pieces' },
  'KG': { code: 'KG', de: 'Kilogramm', en: 'Kilogram' },
  'H': { code: 'H', de: 'Stunde', en: 'Hour' },
  'L': { code: 'L', de: 'Liter', en: 'Liter' },
  'M': { code: 'M', de: 'Meter', en: 'Meter' },
  'CM': { code: 'CM', de: 'Zentimeter', en: 'Centimeter' },
  'DM': { code: 'DM', de: 'Dezimeter', en: 'Decimeter' },
  'KM': { code: 'KM', de: 'Kilometer', en: 'Kilometer' },
  'G': { code: 'G', de: 'Gramm', en: 'Gram' },
  'TO': { code: 'TO', de: 'Tonne', en: 'Ton' },
  'M3': { code: 'M3', de: 'Kubikmeter', en: 'Cubic Meter' },
  'SET': { code: 'SET', de: 'Set', en: 'Set' },
  'BOX': { code: 'BOX', de: 'Karton', en: 'Box' },
  'PAK': { code: 'PAK', de: 'Packung', en: 'Package' },
  'KT': { code: 'KT', de: 'Kiste', en: 'Crate' },
  'ROL': { code: 'ROL', de: 'Rolle', en: 'Roll' },
  'KAN': { code: 'KAN', de: 'Kanister', en: 'Canister' },
  'FL': { code: 'FL', de: 'Flasche', en: 'Bottle' },
  'EH': { code: 'EH', de: 'Einheit', en: 'Unit' },
  'LE': { code: 'LE', de: 'Leistungseinheit', en: 'Performance Unit' },
  'MIN': { code: 'MIN', de: 'Minute', en: 'Minute' },
  'STD': { code: 'STD', de: 'Stunde', en: 'Hour' },
  'TAG': { code: 'TAG', de: 'Tag', en: 'Day' },
  'WCH': { code: 'WCH', de: 'Woche', en: 'Week' },
  'MON': { code: 'MON', de: 'Monat', en: 'Month' },
  'FT': { code: 'FT', de: 'Fuß', en: 'Foot' },
  'MI': { code: 'MI', de: 'Meile', en: 'Mile' },
  'LB': { code: 'LB', de: 'Pfund', en: 'Pound' },
  'YD': { code: 'YD', de: 'Yard', en: 'Yard' }
};

/**
 * Get translated unit label for UI display
 */
export function getUnitLabel(unitCode: string, language: 'de' | 'en', fallbackDescription?: string): string {
  const translation = unitTranslations[unitCode];
  if (translation) {
    return translation[language];
  }
  // Fallback: use provided description or code itself if translation not found
  return fallbackDescription || unitCode;
}

/**
 * Get unit display text: "Description (CODE)"
 */
export function getUnitDisplayText(unitCode: string, language: 'de' | 'en', fallbackDescription?: string): string {
  const label = getUnitLabel(unitCode, language, fallbackDescription);
  return `${label} (${unitCode})`;
}

/**
 * Create translated units array for dropdowns
 */
export function createTranslatedUnits(germanUnits: Array<{ cabbreviation: string; cdescription: string }>, language: 'de' | 'en') {
  return germanUnits.map(unit => ({
    value: unit.cabbreviation, // Keep German code for database consistency
    label: getUnitDisplayText(unit.cabbreviation, language, unit.cdescription),
    code: unit.cabbreviation
  }));
}

/**
 * Get all available unit codes (for validation)
 */
export function getAllUnitCodes(): string[] {
  return Object.keys(unitTranslations);
}

/**
 * Check if a unit code is valid
 */
export function isValidUnitCode(code: string): boolean {
  return code in unitTranslations;
}
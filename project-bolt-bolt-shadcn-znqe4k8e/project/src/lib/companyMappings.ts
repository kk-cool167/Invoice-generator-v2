/**
 * Company code mappings for currency and language
 */

export function getLanguageFromCompanyCode(companyCode: string): string {
  switch (companyCode) {
    case '1000': return 'de'; // German/EUR
    case '2000': return 'en'; // English/GBP  
    case '3000': return 'de'; // Swiss-German/CHF (could be 'fr' for French)
    default: return 'de';
  }
}

export function getCurrencyFromCompanyCode(companyCode: string): string {
  switch (companyCode) {
    case '1000': return 'EUR';
    case '2000': return 'GBP';
    case '3000': return 'CHF';
    default: return 'EUR';
  }
}

/**
 * Get effective language considering company context and user preference
 */
export function getEffectiveLanguage(companyCode?: string, userLanguage?: string): string {
  // Company context takes priority over user preference
  if (companyCode) {
    return getLanguageFromCompanyCode(companyCode);
  }
  
  // Fallback to user language preference or default
  return userLanguage || 'de';
}
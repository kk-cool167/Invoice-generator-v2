import { apiClient } from './apiClient';

/**
 * Currency configuration and exchange rate data
 */
export interface ExchangeRate {
  ccurrency: string;
  crate: number;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * Centralized currency management system
 * Handles currency determination, conversion, and formatting
 */
export class CurrencyManager {
  private static exchangeRates: Map<string, number> = new Map();
  private static currencyInfoCache: Map<string, CurrencyInfo> = new Map();
  private static lastRateUpdate: number = 0;
  private static readonly RATE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Currency definitions with symbols and formatting info
   */
  private static readonly CURRENCY_DEFINITIONS: Record<string, CurrencyInfo> = {
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
    CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 }
  };

  /**
   * Company code to currency mapping
   * This is the single source of truth for company currencies
   */
  private static readonly COMPANY_CURRENCY_MAP: Record<string, string> = {
    '1000': 'EUR', // Default company
    '2000': 'GBP', // UK company
    '3000': 'CHF'  // Swiss company
  };

  /**
   * Get the default currency for a company code
   */
  static getCompanyCurrency(companyCode: string): string {
    return this.COMPANY_CURRENCY_MAP[companyCode] || 'EUR';
  }

  /**
   * Get currency information (symbol, name, etc.)
   */
  static getCurrencyInfo(currencyCode: string): CurrencyInfo {
    const cached = this.currencyInfoCache.get(currencyCode);
    if (cached) return cached;

    const info = this.CURRENCY_DEFINITIONS[currencyCode] || {
      code: currencyCode,
      symbol: currencyCode,
      name: currencyCode,
      decimals: 2
    };

    this.currencyInfoCache.set(currencyCode, info);
    return info;
  }

  /**
   * Load exchange rates from the backend
   */
  static async loadExchangeRates(): Promise<void> {
    const now = Date.now();
    if (now - this.lastRateUpdate < this.RATE_CACHE_DURATION && this.exchangeRates.size > 0) {
      return; // Use cached rates
    }

    try {
      const rates: ExchangeRate[] = await apiClient.get('exchangerates');
      this.exchangeRates.clear();
      
      // Always set EUR as base rate (1.0)
      this.exchangeRates.set('EUR', 1.0);
      
      for (const rate of rates) {
        this.exchangeRates.set(rate.ccurrency, rate.crate);
      }
      
      this.lastRateUpdate = now;
      console.log('Exchange rates loaded:', Object.fromEntries(this.exchangeRates));
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
      // Set fallback rates if loading fails
      this.setFallbackRates();
    }
  }

  /**
   * Set fallback exchange rates when API is unavailable
   */
  private static setFallbackRates(): void {
    this.exchangeRates.clear();
    this.exchangeRates.set('EUR', 1.0);
    this.exchangeRates.set('GBP', 0.85);
    this.exchangeRates.set('CHF', 0.95);
    this.exchangeRates.set('USD', 1.1);
    console.warn('Using fallback exchange rates');
  }

  /**
   * Get exchange rate for a currency (relative to EUR)
   */
  static getExchangeRate(currencyCode: string): number {
    return this.exchangeRates.get(currencyCode) || 1.0;
  }

  /**
   * Convert amount from one currency to another
   */
  static convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = this.getExchangeRate(fromCurrency);
    const toRate = this.getExchangeRate(toCurrency);
    
    // Convert to EUR first, then to target currency
    const eurAmount = amount / fromRate;
    const convertedAmount = eurAmount * toRate;
    
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Format currency amount with proper symbol and locale
   */
  static formatCurrency(amount: number, currencyCode: string, locale: string = 'en-US'): string {
    const info = this.getCurrencyInfo(currencyCode);
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: info.decimals,
        maximumFractionDigits: info.decimals,
      }).format(amount);
    } catch (error) {
      // Fallback formatting if Intl.NumberFormat fails
      return `${info.symbol} ${amount.toFixed(info.decimals)}`;
    }
  }

  /**
   * Get all supported currencies
   */
  static getSupportedCurrencies(): CurrencyInfo[] {
    return Object.values(this.CURRENCY_DEFINITIONS);
  }

  /**
   * Initialize currency manager - load rates and set up defaults
   */
  static async initialize(): Promise<void> {
    await this.loadExchangeRates();
  }

  /**
   * Determine the appropriate currency for a given context
   */
  static determineCurrency(context: {
    companyCode?: string;
    materialCurrency?: string;
    userPreference?: string;
  }): string {
    // Priority order:
    // 1. Company code (highest priority - business rules)
    // 2. Material currency (if material-specific)
    // 3. User preference
    // 4. EUR fallback

    if (context.companyCode) {
      return this.getCompanyCurrency(context.companyCode);
    }

    if (context.materialCurrency && this.CURRENCY_DEFINITIONS[context.materialCurrency]) {
      return context.materialCurrency;
    }

    if (context.userPreference && this.CURRENCY_DEFINITIONS[context.userPreference]) {
      return context.userPreference;
    }

    return 'EUR'; // Final fallback
  }

  /**
   * Validate if a currency code is supported
   */
  static isValidCurrency(currencyCode: string): boolean {
    return !!this.CURRENCY_DEFINITIONS[currencyCode];
  }

  /**
   * Clear cache and reload exchange rates
   */
  static async refreshRates(): Promise<void> {
    this.lastRateUpdate = 0;
    this.exchangeRates.clear();
    await this.loadExchangeRates();
  }
}

/**
 * Utility functions for common currency operations
 */

/**
 * Format currency with automatic currency detection
 */
export function formatCurrency(
  amount: number, 
  currency?: string, 
  companyCode?: string,
  locale?: string
): string {
  const currencyCode = currency || CurrencyManager.getCompanyCurrency(companyCode || '1000');
  return CurrencyManager.formatCurrency(amount, currencyCode, locale);
}

/**
 * Convert amount with company context
 */
export function convertWithCompanyContext(
  amount: number,
  fromCurrency: string,
  targetCompanyCode: string
): number {
  const targetCurrency = CurrencyManager.getCompanyCurrency(targetCompanyCode);
  return CurrencyManager.convertAmount(amount, fromCurrency, targetCurrency);
}

/**
 * Get currency for a specific context (replaces hardcoded EUR defaults)
 */
export function getCurrencyForContext(context: {
  companyCode?: string;
  materialCurrency?: string;
  userPreference?: string;
}): string {
  return CurrencyManager.determineCurrency(context);
}

// Initialize currency manager when module loads
CurrencyManager.initialize().catch(error => {
  console.error('Failed to initialize currency manager:', error);
});

export default CurrencyManager;
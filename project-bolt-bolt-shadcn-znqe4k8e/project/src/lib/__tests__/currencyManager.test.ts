/**
 * Currency Manager Test Suite
 * Tests the centralized currency management system
 */

import CurrencyManager, { formatCurrency, getCurrencyForContext } from '../currencyManager';

describe('CurrencyManager', () => {
  // Mock API client to avoid network calls during tests
  beforeAll(() => {
    // Set up mock exchange rates for testing
    CurrencyManager['exchangeRates'] = new Map([
      ['EUR', 1.0],
      ['GBP', 0.85],
      ['CHF', 0.95],
      ['USD', 1.1]
    ]);
  });

  describe('getCompanyCurrency', () => {
    test('returns correct currency for each company code', () => {
      expect(CurrencyManager.getCompanyCurrency('1000')).toBe('EUR');
      expect(CurrencyManager.getCompanyCurrency('2000')).toBe('GBP');
      expect(CurrencyManager.getCompanyCurrency('3000')).toBe('CHF');
    });

    test('returns EUR as default for unknown company codes', () => {
      expect(CurrencyManager.getCompanyCurrency('9999')).toBe('EUR');
      expect(CurrencyManager.getCompanyCurrency('')).toBe('EUR');
    });
  });

  describe('determineCurrency', () => {
    test('prioritizes company code over other options', () => {
      const context = {
        companyCode: '2000',
        materialCurrency: 'CHF',
        userPreference: 'USD'
      };
      expect(CurrencyManager.determineCurrency(context)).toBe('GBP');
    });

    test('uses material currency when no company code', () => {
      const context = {
        materialCurrency: 'CHF',
        userPreference: 'USD'
      };
      expect(CurrencyManager.determineCurrency(context)).toBe('CHF');
    });

    test('uses user preference as fallback', () => {
      const context = {
        userPreference: 'USD'
      };
      expect(CurrencyManager.determineCurrency(context)).toBe('USD');
    });

    test('returns EUR as final fallback', () => {
      const context = {};
      expect(CurrencyManager.determineCurrency(context)).toBe('EUR');
    });
  });

  describe('convertAmount', () => {
    test('converts between different currencies', () => {
      // Convert 100 EUR to GBP
      const converted = CurrencyManager.convertAmount(100, 'EUR', 'GBP');
      expect(converted).toBe(85); // 100 * 0.85

      // Convert 100 GBP to EUR
      const convertedBack = CurrencyManager.convertAmount(85, 'GBP', 'EUR');
      expect(convertedBack).toBe(100); // 85 / 0.85
    });

    test('returns same amount for same currency', () => {
      expect(CurrencyManager.convertAmount(100, 'EUR', 'EUR')).toBe(100);
    });

    test('handles unknown currencies with default rate', () => {
      const converted = CurrencyManager.convertAmount(100, 'UNKNOWN', 'EUR');
      expect(converted).toBe(100); // Uses rate of 1.0 for unknown currency
    });
  });

  describe('formatCurrency', () => {
    test('formats currency with proper symbols', () => {
      const formatted = CurrencyManager.formatCurrency(100, 'EUR');
      expect(formatted).toContain('€');
      expect(formatted).toContain('100');
    });

    test('handles different currencies', () => {
      const gbpFormatted = CurrencyManager.formatCurrency(100, 'GBP');
      expect(gbpFormatted).toContain('£');
      
      const chfFormatted = CurrencyManager.formatCurrency(100, 'CHF');
      expect(chfFormatted).toContain('CHF');
    });
  });

  describe('getCurrencyInfo', () => {
    test('returns correct currency info for supported currencies', () => {
      const eurInfo = CurrencyManager.getCurrencyInfo('EUR');
      expect(eurInfo.code).toBe('EUR');
      expect(eurInfo.symbol).toBe('€');
      expect(eurInfo.decimals).toBe(2);
    });

    test('handles unknown currencies gracefully', () => {
      const unknownInfo = CurrencyManager.getCurrencyInfo('UNKNOWN');
      expect(unknownInfo.code).toBe('UNKNOWN');
      expect(unknownInfo.symbol).toBe('UNKNOWN');
    });
  });

  describe('isValidCurrency', () => {
    test('validates supported currencies', () => {
      expect(CurrencyManager.isValidCurrency('EUR')).toBe(true);
      expect(CurrencyManager.isValidCurrency('GBP')).toBe(true);
      expect(CurrencyManager.isValidCurrency('CHF')).toBe(true);
      expect(CurrencyManager.isValidCurrency('USD')).toBe(true);
    });

    test('rejects unsupported currencies', () => {
      expect(CurrencyManager.isValidCurrency('UNKNOWN')).toBe(false);
      expect(CurrencyManager.isValidCurrency('')).toBe(false);
    });
  });
});

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    test('uses company code when no currency specified', () => {
      const formatted = formatCurrency(100, undefined, '2000');
      expect(formatted).toContain('£'); // Should use GBP for company 2000
    });

    test('uses specified currency over company code', () => {
      const formatted = formatCurrency(100, 'CHF', '2000');
      expect(formatted).toContain('CHF'); // Should use CHF despite company being 2000
    });
  });

  describe('getCurrencyForContext', () => {
    test('returns appropriate currency based on context', () => {
      expect(getCurrencyForContext({ companyCode: '2000' })).toBe('GBP');
      expect(getCurrencyForContext({ materialCurrency: 'CHF' })).toBe('CHF');
      expect(getCurrencyForContext({})).toBe('EUR');
    });
  });
});

describe('Currency System Integration', () => {
  test('backend and frontend use same currency mapping', () => {
    // Test that the mapping matches what's expected in server.js
    const testCases = [
      { companyCode: '1000', expectedCurrency: 'EUR' },
      { companyCode: '2000', expectedCurrency: 'GBP' },
      { companyCode: '3000', expectedCurrency: 'CHF' }
    ];

    testCases.forEach(({ companyCode, expectedCurrency }) => {
      expect(CurrencyManager.getCompanyCurrency(companyCode)).toBe(expectedCurrency);
    });
  });

  test('handles form item currency determination', () => {
    // Simulate form context where currency needs to be determined
    const contexts = [
      { 
        companyCode: '2000', 
        expectedCurrency: 'GBP',
        description: 'UK company should use GBP'
      },
      { 
        materialCurrency: 'CHF', 
        expectedCurrency: 'CHF',
        description: 'Material currency should be respected'
      },
      { 
        companyCode: '1000', 
        materialCurrency: 'USD', 
        expectedCurrency: 'EUR',
        description: 'Company code should take priority over material currency'
      }
    ];

    contexts.forEach(({ companyCode, materialCurrency, expectedCurrency, description }) => {
      const result = getCurrencyForContext({ companyCode, materialCurrency });
      expect(result).toBe(expectedCurrency);
    });
  });
});
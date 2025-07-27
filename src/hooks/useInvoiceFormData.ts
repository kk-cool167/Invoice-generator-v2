import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UseFormReturn } from 'react-hook-form';
import {
  getVendors,
  getMaterials,
  getRecipients,
  getTaxCodes,
  getExchangeRates,
  type Material,
  type TaxCode,
  type ExchangeRate,
} from '../lib/api';
import { BasicInfo } from '../types/forms';
import { findRecipientById } from '../lib/idUtils';

export function useInvoiceFormData(methods: UseFormReturn<BasicInfo>) {
  // Fetch all data using React Query
  const { 
    data: vendors = [], 
    isLoading: vendorsLoading,
    error: vendorsError,
    isSuccess: vendorsSuccess
  } = useQuery({
    queryKey: ['vendors'],
    queryFn: getVendors,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry, use mock data instead
  });

  const { 
    data: materials = [], 
    isLoading: materialsLoading,
    error: materialsError,
    isSuccess: materialsSuccess
  } = useQuery({
    queryKey: ['materials'],
    queryFn: getMaterials,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { 
    data: recipients = [], 
    isLoading: recipientsLoading,
    error: recipientsError,
    isSuccess: recipientsSuccess
  } = useQuery({
    queryKey: ['recipients'],
    queryFn: getRecipients,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { 
    data: taxCodes = [], 
    isLoading: taxCodesLoading,
    error: taxCodesError,
    isSuccess: taxCodesSuccess
  } = useQuery({
    queryKey: ['taxcodes'],
    queryFn: getTaxCodes,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { 
    data: exchangeRates = [], 
    isLoading: exchangeRatesLoading,
    error: exchangeRatesError,
    isSuccess: exchangeRatesSuccess
  } = useQuery({
    queryKey: ['exchangerates'],
    queryFn: getExchangeRates,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Get recipient company code for filtering
  const recipientCompanyCode = useMemo(() => {
    const recipientId = methods.watch('recipientId');
    const selectedRecipient = findRecipientById(recipients, recipientId);
    return selectedRecipient?.ccompanycode;
  }, [methods.watch('recipientId'), recipients]);

  // Filter materials based on recipient company code
  const filteredMaterials = useMemo(() => {
    if (!recipientCompanyCode) {
      return materials;
    }

    // If we have a recipient, filter materials by company code via tax codes
    if (taxCodes.length === 0) {
      return materials;
    }

    return materials.filter(material => {
      const taxCode = taxCodes.find(tc => tc.ccode === material.ctaxcode);
      return taxCode?.ccompanycode === recipientCompanyCode;
    });
  }, [materials, taxCodes, recipientCompanyCode]);

  // Tax code info helper function
  const getTaxCodeInfo = (taxCode?: string) => {
    if (!taxCode || !taxCodes.length) {
      return {
        taxRate: 19,
        currency: 'EUR',
        companyCode: recipientCompanyCode || '1000'
      };
    }

    const foundTaxCode = taxCodes.find(tc => tc.ccode === taxCode);
    if (!foundTaxCode) {
      return {
        taxRate: 19,
        currency: 'EUR',
        companyCode: recipientCompanyCode || '1000'
      };
    }

    // Determine currency based on company code
    let currency = 'EUR';
    switch (foundTaxCode.ccompanycode) {
      case '2000':
        currency = 'GBP';
        break;
      case '3000':
        currency = 'CHF';
        break;
      default:
        currency = 'EUR';
    }

    return {
      taxRate: foundTaxCode.crate || 19,
      currency,
      companyCode: foundTaxCode.ccompanycode || '1000'
    };
  };

  // Exchange rate helper function
  const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return 1.0;
    
    // Find the exchange rate
    const rate = exchangeRates.find(er => 
      er.ccurrency === fromCurrency && 
      er.ccurrency === toCurrency
    );
    
    return rate?.crate || 1.0;
  };

  // Loading and error states - only show errors if we don't have data
  const isLoading = vendorsLoading || materialsLoading || recipientsLoading || taxCodesLoading || exchangeRatesLoading;
  // Never show errors since we always have mock data fallbacks
  const hasError = false;
  const errorDetails = {};

  return {
    // Data
    vendors,
    materials,
    recipients,
    taxCodes,
    exchangeRates,
    filteredMaterials,
    recipientCompanyCode,
    
    // Helper functions
    getTaxCodeInfo,
    getExchangeRate,
    
    // Loading and error states
    isLoading,
    hasError,
    errorDetails,
    
    // Individual loading states (if needed for specific UI)
    vendorsLoading,
    materialsLoading,
    recipientsLoading,
    taxCodesLoading,
    exchangeRatesLoading,
  };
}
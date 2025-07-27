import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatCurrency as currencyFormat } from './currencyManager';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency using centralized currency manager
export function formatCurrency(amount: number, currency?: string, companyCode?: string, locale?: string) {
  return currencyFormat(amount, currency, companyCode, locale);
}

// Calculate total with tax
export function calculateTotalWithTax(amount: number, taxRate: number) {
  return amount * (1 + taxRate / 100);
}

// Calculate item total
export function calculateItemTotal(quantity: number, price: number, taxRate: number) {
  const netAmount = quantity * price;
  return calculateTotalWithTax(netAmount, taxRate);
}

// Format tax rate for display
export function formatTaxRate(rate: number) {
  return `${rate}%`;
}

// Check if value is numeric
export function isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// Format number with decimal places
export function formatNumber(value: number, decimals: number = 2) {
  return Number(value).toFixed(decimals);
}

// Generate invoice number
export function generateInvoiceNumber(prefix: string = "INV") {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${year}${month}-${random}`;
}

/**
 * Utility functions for safe ID comparisons between database entities (number) and form values (string)
 * 
 * Database IDs are bigint (converted to number in TypeScript)
 * Form IDs from HTML inputs are always strings
 * Direct comparison (1 === "1") fails - need proper conversion
 */

import { Material, Vendor, Recipient } from './api';

/**
 * Safely compare database entity ID (number) with form ID (string)
 */
export function compareIds(entityId: number, formId: string | undefined | null): boolean {
  if (!formId || formId === '') return false;
  return entityId.toString() === formId;
}

/**
 * Find material by ID with proper type conversion
 */
export function findMaterialById(materials: Material[], materialId: string | undefined | null): Material | undefined {
  if (!materialId || materialId === '') return undefined;
  return materials.find(m => compareIds(m.cid, materialId));
}

/**
 * Find vendor by ID with proper type conversion
 */
export function findVendorById(vendors: Vendor[], vendorId: string | undefined | null): Vendor | undefined {
  if (!vendorId || vendorId === '') return undefined;
  return vendors.find(v => compareIds(v.cid, vendorId));
}

/**
 * Find recipient by ID with proper type conversion
 */
export function findRecipientById(recipients: Recipient[], recipientId: string | undefined | null): Recipient | undefined {
  if (!recipientId || recipientId === '') return undefined;
  return recipients.find(r => compareIds(r.cid, recipientId));
}

/**
 * Convert form ID string to number for database operations
 */
export function parseFormId(formId: string | undefined | null): number | null {
  if (!formId || formId === '') return null;
  const parsed = parseInt(formId, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Convert database ID number to form string
 */
export function formatDbId(dbId: number | undefined | null): string {
  if (dbId === undefined || dbId === null) return '';
  return dbId.toString();
}
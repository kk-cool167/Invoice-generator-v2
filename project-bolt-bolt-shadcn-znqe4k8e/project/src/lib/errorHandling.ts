/**
 * Standardized error message handling for consistent user experience
 * Provides internationalized error messages and consistent error patterns
 */

// Type for translation function - compatible with our custom useLanguage hook
type TFunction = (key: string, options?: { defaultValue?: string }) => string;

export interface StandardError {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  details?: string;
}

/**
 * Standard error types for the application
 */
export const ErrorTypes = {
  // Network & API errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Data validation errors  
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // File operations
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  PDF_GENERATION_ERROR: 'PDF_GENERATION_ERROR',
  XML_GENERATION_ERROR: 'XML_GENERATION_ERROR',
  GENERATION_ERROR: 'GENERATION_ERROR',
  
  // Database operations
  DATABASE_ERROR: 'DATABASE_ERROR',
  SAVE_ERROR: 'SAVE_ERROR',
  LOAD_ERROR: 'LOAD_ERROR',
  
  // General application
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  
  // CRUD operations
  DELETE_ERROR: 'DELETE_ERROR',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  DELETE_SUCCESS: 'DELETE_SUCCESS',
  ADD_ITEM_SUCCESS: 'ADD_ITEM_SUCCESS',
  REMOVE_ITEM_SUCCESS: 'REMOVE_ITEM_SUCCESS'
} as const;

type ErrorType = typeof ErrorTypes[keyof typeof ErrorTypes];

/**
 * Create standardized error messages with internationalization
 */
export function createStandardError(
  errorType: ErrorType,
  t: TFunction,
  details?: string | Error
): StandardError {
  const detailsText = details instanceof Error ? details.message : details;
  
  switch (errorType) {
    case ErrorTypes.NETWORK_ERROR:
      return {
        type: 'error',
        title: t('errors.network.title'),
        message: t('errors.network.message'),
        details: detailsText
      };
      
    case ErrorTypes.API_ERROR:
      return {
        type: 'error',
        title: t('errors.api.title'),
        message: t('errors.api.message'),
        details: detailsText
      };
      
    case ErrorTypes.TIMEOUT_ERROR:
      return {
        type: 'error',
        title: t('errors.timeout.title'),
        message: t('errors.timeout.message'),
        details: detailsText
      };
      
    case ErrorTypes.VALIDATION_ERROR:
      return {
        type: 'error',
        title: t('errors.validation.title'),
        message: t('errors.validation.message'),
        details: detailsText
      };
      
    case ErrorTypes.REQUIRED_FIELD:
      return {
        type: 'error',
        title: t('errors.requiredField.title'),
        message: t('errors.requiredField.message'),
        details: detailsText
      };
      
    case ErrorTypes.FILE_UPLOAD_ERROR:
      return {
        type: 'error',
        title: t('errors.fileUpload.title'),
        message: t('errors.fileUpload.message'),
        details: detailsText
      };
      
    case ErrorTypes.PDF_GENERATION_ERROR:
      return {
        type: 'error',
        title: t('errors.pdfGeneration.title'),
        message: t('errors.pdfGeneration.message'),
        details: detailsText
      };
      
    case ErrorTypes.XML_GENERATION_ERROR:
      return {
        type: 'error',
        title: t('errors.xmlGeneration.title'),
        message: t('errors.xmlGeneration.message'),
        details: detailsText
      };
      
    case ErrorTypes.DATABASE_ERROR:
      return {
        type: 'error',
        title: t('errors.database.title'),
        message: t('errors.database.message'),
        details: detailsText
      };
      
    case ErrorTypes.SAVE_ERROR:
      return {
        type: 'error',
        title: t('errors.save.title'),
        message: t('errors.save.message'),
        details: detailsText
      };
      
    case ErrorTypes.LOAD_ERROR:
      return {
        type: 'error',
        title: t('errors.load.title'),
        message: t('errors.load.message'),
        details: detailsText
      };
      
    case ErrorTypes.PERMISSION_ERROR:
      return {
        type: 'error',
        title: t('errors.permission.title'),
        message: t('errors.permission.message'),
        details: detailsText
      };
      
    case ErrorTypes.DELETE_ERROR:
      return {
        type: 'error',
        title: t('errors.delete.title'),
        message: t('errors.delete.message'),
        details: detailsText
      };
      
    case ErrorTypes.CREATE_SUCCESS:
      return {
        type: 'success',
        title: t('success.create.title'),
        message: t('success.create.message'),
        details: detailsText
      };
      
    case ErrorTypes.DELETE_SUCCESS:
      return {
        type: 'success',
        title: t('success.delete.title'),
        message: t('success.delete.message'),
        details: detailsText
      };
      
    case ErrorTypes.ADD_ITEM_SUCCESS:
      return {
        type: 'success',
        title: t('success.addItem.title'),
        message: t('success.addItem.message'),
        details: detailsText
      };
      
    case ErrorTypes.REMOVE_ITEM_SUCCESS:
      return {
        type: 'success',
        title: t('success.removeItem.title'),
        message: t('success.removeItem.message'),
        details: detailsText
      };
      
    case ErrorTypes.UNKNOWN_ERROR:
    default:
      return {
        type: 'error',
        title: t('errors.unknown.title'),
        message: t('errors.unknown.message'),
        details: detailsText
      };
  }
}

/**
 * Enhanced toast hook interface for standardized error handling
 */
export interface StandardToastHook {
  showError: (errorType: ErrorType, details?: string | Error) => void;
  showSuccess: (messageKey: string, details?: string) => void;
  showWarning: (messageKey: string, details?: string) => void;
  showInfo: (messageKey: string, details?: string) => void;
}

/**
 * Create standard toast handlers that use internationalized messages
 */
export function createStandardToastHandlers(
  showToast: (toast: any) => void,
  t: TFunction
): StandardToastHook {
  return {
    showError: (errorType: ErrorType, details?: string | Error) => {
      const error = createStandardError(errorType, t, details);
      showToast({
        type: error.type,
        title: error.title,
        message: error.message,
        details: error.details
      });
    },
    
    showSuccess: (messageKey: string, details?: string) => {
      showToast({
        type: 'success',
        title: t('success.title'),
        message: t(messageKey),
        details
      });
    },
    
    showWarning: (messageKey: string, details?: string) => {
      showToast({
        type: 'warning',
        title: t('warning.title'),
        message: t(messageKey),
        details
      });
    },
    
    showInfo: (messageKey: string, details?: string) => {
      showToast({
        type: 'info',
        title: t('info.title'),
        message: t(messageKey),
        details
      });
    }
  };
}

/**
 * Format API error responses consistently
 */
export function formatAPIError(error: any, t: TFunction): StandardError {
  if (error?.response?.status === 404) {
    return createStandardError(ErrorTypes.API_ERROR, t, t('errors.notFound'));
  }
  
  if (error?.response?.status === 403) {
    return createStandardError(ErrorTypes.PERMISSION_ERROR, t);
  }
  
  if (error?.response?.status >= 500) {
    return createStandardError(ErrorTypes.DATABASE_ERROR, t);
  }
  
  if (error?.code === 'NETWORK_ERROR' || !error?.response) {
    return createStandardError(ErrorTypes.NETWORK_ERROR, t);
  }
  
  return createStandardError(ErrorTypes.API_ERROR, t, error?.response?.data?.message || error?.message);
}
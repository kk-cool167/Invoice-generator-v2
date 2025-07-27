import { API_CONFIG } from './config';

/**
 * Erweiterte Error-Klasse für API-Fehler mit zusätzlichen Informationen
 */
export class APIError extends Error {
  status: number;
  statusText: string;
  data: any;
  endpoint: string;
  code?: string;

  constructor(message: string, status: number, statusText: string, endpoint: string, data?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.statusText = statusText;
    this.endpoint = endpoint;
    this.data = data;
    
    // 尝试从错误数据中提取错误代码
    if (data && typeof data === 'object' && data.code) {
      this.code = data.code;
    }
  }
}

/**
 * Formatiert eine URL mit der API Basis-URL
 */
const formatUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

/**
 * Timeout Promise für fetch-Anfragen
 */
const timeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new APIError('Request timeout', 408, 'Request Timeout', 'timeout', null));
    }, ms);
  });
};

/**
 * Basis-Funktion für API-Anfragen mit erweiterter Fehlerbehandlung und Timeout
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = formatUrl(endpoint);
  
  // Get auth token from localStorage (temporarily disabled for backend compatibility)
  const token = localStorage.getItem('auth_token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Temporarily disabled: ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: API_CONFIG.WITH_CREDENTIALS ? 'include' : undefined,
  };

  const fetchOptions = { ...defaultOptions, ...options };
  
  // Merge headers properly to avoid overwriting auth header
  if (options.headers) {
    fetchOptions.headers = {
      ...defaultOptions.headers,
      ...options.headers,
    };
  }

  try {
    // Race zwischen fetch und einem Timeout
    const response = await Promise.race([
      fetch(url, fetchOptions),
      timeoutPromise(API_CONFIG.TIMEOUT)
    ]) as Response;

    // Parse response data
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle error responses
    if (!response.ok) {
      console.error(`API Error for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        url,
        data,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      throw new APIError(
        data.message || `API Error: ${response.status} ${response.statusText}`,
        response.status,
        response.statusText,
        endpoint,
        data
      );
    }

    return data as T;
  } catch (error) {
    // Handle fetch errors and timeouts
    if (error instanceof APIError) {
      throw error;
    }
    
    console.error(`Network Error for ${endpoint}:`, {
      url,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0,
      'Network Error',
      endpoint,
      null
    );
  }
}

/**
 * GET request
 */
export function get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = params 
    ? `${endpoint}?${new URLSearchParams(params).toString()}` 
    : endpoint;
    
  return apiRequest<T>(url, { method: 'GET' });
}

/**
 * POST request
 */
export function post<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export function put<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export function del<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * Hauptexport des API-Clients
 */
export const apiClient = {
  get,
  post,
  put,
  delete: del,
};

export default apiClient; 
/**
 * Logo-Größen-Konfiguration für verschiedene PDF-Templates
 */

export interface LogoConfig {
  maxWidth: number;
  maxHeight: number;
  containerWidth: number;
  containerHeight: number;
  alignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'middle' | 'bottom';
}

export interface LogoSize {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Vordefinierte Logo-Konfigurationen für verschiedene Templates
 */
export const logoConfigs: Record<string, LogoConfig> = {
  'business-standard': {
    maxWidth: 240,
    maxHeight: 50,
    containerWidth: 260,
    containerHeight: 60,
    alignment: 'right',
    verticalAlignment: 'middle'
  },
  'professional': {
    maxWidth: 300,
    maxHeight: 60,
    containerWidth: 320,
    containerHeight: 70,
    alignment: 'right',
    verticalAlignment: 'middle'
  },
  'business-green': {
    maxWidth: 300,
    maxHeight: 60,
    containerWidth: 320,
    containerHeight: 70,
    alignment: 'right',
    verticalAlignment: 'middle'
  },
  'classic': {
    maxWidth: 300,
    maxHeight: 60,
    containerWidth: 320,
    containerHeight: 70,
    alignment: 'right',
    verticalAlignment: 'middle'
  },
  'allrauer2': {
    maxWidth: 300,
    maxHeight: 60,
    containerWidth: 320,
    containerHeight: 70,
    alignment: 'center',
    verticalAlignment: 'middle'
  },
  'modern': {
    maxWidth: 300,
    maxHeight: 60,
    containerWidth: 320,
    containerHeight: 70,
    alignment: 'right',
    verticalAlignment: 'middle'
  },
  'minimal': {
    maxWidth: 300,
    maxHeight: 60,
    containerWidth: 320,
    containerHeight: 70,
    alignment: 'right',
    verticalAlignment: 'middle'
  }
};

/**
 * Berechnet die optimale Logo-Größe basierend auf dem Seitenverhältnis
 */
export function calculateOptimalLogoSize(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): LogoSize {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  // Skaliere basierend auf der maximalen Breite
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  // Skaliere basierend auf der maximalen Höhe
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
    aspectRatio
  };
}

/**
 * Generiert Logo-Styles für verschiedene Seitenverhältnisse
 */
export function generateLogoStyles(
  logoSize: LogoSize,
  config: LogoConfig,
  customStyles?: any
) {
  const optimizedSize = calculateOptimalLogoSize(
    logoSize.width,
    logoSize.height,
    config.maxWidth,
    config.maxHeight
  );
  
  return {
    container: {
      width: config.containerWidth,
      height: config.containerHeight,
      alignItems: config.alignment === 'left' ? 'flex-start' : 
                  config.alignment === 'center' ? 'center' : 'flex-end',
      justifyContent: config.verticalAlignment === 'top' ? 'flex-start' :
                     config.verticalAlignment === 'middle' ? 'center' : 'flex-end',
      ...customStyles?.logoContainer
    },
    logo: {
      width: optimizedSize.width,
      height: optimizedSize.height,
      objectFit: 'contain' as const,
      ...customStyles?.logo
    }
  };
}

/**
 * Hilfsfunktion um Logo-Dimensionen aus einer URL zu extrahieren
 */
export async function getLogoDimensions(logoUrl: string): Promise<LogoSize> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      // Fallback für Server-Side-Rendering
      resolve({ width: 200, height: 200, aspectRatio: 1 });
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load logo image'));
    };
    img.src = logoUrl;
  });
}

/**
 * Erstellt eine Logo-Konfiguration für ein bestimmtes Template
 */
export function createLogoConfig(
  templateName: string,
  overrides?: Partial<LogoConfig>
): LogoConfig {
  const baseConfig = logoConfigs[templateName] || logoConfigs['business-standard'];
  
  return {
    ...baseConfig,
    ...overrides
  };
} 
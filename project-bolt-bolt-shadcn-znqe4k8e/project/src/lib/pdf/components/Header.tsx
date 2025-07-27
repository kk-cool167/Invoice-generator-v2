import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import type { PDFGeneratorOptions } from '../../pdfTypes';
import { LogoContainer } from './LogoContainer';
import { createLogoConfig, logoConfigs } from '../utils/logoUtils';

interface HeaderProps {
  data: PDFGeneratorOptions & { logoConfig?: any };
  styles: any;
  t?: (key: string) => string;
  templateName?: string;
}

/**
 * Wiederverwendbare Header-Komponente für PDF-Dokumente
 * Zeigt Firmenname, Adresse und Logo an
 */
export const Header: React.FC<HeaderProps> = ({ data, styles, t, templateName = 'business-standard' }) => {
  // Verwende die benutzerdefinierte logoConfig oder falle auf Default zurück
  const logoConfig = data.logoConfig || createLogoConfig(templateName);
  
  return (
    <View style={styles.header}>
      {/* Company Information */}
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>
          {data.vendor?.cname || 'Ihr Unternehmen'}
        </Text>
        <View style={styles.companyDetails}>
          {data.vendor?.cstreet && (
            <Text>{data.vendor.cstreet}</Text>
          )}
          {(data.vendor?.czip || data.vendor?.ccity) && (
            <Text>
              {data.vendor?.czip} {data.vendor?.ccity}
            </Text>
          )}
          {data.vendor?.ccountry && (
            <Text>{data.vendor.ccountry}</Text>
          )}
          
          {/* Phone only - email and fax moved to footer */}
          {data.vendor?.cfon && (
            <Text style={{ marginTop: 8 }}>
              Tel: {data.vendor.cfon}
            </Text>
          )}
        </View>
      </View>

      {/* Logo with dynamic configuration */}
      {data.logo && (
        <LogoContainer
          logoUrl={data.logo}
          maxWidth={logoConfig.maxWidth}
          maxHeight={logoConfig.maxHeight}
          containerWidth={logoConfig.containerWidth}
          containerHeight={logoConfig.containerHeight}
          alignment={logoConfig.alignment}
          verticalAlignment={logoConfig.verticalAlignment}
          styles={styles}
        />
      )}
    </View>
  );
};

export default Header; 
import React from 'react';
import { View, Image } from '@react-pdf/renderer';

interface LogoContainerProps {
  logoUrl: string;
  maxWidth?: number;
  maxHeight?: number;
  containerWidth?: number;
  containerHeight?: number;
  alignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'middle' | 'bottom';
  styles?: any;
}

/**
 * Intelligente Logo-Container-Komponente für PDF-Templates
 * Berechnet automatisch die optimale Größe basierend auf dem Seitenverhältnis des Logos
 */
export const LogoContainer: React.FC<LogoContainerProps> = ({
  logoUrl,
  maxWidth = 80,
  maxHeight = 80,
  containerWidth = 100,
  containerHeight = 100,
  alignment = 'right',
  verticalAlignment = 'top',
  styles = {}
}) => {
  // Berechne die optimale Logo-Größe basierend auf dem verfügbaren Platz
  const calculateLogoStyle = () => {
    // Basis-Styles für responsives Logo
    const logoStyle = {
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      objectFit: 'contain' as const,
      objectPosition: `${alignment} ${verticalAlignment}`,
    };

    return logoStyle;
  };

  const containerStyle = {
    width: containerWidth,
    height: containerHeight,
    display: 'flex',
    flexDirection: 'column',
    alignItems: alignment === 'left' ? 'flex-start' : 
                alignment === 'center' ? 'center' : 'flex-end',
    justifyContent: verticalAlignment === 'top' ? 'flex-start' :
                   verticalAlignment === 'middle' ? 'center' : 'flex-end',
    ...styles.logoContainer
  };

  return (
    <View style={containerStyle}>
      <Image
        src={logoUrl}
        style={{
          ...calculateLogoStyle(),
          ...styles.logo
        }}
      />
    </View>
  );
};

export default LogoContainer; 
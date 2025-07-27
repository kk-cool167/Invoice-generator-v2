# Leitfaden zur Verbesserung der PDF-Logik

## Aktuelle Probleme

Die aktuelle PDF-Generierung in der Anwendung hat mehrere Probleme:

1. **Monolithische Struktur**: Die Datei `PDFWrapper.tsx` ist mit über 1300 Zeilen zu groß und schwer zu warten.
2. **Vermischung von Anliegen**: Layout, Styling, Datenverarbeitung und PDF-Generierung sind alle in einer Datei.
3. **Fehlende Wiederverwendbarkeit**: Gemeinsame Komponenten zwischen Templates werden dupliziert.
4. **Schwierige Erweiterbarkeit**: Neue Templates hinzuzufügen erfordert viel Duplizierung und manuelle Konfiguration.

## Vorgeschlagene Struktur

Eine bessere Organisation könnte wie folgt aussehen:

```
src/lib/pdf/
├── index.ts                 # Hauptexportdatei
├── generator.ts             # Hauptgenerator-Logik
├── templates.ts             # Template-Registry
├── components/              # Gemeinsame PDF-Komponenten
│   ├── Header.tsx           # Wiederverwendbare Header-Komponente
│   ├── Footer.tsx           # Wiederverwendbare Footer-Komponente
│   ├── ItemsTable.tsx       # Tabelle für Artikellisten
│   ├── BillingInfo.tsx      # Komponente für Rechnungsinformationen
│   └── ...
└── templates/               # PDF-Templates
    ├── modern/
    │   ├── index.tsx        # Haupttemplate-Export
    │   ├── styles.ts        # Template-spezifische Stile
    │   └── components/      # Template-spezifische Komponenten
    ├── classic/
    │   ├── index.tsx
    │   ├── styles.ts
    │   └── components/
    └── ...
```

## Implementierungsschritte

### 1. Gemeinsame Komponenten extrahieren

Identifizieren Sie gemeinsame Elemente in den aktuellen Templates und extrahieren Sie sie als wiederverwendbare Komponenten:

```tsx
// Beispiel: src/lib/pdf/components/Header.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { PDFGeneratorOptions } from '../pdfTypes';

interface HeaderProps {
  data: PDFGeneratorOptions;
  styles?: any;
}

export const Header: React.FC<HeaderProps> = ({ data, styles = {} }) => (
  <View style={[defaultStyles.header, styles.header]}>
    <View style={[defaultStyles.companyInfo, styles.companyInfo]}>
      <Text style={[defaultStyles.companyName, styles.companyName]}>
        {data.vendor?.cname || 'Vendor Name'}
      </Text>
      <Text style={defaultStyles.companyDetail}>
        {data.vendor?.cstreet || 'Vendor Street'}
      </Text>
      <Text style={defaultStyles.companyDetail}>
        {data.vendor?.czip || ''} {data.vendor?.ccity || 'Vendor City'}
      </Text>
    </View>
    
    {data.logo && (
      <Image style={defaultStyles.logo} src={data.logo} />
    )}
  </View>
);

const defaultStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  companyInfo: {
    maxWidth: '60%',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyDetail: {
    fontSize: 10,
    marginBottom: 2,
  },
  logo: {
    width: 100,
    height: 'auto',
  },
});
```

### 2. Template-spezifische Stile definieren

Jedes Template sollte seine eigenen Stile haben, die in einer separaten Datei definiert sind:

```tsx
// Beispiel: src/lib/pdf/templates/modern/styles.ts
import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  document: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333',
  },
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  header: {
    borderBottom: '1px solid #EFEFEF',
    paddingBottom: 10,
  },
  companyName: {
    color: '#4F46E5',
    fontSize: 16,
  },
  // ...weitere Stile
});

export default styles;
```

### 3. Template-Hauptdateien erstellen

Jedes Template sollte eine Hauptdatei haben, die die Komponenten zusammensetzt:

```tsx
// Beispiel: src/lib/pdf/templates/modern/index.tsx
import React from 'react';
import { Document, Page } from '@react-pdf/renderer';
import { Header, Footer, ItemsTable, BillingInfo } from '../../components';
import type { PDFGeneratorOptions } from '../../../pdfTypes';
import styles from './styles';

interface ModernTemplateProps {
  data: PDFGeneratorOptions;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => (
  <Document style={styles.document}>
    <Page size="A4" style={styles.page}>
      <Header data={data} styles={styles} />
      <BillingInfo data={data} styles={styles} />
      <ItemsTable data={data} styles={styles} />
      <Footer data={data} styles={styles} />
    </Page>
  </Document>
);
```

### 4. Generator und Registry

Die Hauptgenerator-Datei und die Template-Registry verbinden alles:

```tsx
// templates.ts - Registriert alle verfügbaren Templates
import { ModernTemplate } from './templates/modern';
import { ClassicTemplate } from './templates/classic';
// ...weitere Imports

const templates = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  // ...weitere Templates
};

export type TemplateName = keyof typeof templates;
export default templates;

// generator.ts - Zentrale Generierungsfunktion
import { pdf } from '@react-pdf/renderer';
import templates, { TemplateName } from './templates';
import type { PDFGeneratorOptions } from '../pdfTypes';

export async function generatePDF(
  data: PDFGeneratorOptions,
  templateName: TemplateName = 'modern'
): Promise<Blob> {
  const Template = templates[templateName] || templates.modern;
  return await pdf(<Template data={data} />).toBlob();
}
```

## Vorteile dieser Struktur

1. **Bessere Wartbarkeit**: Kleinere, fokussierte Dateien sind leichter zu verstehen und zu warten.
2. **Wiederverwendbarkeit**: Gemeinsame Komponenten können in mehreren Templates verwendet werden.
3. **Erweiterbarkeit**: Neue Templates können einfach hinzugefügt werden, ohne bestehenden Code zu ändern.
4. **Konsistenz**: Gemeinsame Komponenten stellen sicher, dass alle Templates ähnliche Funktionen haben.
5. **Trennung der Anliegen**: Design, Struktur und Generierungslogik sind voneinander getrennt.

## Implementierungsplan

1. Erstellen Sie die Ordnerstruktur und die Basisdateien.
2. Extrahieren Sie gemeinsame Komponenten aus der aktuellen Implementierung.
3. Erstellen Sie das erste Template (Modern) mit der neuen Struktur.
4. Implementieren Sie den Generator und verbinden Sie ihn mit der Anwendung.
5. Migrieren Sie nach und nach weitere Templates.
6. Entfernen Sie die alte PDFWrapper.tsx, sobald alle Templates migriert sind.

## Codebeispiel für die Integration

```tsx
// Verwendung in der InvoiceForm.tsx
import { generatePDF } from '../lib/pdf';

const handlePreviewPDF = async () => {
  try {
    // Daten vorbereiten...
    const pdfBlob = await generatePDF(documentData, template);
    window.open(URL.createObjectURL(pdfBlob), '_blank');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
``` 
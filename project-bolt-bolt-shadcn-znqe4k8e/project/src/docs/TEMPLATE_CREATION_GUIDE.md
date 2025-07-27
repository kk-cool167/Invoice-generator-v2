# PDF-Template Erstellungs-Leitfaden

Dieser Leitfaden erklärt, wie Sie ein neues PDF-Template für die Invoice Generator-Anwendung erstellen können.

## Voraussetzungen

Sie sollten mit folgenden Technologien vertraut sein:
- React
- @react-pdf/renderer
- TypeScript
- Styling mit CSS-in-JS

## Schritt 1: Verzeichnisstruktur erstellen

Für ein neues Template mit dem Namen "custom" erstellen Sie folgende Struktur:

```
src/lib/pdf/templates/custom/
├── index.tsx        # Hauptdatei des Templates
├── styles.ts        # Template-spezifische Stile
└── components/      # (optional) Template-spezifische Komponenten
```

## Schritt 2: Stile definieren

Erstellen Sie in `styles.ts` die Stildefinitionen für Ihr Template:

```typescript
import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  // Dokumentenebene
  document: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333333',
  },
  
  // Seiteneinstellungen
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  
  // Header-Stile
  header: {
    // Ihre spezifischen Stile hier...
  },
  
  // Weitere Stile für Ihre Template-Komponenten...
});

export default styles;
```

## Schritt 3: Template-Hauptdatei erstellen

Erstellen Sie die `index.tsx` Datei, die alle Komponenten zusammenführt:

```tsx
import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { Header, Footer, ItemsTable, BillingInfo } from '../../components';
import type { PDFGeneratorOptions } from '../../../pdfTypes';
import styles from './styles';

interface CustomTemplateProps {
  data: PDFGeneratorOptions;
}

export const CustomTemplate: React.FC<CustomTemplateProps> = ({ data }) => {
  return (
    <Document style={styles.document}>
      <Page size="A4" style={styles.page} wrap>
        {/* Header mit Firmenlogo und -informationen */}
        <Header data={data} styles={styles} />
        
        {/* Empfänger und Rechnungsdetails */}
        <BillingInfo data={data} styles={styles} />
        
        {/* Ihre eigenen Template-spezifischen Elemente */}
        <View style={styles.customElement}>
          <Text>Ihre benutzerdefinierten Elemente hier</Text>
        </View>
        
        {/* Artikeltabelle und Summen */}
        <ItemsTable data={data} styles={styles} />
        
        {/* Footer mit Kontaktdaten, Banking-Informationen */}
        <Footer data={data} styles={styles} />
      </Page>
    </Document>
  );
};

export default CustomTemplate;
```

## Schritt 4: Template zur Registry hinzufügen

Öffnen Sie die Datei `src/lib/pdf/templates.ts` und aktualisieren Sie sie:

```typescript
import { ModernTemplate } from './templates/modern';
import { ClassicTemplate } from './templates/classic';
import { CustomTemplate } from './templates/custom'; // Ihr neues Template
import { PDF_CONFIG } from '../config';

const templates = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  custom: CustomTemplate, // Ihr neues Template hier hinzufügen
  // Weitere Templates...
};

export type TemplateName = keyof typeof templates;
export default templates;
```

## Schritt 5: Konfiguration aktualisieren

Aktualisieren Sie die `PDF_CONFIG` in der `config.ts`-Datei, um Ihr neues Template verfügbar zu machen:

```typescript
export const PDF_CONFIG = {
  DEFAULT_TEMPLATE: 'modern',
  AVAILABLE_TEMPLATES: ['modern', 'classic', 'custom'], // Fügen Sie Ihren Template-Namen hinzu
};
```

## Schritt 6: UI zur Template-Auswahl aktualisieren

Fügen Sie Ihr neues Template zur Auswahlbox in der `InvoiceForm.tsx`-Komponente hinzu:

```tsx
<Select 
  value={template} 
  onValueChange={(value: 'modern' | 'classic' | 'custom' | /* weitere Templates */) => setTemplate(value)}
>
  <SelectTrigger className="h-9 w-[150px] bg-white border-gray-200">
    <SelectValue placeholder="Template" />
  </SelectTrigger>
  <SelectContent className="bg-white border-gray-100 shadow-md rounded-md">
    <SelectItem value="modern">Modern</SelectItem>
    <SelectItem value="classic">Classic</SelectItem>
    <SelectItem value="custom">Custom</SelectItem>
    {/* Weitere Templates */}
  </SelectContent>
</Select>
```

## Tipps für die Template-Erstellung

1. **Gemeinsame Komponenten verwenden**: Nutzen Sie die vorhandenen Komponenten aus `src/lib/pdf/components/`, um Konsistenz und Wartbarkeit zu gewährleisten.

2. **Responsive Design**: Berücksichtigen Sie verschiedene Datenmengen und Seitenlängen. Verwenden Sie dynamische Styles und die `wrap`-Eigenschaft.

3. **Farben und Typografie**: Definieren Sie konsistente Farbschemata und Typografie für Ihr Template.

4. **Testen**: Testen Sie Ihr Template mit verschiedenen Datensätzen, um sicherzustellen, dass es mit allen möglichen Daten korrekt funktioniert.

5. **Performance**: Verwenden Sie Memoization für komplexe Berechnungen, um die Rendering-Performance zu verbessern.

## Beispiel für ein benutzerdefiniertes Element

Wenn Sie spezifische Elemente für Ihr Template benötigen, können Sie diese in der Template-Datei definieren:

```tsx
// Benutzerdefinierte Komponente für spezielle Anforderungen
const CustomElement: React.FC<{ data: PDFGeneratorOptions }> = ({ data }) => (
  <View style={styles.customBox}>
    <Text style={styles.customTitle}>Besondere Hinweise</Text>
    <Text style={styles.customText}>Hier können Sie spezifische Informationen anzeigen.</Text>
    {/* Weitere benutzerdefinierte Elemente */}
  </View>
);
```

Und dann in Ihrem Template verwenden:

```tsx
<CustomElement data={data} />
```

## Abschluss

Nach diesen Schritten sollte Ihr neues Template in der Anwendung verfügbar sein und kann von den Benutzern ausgewählt werden. Bei Fragen oder Problemen wenden Sie sich bitte an das Entwicklungsteam. 
# Übersetzungs-Leitfaden

Dieses Dokument bietet einen Überblick darüber, wie Übersetzungen in der PDF-Generator-Anwendung implementiert werden können.

## Überblick

Die Anwendung unterstützt mehrere Sprachen (derzeit Englisch und Deutsch) und verwendet einen zentralen Übersetzungsmechanismus, der in `context/LanguageContext.tsx` definiert ist.

## Übersetzungsschlüssel hinzufügen

Alle Übersetzungen werden in der `translations`-Objektvariable in `context/LanguageContext.tsx` gespeichert. Neue Übersetzungen können folgendermaßen hinzugefügt werden:

```typescript
const translations: Translations = {
  // Bestehende Schlüssel
  
  // Neuer Schlüssel
  'mein.neuer.schluessel': {
    en: 'English translation',
    de: 'Deutsche Übersetzung'
  }
};
```

## Übersetzungen in Komponenten verwenden

### Methode 1: Direkter Zugriff über den `useLanguage` Hook

```jsx
import { useLanguage } from '@/context/LanguageContext';

function MeineKomponente() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('mein.neuer.schluessel')}</h1>
    </div>
  );
}
```

### Methode 2: Verwendung der `TranslatedText` Komponente

```jsx
import { TranslatedText } from '@/components/TranslatedText';

function MeineKomponente() {
  return (
    <div>
      <h1>
        <TranslatedText 
          textKey="mein.neuer.schluessel" 
          defaultText="Fallback Text, falls Schlüssel nicht gefunden"
        />
      </h1>
    </div>
  );
}
```

### Methode 3: Verwendung von data-Attributen (für statischen Inhalt)

```jsx
import { useTranslateUI } from '@/lib/translateUI';

function MeineKomponente() {
  // Hook aufrufen, um die Übersetzungsfunktion zu aktivieren
  useTranslateUI();
  
  return (
    <div>
      <h1 data-i18n-key="mein.neuer.schluessel">Default Text</h1>
    </div>
  );
}
```

## Fehlende Übersetzungen finden

Fehlende Übersetzungen werden durch den Schlüssel selbst ersetzt. Um fehlende Übersetzungen zu finden, kann folgender Code in der Konsole ausgeführt werden:

```javascript
document.querySelectorAll('[data-i18n-key]').forEach(el => {
  if (el.textContent === el.getAttribute('data-i18n-key')) {
    console.warn('Fehlende Übersetzung:', el.getAttribute('data-i18n-key'));
  }
});
```

## Vorgehensweise für eine vollständige Übersetzung

1. Identifizieren Sie alle statischen Texte in der Anwendung
2. Fügen Sie für jeden Text einen Übersetzungsschlüssel hinzu
3. Ersetzen Sie den statischen Text durch einen Übersetzungsaufruf
4. Testen Sie die Anwendung in allen unterstützten Sprachen

## Namenskonventionen für Übersetzungsschlüssel

- Verwenden Sie Punktnotation für Hierarchie: `bereich.unterbereich.element`
- Verwenden Sie Substantive für Überschriften: `form.configuration`
- Verwenden Sie Verben für Aktionen: `buttons.save`
- Vermeiden Sie zu allgemeine Schlüssel: Lieber `form.customerNumber` als `form.label`

## Weitere Ressourcen

- Für komplexere Übersetzungsanforderungen kann die Integration von i18next in Betracht gezogen werden
- Bei vielen Übersetzungen sollten die Übersetzungsdateien in separate JSON-Dateien ausgelagert werden 
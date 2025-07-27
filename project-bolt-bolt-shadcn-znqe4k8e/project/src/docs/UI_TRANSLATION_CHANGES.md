# Implementierung der Übersetzungen in UI-Komponenten

Nachdem Sie die fehlenden Übersetzungen in `LanguageContext.tsx` hinzugefügt haben, müssen folgende Änderungen in den UI-Komponenten vorgenommen werden, um diese Übersetzungen zu verwenden.

## 1. Für Tabellenbeschriftungen

```jsx
// Statt:
<h3>Invoice Items</h3>

// Verwenden Sie:
<h3>{t('form.invoiceItems')}</h3>

// Und so weiter für:
<h3>{t('form.orderItems')}</h3>
<h3>{t('form.deliveryItems')}</h3>
```

## 2. Für Spaltenüberschriften

```jsx
// Statt:
<th>Material</th>
<th>Quantity</th>
// etc.

// Verwenden Sie:
<th>{t('table.material')}</th>
<th>{t('table.quantity')}</th>
<th>{t('table.unit')}</th>
<th>{t('table.price')}</th>
<th>{t('table.taxRate')}</th>
```

## 3. Für Platzhalter in Eingabefeldern

```jsx
// Statt:
<input placeholder="Enter unit" />

// Verwenden Sie:
<input placeholder={t('placeholder.enterUnit')} />

// Ähnlich für:
<input placeholder={t('placeholder.enterPrice')} />
<select placeholder={t('placeholder.selectMaterial')} />
<select placeholder={t('placeholder.selectVendor')} />
<select placeholder={t('placeholder.selectRecipient')} />
```

## 4. Für Buttons

```jsx
// Statt:
<button>Add Item</button>

// Verwenden Sie:
<button>{t('buttons.addItem')}</button>

// Und:
<button>{t('buttons.addNew')}</button>
```

## 5. Für Zusammenfassungen

```jsx
// Statt:
<span>Total Items: {count}</span>
<span>Total Amount: {amount}</span>

// Verwenden Sie:
<span>{t('summary.totalItems')}: {count}</span>
<span>{t('summary.totalAmount')}: {amount}</span>
```

## 6. Für Formularfelder und Labels

```jsx
// Statt:
<label>Invoice Number</label>

// Verwenden Sie:
<label>{t('form.invoiceNumber')}</label>

// Und so weiter für alle anderen Formularfelder:
<label>{t('form.vendor')}</label>
<label>{t('form.recipient')}</label>
// usw.
```

## 7. Alternative mit TranslatedText-Komponente

Um die Übersetzungsfunktionalität besser zu kapseln, können Sie auch die `TranslatedText`-Komponente verwenden:

```jsx
import { TranslatedText } from '@/components/TranslatedText';

// Statt:
<label>Invoice Number</label>

// Verwenden Sie:
<label>
  <TranslatedText 
    textKey="form.invoiceNumber" 
    defaultText="Invoice Number" 
  />
</label>
```

## 8. Spezifische Komponenten-Anweisungen

### InvoiceTable-Komponente

```jsx
// Tabellen-Header
<div className="table-header">
  <div className="header-cell">{t('table.material')}</div>
  <div className="header-cell">{t('table.quantity')}</div>
  <div className="header-cell">{t('table.unit')}</div>
  <div className="header-cell">{t('table.price')}</div>
  <div className="header-cell">{t('table.taxRate')}</div>
</div>

// Tabellen-Zusammenfassung
<div className="table-summary">
  <span>{t('summary.totalItems')}: {items.length}</span>
  <span>{t('summary.totalAmount')}: {amount.toFixed(2)} €</span>
</div>
```

### Formular-Komponente

```jsx
// Für Formularfelder
<div className="form-group">
  <label htmlFor="invoiceNumber">{t('form.invoiceNumber')}</label>
  <input id="invoiceNumber" name="invoiceNumber" />
</div>

// Für Buttons
<button type="button" onClick={handleAddItem}>
  {t('buttons.addItem')}
</button>
```

Indem Sie alle diese Änderungen implementieren, wird die gesamte UI in der ausgewählten Sprache (Deutsch oder Englisch) angezeigt. 
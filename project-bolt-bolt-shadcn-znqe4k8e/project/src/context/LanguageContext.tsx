import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'de';

interface Translations {
  [key: string]: {
    en: string;
    de: string;
  };
}

const translations: Translations = {
  welcome: {
    en: 'Welcome! Experience a simple and modern way to create, verify and manage invoices - including DIIA reconciliation.',
    de: 'Herzlich Willkommen! Erleben Sie eine einfache und moderne Art, Rechnungen zu erstellen, zu prüfen und zu verwalten – inklusive DIIA-Abgleich.'
  },
  guide: {
    en: 'Guide',
    de: 'Anleitung'
  },
  chooseMode: {
    en: 'Choose Mode & Template',
    de: 'Modus & Template wählen'
  },
  chooseModeDesc: {
    en: 'Select MM or FI mode in the top-right dropdown and choose your preferred PDF template.',
    de: 'Wählen Sie MM oder FI Modus im Dropdown oben rechts und wählen Sie Ihr bevorzugtes PDF-Template.'
  },
  logoUpload: {
    en: 'Logo Upload (Optional)',
    de: 'Logo-Upload (Optional)'
  },
  logoUploadDesc: {
    en: 'Upload your company logo in the left configuration panel. The system will optimize it automatically.',
    de: 'Laden Sie Ihr Firmenlogo im linken Konfigurationsbereich hoch. Das System optimiert es automatisch.'
  },
  vendorData: {
    en: 'Basic Invoice Information',
    de: 'Grundlegende Rechnungsdaten'
  },
  vendorDataDesc: {
    en: 'Fill in required fields (marked with *) like invoice number, vendor, customer number, and dates.',
    de: 'Füllen Sie die Pflichtfelder (mit * markiert) wie Rechnungsnummer, Lieferant, Kundennummer und Datum aus.'
  },
  enterItems: {
    en: 'Add Invoice Items',
    de: 'Rechnungspositionen hinzufügen'
  },
  enterItemsDesc: {
    en: 'Add materials and services to your invoice. In MM mode, separate order and delivery data is also recorded.',
    de: 'Fügen Sie Materialien und Leistungen zu Ihrer Rechnung hinzu. Im MM-Modus werden auch separate Bestell- und Lieferdaten erfasst.'
  },
  syncMaterials: {
    en: 'Sync Materials (MM Mode) - Optional',
    de: 'Materialien synchronisieren (MM-Modus) - Optional'
  },
  syncMaterialsDesc: {
    en: 'Enable "Sync Materials" to automatically copy material changes from Invoice Items to Order Items and Delivery Items. When enabled, selecting materials or changing quantities, prices, units, or tax rates in Invoice Items will automatically update the corresponding entries in other sections.',
    de: 'Aktivieren Sie "Materialien synchronisieren", um Materialänderungen aus Rechnungspositionen automatisch zu Bestellpositionen und Lieferpositionen zu kopieren. Bei Aktivierung werden Materialauswahl oder Änderungen von Mengen, Preisen, Einheiten oder Steuersätzen in Rechnungspositionen automatisch in anderen Bereichen aktualisiert.'
  },
  preview: {
    en: 'Preview & Generate',
    de: 'Vorschau & Generieren'
  },
  previewDesc: {
    en: 'Use the PDF viewer on the right to preview your document. Click "Preview" to generate and review before final submission.',
    de: 'Nutzen Sie den PDF-Viewer rechts für die Vorschau Ihres Dokuments. Klicken Sie auf "Vorschau" zum Generieren und Prüfen vor der finalen Übertragung.'
  },
  templateSelect: {
    en: 'Template Selection',
    de: 'Template-Auswahl'
  },
  templateSelectDesc: {
    en: 'Choose from various professional invoice templates that match your corporate design.',
    de: 'Wählen Sie aus verschiedenen professionellen Rechnungsvorlagen, die zu Ihrem Corporate Design passen.'
  },
  finalizeDocument: {
    en: 'Finalize Document',
    de: 'Dokument finalisieren'
  },
  finalizeDocumentDesc: {
    en: 'Generate the PDF, download it, and optionally save your form data for future use.',
    de: 'Generieren Sie das PDF, laden Sie es herunter und speichern Sie optional Ihre Formulardaten für zukünftige Verwendung.'
  },
  versionsManagement: {
    en: 'Version Management',
    de: 'Versions-Verwaltung'
  },
  versionsManagementDesc: {
    en: 'Use the "Versions" button to save different states of your form. You can save named versions, load previous versions, and manage multiple document variations. This is useful for creating different variations of invoices or preserving work progress.',
    de: 'Nutzen Sie die Schaltfläche "Versionen", um verschiedene Zustände Ihres Formulars zu speichern. Sie können benannte Versionen speichern, frühere Versionen laden und mehrere Dokumentvarianten verwalten. Dies ist nützlich für verschiedene Rechnungsvarianten oder zum Bewahren des Arbeitsfortschritts.'
  },
  saveFormData: {
    en: '10. Save Form Data',
    de: '10. Formulardaten speichern'
  },
  saveFormDataDesc: {
    en: 'Save frequently used vendor and recipient data to speed up future invoice creation.',
    de: 'Speichern Sie häufig verwendete Lieferanten- und Empfängerdaten, um zukünftige Rechnungserstellung zu beschleunigen.'
  },
  language: {
    en: 'Language',
    de: 'Sprache'
  },
  'errors.unknown': {
    en: 'An unknown error occurred',
    de: 'Ein unbekannter Fehler ist aufgetreten'
  },
  'errors.unknown.title': {
    en: 'Unknown Error',
    de: 'Unbekannter Fehler'
  },
  'errors.unknown.message': {
    en: 'An unexpected error occurred',
    de: 'Ein unerwarteter Fehler ist aufgetreten'
  },
  'errors.network.title': {
    en: 'Network Error',
    de: 'Netzwerkfehler'
  },
  'errors.network.message': {
    en: 'Connection failed. Please check your internet connection.',
    de: 'Verbindung fehlgeschlagen. Bitte überprüfen Sie Ihre Internetverbindung.'
  },
  'errors.api.title': {
    en: 'Server Error',
    de: 'Serverfehler'
  },
  'errors.api.message': {
    en: 'Server request failed. Please try again.',
    de: 'Serveranfrage fehlgeschlagen. Bitte versuchen Sie es erneut.'
  },
  'errors.timeout.title': {
    en: 'Timeout Error',
    de: 'Zeitüberschreitung'
  },
  'errors.timeout.message': {
    en: 'The request timed out. Please try again.',
    de: 'Die Anfrage ist abgelaufen. Bitte versuchen Sie es erneut.'
  },
  'errors.validation.title': {
    en: 'Validation Error',
    de: 'Validierungsfehler'
  },
  'errors.validation.message': {
    en: 'Please check your input and try again.',
    de: 'Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.'
  },
  'errors.requiredField.title': {
    en: 'Required Field',
    de: 'Pflichtfeld'
  },
  'errors.requiredField.message': {
    en: 'This field is required.',
    de: 'Dieses Feld ist erforderlich.'
  },
  'errors.fileUpload.title': {
    en: 'Upload Error',
    de: 'Upload-Fehler'
  },
  'errors.fileUpload.message': {
    en: 'File upload failed. Please try again.',
    de: 'Datei-Upload fehlgeschlagen. Bitte versuchen Sie es erneut.'
  },
  'errors.pdfGeneration.title': {
    en: 'PDF Generation Error',
    de: 'PDF-Generierungsfehler'
  },
  'errors.pdfGeneration.message': {
    en: 'PDF generation failed. Please try again.',
    de: 'PDF-Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.'
  },
  'errors.xmlGeneration.title': {
    en: 'XML Generation Error',
    de: 'XML-Generierungsfehler'
  },
  'errors.xmlGeneration.message': {
    en: 'XML generation failed. Please try again.',
    de: 'XML-Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.'
  },
  'errors.database.title': {
    en: 'Database Error',
    de: 'Datenbankfehler'
  },
  'errors.database.message': {
    en: 'Database operation failed. Please try again.',
    de: 'Datenbankoperation fehlgeschlagen. Bitte versuchen Sie es erneut.'
  },
  'errors.save.title': {
    en: 'Save Error',
    de: 'Speicherfehler'
  },
  'errors.save.message': {
    en: 'Failed to save. Please try again.',
    de: 'Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.'
  },
  'errors.load.title': {
    en: 'Loading Error',
    de: 'Ladefehler'
  },
  'errors.load.message': {
    en: 'Failed to load data. Please try again.',
    de: 'Laden der Daten fehlgeschlagen. Bitte versuchen Sie es erneut.'
  },
  'errors.permission.title': {
    en: 'Permission Error',
    de: 'Berechtigungsfehler'
  },
  'errors.permission.message': {
    en: 'You do not have permission to perform this action.',
    de: 'Sie haben keine Berechtigung für diese Aktion.'
  },
  'errors.delete.title': {
    en: 'Delete Error',
    de: 'Löschfehler'
  },
  'errors.delete.message': {
    en: 'Failed to delete. Please try again.',
    de: 'Löschen fehlgeschlagen. Bitte versuchen Sie es erneut.'
  },
  'errors.unknownError': {
    en: 'An unknown error occurred',
    de: 'Ein unbekannter Fehler ist aufgetreten'
  },
  'errors.invalidDataType': {
    en: 'Invalid data type input. Please check your entries.',
    de: 'Ungültige Datentyp-Eingabe. Bitte überprüfen Sie Ihre Eingaben.'
  },
  'errors.requiredFieldMissing': {
    en: 'Required fields are missing. Please fill in all mandatory fields.',
    de: 'Erforderliche Felder fehlen. Bitte füllen Sie alle Pflichtfelder aus.'
  },
  'errors.duplicateEntry': {
    en: 'This entry already exists. Please use different values.',
    de: 'Dieser Eintrag existiert bereits. Bitte verwenden Sie andere Werte.'
  },
  'errors.invalidVendorId': {
    en: 'Invalid vendor ID. Please use numbers only.',
    de: 'Ungültige Lieferanten-ID. Bitte verwenden Sie nur Zahlen.'
  },
  'errors.bankIdRequired': {
    en: 'Bank ID is required. The system will automatically generate an ID.',
    de: 'Bank-ID ist erforderlich. Das System generiert automatisch eine ID.'
  },
  'errors.fetchVendors': {
    en: 'Failed to fetch vendors',
    de: 'Fehler beim Abrufen der Lieferanten'
  },
  'errors.fetchRecipients': {
    en: 'Failed to fetch recipients',
    de: 'Fehler beim Abrufen der Empfänger'
  },
  'errors.fetchMaterials': {
    en: 'Failed to fetch materials',
    de: 'Fehler beim Abrufen der Materialien'
  },
  'errors.createMaterial': {
    en: 'Failed to create material',
    de: 'Fehler beim Erstellen des Materials'
  },
  'errors.createVendor': {
    en: 'Failed to create vendor',
    de: 'Fehler beim Erstellen des Lieferanten'
  },
  'errors.createRecipient': {
    en: 'Failed to create recipient',
    de: 'Fehler beim Erstellen des Empfängers'
  },
  'errors.createPurchaseOrder': {
    en: 'Failed to create purchase order',
    de: 'Fehler beim Erstellen der Bestellung'
  },
  'errors.createDeliveryNote': {
    en: 'Failed to create delivery note',
    de: 'Fehler beim Erstellen des Lieferscheins'
  },
  'formVersions.title': {
    en: 'Saved Versions',
    de: 'Gespeicherte Versionen'
  },
  'formVersions.noVersions': {
    en: 'No saved versions found',
    de: 'Keine gespeicherten Versionen gefunden'
  },
  'formVersions.load': {
    en: 'Load',
    de: 'Laden'
  },
  'formVersions.close': {
    en: 'Close',
    de: 'Schließen'
  },
  'formVersions.clearAll': {
    en: 'Clear All',
    de: 'Alle Löschen'
  },
  'formVersions.confirmClear': {
    en: 'Confirm Delete',
    de: 'Löschen Bestätigen'
  },
  'formVersions.autoSave': {
    en: 'Auto-saved',
    de: 'Automatisch gespeichert'
  },
  'formVersions.unnamed': {
    en: 'Unnamed Version',
    de: 'Unbenannte Version'
  },
  'formVersions.saveCurrentVersion': {
    en: 'Save current version with name',
    de: 'Aktuelle Version mit Namen speichern'
  },
  'formVersions.enterName': {
    en: 'Enter version name',
    de: 'Versionsnamen eingeben'
  },
  'formVersions.versionSaved': {
    en: 'Version saved',
    de: 'Version gespeichert'
  },
  'formVersions.versionRenamed': {
    en: 'Version renamed',
    de: 'Version umbenannt'
  },
  'formVersions.versionDeleted': {
    en: 'Version deleted',
    de: 'Version gelöscht'
  },
  'formVersions.nameThisVersion': {
    en: 'Name this version',
    de: 'Diese Version benennen'
  },
  'formVersions.lastSaved': {
    en: 'Last saved',
    de: 'Zuletzt gespeichert'
  },
  'autosave.lastSaved': {
    en: 'Last saved',
    de: 'Zuletzt gespeichert'
  },
  'autosave.saved': {
    en: 'Form saved',
    de: 'Formular gespeichert'
  },
  'autosave.saving': {
    en: 'Saving...',
    de: 'Speichern...'
  },
  'autosave.error': {
    en: 'Error saving form',
    de: 'Fehler beim Speichern des Formulars'
  },
  'autosave.versionRestored': {
    en: 'Version restored',
    de: 'Version wiederhergestellt'
  },
  'buttons.save': {
    en: 'Save',
    de: 'Speichern'
  },
  'buttons.cancel': {
    en: 'Cancel',
    de: 'Abbrechen'
  },
  'buttons.confirm': {
    en: 'Confirm',
    de: 'Bestätigen'
  },
  'buttons.delete': {
    en: 'Delete',
    de: 'Löschen'
  },
  'buttons.edit': {
    en: 'Edit',
    de: 'Bearbeiten'
  },
  'buttons.saveChanges': {
    en: 'Save Changes',
    de: 'Änderungen Speichern'
  },
  'buttons.reset': {
    en: 'Reset',
    de: 'Zurücksetzen'
  },
  'logoEditor.dragToAdjust': {
    en: 'Drag to adjust position • Use sliders to resize and adjust filters',
    de: 'Ziehen Sie zur Positionsanpassung • Nutzen Sie die Schieberegler für Größe und Filter'
  },
  'logoEditor.size': {
    en: 'Size',
    de: 'Größe'
  },
  'logoEditor.brightness': {
    en: 'Brightness',
    de: 'Helligkeit'
  },
  'logoEditor.contrast': {
    en: 'Contrast',
    de: 'Kontrast'
  },
  'logoSettings.pdfSettings': {
    en: 'PDF Settings',
    de: 'PDF-Einstellungen'
  },
  'logoSettings.adjustForPdf': {
    en: 'Adjust logo size and position for the selected PDF template',
    de: 'Logo-Größe und -Position für das gewählte PDF-Template anpassen'
  },
  'buttons.add': {
    en: 'Add',
    de: 'Hinzufügen'
  },
  'buttons.loading': {
    en: 'Loading...',
    de: 'Laden...'
  },
  'buttons.generate': {
    en: 'Generate',
    de: 'Generieren'
  },
  'formVersions.versions': {
    en: 'versions',
    de: 'Versionen'
  },
  'formVersions.noSaves': {
    en: 'No saved versions',
    de: 'Keine Speicherungen'
  },
  'loading.generatingPreview': {
    en: 'Generating preview...',
    de: 'Erzeuge Vorschau...'
  },
  'errors.validationFailed': {
    en: 'Validation failed',
    de: 'Validierung fehlgeschlagen'
  },
  'errors.missingVendorOrRecipient': {
    en: 'Vendor or recipient is missing',
    de: 'Lieferant oder Empfänger fehlt'
  },
  'errors.createFailed': {
    en: 'Creation failed',
    de: 'Erstellung fehlgeschlagen'
  },
  'errors.generateFailed': {
    en: 'Generation failed',
    de: 'Generierung fehlgeschlagen'
  },
  'success.created': {
    en: 'Created successfully',
    de: 'Erfolgreich erstellt'
  },
  'success.documentCreated': {
    en: 'Document created successfully',
    de: 'Dokument erfolgreich erstellt'
  },
  'success.fiDocumentCreated': {
    en: 'FI document created successfully',
    de: 'FI-Dokument erfolgreich erstellt'
  },
  'success.generated': {
    en: 'Generated successfully',
    de: 'Erfolgreich generiert'
  },
  'success.materialCreated': {
    en: 'Material has been created successfully',
    de: 'Material wurde erfolgreich erstellt'
  },
  'success.vendorCreated': {
    en: 'Vendor has been created successfully',
    de: 'Lieferant wurde erfolgreich erstellt'
  },
  'success.recipientCreated': {
    en: 'Recipient has been created successfully',
    de: 'Empfänger wurde erfolgreich erstellt'
  },
  'success.delete.title': {
    en: 'Successfully deleted',
    de: 'Erfolgreich gelöscht'
  },
  'success.delete.message': {
    en: 'Item has been deleted successfully',
    de: 'Element wurde erfolgreich gelöscht'
  },
  'success.addItem.title': {
    en: 'Item added',
    de: 'Element hinzugefügt'
  },
  'success.addItem.message': {
    en: 'Item has been added successfully',
    de: 'Element wurde erfolgreich hinzugefügt'
  },
  'success.removeItem.title': {
    en: 'Item removed',
    de: 'Element entfernt'
  },
  'success.removeItem.message': {
    en: 'Item has been removed successfully',
    de: 'Element wurde erfolgreich entfernt'
  },
  'success.create.title': {
    en: 'Successfully created',
    de: 'Erfolgreich erstellt'
  },
  'success.create.message': {
    en: 'Item has been created successfully',
    de: 'Element wurde erfolgreich erstellt'
  },
  'success.title': {
    en: 'Success',
    de: 'Erfolgreich'
  },
  'warning.title': {
    en: 'Warning',
    de: 'Warnung'
  },
  'info.title': {
    en: 'Information',
    de: 'Information'
  },
  'success.previewGenerated': {
    en: 'Preview generated successfully',
    de: 'Vorschau erfolgreich generiert'
  },
  'success.pdfPreviewGenerated': {
    en: 'PDF preview generated successfully',
    de: 'PDF-Vorschau erfolgreich generiert'
  },
  'createPdf': {
    en: 'Create PDF',
    de: 'PDF erstellen'
  },
  'confirmSubmission': {
    en: 'Confirm Submission',
    de: 'Übermittlung bestätigen'
  },
  'confirmSubmission.message': {
    en: 'The PDF preview looks good? Submit the data to the database now?',
    de: 'Die PDF-Vorschau sieht gut aus? Daten jetzt an die Datenbank übermitteln?'
  },
  'confirmSubmission.submit': {
    en: 'Submit to Database',
    de: 'An Datenbank senden'
  },
  'confirmSubmission.cancel': {
    en: 'Cancel',
    de: 'Abbrechen'
  },
  'buttons.previewPdf': {
    en: 'Preview PDF',
    de: 'PDF-Vorschau'
  },
  'buttons.downloadPdf': {
    en: 'Download PDF',
    de: 'PDF herunterladen'
  },
  'buttons.createPdf': {
    en: 'Create PDF',
    de: 'PDF erstellen'
  },
  'buttons.submitToDatabase': {
    en: 'Submit to Database',
    de: 'An Datenbank senden'
  },
  'buttons.downloadXml': {
    en: 'Download XML',
    de: 'XML herunterladen'
  },
  'buttons.createPdfAndSubmit': {
    en: 'Create PDF & Submit',
    de: 'PDF erstellen & übermitteln'
  },
  'buttons.refresh': {
    en: 'Refresh',
    de: 'Aktualisieren'
  },
  'success.documentCreatedAndSubmitted': {
    en: 'Document created and submitted successfully',
    de: 'Dokument erstellt und erfolgreich übermittelt'
  },
  'errors.xmlGenerationFailed': {
    en: 'XML generation failed',
    de: 'XML-Generierung fehlgeschlagen'
  },
  'errors.generatePdfFirst': {
    en: 'Please generate a PDF first',
    de: 'Bitte generieren Sie zuerst ein PDF'
  },
  'success.xmlGenerated': {
    en: 'XML generated',
    de: 'XML generiert'
  },
  'success.allMaterialsCleared': {
    en: 'All materials cleared',
    de: 'Alle Materialien gelöscht'
  },
  // PDF Template Translations
  'pdf.paymentTerms': {
    en: 'Payment Terms',
    de: 'Zahlungsbedingungen'
  },
  'pdf.defaultPayment': {
    en: 'Please transfer the invoice amount to our account below.',
    de: 'Bitte überweisen Sie den Rechnungsbetrag auf unser unten angegebenes Konto.'
  },
  'pdf.contactAvailable': {
    en: 'For questions about this invoice, please contact',
    de: 'Für Rückfragen zu dieser Rechnung steht Ihnen'
  },
  'pdf.contactAvailableSuffix': {
    en: 'is available.',
    de: 'gerne zur Verfügung.'
  },
  'pdf.billTo': {
    en: 'Bill To',
    de: 'Rechnungsempfänger'
  },
  'pdf.customerNumber': {
    en: 'Customer Number',
    de: 'Kundennummer'
  },
  'pdf.invoice': {
    en: 'Invoice',
    de: 'Rechnung'
  },
  'pdf.financialInvoice': {
    en: 'Financial Invoice',
    de: 'Finanzrechnung'
  },
  'pdf.invoiceNumber': {
    en: 'Invoice No.',
    de: 'Rechnungsnr.'
  },
  'pdf.invoiceDate': {
    en: 'Invoice Date',
    de: 'Rechnungsdatum'
  },
  'pdf.orderNumber': {
    en: 'Order No.',
    de: 'Bestellnr.'
  },
  'pdf.orderDate': {
    en: 'Order Date',
    de: 'Bestelldatum'
  },
  'pdf.deliveryNoteNumber': {
    en: 'Delivery Note No.',
    de: 'Lieferscheinnr.'
  },
  'pdf.deliveryDate': {
    en: 'Delivery Date',
    de: 'Lieferdatum'
  },
  'pdf.processor': {
    en: 'Processor',
    de: 'Sachbearbeiter'
  },
  'pdf.description': {
    en: 'Description',
    de: 'Beschreibung'
  },
  'pdf.quantity': {
    en: 'Quantity',
    de: 'Menge'
  },
  'pdf.unit': {
    en: 'Unit',
    de: 'Einheit'
  },
  'pdf.price': {
    en: 'Price',
    de: 'Preis'
  },
  'pdf.total': {
    en: 'Total',
    de: 'Gesamt'
  },
  'pdf.noDescription': {
    en: 'No Description',
    de: 'Ohne Beschreibung'
  },
  'pdf.articleNumber': {
    en: 'Art. No.',
    de: 'Art.-Nr.'
  },
  'pdf.subtotal': {
    en: 'Subtotal',
    de: 'Zwischensumme'
  },
  'pdf.vat': {
    en: 'VAT',
    de: 'MwSt.'
  },
  'pdf.tax': {
    en: 'Tax',
    de: 'MwSt.'
  },
  'pdf.salutation': {
    en: 'Dear Sir or Madam,',
    de: 'Sehr geehrte Damen und Herren,'
  },
  'pdf.introText': {
    en: 'We hereby invoice you for the following services:',
    de: 'hiermit stellen wir Ihnen die nachfolgend aufgeführten Leistungen in Rechnung:'
  },
  'pdf.position': {
    en: 'Pos.',
    de: 'Pos.'
  },
  'pdf.closing': {
    en: 'Best regards',
    de: 'Mit freundlichen Grüßen'
  },
  'pdf.bankDetails': {
    en: 'Bank Details',
    de: 'Bankverbindung'
  },
  'pdf.businessDetails': {
    en: 'Business Details',
    de: 'Geschäftsangaben'
  },
  'pdf.contact': {
    en: 'Contact',
    de: 'Kontakt'
  },
  'pdf.phone': {
    en: 'Phone',
    de: 'Tel'
  },
  'pdf.fax': {
    en: 'Fax',
    de: 'Fax'
  },
  'pdf.taxNumber': {
    en: 'Tax No.',
    de: 'Steuernr.'
  },
  'pdf.vatNumber': {
    en: 'VAT ID',
    de: 'USt-IdNr.'
  },
  'pdf.totalAmount': {
    en: 'Total Amount',
    de: 'Gesamtbetrag'
  },
  'pdf.invoiceInformation': {
    en: 'Invoice Information',
    de: 'Information zur Rechnung'
  },
  'pdf.thankYouOrder': {
    en: 'Thank you for your order. This invoice is to be paid according to our current terms and conditions',
    de: 'Wir danken Ihnen für Ihren Auftrag. Diese Rechnung ist gemäß unseren aktuellen Geschäftsbedingungen zu bezahlen'
  },
  'pdf.fallbackPayment': {
    en: 'with reference to the invoice number',
    de: 'unter Angabe der Rechnungsnummer'
  },
  'pdf.contactPhone': {
    en: 'Phone',
    de: 'Tel'
  },
  'pdf.contactEmail': {
    en: 'Email',
    de: 'E-Mail'
  },
  'pdf.contactWeb': {
    en: 'Web',
    de: 'Web'
  },
  'pdf.contactVatId': {
    en: 'VAT ID',
    de: 'USt-ID'
  },
  'success.xmlDownloaded': {
    en: 'XML downloaded successfully',
    de: 'XML erfolgreich heruntergeladen'
  },
  'errors.processError': {
    en: 'Process error',
    de: 'Prozessfehler'
  },
  'loading.processing': {
    en: 'Processing...',
    de: 'Verarbeite...'
  },
  'loading.generating': {
    en: 'Generating...',
    de: 'Generiere...'
  },
  'loading.submitting': {
    en: 'Submitting...',
    de: 'Sende Daten...'
  },
  'success.pdfDownloaded': {
    en: 'PDF downloaded successfully',
    de: 'PDF erfolgreich heruntergeladen'
  },
  'success.pdfPreviewOpened': {
    en: 'PDF preview opened in new tab',
    de: 'PDF-Vorschau in neuem Tab geöffnet'
  },
  'errors.missingData': {
    en: 'Missing required data. Please fill all required fields.',
    de: 'Erforderliche Daten fehlen. Bitte füllen Sie alle Pflichtfelder aus.'
  },
  'errors.noPreviewGenerated': {
    en: 'No preview has been generated yet. Please generate a preview first.',
    de: 'Es wurde noch keine Vorschau generiert. Bitte generieren Sie zuerst eine Vorschau.'
  },
  'pdf.title': {
    en: 'Create PDF',
    de: 'PDF erstellen'
  },
  'pdf.subtitle': {
    en: 'Configure and generate your document',
    de: 'Konfigurieren und generieren Sie Ihr Dokument'
  },
  'pdf.filename': {
    en: 'Invoice',
    de: 'Rechnung'
  },
  'pdf.unitPrice': {
    en: 'Unit Price',
    de: 'Einzelpreis'
  },
  'pdf.totalPrice': {
    en: 'Total Price',
    de: 'Gesamtpreis'
  },
  'pdf.net': {
    en: 'Net Amount',
    de: 'Zwischensumme (netto)'
  },
  'pdf.noPreviewAvailable': {
    en: 'No PDF preview available',
    de: 'Keine PDF-Vorschau verfügbar'
  },
  'pdf.selectVendorRecipientFirst': {
    en: 'Please select a vendor and recipient first',
    de: 'Wählen Sie zuerst einen Lieferanten und Empfänger aus'
  },
  'pdf.clickPreviewToGenerate': {
    en: 'Click "Create Preview" to generate the PDF',
    de: 'Klicken Sie auf "Vorschau erstellen" um das PDF zu generieren'
  },
  'pdf.refreshPreview': {
    en: 'Refresh PDF preview',
    de: 'PDF-Vorschau aktualisieren'
  },
  'pdf.createAndSubmit': {
    en: 'Create PDF & Submit',
    de: 'PDF erstellen & übermitteln'
  },
  'pdf.page': {
    en: 'Page',
    de: 'Seite'
  },
  'create.recipient': {
    en: 'Create Recipient',
    de: 'Empfänger erstellen'
  },
  'create.vendor': {
    en: 'Create Vendor',
    de: 'Lieferanten erstellen'
  },
  'create.material': {
    en: 'Create Material',
    de: 'Material erstellen'
  },
  'form.configuration': {
    en: 'Configuration',
    de: 'Konfiguration'
  },
  'form.mode': {
    en: 'Mode:',
    de: 'Modus:'
  },
  'form.template': {
    en: 'Template:',
    de: 'Vorlage:'
  },
  'demo.data': {
    en: 'Demo Data',
    de: 'Demo-Daten'
  },
  'demo.short': {
    en: 'Demo',
    de: 'Demo'
  },
  'demo.quick': {
    en: 'Quick Demo',
    de: 'Schnell-Demo'
  },
  'demo.processor.mm': {
    en: 'John Doe',
    de: 'Max Mustermann'
  },
  'demo.processor.fi': {
    en: 'Jane Smith',
    de: 'Maria Schmidt'
  },
  'demo.success.title': {
    en: '✨ Demo data filled',
    de: '✨ Demo-Daten eingefügt'
  },
  'demo.success.description': {
    en: 'All fields have been filled with sample data',
    de: 'Alle Felder wurden mit Beispieldaten ausgefüllt'
  },
  'template.businessstandard': {
    en: 'Business Standard',
    de: 'Business Standard'
  },
  'template.classic': {
    en: 'Classic',
    de: 'Klassisch'
  },
  'template.professional': {
    en: 'Professional',
    de: 'Professionell'
  },
  'template.businessgreen': {
    en: 'Business Green',
    de: 'Business Grün'
  },
  'template.allrauer2': {
    en: 'Allrauer',
    de: 'Allrauer'
  },
  'form.materialManagementInvoice': {
    en: 'Material Management Invoice',
    de: 'Material-Management-Rechnung'
  },
  'form.sync': {
    en: 'Sync materials across all sections',
    de: 'Materialien in allen Abschnitten synchronisieren'
  },
  'form.logoLibrary': {
    en: 'Logo Library',
    de: 'Logo-Bibliothek'
  },
  'form.searchLogos': {
    en: 'Search logos...',
    de: 'Logos suchen...'
  },
  'form.newestFirst': {
    en: 'Newest First',
    de: 'Neueste zuerst'
  },
  'form.addNew': {
    en: 'Add New',
    de: 'Neu hinzufügen'
  },
  'form.invoiceItems': {
    en: 'Invoice Items',
    de: 'Rechnungspositionen'
  },
  'form.orderItems': {
    en: 'Order Items',
    de: 'Bestellpositionen'
  },
  'form.deliveryItems': {
    en: 'Delivery Items',
    de: 'Lieferpositionen'
  },
  'form.material': {
    en: 'Material',
    de: 'Material'
  },
  'form.quantity': {
    en: 'Quantity',
    de: 'Menge'
  },
  'form.unit': {
    en: 'Unit',
    de: 'Einheit'
  },
  'form.price': {
    en: 'Price (€)',
    de: 'Preis (€)'
  },
  'form.taxRate': {
    en: 'Tax Rate (%)',
    de: 'Steuersatz (%)'
  },
  'form.addItem': {
    en: 'Add Item',
    de: 'Position hinzufügen'
  },
  'form.totalItems': {
    en: 'Total Items',
    de: 'Positionen gesamt'
  },
  'form.totalAmount': {
    en: 'Total Amount',
    de: 'Gesamtbetrag'
  },
  'form.invoiceNumber': {
    en: 'Invoice Number',
    de: 'Rechnungsnummer'
  },
  'form.vendor': {
    en: 'Vendor',
    de: 'Lieferant'
  },
  'form.recipient': {
    en: 'Recipient',
    de: 'Empfänger'
  },
  'form.invoiceDate': {
    en: 'Invoice Date',
    de: 'Rechnungsdatum'
  },
  'form.orderDate': {
    en: 'Order Date',
    de: 'Bestelldatum'
  },
  'form.deliveryDate': {
    en: 'Delivery Date',
    de: 'Lieferdatum'
  },
  'form.customerNumber': {
    en: 'Customer Number',
    de: 'Kundennummer'
  },
  'form.processor': {
    en: 'Processor',
    de: 'Bearbeiter'
  },
  'form.pdfPreview': {
    en: 'PDF Preview',
    de: 'PDF-Vorschau'
  },
  'form.downloadXML': {
    en: 'Download XML',
    de: 'XML herunterladen'
  },
  'form.createPDFSubmit': {
    en: 'Create PDF & Submit',
    de: 'PDF erstellen & übermitteln'
  },
  'invoiceMode': {
    en: 'Invoice Mode',
    de: 'Rechnungsmodus'
  },
  'selectMode': {
    en: 'Select Mode',
    de: 'Modus wählen'
  },
  'table.material': {
    en: 'Material',
    de: 'Material'
  },
  'table.quantity': {
    en: 'Quantity',
    de: 'Menge'
  },
  'table.unit': {
    en: 'Unit',
    de: 'Einheit'
  },
  'table.price': {
    en: 'Price (€)',
    de: 'Preis (€)'
  },
  'table.taxRate': {
    en: 'Tax Rate (%)',
    de: 'Steuersatz (%)'
  },
  'table.total': {
    en: 'Total',
    de: 'Gesamt'
  },
  'table.actions': {
    en: 'Actions',
    de: 'Aktionen'
  },
  'placeholder.selectMaterial': {
    en: 'Select material',
    de: 'Material auswählen'
  },
  'placeholder.enterUnit': {
    en: 'Enter unit',
    de: 'Einheit eingeben'
  },
  'placeholder.enterPrice': {
    en: 'Enter price',
    de: 'Preis eingeben'
  },
  'placeholder.enterQuantity': {
    en: 'Enter quantity',
    de: 'Menge eingeben'
  },
  'placeholder.enterTaxRate': {
    en: 'Enter tax rate',
    de: 'Steuersatz eingeben'
  },
  'placeholder.selectVendor': {
    en: 'Select vendor',
    de: 'Lieferant auswählen'
  },
  'placeholder.selectRecipient': {
    en: 'Select recipient',
    de: 'Empfänger auswählen'
  },
  'placeholder.paymentTerms': {
    en: 'Enter payment terms',
    de: 'Zahlungsbedingungen eingeben'
  },
  'buttons.addItem': {
    en: 'Add Item',
    de: 'Position hinzufügen'
  },
  'buttons.addNew': {
    en: 'Add New',
    de: 'Neu hinzufügen'
  },
  'summary.totalItems': {
    en: 'Total Items',
    de: 'Positionen gesamt'
  },
  'summary.totalAmount': {
    en: 'Total Amount',
    de: 'Gesamtbetrag'
  },
  'form.paymentTerms': {
    en: 'Payment Terms',
    de: 'Zahlungsbedingungen'
  },
  'sort.newestFirst': {
    en: 'Newest First',
    de: 'Neueste zuerst'
  },
  'view.pdfPreview': {
    en: 'PDF Preview',
    de: 'PDF-Vorschau'
  },
  'view.downloadXML': {
    en: 'Download XML',
    de: 'XML herunterladen'
  },
  'login.welcomeBack': {
    en: 'Welcome Back!',
    de: 'Willkommen zurück!'
  },
  'login.pleaseEnter': {
    en: 'Please enter your credentials to access your account',
    de: 'Bitte geben Sie Ihre Zugangsdaten ein, um auf Ihr Konto zuzugreifen'
  },
  'login.title': {
    en: 'Login',
    de: 'Anmelden'
  },
  // Bulk Material Creation
  'material.createBulk': {
    en: 'Create Multiple Materials',
    de: 'Mehrere Materialien erstellen'
  },
  'material.createSingleDescription': {
    en: 'Create one material with guided form',
    de: 'Ein Material mit geführtem Formular erstellen'
  },
  'material.createBulkDescription': {
    en: 'Create multiple materials at once using the table interface. Add rows, generate demo data, or import from CSV.',
    de: 'Erstellen Sie mehrere Materialien auf einmal mit der Tabellen-Oberfläche. Zeilen hinzufügen, Demo-Daten generieren oder CSV importieren.'
  },
  'material.createBulkShortDescription': {
    en: 'Create 1-50 materials with table interface',
    de: '1-50 Materialien mit Tabellen-Interface erstellen'
  },
  'material.materials': {
    en: 'materials',
    de: 'Materialien'
  },
  'buttons.addRow': {
    en: 'Add Row',
    de: 'Zeile hinzufügen'
  },
  'buttons.deleteAll': {
    en: 'Delete All',
    de: 'Alle löschen'
  },
  'buttons.generateDemo': {
    en: 'Generate Demo',
    de: 'Demo generieren'
  },
  'validation.atLeastOneMaterial': {
    en: 'At least one material is required',
    de: 'Mindestens ein Material ist erforderlich'
  },
  'validation.maxMaterialsExceeded': {
    en: 'Maximum 50 materials allowed per bulk operation',
    de: 'Maximal 50 Materialien pro Bulk-Vorgang erlaubt'
  },
  'validation.duplicateMaterialNumber': {
    en: 'Material number already exists in this list',
    de: 'Materialnummer existiert bereits in dieser Liste'
  },
  'success.bulkMaterialsCreated': {
    en: 'Successfully created {0} materials',
    de: '{0} Materialien erfolgreich erstellt'
  },
  'success.bulkDemoDataGenerated': {
    en: 'Generated {0} demo materials with intelligent data',
    de: '{0} Demo-Materialien mit intelligenten Daten generiert'
  },
  'warning.partialBulkSuccess': {
    en: '{0} materials failed to create. Check the table for details.',
    de: '{0} Materialien konnten nicht erstellt werden. Überprüfen Sie die Tabelle für Details.'
  },
  // CSV Import
  'buttons.importCSV': {
    en: 'Import CSV',
    de: 'CSV importieren'
  },
  'buttons.downloadTemplate': {
    en: 'Template',
    de: 'Vorlage'
  },
  'buttons.importMaterials': {
    en: 'Import {0} Materials',
    de: '{0} Materialien importieren'
  },
  'csv.previewTitle': {
    en: 'CSV Import Preview',
    de: 'CSV Import Vorschau'
  },
  'csv.previewDescription': {
    en: 'Found {0} materials in the CSV file. Review and confirm import.',
    de: '{0} Materialien in der CSV-Datei gefunden. Überprüfen und Import bestätigen.'
  },
  'csv.importWarning': {
    en: 'Please verify that tax codes and units match your system configuration before importing.',
    de: 'Bitte überprüfen Sie, dass Steuercodes und Einheiten zu Ihrer Systemkonfiguration passen.'
  },
  'csv.showingFirst20': {
    en: 'Showing first 20 of {0} materials',
    de: 'Zeige erste 20 von {0} Materialien'
  },
  'success.csvImported': {
    en: 'Successfully imported {0} materials from CSV',
    de: '{0} Materialien erfolgreich aus CSV importiert'
  },
  // AI Prompt
  'buttons.aiPrompt': {
    en: 'AI Prompt',
    de: 'KI-Prompt'
  },
  'buttons.generating': {
    en: 'Generating...',
    de: 'Generiere...'
  },
  'ai.promptTitle': {
    en: 'AI Material Generator',
    de: 'KI Material Generator'
  },
  'ai.promptDescription': {
    en: 'Describe what materials you need and the AI will generate them for you.',
    de: 'Beschreiben Sie welche Materialien Sie benötigen und die KI wird sie für Sie generieren.'
  },
  'ai.promptPlaceholder': {
    en: 'e.g. "Create 5 consulting services for web development between 80-200€"',
    de: 'z.B. "Erstelle 5 Beratungsdienstleistungen für Webentwicklung zwischen 80-200€"'
  },
  'ai.examplePrompts': {
    en: 'Example prompts:',
    de: 'Beispiel-Prompts:'
  },
  'success.aiPromptGenerated': {
    en: 'Successfully generated {0} materials from AI prompt',
    de: '{0} Materialien erfolgreich aus KI-Prompt generiert'
  },
  'login.username': {
    en: 'Username',
    de: 'Benutzername'
  },
  'login.password': {
    en: 'Password',
    de: 'Passwort'
  },
  'login.usernamePlaceholder': {
    en: 'your username',
    de: 'Ihr Benutzername'
  },
  'login.passwordPlaceholder': {
    en: '••••••••',
    de: '••••••••'
  },
  'login.submit': {
    en: 'Login',
    de: 'Anmelden'
  },
  'template.standards': {
    en: 'Standards',
    de: 'Standards'
  },
  'status.saved': {
    en: 'Saved',
    de: 'Gespeichert'
  },
  'status.saving': {
    en: 'Saving',
    de: 'Speichern'
  },
  'status.loading': {
    en: 'Loading',
    de: 'Laden'
  },
  'validation.required': {
    en: 'This field is required',
    de: 'Dieses Feld ist erforderlich'
  },
  'validation.invalidFormat': {
    en: 'Invalid format',
    de: 'Ungültiges Format'
  },
  'validation.materialNumberRequired': {
    en: 'Material number is required',
    de: 'Materialnummer ist erforderlich'
  },
  'validation.descriptionRequired': {
    en: 'Description is required',
    de: 'Beschreibung ist erforderlich'
  },
  'validation.taxCodeRequired': {
    en: 'Tax code is required',
    de: 'Steuercode ist erforderlich'
  },
  'validation.unitRequired': {
    en: 'Unit is required',
    de: 'Einheit ist erforderlich'
  },
  'validation.netAmountPositive': {
    en: 'Net amount must be positive',
    de: 'Nettobetrag muss positiv sein'
  },
  'validation.currencyRequired': {
    en: 'Currency is required',
    de: 'Währung ist erforderlich'
  },
  'validation.typeRequired': {
    en: 'Type is required',
    de: 'Typ ist erforderlich'
  },
  'validation.companyNameRequired': {
    en: 'Company name is required',
    de: 'Firmenname ist erforderlich'
  },
  'validation.companyCodeInvalid': {
    en: 'Company code must be 1000, 2000, or 3000',
    de: 'Firmencode muss 1000, 2000 oder 3000 sein'
  },
  'validation.companyCodeRequired': {
    en: 'Company code is required',
    de: 'Firmencode ist erforderlich'
  },
  'validation.emailInvalid': {
    en: 'Please enter a valid email address',
    de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
  },
  'validation.streetRequired': {
    en: 'Street is required',
    de: 'Straße ist erforderlich'
  },
  'validation.zipRequired': {
    en: 'ZIP code is required',
    de: 'Postleitzahl ist erforderlich'
  },
  'validation.cityRequired': {
    en: 'City is required',
    de: 'Stadt ist erforderlich'
  },
  'validation.countryRequired': {
    en: 'Country is required',
    de: 'Land ist erforderlich'
  },
  'validation.poZipRequired': {
    en: 'PO ZIP is required',
    de: 'Postfach PLZ ist erforderlich'
  },
  'validation.vatNumberRequired': {
    en: 'VAT number is required',
    de: 'USt-IdNr. ist erforderlich'
  },
  'validation.bankNameRequired': {
    en: 'Bank name is required',
    de: 'Bankname ist erforderlich'
  },
  'validation.ibanRequired': {
    en: 'IBAN is required',
    de: 'IBAN ist erforderlich'
  },
  'validation.bicRequired': {
    en: 'BIC is required',
    de: 'BIC ist erforderlich'
  },
  'validation.recipientIdRequired': {
    en: 'Recipient ID is required',
    de: 'Empfänger-ID ist erforderlich'
  },
  'template.label': {
    en: 'Template',
    de: 'Template'
  },
  'template.select': {
    en: 'Select template',
    de: 'Template wählen'
  },
  'date.today': {
    en: 'Today',
    de: 'Heute'
  },
  'date.yesterday': {
    en: 'Yesterday',
    de: 'Gestern'
  },
  'date.days': {
    en: 'days',
    de: 'Tage'
  },
  'logo.defaultName': {
    en: 'Logo',
    de: 'Logo'
  },
  'logo.noLogosAvailable': {
    en: 'No logos available',
    de: 'Keine Logos verfügbar'
  },
  'logo.clickAddNewToStart': {
    en: 'Click "Add New" to get started',
    de: 'Klicken Sie auf "Neu hinzufügen", um zu beginnen'
  },
  'logo.addNewLogo': {
    en: 'Add New Logo',
    de: 'Neues Logo hinzufügen'
  },
  'logo.uploadLogo': {
    en: 'Upload Logo',
    de: 'Logo hochladen'
  },
  'logo.createFromTemplate': {
    en: 'Create from Template',
    de: 'Aus Vorlage erstellen'
  },
  'logo.dropHere': {
    en: 'Drop your logo here',
    de: 'Logo hier ablegen'
  },
  'logo.dragAndDrop': {
    en: 'Drag and drop your logo here',
    de: 'Ziehen Sie Ihr Logo hierher'
  },
  'logo.editLogo': {
    en: 'Edit Logo',
    de: 'Logo bearbeiten'
  },
  'success.logoSaved': {
    en: 'Logo saved successfully',
    de: 'Logo erfolgreich gespeichert'
  },
  'success.logoAddedToLibrary': {
    en: 'Your logo has been added to the library',
    de: 'Ihr Logo wurde zur Bibliothek hinzugefügt'
  },
  'success.logoDeleted': {
    en: 'Logo deleted',
    de: 'Logo gelöscht'
  },
  'success.logoRemovedFromLibrary': {
    en: 'Logo has been removed from the library',
    de: 'Logo wurde aus der Bibliothek entfernt'
  },
  'success.nameUpdated': {
    en: 'Name updated',
    de: 'Name aktualisiert'
  },
  'success.logoNameUpdated': {
    en: 'Logo name has been updated successfully',
    de: 'Logo-Name wurde erfolgreich aktualisiert'
  },
  'errors.uploadFailed': {
    en: 'Upload failed',
    de: 'Upload fehlgeschlagen'
  },
  'errors.failedToUpload': {
    en: 'Failed to upload logo',
    de: 'Logo konnte nicht hochgeladen werden'
  },
  'errors.savingLogo': {
    en: 'Error saving logo',
    de: 'Fehler beim Speichern des Logos'
  },
  'errors.failedToProcessDimensions': {
    en: 'Failed to process image dimensions',
    de: 'Bilddimensionen konnten nicht verarbeitet werden'
  },
  'confirm.deleteLogo': {
    en: 'Are you sure you want to delete this logo?',
    de: 'Sind Sie sicher, dass Sie dieses Logo löschen möchten?'
  },
  'confirm.deleteVersion': {
    en: 'Are you sure you want to delete this version?',
    de: 'Sind Sie sicher, dass Sie diese Version löschen möchten?'
  },
  'confirm.deleteItem': {
    en: 'Are you sure you want to delete this item?',
    de: 'Sind Sie sicher, dass Sie dieses Element löschen möchten?'
  },
  'confirm.clearAll': {
    en: 'Are you sure you want to clear all data?',
    de: 'Sind Sie sicher, dass Sie alle Daten löschen möchten?'
  },
  'confirm.title': {
    en: 'Confirm Action',
    de: 'Aktion bestätigen'
  },
  'sort.byName': {
    en: 'By Name',
    de: 'Nach Name'
  },
  'placeholder.searchLogos': {
    en: 'Search logos...',
    de: 'Logos suchen...'
  },
  'placeholder.sortBy': {
    en: 'Sort by',
    de: 'Sortieren nach'
  },
  'buttons.selectFile': {
    en: 'Select File',
    de: 'Datei auswählen'
  },
  'status.uploading': {
    en: 'Uploading...',
    de: 'Wird hochgeladen...'
  },
  'login.enterCredentials': {
    en: 'Please enter your credentials to access your account',
    de: 'Bitte geben Sie Ihre Anmeldedaten ein, um auf Ihr Konto zuzugreifen'
  },
  'login.success': {
    en: 'Login successful',
    de: 'Anmeldung erfolgreich'
  },
  'login.failed': {
    en: 'Login failed',
    de: 'Anmeldung fehlgeschlagen'
  },
  'login.invalidCredentials': {
    en: 'Invalid username or password',
    de: 'Ungültiger Benutzername oder Passwort'
  },
  'login.errorOccurred': {
    en: 'An error occurred during login',
    de: 'Bei der Anmeldung ist ein Fehler aufgetreten'
  },
  'login.laptopImageAlt': {
    en: 'Laptop',
    de: 'Laptop'
  },
  'common.error': {
    en: 'Error',
    de: 'Fehler'
  },
  'login.loggingIn': {
    en: 'Logging in...',
    de: 'Anmeldung läuft...'
  },
  'login.loginButton': {
    en: 'Login',
    de: 'Anmelden'
  },

  'vendor.field.vatNumber': {
    en: 'VAT Number',
    de: 'USt-IdNr.'
  },
  'vendor.field.phone': {
    en: 'Phone (Optional)',
    de: 'Telefon (Optional)'
  },
  'vendor.field.website': {
    en: 'Website (Optional)',
    de: 'Website (Optional)'
  },
  'vendor.field.bankDetails': {
    en: 'Bank Details',
    de: 'Bankdaten'
  },
  'vendor.field.bankName': {
    en: 'Bank Name',
    de: 'Bankname'
  },
  'vendor.field.iban': {
    en: 'IBAN',
    de: 'IBAN'
  },
  'vendor.field.bic': {
    en: 'BIC',
    de: 'BIC'
  },
  'vendor.placeholder.vatNumber': {
    en: 'Enter VAT number',
    de: 'USt-IdNr. eingeben'
  },
  'vendor.placeholder.phone': {
    en: 'Enter phone number',
    de: 'Telefonnummer eingeben'
  },
  'vendor.placeholder.website': {
    en: 'Enter website URL',
    de: 'Webseite URL eingeben'
  },
  'vendor.placeholder.bankName': {
    en: 'Enter bank name',
    de: 'Bankname eingeben'
  },
  'vendor.placeholder.iban': {
    en: 'Enter IBAN',
    de: 'IBAN eingeben'
  },
  'vendor.placeholder.bic': {
    en: 'Enter BIC',
    de: 'BIC eingeben'
  },
  'vendor.enterCompanyName': {
    en: 'Enter company name',
    de: 'Firmenname eingeben'
  },
  'vendor.enterCompanyCode': {
    en: 'Enter company code',
    de: 'Firmencode eingeben'
  },

  'vendor.enterStreet': {
    en: 'Enter street address',
    de: 'Straßenadresse eingeben'
  },
  'vendor.enterZipCode': {
    en: 'Enter ZIP code',
    de: 'Postleitzahl eingeben'
  },
  'vendor.enterCity': {
    en: 'Enter city',
    de: 'Stadt eingeben'
  },
  'vendor.enterCountry': {
    en: 'Enter country',
    de: 'Land eingeben'
  },

  'vendor.poZip': {
    en: 'PO ZIP',
    de: 'Postfach PLZ'
  },
  'vendor.enterPoZip': {
    en: 'Enter PO ZIP',
    de: 'Postfach PLZ eingeben'
  },
  'vendor.enterVatNumber': {
    en: 'Enter VAT number',
    de: 'USt-IdNr. eingeben'
  },
  'vendor.enterPhone': {
    en: 'Enter phone number',
    de: 'Telefonnummer eingeben'
  },
  'vendor.enterWebsite': {
    en: 'Enter website URL',
    de: 'Webseite URL eingeben'
  },
  'vendor.enterBankName': {
    en: 'Enter bank name',
    de: 'Bankname eingeben'
  },
  'vendor.enterIban': {
    en: 'Enter IBAN',
    de: 'IBAN eingeben'
  },
  'vendor.enterBic': {
    en: 'Enter BIC',
    de: 'BIC eingeben'
  },
  'common.optional': {
    en: 'Optional',
    de: 'Optional'
  },
  'common.reset': {
    en: 'Reset',
    de: 'Zurücksetzen'
  },
  'editor.size': {
    en: 'Size',
    de: 'Größe'
  },
  'editor.brightness': {
    en: 'Brightness',
    de: 'Helligkeit'
  },
  'editor.contrast': {
    en: 'Contrast',
    de: 'Kontrast'
  },
  'creator.template': {
    en: 'Template',
    de: 'Vorlage'
  },
  'creator.companyName': {
    en: 'Company Name',
    de: 'Firmenname'
  },
  'creator.addElements': {
    en: 'Add Elements',
    de: 'Elemente hinzufügen'
  },
  'creator.elements': {
    en: 'Elements',
    de: 'Elemente'
  },
  'creator.properties': {
    en: 'Properties',
    de: 'Eigenschaften'
  },
  'creator.text': {
    en: 'Text',
    de: 'Text'
  },
  'creator.font': {
    en: 'Font',
    de: 'Schrift'
  },
  'creator.color': {
    en: 'Color',
    de: 'Farbe'
  },
  'creator.fillType': {
    en: 'Fill Type',
    de: 'Fülltyp'
  },
  'creator.solidColor': {
    en: 'Solid Color',
    de: 'Vollfarbe'
  },
  'creator.gradient': {
    en: 'Gradient',
    de: 'Farbverlauf'
  },
  'creator.gradientColors': {
    en: 'Gradient Colors',
    de: 'Verlaufsfarben'
  },
  'creator.lineThickness': {
    en: 'Line Thickness',
    de: 'Linienstärke'
  },
  'creator.rotation': {
    en: 'Rotation',
    de: 'Drehung'
  },
  'creator.opacity': {
    en: 'Opacity',
    de: 'Deckkraft'
  },
  'creator.preview': {
    en: 'Preview',
    de: 'Vorschau'
  },
  'creator.background': {
    en: 'Background',
    de: 'Hintergrund'
  },
  'dashboard.totalInvoices': {
    en: 'Total Invoices',
    de: 'Rechnungen gesamt'
  },
  'dashboard.pendingAmount': {
    en: 'Pending Amount',
    de: 'Ausstehender Betrag'
  },
  'dashboard.invoiceCount': {
    en: 'Invoice Count',
    de: 'Rechnungsanzahl'
  },
  'dashboard.revenueOverview': {
    en: 'Revenue Overview',
    de: 'Umsatzübersicht'
  },
  'dashboard.recentInvoices': {
    en: 'Recent Invoices',
    de: 'Neueste Rechnungen'
  },
  'form.description': {
    en: 'Description',
    de: 'Beschreibung'
  },
  'recipient.createNew': {
    en: 'Create New Recipient',
    de: 'Neuen Empfänger erstellen'
  },
  'recipient.id': {
    en: 'Recipient ID',
    de: 'Empfänger-ID'
  },
  'recipient.companyCode': {
    en: 'Company Code',
    de: 'Firmencode'
  },
  'recipient.companyName': {
    en: 'Company Name',
    de: 'Firmenname'
  },
  'recipient.street': {
    en: 'Street',
    de: 'Straße'
  },
  'recipient.zipCode': {
    en: 'ZIP Code',
    de: 'Postleitzahl'
  },
  'recipient.city': {
    en: 'City',
    de: 'Stadt'
  },
  'recipient.country': {
    en: 'Country',
    de: 'Land'
  },
  'recipient.phone': {
    en: 'Phone',
    de: 'Telefon'
  },
  'recipient.email': {
    en: 'Email',
    de: 'E-Mail'
  },
  'recipient.vatNumber': {
    en: 'VAT Number',
    de: 'USt-IdNr.'
  },
  'recipient.enterPhone': {
    en: 'Enter phone number',
    de: 'Telefonnummer eingeben'
  },
  'recipient.enterEmail': {
    en: 'Enter email address',
    de: 'E-Mail-Adresse eingeben'
  },
  'recipient.enterVatNumber': {
    en: 'Enter VAT number',
    de: 'USt-IdNr. eingeben'
  },

  'buttons.createRecipient': {
    en: 'Create Recipient',
    de: 'Empfänger erstellen'
  },
  'vendor.createNew': {
    en: 'Create New Vendor',
    de: 'Neuen Lieferanten erstellen'
  },
  'vendor.createDescription': {
    en: 'Add a new vendor to the system. Fill in all required information including company and bank details.',
    de: 'Fügen Sie einen neuen Lieferanten zum System hinzu. Füllen Sie alle erforderlichen Informationen einschließlich Firmen- und Bankdaten aus.'
  },
  'form.mode.mm': {
    en: 'MM',
    de: 'MM'
  },
  'form.mode.fi': {
    en: 'FI',
    de: 'FI'
  },
  'dialog.createRecipient': {
    en: 'Create Recipient',
    de: 'Empfänger erstellen'
  },
  'dialog.createVendor': {
    en: 'Create Vendor',
    de: 'Lieferant erstellen'
  },
  'dialog.createMaterial': {
    en: 'Create New Material',
    de: 'Neues Material erstellen'
  },
  // Template Übersetzungen
  'template.title': {
    en: 'Template',
    de: 'Vorlage'
  },
  'template.businessGreen': {
    en: 'Business Green',
    de: 'Business Grün'
  },
  'template.allrauer': {
    en: 'Allrauer',
    de: 'Allrauer'
  },
  // CreateMaterial Übersetzungen
  'createMaterial.title': {
    en: 'Create New Material',
    de: 'Neues Material erstellen'
  },
  'createMaterial.description': {
    en: 'Add a new material to the system. Fill in all required information including pricing and tax details.',
    de: 'Fügen Sie ein neues Material zum System hinzu. Füllen Sie alle erforderlichen Informationen einschließlich Preis- und Steuerdetails aus.'
  },
  'createMaterial.materialNumber': {
    en: 'Material Number',
    de: 'Materialnummer'
  },
  'createMaterial.enterMaterialNumber': {
    en: 'Enter material number',
    de: 'Materialnummer eingeben'
  },
  'createMaterial.descriptionLabel': {
    en: 'Description',
    de: 'Beschreibung'
  },
  'createMaterial.enterDescription': {
    en: 'Enter description',
    de: 'Beschreibung eingeben'
  },
  'createMaterial.taxCode': {
    en: 'Tax Code',
    de: 'Steuerschlüssel'
  },
  'createMaterial.enterTaxCode': {
    en: 'Enter tax code',
    de: 'Steuerschlüssel eingeben'
  },
  'createMaterial.taxRate': {
    en: 'Tax Rate (%)',
    de: 'Steuersatz (%)'
  },
  'createMaterial.enterTaxRate': {
    en: 'Enter tax rate',
    de: 'Steuersatz eingeben'
  },
  'createMaterial.unit': {
    en: 'Unit',
    de: 'Einheit'
  },
  'createMaterial.enterUnit': {
    en: 'Enter unit',
    de: 'Einheit eingeben'
  },
  'createMaterial.netAmount': {
    en: 'Net Amount',
    de: 'Nettobetrag'
  },
  'createMaterial.enterNetAmount': {
    en: 'Enter net amount',
    de: 'Nettobetrag eingeben'
  },
  'createMaterial.cancel': {
    en: 'Cancel',
    de: 'Abbrechen'
  },
  'createMaterial.createMaterial': {
    en: 'Create Material',
    de: 'Material erstellen'
  },
    // CreateRecipient Übersetzungen
  'recipient.createDescription': {
    en: 'Add a new recipient to the system. Fill in all required information for delivery and invoicing.',
    de: 'Fügen Sie einen neuen Empfänger zum System hinzu. Füllen Sie alle erforderlichen Informationen für Lieferung und Rechnungsstellung aus.'
  },

  'recipient.enterRecipientId': {
    en: 'Enter recipient ID',
    de: 'Empfänger-ID eingeben'
  },
  'recipient.enterCompanyCode': {
    en: 'Enter company code',
    de: 'Firmencode eingeben'
  },
  'recipient.enterCompanyName': {
    en: 'Enter company name',
    de: 'Firmenname eingeben'
  },
  'recipient.enterStreet': {
    en: 'Enter street address',
    de: 'Straßenadresse eingeben'
  },
  'recipient.enterZipCode': {
    en: 'Enter ZIP code',
    de: 'Postleitzahl eingeben'
  },
  'recipient.enterCity': {
    en: 'Enter city',
    de: 'Stadt eingeben'
  },
  'recipient.enterCountry': {
    en: 'Enter country',
    de: 'Land eingeben'
  },

  // Allrauer Template Translations
  'allrauer.invoice': {
    en: 'Invoice',
    de: 'Rechnung'
  },
  'allrauer.invoiceNumber': {
    en: 'Invoice No.',
    de: 'RechnungsNr.'
  },
  'allrauer.invoiceDate': {
    en: 'Invoice Date',
    de: 'Rechnungsdatum'
  },
  'allrauer.deliveryNoteNumber': {
    en: 'Delivery Note No.',
    de: 'LieferscheinNr.'
  },
  'allrauer.deliveryDate': {
    en: 'Delivery Date',
    de: 'Lieferdatum'
  },
  'allrauer.orderDate': {
    en: 'Order Date',
    de: 'Auftragsdatum'
  },
  'allrauer.customerNumber': {
    en: 'Customer Number',
    de: 'Ihre Kundennummer'
  },
  'allrauer.orderNumber': {
    en: 'Order Number',
    de: 'Ihre Bestellnummer'
  },
  'allrauer.vatId': {
    en: 'VAT ID',
    de: 'Ihre USTID'
  },
  'allrauer.processor': {
    en: 'Processor',
    de: 'Ihr Bearbeiter'
  },
  'allrauer.termsText1': {
    en: 'For all trade transactions, our terms and conditions listed on the reverse side apply. Delivery times are non-binding!',
    de: 'Für alle Warenhandelsgeschäfte gelten unsere umseitig aufgeführten AGB. Lieferzeiten sind unverbindliche Angaben!'
  },
  'allrauer.termsText2': {
    en: 'Returns without error description and RMA number cannot be processed!',
    de: 'Rücksendungen ohne Fehlerbeschreibung und RMA. Nummer können nicht bearbeitet werden!'
  },
  'allrauer.termsText3': {
    en: 'Save phone costs now with the ICO tariff manager. Info hotline: 02151 - 371137',
    de: 'Sparen Sie jetzt Telefonkosten mit dem ICO-Tarifmanager. Info-Hotline: 02151 - 371137'
  },
  'allrauer.description': {
    en: 'Description',
    de: 'Bezeichnung'
  },
  'allrauer.quantity': {
    en: 'Quantity',
    de: 'Menge'
  },
  'allrauer.unit': {
    en: 'Unit',
    de: 'Einheit'
  },
  'allrauer.rate': {
    en: 'Rate',
    de: 'Satz'
  },
  'allrauer.unitPrice': {
    en: 'Unit Price',
    de: 'Einzelpreis'
  },
  'allrauer.totalPrice': {
    en: 'Total Price',
    de: 'Gesamtpreis'
  },
  'allrauer.net': {
    en: 'Net',
    de: 'Netto'
  },
  'allrauer.vatRate': {
    en: 'VAT Rate',
    de: 'MwSt-Satz'
  },
  'allrauer.vat': {
    en: 'VAT',
    de: 'MwSt'
  },
  'allrauer.gross': {
    en: 'Gross',
    de: 'Brutto'
  },
  'allrauer.total': {
    en: 'Total',
    de: 'Gesamt'
  },
  'allrauer.paymentText1': {
    en: 'Please transfer the outstanding amount of',
    de: 'Überweisen Sie bitte den ausstehenden Betrag von'
  },
  'allrauer.paymentText2': {
    en: 'to one of the accounts listed below.',
    de: 'auf eins der unten angegebenen Konten.'
  },
  'allrauer.bankConnections': {
    en: 'Bank Connections',
    de: 'Bankverbindungen'
  },
  'placeholder.selectTaxCode': {
    en: 'Select tax code',
    de: 'Steuercode auswählen'
  },
  'placeholder.selectUnit': {
    en: 'Select unit',
    de: 'Einheit auswählen'
  },
  'form.taxCode': {
    en: 'Tax Code',
    de: 'Steuercode'
  },
  'form.createMaterial': {
    en: 'Create Material',
    de: 'Material erstellen'
  },
  'buttons.createMaterial': {
    en: 'Create Material',
    de: 'Material erstellen'
  },
  'buttons.create': {
    en: 'Create',
    de: 'Erstellen'
  },
  'buttons.creating': {
    en: 'Creating...',
    de: 'Erstelle...'
  },
  
  // Material dialog translations
  'material.createNew': {
    en: 'Create New Material',
    de: 'Neues Material erstellen'
  },
  'material.createDescription': {
    en: 'Add a new material to the system. Fill in all required information including material number, description, and pricing details.',
    de: 'Fügen Sie ein neues Material zum System hinzu. Füllen Sie alle erforderlichen Informationen einschließlich Materialnummer, Beschreibung und Preisdetails aus.'
  },
  'material.materialNumber': {
    en: 'Material Number',
    de: 'Materialnummer'
  },
  'material.enterMaterialNumber': {
    en: 'Enter material number',
    de: 'Materialnummer eingeben'
  },
  'material.description': {
    en: 'Description',
    de: 'Beschreibung'
  },
  'material.enterDescription': {
    en: 'Enter description',
    de: 'Beschreibung eingeben'
  },
  'material.taxCode': {
    en: 'Tax Code',
    de: 'Steuercode'
  },
  'material.unit': {
    en: 'Unit',
    de: 'Einheit'
  },
  'material.netAmount': {
    en: 'Net Amount',
    de: 'Nettobetrag'
  },
  'material.companyCode': {
    en: 'Company Code',
    de: 'Unternehmenscode'
  },
  'material.selectCompanyCode': {
    en: 'Select Company Code',
    de: 'Unternehmenscode auswählen'
  },
  'material.enterNetAmount': {
    en: 'Enter net amount',
    de: 'Nettobetrag eingeben'
  },
  // Logo related translations
  'logo.settings': {
    en: 'Logo Settings',
    de: 'Logo-Einstellungen'
  },
  'logo.adjust': {
    en: 'Adjust Logo',
    de: 'Logo anpassen'
  },
  'logo.position': {
    en: 'Position',
    de: 'Position'
  },
  'logo.size': {
    en: 'Size',
    de: 'Größe'
  },
  'logo.alignment.left': {
    en: 'Left',
    de: 'Links'
  },
  'logo.alignment.center': {
    en: 'Center',
    de: 'Mitte'
  },
  'logo.alignment.right': {
    en: 'Right',
    de: 'Rechts'
  },
  'logo.size.small': {
    en: 'Small',
    de: 'Klein'
  },
  'logo.size.normal': {
    en: 'Normal',
    de: 'Normal'
  },
  'logo.quickSettings': {
    en: 'Quick Settings',
    de: 'Schnell-Einstellungen'
  },
  'logo.adjustSize': {
    en: 'Adjust Size',
    de: 'Größe anpassen'
  },
  'logo.width': {
    en: 'Width',
    de: 'Breite'
  },
  'logo.height': {
    en: 'Height',
    de: 'Höhe'
  },
      'logo.currentValues': {
      en: 'Current Values',
      de: 'Aktuelle Werte'
    },
  'form.basicinformation': {
    en: 'Basic Information',
    de: 'Grundinformationen'
  },
  'form.basicInformation': {
    en: 'Basic Information',
    de: 'Grundinformationen'
  },
  'versions.title': {
    en: 'Versions',
    de: 'Versionen'
  },
  'buttons.newdocument': {
    en: 'New Document',
    de: 'Neues Dokument'
  },
  'buttons.newDocument': {
    en: 'New Document',
    de: 'Neues Dokument'
  },
  'pdf.preview': {
    en: 'PDF Preview',
    de: 'PDF-Vorschau'
  },
  'pdf.zoomIn': {
    en: 'Zoom In',
    de: 'Vergrößern'
  },
  'pdf.zoomOut': {
    en: 'Zoom Out',
    de: 'Verkleinern'
  },
  'pdf.minimize': {
    en: 'Minimize',
    de: 'Verkleinern'
  },
  'pdf.fullscreen': {
    en: 'Fullscreen',
    de: 'Vollbild'
  },
  'pdf.open': {
    en: 'Open PDF',
    de: 'PDF öffnen'
  },
  'pdf.download': {
    en: 'Download',
    de: 'Herunterladen'
  },
  'logo.selectTemplate': {
    en: 'Select template',
    de: 'Template auswählen'
  },
  'logo.enterCompanyName': {
    en: 'Enter company name',
    de: 'Firmenname eingeben'
  },
  'logo.selectFont': {
    en: 'Select font',
    de: 'Schriftart auswählen'
  },
  'logo.selectFillType': {
    en: 'Select fill type',
    de: 'Fülltyp auswählen'
  }
};

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    // Set global language for PDF templates
    (globalThis as any).currentLanguage = currentLanguage;
  }, [currentLanguage]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'de' : 'en');
  };

  const t = (key: string, options?: { defaultValue?: string }): string => {
    if (translations[key]?.[currentLanguage]) {
      return translations[key][currentLanguage];
    }
    return options?.defaultValue || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage,
      setLanguage, 
      toggleLanguage,
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
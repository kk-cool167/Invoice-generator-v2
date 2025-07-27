import { Dispatch, SetStateAction } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { CreateBulkMaterials } from './CreateBulkMaterials';
import { CreateVendor } from './CreateVendor';
import { CreateRecipient } from './CreateRecipient';
import FormVersions from './FormVersions';
import { useLanguage } from '@/context/LanguageContext';
import { type Material, type Vendor, type Recipient } from '../lib/api';

interface InvoiceFormModalsProps {
  isBulkMaterialModalOpen: boolean;
  setIsBulkMaterialModalOpen: Dispatch<SetStateAction<boolean>>;
  isVendorModalOpen: boolean;
  setIsVendorModalOpen: Dispatch<SetStateAction<boolean>>;
  isCreditorModalOpen: boolean;
  setIsCreditorModalOpen: Dispatch<SetStateAction<boolean>>;
  isVersionsModalOpen: boolean;
  setIsVersionsModalOpen: Dispatch<SetStateAction<boolean>>;
  isConfirmDialogOpen: boolean;
  setIsConfirmDialogOpen: Dispatch<SetStateAction<boolean>>;
  isLoadingVersion: boolean;
  materials: Material[];
  vendors: Vendor[];
  recipients: Recipient[];
  versions: any[];
  loadVersion: (timestamp: number) => any;
  deleteVersion: (timestamp: number) => void;
  renameVersion: (timestamp: number, newName: string) => void;
  clearVersions: () => void;
  lastSaved: number | null;
  saveForm: () => void;
  saveNamed: (name: string) => void;
  onSuccess?: () => void;
  onConfirmSubmit?: () => void;
}

export function InvoiceFormModals({
  isBulkMaterialModalOpen,
  setIsBulkMaterialModalOpen,
  isVendorModalOpen,
  setIsVendorModalOpen,
  isCreditorModalOpen,
  setIsCreditorModalOpen,
  isVersionsModalOpen,
  setIsVersionsModalOpen,
  isConfirmDialogOpen,
  setIsConfirmDialogOpen,
  isLoadingVersion,
  materials,
  vendors,
  recipients,
  versions,
  loadVersion,
  deleteVersion,
  renameVersion,
  clearVersions,
  lastSaved,
  saveForm,
  saveNamed,
  onSuccess,
  onConfirmSubmit,
}: InvoiceFormModalsProps) {
  const { t } = useLanguage();

  const handleModalClose = (
    modalSetter: Dispatch<SetStateAction<boolean>>,
    ...otherSetters: Dispatch<SetStateAction<boolean>>[]
  ) => {
    return (open: boolean) => {
      if (!open) {
        modalSetter(false);
      } else {
        // Close all other modals when opening this one
        otherSetters.forEach(setter => setter(false));
        setIsConfirmDialogOpen(false);
        modalSetter(true);
      }
    };
  };

  return (
    <>
      {/* Material Creation Modal removed - now handled by Bulk Material Creation */}

      {/* Bulk Material Creation Modal */}
      {isBulkMaterialModalOpen && (
        <CreateBulkMaterials
          onSuccess={() => {
            setIsBulkMaterialModalOpen(false);
            onSuccess?.();
          }}
          onClose={() => setIsBulkMaterialModalOpen(false)}
          existingMaterials={materials}
        />
      )}

      {/* Vendor Creation Modal */}
      <Dialog 
        open={isVendorModalOpen} 
        onOpenChange={handleModalClose(
          setIsVendorModalOpen,
          setIsBulkMaterialModalOpen,
          setIsCreditorModalOpen,
          setIsVersionsModalOpen
        )}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="vendor-dialog-description">
          <DialogHeader>
            <DialogTitle>{t('create.vendor')}</DialogTitle>
          </DialogHeader>
          <div id="vendor-dialog-description" className="sr-only">
            Dialog to create a new vendor with company information, contact details, and banking information
          </div>
          <CreateVendor 
            onSuccess={() => {
              setIsVendorModalOpen(false);
              onSuccess?.();
            }}
            onClose={() => setIsVendorModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Recipient Creation Modal */}
      <Dialog 
        open={isCreditorModalOpen} 
        onOpenChange={handleModalClose(
          setIsCreditorModalOpen,
          setIsBulkMaterialModalOpen,
          setIsVendorModalOpen,
          setIsVersionsModalOpen
        )}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="recipient-dialog-description">
          <DialogHeader>
            <DialogTitle>{t('create.recipient')}</DialogTitle>
          </DialogHeader>
          <div id="recipient-dialog-description" className="sr-only">
            Dialog to create a new recipient with company information and contact details
          </div>
          <CreateRecipient 
            onSuccess={() => {
              setIsCreditorModalOpen(false);
              onSuccess?.();
            }}
            onClose={() => setIsCreditorModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Form Versions Modal */}
      <Dialog 
        open={isVersionsModalOpen} 
        onOpenChange={handleModalClose(
          setIsVersionsModalOpen,
          setIsBulkMaterialModalOpen,
          setIsVendorModalOpen,
          setIsCreditorModalOpen
        )}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="versions-dialog-description">
          <DialogHeader>
            <DialogTitle>{t('versions.title')}</DialogTitle>
          </DialogHeader>
          <div id="versions-dialog-description" className="sr-only">
            Dialog to manage saved form versions, including loading, deleting, and renaming versions
          </div>
          <FormVersions
            versions={versions}
            onLoadVersion={loadVersion}
            onDeleteVersion={deleteVersion}
            onRenameVersion={renameVersion}
            onClearAll={clearVersions}
            onSaveNamed={saveNamed}
            onClose={() => setIsVersionsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Database Submission */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby="confirm-dialog-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              {t ? t('confirm.submitToDatabase') : 'In Datenbank speichern?'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p id="confirm-dialog-description" className="text-sm text-gray-600">
              {t ? t('confirm.submitMessage') : 'Möchten Sie das MM-Dokument wirklich in die Datenbank speichern? Diese Aktion kann nicht rückgängig gemacht werden.'}
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setIsConfirmDialogOpen(false)}
              >
                {t ? t('buttons.cancel') : 'Abbrechen'}
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={onConfirmSubmit}
              >
                {t ? t('buttons.confirm') : 'Ja, speichern'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
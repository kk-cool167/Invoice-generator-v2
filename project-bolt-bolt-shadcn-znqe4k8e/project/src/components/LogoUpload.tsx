import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useLogoStore, optimizeImage, validateImage, type Logo } from '@/lib/logoManager';
import { logoTemplates } from '@/lib/logoTemplates';
import { useLanguage } from '@/context/LanguageContext';
import {
  Pencil,
  Trash2,
  ImageIcon,
  Upload,
  Plus,
  Loader2,
  LayoutGrid,
  List,
  Settings,
} from 'lucide-react';
import { LogoCreator } from './LogoCreator';
import { LogoSettings } from './LogoSettings';

interface LogoUploadProps {
  onSuccess: (logo: Logo) => void;
  className?: string;
  onDialogChange?: (isOpen: boolean) => void;
  templateName?: string;
  onLogoConfigChange?: (config: any) => void;
}

type ViewMode = 'grid' | 'list';

export function LogoUpload({ onSuccess, className, onDialogChange, templateName, onLogoConfigChange }: LogoUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [currentLogo, setCurrentLogo] = useState<Logo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { logos, addLogo, removeLogo } = useLogoStore();
  const { t } = useLanguage();

  // Benachrichtige die übergeordnete Komponente, wenn sich der Dialog-Status ändert
  useEffect(() => {
    onDialogChange?.(isOpen);
  }, [isOpen, onDialogChange]);

  // ---------------------------------------------------------------------------
  // Filtering & Sorting
  // ---------------------------------------------------------------------------
  const sortLogos = React.useCallback(
    (logosToSort: Logo[]) => {
      return [...logosToSort].sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.name.localeCompare(b.name);
      });
    },
    [sortBy]
  );

  const filterAndSortLogos = React.useCallback(() => {
    let filtered = logos;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((logo) =>
        logo.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return sortLogos(filtered);
  }, [logos, searchTerm, sortBy, sortLogos]);

  const [filteredLogos, setFilteredLogos] = useState<Logo[]>(logos);

  useEffect(() => {
    const result = filterAndSortLogos();
    setFilteredLogos(result);
    setIsLoading(false);
  }, [filterAndSortLogos]);

  // ---------------------------------------------------------------------------
  // File Upload & Editing
  // ---------------------------------------------------------------------------
  const handleFileSelect = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      validateImage(file);
      const optimizedImage = await optimizeImage(file);
      
      // Direkt speichern ohne Editor
      const img = new Image();
      img.src = optimizedImage.dataUrl;
      
      img.onload = () => {
        const newLogo: Logo = {
          id: Date.now().toString(),
          name: `Logo ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
          content: optimizedImage.dataUrl,
          elements: [],
          backgroundColor: '#ffffff',
          createdAt: new Date().toISOString(),
          size: optimizedImage.dataUrl.length,
          width: img.width,
          height: img.height,
          logoConfig: undefined // Keine Konfiguration, wird in InvoiceForm gesetzt
        };

        addLogo(newLogo);
        setCurrentLogo(newLogo);
        onSuccess(newLogo);
        setIsOpen(false); // Dialog schließen

        toast({
          title: t('success.logoSaved'),
          description: t('success.logoAddedToLibrary'),
        });
      };
      
    } catch (error) {
      toast({
        title: t('errors.uploadFailed'),
        description: error instanceof Error ? error.message : t('errors.failedToUpload'),
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      await handleFileSelect(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: 1,
    multiple: false,
    noClick: true, // We'll handle clicks ourselves
  });

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset the input so user can select the same file again if needed
    event.target.value = '';
  };

  const handleCreateLogo = (logoUrl: string) => {
    // Create a temporary image to get dimensions
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      const newLogo: Logo = {
        id: Date.now().toString(),
        name: `Logo ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
        content: logoUrl,
        elements: [],
        backgroundColor: '#ffffff',
        createdAt: new Date().toISOString(),
        size: logoUrl.length,
        width: img.width,
        height: img.height,
        logoConfig: undefined // Keine Konfiguration, wird in InvoiceForm gesetzt
      };

      addLogo(newLogo);
      setCurrentLogo(newLogo);
      onSuccess(newLogo);
      setIsOpen(false); // Dialog schließen

      toast({
        title: t('success.logoSaved'),
        description: t('success.logoAddedToLibrary'),
      });
    };
  };

  // ---------------------------------------------------------------------------
  // LogoItem Component
  // ---------------------------------------------------------------------------
  const LogoItem = ({ logo }: { logo: Logo }) => {
    const isSelected = selectedLogoId === logo.id;
    const isEditingName = editingName === logo.id;

    return (
      <div
        className={cn(
          'group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border shadow-sm transition-all duration-200',
          'bg-white hover:border-purple-300 hover:shadow-md',
          isSelected ? 'ring-2 ring-purple-400 border-purple-400' : 'border-gray-200'
        )}
        onClick={() => handleLogoSelect(logo)}
        role="button"
        tabIndex={0}
        aria-label={`Select ${logo.name}`}
      >
        <div className="flex items-center justify-center p-2 h-20">
          <img
            src={logo.content}
            alt={logo.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="flex flex-col border-t border-gray-100 bg-white p-2">
          {isEditingName ? (
            <Input
              ref={editInputRef}
              type="text"
              defaultValue={logo.name}
              onBlur={(e) => handleNameEdit(logo, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameEdit(logo, e.currentTarget.value);
                if (e.key === 'Escape') setEditingName(null);
              }}
              className="h-6 text-xs"
              autoFocus
            />
          ) : (
            <span
              className="truncate text-xs font-medium text-gray-700 mb-1"
              onDoubleClick={() => {
                setEditingName(logo.id);
                setTimeout(() => editInputRef.current?.select(), 0);
              }}
              title={logo.name}
            >
              {logo.name}
            </span>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 relative z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentLogo(logo);
                        setIsSettingsOpen(true);
                      }}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="z-[60]">
                    <p>{t('logo.settings')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 relative z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingName(logo.id);
                        setTimeout(() => editInputRef.current?.select(), 0);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="z-[60]">
                    <p>{t('buttons.edit')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:bg-red-100 hover:text-red-600 relative z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLogo(logo.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="z-[60]">
                  <p>{t('buttons.delete')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  };
  
  const handleLogoConfigSave = (updatedLogo: Logo) => {
    onSuccess(updatedLogo);
    setIsSettingsOpen(false);
  }


  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleLogoSelect = (logo: Logo) => {
    setSelectedLogoId(logo.id);
    setCurrentLogo(logo);
    onSuccess(logo);
    
    // Übertrage die logoConfig vom ausgewählten Logo
    if (logo.logoConfig && onLogoConfigChange) {
      onLogoConfigChange(logo.logoConfig);
    } else if (onLogoConfigChange) {
      // Fallback: Standard-Konfiguration für das aktuelle Template (Business Standard kompakter)
      const defaultConfig = {
        maxWidth: templateName === 'businessstandard' ? 240 : 300,
        maxHeight: templateName === 'businessstandard' ? 50 : 60,
        containerWidth: templateName === 'businessstandard' ? 260 : 320,
        containerHeight: templateName === 'businessstandard' ? 60 : 70,
        alignment: templateName === 'allrauer2' ? 'center' : 'right',
        verticalAlignment: 'middle'
      };
      onLogoConfigChange(defaultConfig);
    }
  };

  const handleNameEdit = (logo: Logo, newName: string) => {
    if (newName.trim()) {
      const updatedLogo = { ...logo, name: newName.trim() };
      removeLogo(logo.id);
      addLogo(updatedLogo);

      setEditingName(null);

      // Falls gerade ausgewählt, onSuccess erneut mit neuem Logo
      if (selectedLogoId === logo.id) {
        setCurrentLogo(updatedLogo);
        onSuccess(updatedLogo);
        
        // Übertrage auch die logoConfig beim Umbenennen
        if (updatedLogo.logoConfig && onLogoConfigChange) {
          onLogoConfigChange(updatedLogo.logoConfig);
        }
      }
      toast({
        title: t('success.nameUpdated'),
        description: t('success.logoNameUpdated'),
      });
    } else {
      setEditingName(null);
    }
  };

  const handleRemoveLogo = (id: string) => {
    if (confirm(t('confirm.deleteLogo'))) {
      removeLogo(id);
      if (selectedLogoId === id) {
        setSelectedLogoId(null);
        setCurrentLogo(null);
      }
      toast({
        title: t('success.logoDeleted'),
        description: t('success.logoRemovedFromLibrary'),
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className={className}>
      {/* Header: Label, ViewMode Switch, Add Button */}
      <div className="flex items-center justify-between mb-3">
        <Label className="font-medium">{t('form.logoLibrary')}</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 text-gray-400 hover:text-gray-600',
              viewMode === 'grid' && 'bg-purple-100 text-purple-700'
            )}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 text-gray-400 hover:text-gray-600',
              viewMode === 'list' && 'bg-purple-100 text-purple-700'
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="h-8 bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('buttons.addNew')}
          </Button>
        </div>
      </div>

      {/* Search + Sort */}
      {logos.length > 0 ? (
        <>
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={t('placeholder.searchLogos')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(value: 'date' | 'name') => setSortBy(value)}
            >
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder={t('placeholder.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{t('sort.newestFirst')}</SelectItem>
                <SelectItem value="name">{t('sort.byName')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid/List */}
          <div
            className={cn(
              'grid gap-2',
              viewMode === 'grid'
                ? 'grid-cols-4'
                : 'grid-cols-1'
            )}
          >
            {filteredLogos.map((logo) => (
              <LogoItem key={logo.id} logo={logo} />
            ))}
          </div>
        </>
      ) : isLoading ? (
        // Loading State
        <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Logos werden geladen...</p>
          </div>
        </div>
      ) : (
        // No Logos State
        <div className="flex flex-col items-center justify-center h-[200px] border-2 rounded-lg bg-gray-50 border-dashed border-gray-300">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm font-medium text-gray-600 mb-2">{t('logo.noLogosAvailable')}</p>
          <p className="mt-2 text-center text-sm text-gray-500">
            {t('logo.clickAddNewToStart')}
          </p>
        </div>
      )}

      {/* Add New Logo Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{t('logo.addNewLogo')}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-8rem)]">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">{t('logo.uploadLogo')}</TabsTrigger>
                  <TabsTrigger value="create">{t('logo.createFromTemplate')}</TabsTrigger>
                </TabsList>

                {/* Upload Tab */}
                <TabsContent value="upload" className="mt-4">
                  <div
                    {...getRootProps()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                      isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50',
                      isUploading && 'pointer-events-none opacity-50'
                    )}
                  >
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {isDragActive
                        ? t('logo.dropHere')
                        : isUploading
                        ? t('status.uploading')
                        : t('logo.dragAndDrop')}
                    </p>
                    <input
                      {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)}
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('status.uploading')}
                        </>
                      ) : (
                        t('buttons.selectFile')
                      )}
                    </Button>
                  </div>
                </TabsContent>

                {/* Create from Template Tab */}
                <TabsContent value="create" className="mt-4">
                  <LogoCreator onSuccess={handleCreateLogo} onCancel={() => setIsOpen(false)} />
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('logo.settings')}</DialogTitle>
          </DialogHeader>
          {currentLogo && (
            <LogoSettings
              logoConfig={currentLogo.logoConfig}
              onLogoConfigChange={(newConfig) => {
                const updatedLogo = { ...currentLogo, logoConfig: newConfig };
                setCurrentLogo(updatedLogo);
                handleLogoConfigSave(updatedLogo);
              }}
              templateName={templateName || 'business-standard'}
              showTitle={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { create, type StateCreator } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { type TemplateElement } from './types';

export interface Logo {
  id: string;
  name: string;
  content: string;
  url?: string; // Alias für content - für bessere Kompatibilität
  elements: TemplateElement[];
  backgroundColor: string;
  createdAt: string;
  size: number;
  width: number;
  height: number;
  logoConfig?: any; // PDF-Logo-Konfiguration (Größe, Position, etc.)
}

interface LogoState {
  logos: Logo[];
  recentLogos: Logo[];
}

interface LogoActions {
  addLogo: (logo: Logo) => void;
  removeLogo: (id: string) => void;
  clearLogos: () => void;
}

type LogoStore = LogoState & LogoActions;

type LogoStorePersist = (
  config: StateCreator<LogoStore>,
  options: PersistOptions<LogoStore>
) => StateCreator<LogoStore>;

export const useLogoStore = create<LogoStore>()(
  (persist as unknown as LogoStorePersist)(
    (set) => ({
      logos: [],
      recentLogos: [],
      addLogo: (logo: Logo) =>
        set((state) => ({
          logos: [...state.logos, logo],
          recentLogos: [logo, ...state.recentLogos.slice(0, 4)],
        })),
      removeLogo: (id: string) =>
        set((state) => ({
          logos: state.logos.filter((logo) => logo.id !== id),
          recentLogos: state.recentLogos.filter((logo) => logo.id !== id),
        })),
      clearLogos: () => set({ logos: [], recentLogos: [] }),
    }),
    {
      name: 'logo-storage',
    }
  )
);

export const optimizeImage = async (file: File): Promise<{ dataUrl: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const TARGET_SIZE = 400; // Set a fixed target size for consistency
        let width = img.width;
        let height = img.height;
        
        // Calculate aspect ratio
        const aspectRatio = width / height;
        
        // Adjust dimensions to maintain aspect ratio within target size
        if (aspectRatio > 1) {
          width = TARGET_SIZE;
          height = TARGET_SIZE / aspectRatio;
        } else {
          height = TARGET_SIZE;
          width = TARGET_SIZE * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve({
          dataUrl: canvas.toDataURL('image/png', 0.8),
          width,
          height
        });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

export const validateImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or GIF file.');
  }

  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 5MB.');
  }

  return true;
};
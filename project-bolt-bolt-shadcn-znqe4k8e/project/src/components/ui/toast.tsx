import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'destructive';

export interface ToastProps {
  id?: string;
  type?: ToastType;
  title?: string;
  message?: string;
  duration?: number;
  onClose?: (id: string) => void;
  action?: React.ReactNode;
  variant?: ToastType;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Eine einzelne Toast-Benachrichtigung
 */
export function Toast({
  id = Math.random().toString(36),
  type = 'info',
  title,
  message = '',
  duration = 5000,
  onClose = () => {},
  action,
  variant,
  description,
}: ToastProps) {
  // Use variant as fallback for type
  const actualType = variant || type || 'info';
  const actualMessage = message || description || title || '';
  const [isVisible, setIsVisible] = useState(true);
  
  // Farben und Icons nach Typ
  const typeStyles = {
    success: {
      bgColor: 'bg-green-50 border-green-200',
      iconColor: 'bg-green-100 text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      icon: <Check className="h-4 w-4" />,
    },
    error: {
      bgColor: 'bg-red-50 border-red-200',
      iconColor: 'bg-red-100 text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      icon: <X className="h-4 w-4" />,
    },
    destructive: {
      bgColor: 'bg-red-50 border-red-200',
      iconColor: 'bg-red-100 text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      icon: <AlertCircle className="h-4 w-4" />,
    },
    warning: {
      bgColor: 'bg-amber-50 border-amber-200',
      iconColor: 'bg-amber-100 text-amber-600',
      titleColor: 'text-amber-800',
      messageColor: 'text-amber-700',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    info: {
      bgColor: 'bg-blue-50 border-blue-200',
      iconColor: 'bg-blue-100 text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
      icon: <Info className="h-4 w-4" />,
    },
  };
  
  // Automatisch schließen nach der angegebenen Dauer (außer bei Fehlern)
  useEffect(() => {
    // Fehler-Toasts bleiben länger sichtbar
    const actualDuration = actualType === 'error' ? duration * 2 : duration;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Warte auf Animation, dann schließen
    }, actualDuration);
    
    return () => clearTimeout(timer);
  }, [duration, id, onClose, actualType]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex w-full max-w-md rounded-lg border p-4 shadow-sm',
        typeStyles[actualType].bgColor
      )}
    >
      <div className="flex-shrink-0 mr-3">
        <div className={cn('p-2 rounded-full', typeStyles[actualType].iconColor)}>
          {typeStyles[actualType].icon}
        </div>
      </div>
      
      <div className="flex-1 pr-2">
        {title && (
          <h3 className={cn('text-sm font-medium mb-1', typeStyles[actualType].titleColor)}>
            {title}
          </h3>
        )}
        <p className={cn('text-sm', typeStyles[actualType].messageColor)}>{actualMessage}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
      
      <button 
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-500"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  children: React.ReactNode;
}

/**
 * Container für die Toast-Benachrichtigungen
 */
export function ToastContainer({ 
  position = 'bottom-right', 
  children 
}: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  };
  
  return (
    <div 
      className={cn(
        'fixed z-50 p-4 flex flex-col gap-2',
        positionClasses[position]
      )}
    >
      <AnimatePresence>
        {children}
      </AnimatePresence>
    </div>
  );
}

interface UseToastReturnType {
  showToast: (props: Omit<ToastProps, 'id' | 'onClose'>) => string;
  dismissToast: (id: string) => void;
  ToastContainer: React.ReactNode;
}

/**
 * Hook zum Verwenden von Toasts in der Anwendung
 */
export function useToast(): UseToastReturnType {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  
  const showToast = (props: Omit<ToastProps, 'id' | 'onClose'>): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...props, id, onClose: dismissToast };
    setToasts((prev) => [...prev, newToast]);
    return id;
  };
  
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  
  const toastContainer = (
    <ToastContainer>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </ToastContainer>
  );
  
  return {
    showToast,
    dismissToast,
    ToastContainer: toastContainer,
  };
}

// Additional exports for toaster compatibility
export const ToastProvider = ToastContainer;
export const ToastViewport = ToastContainer;
export const ToastClose = ({ ...props }) => <button {...props}><X className="h-4 w-4" /></button>;
export const ToastTitle = ({ children, ...props }: any) => <h3 {...props}>{children}</h3>;
export const ToastDescription = ({ children, ...props }: any) => <p {...props}>{children}</p>;
export const ToastAction = ({ children, ...props }: any) => <button {...props}>{children}</button>;

export type ToastActionElement = React.ReactElement<any>;

// Alias for Toast interface to match shadcn expectations
export interface Toast extends ToastProps {}

export default useToast;
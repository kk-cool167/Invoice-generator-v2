import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  type: 'loading' | 'error' | 'empty';
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function LoadingState({ 
  type, 
  title, 
  description, 
  action, 
  className 
}: LoadingStateProps) {
  const variants = {
    loading: {
      icon: <Loader2 className="h-12 w-12 animate-spin text-purple-500" />,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    error: {
      icon: <AlertCircle className="h-12 w-12 text-red-500" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    empty: {
      icon: <FileText className="h-12 w-12 text-gray-400" />,
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    }
  };

  const variant = variants[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed",
        variant.bgColor,
        variant.borderColor,
        className
      )}
    >
      <motion.div
        animate={type === 'loading' ? { rotate: 360 } : {}}
        transition={type === 'loading' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
      >
        {variant.icon}
      </motion.div>
      
      {title && (
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="mt-2 text-sm text-gray-600 text-center max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </motion.div>
  );
}

// Skeleton loader for tables
export function TableSkeleton({ rows = 3, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <motion.div
              key={colIndex}
              className="h-4 bg-gray-200 rounded flex-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: colIndex * 0.1 
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
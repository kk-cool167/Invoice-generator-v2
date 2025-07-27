import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  type: 'loading' | 'error' | 'empty' | 'success';
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
      borderColor: "border-purple-200",
      textColor: "text-purple-700"
    },
    error: {
      icon: <AlertCircle className="h-12 w-12 text-red-500" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700"
    },
    empty: {
      icon: <FileText className="h-12 w-12 text-gray-400" />,
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-600"
    },
    success: {
      icon: <CheckCircle className="h-12 w-12 text-green-500" />,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700"
    }
  };

  const variant = variants[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed min-h-[200px]",
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
        <h3 className={cn("mt-4 text-lg font-semibold", variant.textColor)}>
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

// Enhanced skeleton loader
export function SkeletonLoader({ 
  lines = 3, 
  className = "",
  animated = true 
}: { 
  lines?: number; 
  className?: string;
  animated?: boolean;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
          animate={animated ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={animated ? { 
            duration: 1.5, 
            repeat: Infinity, 
            delay: index * 0.1 
          } : {}}
        />
      ))}
    </div>
  );
}

// Table skeleton specifically for your invoice items
export function TableSkeleton({ 
  rows = 3, 
  cols = 5,
  className = "" 
}: { 
  rows?: number; 
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4 p-3 bg-gray-100 rounded-lg">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="h-4 bg-gray-300 rounded flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-3">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <motion.div
              key={colIndex}
              className="h-4 bg-gray-200 rounded flex-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: (rowIndex * cols + colIndex) * 0.1 
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
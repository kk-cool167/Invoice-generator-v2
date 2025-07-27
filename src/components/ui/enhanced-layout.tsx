import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

// Enhanced layout component for better responsive behavior
export function ResponsiveGrid({ 
  children, 
  className = "",
  columns = { sm: 1, md: 2, lg: 3 }
}: {
  children: React.ReactNode;
  className?: string;
  columns?: { sm: number; md: number; lg: number };
}) {
  const gridClasses = `grid grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} gap-6`;
  
  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
}

// Enhanced card with better visual feedback
export function InteractiveCard({
  children,
  className = "",
  isActive = false,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-300",
          "hover:shadow-xl hover:shadow-purple-500/20",
          "border-2 border-purple-200/60",
          isActive && "ring-2 ring-purple-400 border-purple-400",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
}

// Better section headers with icons
export function SectionHeader({
  title,
  description,
  icon: Icon,
  actions,
  className = ""
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

// Enhanced form field with better validation display
export function EnhancedFormField({
  label,
  error,
  success,
  required = false,
  children,
  className = ""
}: {
  label: string;
  error?: string;
  success?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        {success && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
        )}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
      {success && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-green-600"
        >
          {success}
        </motion.p>
      )}
    </div>
  );
}
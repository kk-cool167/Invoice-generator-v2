import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, FileText, Eye, Download } from 'lucide-react';

// Enhanced Card component with GSAP entrance animation
// Drop-in replacement for your existing Card components
export function AnimatedCard({ 
  children, 
  className = "", 
  animationType = "slideUp",
  delay = 0 
}: {
  children: React.ReactNode;
  className?: string;
  animationType?: "slideUp" | "fade" | "scale" | "slideLeft";
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;

    const animations = {
      slideUp: {
        from: { opacity: 0, y: 30, scale: 0.95 },
        to: { opacity: 1, y: 0, scale: 1 }
      },
      fade: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      scale: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 }
      },
      slideLeft: {
        from: { opacity: 0, x: -50 },
        to: { opacity: 1, x: 0 }
      }
    };

    const { from, to } = animations[animationType];

    gsap.fromTo(cardRef.current, from, {
      ...to,
      duration: 0.6,
      ease: "power2.out",
      delay
    });
  }, { scope: cardRef });

  return (
    <Card ref={cardRef} className={className}>
      {children}
    </Card>
  );
}

// Enhanced Button with hover animations
// Direct replacement for your existing buttons
export function AnimatedButton({ 
  children, 
  onClick, 
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
  animationType = "scale",
  ...props 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  animationType?: "scale" | "lift" | "bounce";
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (disabled || !buttonRef.current) return;

    const animations = {
      scale: { scale: 1.05, duration: 0.2 },
      lift: { y: -2, scale: 1.02, duration: 0.2 },
      bounce: { y: -3, scale: 1.05, duration: 0.3, ease: "back.out(2)" }
    };

    gsap.to(buttonRef.current, animations[animationType]);
  };

  const handleMouseLeave = () => {
    if (disabled || !buttonRef.current) return;

    gsap.to(buttonRef.current, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  return (
    <Button
      ref={buttonRef}
      onClick={onClick}
      className={className}
      variant={variant}
      size={size}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Button>
  );
}

// Animated Items List for your FI/MM Items Sections
// Can replace the items rendering in your existing components
export function AnimatedItemsList({ 
  items, 
  renderItem, 
  onAddItem, 
  onRemoveItem 
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  onAddItem?: () => void;
  onRemoveItem?: (index: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate new items when added
  useGSAP(() => {
    if (!containerRef.current) return;

    const newItems = containerRef.current.querySelectorAll('[data-new-item]');
    if (newItems.length > 0) {
      gsap.fromTo(newItems,
        {
          opacity: 0,
          scale: 0,
          y: -20
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
          stagger: 0.1
        }
      );

      // Remove the data attribute after animation
      setTimeout(() => {
        newItems.forEach(item => item.removeAttribute('data-new-item'));
      }, 500);
    }
  }, [items.length]);

  return (
    <div ref={containerRef} className="space-y-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={item.id || index}
            layout
            initial={{ opacity: 0, scale: 0.8, x: -100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            transition={{ 
              layout: { duration: 0.3 },
              default: { duration: 0.5, ease: "backOut" }
            }}
            whileHover={{ scale: 1.01 }}
            className="group"
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>

      {onAddItem && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatedButton
            onClick={onAddItem}
            variant="outline"
            className="w-full flex items-center gap-2 text-purple-600 border-purple-200/60 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50"
            animationType="bounce"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </AnimatedButton>
        </motion.div>
      )}
    </div>
  );
}

// PDF Preview Animation Component
// Can be integrated into your PDFViewer component
export function AnimatedPDFPreview({ 
  isLoading, 
  error, 
  hasDocument, 
  onPreviewPDF 
}: {
  isLoading: boolean;
  error: string | null;
  hasDocument: boolean;
  onPreviewPDF: () => void;
}) {
  const previewRef = useRef<HTMLDivElement>(null);

  // Loading animation
  useGSAP(() => {
    if (isLoading && previewRef.current) {
      const loader = previewRef.current.querySelector('[data-loader]');
      if (loader) {
        gsap.to(loader, {
          rotation: 360,
          duration: 1,
          repeat: -1,
          ease: "none"
        });
      }
    }
  }, [isLoading]);

  // Document appearance animation
  useGSAP(() => {
    if (hasDocument && previewRef.current) {
      const document = previewRef.current.querySelector('[data-document]');
      if (document) {
        gsap.fromTo(document,
          {
            opacity: 0,
            scale: 0.8,
            y: 20
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
          }
        );
      }
    }
  }, [hasDocument]);

  return (
    <div ref={previewRef} className="space-y-4">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-40 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300"
          >
            <div className="text-center space-y-3">
              <motion.div
                data-loader
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <FileText className="h-8 w-8 text-purple-600 mx-auto" />
              </motion.div>
              <p className="text-sm text-purple-700 font-medium">
                Generating PDF Preview...
              </p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center h-40 bg-red-50 rounded-lg border-2 border-red-200"
          >
            <div className="text-center space-y-3">
              <div className="text-red-500">⚠️</div>
              <p className="text-sm text-red-700">{error}</p>
              <AnimatedButton
                onClick={onPreviewPDF}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Retry
              </AnimatedButton>
            </div>
          </motion.div>
        )}

        {hasDocument && !isLoading && !error && (
          <motion.div
            key="document"
            data-document
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl border-2 border-purple-200 shadow-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">PDF Preview Ready</span>
              </div>
              <div className="flex gap-2">
                <AnimatedButton variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </AnimatedButton>
                <AnimatedButton size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </AnimatedButton>
              </div>
            </div>
            
            {/* Placeholder for actual PDF content */}
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">PDF Document Preview</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasDocument && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center h-40 bg-white rounded-lg border-2 border-dashed border-purple-300"
        >
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-600">
                No PDF Preview Available
              </p>
              <p className="text-sm text-gray-500">
                Click "Preview PDF" to generate the document
              </p>
            </div>
            <AnimatedButton
              onClick={onPreviewPDF}
              className="bg-purple-600 hover:bg-purple-700"
              animationType="bounce"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview PDF
            </AnimatedButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Page Transition Component
// Wrap your main content with this for smooth page transitions
export function PageTransition({ 
  children, 
  className = "" 
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered Container for multiple cards/components
export function StaggeredContainer({ 
  children, 
  className = "",
  staggerDelay = 0.1 
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          key={index}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
# Animation Integration Guide

This guide shows how to add GSAP and Framer Motion animations to your React TypeScript invoice generator project.

## Installation

### 1. Install Animation Libraries

```bash
# GSAP with React integration
npm install gsap @gsap/react

# Framer Motion
npm install framer-motion

# Type definitions (if needed)
npm install --save-dev @types/gsap
```

### 2. Verify Dependencies

Check your `package.json` includes:
```json
{
  "dependencies": {
    "gsap": "^3.12.2",
    "@gsap/react": "^2.0.2",
    "framer-motion": "^10.16.4"
  }
}
```

## Quick Integration Examples

### 1. Enhanced Card Components

Replace your existing Card imports:

```tsx
// Before:
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// After:
import { AnimatedCard } from './animations/InvoiceAnimations';
// Keep original imports for CardContent, CardHeader, CardTitle
import { CardContent, CardHeader, CardTitle } from './ui/card';

// Usage in your FIItemsSection.tsx or MMItemsSection.tsx:
<AnimatedCard 
  className="rounded-xl shadow-xl shadow-purple-500/20 border-2 border-purple-300/60"
  animationType="slideUp"
  delay={0.1}
>
  <CardHeader>
    <CardTitle>Invoice Items</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Your existing content */}
  </CardContent>
</AnimatedCard>
```

### 2. Enhanced Buttons

Replace button implementations:

```tsx
// Before:
<Button onClick={onAddItem} className="...">
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>

// After:
import { AnimatedButton } from './animations/InvoiceAnimations';

<AnimatedButton 
  onClick={onAddItem} 
  className="..."
  animationType="bounce"
  variant="outline"
>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</AnimatedButton>
```

### 3. Enhanced PDF Preview

In your `PDFViewer.tsx`:

```tsx
import { AnimatedPDFPreview } from './animations/InvoiceAnimations';

// Replace your existing PDF preview section with:
<AnimatedPDFPreview
  isLoading={isPreviewLoading}
  error={error}
  hasDocument={hasPreviewDocument}
  onPreviewPDF={onPreviewPDF}
/>
```

## Specific Integration for Your Components

### FIItemsSection.tsx Integration

```tsx
// Add to imports
import { AnimatedCard, AnimatedButton, AnimatedItemsList } from './animations/InvoiceAnimations';
import { motion, AnimatePresence } from 'framer-motion';

// Replace your main Card wrapper
return (
  <AnimatedCard className="rounded-xl shadow-xl shadow-purple-500/20 border-2 border-purple-300/60">
    <CardHeader className="py-5 bg-gradient-to-r from-white/95 to-purple-50/30">
      <CardTitle className="text-base font-semibold text-gray-900">
        <motion.div 
          className="w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 rounded-xl flex items-center justify-center mr-3"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          <FileText className="h-4 w-4 text-white" />
        </motion.div>
        {t('form.invoiceItems')}
      </CardTitle>
    </CardHeader>
    
    <CardContent className="pt-5 space-y-4">
      {/* Replace your items mapping with AnimatedItemsList */}
      <AnimatedItemsList
        items={items}
        renderItem={(item, index) => (
          // Your existing item JSX here
          <div className="group">
            {/* Desktop Layout */}
            <div className="hidden md:grid...">
              {/* Your existing desktop layout */}
            </div>
            {/* Mobile Layout */}
            <div className="md:hidden...">
              {/* Your existing mobile layout */}
            </div>
          </div>
        )}
        onAddItem={onAddItem}
      />
      
      {/* Replace Add Item button */}
      <div className="flex justify-center pt-6">
        <AnimatedButton 
          type="button" 
          variant="outline" 
          onClick={onAddItem}
          className="flex items-center gap-2 text-purple-600 border-purple-200/60 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50"
          animationType="bounce"
        >
          <Plus className="h-4 w-4" />
          {t('buttons.addItem')}
        </AnimatedButton>
      </div>
    </CardContent>
  </AnimatedCard>
);
```

### MMItemsSection.tsx Integration

Similar pattern, replace the main Card and buttons:

```tsx
// Add to imports
import { AnimatedCard, AnimatedButton } from './animations/InvoiceAnimations';
import { motion } from 'framer-motion';

// In your return statement:
return (
  <AnimatedCard 
    className="rounded-xl shadow-xl shadow-purple-500/20 border-2 border-purple-300/60"
    animationType="slideUp"
    delay={0.2}
  >
    {/* Keep your existing CardHeader and content */}
    <CardHeader>
      <CardTitle className="text-base font-semibold text-gray-900 flex items-center">
        <motion.div 
          className="w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 rounded-xl flex items-center justify-center mr-3"
          whileHover={{ scale: 1.1 }}
        >
          <FileSpreadsheet className="h-4 w-4 text-white" />
        </motion.div>
        {translatedTitle()}
      </CardTitle>
    </CardHeader>
    
    <CardContent>
      {/* Your existing content with enhanced buttons */}
      <AnimatedButton 
        onClick={onAddItem}
        variant="outline"
        className="flex items-center gap-2 text-purple-600 border-purple-200/60"
        animationType="lift"
      >
        <Plus className="h-4 w-4" />
        {t('buttons.addItem')}
      </AnimatedButton>
    </CardContent>
  </AnimatedCard>
);
```

### PDFViewer.tsx Integration

```tsx
// Add to imports
import { AnimatedCard, AnimatedButton, AnimatedPDFPreview } from './animations/InvoiceAnimations';
import { motion } from 'framer-motion';

// Replace your main Card
return (
  <AnimatedCard 
    className={cn("w-full h-fit shadow-xl shadow-purple-500/20 border-2 border-purple-300/60", className)}
    animationType="scale"
  >
    <CardHeader>
      <CardTitle className="text-base font-semibold flex items-center gap-3">
        <motion.div 
          className="w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 rounded-xl flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <Eye className="h-4 w-4 text-white" />
        </motion.div>
        {title}
      </CardTitle>
      
      {/* Replace action buttons */}
      <div className="flex items-center gap-3">
        <AnimatedButton
          variant="outline"
          size="sm"
          onClick={onPreviewPDF}
          disabled={isPreviewLoading}
          animationType="lift"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </AnimatedButton>
        
        <AnimatedButton
          variant="default"
          size="sm"
          onClick={onDownloadPDF}
          className="bg-gradient-to-r from-purple-600 to-purple-700"
          animationType="bounce"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </AnimatedButton>
      </div>
    </CardHeader>
    
    <CardContent>
      {/* Replace PDF preview section */}
      <AnimatedPDFPreview
        isLoading={isLoading || isPreviewLoading}
        error={error}
        hasDocument={hasPreviewDocument}
        onPreviewPDF={onPreviewPDF}
      />
    </CardContent>
  </AnimatedCard>
);
```

## Page-Level Integration

### Main App or Route Components

Wrap your main content with page transitions:

```tsx
import { PageTransition, StaggeredContainer } from './components/animations/InvoiceAnimations';

function InvoiceFormPage() {
  return (
    <PageTransition className="min-h-screen bg-gray-50">
      <StaggeredContainer className="container mx-auto p-6 space-y-8">
        {/* Your existing components will now animate in sequence */}
        <FIItemsSection {...props} />
        <MMItemsSection {...props} />
        <PDFViewer {...props} />
      </StaggeredContainer>
    </PageTransition>
  );
}
```

## Performance Considerations

### 1. Optimize GSAP Imports
Only import what you need:

```tsx
// Good: Specific imports
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Avoid: Full library import
// import * as gsap from 'gsap';
```

### 2. Framer Motion Optimization

```tsx
// For better performance, use motion.div instead of wrapping components
import { motion } from 'framer-motion';

// Good for simple animations
<motion.div animate={{ opacity: 1 }}>
  <YourComponent />
</motion.div>

// Better for complex components
<AnimatedCard>
  <YourComponent />
</AnimatedCard>
```

### 3. Conditional Animation Loading

```tsx
// Load animations only when needed
const AnimatedComponents = React.lazy(() => import('./animations/InvoiceAnimations'));

function YourComponent() {
  const [enableAnimations, setEnableAnimations] = useState(false);
  
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      {enableAnimations ? (
        <AnimatedComponents />
      ) : (
        <RegularComponents />
      )}
    </React.Suspense>
  );
}
```

## Testing Animations

### 1. Reduced Motion Support

```tsx
// Check user preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Conditionally apply animations
<AnimatedCard 
  animationType={prefersReducedMotion ? "fade" : "slideUp"}
>
```

### 2. Development Testing

```bash
# Test with animations enabled
npm run dev:full

# Test performance
npm run build && npm run preview
```

## Migration Strategy

### Phase 1: Critical Components
1. Start with main cards (FIItemsSection, MMItemsSection)
2. Add button animations
3. Enhance PDF preview

### Phase 2: Page Transitions
1. Add page-level transitions
2. Implement staggered animations
3. Add loading states

### Phase 3: Advanced Features
1. Complex GSAP timelines
2. SVG animations for logos
3. Custom easing functions

## Troubleshooting

### Common Issues

1. **GSAP License**: useGSAP hook is free, advanced plugins require license
2. **Bundle Size**: Use tree-shaking to reduce final bundle
3. **TypeScript**: Ensure type definitions are installed
4. **Performance**: Use CSS transforms over layout changes

### Debug Mode

```tsx
// Enable Framer Motion debug mode
import { MotionConfig } from 'framer-motion';

<MotionConfig isValidProp={() => true}>
  <YourApp />
</MotionConfig>
```

This integration guide provides a smooth migration path while maintaining your existing purple theme and component structure.
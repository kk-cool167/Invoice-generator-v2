import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { WORKFLOW_STEPS, GUIDE_STEPS, type StepDefinition } from '../components/steps/stepDefinitions';
import { BasicInfo } from '../types/forms';
import { MMItem, FIItem } from '../types/forms';
import { type Logo } from '../lib/logoManager';

export type StepContext = 'guide' | 'form';

interface UseStepTrackingProps {
  context: StepContext;
  // Form-specific props
  methods?: UseFormReturn<BasicInfo>;
  mode?: 'MM' | 'FI';
  template?: string;
  logo?: Logo | null;
  invoiceItems?: MMItem[];
  fiItems?: FIItem[];
  pdfBlob?: Blob | null;
}

interface StepTrackingResult {
  steps: StepDefinition[];
  completedSteps: string[];
  currentStep: string | null;
  isStepCompleted: (stepId: string) => boolean;
  isStepActive: (stepId: string) => boolean;
  isStepOptional: (stepId: string) => boolean;
  getCompletionRate: () => number;
  getNextIncompleteStep: () => string | null;
}

export function useStepTracking({
  context,
  methods,
  mode,
  template,
  logo,
  invoiceItems = [],
  fiItems = [],
  pdfBlob
}: UseStepTrackingProps): StepTrackingResult {
  
  // Select appropriate step definitions based on context
  const steps = context === 'guide' ? GUIDE_STEPS : WORKFLOW_STEPS;

  // Get form values for completion checking
  const vendorId = methods?.watch('vendorId');
  const recipientId = methods?.watch('recipientId');
  const invoiceNumber = methods?.watch('invoiceNumber');

  // Calculate completed steps based on actual state
  const completedSteps = useMemo(() => {
    const completed: string[] = [];

    // Only calculate completion for form context when methods are available
    if (context === 'form' && methods) {
      // Step 1: Mode & Template selected
      if (mode && template) {
        completed.push('mode');
      }

      // Step 2: Logo uploaded (optional)
      if (logo) {
        completed.push('logo');
      }

      // Step 3: Basic info filled (vendor, recipient, invoice number)
      if (vendorId && recipientId && invoiceNumber) {
        completed.push('data');
      }

      // Step 4: Items added
      const hasItems = mode === 'MM'
        ? invoiceItems.some(item => item.materialId?.trim())
        : fiItems.some(item => item.description?.trim());
      if (hasItems) {
        completed.push('items');
      }

      // Step 5: PDF generated
      if (pdfBlob) {
        completed.push('preview');
      }

    }

    // Additional guide-only steps (always calculate for guide context)
    if (context === 'guide') {
        // Sync materials step (always considered completed if items exist)
        const hasItems = mode === 'MM'
          ? invoiceItems.some(item => item.materialId?.trim())
          : fiItems.some(item => item.description?.trim());
        if (hasItems) {
          completed.push('sync');
        }

        // Template step (completed when template is selected)
        if (template) {
          completed.push('template');
        }

        // Finalize step (completed when PDF exists)
        if (pdfBlob) {
          completed.push('finalize');
        }

        // Versions step (always available, mark as completed for demo)
        completed.push('versions');
      }

    return completed;
  }, [
    context,
    methods,
    mode,
    template,
    logo,
    vendorId,
    recipientId,
    invoiceNumber,
    invoiceItems,
    fiItems,
    pdfBlob
  ]);

  // Find current active step (first incomplete required step)
  const currentStep = useMemo(() => {
    const requiredSteps = steps.filter(step => step.required);
    const incompleteRequired = requiredSteps.find(step => !completedSteps.includes(step.id));
    return incompleteRequired?.id || null;
  }, [steps, completedSteps]);

  // Helper functions
  const isStepCompleted = (stepId: string): boolean => {
    return completedSteps.includes(stepId);
  };

  const isStepActive = (stepId: string): boolean => {
    return currentStep === stepId;
  };

  const isStepOptional = (stepId: string): boolean => {
    const step = steps.find(s => s.id === stepId);
    return !step?.required;
  };

  const getCompletionRate = (): number => {
    if (steps.length === 0) return 0;
    return (completedSteps.length / steps.length) * 100;
  };

  const getNextIncompleteStep = (): string | null => {
    const incompleteStep = steps.find(step => !completedSteps.includes(step.id));
    return incompleteStep?.id || null;
  };

  return {
    steps,
    completedSteps,
    currentStep,
    isStepCompleted,
    isStepActive,
    isStepOptional,
    getCompletionRate,
    getNextIncompleteStep
  };
}
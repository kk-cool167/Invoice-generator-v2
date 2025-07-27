export interface StepDefinition {
  id: string;
  key: string;
  required?: boolean;
}

// Core workflow steps used in the invoice form
export const WORKFLOW_STEPS: StepDefinition[] = [
  { 
    id: 'mode', 
    key: 'chooseMode', 
    required: true 
  },
  { 
    id: 'logo', 
    key: 'logoUpload', 
    required: false 
  },
  { 
    id: 'data', 
    key: 'vendorData', 
    required: true 
  },
  { 
    id: 'items', 
    key: 'enterItems', 
    required: true 
  },
  { 
    id: 'preview', 
    key: 'preview', 
    required: true 
  }
];

// Extended guide steps (includes workflow + additional educational steps)
export const GUIDE_STEPS: StepDefinition[] = [
  { 
    id: 'mode', 
    key: 'chooseMode', 
    required: true 
  },
  { 
    id: 'logo', 
    key: 'logoUpload', 
    required: false 
  },
  { 
    id: 'data', 
    key: 'vendorData', 
    required: true 
  },
  { 
    id: 'items', 
    key: 'enterItems', 
    required: true 
  },
  { 
    id: 'sync', 
    key: 'syncMaterials', 
    required: false 
  },
  { 
    id: 'preview', 
    key: 'preview', 
    required: true 
  },
  { 
    id: 'template', 
    key: 'templateSelect', 
    required: false 
  },
  { 
    id: 'finalize', 
    key: 'finalizeDocument', 
    required: false 
  },
  { 
    id: 'versions', 
    key: 'versionsManagement', 
    required: false 
  }
];

// Helper functions
export function getStepByIndex(steps: StepDefinition[], index: number): StepDefinition | undefined {
  return steps[index];
}

export function getStepIndex(steps: StepDefinition[], stepId: string): number {
  return steps.findIndex(step => step.id === stepId);
}

export function isStepRequired(steps: StepDefinition[], stepId: string): boolean {
  const step = steps.find(s => s.id === stepId);
  return step?.required ?? false;
}

export function getRequiredSteps(steps: StepDefinition[]): StepDefinition[] {
  return steps.filter(step => step.required);
}

export function getOptionalSteps(steps: StepDefinition[]): StepDefinition[] {
  return steps.filter(step => !step.required);
}
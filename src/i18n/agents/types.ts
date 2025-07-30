export interface HardcodedString {
  file: string;
  line: number;
  text: string;
  context: string;
  componentName: string;
}

export interface TranslationKey {
  key: string;
  value: string;
  context?: string;
  component?: string;
}

export interface ComponentUpdate {
  filePath: string;
  componentName: string;
  updates: Array<{
    line: number;
    oldText: string;
    newKey: string;
    fullReplacement: string;
  }>;
}

export interface ValidationResult {
  component: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingKeys: string[];
  unusedKeys: string[];
}

export interface I18nProgress {
  timestamp: string;
  phase: 'scanning' | 'translating' | 'implementing' | 'validating' | 'completed';
  totalComponents: number;
  processedComponents: number;
  totalStrings: number;
  translatedStrings: number;
  languages: {
    [lang: string]: {
      complete: boolean;
      coverage: number;
      missingKeys: number;
    };
  };
  errors: string[];
  nextSteps: string[];
}
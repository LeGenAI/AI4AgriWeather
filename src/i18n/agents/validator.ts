import * as fs from 'fs';
import * as path from 'path';
import { ValidationResult } from './types';

export class ValidatorAgent {
  private srcPath: string;
  private localesPath: string;
  private supportedLanguages = ['en', 'ko', 'sw', 'fr', 'ne', 'uz'];

  constructor(projectPath: string) {
    this.srcPath = path.join(projectPath, 'src');
    this.localesPath = path.join(this.srcPath, 'i18n', 'locales');
  }

  async validateI18nImplementation(): Promise<ValidationResult[]> {
    console.log('🔍 Validator Agent: Starting validation...');
    
    const results: ValidationResult[] = [];
    
    // Validate translation files
    const translationValidation = await this.validateTranslationFiles();
    results.push(...translationValidation);

    // Validate component implementations
    const componentValidation = await this.validateComponents();
    results.push(...componentValidation);

    // Generate validation report
    await this.generateValidationReport(results);

    console.log(`✅ Validator Agent: Validation complete. ${results.length} components checked.`);
    return results;
  }

  private async validateTranslationFiles(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const allKeys = new Map<string, Set<string>>();

    // Load all translation files and collect keys
    for (const lang of this.supportedLanguages) {
      const filePath = path.join(this.localesPath, `${lang}.json`);
      
      if (!fs.existsSync(filePath)) {
        results.push({
          component: `${lang}.json`,
          isValid: false,
          errors: [`Translation file missing for language: ${lang}`],
          warnings: [],
          missingKeys: [],
          unusedKeys: []
        });
        continue;
      }

      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const translations = JSON.parse(content);
        const keys = this.extractKeys(translations);
        allKeys.set(lang, keys);
      } catch (error) {
        results.push({
          component: `${lang}.json`,
          isValid: false,
          errors: [`Invalid JSON in ${lang}.json: ${error}`],
          warnings: [],
          missingKeys: [],
          unusedKeys: []
        });
      }
    }

    // Check for missing keys across languages
    const referenceKeys = allKeys.get('en') || new Set<string>();
    
    for (const [lang, keys] of allKeys.entries()) {
      if (lang === 'en') continue;

      const missingKeys = Array.from(referenceKeys).filter(key => !keys.has(key));
      const extraKeys = Array.from(keys).filter(key => !referenceKeys.has(key));

      if (missingKeys.length > 0 || extraKeys.length > 0) {
        results.push({
          component: `${lang}.json`,
          isValid: missingKeys.length === 0,
          errors: missingKeys.length > 0 ? [`Missing ${missingKeys.length} translation keys`] : [],
          warnings: extraKeys.length > 0 ? [`${extraKeys.length} extra keys not in reference (en)`] : [],
          missingKeys,
          unusedKeys: extraKeys
        });
      }
    }

    return results;
  }

  private extractKeys(obj: any, prefix = ''): Set<string> {
    const keys = new Set<string>();

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        const nestedKeys = this.extractKeys(value, fullKey);
        nestedKeys.forEach(k => keys.add(k));
      } else {
        keys.add(fullKey);
      }
    }

    return keys;
  }

  private async validateComponents(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const componentFiles = await this.getComponentFiles();

    for (const file of componentFiles) {
      const validation = await this.validateComponent(file);
      if (validation) {
        results.push(validation);
      }
    }

    return results;
  }

  private async getComponentFiles(): Promise<string[]> {
    const { glob } = await import('glob');
    const pattern = '**/*.{tsx,ts}';
    const files = await glob(pattern, {
      cwd: this.srcPath,
      ignore: ['**/*.test.*', '**/*.spec.*', 'i18n/**', 'types/**', 'utils/**'],
      absolute: true
    });
    return files;
  }

  private async validateComponent(filePath: string): Promise<ValidationResult | null> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const componentName = path.basename(filePath, path.extname(filePath));
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingKeys: string[] = [];

    // Check for hardcoded strings
    const hardcodedPatterns = [
      />([A-Z][^<>{}]+)</g, // JSX text starting with capital
      /(?:title|label|placeholder|text|message)=["']([^"']+)["']/g,
      /alert\s*\(\s*["']([^"']+)["']/g,
      /console\.(log|error|warn)\s*\(\s*["']([^"']+)["']/g,
    ];

    const usesI18n = content.includes('useTranslation') || content.includes('t(');
    let hasHardcodedStrings = false;

    for (const pattern of hardcodedPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const text = match[1];
        // Filter out common false positives
        if (this.isLikelyHardcodedString(text) && !this.isIgnoredString(text)) {
          hasHardcodedStrings = true;
          warnings.push(`Possible hardcoded string: "${text}"`);
        }
      }
    }

    // Check if component uses i18n when it has hardcoded strings
    if (hasHardcodedStrings && !usesI18n) {
      errors.push('Component has hardcoded strings but does not use i18n');
    }

    // Check for proper t() function usage
    if (usesI18n) {
      // Check for dynamic keys (anti-pattern)
      const dynamicKeyPattern = /t\([^'"]+\)/g;
      const dynamicMatches = content.match(dynamicKeyPattern);
      if (dynamicMatches) {
        warnings.push('Using dynamic translation keys (anti-pattern)');
      }

      // Extract used translation keys
      const keyPattern = /t\(['"]([^'"]+)['"]\)/g;
      const usedKeys = new Set<string>();
      let match;
      while ((match = keyPattern.exec(content)) !== null) {
        usedKeys.add(match[1]);
      }

      // Validate that used keys exist in translation files
      const enTranslations = await this.loadTranslations('en');
      if (enTranslations) {
        const availableKeys = this.extractKeys(enTranslations);
        usedKeys.forEach(key => {
          if (!availableKeys.has(key)) {
            missingKeys.push(key);
          }
        });
      }
    }

    const isValid = errors.length === 0 && missingKeys.length === 0;

    return {
      component: componentName,
      isValid,
      errors,
      warnings,
      missingKeys,
      unusedKeys: []
    };
  }

  private isLikelyHardcodedString(text: string): boolean {
    // Must have at least one letter and be at least 2 characters
    return text.length >= 2 && /[a-zA-Z]/.test(text);
  }

  private isIgnoredString(text: string): boolean {
    const ignoredPatterns = [
      /^[A-Z0-9_]+$/, // Constants
      /^(true|false|null|undefined)$/, // Keywords
      /^\d+$/, // Numbers
      /^[a-z0-9-_]+$/, // IDs or classes
      /^https?:\/\//, // URLs
      /^[\.\/]/, // Paths
    ];

    return ignoredPatterns.some(pattern => pattern.test(text));
  }

  private async loadTranslations(language: string): Promise<any | null> {
    const filePath = path.join(this.localesPath, `${language}.json`);
    
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async generateValidationReport(results: ValidationResult[]): Promise<void> {
    const reportPath = path.join(this.srcPath, 'i18n', 'agents', 'validation-report.md');
    
    let content = '# i18n Validation Report\n\n';
    content += `Generated: ${new Date().toISOString()}\n\n`;
    
    // Summary
    const totalComponents = results.length;
    const validComponents = results.filter(r => r.isValid).length;
    const componentsWithErrors = results.filter(r => r.errors.length > 0).length;
    const componentsWithWarnings = results.filter(r => r.warnings.length > 0).length;
    
    content += '## Summary\n\n';
    content += `- Total components checked: ${totalComponents}\n`;
    content += `- Valid components: ${validComponents}\n`;
    content += `- Components with errors: ${componentsWithErrors}\n`;
    content += `- Components with warnings: ${componentsWithWarnings}\n\n`;

    // Language coverage
    content += '## Language Coverage\n\n';
    for (const lang of this.supportedLanguages) {
      const langResult = results.find(r => r.component === `${lang}.json`);
      if (langResult) {
        const status = langResult.isValid ? '✅' : '❌';
        content += `- ${lang}: ${status}`;
        if (langResult.missingKeys.length > 0) {
          content += ` (${langResult.missingKeys.length} missing keys)`;
        }
        content += '\n';
      }
    }
    content += '\n';

    // Components with issues
    content += '## Components Requiring Attention\n\n';
    
    const issueComponents = results.filter(r => !r.isValid || r.warnings.length > 0);
    for (const result of issueComponents) {
      content += `### ${result.component}\n\n`;
      
      if (result.errors.length > 0) {
        content += '**Errors:**\n';
        result.errors.forEach(error => content += `- ❌ ${error}\n`);
        content += '\n';
      }
      
      if (result.warnings.length > 0) {
        content += '**Warnings:**\n';
        result.warnings.forEach(warning => content += `- ⚠️ ${warning}\n`);
        content += '\n';
      }
      
      if (result.missingKeys.length > 0) {
        content += '**Missing Translation Keys:**\n';
        result.missingKeys.forEach(key => content += `- ${key}\n`);
        content += '\n';
      }
    }

    // Recommendations
    content += '## Recommendations\n\n';
    content += '1. Fix all components with errors first\n';
    content += '2. Add missing translation keys to all language files\n';
    content += '3. Review and address warnings\n';
    content += '4. Run validation again after fixes\n';

    await fs.promises.writeFile(reportPath, content);
    console.log(`📊 Validation report saved to: ${reportPath}`);
  }

  async checkTranslationCompleteness(): Promise<Map<string, number>> {
    const completeness = new Map<string, number>();
    
    // Get English keys as reference
    const enTranslations = await this.loadTranslations('en');
    if (!enTranslations) return completeness;
    
    const totalKeys = this.extractKeys(enTranslations).size;
    
    for (const lang of this.supportedLanguages) {
      const translations = await this.loadTranslations(lang);
      if (translations) {
        const langKeys = this.extractKeys(translations).size;
        const percentage = Math.round((langKeys / totalKeys) * 100);
        completeness.set(lang, percentage);
      } else {
        completeness.set(lang, 0);
      }
    }
    
    return completeness;
  }
}
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface HardcodedString {
  file: string;
  line: number;
  text: string;
  context: string;
  componentName: string;
}

interface ScanReport {
  totalFiles: number;
  filesWithHardcodedStrings: number;
  totalHardcodedStrings: number;
  hardcodedStrings: HardcodedString[];
  componentsNeedingI18n: string[];
}

export class ScannerAgent {
  private srcPath: string;
  private ignoredPatterns: string[] = [
    '*.test.tsx',
    '*.test.ts',
    '*.spec.tsx',
    '*.spec.ts',
    'i18n/**',
    'agents/**',
    'types/**',
    'utils/**',
    'constants/**'
  ];

  constructor(projectPath: string) {
    this.srcPath = path.join(projectPath, 'src');
  }

  async scanForHardcodedStrings(): Promise<ScanReport> {
    console.log('🔍 Scanner Agent: Starting scan for hardcoded strings...');
    
    const report: ScanReport = {
      totalFiles: 0,
      filesWithHardcodedStrings: 0,
      totalHardcodedStrings: 0,
      hardcodedStrings: [],
      componentsNeedingI18n: []
    };

    const files = await this.getReactFiles();
    report.totalFiles = files.length;

    for (const file of files) {
      const hardcodedStrings = await this.scanFile(file);
      if (hardcodedStrings.length > 0) {
        report.filesWithHardcodedStrings++;
        report.totalHardcodedStrings += hardcodedStrings.length;
        report.hardcodedStrings.push(...hardcodedStrings);
        
        const componentName = path.basename(file, path.extname(file));
        if (!report.componentsNeedingI18n.includes(componentName)) {
          report.componentsNeedingI18n.push(componentName);
        }
      }
    }

    console.log(`✅ Scanner Agent: Scan complete. Found ${report.totalHardcodedStrings} hardcoded strings in ${report.filesWithHardcodedStrings} files.`);
    return report;
  }

  private async getReactFiles(): Promise<string[]> {
    const pattern = '**/*.{tsx,ts}';
    const files = await glob(pattern, {
      cwd: this.srcPath,
      ignore: this.ignoredPatterns,
      absolute: true
    });
    return files;
  }

  private async scanFile(filePath: string): Promise<HardcodedString[]> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const hardcodedStrings: HardcodedString[] = [];
    const componentName = path.basename(filePath, path.extname(filePath));

    // Check if file already uses i18n (for future use)
    // const usesI18n = content.includes('useTranslation') || content.includes('t(');

    // Patterns for detecting hardcoded strings
    const patterns = [
      // JSX text content
      />([^<>{}\n]+)</g,
      // String literals in props
      /(?:title|label|placeholder|text|message|error|success|description|alt|content|name)=["']([^"']+)["']/g,
      // Button/Link text
      /<(?:Button|Link|a)[^>]*>([^<]+)</g,
      // Alert/Toast messages
      /(?:alert|toast|notification|message)\s*\(\s*["']([^"']+)["']/g,
      // Validation messages
      /(?:error|warning|info|success)\s*:\s*["']([^"']+)["']/g,
      // Object property strings
      /(?:title|label|description|message|text)\s*:\s*["']([^"']+)["']/g
    ];

    lines.forEach((line, index) => {
      // Skip import statements, comments, and already translated strings
      if (
        line.trim().startsWith('import') ||
        line.trim().startsWith('//') ||
        line.trim().startsWith('*') ||
        line.includes('t(') ||
        line.includes('i18n') ||
        line.trim().length === 0
      ) {
        return;
      }

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const text = match[1]?.trim();
          if (this.isValidHardcodedString(text)) {
            hardcodedStrings.push({
              file: filePath,
              line: index + 1,
              text,
              context: line.trim(),
              componentName
            });
          }
        }
      });
    });

    return hardcodedStrings;
  }

  private isValidHardcodedString(text: string | undefined): boolean {
    if (!text) return false;

    // Exclude certain patterns
    const excludePatterns = [
      /^[0-9\s\-\+\*\/\=\.\,]+$/, // Numbers and math
      /^[a-z0-9_\-]+$/, // Variable names
      /^[A-Z0-9_]+$/, // Constants
      /^\{.*\}$/, // Template literals
      /^(true|false|null|undefined)$/, // Keywords
      /^(px|rem|em|%|vh|vw)$/, // CSS units
      /^#[0-9a-fA-F]{3,6}$/, // Hex colors
      /^rgb|rgba|hsl|hsla/, // Color functions
      /^https?:\/\//, // URLs
      /^[\.\/\\]/, // Paths
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Emails
    ];

    // Must have at least one letter and be meaningful
    if (text.length < 2 || !/[a-zA-Z]/.test(text)) {
      return false;
    }

    // Check exclusion patterns
    for (const pattern of excludePatterns) {
      if (pattern.test(text)) {
        return false;
      }
    }

    return true;
  }

  async generateReport(report: ScanReport): Promise<void> {
    const reportPath = path.join(this.srcPath, 'i18n', 'agents', 'scan-report.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Scanner Agent: Report saved to ${reportPath}`);
  }

  async getComponentsUsingI18n(): Promise<string[]> {
    const files = await this.getReactFiles();
    const componentsWithI18n: string[] = [];

    for (const file of files) {
      const content = await fs.promises.readFile(file, 'utf-8');
      if (content.includes('useTranslation') || content.includes('t(')) {
        const componentName = path.basename(file, path.extname(file));
        componentsWithI18n.push(componentName);
      }
    }

    return componentsWithI18n;
  }
}
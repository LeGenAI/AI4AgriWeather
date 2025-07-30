import * as fs from 'fs';
import * as path from 'path';
import { ScannerAgent } from './scanner';
import { TranslatorAgent } from './translator';
import { ImplementerAgent } from './implementer';
import { ValidatorAgent } from './validator';
import { I18nProgress } from './types';

export class I18nCoordinator {
  private projectPath: string;
  private scanner: ScannerAgent;
  private translator: TranslatorAgent;
  private implementer: ImplementerAgent;
  private validator: ValidatorAgent;
  private progressPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.scanner = new ScannerAgent(projectPath);
    this.translator = new TranslatorAgent(projectPath);
    this.implementer = new ImplementerAgent(projectPath);
    this.validator = new ValidatorAgent(projectPath);
    this.progressPath = path.join(projectPath, 'src', 'i18n', 'agents', 'progress.json');
  }

  async runFullI18nImplementation(): Promise<void> {
    console.log('🚀 Starting comprehensive i18n implementation...\n');

    try {
      // Phase 1: Scanning
      await this.updateProgress('scanning');
      const scanReport = await this.scanner.scanForHardcodedStrings();
      await this.scanner.generateReport(scanReport);
      
      console.log(`\n📊 Scan Results:`);
      console.log(`   - Total files scanned: ${scanReport.totalFiles}`);
      console.log(`   - Files with hardcoded strings: ${scanReport.filesWithHardcodedStrings}`);
      console.log(`   - Total hardcoded strings found: ${scanReport.totalHardcodedStrings}`);
      console.log(`   - Components needing i18n: ${scanReport.componentsNeedingI18n.length}\n`);

      if (scanReport.totalHardcodedStrings === 0) {
        console.log('✨ No hardcoded strings found! The project is fully internationalized.');
        return;
      }

      // Phase 2: Translation
      await this.updateProgress('translating', {
        totalStrings: scanReport.totalHardcodedStrings,
        totalComponents: scanReport.componentsNeedingI18n.length
      });
      
      const translationKeys = await this.translator.createTranslationKeys(scanReport.hardcodedStrings);
      await this.translator.updateTranslationFiles(translationKeys);
      
      console.log(`\n🔑 Translation Results:`);
      console.log(`   - Translation keys generated: ${translationKeys.length}`);
      console.log(`   - Languages updated: 6 (en, ko, sw, fr, ne, uz)\n`);

      // Phase 3: Implementation
      await this.updateProgress('implementing', {
        processedComponents: 0,
        totalComponents: scanReport.componentsNeedingI18n.length
      });
      
      const componentUpdates = await this.implementer.implementI18n(
        scanReport.hardcodedStrings,
        translationKeys
      );
      
      // Update i18n configuration
      await this.implementer.updateI18nConfig(['en', 'ko', 'sw', 'fr', 'ne', 'uz']);
      
      // Create manual update guide for complex cases
      await this.implementer.createManualUpdateGuide(componentUpdates);
      
      console.log(`\n🔧 Implementation Results:`);
      console.log(`   - Components automatically updated: ${componentUpdates.length}`);
      console.log(`   - Manual updates required: Check manual-updates.md\n`);

      // Phase 4: Validation
      await this.updateProgress('validating');
      
      await this.validator.validateI18nImplementation();
      await this.validator.checkTranslationCompleteness();
      
      console.log(`\n✅ Validation Results:`);
      console.log(`   - Components validated: ${validationResults.length}`);
      console.log(`   - Translation completeness:`);
      completeness.forEach((percentage, lang) => {
        console.log(`     - ${lang}: ${percentage}%`);
      });

      // Phase 5: Complete
      await this.updateProgress('completed', {
        processedComponents: scanReport.componentsNeedingI18n.length,
        translatedStrings: translationKeys.length
      });

      // Generate final report
      await this.generateFinalReport({
        scanReport,
        translationKeys: translationKeys.length,
        componentUpdates: componentUpdates.length,
        validationResults,
        completeness
      });

      console.log('\n🎉 i18n implementation completed successfully!');
      console.log('📄 Check the following files for detailed information:');
      console.log('   - scan-report.json: Detailed scan results');
      console.log('   - manual-updates.md: Components requiring manual updates');
      console.log('   - validation-report.md: Validation results and recommendations');
      console.log('   - final-report.md: Comprehensive implementation summary\n');

    } catch (error) {
      console.error('❌ Error during i18n implementation:', error);
      await this.updateProgress('scanning', { errors: [(error as Error).message] });
      throw error;
    }
  }

  async runIncrementalUpdate(): Promise<void> {
    console.log('🔄 Running incremental i18n update...\n');

    // Scan only for new hardcoded strings
    const scanReport = await this.scanner.scanForHardcodedStrings();
    
    if (scanReport.totalHardcodedStrings === 0) {
      console.log('✨ No new hardcoded strings found!');
      return;
    }

    // Process only new strings
    const translationKeys = await this.translator.createTranslationKeys(scanReport.hardcodedStrings);
    await this.translator.updateTranslationFiles(translationKeys);
    
    console.log(`✅ Incremental update complete:`);
    console.log(`   - New strings found: ${scanReport.totalHardcodedStrings}`);
    console.log(`   - Translation keys added: ${translationKeys.length}`);
  }

  async validateOnly(): Promise<void> {
    console.log('🔍 Running i18n validation...\n');
    
    const validationResults = await this.validator.validateI18nImplementation();
    const completeness = await this.validator.checkTranslationCompleteness();
    
    console.log('Validation complete. Check validation-report.md for details.');
  }

  private async updateProgress(
    phase: I18nProgress['phase'],
    additionalData?: Partial<I18nProgress>
  ): Promise<void> {
    const progress: I18nProgress = {
      timestamp: new Date().toISOString(),
      phase,
      totalComponents: 0,
      processedComponents: 0,
      totalStrings: 0,
      translatedStrings: 0,
      languages: {
        en: { complete: true, coverage: 100, missingKeys: 0 },
        ko: { complete: false, coverage: 0, missingKeys: 0 },
        sw: { complete: false, coverage: 0, missingKeys: 0 },
        fr: { complete: false, coverage: 0, missingKeys: 0 },
        ne: { complete: false, coverage: 0, missingKeys: 0 },
        uz: { complete: false, coverage: 0, missingKeys: 0 }
      },
      errors: [],
      nextSteps: this.getNextSteps(phase),
      ...additionalData
    };

    await fs.promises.writeFile(this.progressPath, JSON.stringify(progress, null, 2));
  }

  private getNextSteps(phase: I18nProgress['phase']): string[] {
    switch (phase) {
      case 'scanning':
        return ['Review scan results', 'Prepare for translation key generation'];
      case 'translating':
        return ['Verify translation keys', 'Review auto-generated translations'];
      case 'implementing':
        return ['Test component updates', 'Handle manual updates'];
      case 'validating':
        return ['Fix validation errors', 'Add missing translations'];
      case 'completed':
        return ['Test all languages', 'Deploy changes', 'Monitor for issues'];
      default:
        return [];
    }
  }

  private async generateFinalReport(data: any): Promise<void> {
    const reportPath = path.join(this.projectPath, 'src', 'i18n', 'agents', 'final-report.md');
    
    let content = '# i18n Implementation Final Report\n\n';
    content += `Generated: ${new Date().toISOString()}\n\n`;
    
    content += '## Executive Summary\n\n';
    content += `This report summarizes the comprehensive i18n implementation for the AI4AgriWeather project.\n\n`;
    
    content += '### Key Achievements\n\n';
    content += `- ✅ Scanned ${data.scanReport.totalFiles} files\n`;
    content += `- ✅ Identified ${data.scanReport.totalHardcodedStrings} hardcoded strings\n`;
    content += `- ✅ Generated ${data.translationKeys} translation keys\n`;
    content += `- ✅ Updated ${data.componentUpdates} components automatically\n`;
    content += `- ✅ Supported 6 languages (EN, KO, SW, FR, NE, UZ)\n\n`;
    
    content += '### Language Coverage\n\n';
    data.completeness.forEach((percentage: number, lang: string) => {
      content += `- ${lang.toUpperCase()}: ${percentage}% complete\n`;
    });
    content += '\n';
    
    content += '## Components Updated\n\n';
    content += `The following ${data.scanReport.componentsNeedingI18n.length} components were processed:\n\n`;
    data.scanReport.componentsNeedingI18n.forEach((component: string) => {
      content += `- ${component}\n`;
    });
    content += '\n';
    
    content += '## Next Steps\n\n';
    content += '1. **Review Manual Updates**: Check `manual-updates.md` for components requiring manual intervention\n';
    content += '2. **Complete Translations**: Professional translation needed for FR, NE, UZ languages\n';
    content += '3. **Testing**: Test all components with different languages\n';
    content += '4. **Deployment**: Deploy the internationalized application\n';
    content += '5. **Monitoring**: Monitor for any missed strings or issues\n\n';
    
    content += '## Technical Details\n\n';
    content += '- **Framework**: React with react-i18next\n';
    content += '- **Translation Structure**: Nested JSON with categories\n';
    content += '- **Key Naming**: Category-based (e.g., `dashboard.welcome_message`)\n';
    content += '- **Language Detection**: Automatic browser detection\n\n';
    
    content += '## Maintenance Guidelines\n\n';
    content += '1. Always use `useTranslation` hook for new components\n';
    content += '2. Add translation keys before implementing features\n';
    content += '3. Run validation regularly to catch missing translations\n';
    content += '4. Use the incremental update feature for ongoing development\n';

    await fs.promises.writeFile(reportPath, content);
  }
}

// CLI Interface
if (require.main === module) {
  const coordinator = new I18nCoordinator(process.cwd());
  
  const command = process.argv[2];
  
  switch (command) {
    case 'full':
      coordinator.runFullI18nImplementation().catch(console.error);
      break;
    case 'incremental':
      coordinator.runIncrementalUpdate().catch(console.error);
      break;
    case 'validate':
      coordinator.validateOnly().catch(console.error);
      break;
    default:
      console.log('Usage: ts-node coordinator.ts [full|incremental|validate]');
      process.exit(1);
  }
}
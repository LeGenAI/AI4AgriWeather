#!/usr/bin/env ts-node

/**
 * Script to run the comprehensive i18n implementation using the agent system
 * 
 * Usage:
 * npx ts-node src/i18n/agents/run-i18n.ts [command]
 * 
 * Commands:
 * - full: Run full i18n implementation (scan, translate, implement, validate)
 * - scan: Only scan for hardcoded strings
 * - validate: Only validate existing i18n implementation
 * - incremental: Update only new hardcoded strings
 */

import * as path from 'path';
import { I18nCoordinator } from './coordinator';

// Get the project root (3 levels up from this script)
const projectPath = path.resolve(__dirname, '../../..');

async function main() {
  const command = process.argv[2] || 'full';
  const coordinator = new I18nCoordinator(projectPath);

  console.log(`🌍 AI4AgriWeather i18n Tool`);
  console.log(`📂 Project Path: ${projectPath}`);
  console.log(`🔧 Command: ${command}\n`);

  try {
    switch (command) {
      case 'full':
        console.log('🚀 Running comprehensive i18n implementation...\n');
        await coordinator.runFullI18nImplementation();
        break;

      case 'scan':
        console.log('🔍 Running scan only...\n');
        const { ScannerAgent } = await import('./scanner');
        const scanner = new ScannerAgent(projectPath);
        const scanReport = await scanner.scanForHardcodedStrings();
        await scanner.generateReport(scanReport);
        
        console.log('\n📊 Scan Summary:');
        console.log(`   - Total files: ${scanReport.totalFiles}`);
        console.log(`   - Files with hardcoded strings: ${scanReport.filesWithHardcodedStrings}`);
        console.log(`   - Total hardcoded strings: ${scanReport.totalHardcodedStrings}`);
        console.log(`   - Components needing i18n: ${scanReport.componentsNeedingI18n.length}`);
        break;

      case 'validate':
        console.log('✅ Running validation only...\n');
        await coordinator.validateOnly();
        break;

      case 'incremental':
        console.log('🔄 Running incremental update...\n');
        await coordinator.runIncrementalUpdate();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('\n📖 Available commands:');
        console.log('   - full: Run full i18n implementation');
        console.log('   - scan: Only scan for hardcoded strings');
        console.log('   - validate: Only validate existing i18n');
        console.log('   - incremental: Update only new strings');
        process.exit(1);
    }

    console.log('\n✨ Done!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}
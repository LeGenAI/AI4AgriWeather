#!/usr/bin/env node

import { ScannerAgent } from './scanner';
import * as path from 'path';

async function runScanner() {
  console.log('🚀 Starting Scanner Agent for i18n analysis...\n');
  
  // Get project root (3 levels up from current script)
  const projectPath = path.resolve(__dirname, '../../..');
  
  const scanner = new ScannerAgent(projectPath);
  
  try {
    // Run the scan
    const scanReport = await scanner.scanForHardcodedStrings();
    
    // Generate and save the report
    await scanner.generateReport(scanReport);
    
    // Print detailed results
    console.log('\n📊 Detailed Scan Results:\n');
    console.log(`Total files scanned: ${scanReport.totalFiles}`);
    console.log(`Files with hardcoded strings: ${scanReport.filesWithHardcodedStrings}`);
    console.log(`Total hardcoded strings found: ${scanReport.totalHardcodedStrings}`);
    console.log(`\nComponents needing i18n (${scanReport.componentsNeedingI18n.length} total):`);
    
    // Sort components by priority (AuthForm and AgriOnboarding first)
    const priorityComponents = ['AuthForm', 'AgriOnboarding'];
    const sortedComponents = [
      ...scanReport.componentsNeedingI18n.filter(c => priorityComponents.includes(c)),
      ...scanReport.componentsNeedingI18n.filter(c => !priorityComponents.includes(c))
    ];
    
    sortedComponents.forEach(component => {
      const priority = priorityComponents.includes(component) ? '⭐ ' : '   ';
      console.log(`${priority}${component}`);
    });
    
    // Show hardcoded strings for priority components
    console.log('\n📝 Hardcoded Strings in Priority Components:\n');
    
    priorityComponents.forEach(componentName => {
      const componentStrings = scanReport.hardcodedStrings.filter(
        str => str.componentName === componentName
      );
      
      if (componentStrings.length > 0) {
        console.log(`\n${componentName} (${componentStrings.length} strings):`);
        console.log('─'.repeat(60));
        
        componentStrings.forEach(str => {
          console.log(`  Line ${str.line}: "${str.text}"`);
          console.log(`  Context: ${str.context}`);
          console.log('');
        });
      }
    });
    
    // Summary of all hardcoded strings by component
    console.log('\n📊 Summary of All Components:\n');
    
    const componentSummary = new Map<string, number>();
    scanReport.hardcodedStrings.forEach(str => {
      const count = componentSummary.get(str.componentName) || 0;
      componentSummary.set(str.componentName, count + 1);
    });
    
    // Sort by string count (descending)
    const sortedSummary = Array.from(componentSummary.entries())
      .sort((a, b) => b[1] - a[1]);
    
    sortedSummary.forEach(([component, count]) => {
      const priority = priorityComponents.includes(component) ? '⭐' : ' ';
      console.log(`${priority} ${component}: ${count} strings`);
    });
    
    // Check which components already use i18n
    console.log('\n✅ Components Already Using i18n:\n');
    const componentsWithI18n = await scanner.getComponentsUsingI18n();
    componentsWithI18n.forEach(component => {
      console.log(`   ${component}`);
    });
    
    console.log(`\n📄 Full report saved to: ${path.join(projectPath, 'src/i18n/agents/scan-report.json')}`);
    
  } catch (error) {
    console.error('❌ Error during scanning:', error);
    process.exit(1);
  }
}

// Run the scanner
runScanner();
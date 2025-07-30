import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { ComponentUpdate, HardcodedString, TranslationKey } from './types';

export class ImplementerAgent {
  private srcPath: string;
  private translationKeyMap: Map<string, string> = new Map();

  constructor(projectPath: string) {
    this.srcPath = path.join(projectPath, 'src');
  }

  async implementI18n(
    hardcodedStrings: HardcodedString[],
    translationKeys: TranslationKey[]
  ): Promise<ComponentUpdate[]> {
    console.log('🔧 Implementer Agent: Starting i18n implementation...');

    // Build translation key map
    this.buildTranslationKeyMap(hardcodedStrings, translationKeys);

    // Group hardcoded strings by file
    const fileGroups = this.groupByFile(hardcodedStrings);
    const updates: ComponentUpdate[] = [];

    for (const [filePath, strings] of fileGroups.entries()) {
      const update = await this.updateComponent(filePath, strings);
      if (update) {
        updates.push(update);
      }
    }

    console.log(`✅ Implementer Agent: Updated ${updates.length} components!`);
    return updates;
  }

  private buildTranslationKeyMap(
    hardcodedStrings: HardcodedString[],
    translationKeys: TranslationKey[]
  ): void {
    translationKeys.forEach(tk => {
      const matchingString = hardcodedStrings.find(hs => hs.text === tk.value);
      if (matchingString) {
        this.translationKeyMap.set(matchingString.text, tk.key);
      }
    });
  }

  private groupByFile(hardcodedStrings: HardcodedString[]): Map<string, HardcodedString[]> {
    const groups = new Map<string, HardcodedString[]>();
    
    hardcodedStrings.forEach(item => {
      if (!groups.has(item.file)) {
        groups.set(item.file, []);
      }
      groups.get(item.file)!.push(item);
    });

    return groups;
  }

  async updateComponent(filePath: string, hardcodedStrings: HardcodedString[]): Promise<ComponentUpdate | null> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const componentName = path.basename(filePath, path.extname(filePath));

      // Parse the file
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      let hasChanges = false;
      let needsImport = !content.includes('useTranslation');
      let needsReactImport = false;

      // Track updates for reporting
      const updates: ComponentUpdate['updates'] = [];

      // Traverse and update the AST
      traverse(ast, {
        // Update JSX text
        JSXText(path) {
          const text = path.node.value.trim();
          if (text && this.translationKeyMap.has(text)) {
            const key = this.translationKeyMap.get(text)!;
            
            // Replace with {t('key')}
            path.replaceWith(
              t.jsxExpressionContainer(
                t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
              )
            );
            hasChanges = true;
          }
        },

        // Update string literals in specific props
        JSXAttribute(path) {
          const name = path.node.name.name;
          const targetProps = ['title', 'label', 'placeholder', 'alt', 'content'];
          
          if (targetProps.includes(name as string) && t.isStringLiteral(path.node.value)) {
            const text = path.node.value.value;
            if (this.translationKeyMap.has(text)) {
              const key = this.translationKeyMap.get(text)!;
              
              // Replace with {t('key')}
              path.node.value = t.jsxExpressionContainer(
                t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
              );
              hasChanges = true;
            }
          }
        },

        // Add useTranslation hook if needed
        Program: {
          exit(path) {
            if (hasChanges && needsImport) {
              // Add import for useTranslation
              const importDeclaration = t.importDeclaration(
                [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
                t.stringLiteral('react-i18next')
              );
              path.node.body.unshift(importDeclaration);
            }
          }
        },

        // Add useTranslation hook to function components
        FunctionDeclaration(path) {
          if (hasChanges && needsImport) {
            this.addUseTranslationHook(path);
          }
        },

        ArrowFunctionExpression(path) {
          if (hasChanges && needsImport) {
            // Check if this is a React component
            const parent = path.parent;
            if (t.isVariableDeclarator(parent) && /^[A-Z]/.test((parent.id as any).name)) {
              this.addUseTranslationHook(path);
            }
          }
        }
      });

      if (hasChanges) {
        // Generate the updated code
        const output = generate(ast, {}, content);
        await fs.promises.writeFile(filePath, output.code);

        return {
          filePath,
          componentName,
          updates
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error);
      return null;
    }
  }

  private addUseTranslationHook(path: any): void {
    const body = path.node.body.body || path.node.body;
    
    if (Array.isArray(body)) {
      // Add const { t } = useTranslation(); at the beginning
      const useTranslationCall = t.variableDeclaration('const', [
        t.variableDeclarator(
          t.objectPattern([t.objectProperty(t.identifier('t'), t.identifier('t'), false, true)]),
          t.callExpression(t.identifier('useTranslation'), [])
        )
      ]);

      body.unshift(useTranslationCall);
    }
  }

  async createManualUpdateGuide(updates: ComponentUpdate[]): Promise<void> {
    const guidePath = path.join(this.srcPath, 'i18n', 'agents', 'manual-updates.md');
    
    let content = '# Manual i18n Updates Required\n\n';
    content += 'The following components need manual review and updates:\n\n';

    for (const update of updates) {
      content += `## ${update.componentName}\n`;
      content += `File: ${update.filePath}\n\n`;
      content += '### Changes:\n';
      
      for (const change of update.updates) {
        content += `- Line ${change.line}: Replace \`"${change.oldText}"\` with \`{t('${change.newKey}')}\`\n`;
      }
      content += '\n';
    }

    content += '## Implementation Steps:\n\n';
    content += '1. Add import: `import { useTranslation } from \'react-i18next\';`\n';
    content += '2. Add hook in component: `const { t } = useTranslation();`\n';
    content += '3. Replace hardcoded strings with `t(\'key\')`\n';
    content += '4. Test the component with different languages\n';

    await fs.promises.writeFile(guidePath, content);
    console.log(`📋 Manual update guide created at: ${guidePath}`);
  }

  async updateI18nConfig(languages: string[]): Promise<void> {
    const configPath = path.join(this.srcPath, 'i18n', 'index.ts');
    
    try {
      let content = await fs.promises.readFile(configPath, 'utf-8');
      
      // Update supportedLngs
      const supportedLngsRegex = /supportedLngs:\s*\[[^\]]*\]/;
      const newSupportedLngs = `supportedLngs: [${languages.map(lang => `'${lang}'`).join(', ')}]`;
      content = content.replace(supportedLngsRegex, newSupportedLngs);

      // Ensure all language imports are present
      for (const lang of languages) {
        if (!content.includes(`${lang} from './locales/${lang}.json'`)) {
          // Add import
          const importStatement = `import ${lang} from './locales/${lang}.json';`;
          content = content.replace(/^(import.*from.*;\n)+/m, `$&${importStatement}\n`);
          
          // Add to resources
          const resourcesRegex = /resources:\s*{([^}]*)}/;
          content = content.replace(resourcesRegex, (match, p1) => {
            if (!p1.includes(`${lang}:`)) {
              return `resources: {${p1}\n    ${lang}: { translation: ${lang} },\n  }`;
            }
            return match;
          });
        }
      }

      await fs.promises.writeFile(configPath, content);
      console.log('✅ i18n configuration updated!');
    } catch (error) {
      console.error('❌ Error updating i18n config:', error);
    }
  }
}
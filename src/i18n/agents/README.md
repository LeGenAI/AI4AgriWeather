# i18n Agent System for AI4AgriWeather

## Overview
This directory contains the collaborative agent system for comprehensive internationalization (i18n) implementation across the AI4AgriWeather project.

## Supported Languages
- 🇺🇸 English (en)
- 🇰🇷 Korean (ko)
- 🇹🇿 Swahili (sw)
- 🇫🇷 French (fr)
- 🇳🇵 Nepali (ne)
- 🇺🇿 Uzbek (uz)

## Agent Roles

### 1. Scanner Agent (`scanner.ts`)
- **Role**: Scans codebase for hardcoded strings
- **Tasks**:
  - Identify components with untranslated text
  - Extract hardcoded strings
  - Generate reports of missing translations

### 2. Translator Agent (`translator.ts`)
- **Role**: Manages translation keys and content
- **Tasks**:
  - Create consistent translation keys
  - Coordinate with translation services
  - Maintain translation quality

### 3. Implementer Agent (`implementer.ts`)
- **Role**: Updates components with i18n
- **Tasks**:
  - Add useTranslation hooks
  - Replace hardcoded strings with translation keys
  - Ensure proper key usage

### 4. Validator Agent (`validator.ts`)
- **Role**: Validates i18n implementation
- **Tasks**:
  - Check for missing translations
  - Validate key consistency
  - Test language switching

### 5. Coordinator Agent (`coordinator.ts`)
- **Role**: Orchestrates all agents
- **Tasks**:
  - Manage workflow between agents
  - Track progress
  - Generate reports

## Workflow

1. **Scan Phase**: Scanner Agent identifies all components needing i18n
2. **Translation Phase**: Translator Agent creates/updates translation files
3. **Implementation Phase**: Implementer Agent updates components
4. **Validation Phase**: Validator Agent ensures completeness
5. **Coordination**: Coordinator Agent manages the entire process

## Usage

```typescript
import { I18nCoordinator } from './coordinator';

const coordinator = new I18nCoordinator();
await coordinator.runFullI18nImplementation();
```

## Progress Tracking

Progress is tracked in `progress.json` with the following structure:
- Components scanned
- Components updated
- Translation coverage per language
- Validation results
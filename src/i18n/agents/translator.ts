import * as fs from 'fs';
import * as path from 'path';
import { HardcodedString } from './types';

interface TranslationKey {
  key: string;
  value: string;
  context?: string;
  component?: string;
}

interface TranslationMap {
  [key: string]: string | TranslationMap;
}

export class TranslatorAgent {
  private localesPath: string;
  private supportedLanguages = ['en', 'ko', 'sw', 'fr', 'ne', 'uz'];
  private translationCache: Map<string, TranslationMap> = new Map();

  constructor(projectPath: string) {
    this.localesPath = path.join(projectPath, 'src', 'i18n', 'locales');
  }

  async loadExistingTranslations(): Promise<void> {
    console.log('📚 Translator Agent: Loading existing translations...');
    
    for (const lang of this.supportedLanguages) {
      const filePath = path.join(this.localesPath, `${lang}.json`);
      if (fs.existsSync(filePath)) {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        this.translationCache.set(lang, JSON.parse(content));
      } else {
        this.translationCache.set(lang, this.getEmptyTranslationStructure());
      }
    }
  }

  generateTranslationKey(text: string, context: string, component: string): string {
    // Clean the text for key generation
    const cleanText = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);

    // Determine the category based on component and context
    const category = this.determineCategory(component, context);
    
    // Generate a meaningful key
    return `${category}.${cleanText}`;
  }

  private determineCategory(component: string, context: string): string {
    // Map components to categories
    const componentMap: { [key: string]: string } = {
      'AuthForm': 'auth',
      'AgriOnboarding': 'onboarding',
      'DashboardHeader': 'dashboard',
      'Dashboard': 'dashboard',
      'WeatherCenter': 'weather',
      'WeatherSummary': 'weather',
      'CropManagement': 'crops',
      'CropCard': 'crops',
      'AgriChat': 'chat',
      'KnowledgeBase': 'knowledge',
      'Profile': 'profile',
      'Settings': 'settings'
    };

    // Check component mapping first
    for (const [key, value] of Object.entries(componentMap)) {
      if (component.includes(key)) {
        return value;
      }
    }

    // Check context for clues
    const contextLower = context.toLowerCase();
    if (contextLower.includes('error')) return 'errors';
    if (contextLower.includes('success')) return 'success';
    if (contextLower.includes('validation')) return 'validation';
    if (contextLower.includes('notification')) return 'notifications';
    if (contextLower.includes('button')) return 'common';
    if (contextLower.includes('title')) return 'common';

    return 'common';
  }

  async createTranslationKeys(hardcodedStrings: HardcodedString[]): Promise<TranslationKey[]> {
    console.log('🔑 Translator Agent: Generating translation keys...');
    
    const translationKeys: TranslationKey[] = [];
    const processedTexts = new Set<string>();

    for (const item of hardcodedStrings) {
      // Skip if we've already processed this text
      if (processedTexts.has(item.text)) {
        continue;
      }

      const key = this.generateTranslationKey(item.text, item.context, item.componentName);
      translationKeys.push({
        key,
        value: item.text,
        context: item.context,
        component: item.componentName
      });

      processedTexts.add(item.text);
    }

    return translationKeys;
  }

  async updateTranslationFiles(translationKeys: TranslationKey[]): Promise<void> {
    console.log('📝 Translator Agent: Updating translation files...');

    // Ensure locales directory exists
    if (!fs.existsSync(this.localesPath)) {
      await fs.promises.mkdir(this.localesPath, { recursive: true });
    }

    // Load existing translations
    await this.loadExistingTranslations();

    // Update each language file
    for (const lang of this.supportedLanguages) {
      const translations = this.translationCache.get(lang) || {};
      
      // Add new keys
      for (const item of translationKeys) {
        this.setNestedValue(translations, item.key, this.getTranslatedValue(item.value, lang));
      }

      // Save updated translations
      const filePath = path.join(this.localesPath, `${lang}.json`);
      await fs.promises.writeFile(
        filePath,
        JSON.stringify(translations, null, 2),
        'utf-8'
      );
    }

    console.log('✅ Translator Agent: Translation files updated successfully!');
  }

  private setNestedValue(obj: any, key: string, value: string): void {
    const keys = key.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  private getTranslatedValue(text: string, language: string): string {
    // For now, return placeholder translations
    // In production, this would integrate with translation services
    const translations: { [key: string]: { [lang: string]: string } } = {
      // Common translations
      'Save': { ko: '저장', sw: 'Hifadhi', fr: 'Enregistrer', ne: 'बचत गर्नुहोस्', uz: 'Saqlash' },
      'Cancel': { ko: '취소', sw: 'Ghairi', fr: 'Annuler', ne: 'रद्द गर्नुहोस्', uz: 'Bekor qilish' },
      'Submit': { ko: '제출', sw: 'Wasilisha', fr: 'Soumettre', ne: 'पेश गर्नुहोस्', uz: 'Yuborish' },
      'Loading': { ko: '로딩 중', sw: 'Inapakia', fr: 'Chargement', ne: 'लोड हुँदैछ', uz: 'Yuklanmoqda' },
      'Error': { ko: '오류', sw: 'Kosa', fr: 'Erreur', ne: 'त्रुटि', uz: 'Xato' },
      'Success': { ko: '성공', sw: 'Mafanikio', fr: 'Succès', ne: 'सफलता', uz: 'Muvaffaqiyat' },
      'Welcome': { ko: '환영합니다', sw: 'Karibu', fr: 'Bienvenue', ne: 'स्वागत छ', uz: 'Xush kelibsiz' },
      'Sign In': { ko: '로그인', sw: 'Ingia', fr: 'Se connecter', ne: 'साइन इन', uz: 'Kirish' },
      'Sign Out': { ko: '로그아웃', sw: 'Ondoka', fr: 'Se déconnecter', ne: 'साइन आउट', uz: 'Chiqish' },
      'Profile': { ko: '프로필', sw: 'Wasifu', fr: 'Profil', ne: 'प्रोफाइल', uz: 'Profil' },
      'Settings': { ko: '설정', sw: 'Mipangilio', fr: 'Paramètres', ne: 'सेटिङहरू', uz: 'Sozlamalar' },
      'Dashboard': { ko: '대시보드', sw: 'Dashibodi', fr: 'Tableau de bord', ne: 'ड्यासबोर्ड', uz: 'Boshqaruv paneli' },
      'Search': { ko: '검색', sw: 'Tafuta', fr: 'Rechercher', ne: 'खोज्नुहोस्', uz: 'Qidirish' },
      'Filter': { ko: '필터', sw: 'Chuja', fr: 'Filtrer', ne: 'फिल्टर', uz: 'Filtr' },
      'Add': { ko: '추가', sw: 'Ongeza', fr: 'Ajouter', ne: 'थप्नुहोस्', uz: 'Qo\'shish' },
      'Edit': { ko: '편집', sw: 'Hariri', fr: 'Modifier', ne: 'सम्पादन', uz: 'Tahrirlash' },
      'Delete': { ko: '삭제', sw: 'Futa', fr: 'Supprimer', ne: 'मेटाउनुहोस्', uz: 'O\'chirish' },
      'Confirm': { ko: '확인', sw: 'Thibitisha', fr: 'Confirmer', ne: 'पुष्टि गर्नुहोस्', uz: 'Tasdiqlash' },
    };

    // Check if we have a predefined translation
    if (translations[text] && translations[text][language]) {
      return translations[text][language];
    }

    // For demonstration, return original text for non-English
    // In production, use translation API
    return language === 'en' ? text : `[${language}] ${text}`;
  }

  private getEmptyTranslationStructure(): TranslationMap {
    return {
      common: {},
      auth: {},
      onboarding: {},
      navigation: {},
      dashboard: {},
      weather: {},
      crops: {},
      chat: {},
      knowledge: {},
      profile: {},
      settings: {},
      errors: {},
      success: {},
      validation: {},
      notifications: {}
    };
  }

  async validateTranslations(): Promise<{ missing: string[]; incomplete: string[] }> {
    const missing: string[] = [];
    const incomplete: string[] = [];

    // Check if all language files exist
    for (const lang of this.supportedLanguages) {
      const filePath = path.join(this.localesPath, `${lang}.json`);
      if (!fs.existsSync(filePath)) {
        missing.push(lang);
      }
    }

    // TODO: Check for incomplete translations (keys present in one language but not others)

    return { missing, incomplete };
  }
}
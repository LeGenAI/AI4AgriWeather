import i18n from '@/i18n';

export const ensureI18nInitialized = async () => {
  if (!i18n.isInitialized) {
    console.log('Waiting for i18n to initialize...');
    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (i18n.isInitialized) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 50);
    });
  }
  
  console.log('i18n initialization status:', {
    isInitialized: i18n.isInitialized,
    language: i18n.language,
    resolvedLanguage: i18n.resolvedLanguage,
    hasLoadedNamespace: i18n.hasLoadedNamespace('translation'),
    supportedLngs: i18n.options.supportedLngs,
    resources: Object.keys(i18n.store?.data || {})
  });
  
  return true;
};

export const debugI18n = () => {
  console.group('🌐 i18n Debug Information');
  console.log('Current Language:', i18n.language);
  console.log('Resolved Language:', i18n.resolvedLanguage);
  console.log('Is Initialized:', i18n.isInitialized);
  console.log('Supported Languages:', i18n.options.supportedLngs);
  console.log('Store Data Keys:', Object.keys(i18n.store?.data || {}));
  console.log('Current Translations:', i18n.getResourceBundle(i18n.language, 'translation'));
  console.log('Test Translation (common.welcome):', i18n.t('common.welcome'));
  console.groupEnd();
};
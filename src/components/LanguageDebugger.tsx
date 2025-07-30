import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageDebugger: React.FC = () => {
  const { t, i18n } = useTranslation();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h4 className="font-bold mb-2">i18n Debug Info</h4>
      <div>Current Language: {i18n.language}</div>
      <div>Resolved Language: {i18n.resolvedLanguage}</div>
      <div>Supported Languages: {i18n.options.supportedLngs?.join(', ')}</div>
      <div>Is Initialized: {i18n.isInitialized ? 'Yes' : 'No'}</div>
      <div>Has Loaded Namespace: {i18n.hasLoadedNamespace('translation') ? 'Yes' : 'No'}</div>
      <div>Test Translation: {t('common.welcome')}</div>
      <div className="mt-2">
        <button 
          onClick={() => {
            console.log('i18n store:', i18n.store);
            console.log('i18n options:', i18n.options);
            console.log('Resources:', i18n.getResourceBundle(i18n.language, 'translation'));
          }}
          className="bg-white text-black px-2 py-1 rounded text-xs"
        >
          Log Details
        </button>
      </div>
    </div>
  );
};

export default LanguageDebugger;
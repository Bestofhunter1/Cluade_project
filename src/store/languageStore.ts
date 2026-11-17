import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';
import type { Language } from '../types';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  initLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'th',

      setLanguage: (lang: Language) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },

      initLanguage: () => {
        const savedLang = localStorage.getItem('language') as Language | null;
        if (savedLang && (savedLang === 'th' || savedLang === 'en')) {
          i18n.changeLanguage(savedLang);
          set({ language: savedLang });
        } else {
          i18n.changeLanguage('th');
          set({ language: 'th' });
        }
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

export const useLanguage = useLanguageStore;
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hu';

// Translation type
type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

// English translations
const en: Translations = {
  // Header
  header: {
    title: 'Visual Editor',
    subtitle: 'CSS & Tailwind Property Inspector',
  },
  // Tabs
  tabs: {
    edit: 'EDIT',
    prompt: 'PROMPT',
    code: 'CODE',
  },
  // Preview
  preview: {
    title: 'Preview',
    saved: 'SAVED',
    codeMode: 'Code Mode',
    customTag: '<custom>',
    enterHtml: 'Enter HTML code...',
  },
  // Prompt tab
  prompt: {
    label: 'Describe what you want to change:',
    placeholder: 'E.g: Make corners rounder and text dark blue...',
    selected: 'Selected:',
    noClasses: 'No classes',
    apply: 'Apply with AI',
    processing: 'Processing...',
    cancel: 'Cancel',
    quickSuggestions: 'Quick suggestions:',
    suggestions: {
      rounderCorners: 'Rounder corners',
      biggerShadow: 'Bigger shadow',
      blueBackground: 'Blue background',
      centerAlign: 'Center alignment',
      boldText: 'Bold text',
    },
    success: 'Styles applied successfully!',
    aiApplied: 'AI Styles Applied',
    changesSuccess: 'Changes executed successfully.',
    error: 'Error occurred',
    aiError: 'Could not process AI request.',
  },
  // Code tab
  code: {
    html: 'HTML',
    css: 'CSS',
    htmlPlaceholder: '<div class="my-element">Text...</div>',
    cssPlaceholder: '.my-element { color: red; }',
    previewInfo: 'Result is visible in the Preview panel on the right',
    customCodeMode: 'Custom code mode',
    clear: 'Clear',
    copy: 'Copy',
    save: 'Save',
    copied: 'Copied!',
    codeCopied: 'Code copied to clipboard.',
    saved: 'Saved!',
    codeFixed: 'Code fixed in preview panel.',
  },
  // Sections
  sections: {
    element: 'Element',
    textContent: 'Text Content',
    padding: 'Padding',
    margin: 'Margin',
    size: 'Size',
    position: 'Position',
    typography: 'Typography',
    appearance: 'Appearance',
    border: 'Border',
    effects: 'Effects',
    transforms: 'Transforms',
    transforms3d: '3D Transforms',
    tailwind: 'Tailwind Classes',
    inlineCss: 'Inline CSS',
  },
  // Buttons
  buttons: {
    reset: 'Reset',
    select: 'Select',
    themeCustomizer: 'Theme Customizer',
    save: 'Save',
    close: 'Close',
    templates: 'Templates',
    presets: 'Presets',
    export: 'Export',
  },
  // Breakpoints
  breakpoints: {
    all: 'All',
  },
  // Templates
  templates: {
    title: 'Component Templates',
    search: 'Search templates...',
    categories: {
      all: 'All',
      buttons: 'Buttons',
      cards: 'Cards',
      inputs: 'Inputs',
      navigation: 'Navigation',
      layout: 'Layout',
    },
    apply: 'Apply Template',
    noResults: 'No templates found',
  },
  // Presets
  presets: {
    title: 'Style Presets',
    search: 'Search presets...',
    saveNew: 'Save Current as Preset',
    name: 'Preset name',
    description: 'Description (optional)',
    category: 'Category',
    makePublic: 'Make public',
    save: 'Save Preset',
    cancel: 'Cancel',
    load: 'Load',
    delete: 'Delete',
    noPresets: 'No presets saved yet',
    saved: 'Preset Saved',
    savedDesc: 'Your style preset has been saved.',
    loaded: 'Preset Loaded',
    loadedDesc: 'Style preset applied successfully.',
    deleted: 'Preset Deleted',
    deletedDesc: 'Style preset has been removed.',
    categories: {
      custom: 'Custom',
      typography: 'Typography',
      layout: 'Layout',
      effects: 'Effects',
      colors: 'Colors',
    },
  },
  // Export
  export: {
    title: 'Export Component',
    componentName: 'Component name',
    includeProps: 'Include props interface',
    includeComments: 'Include comments',
    preview: 'Preview',
    download: 'Download .tsx',
    copyCode: 'Copy Code',
    copied: 'Code Copied!',
    copiedDesc: 'React component copied to clipboard.',
  },
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    close: 'Close',
  },
};

// Hungarian translations
const hu: Translations = {
  // Header
  header: {
    title: 'Vizuális Szerkesztő',
    subtitle: 'CSS & Tailwind Tulajdonság Vizsgáló',
  },
  // Tabs
  tabs: {
    edit: 'SZERK',
    prompt: 'PROMPT',
    code: 'KÓD',
  },
  // Preview
  preview: {
    title: 'Előnézet',
    saved: 'MENTETT',
    codeMode: 'Kód mód',
    customTag: '<egyedi>',
    enterHtml: 'Adj meg HTML kódot...',
  },
  // Prompt tab
  prompt: {
    label: 'Írd le mit szeretnél változtatni:',
    placeholder: 'Pl: Legyen kerekebb a sarka és sötétkék a szöveg...',
    selected: 'Kiválasztva:',
    noClasses: 'Nincsenek osztályok',
    apply: 'Alkalmazás AI-val',
    processing: 'Feldolgozás...',
    cancel: 'Mégse',
    quickSuggestions: 'Gyors javaslatok:',
    suggestions: {
      rounderCorners: 'Kerekebb sarkok',
      biggerShadow: 'Nagyobb árnyék',
      blueBackground: 'Kék háttér',
      centerAlign: 'Középre igazítás',
      boldText: 'Félkövér betűk',
    },
    success: 'Stílusok sikeresen alkalmazva!',
    aiApplied: 'AI Stílusok alkalmazva',
    changesSuccess: 'A változtatások sikeresen végrehajtva.',
    error: 'Hiba történt',
    aiError: 'Nem sikerült az AI kérés feldolgozása.',
  },
  // Code tab
  code: {
    html: 'HTML',
    css: 'CSS',
    htmlPlaceholder: '<div class="my-element">Szöveg...</div>',
    cssPlaceholder: '.my-element { color: red; }',
    previewInfo: 'Az eredmény a jobb oldali Előnézet panelben látható',
    customCodeMode: 'Egyedi kód mód',
    clear: 'Törlés',
    copy: 'Másolás',
    save: 'Mentés',
    copied: 'Másolva!',
    codeCopied: 'A kód a vágólapra került.',
    saved: 'Mentve!',
    codeFixed: 'A kód fixálva az előnézeti panelben.',
  },
  // Sections
  sections: {
    element: 'Elem',
    textContent: 'Szöveg tartalom',
    padding: 'Belső margó (Padding)',
    margin: 'Külső margó (Margin)',
    size: 'Méret',
    position: 'Pozíció',
    typography: 'Tipográfia',
    appearance: 'Megjelenés',
    border: 'Keret',
    effects: 'Effektek',
    transforms: 'Transzformációk',
    transforms3d: '3D Transzformációk',
    tailwind: 'Tailwind Osztályok',
    inlineCss: 'Inline CSS',
  },
  // Buttons
  buttons: {
    reset: 'Visszaállítás',
    select: 'Kiválasztás',
    themeCustomizer: 'Téma testreszabás',
    save: 'Mentés',
    close: 'Bezárás',
    templates: 'Sablonok',
    presets: 'Presetek',
    export: 'Exportálás',
  },
  // Breakpoints
  breakpoints: {
    all: 'Mind',
  },
  // Templates
  templates: {
    title: 'Komponens Sablonok',
    search: 'Sablonok keresése...',
    categories: {
      all: 'Összes',
      buttons: 'Gombok',
      cards: 'Kártyák',
      inputs: 'Beviteli mezők',
      navigation: 'Navigáció',
      layout: 'Elrendezés',
    },
    apply: 'Sablon alkalmazása',
    noResults: 'Nem található sablon',
  },
  // Presets
  presets: {
    title: 'Stílus Presetek',
    search: 'Presetek keresése...',
    saveNew: 'Jelenlegi mentése presetként',
    name: 'Preset neve',
    description: 'Leírás (opcionális)',
    category: 'Kategória',
    makePublic: 'Nyilvánossá tétel',
    save: 'Preset mentése',
    cancel: 'Mégse',
    load: 'Betöltés',
    delete: 'Törlés',
    noPresets: 'Még nincs mentett preset',
    saved: 'Preset mentve',
    savedDesc: 'A stílus preset mentésre került.',
    loaded: 'Preset betöltve',
    loadedDesc: 'Stílus preset sikeresen alkalmazva.',
    deleted: 'Preset törölve',
    deletedDesc: 'A stílus preset el lett távolítva.',
    categories: {
      custom: 'Egyedi',
      typography: 'Tipográfia',
      layout: 'Elrendezés',
      effects: 'Effektek',
      colors: 'Színek',
    },
  },
  // Export
  export: {
    title: 'Komponens exportálása',
    componentName: 'Komponens neve',
    includeProps: 'Props interfész hozzáadása',
    includeComments: 'Megjegyzések hozzáadása',
    preview: 'Előnézet',
    download: '.tsx letöltése',
    copyCode: 'Kód másolása',
    copied: 'Kód másolva!',
    copiedDesc: 'React komponens a vágólapra másolva.',
  },
  // Common
  common: {
    loading: 'Betöltés...',
    error: 'Hiba',
    success: 'Sikeres',
    confirm: 'Megerősítés',
    cancel: 'Mégse',
    delete: 'Törlés',
    edit: 'Szerkesztés',
    save: 'Mentés',
    close: 'Bezárás',
  },
};

const translations: Record<Language, Translations> = { en, hu };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('app-language');
    return (stored === 'en' || stored === 'hu') ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function with dot notation support
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: TranslationValue = translations[language];
    
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        value = translations.en;
        for (const fallbackKey of keys) {
          if (typeof value === 'object' && value !== null && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

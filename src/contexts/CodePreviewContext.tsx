import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { InspectorState } from '@/components/PropertyInspector/types';
import { DEFAULT_INSPECTOR_STATE } from '@/components/PropertyInspector/constants';

interface CodePreviewContextType {
  customHtml: string;
  customCss: string;
  setCustomHtml: (html: string) => void;
  setCustomCss: (css: string) => void;
  isCodeMode: boolean;
  setIsCodeMode: (mode: boolean) => void;
  savedHtml: string;
  savedCss: string;
  saveCode: () => void;
  clearSavedCode: () => void;
  hasSavedCode: boolean;
  showThemeCustomizer: boolean;
  setShowThemeCustomizer: (show: boolean) => void;
  inspectorState: InspectorState;
  setInspectorState: (state: InspectorState) => void;
  generatedClasses: string;
  setGeneratedClasses: (classes: string) => void;
}

const CodePreviewContext = createContext<CodePreviewContextType | undefined>(undefined);

export const CodePreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customHtml, setCustomHtml] = useState('<div class="custom-box">Hello World</div>');
  const [customCss, setCustomCss] = useState(`.custom-box {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
}`);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [savedHtml, setSavedHtml] = useState('');
  const [savedCss, setSavedCss] = useState('');
  const [hasSavedCode, setHasSavedCode] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(true);
  const [inspectorState, setInspectorStateInternal] = useState<InspectorState>(DEFAULT_INSPECTOR_STATE);
  const [generatedClasses, setGeneratedClasses] = useState('');

  // FIX: useRef a hasSavedCode aktuális értékéhez (elkerüli a dependency loop-ot)
  const hasSavedCodeRef = useRef(hasSavedCode);
  hasSavedCodeRef.current = hasSavedCode;

  // Mentett kód mentése
  const saveCode = useCallback(() => {
    setSavedHtml(customHtml);
    setSavedCss(customCss);
    setHasSavedCode(true);
  }, [customHtml, customCss]);

  // Mentett kód törlése (CLEAR gomb funkció)
  const clearSavedCode = useCallback(() => {
    setSavedHtml('');
    setSavedCss('');
    setHasSavedCode(false);
  }, []);

  // FIX: Inspector state setter auto-clear funkcióval - STABIL dependency array
  const setInspectorState = useCallback((state: InspectorState) => {
    setInspectorStateInternal(state);
    
    // Auto-clear: hasSavedCodeRef.current használata a dependency loop elkerülésére
    if (hasSavedCodeRef.current) {
      setSavedHtml('');
      setSavedCss('');
      setHasSavedCode(false);
    }
  }, []); // FIX: Üres dependency array, mert ref-et használunk

  return (
    <CodePreviewContext.Provider value={{
      customHtml,
      customCss,
      setCustomHtml,
      setCustomCss,
      isCodeMode,
      setIsCodeMode,
      savedHtml,
      savedCss,
      saveCode,
      clearSavedCode,
      hasSavedCode,
      showThemeCustomizer,
      setShowThemeCustomizer,
      inspectorState,
      setInspectorState,
      generatedClasses,
      setGeneratedClasses
    }}>
      {children}
    </CodePreviewContext.Provider>
  );
};

export const useCodePreview = () => {
  const context = useContext(CodePreviewContext);
  if (!context) {
    throw new Error('useCodePreview must be used within a CodePreviewProvider');
  }
  return context;
};

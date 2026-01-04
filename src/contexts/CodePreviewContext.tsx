import React, { createContext, useContext, useState } from 'react';
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
  const [inspectorState, setInspectorState] = useState<InspectorState>(DEFAULT_INSPECTOR_STATE);
  const [generatedClasses, setGeneratedClasses] = useState('');

  const saveCode = () => {
    setSavedHtml(customHtml);
    setSavedCss(customCss);
    setHasSavedCode(true);
  };

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

// src/components/PropertyInspector/index.tsx
// PropertyInspector - Main Component
// Component-centric props editor with real-time preview

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Eye, Save, Laptop, Send, Sparkles, 
  Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Accordion } from '../ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCodePreview } from '@/contexts/CodePreviewContext';

import type { TabMode, Breakpoint, BorderRadiusTab, InspectorState } from './types';
import { DEFAULT_OPEN_SECTIONS, BREAKPOINTS } from './constants';
import { 
  useInspectorState, 
  useGeneratedClasses, 
  useGeneratedStyles, 
  useGeneratedCode
} from './hooks';
import { useAIStyler } from './useAIStyler';
import { BreakpointSelector } from './components';
import { ComponentTemplates } from './ComponentTemplates';
import { StylePresets } from './StylePresets';
import { ExportComponent } from './ExportComponent';
import { InspectorToolbar } from './InspectorToolbar';

// Import modular sections
import { AppearanceSection, LayoutSection, TypographySection, CodeSection } from './sections';

/**
 * Gyors prompt javaslatok konstans lista
 */
const QUICK_SUGGESTIONS = [
  'Rounder corners',
  'Larger shadow',
  'Blue background',
  'Center align',
  'Bold text'
] as const;

/**
 * Szerkesztési kategória típus
 */
type EditCategory = 'appearance' | 'layout' | 'typography' | 'code';

/**
 * Kód tab mód típus
 */
type CodeTabMode = 'html' | 'css';

/**
 * AI státusz üzenet props
 */
interface AIStatusMessageProps {
  message: string | null;
  error: string | null;
}

/**
 * AI státusz üzenet komponens
 */
const AIStatusMessage = memo<AIStatusMessageProps>(({ message, error }) => {
  if (!message && !error) return null;

  const isError = !!error;
  const displayMessage = error || message;

  return (
    <div 
      className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
        isError 
          ? 'bg-destructive/10 text-destructive border border-destructive/20' 
          : 'bg-primary/10 text-primary border border-primary/20'
      }`}
      role="alert"
      aria-live="polite"
    >
      {isError ? (
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      )}
      <span>{displayMessage}</span>
    </div>
  );
});

AIStatusMessage.displayName = 'AIStatusMessage';

/**
 * Kiválasztott elem információ props
 */
interface SelectedElementInfoProps {
  tag: string;
  elementId: string;
  generatedClasses: string;
}

/**
 * Kiválasztott elem információ komponens
 */
const SelectedElementInfo = memo<SelectedElementInfoProps>(({ tag, elementId, generatedClasses }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <div>
          Selected: <span className="font-medium font-mono text-xs uppercase text-foreground">{tag}</span>
        </div>
        <span className="text-[10px]">#{elementId || 'element'}</span>
      </div>
      <div 
        className="font-mono text-[10px] bg-secondary/50 border border-border rounded-lg px-2 py-2 break-all"
        role="status"
        aria-label="Generated CSS classes"
      >
        {generatedClasses || 'No classes'}
      </div>
    </div>
  );
});

SelectedElementInfo.displayName = 'SelectedElementInfo';

/**
 * Gyors javaslatok props
 */
interface QuickSuggestionsProps {
  onSelect: (suggestion: string) => void;
  disabled: boolean;
}

/**
 * Gyors javaslatok komponens
 */
const QuickSuggestions = memo<QuickSuggestionsProps>(({ onSelect, disabled }) => {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] text-muted-foreground">Quick suggestions:</span>
      <div className="flex flex-wrap gap-1" role="list">
        {QUICK_SUGGESTIONS.map(suggestion => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="px-2 py-1 text-[10px] rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            role="listitem"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
});

QuickSuggestions.displayName = 'QuickSuggestions';

/**
 * AI prompt form props
 */
interface AIPromptFormProps {
  promptValue: string;
  onPromptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
  statusMessage: string | null;
  error: string | null;
  state: InspectorState;
  generatedClasses: string;
}

/**
 * AI prompt form komponens
 */
const AIPromptForm = memo<AIPromptFormProps>(({
  promptValue,
  onPromptChange,
  onSubmit,
  onCancel,
  isLoading,
  statusMessage,
  error,
  state,
  generatedClasses
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label 
          htmlFor="ai-prompt-textarea" 
          className="text-xs font-medium text-muted-foreground mb-2 block"
        >
          Describe what you want to change:
        </label>
        <div className="relative">
          <Textarea
            id="ai-prompt-textarea"
            placeholder="e.g. Make corners rounder and text dark blue..."
            value={promptValue}
            onChange={(e) => onPromptChange(e.target.value)}
            className="w-full resize-none min-h-[120px] text-xs rounded-xl pb-12"
            disabled={isLoading}
            aria-label="AI prompt input"
          />
          <div className="absolute bottom-3 left-3 z-10 flex gap-1">
            <div className="flex items-center rounded-lg bg-card border border-border shadow-sm p-2 py-1 gap-1 text-[10px]">
              <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
              <span>Gemini Flash</span>
            </div>
          </div>
        </div>
      </div>
      
      <AIStatusMessage message={statusMessage} error={error} />
      
      <SelectedElementInfo 
        tag={state.tag}
        elementId={state.elementId}
        generatedClasses={generatedClasses}
      />

      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={!promptValue.trim() || isLoading} 
          className="flex-1 gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-3 h-3" aria-hidden="true" />
              Apply with AI
            </>
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
      
      <QuickSuggestions 
        onSelect={onPromptChange}
        disabled={isLoading}
      />
    </form>
  );
});

AIPromptForm.displayName = 'AIPromptForm';

/**
 * Kód szerkesztő props
 */
interface CodeEditorProps {
  mode: CodeTabMode;
  onModeChange: (mode: CodeTabMode) => void;
  htmlValue: string;
  cssValue: string;
  onHtmlChange: (value: string) => void;
  onCssChange: (value: string) => void;
  onClear: () => void;
  onCopy: () => void;
  onSave: () => void;
}

/**
 * Kód szerkesztő komponens
 */
const CodeEditor = memo<CodeEditorProps>(({
  mode,
  onModeChange,
  htmlValue,
  cssValue,
  onHtmlChange,
  onCssChange,
  onClear,
  onCopy,
  onSave
}) => {
  const isHtmlMode = mode === 'html';
  const currentValue = isHtmlMode ? htmlValue : cssValue;
  const handleChange = isHtmlMode ? onHtmlChange : onCssChange;
  const placeholder = isHtmlMode 
    ? "<div class='my-element'>Text...</div>" 
    : ".my-element { color: red; }";
  const textColorClass = isHtmlMode ? 'text-orange-400' : 'text-cyan-400';

  return (
    <div className="flex flex-col h-full gap-3">
      <Tabs 
        value={mode} 
        onValueChange={(v) => onModeChange(v as CodeTabMode)}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 h-7">
          <TabsTrigger value="html" className="text-[10px]">HTML</TabsTrigger>
          <TabsTrigger value="css" className="text-[10px]">CSS</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Textarea
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 font-mono text-[11px] bg-neutral-950 p-3 rounded-lg min-h-[140px] resize-none ${textColorClass}`}
        spellCheck={false}
        aria-label={`Edit custom ${mode} code`}
      />
      
      <div className="text-[10px] text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2 flex items-center gap-2">
        <Eye className="w-3 h-3" aria-hidden="true" />
        Result visible in Preview panel on the right
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          Custom code mode
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-[10px]" 
            onClick={onClear}
          >
            Clear
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-[10px]" 
            onClick={onCopy}
          >
            Copy
          </Button>
          <Button 
            size="sm" 
            className="h-7 text-[10px] gap-1" 
            onClick={onSave}
          >
            <Save className="w-3 h-3" aria-hidden="true" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

/**
 * Szerkesztő nézet props
 */
interface EditorViewProps {
  category: EditCategory;
  onCategoryChange: (category: EditCategory) => void;
  currentBreakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  hasBreakpointOverrides: (breakpoint: Breakpoint) => boolean;
  openSections: string[];
  onOpenSectionsChange: (sections: string[]) => void;
  state: InspectorState;
  borderRadiusTab: BorderRadiusTab;
  onBorderRadiusTabChange: (tab: BorderRadiusTab) => void;
  updateState: <K extends keyof InspectorState>(
    key: K, 
    value: InspectorState[K],
    breakpoint?: Breakpoint
  ) => void;
  updateNestedState: <K extends keyof InspectorState>(
    key: K,
    nestedKey: string,
    value: string | number | null,
    breakpoint?: Breakpoint
  ) => void;
  updateDeepNestedState: <K extends keyof InspectorState>(
    key: K,
    nestedKey: string,
    deepKey: string,
    value: string | number,
    breakpoint?: Breakpoint
  ) => void;
}

/**
 * Szerkesztő nézet komponens
 */
const EditorView = memo<EditorViewProps>(({
  category,
  onCategoryChange,
  currentBreakpoint,
  onBreakpointChange,
  hasBreakpointOverrides,
  openSections,
  onOpenSectionsChange,
  state,
  borderRadiusTab,
  onBorderRadiusTabChange,
  updateState,
  updateNestedState,
  updateDeepNestedState
}) => {
  return (
    <div className="space-y-2">
      {/* Breakpoint Selector */}
      <div className="flex items-center justify-between mb-3">
        <BreakpointSelector 
          value={currentBreakpoint} 
          onChange={(v) => onBreakpointChange(v as Breakpoint)}
          options={BREAKPOINTS}
        />
        <span className="text-[10px] text-muted-foreground ml-2 flex items-center gap-1">
          <Laptop className="w-3 h-3" aria-hidden="true" />
          <span>{currentBreakpoint === 'base' ? 'All' : currentBreakpoint.toUpperCase()}</span>
          {hasBreakpointOverrides(currentBreakpoint) && (
            <span 
              className="w-1.5 h-1.5 rounded-full bg-primary" 
              title="Has overrides"
              aria-label="Has breakpoint overrides"
            />
          )}
        </span>
      </div>

      {/* Category Tabs */}
      <Tabs 
        value={category} 
        onValueChange={(v) => onCategoryChange(v as EditCategory)} 
        className="w-full mb-3"
      >
        <TabsList className="grid grid-cols-4 h-8 w-full">
          <TabsTrigger value="appearance" className="text-[10px] px-1">Appearance</TabsTrigger>
          <TabsTrigger value="layout" className="text-[10px] px-1">Layout</TabsTrigger>
          <TabsTrigger value="typography" className="text-[10px] px-1">Typography</TabsTrigger>
          <TabsTrigger value="code" className="text-[10px] px-1">Code</TabsTrigger>
        </TabsList>
      </Tabs>

      <Accordion 
        type="multiple" 
        value={openSections} 
        onValueChange={onOpenSectionsChange} 
        className="space-y-1"
      >
        {category === 'appearance' && (
          <AppearanceSection
            state={state}
            borderRadiusTab={borderRadiusTab}
            onBorderRadiusTabChange={onBorderRadiusTabChange}
            updateNestedState={updateNestedState}
            updateDeepNestedState={updateDeepNestedState}
          />
        )}
        
        {category === 'layout' && (
          <LayoutSection
            state={state}
            updateNestedState={updateNestedState}
          />
        )}
        
        {category === 'typography' && (
          <TypographySection
            state={state}
            updateState={updateState}
            updateNestedState={updateNestedState}
          />
        )}
        
        {category === 'code' && (
          <CodeSection
            state={state}
            updateState={updateState}
          />
        )}
      </Accordion>
    </div>
  );
});

EditorView.displayName = 'EditorView';

/**
 * Inspector footer props
 */
interface InspectorFooterProps {
  elementId: string;
  onReset: () => void;
  onApply?: () => void;
}

/**
 * Inspector footer komponens
 */
const InspectorFooter = memo<InspectorFooterProps>(({ elementId, onReset, onApply }) => {
  return (
    <footer className="p-3 border-t border-border bg-secondary/20 flex justify-between items-center">
      <span className="text-[10px] text-muted-foreground font-mono">
        #{elementId || 'element'}
      </span>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 px-2 text-[10px]" 
          onClick={onReset}
        >
          Reset
        </Button>
        {onApply && (
          <Button 
            size="sm" 
            className="h-6 px-2 text-[10px]"
            onClick={onApply}
          >
            Apply
          </Button>
        )}
      </div>
    </footer>
  );
});

InspectorFooter.displayName = 'InspectorFooter';

/**
 * Fő PropertyInspector komponens
 */
export const PropertyInspector: React.FC = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState<TabMode>('EDIT');
  const [editCategory, setEditCategory] = useState<EditCategory>('appearance');
  const [borderRadiusTab, setBorderRadiusTab] = useState<BorderRadiusTab>('all');
  const [openSections, setOpenSections] = useState<string[]>(DEFAULT_OPEN_SECTIONS);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);
  const [codeTabMode, setCodeTabMode] = useState<CodeTabMode>('html');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // --- Hooks ---
  const { toast } = useToast();
  const { 
    customHtml, 
    setCustomHtml, 
    customCss, 
    setCustomCss, 
    setIsCodeMode, 
    saveCode, 
    setInspectorState, 
    setGeneratedClasses 
  } = useCodePreview();
  
  const { 
    state, 
    currentBreakpoint,
    setCurrentBreakpoint,
    updateState, 
    updateNestedState, 
    updateDeepNestedState,
    applyStateChanges,
    resetTransforms,
    hasBreakpointOverrides
  } = useInspectorState();
  
  const { applyPrompt, isLoading: isAILoading, error: aiError } = useAIStyler();
  
  const generatedClasses = useGeneratedClasses(state, currentBreakpoint);
  const generatedStyles = useGeneratedStyles(state);
  const generatedCode = useGeneratedCode(state, generatedClasses, generatedStyles);

  // --- Effects ---

  // Szinkronizálja a kód módot a kontextussal
  useEffect(() => {
    setIsCodeMode(activeTab === 'CODE');
  }, [activeTab, setIsCodeMode]);
  
  // Szinkronizálja az inspector state-et a preview kontextussal
  // Using refs to avoid infinite loops from state object identity changes
  const stateRef = React.useRef(state);
  const classesRef = React.useRef(generatedClasses);
  
  useEffect(() => {
    // Only update if the serialized values actually changed
    const stateJson = JSON.stringify(state);
    const prevStateJson = JSON.stringify(stateRef.current);
    
    if (stateJson !== prevStateJson || generatedClasses !== classesRef.current) {
      stateRef.current = state;
      classesRef.current = generatedClasses;
      setInspectorState(state);
      setGeneratedClasses(generatedClasses);
    }
  }, [state, generatedClasses, setInspectorState, setGeneratedClasses]);

  // --- Event Handlers (memoizált) ---

  const handleApplyPrompt = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim() || isAILoading) return;
    
    setAiStatusMessage(null);
    
    const result = await applyPrompt(aiPromptInput, state);
    
    if (result.success && Object.keys(result.changes).length > 0) {
      applyStateChanges(result.changes);
      setAiStatusMessage(result.message || 'Styles applied successfully!');
      toast({
        title: "AI Styles Applied",
        description: result.message || "Changes have been applied.",
      });
      setAiPromptInput('');
    } else if (!result.success) {
      setAiStatusMessage(result.message || 'An error occurred');
      toast({
        title: "Error",
        description: result.message || "Could not process AI request.",
        variant: "destructive"
      });
    }
  }, [aiPromptInput, isAILoading, applyPrompt, state, applyStateChanges, toast]);

  const handleCancelPrompt = useCallback(() => {
    setAiPromptInput('');
    setAiStatusMessage(null);
  }, []);

  const handleApplyTemplate = useCallback((templateState: Partial<InspectorState>) => {
    applyStateChanges(templateState);
    setShowTemplates(false);
    toast({
      title: "Template Applied",
      description: "Template loaded successfully.",
    });
  }, [applyStateChanges, toast]);

  const handleLoadPreset = useCallback((presetState: InspectorState) => {
    applyStateChanges(presetState);
    setShowPresets(false);
    toast({
      title: "Preset Loaded",
      description: "Style preset applied successfully.",
    });
  }, [applyStateChanges, toast]);

  const handleClearCode = useCallback(() => {
    setCustomHtml('');
    setCustomCss('');
    toast({ title: "Cleared", description: "Custom code has been cleared." });
  }, [setCustomHtml, setCustomCss, toast]);

  const handleCopyCode = useCallback(() => {
    const codeContent = `<!-- HTML -->\n${customHtml}\n\n/* CSS */\n${customCss}`;
    navigator.clipboard.writeText(codeContent);
    toast({ title: "Copied!", description: "Code copied to clipboard." });
  }, [customHtml, customCss, toast]);

  const handleSaveCode = useCallback(() => {
    saveCode();
    toast({ title: "Saved!", description: "Custom code is now active in the preview." });
  }, [saveCode, toast]);

  // --- Floating Panels (Early Return) ---
  if (showTemplates) {
    return (
      <ComponentTemplates 
        onApplyTemplate={handleApplyTemplate} 
        onClose={() => setShowTemplates(false)} 
      />
    );
  }

  if (showPresets) {
    return (
      <StylePresets 
        currentState={state} 
        onLoadPreset={handleLoadPreset} 
        onClose={() => setShowPresets(false)} 
      />
    );
  }

  if (showExport) {
    return (
      <ExportComponent 
        state={state} 
        generatedClasses={generatedClasses} 
        onClose={() => setShowExport(false)} 
      />
    );
  }

  // --- Main Render ---
  return (
    <div 
      className="bg-card border border-border rounded-2xl shadow-[var(--shadow-panel)] w-80 max-h-[90vh] flex flex-col overflow-hidden"
      role="region"
      aria-label="Property Inspector"
    >
      {/* Header Toolbar */}
      <InspectorToolbar
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        currentTag={state.tag}
        onResetTransforms={resetTransforms}
        onShowTemplates={() => setShowTemplates(true)}
        onShowPresets={() => setShowPresets(true)}
        onShowExport={() => setShowExport(true)}
      />

      {/* Main Content */}
      <div className="p-4 overflow-y-auto flex-1">
        {activeTab === 'PROMPT' && (
          <AIPromptForm
            promptValue={aiPromptInput}
            onPromptChange={setAiPromptInput}
            onSubmit={handleApplyPrompt}
            onCancel={handleCancelPrompt}
            isLoading={isAILoading}
            statusMessage={aiStatusMessage}
            error={aiError}
            state={state}
            generatedClasses={generatedClasses}
          />
        )}
        
        {activeTab === 'CODE' && (
          <CodeEditor
            mode={codeTabMode}
            onModeChange={setCodeTabMode}
            htmlValue={customHtml}
            cssValue={customCss}
            onHtmlChange={setCustomHtml}
            onCssChange={setCustomCss}
            onClear={handleClearCode}
            onCopy={handleCopyCode}
            onSave={handleSaveCode}
          />
        )}
        
        {activeTab === 'EDIT' && (
          <EditorView
            category={editCategory}
            onCategoryChange={setEditCategory}
            currentBreakpoint={currentBreakpoint}
            onBreakpointChange={setCurrentBreakpoint}
            hasBreakpointOverrides={hasBreakpointOverrides}
            openSections={openSections}
            onOpenSectionsChange={setOpenSections}
            state={state}
            borderRadiusTab={borderRadiusTab}
            onBorderRadiusTabChange={setBorderRadiusTab}
            updateState={updateState}
            updateNestedState={updateNestedState}
            updateDeepNestedState={updateDeepNestedState}
          />
        )}
      </div>

      {/* Footer */}
      <InspectorFooter
        elementId={state.elementId}
        onReset={resetTransforms}
      />
    </div>
  );
};

// Re-export types and utilities
export * from './types';
export * from './constants';
export * from './hooks';
export * from './components';
export { PreviewBox } from './PreviewBox';

export default PropertyInspector;

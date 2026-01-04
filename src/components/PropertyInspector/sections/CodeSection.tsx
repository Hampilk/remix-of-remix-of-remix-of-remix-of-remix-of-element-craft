// src/components/PropertyInspector/sections/CodeSection.tsx
// Code Section - Tailwind classes and inline CSS with advanced features

import React, { memo, useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { Code, Copy, Check, Wand2, AlertCircle } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { InspectorState } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface CodeSectionProps {
  /** Az inspector teljes állapota */
  state: InspectorState;
  /** State frissítő függvény */
  updateState: <K extends keyof InspectorState>(
    key: K, 
    value: InspectorState[K]
  ) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Gyakori Tailwind osztályok kategóriák szerint
 */
const COMMON_TAILWIND_CLASSES = {
  layout: ['flex', 'grid', 'block', 'inline-block', 'inline', 'hidden'],
  flexbox: ['flex-row', 'flex-col', 'items-center', 'items-start', 'items-end', 'justify-center', 'justify-between', 'justify-around'],
  spacing: ['p-0', 'p-1', 'p-2', 'p-4', 'p-6', 'p-8', 'm-0', 'm-1', 'm-2', 'm-4', 'gap-2', 'gap-4'],
  sizing: ['w-full', 'w-auto', 'h-full', 'h-auto', 'max-w-full', 'min-h-screen'],
  typography: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'font-bold', 'font-semibold', 'text-center'],
  colors: ['text-white', 'text-black', 'bg-white', 'bg-black', 'bg-blue-500', 'text-blue-500'],
  borders: ['border', 'border-2', 'rounded', 'rounded-lg', 'rounded-full'],
  effects: ['shadow', 'shadow-lg', 'opacity-50', 'hover:opacity-100', 'transition']
} as const;

/**
 * CSS property validáció regex
 */
const CSS_PROPERTY_REGEX = /^[a-z-]+\s*:\s*.+;?$/i;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Debounce függvény az input késleltetéséhez
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Ellenőrzi, hogy egy string érvényes Tailwind osztály-e
 */
function isValidTailwindClass(className: string): boolean {
  // Egyszerű validáció: nem üres, alfanumerikus, kötőjel, kettőspont, szögletes zárójelek
  return /^[a-zA-Z0-9-_:[\]/]+$/.test(className) && className.length > 0;
}

/**
 * Ellenőrzi, hogy egy CSS string érvényes-e
 */
function isValidCSS(css: string): boolean {
  if (!css.trim()) return true;
  
  // Egyszerű validáció: property: value; formátum
  const lines = css.split(';').filter(l => l.trim());
  return lines.every(line => CSS_PROPERTY_REGEX.test(line.trim() + ';'));
}

/**
 * Formázza a CSS-t olvashatóbbá
 */
function beautifyCSS(css: string): string {
  return css
    .split(';')
    .filter(l => l.trim())
    .map(line => line.trim())
    .join(';\n') + (css.trim().endsWith(';') ? '' : ';');
}

/**
 * Minifikálja a CSS-t
 */
function minifyCSS(css: string): string {
  return css
    .replace(/\s+/g, ' ')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':')
    .trim();
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Accordion szekció header komponens
 */
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  count?: number;
  hasError?: boolean;
}

const SectionHeader = memo<SectionHeaderProps>(({ icon, title, count, hasError }) => (
  <div className="flex items-center gap-1.5 w-full">
    <span className="flex items-center gap-1.5 flex-1">
      {icon}
      <span>{title}</span>
    </span>
    <div className="flex items-center gap-1">
      {hasError && (
        <AlertCircle className="w-3 h-3 text-destructive" aria-label="Has errors" />
      )}
      {count !== undefined && count > 0 && (
        <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
          {count}
        </span>
      )}
    </div>
  </div>
));

SectionHeader.displayName = 'SectionHeader';

/**
 * Copy gomb komponens
 */
interface CopyButtonProps {
  text: string;
  label?: string;
}

const CopyButton = memo<CopyButtonProps>(({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [text]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-6 px-2 text-[10px]"
      aria-label={copied ? 'Copied!' : label}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 mr-1" aria-hidden="true" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 mr-1" aria-hidden="true" />
          {label}
        </>
      )}
    </Button>
  );
});

CopyButton.displayName = 'CopyButton';

/**
 * Tailwind osztályok szekció
 */
interface TailwindClassesSectionProps {
  classes: string[];
  onClassesChange: (classes: string[]) => void;
}

const TailwindClassesSection = memo<TailwindClassesSectionProps>(({
  classes,
  onClassesChange
}) => {
  const [inputValue, setInputValue] = useState(classes.join(' '));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasError, setHasError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced update
  const debouncedUpdate = useMemo(
    () => debounce((value: string) => {
      const classList = value.split(' ').filter(Boolean);
      const invalidClasses = classList.filter(c => !isValidTailwindClass(c));
      setHasError(invalidClasses.length > 0);
      onClassesChange(classList);
    }, 300),
    [onClassesChange]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedUpdate(value);
  }, [debouncedUpdate]);

  const handleAddClass = useCallback((className: string) => {
    const newValue = inputValue ? `${inputValue} ${className}` : className;
    setInputValue(newValue);
    onClassesChange(newValue.split(' ').filter(Boolean));
    setShowSuggestions(false);
    textareaRef.current?.focus();
  }, [inputValue, onClassesChange]);

  const classCount = useMemo(() => classes.length, [classes]);

  return (
    <AccordionItem value="tailwind-classes-section" className="border-none">
      <AccordionTrigger 
        className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline"
        aria-label="Tailwind classes editor"
      >
        <SectionHeader 
          icon={<Code className="w-3 h-3" aria-hidden="true" />} 
          title="Tailwind Classes"
          count={classCount}
          hasError={hasError}
        />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-2">
        {/* Textarea */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            id="tailwind-classes-input"
            placeholder="e.g. flex items-center gap-2 text-blue-500..."
            value={inputValue}
            onChange={handleInputChange}
            rows={3}
            className={`resize-y text-xs font-mono ${hasError ? 'border-destructive' : ''}`}
            aria-label="Edit Tailwind CSS classes"
            spellCheck={false}
          />
          {hasError && (
            <div className="text-[10px] text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" aria-hidden="true" />
              Some classes may be invalid
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="h-6 px-2 text-[10px] gap-1"
          >
            <Wand2 className="w-3 h-3" aria-hidden="true" />
            Suggestions
          </Button>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setInputValue('');
                onClassesChange([]);
              }}
              className="h-6 px-2 text-[10px]"
            >
              Clear
            </Button>
            <CopyButton text={inputValue} />
          </div>
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="space-y-2 pt-2 border-t">
            {Object.entries(COMMON_TAILWIND_CLASSES).map(([category, classList]) => (
              <div key={category}>
                <span className="text-[9px] text-muted-foreground uppercase block mb-1">
                  {category}
                </span>
                <div className="flex flex-wrap gap-1">
                  {classList.map(className => (
                    <button
                      key={className}
                      type="button"
                      onClick={() => handleAddClass(className)}
                      className="px-1.5 py-0.5 text-[9px] rounded bg-secondary hover:bg-secondary/80 transition-colors font-mono"
                    >
                      {className}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Class count info */}
        <div className="text-[9px] text-muted-foreground">
          {classCount} {classCount === 1 ? 'class' : 'classes'}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

TailwindClassesSection.displayName = 'TailwindClassesSection';

/**
 * Inline CSS szekció
 */
interface InlineCssSectionProps {
  css: string;
  onCssChange: (css: string) => void;
}

const InlineCssSection = memo<InlineCssSectionProps>(({
  css,
  onCssChange
}) => {
  const [inputValue, setInputValue] = useState(css);
  const [hasError, setHasError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced update
  const debouncedUpdate = useMemo(
    () => debounce((value: string) => {
      setHasError(!isValidCSS(value));
      onCssChange(value);
    }, 300),
    [onCssChange]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedUpdate(value);
  }, [debouncedUpdate]);

  const handleBeautify = useCallback(() => {
    const beautified = beautifyCSS(inputValue);
    setInputValue(beautified);
    onCssChange(beautified);
  }, [inputValue, onCssChange]);

  const handleMinify = useCallback(() => {
    const minified = minifyCSS(inputValue);
    setInputValue(minified);
    onCssChange(minified);
  }, [inputValue, onCssChange]);

  const propertyCount = useMemo(() => {
    return inputValue.split(';').filter(l => l.trim()).length;
  }, [inputValue]);

  return (
    <AccordionItem value="inline-css-section" className="border-none">
      <AccordionTrigger 
        className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline"
        aria-label="Inline CSS editor"
      >
        <SectionHeader 
          icon={<Code className="w-3 h-3" aria-hidden="true" />} 
          title="Inline CSS"
          count={propertyCount}
          hasError={hasError}
        />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-2">
        {/* Textarea */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            id="inline-css-input"
            placeholder="color: red; font-size: 16px; margin-top: 10px;"
            value={inputValue}
            onChange={handleInputChange}
            rows={5}
            className={`resize-y text-xs font-mono ${hasError ? 'border-destructive' : ''}`}
            aria-label="Edit inline CSS styles"
            spellCheck={false}
          />
          {hasError && (
            <div className="text-[10px] text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" aria-hidden="true" />
              Invalid CSS syntax
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBeautify}
              className="h-6 px-2 text-[10px]"
              title="Format CSS with line breaks"
            >
              Beautify
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMinify}
              className="h-6 px-2 text-[10px]"
              title="Remove unnecessary whitespace"
            >
              Minify
            </Button>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setInputValue('');
                onCssChange('');
              }}
              className="h-6 px-2 text-[10px]"
            >
              Clear
            </Button>
            <CopyButton text={inputValue} />
          </div>
        </div>

        {/* Property count info */}
        <div className="text-[9px] text-muted-foreground">
          {propertyCount} CSS {propertyCount === 1 ? 'property' : 'properties'}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

InlineCssSection.displayName = 'InlineCssSection';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Kód szekció komponens
 * Tailwind osztályok és inline CSS szerkesztése
 */
export const CodeSection = memo<CodeSectionProps>(({
  state,
  updateState,
}) => {
  const handleTailwindClassesChange = useCallback(
    (classes: string[]) => {
      updateState('tailwindClasses', classes);
    },
    [updateState]
  );

  const handleInlineCssChange = useCallback(
    (css: string) => {
      updateState('inlineCSS', css);
    },
    [updateState]
  );

  // Memoizáljuk a state értékeket
  const memoizedClasses = useMemo(() => state.tailwindClasses, [state.tailwindClasses]);
  const memoizedCss = useMemo(() => state.inlineCSS, [state.inlineCSS]);

  return (
    <>
      <TailwindClassesSection
        classes={memoizedClasses}
        onClassesChange={handleTailwindClassesChange}
      />

      <InlineCssSection
        css={memoizedCss}
        onCssChange={handleInlineCssChange}
      />
    </>
  );
});

CodeSection.displayName = 'CodeSection';

export default CodeSection;

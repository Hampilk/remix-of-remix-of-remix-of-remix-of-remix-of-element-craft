// src/components/PropertyInspector/sections/TypographySection.tsx
// Typography Section - Text styling controls with optimizations

import React, { memo, useCallback, useMemo } from 'react';
import { Type, Box, Hash, Link, AlignLeft } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LabeledInput, IconInput, StyledSelect } from '../components';
import { 
  TAG_OPTIONS, 
  FONT_FAMILY_OPTIONS, 
  FONT_WEIGHT_OPTIONS, 
  LETTER_SPACING_OPTIONS, 
  TEXT_ALIGN_OPTIONS 
} from '../constants';
import type { InspectorState, TypographyValue } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * TypographySection props interfész
 */
interface TypographySectionProps {
  state: InspectorState;
  updateState: <K extends keyof InspectorState>(
    key: K, 
    value: InspectorState[K],
    breakpoint?: string
  ) => void;
  updateNestedState: <K extends keyof InspectorState>(
    key: K,
    nestedKey: string,
    value: string | number | null,
    breakpoint?: string
  ) => void;
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
}

const SectionHeader = memo<SectionHeaderProps>(({ icon, title }) => (
  <div className="flex items-center gap-1.5">
    {icon}
    <span>{title}</span>
  </div>
));

SectionHeader.displayName = 'SectionHeader';

/**
 * Element beállítások szekció
 */
interface ElementSectionProps {
  tag: string;
  elementId: string;
  link: string;
  onTagChange: (value: string) => void;
  onElementIdChange: (value: string) => void;
  onLinkChange: (value: string) => void;
}

const ElementSection = memo<ElementSectionProps>(({
  tag,
  elementId,
  link,
  onTagChange,
  onElementIdChange,
  onLinkChange
}) => {
  return (
    <AccordionItem value="element" className="border-none">
      <AccordionTrigger 
        className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline"
        aria-label="Element settings"
      >
        <SectionHeader 
          icon={<Box className="w-3 h-3" aria-hidden="true" />} 
          title="Element" 
        />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-2">
        {/* HTML Tag Selector */}
        <div>
          <label 
            htmlFor="html-tag-select" 
            className="text-[10px] text-muted-foreground mb-1 block"
          >
            HTML Tag
          </label>
          <Select 
            value={tag} 
            onValueChange={onTagChange}
          >
            <SelectTrigger 
              id="html-tag-select"
              className="h-7 text-xs"
              aria-label="Select HTML tag"
            >
              <SelectValue placeholder="Select tag" />
            </SelectTrigger>
            <SelectContent>
              {TAG_OPTIONS.map(tagOption => (
                <SelectItem key={tagOption} value={tagOption}>
                  {tagOption.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Element ID Input */}
        <div>
          <label 
            htmlFor="element-id-input" 
            className="text-[10px] text-muted-foreground mb-1 block"
          >
            Element ID
          </label>
          <IconInput 
            id="element-id-input"
            icon={<Hash className="w-3 h-3" aria-hidden="true" />}
            placeholder="element-id"
            value={elementId}
            onChange={onElementIdChange}
            aria-label="Element ID"
          />
        </div>

        {/* Link URL Input */}
        {(tag === 'a' || tag === 'link') && (
          <div>
            <label 
              htmlFor="link-url-input" 
              className="text-[10px] text-muted-foreground mb-1 block"
            >
              Link URL
            </label>
            <IconInput 
              id="link-url-input"
              icon={<Link className="w-3 h-3" aria-hidden="true" />}
              placeholder="https://example.com"
              value={link}
              onChange={onLinkChange}
              aria-label="Link URL"
              type="url"
            />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
});

ElementSection.displayName = 'ElementSection';

/**
 * Szöveg tartalom szekció
 */
interface TextContentSectionProps {
  textContent: string;
  onTextContentChange: (value: string) => void;
}

const TextContentSection = memo<TextContentSectionProps>(({
  textContent,
  onTextContentChange
}) => {
  const characterCount = textContent.length;
  const maxLength = 5000;

  return (
    <AccordionItem value="text" className="border-none">
      <AccordionTrigger 
        className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline"
        aria-label="Text content settings"
      >
        <SectionHeader 
          icon={<Type className="w-3 h-3" aria-hidden="true" />} 
          title="Text Content" 
        />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-2">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label 
              htmlFor="text-content-textarea" 
              className="text-[10px] text-muted-foreground"
            >
              Content
            </label>
            <span 
              className="text-[9px] text-muted-foreground"
              aria-label={`${characterCount} characters of ${maxLength} maximum`}
            >
              {characterCount}/{maxLength}
            </span>
          </div>
          <Textarea 
            id="text-content-textarea"
            value={textContent} 
            onChange={(e) => onTextContentChange(e.target.value)}
            className="text-xs min-h-[60px] resize-none"
            placeholder="Enter text content..."
            aria-label="Text content editor"
            maxLength={maxLength}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

TextContentSection.displayName = 'TextContentSection';

/**
 * Tipográfia stílusok szekció
 */
interface TypographyStylesSectionProps {
  typography: TypographyValue;
  onTypographyChange: (key: keyof TypographyValue, value: string) => void;
}

const TypographyStylesSection = memo<TypographyStylesSectionProps>(({
  typography,
  onTypographyChange
}) => {
  // Memoizáljuk a change handler-eket
  const handleFontFamilyChange = useCallback(
    (v: string) => onTypographyChange('fontFamily', v),
    [onTypographyChange]
  );

  const handleFontWeightChange = useCallback(
    (v: string) => onTypographyChange('fontWeight', v),
    [onTypographyChange]
  );

  const handleFontSizeChange = useCallback(
    (v: string) => {
      // Validáció: csak számok és érvényes CSS egységek
      if (/^\d*\.?\d*(px|rem|em|%)?$/.test(v) || v === '') {
        // Normalize to numeric-only (remove units)
        const trimmed = v.trim();
        if (trimmed === '' || trimmed === '0') {
          onTypographyChange('fontSize', trimmed);
        } else {
          const match = trimmed.match(/^([\d.-]+)/);
          const normalized = match ? match[1] : trimmed;
          onTypographyChange('fontSize', normalized);
        }
      }
    },
    [onTypographyChange]
  );

  const handleLineHeightChange = useCallback(
    (v: string) => {
      // Validáció: számok vagy 'normal'
      if (/^\d*\.?\d*(px|rem|em|%)?$/.test(v) || v === 'normal' || v === '') {
        onTypographyChange('lineHeight', v);
      }
    },
    [onTypographyChange]
  );

  const handleLetterSpacingChange = useCallback(
    (v: string) => onTypographyChange('letterSpacing', v),
    [onTypographyChange]
  );

  const handleTextAlignChange = useCallback(
    (v: string) => onTypographyChange('textAlign', v),
    [onTypographyChange]
  );

  return (
    <AccordionItem value="typography-styles" className="border-none">
      <AccordionTrigger 
        className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline"
        aria-label="Typography style settings"
      >
        <SectionHeader 
          icon={<AlignLeft className="w-3 h-3" aria-hidden="true" />} 
          title="Font Styles" 
        />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-3">
        {/* Font Family & Font Weight */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">
            Font Family & Weight
          </label>
          <div className="grid grid-cols-2 gap-2">
            <StyledSelect 
              value={typography.fontFamily} 
              onChange={handleFontFamilyChange} 
              options={FONT_FAMILY_OPTIONS}
              aria-label="Select font family" 
            />
            <StyledSelect 
              value={typography.fontWeight} 
              onChange={handleFontWeightChange} 
              options={FONT_WEIGHT_OPTIONS}
              aria-label="Select font weight" 
            />
          </div>
        </div>

        {/* Font Size & Line Height */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">
            Size & Line Height
          </label>
          <div className="grid grid-cols-2 gap-2">
            <LabeledInput 
              label="Size" 
              value={typography.fontSize} 
              onChange={handleFontSizeChange} 
              placeholder="16px"
              aria-label="Font size"
            />
            <LabeledInput 
              label="Line H" 
              value={typography.lineHeight} 
              onChange={handleLineHeightChange} 
              placeholder="1.5"
              aria-label="Line height"
            />
          </div>
          <span className="text-[9px] text-muted-foreground block">
            Use px, rem, em, or % units
          </span>
        </div>

        {/* Letter Spacing & Text Align */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">
            Spacing & Alignment
          </label>
          <div className="grid grid-cols-2 gap-2">
            <StyledSelect 
              value={typography.letterSpacing} 
              onChange={handleLetterSpacingChange} 
              options={LETTER_SPACING_OPTIONS}
              aria-label="Select letter spacing" 
            />
            <StyledSelect 
              value={typography.textAlign} 
              onChange={handleTextAlignChange} 
              options={TEXT_ALIGN_OPTIONS}
              aria-label="Select text alignment" 
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

TypographyStylesSection.displayName = 'TypographyStylesSection';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Tipográfia szekció komponens
 * Kezeli az elem típusát, szöveget és tipográfiai stílusokat
 */
export const TypographySection = memo<TypographySectionProps>(({
  state,
  updateState,
  updateNestedState,
}) => {
  // Destrukturáljuk a szükséges state részeket
  const { tag, elementId, link, textContent, typography } = state;

  // Memoizált callback-ek a state frissítésekhez
  const handleTagChange = useCallback(
    (value: string) => updateState('tag', value),
    [updateState]
  );

  const handleElementIdChange = useCallback(
    (value: string) => {
      // Validáció: ID nem kezdődhet számmal, csak alfanumerikus és kötőjel
      const sanitized = value.replace(/[^a-zA-Z0-9-_]/g, '');
      updateState('elementId', sanitized);
    },
    [updateState]
  );

  const handleLinkChange = useCallback(
    (value: string) => updateState('link', value),
    [updateState]
  );

  const handleTextContentChange = useCallback(
    (value: string) => updateState('textContent', value),
    [updateState]
  );

  const handleTypographyChange = useCallback(
    (key: keyof TypographyValue, value: string) => {
      updateNestedState('typography', key as string, value);
    },
    [updateNestedState]
  );

  // Memoizáljuk a typography objektumot
  const memoizedTypography = useMemo(() => typography, [typography]);

  return (
    <>
      <ElementSection
        tag={tag}
        elementId={elementId}
        link={link}
        onTagChange={handleTagChange}
        onElementIdChange={handleElementIdChange}
        onLinkChange={handleLinkChange}
      />

      <TextContentSection
        textContent={textContent}
        onTextContentChange={handleTextContentChange}
      />

      <TypographyStylesSection
        typography={memoizedTypography}
        onTypographyChange={handleTypographyChange}
      />
    </>
  );
});

TypographySection.displayName = 'TypographySection';

export default TypographySection;

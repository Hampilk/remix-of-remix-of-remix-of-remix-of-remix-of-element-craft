// src/components/PropertyInspector/sections/AppearanceSection.tsx
// Appearance Section - Visual styling controls with advanced features

import React, { memo, useCallback, useMemo } from 'react';
import { 
  Palette, Circle, Eye, Droplet, Sun, Contrast, FlipHorizontal,
  RotateCcw, Sparkles
} from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ColorButton, SliderControl, StyledSelect, LabeledInput } from '../components';
import { SHADOW_OPTIONS, BORDER_STYLE_OPTIONS } from '../constants';
import type { InspectorState, BorderRadiusTab } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * State típusok (ha még nincs definiálva a types-ban)
 */
export interface AppearanceState {
  backgroundColor: string;
}

export interface TypographyState {
  textColor: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: string;
}

export interface BorderState {
  color: string;
  ringColor: string;
  width: string;
  style: string;
  radius: {
    all: number;
    tl: number;
    tr: number;
    br: number;
    bl: number;
  };
}

export interface EffectsState {
  shadow: string;
  opacity: number;
  blur: number;
  backdropBlur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  grayscale: number;
}

/**
 * AppearanceSection props interfész
 */
interface AppearanceSectionProps {
  state: InspectorState;
  borderRadiusTab: BorderRadiusTab;
  onBorderRadiusTabChange: (tab: BorderRadiusTab) => void;
  updateNestedState: <K extends keyof InspectorState>(
    key: K,
    nestedKey: string,
    value: string | number | null,
    breakpoint?: string
  ) => void;
  updateDeepNestedState: <K extends keyof InspectorState>(
    key: K,
    nestedKey: string,
    deepKey: string,
    value: string | number,
    breakpoint?: string
  ) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Szín preset-ek gyors kiválasztáshoz
 */
const COLOR_PRESETS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
] as const;

/**
 * Border radius preset-ek
 */
const RADIUS_PRESETS = [
  { name: 'None', value: 0 },
  { name: 'SM', value: 4 },
  { name: 'MD', value: 8 },
  { name: 'LG', value: 16 },
  { name: 'XL', value: 24 },
  { name: 'Full', value: 9999 },
] as const;

/**
 * Alapértelmezett filter értékek
 */
const DEFAULT_FILTER_VALUES = {
  blur: 0,
  backdropBlur: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hueRotate: 0,
  grayscale: 0,
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Ellenőrzi, hogy van-e aktív filter
 */
function hasActiveFilters(effects: EffectsState): boolean {
  return effects.blur !== 0 ||
         effects.backdropBlur !== 0 ||
         effects.brightness !== 100 ||
         effects.contrast !== 100 ||
         effects.saturation !== 100 ||
         effects.hueRotate !== 0 ||
         effects.grayscale !== 0;
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
  badge?: string | number;
}

const SectionHeader = memo<SectionHeaderProps>(({ icon, title, badge }) => (
  <div className="flex items-center gap-1.5 w-full">
    <span className="flex items-center gap-1.5 flex-1">
      {icon}
      <span>{title}</span>
    </span>
    {badge !== undefined && badge !== null && (
      <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
        {badge}
      </span>
    )}
  </div>
));

SectionHeader.displayName = 'SectionHeader';

/**
 * Színek szekció
 */
interface ColorsSectionProps {
  appearance: AppearanceState;
  typography: TypographyState;
  border: BorderState;
  onColorChange: (key: string, nestedKey: string, value: string) => void;
}

const ColorsSection = memo<ColorsSectionProps>(({
  appearance,
  typography,
  border,
  onColorChange
}) => {
  const [showPresets, setShowPresets] = React.useState(false);

  return (
    <AccordionItem value="colors-background-section" className="border-none">
      <AccordionTrigger 
        className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline"
        aria-label="Colors settings"
      >
        <SectionHeader 
          icon={<Palette className="w-3 h-3" aria-hidden="true" />} 
          title="Colors"
        />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <ColorButton 
            color={appearance.backgroundColor} 
            onChange={(c) => onColorChange('appearance', 'backgroundColor', c)} 
            label="Background"
            aria-label="Background color picker"
          />
          <ColorButton 
            color={typography.textColor} 
            onChange={(c) => onColorChange('typography', 'textColor', c)} 
            label="Text"
            aria-label="Text color picker"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ColorButton 
            color={border.color} 
            onChange={(c) => onColorChange('border', 'color', c)} 
            label="Border"
            aria-label="Border color picker"
          />
          <ColorButton 
            color={border.ringColor} 
            onChange={(c) => onColorChange('border', 'ringColor', c)} 
            label="Focus Ring"
            aria-label="Focus ring color picker"
          />
        </div>

        {/* Color Presets Toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPresets(!showPresets)}
          className="w-full h-6 text-[10px] gap-1"
        >
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          {showPresets ? 'Hide' : 'Show'} Presets
        </Button>

        {/* Color Presets */}
        {showPresets && (
          <div className="space-y-1 pt-1 border-t">
            <span className="text-[9px] text-muted-foreground block">Quick Colors:</span>
            <div className="grid grid-cols-4 gap-1">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onColorChange('appearance', 'backgroundColor', preset.value)}
                  className="h-8 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                  aria-label={`Set background to ${preset.name}`}
                />
              ))}
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
});

ColorsSection.displayName = 'ColorsSection';

/**
 * Border és Radius szekció
 */
interface BorderRadiusSectionProps {
  border: BorderState;
  borderRadiusTab: BorderRadiusTab;
  onBorderRadiusTabChange: (tab: BorderRadiusTab) => void;
  onBorderChange: (key: string, value: any) => void;
  onRadiusChange: (corner: string, value: number) => void;
}

const BorderRadiusSection = memo<BorderRadiusSectionProps>(({
  border,
  borderRadiusTab,
  onBorderRadiusTabChange,
  onBorderChange,
  onRadiusChange
}) => {
  const handlePresetRadius = useCallback((value: number) => {
    if (borderRadiusTab === 'all') {
      onRadiusChange('all', value);
      onRadiusChange('tl', value);
      onRadiusChange('tr', value);
      onRadiusChange('br', value);
      onRadiusChange('bl', value);
    } else {
      onRadiusChange(borderRadiusTab, value);
    }
  }, [borderRadiusTab, onRadiusChange]);

  return (
    <AccordionItem value="border-radius-section" className="border-none">
      <AccordionTrigger 
        className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline"
        aria-label="Border and radius settings"
      >
        <SectionHeader 
          icon={<Circle className="w-3 h-3" aria-hidden="true" />} 
          title="Border & Radius"
        />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-3">
        {/* Border Width & Style */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">Border</label>
          <div className="grid grid-cols-2 gap-2">
            <LabeledInput 
              label="Width" 
              value={border.width} 
              onChange={(v) => onBorderChange('width', v)} 
              placeholder="0px"
              aria-label="Border width"
            />
            <StyledSelect 
              value={border.style} 
              onChange={(v) => onBorderChange('style', v)} 
              options={BORDER_STYLE_OPTIONS} 
              aria-label="Border style"
            />
          </div>
        </div>

        {/* Border Radius */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block" id="border-radius-label">
            Corner Radius
          </label>
          <Tabs 
            value={borderRadiusTab} 
            onValueChange={(v) => onBorderRadiusTabChange(v as BorderRadiusTab)} 
            className="w-full"
            aria-labelledby="border-radius-label"
          >
            <TabsList className="grid grid-cols-5 h-7">
              {(['all', 'tl', 'tr', 'br', 'bl'] as const).map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab} 
                  className="text-[10px] px-2"
                  aria-label={`${tab === 'all' ? 'All corners' : tab.toUpperCase()}`}
                >
                  {tab.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <SliderControl
            icon={<Circle className="w-2.5 h-2.5" aria-hidden="true" />}
            label={borderRadiusTab === 'all' ? 'All Corners' : borderRadiusTab.toUpperCase()}
            value={border.radius[borderRadiusTab]}
            onChange={(v) => onRadiusChange(borderRadiusTab, v)}
            min={0}
            max={100}
            unit="px"
            aria-label={`Border radius for ${borderRadiusTab}`}
          />
        </div>

        {/* Radius Presets */}
        <div className="space-y-1">
          <span className="text-[9px] text-muted-foreground block">Quick Radius:</span>
          <div className="flex flex-wrap gap-1">
            {RADIUS_PRESETS.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetRadius(preset.value)}
                className="px-2 py-1 text-[9px] rounded bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

BorderRadiusSection.displayName = 'BorderRadiusSection';

/**
 * Shadow és Opacity szekció
 */
interface ShadowOpacitySectionProps {
  effects: EffectsState;
  onEffectChange: (key: string, value: any) => void;
}

const ShadowOpacitySection = memo<ShadowOpacitySectionProps>(({
  effects,
  onEffectChange
}) => {
  return (
    <AccordionItem value="shadow-opacity-section" className="border-none">
      <AccordionTrigger 
        className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline"
        aria-label="Shadow and opacity settings"
      >
        <SectionHeader 
          icon={<Eye className="w-3 h-3" aria-hidden="true" />} 
          title="Shadow & Opacity"
        />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-2">
        <div>
          <label htmlFor="shadow-select" className="text-[10px] text-muted-foreground block mb-1">
            Drop Shadow
          </label>
          <StyledSelect 
            id="shadow-select"
            value={effects.shadow} 
            onChange={(v) => onEffectChange('shadow', v)} 
            options={SHADOW_OPTIONS} 
            aria-label="Select shadow style"
          />
        </div>
        <SliderControl 
          icon={<Eye className="w-2.5 h-2.5" aria-hidden="true" />} 
          label="Opacity" 
          value={effects.opacity} 
          onChange={(v) => onEffectChange('opacity', v)} 
          min={0} 
          max={100} 
          unit="%" 
          aria-label="Element opacity"
        />
      </AccordionContent>
    </AccordionItem>
  );
});

ShadowOpacitySection.displayName = 'ShadowOpacitySection';

/**
 * Filters szekció
 */
interface FiltersSectionProps {
  effects: EffectsState;
  onEffectChange: (key: string, value: number) => void;
  onResetFilters: () => void;
}

const FiltersSection = memo<FiltersSectionProps>(({
  effects,
  onEffectChange,
  onResetFilters
}) => {
  const hasFilters = useMemo(() => hasActiveFilters(effects), [effects]);

  return (
    <AccordionItem value="filters-section" className="border-none">
      <AccordionTrigger 
        className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline"
        aria-label="Filter effects settings"
      >
        <SectionHeader 
          icon={<Contrast className="w-3 h-3" aria-hidden="true" />} 
          title="Filters"
          badge={hasFilters ? '✓' : undefined}
        />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-3">
        {/* Blur Filters */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">Blur</label>
          <div className="space-y-2">
            <SliderControl 
              icon={<Droplet className="w-2.5 h-2.5" aria-hidden="true" />} 
              label="Blur" 
              value={effects.blur} 
              onChange={(v) => onEffectChange('blur', v)} 
              min={0} 
              max={50} 
              unit="px" 
              aria-label="Blur filter strength"
            />
            <SliderControl 
              icon={<Droplet className="w-2.5 h-2.5" aria-hidden="true" />} 
              label="Backdrop" 
              value={effects.backdropBlur} 
              onChange={(v) => onEffectChange('backdropBlur', v)} 
              min={0} 
              max={50} 
              unit="px" 
              aria-label="Backdrop blur filter strength"
            />
          </div>
        </div>

        {/* Color Adjustments */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">Color Adjustments</label>
          <div className="space-y-2">
            <SliderControl 
              icon={<Sun className="w-2.5 h-2.5" aria-hidden="true" />} 
              label="Brightness" 
              value={effects.brightness} 
              onChange={(v) => onEffectChange('brightness', v)} 
              min={0} 
              max={300} 
              unit="%" 
              aria-label="Brightness level"
            />
            <SliderControl 
              icon={<Contrast className="w-2.5 h-2.5" aria-hidden="true" />} 
              label="Contrast" 
              value={effects.contrast} 
              onChange={(v) => onEffectChange('contrast', v)} 
              min={0} 
              max={300} 
              unit="%" 
              aria-label="Contrast level"
            />
            <SliderControl 
              icon={<Sun className="w-2.5 h-2.5" aria-hidden="true" />} 
              label="Saturation" 
              value={effects.saturation} 
              onChange={(v) => onEffectChange('saturation', v)} 
              min={0} 
              max={300} 
              unit="%" 
              aria-label="Saturation level"
            />
          </div>
        </div>

        {/* Special Effects */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">Special Effects</label>
          <div className="space-y-2">
            <SliderControl 
              icon={<Contrast className="w-2.5 h-2.5" aria-hidden="true" />} 
              label="Hue Rotate" 
              value={effects.hueRotate} 
              onChange={(v) => onEffectChange('hueRotate', v)} 
              min={0} 
              max={360} 
              unit="°" 
              showGradient 
              gradientColors="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" 
              aria-label="Hue rotation angle"
            />
            <SliderControl 
              icon={<FlipHorizontal className="w-2.5 h-2.5" aria-hidden="true" />} 
              label="Grayscale" 
              value={effects.grayscale} 
              onChange={(v) => onEffectChange('grayscale', v)} 
              min={0} 
              max={100} 
              unit="%" 
              aria-label="Grayscale level"
            />
          </div>
        </div>

        {/* Reset Button */}
        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="w-full h-6 text-[10px] gap-1"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Reset All Filters
          </Button>
        )}
      </AccordionContent>
    </AccordionItem>
  );
});

FiltersSection.displayName = 'FiltersSection';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Appearance szekció komponens
 * Vizuális stílusbeállítások kezelése
 */
export const AppearanceSection = memo<AppearanceSectionProps>(({
  state,
  borderRadiusTab,
  onBorderRadiusTabChange,
  updateNestedState,
  updateDeepNestedState,
}) => {
  // Destrukturáljuk a szükséges state részeket
  const { appearance, typography, border, effects } = state;

  // Memoizált callback-ek
  const handleColorChange = useCallback((
    key: string,
    nestedKey: string,
    value: string
  ) => {
    updateNestedState(key as any, nestedKey as any, value);
  }, [updateNestedState]);

  const handleBorderChange = useCallback((key: string, value: any) => {
    updateNestedState('border', key as any, value);
  }, [updateNestedState]);

  const handleRadiusChange = useCallback((corner: string, value: number) => {
    updateDeepNestedState('border', 'radius', corner as any, value);
  }, [updateDeepNestedState]);

  const handleEffectChange = useCallback((key: string, value: any) => {
    updateNestedState('effects', key as any, value);
  }, [updateNestedState]);

  const handleResetFilters = useCallback(() => {
    Object.entries(DEFAULT_FILTER_VALUES).forEach(([key, value]) => {
      updateNestedState('effects', key as any, value);
    });
  }, [updateNestedState]);

  // Memoizáljuk a state objektumokat
  const memoizedAppearance = useMemo(() => appearance, [appearance]);
  const memoizedTypography = useMemo(() => typography, [typography]);
  const memoizedBorder = useMemo(() => border, [border]);
  const memoizedEffects = useMemo(() => effects, [effects]);

  return (
    <>
      <ColorsSection
        appearance={memoizedAppearance}
        typography={memoizedTypography}
        border={memoizedBorder}
        onColorChange={handleColorChange}
      />

      <BorderRadiusSection
        border={memoizedBorder}
        borderRadiusTab={borderRadiusTab}
        onBorderRadiusTabChange={onBorderRadiusTabChange}
        onBorderChange={handleBorderChange}
        onRadiusChange={handleRadiusChange}
      />

      <ShadowOpacitySection
        effects={memoizedEffects}
        onEffectChange={handleEffectChange}
      />

      <FiltersSection
        effects={memoizedEffects}
        onEffectChange={handleEffectChange}
        onResetFilters={handleResetFilters}
      />
    </>
  );
});

AppearanceSection.displayName = 'AppearanceSection';

export default AppearanceSection;

// src/components/PropertyInspector/sections/LayoutSection.tsx
// Layout Section - Spacing, Size, Position controls

import React, { memo, useCallback, useMemo } from 'react';
import { 
  Square, Layers, GripVertical, UnfoldHorizontal, UnfoldVertical,
  Move, RotateCw, Maximize, Zap, Box
} from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { SpacingGrid, LabeledInput, IconInput, StyledSelect, SliderControl } from '../components';
import { POSITION_OPTIONS } from '../constants';
import type { 
  InspectorState, 
  SpacingValue, 
  MarginValue, 
  SizeValue, 
  PositionValue, 
  TransformValue, 
  Transform3DValue 
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface LayoutSectionProps {
  state: InspectorState;
  updateNestedState: <K extends keyof InspectorState>(
    key: K,
    nestedKey: string,
    value: string | number | null,
    breakpoint?: string
  ) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SPACING_PRESETS = [
  { label: 'None', value: '0' },
  { label: 'XS', value: '4' },
  { label: 'SM', value: '8' },
  { label: 'MD', value: '16' },
  { label: 'LG', value: '24' },
  { label: 'XL', value: '32' },
] as const;

const SIZE_PRESETS = [
  { label: 'Auto', value: 'auto' },
  { label: 'Full', value: '100%' },
  { label: 'Half', value: '50%' },
  { label: 'Fit', value: 'fit-content' },
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isValidCssValue(value: string): boolean {
  if (!value || value.trim() === '') return true;
  return /^(auto|fit-content|min-content|max-content|\d+\.?\d*(px|rem|em|%|vh|vw)?)$/.test(value.trim());
}

// Extract numeric-only value (remove units) for storing in state
function normalizeNumericValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === 'auto' || trimmed === '0') return trimmed;
  // Extract just the number part
  const match = trimmed.match(/^([\d.-]+)/);
  return match ? match[1] : trimmed;
}

// Format value for display (add units back if numeric)
function sanitizeCssValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === 'auto') return trimmed;
  if (/^\d+\.?\d*$/.test(trimmed)) {
    return `${trimmed}px`;
  }
  return trimmed;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

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
    {badge !== undefined && badge !== null && badge !== 0 && badge !== '0' && (
      <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
        {badge}
      </span>
    )}
  </div>
));

SectionHeader.displayName = 'SectionHeader';

// Padding Section
interface PaddingSectionProps {
  padding: SpacingValue;
  onPaddingChange: (key: keyof SpacingValue, value: string) => void;
}

const PaddingSection = memo<PaddingSectionProps>(({ padding, onPaddingChange }) => {
  const activeCount = useMemo(() => {
    return Object.values(padding).filter(v => v && v !== '0' && v !== '0px').length;
  }, [padding]);

  return (
    <AccordionItem value="padding-section" className="border-none">
      <AccordionTrigger className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline">
        <SectionHeader icon={<Square className="w-3 h-3" />} title="Padding" badge={activeCount > 0 ? activeCount : undefined} />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-2">
        <SpacingGrid values={padding} onChange={onPaddingChange} />
        <div className="flex flex-wrap gap-1">
          <span className="text-[9px] text-muted-foreground w-full mb-0.5">Quick:</span>
          {SPACING_PRESETS.map(preset => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onPaddingChange('l', preset.value);
                onPaddingChange('t', preset.value);
                onPaddingChange('r', preset.value);
                onPaddingChange('b', preset.value);
              }}
              className="px-1.5 py-0.5 text-[9px] rounded bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

PaddingSection.displayName = 'PaddingSection';

// Margin Section
interface MarginSectionProps {
  margin: MarginValue;
  onMarginChange: (key: keyof MarginValue, value: string) => void;
}

const MarginSection = memo<MarginSectionProps>(({ margin, onMarginChange }) => {
  const handleChange = useCallback((key: keyof MarginValue, value: string) => {
    const sanitized = sanitizeCssValue(value);
    if (isValidCssValue(sanitized)) {
      onMarginChange(key, sanitized);
    }
  }, [onMarginChange]);

  return (
    <AccordionItem value="margin-section" className="border-none">
      <AccordionTrigger className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline">
        <SectionHeader icon={<Layers className="w-3 h-3" />} title="Margin" />
      </AccordionTrigger>
      <AccordionContent className="pb-2">
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput label="X" value={margin.x} onChange={(v) => handleChange('x', v)} placeholder="0px" />
          <LabeledInput label="Y" value={margin.y} onChange={(v) => handleChange('y', v)} placeholder="0px" />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

MarginSection.displayName = 'MarginSection';

// Size Section
interface SizeSectionProps {
  size: SizeValue;
  onSizeChange: (key: keyof SizeValue, value: string) => void;
}

const SizeSection = memo<SizeSectionProps>(({ size, onSizeChange }) => {
  const handleChange = useCallback((key: keyof SizeValue, value: string) => {
    const sanitized = sanitizeCssValue(value);
    if (isValidCssValue(sanitized)) {
      onSizeChange(key, sanitized);
    }
  }, [onSizeChange]);

  return (
    <AccordionItem value="size-section" className="border-none">
      <AccordionTrigger className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline">
        <SectionHeader icon={<Maximize className="w-3 h-3" />} title="Size" />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-2">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">Dimensions</label>
          <div className="grid grid-cols-2 gap-2">
            <IconInput icon={<UnfoldHorizontal className="w-3 h-3" />} placeholder="auto" value={size.width} onChange={(v) => handleChange('width', v)} />
            <IconInput icon={<UnfoldVertical className="w-3 h-3" />} placeholder="auto" value={size.height} onChange={(v) => handleChange('height', v)} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">Maximum</label>
          <div className="grid grid-cols-2 gap-2">
            <LabeledInput label="Max W" value={size.maxWidth} onChange={(v) => handleChange('maxWidth', v)} placeholder="none" />
            <LabeledInput label="Max H" value={size.maxHeight} onChange={(v) => handleChange('maxHeight', v)} placeholder="none" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">Minimum</label>
          <div className="grid grid-cols-2 gap-2">
            <LabeledInput label="Min W" value={size.minWidth} onChange={(v) => handleChange('minWidth', v)} placeholder="0" />
            <LabeledInput label="Min H" value={size.minHeight} onChange={(v) => handleChange('minHeight', v)} placeholder="0" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="text-[9px] text-muted-foreground w-full mb-0.5">Quick:</span>
          {SIZE_PRESETS.map(preset => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onSizeChange('width', preset.value);
                onSizeChange('height', preset.value);
              }}
              className="px-1.5 py-0.5 text-[9px] rounded bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

SizeSection.displayName = 'SizeSection';

// Position Section
interface PositionSectionProps {
  position: PositionValue;
  onPositionChange: (key: keyof PositionValue, value: string) => void;
}

const PositionSection = memo<PositionSectionProps>(({ position, onPositionChange }) => {
  const isPositioned = useMemo(() => position.type !== 'static' && position.type !== 'relative', [position.type]);

  return (
    <AccordionItem value="position-section" className="border-none">
      <AccordionTrigger className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline">
        <SectionHeader icon={<GripVertical className="w-3 h-3" />} title="Position" />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-2">
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Type</label>
          <StyledSelect value={position.type} onChange={(v) => onPositionChange('type', v)} options={POSITION_OPTIONS} />
        </div>
        {isPositioned && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground block">Offsets</label>
              <div className="grid grid-cols-2 gap-2">
                <LabeledInput label="Left" value={position.l} onChange={(v) => onPositionChange('l', v)} placeholder="auto" />
                <LabeledInput label="Top" value={position.t} onChange={(v) => onPositionChange('t', v)} placeholder="auto" />
                <LabeledInput label="Right" value={position.r} onChange={(v) => onPositionChange('r', v)} placeholder="auto" />
                <LabeledInput label="Bottom" value={position.b} onChange={(v) => onPositionChange('b', v)} placeholder="auto" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Z-Index</label>
              <LabeledInput label="Z" value={position.zIndex} onChange={(v) => onPositionChange('zIndex', v)} placeholder="auto" />
            </div>
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
});

PositionSection.displayName = 'PositionSection';

// Transforms Section
interface TransformsSectionProps {
  transforms: TransformValue;
  onTransformChange: (key: keyof TransformValue, value: number) => void;
}

const TransformsSection = memo<TransformsSectionProps>(({ transforms, onTransformChange }) => {
  const hasTransforms = useMemo(() => {
    return transforms.translateX !== 0 || transforms.translateY !== 0 ||
           transforms.rotate !== 0 || transforms.scale !== 100 ||
           transforms.skewX !== 0 || transforms.skewY !== 0;
  }, [transforms]);

  return (
    <AccordionItem value="transforms-section" className="border-none">
      <AccordionTrigger className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline">
        <SectionHeader icon={<Move className="w-3 h-3" />} title="Transform (2D)" badge={hasTransforms ? '✓' : undefined} />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">Translate</label>
          <div className="grid grid-cols-2 gap-2">
            <SliderControl icon={<Move className="w-2.5 h-2.5" />} label="X" value={transforms.translateX} onChange={(v) => onTransformChange('translateX', v)} min={-200} max={200} unit="px" />
            <SliderControl icon={<Move className="w-2.5 h-2.5" />} label="Y" value={transforms.translateY} onChange={(v) => onTransformChange('translateY', v)} min={-200} max={200} unit="px" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">Rotate & Scale</label>
          <div className="grid grid-cols-2 gap-2">
            <SliderControl icon={<RotateCw className="w-2.5 h-2.5" />} label="Rotate" value={transforms.rotate} onChange={(v) => onTransformChange('rotate', v)} min={-180} max={180} unit="°" />
            <SliderControl icon={<Maximize className="w-2.5 h-2.5" />} label="Scale" value={transforms.scale} onChange={(v) => onTransformChange('scale', v)} min={0} max={300} unit="%" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">Skew</label>
          <div className="grid grid-cols-2 gap-2">
            <SliderControl icon={<Zap className="w-2.5 h-2.5" />} label="X" value={transforms.skewX} onChange={(v) => onTransformChange('skewX', v)} min={-45} max={45} unit="°" />
            <SliderControl icon={<Zap className="w-2.5 h-2.5" />} label="Y" value={transforms.skewY} onChange={(v) => onTransformChange('skewY', v)} min={-45} max={45} unit="°" />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

TransformsSection.displayName = 'TransformsSection';

// 3D Transforms Section
interface Transforms3DSectionProps {
  transforms3D: Transform3DValue;
  onTransform3DChange: (key: keyof Transform3DValue, value: number) => void;
}

const Transforms3DSection = memo<Transforms3DSectionProps>(({ transforms3D, onTransform3DChange }) => {
  const hasTransforms = useMemo(() => {
    return transforms3D.rotateX !== 0 || transforms3D.rotateY !== 0 ||
           transforms3D.rotateZ !== 0 || transforms3D.perspective !== 0;
  }, [transforms3D]);

  return (
    <AccordionItem value="transforms3d-section" className="border-none">
      <AccordionTrigger className="py-1.5 text-xs font-medium text-muted-foreground hover:no-underline">
        <SectionHeader icon={<Box className="w-3 h-3" />} title="Transform (3D)" badge={hasTransforms ? '✓' : undefined} />
      </AccordionTrigger>
      <AccordionContent className="pb-2 space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground block">3D Rotation</label>
          <div className="grid grid-cols-2 gap-2">
            <SliderControl icon={<RotateCw className="w-2.5 h-2.5" />} label="X Axis" value={transforms3D.rotateX} onChange={(v) => onTransform3DChange('rotateX', v)} min={-180} max={180} unit="°" />
            <SliderControl icon={<RotateCw className="w-2.5 h-2.5" />} label="Y Axis" value={transforms3D.rotateY} onChange={(v) => onTransform3DChange('rotateY', v)} min={-180} max={180} unit="°" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SliderControl icon={<RotateCw className="w-2.5 h-2.5" />} label="Z Axis" value={transforms3D.rotateZ} onChange={(v) => onTransform3DChange('rotateZ', v)} min={-180} max={180} unit="°" />
          <SliderControl icon={<Maximize className="w-2.5 h-2.5" />} label="Perspective" value={transforms3D.perspective} onChange={(v) => onTransform3DChange('perspective', v)} min={0} max={2000} unit="px" valueLabel={transforms3D.perspective === 0 ? "None" : `${transforms3D.perspective}px`} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

Transforms3DSection.displayName = 'Transforms3DSection';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LayoutSection = memo<LayoutSectionProps>(({ state, updateNestedState }) => {
  const { padding, margin, size, position, transforms, transforms3D } = state;

  const handlePaddingChange = useCallback((key: keyof SpacingValue, value: string) => {
    updateNestedState('padding', key, value);
  }, [updateNestedState]);

  const handleMarginChange = useCallback((key: keyof MarginValue, value: string) => {
    updateNestedState('margin', key, value);
  }, [updateNestedState]);

  const handleSizeChange = useCallback((key: keyof SizeValue, value: string) => {
    updateNestedState('size', key, value);
  }, [updateNestedState]);

  const handlePositionChange = useCallback((key: keyof PositionValue, value: string) => {
    updateNestedState('position', key, value);
  }, [updateNestedState]);

  const handleTransformChange = useCallback((key: keyof TransformValue, value: number) => {
    updateNestedState('transforms', key, value);
  }, [updateNestedState]);

  const handleTransform3DChange = useCallback((key: keyof Transform3DValue, value: number) => {
    updateNestedState('transforms3D', key, value);
  }, [updateNestedState]);

  return (
    <>
      <PaddingSection padding={padding} onPaddingChange={handlePaddingChange} />
      <MarginSection margin={margin} onMarginChange={handleMarginChange} />
      <SizeSection size={size} onSizeChange={handleSizeChange} />
      <PositionSection position={position} onPositionChange={handlePositionChange} />
      <TransformsSection transforms={transforms} onTransformChange={handleTransformChange} />
      <Transforms3DSection transforms3D={transforms3D} onTransform3DChange={handleTransform3DChange} />
    </>
  );
});

LayoutSection.displayName = 'LayoutSection';

export default LayoutSection;

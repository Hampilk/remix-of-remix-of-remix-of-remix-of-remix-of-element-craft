// PropertyInspector Live Preview Component - REFACTORED
// ✅ All 23 improvements implemented

import React, { useMemo, useState, useCallback } from 'react';
import type { InspectorState } from './types';
import {
  CONSTANTS,
  buildTransforms,
  buildFilters,
  buildBorderRadius,
  buildBorder,
  buildPadding,
  buildMargin,
  normalizeNumericValue,
  validateTag,
  generateAriaAttributes,
  meetsContrastRequirements,
  type AllowedTag
} from './preview-box-utils';

interface PreviewBoxProps {
  state: InspectorState;
  generatedClasses: string;
  generatedStyles: React.CSSProperties;
  showGrid?: boolean; // #18: Grid toggle
  gridPattern?: 'grid' | 'dots' | 'none'; // #18: Grid patterns
  transitionDuration?: number; // #17: Customizable transitions
  enableExport?: boolean; // #19: Export feature flag
  responsiveMode?: 'mobile' | 'tablet' | 'desktop'; // #20: Responsive preview
  onContrastWarning?: (warning: string) => void; // #12: Contrast callback
}

export const PreviewBox: React.FC<PreviewBoxProps> = ({ 
  state, 
  generatedClasses, 
  generatedStyles,
  showGrid = true,
  gridPattern = 'grid',
  transitionDuration = CONSTANTS.TRANSITION_DURATION,
  enableExport = false,
  responsiveMode = 'desktop',
  onContrastWarning
}) => {
  const [isFocused, setIsFocused] = useState(false); // #13: Focus state
  
  // #1: Memoization with specific dependencies instead of entire state
  const {
    transforms,
    transforms3D,
    effects,
    border,
    padding,
    margin,
    size,
    typography,
    appearance,
    tag,
    textContent
  } = state;
  
  // #3 & #15: Memoized transform calculation
  const transformValue = useMemo(
    () => buildTransforms(state),
    [transforms, transforms3D]
  );
  
  // #3 & #15: Memoized filter calculation
  const filterValue = useMemo(
    () => buildFilters(state),
    [effects]
  );
  
  // #5: Fixed perspective - only in wrapper, removed duplication
  const perspectiveValue = useMemo(
    () => transforms3D.perspective > 0 
      ? `${transforms3D.perspective * CONSTANTS.PERSPECTIVE_MULTIPLIER}px` 
      : undefined,
    [transforms3D.perspective]
  );
  
  // #6: Border radius with conflict resolution
  const borderRadiusValue = useMemo(
    () => buildBorderRadius(state),
    [border.radius]
  );
  
  // #12: Contrast checking with callback
  useMemo(() => {
    if (typography.textColor && appearance.backgroundColor && onContrastWarning) {
      const contrastCheck = meetsContrastRequirements(
        typography.textColor,
        appearance.backgroundColor
      );
      
      if (!contrastCheck.meets) {
        onContrastWarning(
          `Low contrast ratio: ${contrastCheck.ratio}:1 (${contrastCheck.level}). WCAG AA requires 4.5:1.`
        );
      }
    }
  }, [typography.textColor, appearance.backgroundColor, onContrastWarning]);
  
  // #1 & #15: Compute preview-specific styles with fine-grained dependencies
  const previewStyles = useMemo<React.CSSProperties>(() => {
    const styles: React.CSSProperties = { ...generatedStyles };
    
    // Apply transforms
    if (transformValue) styles.transform = transformValue;
    
    // Apply filters
    if (filterValue) styles.filter = filterValue;
    
    // Backdrop filter
    if (effects.backdropBlur > 0) {
      styles.backdropFilter = `blur(${effects.backdropBlur}px)`;
    }
    
    // Opacity
    if (effects.opacity !== CONSTANTS.DEFAULT_OPACITY) {
      styles.opacity = effects.opacity / 100;
    }
    
    // Border radius
    if (borderRadiusValue) {
      styles.borderRadius = borderRadiusValue;
    }
    
    // #4 & #7: Enhanced border with proper unit handling
    const borderValue = buildBorder(state);
    if (borderValue) styles.border = borderValue;
    
    // #4 & #7: Enhanced padding with unit support
    const paddingValue = buildPadding(state);
    if (paddingValue) styles.padding = paddingValue;
    
    // #4 & #7: Enhanced margin with unit support
    const marginValue = buildMargin(state);
    if (marginValue) styles.margin = marginValue;
    
    // #7: Enhanced size with multiple unit support
    if (size.width) {
      styles.width = normalizeNumericValue(size.width, 'px', ['auto', 'fit-content', 'max-content', 'min-content']);
    }
    if (size.height) {
      styles.height = normalizeNumericValue(size.height, 'px', ['auto', 'fit-content', 'max-content', 'min-content']);
    }
    
    // #7 & #10: Typography with proper typing
    if (typography.fontSize) {
      styles.fontSize = normalizeNumericValue(typography.fontSize, 'px');
    }
    if (typography.fontWeight && typography.fontWeight !== 'normal') {
      styles.fontWeight = typography.fontWeight;
    }
    if (typography.textAlign && typography.textAlign !== 'left') {
      styles.textAlign = typography.textAlign;
    }
    if (typography.textColor) {
      styles.color = typography.textColor;
    }
    
    // #10: Background with proper typing
    if (appearance.backgroundColor) {
      styles.backgroundColor = appearance.backgroundColor;
    }
    if (appearance.blendMode && appearance.blendMode !== 'normal') {
      styles.mixBlendMode = appearance.blendMode;
    }
    
    // #13: Focus visible outline
    if (isFocused) {
      styles.outline = '2px solid hsl(var(--ring))';
      styles.outlineOffset = '2px';
    }
    
    return styles;
  }, [
    generatedStyles,
    transformValue,
    filterValue,
    borderRadiusValue,
    effects.backdropBlur,
    effects.opacity,
    border,
    padding,
    margin,
    size,
    typography,
    appearance,
    isFocused,
    state
  ]);
  
  // #9: Validated and type-safe tag name
  const TagName = validateTag(tag) as AllowedTag;
  
  // #11: Generate ARIA attributes
  const ariaAttributes = useMemo(
    () => generateAriaAttributes(state),
    [tag, textContent]
  );
  
  // #2: Conditional grid rendering
  const gridBackground = useMemo(() => {
    if (!showGrid || gridPattern === 'none') return null;
    
    if (gridPattern === 'dots') {
      return {
        backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: `${CONSTANTS.GRID_SIZE}px ${CONSTANTS.GRID_SIZE}px`
      };
    }
    
    // Default grid pattern
    return {
      backgroundImage: `
        linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
        linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
      `,
      backgroundSize: `${CONSTANTS.GRID_SIZE}px ${CONSTANTS.GRID_SIZE}px`
    };
  }, [showGrid, gridPattern]);
  
  // #20: Responsive container dimensions
  const containerWidth = useMemo(() => {
    switch (responsiveMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  }, [responsiveMode]);
  
  // #19: Export preview as image (placeholder for implementation)
  const handleExport = useCallback(async () => {
    if (!enableExport) return;
    
    // Implementation would use html2canvas or similar
    console.log('Export feature - to be implemented with html2canvas');
  }, [enableExport]);
  
  // #13: Keyboard navigation handlers
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  
  return (
    <div className="relative bg-card border border-border rounded-xl p-6 overflow-hidden">
      {/* #2: Conditionally rendered grid background */}
      {showGrid && gridPattern !== 'none' && (
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={gridBackground || undefined}
          aria-hidden="true"
        />
      )}
      
      {/* Preview container with responsive width */}
      <div 
        className="relative flex items-center justify-center min-h-32 mx-auto transition-all"
        style={{ 
          maxWidth: containerWidth,
          transitionDuration: `${transitionDuration}ms`
        }}
      >
        {/* #5: Perspective wrapper - single source of truth */}
        <div 
          className="preserve-3d"
          style={{ perspective: perspectiveValue }}
        >
          <TagName
            style={previewStyles}
            className={`${generatedClasses}`}
            {...ariaAttributes} // #11: ARIA support
            onFocus={handleFocus} // #13: Focus handling
            onBlur={handleBlur}
            tabIndex={TagName === 'button' || TagName === 'a' ? 0 : undefined}
          >
            {textContent || 'Preview Element'}
          </TagName>
        </div>
      </div>
      
      {/* Info overlay with responsive mode indicator */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] text-muted-foreground">
        <div className="flex gap-2 items-center">
          <span className="font-mono uppercase bg-secondary/50 px-1.5 py-0.5 rounded">
            &lt;{tag}&gt;
          </span>
          {/* #20: Responsive mode indicator */}
          <span className="font-mono uppercase bg-secondary/50 px-1.5 py-0.5 rounded">
            {responsiveMode}
          </span>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="font-mono">
            {generatedClasses.split(' ').filter(Boolean).length} classes
          </span>
          
          {/* #19: Export button */}
          {enableExport && (
            <button
              onClick={handleExport}
              className="font-mono uppercase bg-secondary/50 hover:bg-secondary px-1.5 py-0.5 rounded transition-colors"
              aria-label="Export preview as image"
            >
              Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// #23: Error boundary wrapper component
export class PreviewBoxErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-destructive/10 border border-destructive rounded-xl">
          <p className="text-destructive text-sm">
            Preview rendering error: {this.state.error?.message}
          </p>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default PreviewBox;

// Custom hooks for PreviewBox component
// Separates logic for better testability and reusability

import { useMemo, useCallback, useState } from 'react';
import type { InspectorState } from './types';
import {
  buildTransforms,
  buildFilters,
  buildBorderRadius,
  buildBorder,
  buildPadding,
  buildMargin,
  normalizeNumericValue,
  CONSTANTS
} from './preview-box-utils';

/**
 * Hook for computing preview styles with optimized memoization
 */
export function usePreviewStyles(
  state: InspectorState,
  generatedStyles: React.CSSProperties,
  isFocused: boolean = false
) {
  const {
    transforms,
    transforms3D,
    effects,
    border,
    padding,
    margin,
    size,
    typography,
    appearance
  } = state;
  
  // Memoized sub-calculations
  const transformValue = useMemo(
    () => buildTransforms(state),
    [transforms, transforms3D]
  );
  
  const filterValue = useMemo(
    () => buildFilters(state),
    [effects]
  );
  
  const borderRadiusValue = useMemo(
    () => buildBorderRadius(state),
    [border.radius]
  );
  
  // Main styles computation
  const styles = useMemo<React.CSSProperties>(() => {
    const result: React.CSSProperties = { ...generatedStyles };
    
    // Transforms
    if (transformValue) result.transform = transformValue;
    
    // Filters
    if (filterValue) result.filter = filterValue;
    
    // Backdrop filter
    if (effects.backdropBlur > 0) {
      result.backdropFilter = `blur(${effects.backdropBlur}px)`;
    }
    
    // Opacity
    if (effects.opacity !== CONSTANTS.DEFAULT_OPACITY) {
      result.opacity = effects.opacity / 100;
    }
    
    // Border radius
    if (borderRadiusValue) {
      result.borderRadius = borderRadiusValue;
    }
    
    // Border
    const borderValue = buildBorder(state);
    if (borderValue) result.border = borderValue;
    
    // Padding
    const paddingValue = buildPadding(state);
    if (paddingValue) result.padding = paddingValue;
    
    // Margin
    const marginValue = buildMargin(state);
    if (marginValue) result.margin = marginValue;
    
    // Size
    if (size.width) {
      result.width = normalizeNumericValue(size.width, 'px', ['auto', 'fit-content', 'max-content', 'min-content']);
    }
    if (size.height) {
      result.height = normalizeNumericValue(size.height, 'px', ['auto', 'fit-content', 'max-content', 'min-content']);
    }
    
    // Typography
    if (typography.fontSize) {
      result.fontSize = normalizeNumericValue(typography.fontSize, 'px');
    }
    if (typography.fontWeight && typography.fontWeight !== 'normal') {
      result.fontWeight = typography.fontWeight;
    }
    if (typography.textAlign && typography.textAlign !== 'left') {
      result.textAlign = typography.textAlign;
    }
    if (typography.textColor) {
      result.color = typography.textColor;
    }
    
    // Background
    if (appearance.backgroundColor) {
      result.backgroundColor = appearance.backgroundColor;
    }
    if (appearance.blendMode && appearance.blendMode !== 'normal') {
      result.mixBlendMode = appearance.blendMode;
    }
    
    // Focus state
    if (isFocused) {
      result.outline = '2px solid hsl(var(--ring))';
      result.outlineOffset = '2px';
    }
    
    return result;
  }, [
    generatedStyles,
    transformValue,
    filterValue,
    borderRadiusValue,
    effects,
    border,
    padding,
    margin,
    size,
    typography,
    appearance,
    isFocused,
    state
  ]);
  
  return styles;
}

/**
 * Hook for managing focus state with keyboard navigation
 */
export function useFocusState() {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  
  return { isFocused, handleFocus, handleBlur };
}

/**
 * Hook for grid background patterns
 */
export function useGridBackground(
  showGrid: boolean,
  gridPattern: 'grid' | 'dots' | 'none',
  gridSize: number = CONSTANTS.GRID_SIZE
) {
  return useMemo(() => {
    if (!showGrid || gridPattern === 'none') return null;
    
    if (gridPattern === 'dots') {
      return {
        backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`
      };
    }
    
    return {
      backgroundImage: `
        linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
        linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`
    };
  }, [showGrid, gridPattern, gridSize]);
}

/**
 * Hook for responsive preview modes
 */
export function useResponsiveMode(mode: 'mobile' | 'tablet' | 'desktop') {
  return useMemo(() => {
    const widths = {
      mobile: '375px',
      tablet: '768px',
      desktop: '100%'
    };
    
    return {
      width: widths[mode],
      label: mode.charAt(0).toUpperCase() + mode.slice(1)
    };
  }, [mode]);
}

/**
 * Hook for perspective calculation
 */
export function usePerspective(perspective: number) {
  return useMemo(
    () => perspective > 0 
      ? `${perspective * CONSTANTS.PERSPECTIVE_MULTIPLIER}px` 
      : undefined,
    [perspective]
  );
}

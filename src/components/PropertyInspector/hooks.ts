// PropertyInspector Custom Hooks

import { useState, useMemo, useCallback } from 'react';
import type { InspectorState, Breakpoint } from './types';
import { DEFAULT_INSPECTOR_STATE } from './constants';

// Type for breakpoint-specific state storage
type BreakpointStates = Record<Breakpoint, Partial<InspectorState>>;

const BREAKPOINT_KEYS: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

// Main state management hook with breakpoint support
export const useInspectorState = (initialState?: Partial<InspectorState>) => {
  // Base state (shared across all breakpoints for non-responsive props)
  const [state, setState] = useState<InspectorState>({
    ...DEFAULT_INSPECTOR_STATE,
    ...initialState
  });

  // Breakpoint-specific overrides
  const [breakpointStates, setBreakpointStates] = useState<BreakpointStates>({
    base: {},
    sm: {},
    md: {},
    lg: {},
    xl: {},
    '2xl': {}
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('base');

  // Get effective state for current breakpoint
  const getEffectiveState = useCallback((bp: Breakpoint): InspectorState => {
    const bpState = breakpointStates[bp];
    return {
      ...state,
      ...bpState,
      padding: { ...state.padding, ...(bpState.padding || {}) },
      margin: { ...state.margin, ...(bpState.margin || {}) },
      position: { ...state.position, ...(bpState.position || {}) },
      size: { ...state.size, ...(bpState.size || {}) },
      typography: { ...state.typography, ...(bpState.typography || {}) },
      transforms: { ...state.transforms, ...(bpState.transforms || {}) },
      transforms3D: { ...state.transforms3D, ...(bpState.transforms3D || {}) },
      border: { 
        ...state.border, 
        ...(bpState.border || {}),
        radius: { ...state.border.radius, ...(bpState.border?.radius || {}) }
      },
      effects: { ...state.effects, ...(bpState.effects || {}) },
      appearance: { ...state.appearance, ...(bpState.appearance || {}) }
    };
  }, [state, breakpointStates]);

  const updateState = useCallback(<K extends keyof InspectorState>(
    key: K, 
    value: InspectorState[K],
    breakpoint?: Breakpoint
  ) => {
    const bp = breakpoint || currentBreakpoint;
    
    if (bp === 'base') {
      setState(prev => ({ ...prev, [key]: value }));
    } else {
      setBreakpointStates(prev => ({
        ...prev,
        [bp]: { ...prev[bp], [key]: value }
      }));
    }
  }, [currentBreakpoint]);

  const updateNestedState = useCallback(<K extends keyof InspectorState>(
    key: K,
    nestedKey: string,
    value: string | number | null,
    breakpoint?: Breakpoint
  ) => {
    const bp = breakpoint || currentBreakpoint;
    
    if (bp === 'base') {
      setState(prev => {
        const currentValue = prev[key];
        if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
          return {
            ...prev,
            [key]: { 
              ...(currentValue as object), 
              [nestedKey]: value 
            }
          };
        }
        return prev;
      });
    } else {
      setBreakpointStates(prev => {
        const currentBpState = prev[bp] || {};
        const existingValue = currentBpState[key];
        const currentValue = (typeof existingValue === 'object' && existingValue !== null) 
          ? existingValue as object 
          : {};
        return {
          ...prev,
          [bp]: {
            ...currentBpState,
            [key]: { ...currentValue, [nestedKey]: value }
          }
        };
      });
    }
  }, [currentBreakpoint]);

  const updateDeepNestedState = useCallback(<K extends keyof InspectorState>(
    key: K,
    nestedKey: string,
    deepKey: string,
    value: string | number,
    breakpoint?: Breakpoint
  ) => {
    const bp = breakpoint || currentBreakpoint;
    
    if (bp === 'base') {
      setState(prev => {
        const nested = prev[key] as unknown;
        if (typeof nested === 'object' && nested !== null && !Array.isArray(nested)) {
          const nestedObj = nested as Record<string, unknown>;
          const deepNested = nestedObj[nestedKey];
          if (typeof deepNested === 'object' && deepNested !== null) {
            return {
              ...prev,
              [key]: {
                ...nestedObj,
                [nestedKey]: {
                  ...(deepNested as Record<string, unknown>),
                  [deepKey]: value
                }
              }
            };
          }
        }
        return prev;
      });
    } else {
      setBreakpointStates(prev => {
        const currentBpState = prev[bp] || {};
        const existingValue = currentBpState[key];
        const currentValue: Record<string, unknown> = (typeof existingValue === 'object' && existingValue !== null) 
          ? JSON.parse(JSON.stringify(existingValue))
          : {};
        const existingNested = currentValue[nestedKey];
        const nestedValue = (typeof existingNested === 'object' && existingNested !== null)
          ? existingNested as Record<string, unknown>
          : {};
        return {
          ...prev,
          [bp]: {
            ...currentBpState,
            [key]: {
              ...currentValue,
              [nestedKey]: { ...nestedValue, [deepKey]: value }
            }
          }
        };
      });
    }
  }, [currentBreakpoint]);

  // Apply partial state updates (for AI integration)
  const applyStateChanges = useCallback((changes: Partial<InspectorState>) => {
    setState(prev => {
      const newState = { ...prev };
      
      for (const [key, value] of Object.entries(changes)) {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Deep merge for nested objects
            const prevValue = prev[key as keyof InspectorState];
            if (typeof prevValue === 'object' && prevValue !== null && !Array.isArray(prevValue)) {
              (newState as Record<string, unknown>)[key] = deepMerge(
                prevValue as unknown as Record<string, unknown>, 
                value as unknown as Record<string, unknown>
              );
            } else {
              (newState as Record<string, unknown>)[key] = value;
            }
          } else {
            (newState as Record<string, unknown>)[key] = value;
          }
        }
      }
      
      return newState;
    });
  }, []);

  const resetState = useCallback(() => {
    setState(DEFAULT_INSPECTOR_STATE);
    setBreakpointStates({
      base: {},
      sm: {},
      md: {},
      lg: {},
      xl: {},
      '2xl': {}
    });
  }, []);

  const resetTransforms = useCallback(() => {
    setState(prev => ({
      ...prev,
      transforms: DEFAULT_INSPECTOR_STATE.transforms,
      transforms3D: DEFAULT_INSPECTOR_STATE.transforms3D
    }));
  }, []);

  const resetEffects = useCallback(() => {
    setState(prev => ({
      ...prev,
      effects: DEFAULT_INSPECTOR_STATE.effects
    }));
  }, []);

  // Clear breakpoint-specific overrides
  const clearBreakpointOverrides = useCallback((bp: Breakpoint) => {
    if (bp !== 'base') {
      setBreakpointStates(prev => ({
        ...prev,
        [bp]: {}
      }));
    }
  }, []);

  // Check if a breakpoint has overrides
  const hasBreakpointOverrides = useCallback((bp: Breakpoint): boolean => {
    return Object.keys(breakpointStates[bp] || {}).length > 0;
  }, [breakpointStates]);

  return {
    state: getEffectiveState(currentBreakpoint),
    baseState: state,
    breakpointStates,
    currentBreakpoint,
    setCurrentBreakpoint,
    setState,
    updateState,
    updateNestedState,
    updateDeepNestedState,
    applyStateChanges,
    resetState,
    resetTransforms,
    resetEffects,
    clearBreakpointOverrides,
    hasBreakpointOverrides,
    getEffectiveState
  };
};

// Deep merge utility
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];
    
    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue;
    }
  }
  
  return result;
}

// Utility: Normalize numeric values to ensure no duplicate units
function normalizeNumericValue(value: string | number | null | undefined): string {
  if (!value) return '';
  const str = String(value).trim();
  // Remove any existing units to get just the number
  const numMatch = str.match(/^([\d.-]+)/);
  return numMatch ? numMatch[1] : str;
}

// Utility: Generate Tailwind class with proper unit handling
function getTailwindClass(property: string, value: string, breakpoint: Breakpoint = 'base'): string {
  const prefix = breakpoint === 'base' ? '' : `${breakpoint}:`;

  if (!value || value === '0') return '';

  const numValue = normalizeNumericValue(value);

  // For position and size properties, use bracket notation with units
  if (property.startsWith('position-') || property.startsWith('size-')) {
    return `${prefix}${property}-[${numValue}px]`;
  }

  // For spacing properties with non-standard values, use bracket notation
  if (property.startsWith('p-') || property.startsWith('m-')) {
    // Try standard Tailwind token first (e.g., p-4, m-2)
    if (/^\d+$/.test(numValue) && ['0', '1', '2', '3', '4', '6', '8', '10', '12', '14', '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96'].includes(numValue)) {
      return `${prefix}${property}-${numValue}`;
    }
    // Otherwise use bracket notation
    return `${prefix}${property}-[${numValue}px]`;
  }

  return `${prefix}${property}-${value}`;
}

// Tailwind class generation hook with multi-breakpoint support
export const useGeneratedClasses = (state: InspectorState, breakpoint: Breakpoint = 'base') => {
  const prefix = breakpoint === 'base' ? '' : `${breakpoint}:`;

  return useMemo(() => {
    const classes: string[] = [];

    // Padding - use bracket notation for arbitrary values
    const paddingL = normalizeNumericValue(state.padding.l);
    const paddingT = normalizeNumericValue(state.padding.t);
    const paddingR = normalizeNumericValue(state.padding.r);
    const paddingB = normalizeNumericValue(state.padding.b);

    if (paddingL && paddingL !== '0') classes.push(`${prefix}pl-[${paddingL}px]`);
    if (paddingT && paddingT !== '0') classes.push(`${prefix}pt-[${paddingT}px]`);
    if (paddingR && paddingR !== '0') classes.push(`${prefix}pr-[${paddingR}px]`);
    if (paddingB && paddingB !== '0') classes.push(`${prefix}pb-[${paddingB}px]`);

    // Margin - use bracket notation for arbitrary values
    const marginX = normalizeNumericValue(state.margin.x);
    const marginY = normalizeNumericValue(state.margin.y);

    if (marginX && marginX !== '0') classes.push(`${prefix}mx-[${marginX}px]`);
    if (marginY && marginY !== '0') classes.push(`${prefix}my-[${marginY}px]`);

    // Position
    if (state.position.type !== 'static') classes.push(`${prefix}${state.position.type}`);
    if (state.position.zIndex) classes.push(`${prefix}z-[${normalizeNumericValue(state.position.zIndex)}]`);
    if (state.position.l) classes.push(`${prefix}left-[${normalizeNumericValue(state.position.l)}px]`);
    if (state.position.t) classes.push(`${prefix}top-[${normalizeNumericValue(state.position.t)}px]`);
    if (state.position.r) classes.push(`${prefix}right-[${normalizeNumericValue(state.position.r)}px]`);
    if (state.position.b) classes.push(`${prefix}bottom-[${normalizeNumericValue(state.position.b)}px]`);

    // Size
    if (state.size.width) classes.push(`${prefix}w-[${state.size.width}]`);
    if (state.size.height) classes.push(`${prefix}h-[${state.size.height}]`);
    if (state.size.maxWidth) classes.push(`${prefix}max-w-[${state.size.maxWidth}]`);
    if (state.size.maxHeight) classes.push(`${prefix}max-h-[${state.size.maxHeight}]`);
    if (state.size.minWidth) classes.push(`${prefix}min-w-[${state.size.minWidth}]`);
    if (state.size.minHeight) classes.push(`${prefix}min-h-[${state.size.minHeight}]`);

    // Typography
    if (state.typography.fontFamily !== 'inter') classes.push(`${prefix}font-${state.typography.fontFamily}`);
    if (state.typography.fontWeight !== 'normal') classes.push(`${prefix}font-${state.typography.fontWeight}`);
    if (state.typography.fontSize) classes.push(`${prefix}text-[${state.typography.fontSize}]`);
    if (state.typography.letterSpacing !== 'normal') classes.push(`${prefix}tracking-${state.typography.letterSpacing}`);
    if (state.typography.lineHeight) classes.push(`${prefix}leading-[${state.typography.lineHeight}]`);
    if (state.typography.textAlign !== 'left') classes.push(`${prefix}text-${state.typography.textAlign}`);

    // Transforms
    if (state.transforms.rotate !== 0) classes.push(`${prefix}rotate-[${state.transforms.rotate}deg]`);
    if (state.transforms.scale !== 100) classes.push(`${prefix}scale-[${state.transforms.scale / 100}]`);
    if (state.transforms.translateX !== 0) classes.push(`${prefix}translate-x-[${state.transforms.translateX}px]`);
    if (state.transforms.translateY !== 0) classes.push(`${prefix}translate-y-[${state.transforms.translateY}px]`);
    if (state.transforms.skewX !== 0) classes.push(`${prefix}skew-x-[${state.transforms.skewX}deg]`);
    if (state.transforms.skewY !== 0) classes.push(`${prefix}skew-y-[${state.transforms.skewY}deg]`);

    // Effects
    if (state.effects.opacity !== 100) classes.push(`${prefix}opacity-[${state.effects.opacity / 100}]`);
    if (state.effects.blur > 0) classes.push(`${prefix}blur-[${state.effects.blur}px]`);
    if (state.effects.backdropBlur > 0) classes.push(`${prefix}backdrop-blur-[${state.effects.backdropBlur}px]`);
    if (state.effects.hueRotate !== 0) classes.push(`${prefix}hue-rotate-[${state.effects.hueRotate}deg]`);
    if (state.effects.saturation !== 100) classes.push(`${prefix}saturate-[${state.effects.saturation / 100}]`);
    if (state.effects.brightness !== 100) classes.push(`${prefix}brightness-[${state.effects.brightness / 100}]`);
    if (state.effects.contrast !== 100) classes.push(`${prefix}contrast-[${state.effects.contrast / 100}]`);
    if (state.effects.grayscale > 0) classes.push(`${prefix}grayscale-[${state.effects.grayscale / 100}]`);
    if (state.effects.invert > 0) classes.push(`${prefix}invert-[${state.effects.invert / 100}]`);
    if (state.effects.sepia > 0) classes.push(`${prefix}sepia-[${state.effects.sepia / 100}]`);
    if (state.effects.shadow !== 'none') classes.push(`${prefix}shadow-${state.effects.shadow}`);

    // Border
    if (state.border.radius.all > 0) classes.push(`${prefix}rounded-[${state.border.radius.all}px]`);
    if (state.border.width && state.border.width !== '0') classes.push(`${prefix}border-[${normalizeNumericValue(state.border.width)}px]`);
    if (state.border.style !== 'solid' && state.border.style !== 'none') classes.push(`${prefix}border-${state.border.style}`);

    // Custom Tailwind classes
    classes.push(...state.tailwindClasses);

    return classes.filter(Boolean).join(' ');
  }, [state, prefix]);
};

// Generate all breakpoint classes combined
export const useAllBreakpointClasses = (
  baseState: InspectorState,
  breakpointStates: Record<Breakpoint, Partial<InspectorState>>,
  getEffectiveState: (bp: Breakpoint) => InspectorState
) => {
  return useMemo(() => {
    const allClasses: string[] = [];
    const breakpoints: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];
    
    breakpoints.forEach(bp => {
      if (bp === 'base' || Object.keys(breakpointStates[bp] || {}).length > 0) {
        const effectiveState = getEffectiveState(bp);
        const prefix = bp === 'base' ? '' : `${bp}:`;
        
        // Generate classes for this breakpoint (simplified - reuse logic from useGeneratedClasses)
        if (effectiveState.padding.l && effectiveState.padding.l !== '0') 
          allClasses.push(`${prefix}pl-${effectiveState.padding.l}`);
        // ... add more as needed
      }
    });
    
    return [...new Set(allClasses)].join(' ');
  }, [baseState, breakpointStates, getEffectiveState]);
};

// Inline style generation hook
export const useGeneratedStyles = (state: InspectorState) => {
  return useMemo(() => {
    const styles: Record<string, string> = {};
    
    // Colors (inline styles for custom colors)
    if (state.typography.textColor) styles.color = state.typography.textColor;
    if (state.appearance.backgroundColor) styles.backgroundColor = state.appearance.backgroundColor;
    if (state.border.color) styles.borderColor = state.border.color;
    
    // 3D Transforms
    const transforms3D: string[] = [];
    if (state.transforms3D.rotateX !== 0) transforms3D.push(`rotateX(${state.transforms3D.rotateX}deg)`);
    if (state.transforms3D.rotateY !== 0) transforms3D.push(`rotateY(${state.transforms3D.rotateY}deg)`);
    if (state.transforms3D.rotateZ !== 0) transforms3D.push(`rotateZ(${state.transforms3D.rotateZ}deg)`);
    if (transforms3D.length > 0) styles.transform = transforms3D.join(' ');
    if (state.transforms3D.perspective > 0) styles.perspective = `${state.transforms3D.perspective * 100}px`;
    
    // Blend mode
    if (state.appearance.blendMode !== 'normal') styles.mixBlendMode = state.appearance.blendMode;
    
    // Background image
    if (state.appearance.backgroundImage) styles.backgroundImage = `url(${state.appearance.backgroundImage})`;
    
    // Inline CSS parsing
    if (state.inlineCSS) {
      const cssLines = state.inlineCSS.split(';').filter(Boolean);
      cssLines.forEach(line => {
        const [prop, val] = line.split(':').map(s => s.trim());
        if (prop && val) {
          // Convert CSS prop to camelCase
          const camelProp = prop.replace(/-([a-z])/g, g => g[1].toUpperCase());
          styles[camelProp] = val;
        }
      });
    }
    
    return styles;
  }, [state]);
};

// HTML code generation hook
export const useGeneratedCode = (
  state: InspectorState, 
  generatedClasses: string,
  generatedStyles: Record<string, string>
) => {
  return useMemo(() => {
    const idAttr = state.elementId ? ` id="${state.elementId}"` : '';
    const classAttr = generatedClasses ? ` class="${generatedClasses}"` : '';
    
    const styleStr = Object.entries(generatedStyles)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
      .join('; ');
    const styleAttr = styleStr ? ` style="${styleStr}"` : '';
    
    const hrefAttr = state.link && (state.tag === 'a' || state.tag === 'button') ? ` href="${state.link}"` : '';
    
    const html = `<${state.tag}${idAttr}${classAttr}${styleAttr}${hrefAttr}>\n  ${state.textContent}\n</${state.tag}>`;
    
    return html;
  }, [state, generatedClasses, generatedStyles]);
};

// CSS export hook
export const useExportCSS = (state: InspectorState) => {
  return useMemo(() => {
    const lines: string[] = [];
    const selector = state.elementId ? `#${state.elementId}` : '.element';
    
    lines.push(`${selector} {`);
    
    // Position
    if (state.position.type !== 'static') lines.push(`  position: ${state.position.type};`);
    if (state.position.l) lines.push(`  left: ${state.position.l};`);
    if (state.position.t) lines.push(`  top: ${state.position.t};`);
    if (state.position.r) lines.push(`  right: ${state.position.r};`);
    if (state.position.b) lines.push(`  bottom: ${state.position.b};`);
    if (state.position.zIndex) lines.push(`  z-index: ${state.position.zIndex};`);
    
    // Size
    if (state.size.width) lines.push(`  width: ${state.size.width};`);
    if (state.size.height) lines.push(`  height: ${state.size.height};`);
    
    // Padding - normalize values before adding units
    const paddingT = state.padding.t ? normalizeNumericValue(state.padding.t) : '0';
    const paddingR = state.padding.r ? normalizeNumericValue(state.padding.r) : '0';
    const paddingB = state.padding.b ? normalizeNumericValue(state.padding.b) : '0';
    const paddingL = state.padding.l ? normalizeNumericValue(state.padding.l) : '0';
    const padding = `${paddingT}px ${paddingR}px ${paddingB}px ${paddingL}px`;
    if (padding !== '0px 0px 0px 0px') lines.push(`  padding: ${padding};`);

    // Margin - normalize values before adding units
    const marginY = state.margin.y ? normalizeNumericValue(state.margin.y) : '0';
    const marginX = state.margin.x ? normalizeNumericValue(state.margin.x) : '0';
    if (state.margin.x !== '0' || state.margin.y !== '0') {
      lines.push(`  margin: ${marginY}px ${marginX}px;`);
    }
    
    // Typography
    if (state.typography.fontSize) lines.push(`  font-size: ${state.typography.fontSize};`);
    if (state.typography.fontWeight !== 'normal') lines.push(`  font-weight: ${state.typography.fontWeight};`);
    if (state.typography.textColor) lines.push(`  color: ${state.typography.textColor};`);
    if (state.typography.textAlign !== 'left') lines.push(`  text-align: ${state.typography.textAlign};`);
    
    // Background
    if (state.appearance.backgroundColor) lines.push(`  background-color: ${state.appearance.backgroundColor};`);
    
    // Border
    if (state.border.radius.all > 0) lines.push(`  border-radius: ${state.border.radius.all}px;`);
    if (state.border.color && state.border.width !== '0') {
      lines.push(`  border: ${state.border.width}px ${state.border.style} ${state.border.color};`);
    }
    
    // Transforms
    const transforms: string[] = [];
    if (state.transforms.translateX !== 0) transforms.push(`translateX(${state.transforms.translateX}px)`);
    if (state.transforms.translateY !== 0) transforms.push(`translateY(${state.transforms.translateY}px)`);
    if (state.transforms.rotate !== 0) transforms.push(`rotate(${state.transforms.rotate}deg)`);
    if (state.transforms.scale !== 100) transforms.push(`scale(${state.transforms.scale / 100})`);
    if (state.transforms.skewX !== 0) transforms.push(`skewX(${state.transforms.skewX}deg)`);
    if (state.transforms.skewY !== 0) transforms.push(`skewY(${state.transforms.skewY}deg)`);
    if (state.transforms3D.rotateX !== 0) transforms.push(`rotateX(${state.transforms3D.rotateX}deg)`);
    if (state.transforms3D.rotateY !== 0) transforms.push(`rotateY(${state.transforms3D.rotateY}deg)`);
    if (state.transforms3D.rotateZ !== 0) transforms.push(`rotateZ(${state.transforms3D.rotateZ}deg)`);
    if (transforms.length > 0) lines.push(`  transform: ${transforms.join(' ')};`);
    if (state.transforms3D.perspective > 0) lines.push(`  perspective: ${state.transforms3D.perspective * 100}px;`);
    
    // Effects
    const filters: string[] = [];
    if (state.effects.blur > 0) filters.push(`blur(${state.effects.blur}px)`);
    if (state.effects.brightness !== 100) filters.push(`brightness(${state.effects.brightness / 100})`);
    if (state.effects.saturation !== 100) filters.push(`saturate(${state.effects.saturation / 100})`);
    if (state.effects.contrast !== 100) filters.push(`contrast(${state.effects.contrast / 100})`);
    if (state.effects.hueRotate !== 0) filters.push(`hue-rotate(${state.effects.hueRotate}deg)`);
    if (state.effects.grayscale > 0) filters.push(`grayscale(${state.effects.grayscale / 100})`);
    if (state.effects.invert > 0) filters.push(`invert(${state.effects.invert / 100})`);
    if (state.effects.sepia > 0) filters.push(`sepia(${state.effects.sepia / 100})`);
    if (filters.length > 0) lines.push(`  filter: ${filters.join(' ')};`);
    
    if (state.effects.backdropBlur > 0) lines.push(`  backdrop-filter: blur(${state.effects.backdropBlur}px);`);
    if (state.effects.opacity !== 100) lines.push(`  opacity: ${state.effects.opacity / 100};`);
    if (state.effects.shadow !== 'none') lines.push(`  /* shadow-${state.effects.shadow} */`);
    
    lines.push('}');
    
    return lines.join('\n');
  }, [state]);
};

// Breakpoint state management (deprecated - use useInspectorState instead)
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('base');
  return { breakpoint, setBreakpoint };
};

// PreviewBox Utility Functions
// Separated for better testability and reusability

import type { InspectorState } from '@/components/PropertyInspector/types';

// Constants
export const CONSTANTS = {
  GRID_SIZE: 20,
  DEFAULT_SCALE: 100,
  DEFAULT_BRIGHTNESS: 100,
  DEFAULT_OPACITY: 100,
  PERSPECTIVE_MULTIPLIER: 100,
  MIN_CONTRAST_RATIO: 4.5, // WCAG AA standard
  TRANSITION_DURATION: 200,
} as const;

// Allowed HTML tags whitelist for security
export const ALLOWED_TAGS = [
  'div', 'span', 'button', 'a', 'p', 'h1', 'h2', 'h3', 
  'h4', 'h5', 'h6', 'section', 'article', 'aside', 'header', 
  'footer', 'nav', 'main', 'label', 'input'
] as const;

export type AllowedTag = typeof ALLOWED_TAGS[number];

// CSS units that should be recognized
const CSS_UNITS = ['px', 'rem', 'em', '%', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex'];

/**
 * Enhanced normalize function with validation and multiple unit support
 * Handles: auto, inherit, initial, negative values, floats, and various CSS units
 */
export function normalizeNumericValue(
  value: string | number | null | undefined,
  defaultUnit: string = 'px',
  allowedKeywords: string[] = ['auto', 'inherit', 'initial', 'unset']
): string {
  if (!value && value !== 0) return '';
  
  const str = String(value).trim().toLowerCase();
  
  // Handle CSS keywords
  if (allowedKeywords.includes(str)) return str;
  
  // Check if value already has a valid unit
  const hasUnit = CSS_UNITS.some(unit => str.endsWith(unit));
  if (hasUnit) return str;
  
  // Extract numeric part (supports negative and decimal)
  const numMatch = str.match(/^(-?[\d.]+)/);
  if (!numMatch) return str; // Return as-is if no number found
  
  const numValue = parseFloat(numMatch[1]);
  
  // Validate number
  if (isNaN(numValue)) return '';
  
  return `${numValue}${defaultUnit}`;
}

/**
 * Build transform string from state
 */
export function buildTransforms(state: InspectorState): string {
  const transforms: string[] = [];
  
  const { translateX, translateY, rotate, scale, skewX, skewY } = state.transforms;
  const { rotateX, rotateY, rotateZ } = state.transforms3D;
  
  if (translateX !== 0) transforms.push(`translateX(${translateX}px)`);
  if (translateY !== 0) transforms.push(`translateY(${translateY}px)`);
  if (rotate !== 0) transforms.push(`rotate(${rotate}deg)`);
  if (scale !== CONSTANTS.DEFAULT_SCALE) transforms.push(`scale(${scale / CONSTANTS.DEFAULT_SCALE})`);
  if (skewX !== 0) transforms.push(`skewX(${skewX}deg)`);
  if (skewY !== 0) transforms.push(`skewY(${skewY}deg)`);
  if (rotateX !== 0) transforms.push(`rotateX(${rotateX}deg)`);
  if (rotateY !== 0) transforms.push(`rotateY(${rotateY}deg)`);
  if (rotateZ !== 0) transforms.push(`rotateZ(${rotateZ}deg)`);
  
  return transforms.join(' ');
}

/**
 * Build filter string from effects
 */
export function buildFilters(state: InspectorState): string {
  const filters: string[] = [];
  const { blur, brightness, saturation, contrast, hueRotate, grayscale, invert, sepia } = state.effects;
  
  if (blur > 0) filters.push(`blur(${blur}px)`);
  if (brightness !== CONSTANTS.DEFAULT_BRIGHTNESS) filters.push(`brightness(${brightness / 100})`);
  if (saturation !== CONSTANTS.DEFAULT_BRIGHTNESS) filters.push(`saturate(${saturation / 100})`);
  if (contrast !== CONSTANTS.DEFAULT_BRIGHTNESS) filters.push(`contrast(${contrast / 100})`);
  if (hueRotate !== 0) filters.push(`hue-rotate(${hueRotate}deg)`);
  if (grayscale > 0) filters.push(`grayscale(${grayscale / 100})`);
  if (invert > 0) filters.push(`invert(${invert / 100})`);
  if (sepia > 0) filters.push(`sepia(${sepia / 100})`);
  
  return filters.join(' ');
}

/**
 * Build border styles with conflict resolution
 * Priority: individual corners > all
 */
export function buildBorderRadius(state: InspectorState): string {
  const { all, tl, tr, br, bl } = state.border.radius;
  
  // Check if individual corners are set
  const hasIndividualCorners = tl || tr || br || bl;
  
  if (all > 0 && !hasIndividualCorners) {
    return `${all}px`;
  } else if (hasIndividualCorners) {
    return `${tl}px ${tr}px ${br}px ${bl}px`;
  }
  
  return '';
}

/**
 * Build border with proper normalization
 */
export function buildBorder(state: InspectorState): string {
  if (!state.border.color || state.border.width === '0') return '';
  
  const borderWidth = normalizeNumericValue(state.border.width, 'px') || '1px';
  return `${borderWidth} ${state.border.style} ${state.border.color}`;
}

/**
 * Build padding string
 */
export function buildPadding(state: InspectorState): string {
  const { l, t, r, b } = state.padding;
  if (!l && !t && !r && !b) return '';
  
  const paddingT = normalizeNumericValue(t, 'px') || '0px';
  const paddingR = normalizeNumericValue(r, 'px') || '0px';
  const paddingB = normalizeNumericValue(b, 'px') || '0px';
  const paddingL = normalizeNumericValue(l, 'px') || '0px';
  
  return `${paddingT} ${paddingR} ${paddingB} ${paddingL}`;
}

/**
 * Build margin string
 */
export function buildMargin(state: InspectorState): string {
  if (state.margin.x === '0' && state.margin.y === '0') return '';
  
  const marginY = normalizeNumericValue(state.margin.y, 'px') || '0px';
  const marginX = normalizeNumericValue(state.margin.x, 'px') || '0px';
  
  return `${marginY} ${marginX}`;
}

/**
 * Calculate relative luminance for WCAG contrast
 */
function getLuminance(color: string): number {
  // Simple hex to RGB conversion (can be extended for other formats)
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const [rs, gs, bs] = [r, g, b].map(c => 
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  try {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return CONSTANTS.MIN_CONTRAST_RATIO; // Safe fallback
  }
}

/**
 * Check if contrast meets WCAG standards
 */
export function meetsContrastRequirements(
  textColor: string, 
  backgroundColor: string
): { meets: boolean; ratio: number; level: 'AAA' | 'AA' | 'fail' } {
  const ratio = calculateContrastRatio(textColor, backgroundColor);
  
  return {
    meets: ratio >= CONSTANTS.MIN_CONTRAST_RATIO,
    ratio: Math.round(ratio * 100) / 100,
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail'
  };
}

/**
 * Validate tag name against whitelist
 */
export function validateTag(tag: string): AllowedTag {
  const normalizedTag = tag.toLowerCase();
  return (ALLOWED_TAGS as readonly string[]).includes(normalizedTag) 
    ? normalizedTag as AllowedTag 
    : 'div';
}

/**
 * Generate ARIA attributes from state
 */
export function generateAriaAttributes(state: InspectorState): Record<string, string> {
  const attrs: Record<string, string> = {};
  
  // Add aria-label if content exists
  if (state.textContent) {
    attrs['aria-label'] = state.textContent;
  }
  
  // Add role based on tag
  const tag = validateTag(state.tag);
  if (tag === 'button' || tag === 'a') {
    attrs['role'] = tag === 'a' ? 'link' : 'button';
  }
  
  return attrs;
}

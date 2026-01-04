// Tailwind utility functions for class generation and validation

import type { Breakpoint } from '../types';

/**
 * Normalize numeric values - extract just the numeric part, removing any units
 */
export function normalizeNumericValue(value: string | number | null | undefined): string {
  if (!value) return '';
  const str = String(value).trim();
  // Remove any existing units to get just the number
  const numMatch = str.match(/^([\d.-]+)/);
  return numMatch ? numMatch[1] : str;
}

/**
 * Check if a value is a valid Tailwind token
 */
function isTailwindToken(property: string, value: string): boolean {
  const numValue = normalizeNumericValue(value);
  
  // Standard Tailwind spacing tokens (0, 1, 2, 3, 4, 6, 8, etc.)
  const spacingTokens = ['0', '1', '2', '3', '4', '6', '8', '10', '12', '14', '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96'];
  
  // Standard opacity values
  const opacityTokens = ['0', '5', '10', '20', '25', '30', '40', '50', '60', '70', '75', '80', '90', '95', '100'];
  
  if (property.startsWith('opacity-')) {
    return opacityTokens.includes(numValue);
  }
  
  if (property.startsWith('p-') || property.startsWith('m-') || property.startsWith('gap-')) {
    return spacingTokens.includes(numValue);
  }
  
  return false;
}

/**
 * Generate a Tailwind class with proper unit handling and bracket notation
 */
export function getTailwindClass(
  property: string,
  value: string | number,
  breakpoint: Breakpoint = 'base'
): string {
  if (!value || value === '0') return '';
  
  const prefix = breakpoint === 'base' ? '' : `${breakpoint}:`;
  const numValue = normalizeNumericValue(String(value));
  
  // For spacing properties
  if (property.startsWith('p-') || property.startsWith('m-')) {
    // Try standard Tailwind token first
    if (isTailwindToken(property, numValue)) {
      return `${prefix}${property}-${numValue}`;
    }
    // Otherwise use bracket notation with units
    return `${prefix}${property}-[${numValue}px]`;
  }
  
  // For gap properties
  if (property.startsWith('gap-')) {
    if (isTailwindToken('gap-', numValue)) {
      return `${prefix}${property}-${numValue}`;
    }
    return `${prefix}${property}-[${numValue}px]`;
  }
  
  // For opacity, use standard values if available
  if (property.startsWith('opacity-')) {
    if (isTailwindToken(property, numValue)) {
      return `${prefix}${property}-${numValue}`;
    }
    return `${prefix}${property}-[${(Number(numValue) / 100).toFixed(2)}]`;
  }
  
  // For position and size properties, always use bracket notation
  if (property.startsWith('left-') || property.startsWith('top-') || 
      property.startsWith('right-') || property.startsWith('bottom-') ||
      property.startsWith('w-') || property.startsWith('h-') ||
      property.startsWith('max-w-') || property.startsWith('max-h-') ||
      property.startsWith('min-w-') || property.startsWith('min-h-')) {
    return `${prefix}${property}-[${numValue}px]`;
  }
  
  // For other properties, return as-is
  return `${prefix}${property}`;
}

/**
 * Validate if a Tailwind class string is valid
 */
export function validateTailwindClass(className: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!className || className.trim() === '') {
    return { valid: true, errors: [] };
  }
  
  // Split by spaces and validate each class
  const classes = className.trim().split(/\s+/);
  
  for (const cls of classes) {
    if (!cls) continue;
    
    // Check for valid class pattern
    // Valid: word, word-word, word-123, word-[value], word:word-123
    if (!/^[a-zA-Z0-9-_:[\]/]+$/.test(cls)) {
      errors.push(`Invalid characters in class: "${cls}"`);
    }
    
    // Check for matching brackets
    const openBrackets = (cls.match(/\[/g) || []).length;
    const closeBrackets = (cls.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push(`Mismatched brackets in class: "${cls}"`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format Tailwind classes by removing duplicates and sorting
 */
export function formatTailwindClasses(classes: string): string {
  if (!classes || classes.trim() === '') return '';
  
  const classArray = classes.trim().split(/\s+/).filter(Boolean);
  // Remove duplicates while preserving order
  const seen = new Set<string>();
  const unique: string[] = [];
  
  for (const cls of classArray) {
    if (!seen.has(cls)) {
      seen.add(cls);
      unique.push(cls);
    }
  }
  
  return unique.join(' ');
}

/**
 * Merge multiple class strings
 */
export function mergeClasses(...classStrings: (string | undefined | null)[]): string {
  return classStrings
    .filter(Boolean)
    .map(str => String(str).trim())
    .join(' ');
}

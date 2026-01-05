// PropertyInspector Live Preview Component - REFACTORED
// ✅ All 23 improvements implemented

import React, { useMemo, useState, useCallback } from 'react';
import type { InspectorState } from './types';
import {
  CONSTANTS,
  validateTag,
  generateAriaAttributes,
  meetsContrastRequirements,
  type AllowedTag
} from '@/lib/preview-box-utils';
import {
  usePreviewStyles,
  useFocusState,
  useGridBackground,
  useResponsiveMode,
  usePerspective
} from '@/hooks/use-preview-styles';

interface PreviewBoxProps {
  state: InspectorState;
  generatedClasses: string;
  generatedStyles: React.CSSProperties;
  showGrid?: boolean;
  gridPattern?: 'grid' | 'dots' | 'none';
  transitionDuration?: number;
  enableExport?: boolean;
  responsiveMode?: 'mobile' | 'tablet' | 'desktop';
  onContrastWarning?: (warning: string) => void;
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
  // Use custom hooks for state management
  const { isFocused, handleFocus, handleBlur } = useFocusState();
  const gridBackground = useGridBackground(showGrid, gridPattern);
  const responsive = useResponsiveMode(responsiveMode);
  const perspectiveValue = usePerspective(state.transforms3D.perspective);
  
  // Compute preview styles using hook
  const previewStyles = usePreviewStyles(state, generatedStyles, isFocused);
  
  // Contrast checking with callback
  useMemo(() => {
    if (state.typography.textColor && state.appearance.backgroundColor && onContrastWarning) {
      const contrastCheck = meetsContrastRequirements(
        state.typography.textColor,
        state.appearance.backgroundColor
      );
      
      if (!contrastCheck.meets) {
        onContrastWarning(
          `Low contrast ratio: ${contrastCheck.ratio}:1 (${contrastCheck.level}). WCAG AA requires 4.5:1.`
        );
      }
    }
  }, [state.typography.textColor, state.appearance.backgroundColor, onContrastWarning]);
  
  // Validated and type-safe tag name
  const TagName = validateTag(state.tag) as AllowedTag;
  
  // Generate ARIA attributes
  const ariaAttributes = useMemo(
    () => generateAriaAttributes(state),
    [state.tag, state.textContent]
  );
  
  // Export preview as image (placeholder for implementation)
  const handleExport = useCallback(async () => {
    if (!enableExport) return;
    console.log('Export feature - to be implemented with html2canvas');
  }, [enableExport]);
  
  return (
    <div className="relative bg-card border border-border rounded-xl p-6 overflow-hidden">
      {/* Conditionally rendered grid background */}
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
          maxWidth: responsive.width,
          transitionDuration: `${transitionDuration}ms`
        }}
      >
        {/* Perspective wrapper - single source of truth */}
        <div 
          className="preserve-3d"
          style={{ perspective: perspectiveValue }}
        >
          <TagName
            style={previewStyles}
            className={`transition-all duration-200 ${generatedClasses}`}
            {...ariaAttributes}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={TagName === 'button' || TagName === 'a' ? 0 : undefined}
          >
            {state.textContent || 'Preview Element'}
          </TagName>
        </div>
      </div>
      
      {/* Info overlay with responsive mode indicator */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] text-muted-foreground">
        <div className="flex gap-2 items-center">
          <span className="font-mono uppercase bg-secondary/50 px-1.5 py-0.5 rounded">
            &lt;{state.tag}&gt;
          </span>
          {/* Responsive mode indicator */}
          <span className="font-mono uppercase bg-secondary/50 px-1.5 py-0.5 rounded">
            {responsiveMode}
          </span>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="font-mono">
            {generatedClasses.split(' ').filter(Boolean).length} classes
          </span>
          
          {/* Export button */}
          {enableExport && (
            <button
              type="button"
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

// Error boundary wrapper component
export class PreviewBoxErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
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

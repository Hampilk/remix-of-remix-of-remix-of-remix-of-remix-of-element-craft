// PropertyInspector Live Preview Component

import React, { useMemo } from 'react';
import type { InspectorState } from './types';

interface PreviewBoxProps {
  state: InspectorState;
  generatedClasses: string;
  generatedStyles: React.CSSProperties;
}

export const PreviewBox: React.FC<PreviewBoxProps> = ({ 
  state, 
  generatedClasses, 
  generatedStyles 
}) => {
  // Compute preview-specific styles
  const previewStyles = useMemo<React.CSSProperties>(() => {
    const styles: React.CSSProperties = { ...generatedStyles };
    
    // Apply transforms
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
    
    if (transforms.length > 0) styles.transform = transforms.join(' ');
    if (state.transforms3D.perspective > 0) styles.perspective = `${state.transforms3D.perspective * 100}px`;
    
    // Apply effects as filters
    const filters: string[] = [];
    if (state.effects.blur > 0) filters.push(`blur(${state.effects.blur}px)`);
    if (state.effects.brightness !== 100) filters.push(`brightness(${state.effects.brightness / 100})`);
    if (state.effects.saturation !== 100) filters.push(`saturate(${state.effects.saturation / 100})`);
    if (state.effects.contrast !== 100) filters.push(`contrast(${state.effects.contrast / 100})`);
    if (state.effects.hueRotate !== 0) filters.push(`hue-rotate(${state.effects.hueRotate}deg)`);
    if (state.effects.grayscale > 0) filters.push(`grayscale(${state.effects.grayscale / 100})`);
    if (state.effects.invert > 0) filters.push(`invert(${state.effects.invert / 100})`);
    if (state.effects.sepia > 0) filters.push(`sepia(${state.effects.sepia / 100})`);
    if (filters.length > 0) styles.filter = filters.join(' ');
    
    // Backdrop filter
    if (state.effects.backdropBlur > 0) styles.backdropFilter = `blur(${state.effects.backdropBlur}px)`;
    
    // Opacity
    if (state.effects.opacity !== 100) styles.opacity = state.effects.opacity / 100;
    
    // Border radius
    if (state.border.radius.all > 0) {
      styles.borderRadius = `${state.border.radius.all}px`;
    } else {
      const { tl, tr, br, bl } = state.border.radius;
      if (tl || tr || br || bl) {
        styles.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
      }
    }
    
    // Border
    if (state.border.color && state.border.width !== '0') {
      styles.border = `${state.border.width}px ${state.border.style} ${state.border.color}`;
    }
    
    // Padding
    const { l, t, r, b } = state.padding;
    if (l || t || r || b) {
      styles.padding = `${t || 0}px ${r || 0}px ${b || 0}px ${l || 0}px`;
    }
    
    // Margin
    if (state.margin.x !== '0' || state.margin.y !== '0') {
      styles.margin = `${state.margin.y || 0}px ${state.margin.x || 0}px`;
    }
    
    // Size
    if (state.size.width) styles.width = state.size.width;
    if (state.size.height) styles.height = state.size.height;
    
    // Typography
    if (state.typography.fontSize) styles.fontSize = state.typography.fontSize;
    if (state.typography.fontWeight !== 'normal') styles.fontWeight = state.typography.fontWeight as any;
    if (state.typography.textAlign !== 'left') styles.textAlign = state.typography.textAlign;
    if (state.typography.textColor) styles.color = state.typography.textColor;
    
    // Background
    if (state.appearance.backgroundColor) styles.backgroundColor = state.appearance.backgroundColor;
    if (state.appearance.blendMode !== 'normal') styles.mixBlendMode = state.appearance.blendMode as any;
    
    return styles;
  }, [state, generatedStyles]);
  
  // Determine which element to render
  const TagName = state.tag as keyof JSX.IntrinsicElements;
  
  return (
    <div className="relative bg-card border border-border rounded-xl p-6 overflow-hidden">
      {/* Grid background pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Preview container */}
      <div className="relative flex items-center justify-center min-h-32">
        <div 
          className="preserve-3d"
          style={{ perspective: state.transforms3D.perspective > 0 ? `${state.transforms3D.perspective * 100}px` : undefined }}
        >
          <TagName
            style={previewStyles}
            className={`transition-all duration-200 ${generatedClasses}`}
          >
            {state.textContent || 'Preview Element'}
          </TagName>
        </div>
      </div>
      
      {/* Info overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] text-muted-foreground">
        <span className="font-mono uppercase bg-secondary/50 px-1.5 py-0.5 rounded">
          &lt;{state.tag}&gt;
        </span>
        <span className="font-mono">
          {generatedClasses.split(' ').filter(Boolean).length} classes
        </span>
      </div>
    </div>
  );
};

export default PreviewBox;

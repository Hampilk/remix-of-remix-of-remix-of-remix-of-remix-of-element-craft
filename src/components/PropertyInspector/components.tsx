// PropertyInspector Helper Components

import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ChevronDown } from 'lucide-react';

// Color picker button with popover
interface ColorButtonProps {
  color: string | null;
  onChange: (color: string | null) => void;
  label: string;
  'aria-label'?: string;
}

export const ColorButton: React.FC<ColorButtonProps> = ({ color, onChange, label, 'aria-label': ariaLabel }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button type="button" className={`h-7 flex items-center gap-2 px-2 py-1 text-xs rounded-md border border-border bg-card hover:bg-secondary transition-colors ${!color ? 'opacity-60' : ''}`} aria-label={ariaLabel}>
        <div 
          className="w-4 h-4 rounded-full border border-border shadow-inner" 
          style={{ backgroundColor: color || 'hsl(var(--muted))' }}
        />
        <span className="text-xs truncate max-w-16">{color || `No ${label}`}</span>
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-3" align="start">
      <HexColorPicker color={color || '#ffffff'} onChange={onChange} />
      <div className="flex gap-2 mt-2">
        <Input 
          value={color || ''} 
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-7 text-xs font-mono flex-1"
        />
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs px-2"
          onClick={() => onChange(null)}
        >
          Clear
        </Button>
      </div>
    </PopoverContent>
  </Popover>
);

// Labeled input with left-aligned label
interface LabeledInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const LabeledInput: React.FC<LabeledInputProps> = ({ 
  id,
  label, 
  value, 
  onChange, 
  placeholder,
  className = ''
}) => (
  <div className={`relative ${className}`}>
    <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-[10px] font-medium text-muted-foreground pointer-events-none ${!value ? 'opacity-50' : ''}`}>
      {label}
    </span>
    <Input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-8 text-xs pl-8 font-mono" 
    />
  </div>
);

// Icon input with left icon
interface IconInputProps {
  id?: string;
  icon: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  type?: string;
}

export const IconInput: React.FC<IconInputProps> = ({ 
  id,
  icon, 
  placeholder, 
  value, 
  onChange,
  className = '',
  type = 'text'
}) => (
  <div className={`relative ${className}`}>
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none opacity-50">
      {icon}
    </div>
    <Input 
      type="text" 
      placeholder={placeholder} 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-xs pl-8 font-mono" 
    />
  </div>
);

// Slider control with label and value display
interface SliderControlProps {
  icon?: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  valueLabel?: string;
  showGradient?: boolean;
  gradientColors?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  icon,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  valueLabel,
  showGradient = false,
  gradientColors
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
        {valueLabel ?? `${value}${unit}`}
      </span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-1.5 rounded-full appearance-none cursor-pointer slider-thumb ${
        showGradient && gradientColors 
          ? '' 
          : 'bg-secondary'
      }`}
      style={showGradient && gradientColors ? { 
        background: gradientColors 
      } : undefined}
    />
  </div>
);

// Section header with icon and title
interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, badge }) => (
  <div className="flex items-center gap-1.5">
    {icon}
    <span>{title}</span>
    {badge}
  </div>
);

// Breakpoint selector buttons
interface BreakpointSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export const BreakpointSelector: React.FC<BreakpointSelectorProps> = ({
  value,
  onChange,
  options
}) => (
  <div className="flex border border-border rounded-md overflow-hidden h-6">
    {options.map((opt, i) => (
      <button 
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`px-2 text-[9px] font-medium transition-all ${
          value === opt.value 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-card text-muted-foreground hover:bg-secondary'
        } ${i > 0 ? 'border-l border-border' : ''}`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// Tab mode selector
interface TabSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const TabSelector: React.FC<TabSelectorProps> = ({ value, onChange, options }) => (
  <div className="flex border border-border rounded-md overflow-hidden bg-background">
    {options.map((tab, i) => (
      <button 
        key={tab}
        onClick={() => onChange(tab)}
        className={`px-3 py-1 text-[9px] font-bold transition-all ${
          value === tab 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:bg-secondary'
        } ${i > 0 ? 'border-l border-border' : ''}`}
      >
        {tab}
      </button>
    ))}
  </div>
);

// Select with label dropdown
interface StyledSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export const StyledSelect: React.FC<StyledSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = ''
}) => (
  <div className={`relative ${className}`}>
    <select 
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-8 px-3 pr-8 text-xs rounded-md border border-border bg-card appearance-none cursor-pointer hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
  </div>
);

// Grid layout for spacing inputs
interface SpacingGridProps {
  values: { l: string; t: string; r: string; b: string };
  onChange: (key: 'l' | 't' | 'r' | 'b', value: string) => void;
}

export const SpacingGrid: React.FC<SpacingGridProps> = ({ values, onChange }) => (
  <div className="grid grid-cols-2 gap-2">
    <LabeledInput label="L" value={values.l} onChange={(v) => onChange('l', v)} />
    <LabeledInput label="T" value={values.t} onChange={(v) => onChange('t', v)} />
    <LabeledInput label="R" value={values.r} onChange={(v) => onChange('r', v)} />
    <LabeledInput label="B" value={values.b} onChange={(v) => onChange('b', v)} />
  </div>
);

// Position grid with type selector
interface PositionGridProps {
  type: string;
  values: { l: string; t: string; r: string; b: string };
  zIndex: string;
  onTypeChange: (type: string) => void;
  onValueChange: (key: 'l' | 't' | 'r' | 'b' | 'zIndex', value: string) => void;
  typeOptions: { value: string; label: string }[];
}

export const PositionGrid: React.FC<PositionGridProps> = ({ 
  type, 
  values, 
  zIndex, 
  onTypeChange, 
  onValueChange,
  typeOptions 
}) => (
  <div className="space-y-2">
    <StyledSelect 
      value={type} 
      onChange={onTypeChange}
      options={typeOptions}
    />
    <div className="grid grid-cols-2 gap-2">
      <LabeledInput label="L" value={values.l} onChange={(v) => onValueChange('l', v)} />
      <LabeledInput label="T" value={values.t} onChange={(v) => onValueChange('t', v)} />
      <LabeledInput label="R" value={values.r} onChange={(v) => onValueChange('r', v)} />
      <LabeledInput label="B" value={values.b} onChange={(v) => onValueChange('b', v)} />
    </div>
    <LabeledInput label="Z" value={zIndex} onChange={(v) => onValueChange('zIndex', v)} />
  </div>
);

// CRITICAL FIX: The infinite loop was caused by:
// 1. useGeneratedClasses returning a new string reference every render
// 2. state object getting new reference from getEffectiveState
// 3. useEffect syncing to context on every generatedClasses change
//
// SOLUTION: Use deep memoization in useGeneratedClasses with granular dependencies

// Place this comment at the top of your hooks.ts file and update the useGeneratedClasses hook:

export const useGeneratedClasses = (state: InspectorState, breakpoint: Breakpoint = 'base') => {
  const prefix = breakpoint === 'base' ? '' : `${breakpoint}:`;

  return useMemo(() => {
    const classes: string[] = [];

    // Padding
    const paddingL = normalizeNumericValue(state.padding.l);
    const paddingT = normalizeNumericValue(state.padding.t);
    const paddingR = normalizeNumericValue(state.padding.r);
    const paddingB = normalizeNumericValue(state.padding.b);

    if (paddingL && paddingL !== '0') classes.push(`${prefix}pl-[${paddingL}px]`);
    if (paddingT && paddingT !== '0') classes.push(`${prefix}pt-[${paddingT}px]`);
    if (paddingR && paddingR !== '0') classes.push(`${prefix}pr-[${paddingR}px]`);
    if (paddingB && paddingB !== '0') classes.push(`${prefix}pb-[${paddingB}px]`);

    // Margin
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
  }, [
    // CRITICAL FIX: Granular dependencies instead of whole state object
    prefix,
    state.padding.l, state.padding.t, state.padding.r, state.padding.b,
    state.margin.x, state.margin.y,
    state.position.type, state.position.zIndex,
    state.position.l, state.position.t, state.position.r, state.position.b,
    state.size.width, state.size.height,
    state.size.maxWidth, state.size.maxHeight,
    state.size.minWidth, state.size.minHeight,
    state.typography.fontFamily, state.typography.fontWeight,
    state.typography.fontSize, state.typography.letterSpacing,
    state.typography.lineHeight, state.typography.textAlign,
    state.transforms.rotate, state.transforms.scale,
    state.transforms.translateX, state.transforms.translateY,
    state.transforms.skewX, state.transforms.skewY,
    state.effects.opacity, state.effects.blur, state.effects.backdropBlur,
    state.effects.hueRotate, state.effects.saturation, state.effects.brightness,
    state.effects.contrast, state.effects.grayscale, state.effects.invert,
    state.effects.sepia, state.effects.shadow,
    state.border.radius.all, state.border.width, state.border.style,
    JSON.stringify(state.tailwindClasses) // Arrays need stringification
  ]);
};

// ALSO UPDATE PropertyInspector index.tsx with this:
// Keep the useEffect commented out as we did, and add this alternative:

// In PropertyInspector component, replace the problematic useEffect with:
useEffect(() => {
  // Only sync when actual state values change, not object references
  setInspectorState(state);
}, [
  // Granular dependencies - only re-sync when actual values change
  state.tag, state.elementId, state.textContent,
  JSON.stringify(state.padding), JSON.stringify(state.margin),
  JSON.stringify(state.position), JSON.stringify(state.size),
  JSON.stringify(state.typography), JSON.stringify(state.transforms),
  JSON.stringify(state.effects), JSON.stringify(state.border),
  setInspectorState
]);

useEffect(() => {
  setGeneratedClasses(generatedClasses);
}, [generatedClasses, setGeneratedClasses]);
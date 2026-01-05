/**
 * Deep equality comparison for objects and arrays.
 * More performant than JSON.stringify for complex nested structures.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  // Identical references or primitives
  if (a === b) return true;

  // Handle null/undefined
  if (a == null || b == null) return a === b;

  // Different types
  if (typeof a !== typeof b) return false;

  // Primitives (already checked by ===)
  if (typeof a !== 'object') return false;

  // Arrays
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Objects
  if (Array.isArray(b)) return false;

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(bObj, key)) return false;
    if (!deepEqual(aObj[key], bObj[key])) return false;
  }

  return true;
}

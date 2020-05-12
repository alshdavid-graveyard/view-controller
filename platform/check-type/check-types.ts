export function isObject (value: any) {
  return value && typeof value === 'object';
}

export function isArray (value: any) {
  return Array.isArray(value)
}
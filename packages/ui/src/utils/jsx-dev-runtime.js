// Astryx 0.1.6 ships JSX development calls. Normalize them in the shared
// package so consumers need no React production-runtime aliases.
import * as runtime from 'react/jsx-runtime'

export const Fragment = runtime.Fragment
export function jsxDEV(type, props, key, staticChildren) {
  return staticChildren ? runtime.jsxs(type, props, key) : runtime.jsx(type, props, key)
}

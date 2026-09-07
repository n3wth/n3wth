// @astryxdesign/core 0.1.5 ships dist compiled against react/jsx-dev-runtime,
// but React 19's production build exports `jsxDEV = undefined`, which crashes
// rendering. vite.config.ts aliases the dev runtime here for production
// builds only, mapping jsxDEV onto the production jsx/jsxs runtime.
import * as runtime from 'react/jsx-runtime'

export const Fragment = runtime.Fragment

export function jsxDEV(type, config, maybeKey, isStaticChildren) {
  return isStaticChildren
    ? runtime.jsxs(type, config, maybeKey)
    : runtime.jsx(type, config, maybeKey)
}

// @astryxdesign/core 0.1.5 ships CJS dist compiled against react/jsx-dev-runtime,
// but React 19's production build exports `jsxDEV = undefined`, which crashes
// prerendering. next.config.ts aliases the dev runtime here for production
// builds, mapping jsxDEV onto the production jsx/jsxs runtime.
const runtime = require('react/jsx-runtime')

exports.Fragment = runtime.Fragment
exports.jsxDEV = function jsxDEV(type, config, maybeKey, isStaticChildren) {
  return isStaticChildren
    ? runtime.jsxs(type, config, maybeKey)
    : runtime.jsx(type, config, maybeKey)
}

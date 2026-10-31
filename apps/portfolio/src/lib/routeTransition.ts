import {
  easeOutCubic,
  layerPath,
  lerpLayer,
  routeLayers,
  routeShapes,
  storyKindFromPath,
  type RouteLayer,
  type StoryKind,
} from './routeShapes'

/** Live path morph before the browser commits a cross-document view transition. */
export const ROUTE_MORPH_MS = 360

function linkFrom(event: Event) {
  const target = event.target
  if (!(target instanceof Element)) return null
  const link = target.closest('a')
  return link instanceof HTMLAnchorElement ? link : null
}

function pathnameOf(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname || '/'
}

function motionAllowed() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'startViewTransition' in document
}

function prefetch(href: string) {
  if (document.head.querySelector(`link[rel="prefetch"][href="${CSS.escape(href)}"]`)) return
  const hint = document.createElement('link')
  hint.rel = 'prefetch'
  hint.href = href
  document.head.appendChild(hint)
}

function animateShape(svg: SVGSVGElement, from: StoryKind, to: StoryKind) {
  const start = routeShapes[from]
  const end = routeShapes[to]
  const paths = new Map<RouteLayer, SVGPathElement>()
  for (const layer of routeLayers) {
    const path = svg.querySelector<SVGPathElement>(`[data-route-layer="${layer}"]`)
    if (path) paths.set(layer, path)
  }
  return new Promise<void>(resolve => {
    const started = performance.now()
    const frame = (now: number) => {
      const amount = easeOutCubic(Math.min(1, (now - started) / ROUTE_MORPH_MS))
      for (const layer of routeLayers) {
        paths.get(layer)?.setAttribute('d', layerPath(lerpLayer(start[layer], end[layer], amount)))
      }
      if (amount < 1) requestAnimationFrame(frame)
      else resolve()
    }
    requestAnimationFrame(frame)
  })
}

function plainClick(event: MouseEvent, link: HTMLAnchorElement) {
  if (event.defaultPrevented || event.button !== 0) return false
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false
  if (link.target && link.target !== '_self') return false
  if (link.hasAttribute('download')) return false
  return true
}

function disableDocumentTransition() {
  const style = document.createElement('style')
  style.textContent = '@view-transition { navigation: none; }'
  document.head.appendChild(style)
}

let flight = 0

async function morphThenVisit(svg: SVGSVGElement, from: StoryKind, to: StoryKind, href: string) {
  const id = ++flight
  window.scrollTo(0, 0)
  prefetch(href)
  // Snapshots cannot interpolate path data, so the morph paints before the load.
  document.documentElement.dataset.routeLeave = ''
  await animateShape(svg, from, to)
  if (id !== flight) return
  disableDocumentTransition()
  location.assign(href)
}

export function mountRouteTransitions() {
  document.documentElement.dataset.routeTransitions = 'on'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) disableDocumentTransition()

  document.addEventListener('pointerenter', event => {
    if (!motionAllowed()) return
    const link = linkFrom(event)
    if (!link) return
    const destination = storyKindFromPath(pathnameOf(new URL(link.href, location.href).pathname))
    const current = storyKindFromPath(pathnameOf(location.pathname))
    if (!destination || !current || destination === current) return
    prefetch(link.href)
  }, true)

  document.addEventListener('click', event => {
    if (!motionAllowed()) return
    const link = linkFrom(event)
    if (!link || !plainClick(event, link)) return
    const url = new URL(link.href, location.href)
    const from = storyKindFromPath(pathnameOf(location.pathname))
    const to = storyKindFromPath(pathnameOf(url.pathname))
    if (!from || !to || from === to || url.origin !== location.origin) return
    const svg = document.querySelector<SVGSVGElement>('[data-route-morph]')
    if (!svg) return
    event.preventDefault()
    void morphThenVisit(svg, from, to, url.href)
  })
}

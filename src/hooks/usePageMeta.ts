import { useEffect } from 'react'

/** Per-route document title + meta description for the SPA routes.
    `noindex` adds a robots meta for soft-404s (the Vercel catch-all
    serves every unknown path as 200, so NotFound marks itself). */
export function usePageMeta(
  title: string,
  description?: string,
  opts?: { noindex?: boolean }
) {
  const noindex = opts?.noindex ?? false
  useEffect(() => {
    document.title = title
    if (description) {
      const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (meta) meta.content = description
    }
    if (!noindex) return
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const created = !robots
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = 'noindex'
    return () => {
      if (created) robots.remove()
    }
  }, [title, description, noindex])
}

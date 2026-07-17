import { useEffect } from 'react'

/** Per-route document title + meta description for the SPA routes. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title
    if (description) {
      const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (meta) meta.content = description
    }
  }, [title, description])
}

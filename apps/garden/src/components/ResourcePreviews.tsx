import type { ResourcePreview } from '@/lib/resource-previews'

export function ResourcePreviews({ resources }: { resources: readonly ResourcePreview[] }) {
  if (resources.length === 0) return null

  return (
    <section className="resource-previews" aria-label="Further reading">
      <h2>Further reading</h2>
      <ul role="list">
        {resources.map((resource) => (
          <li key={resource.url} className="resource-preview-row">
            <p className="resource-preview-publisher">{resource.publisher}</p>
            <div className="resource-preview-copy">
              <h3><a href={resource.url}>{resource.title}</a></h3>
              <p>{resource.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

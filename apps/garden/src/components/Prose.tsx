export function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose n3wth-site-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function pageMetadata(options: {
  title: string
  description: string
  url: string
  socialTitle?: string
  socialDescription?: string
}): {
  title: string
  description: string
  alternates: { canonical: string }
  openGraph: { title: string; description: string; url: string; type: 'website' }
  twitter: { card: 'summary_large_image'; title: string; description: string }
}
export function pageJsonLd(options: {
  url: string
  title: string
  description: string
  siteUrl: string
  type?: string
  image?: string
}): Record<string, unknown>

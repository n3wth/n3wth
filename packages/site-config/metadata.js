/** Build matching canonical, Open Graph and Twitter metadata without a framework dependency. */
export function pageMetadata({ title, description, url, socialTitle = title, socialDescription = description }) {
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: socialTitle, description: socialDescription, url, type: 'website' },
    twitter: { card: 'summary_large_image', title: socialTitle, description: socialDescription },
  }
}

export function pageJsonLd({ url, title, description, siteUrl, type = 'WebPage', image }) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { '@id': `${siteUrl.replace(/\/$/, '')}/#website` },
    ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: image } } : {}),
  }
}

# Getting Started

Build pages from the shared site layer. Use Astryx controls through UI’s primitives entry point when the page needs interaction.

## Work in the repository

These instructions describe the current workspace, not a newly published npm release. Use Node 24 and npm 11.19.1 from the repository root.

```bash
npm ci
npm run site:new -- my-idea "My idea"
npm install
npm run build --workspace @n3wth/ui
npm run dev --workspace @n3wth/my-idea
```

The generator creates an app with the shared provider, navigation, page header, sections and footer. It does not create a deployment or domain. Replace the starter copy before publishing.

## Import the page system

```tsx
import {
  N3wthProvider, SiteNavigation, SiteContainer,
  PageHeader, SiteSection, SiteHeading, SiteText, SiteFooter,
} from '@n3wth/ui/site'
import '@n3wth/ui/site.css'

export function App() {
  return <N3wthProvider mode="dark">
    <SiteNavigation brand={<a href="/">My idea</a>}
      links={<a href="#details">Details</a>} />
    <SiteContainer as="main" className="n3wth-site-main">
      <PageHeader title="My idea" description="What this helps you do." />
      <SiteSection id="details">
        <SiteHeading>Details</SiteHeading>
        <SiteText>Add your content here.</SiteText>
      </SiteSection>
    </SiteContainer>
    <SiteFooter />
  </N3wthProvider>
}
```

Pass your framework’s Link component into navigation and action slots. The site owns URLs and routing; UI owns the layout. In Next.js, put the provider and interactive components behind a client boundary.

## Add a control

Use the native Astryx API through the package facade:

```tsx
import { Button } from '@n3wth/ui/primitives'

<Button onClick={() => console.log('Selected')}>Continue</Button>
```

Native primitive props and compatibility props are separate APIs. Do not assume a prop accepted by the root UI Button is accepted by the primitive Button.

## Validate the consumer

```bash
npm run check --workspace @n3wth/my-idea
npm run check:design
```

Check desktop and mobile layouts, keyboard focus and font loading. Shared package changes need checks in the consuming sites too. See [component boundaries](/docs/components) and [theming](/docs/theming).

import { CodeBlock } from '@n3wth/ui'
import { SiteHeading } from '@n3wth/ui/site'
import { siteUrls } from '@n3wth/site-config'
import type { Metadata } from 'next'
import { InstallCommand } from '../../_components/install-command'
import { PostLayout } from '../_components/post-layout'
import { ButtonExample } from './button-example'

const title = 'Install and check a Kit button'
const description = 'Install the Kit button, render it, and check its pointer and keyboard behavior.'
const url = `${siteUrls.kit}/blog/install-and-check-a-kit-button`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title: `${title} — n3wth/kit`,
    description,
    url,
    type: 'article',
    publishedTime: '2026-09-16T00:00:00Z',
    authors: ['Oliver Newth'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} — n3wth/kit`,
    description,
  },
  keywords: [
    'Kit button',
    'shadcn registry button',
    'install React button',
    'keyboard button check',
  ],
}

const installCommand = `npx shadcn add ${siteUrls.kit}/r/button.json`

export default function Post() {
  return (
    <PostLayout
      title={title}
      date="September 16, 2026"
      readingTime="5 min read"
      description={description}
      path="/blog/install-and-check-a-kit-button"
      publishedIso="2026-09-16"
    >
      <p>
        This tutorial adds one Kit button to an existing React project. You will
        render the real component, press it, and check the same behavior with a
        keyboard.
      </p>

      <SiteHeading variant="section" level={2} className="mt-12">
        Before you start
      </SiteHeading>

      <p>
        Use Node 24 and a React 18 or 19 project. The setup needs Tailwind CSS 4
        and a shadcn{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          components.json
        </code>{' '}
        file. The file tells the CLI where to write UI components and the shared{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          cn
        </code>{' '}
        helper.
      </p>

      <p>
        The published registry item contains the Button source and declares the{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          cn
        </code>{' '}
        registry dependency. The CLI copies the Button source, so your app does
        not load a Kit component runtime. The Button styles do use the published{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          @n3wth/ui
        </code>{' '}
        compatibility stylesheet.
      </p>

      <SiteHeading variant="section" level={2} className="mt-12">
        Load the Kit theme
      </SiteHeading>

      <p>
        A default Tailwind and shadcn setup does not include the tokens used by
        this Button. The current source reads Kit variables such as{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          --color-bg
        </code>{' '}
        and{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          --color-white
        </code>
        . It also uses the shared{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          focus-ring
        </code>{' '}
        utility.
      </p>

      <p>
        Install the existing shared UI package, which owns these styles:
      </p>

      <div className="min-w-0">
        <CodeBlock
          size="sm"
          language="bash"
          showCopyButton
          code="npm install @n3wth/ui"
        />
      </div>

      <p>
        Then load the documented compatibility stylesheet and Tailwind token
        bridge from your global CSS file. The compatibility entry includes the
        complete site foundation:
      </p>

      <div className="min-w-0">
        <CodeBlock
          size="sm"
          language="css"
          showCopyButton
          code={`@import 'tailwindcss';
@import '@n3wth/ui/styles';
@import '@n3wth/ui/tailwind-theme.css';`}
        />
      </div>

      <p>
        This provides the Button tokens, its legacy{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          glow-white
        </code>{' '}
        utility, and its visible{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          focus-ring
        </code>{' '}
        behavior without copied local CSS.
      </p>

      <SiteHeading variant="section" level={2} className="mt-12">
        Install the button
      </SiteHeading>

      <p>Run this command from the project root:</p>

      <div role="group" aria-label="Install Kit button" className="min-w-0">
        <InstallCommand
          command={installCommand}
          contentId="kit-blog-install-and-check-a-kit-button"
          destinationId="kit-registry-button"
        />
      </div>

      <p>
        Read the CLI summary before you accept an overwrite. In a standard
        shadcn setup, the component lands at{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          components/ui/button.tsx
        </code>
        . A custom UI alias can place it elsewhere.
      </p>

      <SiteHeading variant="section" level={2} className="mt-12">
        Render the result
      </SiteHeading>

      <p>
        Add this client component. Change the import only if your{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          components.json
        </code>{' '}
        uses another UI alias.
      </p>

      <div className="min-w-0">
        <CodeBlock
          size="sm"
          language="tsx"
          showCopyButton
          code={`'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ButtonExample() {
  const [pressCount, setPressCount] = useState(0)

  return (
    <div className="rounded-lg border border-rail bg-bg-soft p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          variant="primary"
          size="md"
          touchTarget
          onClick={() => setPressCount((count) => count + 1)}
        >
          Check button
        </Button>
        <p className="text-sm text-ink-dim" role="status" aria-live="polite">
          {pressCount === 0
            ? 'Not pressed yet.'
            : \`Pressed \${pressCount} \${pressCount === 1 ? 'time' : 'times'}.\`}
        </p>
      </div>
    </div>
  )
}`}
        />
      </div>

      <p>
        The visible result is a medium primary button with a minimum 44-pixel
        touch target. Pressing it updates nearby status text. This live example
        uses the same published Button API:
      </p>

      <ButtonExample />

      <SiteHeading variant="section" level={2} className="mt-12">
        Check pointer and keyboard input
      </SiteHeading>

      <ol className="list-outside list-decimal space-y-2 ps-6 text-ink">
        <li>Click or tap the button. The count must increase once.</li>
        <li>Press Tab until the button has a visible focus indicator.</li>
        <li>Press Enter. The count must increase once.</li>
        <li>Focus the button again and press Space. The count must increase once.</li>
        <li>Press Shift+Tab. Focus must move away from the button.</li>
      </ol>

      <p>
        These checks use native button behavior. Do not replace the button with a
        clickable{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          div
        </code>
        .
      </p>

      <SiteHeading variant="section" level={2} className="mt-12">
        Fix common failures
      </SiteHeading>

      <ul className="list-outside list-disc space-y-3 ps-6 text-ink">
        <li>
          <span className="font-medium text-ink">The CLI cannot find components.json:</span>{' '}
          initialize shadcn in the app, then run the install command again.
        </li>
        <li>
          <span className="font-medium text-ink">The import cannot resolve:</span>{' '}
          use the UI alias and output path shown by your CLI.
        </li>
        <li>
          <span className="font-medium text-ink">The cn helper cannot resolve:</span>{' '}
          check the utils alias in{' '}
          <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
            components.json
          </code>
          . The Button item declares this registry dependency.
        </li>
        <li>
          <span className="font-medium text-ink">The button works but looks wrong:</span>{' '}
          confirm that your global CSS imports both documented n3wth styles after
          Tailwind. Default shadcn variables do not replace the Kit names used by
          this source.
        </li>
        <li>
          <span className="font-medium text-ink">The CLI asks to overwrite a file:</span>{' '}
          stop and compare your local edits before you continue.
        </li>
      </ul>

      <p>
        If you need to choose between source-owned components and package-owned
        components, read the{' '}
        <a
          href={`${siteUrls.garden}/astryx-vs-shadcn-vs-angular-material`}
          className="text-ink underline underline-offset-4"
        >
          Garden comparison of Astryx, shadcn, and Angular Material
        </a>
        .
      </p>
    </PostLayout>
  )
}

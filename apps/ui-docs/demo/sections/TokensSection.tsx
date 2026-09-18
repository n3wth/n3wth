import { SiteText } from '@n3wth/ui/site'
import { DemoSection, DemoBlock } from './DemoSection'
import { CodeSnippet } from './CodeSnippet'

export const tokenGroups = [
  { title: 'Surfaces', tokens: [
    ['--color-background-body', 'Canvas'],
    ['--color-background-surface', 'Surface'],
    ['--color-background-muted', 'Muted surface'],
    ['--color-background-popover', 'Popover'],
  ] },
  { title: 'Text and borders', tokens: [
    ['--color-text-primary', 'Primary text'],
    ['--color-text-secondary', 'Secondary text'],
    ['--color-text-disabled', 'Disabled text'],
    ['--color-border', 'Border'],
    ['--color-border-emphasized', 'Emphasized border'],
  ] },
  { title: 'Status', tokens: [
    ['--color-success', 'Success'],
    ['--color-warning', 'Warning'],
    ['--color-error', 'Error'],
  ] },
] as const

export function TokensSection() {
  return (
    <DemoSection id="tokens" title="Design tokens" description="Choose colours by purpose. These swatches use the live shared theme and change with light and dark mode.">
      {tokenGroups.map(group => (
        <DemoBlock title={group.title} key={group.title}>
          <ul className="docs-swatches">
            {group.tokens.map(([token, label]) => (
              <li key={token}>
                <div className="docs-swatch" style={{ backgroundColor: `var(${token})` }} aria-hidden="true" />
                <SiteText variant="supporting">{label}</SiteText>
                <code>{token}</code>
              </li>
            ))}
          </ul>
        </DemoBlock>
      ))}
      <DemoBlock title="Use semantic tokens">
        <CodeSnippet language="css" code={`.example {
  background: var(--color-background-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}`} />
        <div className="mt-4"><SiteText variant="supporting" className="max-w-[65ch]">Existing aliases such as --color-bg and --glass-border remain available for compatibility. Use semantic names in new code.</SiteText></div>
      </DemoBlock>
    </DemoSection>
  )
}

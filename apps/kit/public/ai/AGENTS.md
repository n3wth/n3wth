# @n3wth/kit

AI-native component registry built on shadcn. Flat, minimal, iOS-inspired React components.

## Install

```bash
npx shadcn add https://kit.n3wth.com/r/[name].json
```

## Component API Reference

### button
```tsx
<Button variant="primary|secondary|ghost|glass" size="sm|md|lg" isLoading leftIcon={<Icon name="star" />} rightIcon={<Icon name="arrow-right" />} asChild touchTarget>
  Label
</Button>
```
- `size` accepts a responsive object: `{ base: 'sm', md: 'md', lg: 'lg' }`
- `asChild` renders children element with button styles (polymorphic)
- `touchTarget` ensures 44px minimum hit area (WCAG 2.5.5)

### badge
```tsx
<Badge variant="default|sage|coral|mint|gold|outline" size="sm|md">Text</Badge>
```

### input
```tsx
<Input variant="default|glass" inputSize="sm|md|lg" leftIcon={node} rightIcon={node} error={true|"Error message"} labelId="label-id" />
```
- Error as string renders an error message below the input with `role="alert"`

### icon
```tsx
<Icon name="arrow-right" size="xs|sm|md|lg|xl" />
<Icon name="check" size={24} /> // numeric px
```
Available names: arrow-right, arrow-left, arrow-up, arrow-down, chevron-right, chevron-left, chevron-down, chevron-up, check, x, copy, search, menu, sun, moon, external, github, terminal, code, sparkles, plus, minus, settings, user, heart, star, mail, calendar, clock, bell, home, folder, file, trash, edit, eye, eye-off, lock, unlock, link, external-link, download, upload, refresh, filter, sort, grid, list, more-horizontal, more-vertical, info, warning, success, error

### switch
```tsx
<Switch checked={value} onChange={setValue} size="sm|md|lg" label="Toggle" disabled />
```
Supports controlled and uncontrolled (defaultChecked) modes.

### avatar
```tsx
<Avatar src="/photo.jpg" alt="Name" fallback="ON" size="xs|sm|md|lg|xl" />
```

### separator
```tsx
<Separator orientation="horizontal|vertical" />
```

### progress
```tsx
<Progress value={75} max={100} size="sm|md|lg" variant="default|success|warning|error" label="Loading" showValue />
```

### label
```tsx
<Label htmlFor="input-id" required disabled>Field Name</Label>
```

### textarea
```tsx
<Textarea resize="none|vertical|both" error={boolean} placeholder="..." />
```

### skeleton
```tsx
<Skeleton variant="text|circular|rectangular" width={200} height={20} animate={boolean} />
<CardSkeleton lines={3} showHeader showTags />
```

### code-block
```tsx
<CodeBlock code={codeString} language="javascript|typescript|json|bash|css" showLineNumbers />
```

### card
```tsx
<Card variant="default|glass|interactive" padding="none|sm|md|lg">
  <CardHeader>
    <CardTitle as="h2">Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

### modal
```tsx
<Modal isOpen={open} onClose={() => setOpen(false)} size="sm|md|lg|full" closeOnBackdropClick closeOnEscape ariaLabel="Dialog">
  <ModalHeader>
    <ModalTitle>Title</ModalTitle>
    <ModalCloseButton onClick={() => setOpen(false)} />
  </ModalHeader>
  <ModalBody>Content</ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>
```
Portal-rendered. Focus trap and body scroll lock included.

### tabs
```tsx
<Tabs defaultValue="tab1" variant="underline|pill" onChange={setValue}>
  <TabsList glass>
    <TabsTab value="tab1">Tab 1</TabsTab>
    <TabsTab value="tab2">Tab 2</TabsTab>
  </TabsList>
  <TabsPanel value="tab1">Content 1</TabsPanel>
  <TabsPanel value="tab2">Content 2</TabsPanel>
</Tabs>
```
Animated indicator. Arrow key navigation between tabs.

### toast
```tsx
<ToastContainer position="top-right|top-left|top-center|bottom-right|bottom-left|bottom-center">
  <Toast variant="default|success|error|warning|info" title="Done" description="Details" duration={5000} onDismiss={fn} />
</ToastContainer>
```

### dropdown
```tsx
// Options API
<Dropdown
  options={[{ value: 'a', label: 'Option A' }]}
  value={selected}
  onChange={setSelected}
  placeholder="Select..."
  searchable
  size="sm|md|lg"
  variant="default|glass"
  portal
/>

// Multi-select
<Dropdown options={opts} values={selected} onMultiChange={setSelected} multi searchable />
```

### accordion
```tsx
<Accordion type="single|multiple" collapsible defaultValue={['item-1']}>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question</AccordionTrigger>
    <AccordionContent>Answer</AccordionContent>
  </AccordionItem>
</Accordion>
```

### nav
```tsx
<Nav
  logo={<span>Brand</span>}
  logoHref="/"
  items={[{ label: 'Docs', href: '/docs', isActive: true, external: false }]}
  theme="dark|light"
  onThemeToggle={toggle}
  showThemeToggle
  fixed
  hideOnScroll
/>
```
Includes responsive mobile drawer.

### hero
```tsx
<Hero
  badge="New"
  title="Build faster"
  description="Ship in hours, not weeks."
  ctas={[
    { label: 'Get Started', href: '/start', variant: 'primary' },
    { label: 'Learn More', href: '/docs', variant: 'secondary' },
  ]}
  align="center|left"
  size="default|large"
  gradient
/>
```

### section
```tsx
<Section size="sm|md|lg|full" spacing="none|sm|md|lg" container={boolean}>
  <SectionHeader title="Features" description="Optional description" align="left|center" />
  {children}
</Section>
```

### footer
```tsx
<Footer
  sites={[{ name: 'n3wth', href: 'https://n3wth.com' }]}
  currentSite="n3wth/kit"
  legalLinks={[{ label: 'Terms', href: '/terms' }]}
  copyright="2026 Oliver Newth"
  logo={<Logo />}
  description="Component registry"
  sections={[{ title: 'Links', links: [{ label: 'Docs', href: '/docs' }] }]}
  socialLinks={[{ label: 'GitHub', href: 'https://github.com/...', icon: <Icon name="github" /> }]}
/>
```

### tooltip
```tsx
<Tooltip content="Helpful text" position="top|right|bottom|left" showDelay={200} hideDelay={0} arrow>
  <Button>Hover me</Button>
</Tooltip>
```

### theme-toggle
```tsx
<ThemeToggle theme="dark|light" onToggle={fn} size="sm|md" />
```

### command-box
```tsx
<CommandBox command="npx shadcn add https://kit.n3wth.com/r/button.json" variant="default|primary" showCopyButton />
```

### mobile-drawer
```tsx
<MobileDrawer isOpen={open} onClose={close} position="left|right" width="280px" zIndex={50} ariaLabel="Menu">
  {children}
</MobileDrawer>
```

### error-boundary
```tsx
<ErrorBoundary fallback={<div>Error</div>} onError={(error, info) => log(error)}>
  {children}
</ErrorBoundary>

<ErrorFallback title="Page Error" message="Something broke." showReload showHomeLink homeUrl="/" />
```

## Design Tokens

Components reference these CSS custom properties. Define them in your project CSS:

| Token | Purpose |
|---|---|
| `--color-white` | Primary foreground (text, icons) |
| `--color-bg` | Page background |
| `--color-bg-secondary` | Elevated surface (modal, card) |
| `--color-accent` | Brand accent |
| `--color-grey-200` through `--color-grey-700` | Grey scale (200=lightest, 700=darkest) |
| `--glass-bg` | Translucent panel fill |
| `--glass-border` | Panel/component border |
| `--glass-highlight` | Hover/focus border |
| `--color-sage` | Green (success, toggle on) |
| `--color-coral` | Red (error, required, destructive) |
| `--color-mint` | Teal (info) |
| `--color-gold` | Yellow (warning) |

## Common Patterns

### Layout skeleton
```tsx
<Nav logo="Kit" items={navItems} theme={theme} onThemeToggle={toggle} fixed />
<main>
  <Hero title="Title" ctas={ctas} />
  <Section><SectionHeader title="Features" />{content}</Section>
</main>
<Footer currentSite="n3wth/kit" />
```

### Theme switching
```tsx
import { useTheme } from '@/hooks/use-theme'
const { theme, toggleTheme } = useTheme()
// Pass to Nav: theme={theme} onThemeToggle={toggleTheme}
```

### Responsive
- Button: `size={{ base: 'sm', md: 'md', lg: 'lg' }}`
- Section: `size="lg"` constrains max-width, `spacing="lg"` adds vertical padding
- Nav: automatically switches to mobile drawer below `md` breakpoint

### Class merging
Always use `cn()`:
```tsx
import { cn } from '@/lib/utils'
<div className={cn('base-class', condition && 'conditional-class', className)} />
```

## Hooks

Also available via the registry:
- `use-theme` - Theme toggle with localStorage + system preference
- `use-media-query` - SSR-safe media query matching
- `use-reduced-motion` - Detects prefers-reduced-motion
- `use-keyboard-shortcuts` - Declarative keyboard shortcut handler
- `use-toast` - Toast notification state management
- `use-count-up` - Animated number counter (gsap)
- `use-scroll-reveal` - Scroll-triggered entrance animations (gsap)
- `use-stagger-list` - Staggered list animations (gsap)
- `use-page-transition` - Page entrance/exit animations (gsap)
- `use-text-reveal` - Character-by-character text reveal (gsap)
- `use-button-pulse` - Hover/press scale animations (gsap)

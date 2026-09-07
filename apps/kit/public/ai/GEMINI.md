@n3wth/kit is an AI-native component registry built on shadcn. It provides flat, minimal, iOS-inspired React components installable via the shadcn CLI.

## Install

```bash
npx shadcn add https://kit.n3wth.com/r/[name].json
```

Replace `[name]` with any component name below. Multiple components can be installed at once by running the command for each.

## Design Principles

- Flat and minimal. No shadows or gradients unless explicitly specified.
- iOS-inspired: rounded corners, glassmorphism via backdrop-blur, subtle borders.
- Dark-first palette with light mode support via CSS custom properties.
- All components use `cn()` from `@/lib/utils` for class merging (clsx + tailwind-merge).
- Spacing, sizing, and color come from CSS custom properties, not hardcoded values.

## Component Catalog

### Primitives
- **button** - Multi-variant button (primary, secondary, ghost, glass). Responsive sizes, loading spinner, leftIcon/rightIcon slots, asChild for polymorphic rendering.
- **badge** - Inline badge with semantic color variants (default, sage, coral, mint, gold, outline). Sizes: sm, md.
- **input** - Text input with glass variant, left/right icon slots, error state (boolean or string message).
- **icon** - Icon wrapper around iconoir-react. Named icon map (50+ icons) with size presets (xs-xl) or numeric px.
- **switch** - Toggle switch. Controlled/uncontrolled, sizes sm/md/lg, aria role="switch".
- **avatar** - Circular avatar with image src, fallback initials, sizes xs-xl.
- **separator** - Horizontal or vertical divider line.
- **progress** - Progress bar with value/max, semantic variants (default, success, warning, error), optional value label.
- **label** - Form label with required indicator (*) and disabled state.
- **textarea** - Textarea with resize control (none, vertical, both) and error state.
- **skeleton** - Loading placeholder (text, circular, rectangular). Includes CardSkeleton preset.
- **code-block** - Lightweight syntax-highlighting code block. Languages: js, ts, json, bash, css. Optional line numbers.
- **tooltip** - Portal-based tooltip with auto-positioning, arrow, show/hide delays.

### Compound Components
- **card** - Card container (default, glass, interactive variants) with CardHeader, CardTitle, CardDescription, CardContent, CardFooter sub-components.
- **modal** - Accessible dialog with portal, focus trap, backdrop blur. Sub-components: ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalCloseButton.
- **tabs** - Accessible tabs with underline/pill variants, animated indicator. Sub-components: Tabs, TabsList, TabsTab, TabsPanel.
- **toast** - Toast notification with variant styling (default, success, error, warning, info), auto-dismiss. Use with ToastContainer for positioning.
- **dropdown** - Select dropdown with single/multi-select, search/filter, portal mode. Options-based or compound API (Dropdown.Trigger, Dropdown.Menu, Dropdown.Item).
- **accordion** - Accordion with single/multiple open modes. Sub-components: Accordion, AccordionItem, AccordionTrigger, AccordionContent.

### Blocks (Page-level)
- **nav** - Responsive navigation bar with logo, desktop links, mobile drawer, theme toggle, hide-on-scroll.
- **hero** - Hero section with optional badge, title (gradient text), description, CTA buttons. Align left/center, size default/large.
- **section** - Layout section wrapper with size (sm-full), spacing (none-lg), optional container.
- **footer** - Site footer with ecosystem links, section columns, social icons, copyright bar.

### Utilities
- **command-box** - Copyable terminal command display with clipboard support.
- **theme-toggle** - Dark/light theme toggle button with sun/moon icons.
- **mobile-drawer** - Slide-in drawer (left/right) with focus trap, backdrop, escape-to-close.
- **error-boundary** - React error boundary with default fallback UI and retry. Also exports ErrorFallback for full-page errors.

## Usage Patterns

### Page Layout
```tsx
<Nav logo="Kit" items={[{ label: 'Docs', href: '/docs' }]} />
<Hero title="Build faster" description="Components that work." ctas={[{ label: 'Get Started', href: '/docs' }]} />
<Section size="lg" spacing="lg">
  <SectionHeader title="Features" description="What makes it different." />
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card variant="interactive"><CardHeader><CardTitle>Fast</CardTitle></CardHeader></Card>
  </div>
</Section>
<Footer currentSite="n3wth/kit" />
```

### Form Layout
```tsx
<Card variant="glass" padding="lg">
  <Label htmlFor="email" required>Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" error={errors.email} />
  <Label htmlFor="message">Message</Label>
  <Textarea id="message" placeholder="Your message..." />
  <Button variant="primary" type="submit" isLoading={submitting}>Send</Button>
</Card>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} variant="interactive">
      <CardHeader>
        <Badge variant="sage">{item.category}</Badge>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
    </Card>
  ))}
</div>
```

## Color System (CSS Custom Properties)

These variables must be defined in your project CSS:

```
--color-white           White text/foreground
--color-bg              Page background
--color-bg-secondary    Elevated surface background
--color-accent          Brand accent color

--color-grey-200        Light grey text
--color-grey-300        Medium-light grey
--color-grey-400        Secondary text
--color-grey-500        Muted text
--color-grey-600        Placeholder text
--color-grey-700        Subtle borders/dividers

--glass-bg              Glass panel background (e.g. rgba(255,255,255,0.05))
--glass-border          Glass panel border
--glass-highlight       Glass hover/active border

--color-sage            Green semantic color
--color-coral           Red/error semantic color
--color-mint            Teal/info semantic color
--color-gold            Yellow/warning semantic color
```

## Rules

- Always use `cn()` for merging Tailwind classes. Never concatenate strings manually.
- Prefer CSS custom properties over hardcoded color values.
- Use the `variant` prop for visual variations, not custom className overrides.
- All interactive components support `className` for layout adjustments (margin, width, etc.).
- Use `asChild` on Button to render as a link: `<Button asChild><a href="/x">Link</a></Button>`.
- For responsive button sizes, pass an object: `size={{ base: 'sm', md: 'md', lg: 'lg' }}`.
- Toast needs a ToastContainer wrapper for positioning.
- Modal, Tooltip, and Dropdown (portal mode) render via React portals.

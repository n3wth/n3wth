import prompts from 'prompts'
import chalk from 'chalk'
import { execa } from 'execa'
import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { existsSync } from 'node:fs'

interface InitOptions {
  name?: string
  install?: boolean
}

const REGISTRY_URL = 'https://kit.n3wth.com'

const BASE_COMPONENTS = ['cn', 'button', 'card', 'input']

const CURSORRULES = `# n3wth Design System

## Component Usage
- Import UI components from @/components/ui
- Use the cn() utility for conditional class merging
- Follow the shadcn/ui pattern: copy-paste components, not npm packages
- Components are styled with Tailwind CSS

## Style Guidelines
- Use CSS variables for theming (defined in globals.css)
- Prefer semantic color tokens: --background, --foreground, --primary, etc.
- Mobile-first responsive design
- Flat design by default. No glows, shadows, or gradients unless specified.

## Project Structure
- /components/ui - Base UI primitives (button, card, input, etc.)
- /components - Composed application components
- /lib/utils.ts - cn() helper and shared utilities
- /app - Next.js app router pages and layouts
`

const AGENTS_MD = `# Project Context

This project uses the n3wth design system (@n3wth/kit).

## Tech Stack
- Framework: React with TypeScript
- Styling: Tailwind CSS v4 with CSS variables for theming
- Components: shadcn/ui pattern with n3wth registry overrides
- Registry: ${REGISTRY_URL}

## Component Patterns
- UI primitives live in /components/ui
- Use cn() from /lib/utils for class merging
- Follow existing component patterns when creating new ones
- Components are unstyled by default, themed via CSS variables

## Code Style
- TypeScript strict mode
- 2 spaces, single quotes, no semicolons
- Prefer named exports
- Use "use client" directive only when needed
`

async function scaffoldNextApp(projectDir: string, name: string): Promise<void> {
  console.log(chalk.blue('Creating Next.js project...'))
  await execa('npx', [
    'create-next-app@latest',
    name,
    '--typescript',
    '--tailwind',
    '--eslint',
    '--app',
    '--src-dir',
    '--import-alias', '@/*',
    '--use-npm',
  ], { stdio: 'inherit', cwd: resolve(projectDir, '..') })
}

async function scaffoldViteApp(projectDir: string, name: string): Promise<void> {
  console.log(chalk.blue('Creating Vite project...'))
  await execa('npx', [
    'create-vite@latest',
    name,
    '--template', 'react-ts',
  ], { stdio: 'inherit', cwd: resolve(projectDir, '..') })
}

async function initShadcn(projectDir: string): Promise<void> {
  console.log(chalk.blue('Initializing shadcn/ui...'))
  await execa('npx', [
    'shadcn@latest',
    'init',
    '--defaults',
  ], { stdio: 'inherit', cwd: projectDir })
}

async function configureRegistry(projectDir: string): Promise<void> {
  const componentsJsonPath = join(projectDir, 'components.json')

  if (!existsSync(componentsJsonPath)) {
    console.log(chalk.yellow('components.json not found, skipping registry config'))
    return
  }

  console.log(chalk.blue('Configuring n3wth registry...'))

  const raw = await readFile(componentsJsonPath, 'utf-8')
  const config = JSON.parse(raw)

  config.registries = {
    ...config.registries,
    n3wth: {
      url: REGISTRY_URL,
      style: 'default',
    },
  }

  await writeFile(componentsJsonPath, JSON.stringify(config, null, 2) + '\n')
  console.log(chalk.green('Registry configured at ' + REGISTRY_URL))
}

async function installBaseComponents(projectDir: string): Promise<void> {
  console.log(chalk.blue(`Installing base components: ${BASE_COMPONENTS.join(', ')}...`))

  for (const component of BASE_COMPONENTS) {
    try {
      await execa('npx', [
        'shadcn@latest',
        'add',
        `n3wth/${component}`,
        '--overwrite',
      ], { stdio: 'inherit', cwd: projectDir })
    } catch {
      console.log(chalk.yellow(`Could not install ${component} from n3wth registry, trying default...`))
      try {
        await execa('npx', [
          'shadcn@latest',
          'add',
          component,
          '--overwrite',
        ], { stdio: 'inherit', cwd: projectDir })
      } catch {
        console.log(chalk.yellow(`Skipping ${component} (not available)`))
      }
    }
  }
}

async function copyContextPacks(projectDir: string): Promise<void> {
  console.log(chalk.blue('Copying AI context packs...'))

  await writeFile(join(projectDir, '.cursorrules'), CURSORRULES)
  await writeFile(join(projectDir, 'AGENTS.md'), AGENTS_MD)

  console.log(chalk.green('Created .cursorrules and AGENTS.md'))
}

async function setTheme(projectDir: string, theme: 'dark' | 'light'): Promise<void> {
  const layoutPath = join(projectDir, 'src', 'app', 'layout.tsx')

  if (!existsSync(layoutPath)) {
    return
  }

  const content = await readFile(layoutPath, 'utf-8')

  if (theme === 'dark') {
    const updated = content.replace(
      /<html lang="en">/,
      '<html lang="en" className="dark">'
    )
    await writeFile(layoutPath, updated)
    console.log(chalk.green('Set default theme to dark'))
  } else {
    console.log(chalk.green('Using light theme (default)'))
  }
}

export async function init(options: InitOptions): Promise<void> {
  console.log(chalk.bold('\nn3wth/kit - Project Scaffolder\n'))

  const answers = await prompts([
    {
      type: options.name ? null : 'text',
      name: 'name',
      message: 'Project name:',
      initial: 'my-app',
      validate: (v: string) => v.length > 0 || 'Name is required',
    },
    {
      type: 'select',
      name: 'framework',
      message: 'Framework:',
      choices: [
        { title: 'Next.js', value: 'nextjs' },
        { title: 'Vite', value: 'vite' },
      ],
    },
    {
      type: 'select',
      name: 'theme',
      message: 'Default theme:',
      choices: [
        { title: 'Dark', value: 'dark' },
        { title: 'Light', value: 'light' },
      ],
    },
  ], {
    onCancel: () => {
      console.log(chalk.red('\nAborted.'))
      process.exit(1)
    },
  })

  const projectName = options.name || answers.name
  const framework = answers.framework as 'nextjs' | 'vite'
  const theme = answers.theme as 'dark' | 'light'
  const shouldInstall = options.install !== false

  const projectDir = resolve(process.cwd(), projectName)

  console.log('')
  console.log(chalk.bold('Configuration:'))
  console.log(`  Name:      ${projectName}`)
  console.log(`  Framework: ${framework === 'nextjs' ? 'Next.js' : 'Vite'}`)
  console.log(`  Theme:     ${theme}`)
  console.log(`  Install:   ${shouldInstall ? 'yes' : 'no'}`)
  console.log('')

  // 1. Scaffold project
  if (framework === 'nextjs') {
    await scaffoldNextApp(projectDir, projectName)
  } else {
    await scaffoldViteApp(projectDir, projectName)
  }

  if (!existsSync(projectDir)) {
    console.log(chalk.red('Project directory was not created. Aborting.'))
    process.exit(1)
  }

  // 2. Install deps if skipped by scaffolder
  if (shouldInstall && framework === 'vite') {
    console.log(chalk.blue('Installing dependencies...'))
    await execa('npm', ['install'], { stdio: 'inherit', cwd: projectDir })
  }

  // 3. Init shadcn
  if (framework === 'nextjs') {
    await initShadcn(projectDir)
  }

  // 4. Configure registry
  await configureRegistry(projectDir)

  // 5. Install base components
  if (framework === 'nextjs') {
    await installBaseComponents(projectDir)
  }

  // 6. Set theme
  await setTheme(projectDir, theme)

  // 7. Copy AI context packs
  await copyContextPacks(projectDir)

  console.log('')
  console.log(chalk.green.bold('Done!'))
  console.log('')
  console.log('  ' + chalk.cyan(`cd ${projectName}`))
  console.log('  ' + chalk.cyan('npm run dev'))
  console.log('')
}

#!/usr/bin/env node
import { Command } from 'commander'
import { init } from './commands/init.js'

const program = new Command()

program
  .name('n3wth-kit')
  .description('Scaffold projects with the n3wth design system')
  .version('0.1.0')

program
  .command('init')
  .description('Initialize a new project with @n3wth/kit')
  .option('-n, --name <name>', 'Project name')
  .option('--no-install', 'Skip dependency installation')
  .action(init)

program.parse()

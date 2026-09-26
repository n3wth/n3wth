import ora, { Ora } from 'ora'
import { colors } from './colors.js'

export function createSpinner(text: string): Ora {
  return ora({
    text,
    color: 'cyan',
    spinner: 'dots',
  })
}

export function progressBar(current: number, total: number, width = 30): string {
  const percentage = Math.round((current / total) * 100)
  const filled = Math.round((current / total) * width)
  const empty = width - filled

  const filledBar = colors.success('█'.repeat(filled))
  const emptyBar = colors.muted('░'.repeat(empty))

  return `${filledBar}${emptyBar} ${colors.info(`${percentage}%`)} (${current}/${total})`
}

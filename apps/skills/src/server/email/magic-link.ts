import type { SkillsAuthEnv } from '../auth/config'

export interface MagicLinkMessage {
  to: string
  url: string
  token: string
}

const DEFAULT_FROM = 'skills@mail.newth.ai'
const RESEND_ENDPOINT = 'https://api.resend.com/emails'

/**
 * In-memory outbox used ONLY when MAGIC_LINK_OUTBOX=1 (local validation
 * runs no real sender and no real addresses). Per-isolate, never persisted.
 */
const outbox: MagicLinkMessage[] = []

export function getMagicLinkOutbox(): readonly MagicLinkMessage[] {
  return outbox
}

export function isOutboxEnabled(env: SkillsAuthEnv): boolean {
  const flag = env.MAGIC_LINK_OUTBOX ?? (typeof process !== 'undefined' ? process.env?.MAGIC_LINK_OUTBOX : undefined)
  return flag === '1' || flag === 'true'
}

function pickFrom(env: SkillsAuthEnv): string {
  return (
    env.MAGIC_LINK_FROM ??
    (typeof process !== 'undefined' ? process.env?.MAGIC_LINK_FROM : undefined) ??
    DEFAULT_FROM
  )
}

async function sendViaResend(apiKey: string, from: string, message: MagicLinkMessage): Promise<void> {
  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: 'Sign in to n3wth skills',
      text: `Click to sign in: ${message.url}\n\nThis link expires in 5 minutes and can be used once.`,
    }),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Magic link sender rejected the request (${response.status}): ${detail.slice(0, 200)}`)
  }
}

/**
 * Send (or capture) a magic link. Sender selection is an explicit env-based
 * switch — the production sender is an open decision tracked in
 * apps/skills/MIGRATION-d1.md. Throwing surfaces a 500 from the auth
 * endpoint, which is correct: silently not sending a requested login email
 * is worse than an error.
 */
export async function sendMagicLinkEmail(env: SkillsAuthEnv, message: MagicLinkMessage): Promise<void> {
  if (isOutboxEnabled(env)) {
    outbox.push(message)
    return
  }
  const resendKey = env.RESEND_API_KEY ?? (typeof process !== 'undefined' ? process.env?.RESEND_API_KEY : undefined)
  if (resendKey) {
    await sendViaResend(resendKey, pickFrom(env), message)
    return
  }
  throw new Error('No magic-link sender configured (set RESEND_API_KEY, or MAGIC_LINK_OUTBOX=1 for local validation)')
}

'use client'
import { useState } from 'react'
import confetti from 'canvas-confetti'
import { trackCopyEvent } from '../lib/analytics'
import type { AssistantId } from '../config/assistants'
import { assistants } from '../config/assistants'

interface CommandBoxProps {
  name: string
  command: string
  primary: boolean
  skillId?: string
  assistantId?: AssistantId | 'all'
  verifyCommand?: string
}

function getVerificationCommand(assistantId: AssistantId | 'all' | undefined): string {
  if (!assistantId || assistantId === 'all') {
    return 'ls ~/.gemini/skills/ 2>/dev/null'
  }
  
  const skillsDir = assistants[assistantId]?.skillsDir || `~/.${assistantId}/skills`
  return `ls ${skillsDir}/ && echo "Skills installed"`
}

function triggerConfetti() {
  const duration = 2000
  const end = Date.now() + duration

  const colors = ['#30d158', '#64d2ff', '#ffd60a', '#ff6961']

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: colors,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}

export function CommandBox({ name, command, primary, skillId, assistantId, verifyCommand }: CommandBoxProps) {
  const verificationCommand = verifyCommand || getVerificationCommand(assistantId)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verified, setVerified] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const announce = setAnnouncement

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command)
    } catch {
      setCopyFailed(true)
      announce('Copy failed. Select the command and copy it manually.')
      setTimeout(() => setCopyFailed(false), 4000)
      return
    }
    setCopyFailed(false)
    setCopied(true)
    setShowVerification(true)

    announce('Copied command to clipboard')

    setTimeout(() => setCopied(false), 2000)

    const trackingId = skillId || name.toLowerCase().replace(/\s+/g, '-')
    trackCopyEvent(trackingId)
  }

  const [verificationCopied, setVerificationCopied] = useState(false)
  const [verificationFailed, setVerificationFailed] = useState(false)

  const handleVerificationCopy = async () => {
    try {
      await navigator.clipboard.writeText(verificationCommand)
    } catch {
      setVerificationFailed(true)
      announce('Copy failed. Select the command and copy it manually.')
      setTimeout(() => setVerificationFailed(false), 4000)
      return
    }
    setVerificationFailed(false)
    setVerificationCopied(true)
    announce('Copied verification command to clipboard')
    setTimeout(() => setVerificationCopied(false), 2000)
  }

  const handleItWorked = () => {
    setVerified(true)
    triggerConfetti()
  }

  return (
    <div className="space-y-2">
      <div aria-live="polite" className="sr-only">{announcement}</div>
      <button
        type="button"
        onClick={handleCopy}
        className={`command-box w-full text-left flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 cursor-pointer ${primary ? 'primary' : ''}`}
        aria-label={`Copy ${name} command`}
      >
        <span
          className="label shrink-0 whitespace-nowrap"
          style={{ color: primary ? 'var(--color-accent)' : 'var(--color-grey-400)' }}
        >
          {name}
        </span>
        <code
          className="flex-1 text-xs sm:text-sm overflow-x-auto whitespace-nowrap font-mono"
          style={{ color: 'var(--color-grey-200)' }}
        >
          {command}
        </code>
        <span
          className={`label px-3 py-1.5 rounded-lg copy-btn flex items-center gap-1.5 ${copied ? 'copied' : ''}`}
        >
          {copied && (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {copied ? 'Copied' : 'Copy'}
        </span>
      </button>

      {copyFailed && (
        <p
          role="status"
          className="text-xs"
          style={{ color: 'var(--color-coral, #ff6961)' }}
        >
          Copy failed — select the command and copy it manually.
        </p>
      )}

      {showVerification && !verified && (
        <div 
          className="verification-section ml-0 sm:ml-4 p-4 rounded-xl"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span 
                className="text-xs font-medium"
                style={{ color: 'var(--color-grey-300)' }}
              >
                Verify installation
              </span>
            </div>
            
            <p 
              className="text-xs"
              style={{ color: 'var(--color-grey-400)' }}
            >
              Run the install command in your terminal, then verify it worked:
            </p>
            
            <button
              type="button"
              onClick={handleVerificationCopy}
              className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors text-left"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
              }}
              aria-label="Copy verification command"
            >
              <code
                className="flex-1 text-xs font-mono overflow-x-auto whitespace-nowrap"
                style={{ color: 'var(--color-grey-300)' }}
              >
                {verificationCommand}
              </code>
              <span
                className="label text-xs px-2 py-1 rounded"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--color-grey-400)',
                }}
              >
                {verificationCopied ? 'Copied' : 'Copy'}
              </span>
            </button>

            {verificationFailed && (
              <p
                role="status"
                className="text-xs"
                style={{ color: 'var(--color-coral, #ff6961)' }}
              >
                Copy failed — select the command and copy it manually.
              </p>
            )}

            <button
              type="button"
              onClick={handleItWorked}
              className="self-start px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: 'var(--color-sage)',
                color: 'var(--color-bg)',
              }}
            >
              It worked
            </button>
          </div>
        </div>
      )}

      {verified && (
        <div
          className="success-message ml-0 sm:ml-4 p-4 rounded-xl flex items-center gap-3"
          style={{
            background: 'rgba(48, 209, 88, 0.1)',
            border: '1px solid rgba(48, 209, 88, 0.3)',
          }}
        >
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="var(--color-sage)"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex flex-col gap-1">
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--color-sage)' }}
            >
              You're all set.
            </span>
            <span 
              className="text-xs"
              style={{ color: 'var(--color-grey-400)' }}
            >
              Your AI assistant now has new superpowers.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

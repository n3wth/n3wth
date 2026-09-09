'use client'
import { PageHeader } from '@n3wth/ui/site'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getBundleById } from '@/src/data/bundles'
import { skills } from '@/src/data/skills'
import { IslandNav } from '@/src/components/IslandNav'
import { Footer } from '@/src/components/Footer'
import { SkillCard } from '@/src/components/SkillCard'
import { CommandBox } from '@/src/components/CommandBox'

type Props = {
  bundleId: string
}

export function BundleDetailClient({ bundleId }: Props) {
  const bundle = getBundleById(bundleId)

  if (!bundle) {
    redirect('/curated-bundles')
  }

  const bundleSkills = bundle.skillIds
    .map(id => skills.find(s => s.id === id))
    .filter(Boolean)

  const installableSkills = bundleSkills.filter(skill => skill?.skillFile)
  const unavailableCount = bundle.skillIds.length - installableSkills.length
  const installCommand = `curl -fsSL https://skills.n3wth.com/install.sh | bash -s -- gemini ${installableSkills.map(skill => skill!.id).join(' ')}`

  const difficultyColors = {
    beginner: 'bg-green-500/15 text-green-400',
    intermediate: 'bg-yellow-500/15 text-yellow-400',
    advanced: 'bg-red-500/15 text-red-400',
  }

  return (
    <div className="min-h-screen relative content-loaded">
      <div className="mesh-gradient" />
      <div className="noise-overlay" />

      <IslandNav />

      <main className="n3wth-site-container n3wth-site-main">
        <div className="max-w-5xl mx-auto">
          {/* Back link */}
          <Link
            href="/curated-bundles"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-grey-400)] hover:text-[var(--color-white)] transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to bundles
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-start gap-4 mb-4">
              <PageHeader title={<>{bundle.name}</>} />
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${difficultyColors[bundle.difficulty]}`}>
                {bundle.difficulty}
              </span>
            </div>
            <p className="text-lg text-[var(--color-grey-300)] mb-6">
              {bundle.longDescription}
            </p>
            <div className="flex flex-wrap gap-2">
              {bundle.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-[var(--glass-bg)] text-[var(--color-grey-400)] border border-[var(--glass-border)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Install Section */}
          <div className="mb-12 p-6 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-white)] mb-4">
              Install {installableSkills.length} available skills
            </h2>
            {installableSkills.length > 0 && <CommandBox name="Install Bundle" command={installCommand} primary={true} />}
            {unavailableCount > 0 && (
              <p className="text-sm text-[var(--color-grey-400)] mt-3">
                {unavailableCount} skills in this collection do not yet have downloads.
              </p>
            )}
            <p className="text-xs text-[var(--color-grey-600)] mt-3">
              Setup time: {bundle.estimatedSetupTime}
            </p>
          </div>

          {/* What You Can Build */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[var(--color-white)] mb-6">
              What you can build
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bundle.whatYouCanBuild.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--color-sage)]" />
                  <span className="text-sm text-[var(--color-grey-300)]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-white)] mb-6">
              Included skills ({bundleSkills.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bundleSkills.map((skill) => skill && (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

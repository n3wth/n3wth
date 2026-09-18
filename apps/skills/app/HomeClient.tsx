'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { SiteContainer, SiteSection, SiteHeading, SiteText } from '@n3wth/ui/site'
import { skills } from '../src/data/skills'
import { IslandNav } from '../src/components/IslandNav'
import { Footer } from '../src/components/Footer'
import { Hero } from '../src/components/Hero'
import { InstallSection } from '../src/components/InstallSection'
import { StatsRow } from '../src/components/StatsRow'
import { SkillCard } from '../src/components/SkillCard'
import { CategoryFilter } from '../src/components/CategoryFilter'
import { SearchInput } from '../src/components/SearchInput'
import { KeyboardShortcutsHelp } from '../src/components/KeyboardShortcutsHelp'
import { TaskInput } from '../src/components/TaskInput'
import { SkillRecommendations } from '../src/components/SkillRecommendations'
import { ComparisonBar } from '../src/components/ComparisonBar'
import { FeaturedSkills } from '../src/components/FeaturedSkills'
import { SkillOfTheDay } from '../src/components/SkillOfTheDay'
import { useKeyboardShortcuts, useAIRecommendations, useSkillSearch, useSkillNavigation } from '../src/hooks'
import { getSkillBadgeStatus } from '../src/lib/analytics'

export default function HomeClient() {
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Search, filter, and sort
  const {
    category,
    query,
    results: filteredSkills,
    setCategory,
    setQuery,
    clearSearch,
  } = useSkillSearch(skills)

  // AI recommendations
  const [taskQuery, setTaskQuery] = useState('')
  const [showRecommendations, setShowRecommendations] = useState(false)
  const { results: recommendations, isLoading: isLoadingRecommendations } = useAIRecommendations(taskQuery, 6)

  const handleTaskChange = useCallback((value: string) => {
    setTaskQuery(value)
    setShowRecommendations(value.trim().length > 0)
  }, [])

  const handleClearRecommendations = useCallback(() => {
    setTaskQuery('')
    setShowRecommendations(false)
  }, [])

  const { selectedIndex, setSelectedIndex, setCardRef } = useSkillNavigation({
    skills: filteredSkills,
  })

  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onFocusSearch: () => searchInputRef.current?.focus(),
    onClearSearch: clearSearch,
    onCategoryChange: setCategory,
    filteredSkillsCount: filteredSkills.length,
    selectedIndex,
    setSelectedIndex,
  })

  // Badge status (memoized)
  const badgeStatus = useMemo(() => getSkillBadgeStatus(), [])


  return (
    <div className="min-h-screen relative content-loaded">
      <IslandNav />
      <Hero />

      <SiteContainer as="main" id="main-content" tabIndex={-1}>
        <SiteSection aria-label="Skill catalog" style={{ paddingTop: 0 }}>
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput ref={searchInputRef} value={query} onChange={setQuery} />
            <Link
              href="/request-skill"
              className="inline-flex min-h-11 items-center text-sm text-grey-400 hover:text-white underline-offset-4 hover:underline"
            >
              Request a new skill
            </Link>
          </div>
          <CategoryFilter activeCategory={category} onCategoryChange={setCategory} />
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredSkills.map((skill, index) => (
            <div
              key={skill.id}
              className="h-full"
              style={{
                contentVisibility: index > 11 ? 'auto' : 'visible',
                containIntrinsicSize: index > 11 ? '0 200px' : undefined,
              }}
            >
              <SkillCard
                ref={setCardRef(index)}
                skill={skill}
                isSelected={selectedIndex === index}
                isTrending={badgeStatus.trendingSkillIds.has(skill.id)}
                isPopular={badgeStatus.popularSkillIds.has(skill.id)}
              />
            </div>
          ))}
        </div>

        {/* Empty State - Delightful */}
        {filteredSkills.length === 0 && (
          <div className="text-center py-20 md:py-28">
            <div className="empty-state-icon inline-block mb-6">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--color-grey-400)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                <path d="M8 8l6 6" />
                <path d="M14 8l-6 6" />
              </svg>
            </div>
            <p className="section-title mb-2">
              {query.trim() ? 'No skills match that yet' : 'No skills in this category yet'}
            </p>
            <p className="label mb-6">
              {query.trim() ? 'Try a broader search, or browse all skills.' : 'Explore the full catalog or check back soon.'}
            </p>
            {query.trim() && (
              <button onClick={clearSearch} className="glass-pill btn-press px-4 py-2 rounded-full text-sm font-medium">
                Browse all skills
              </button>
            )}
          </div>
        )}
        </SiteSection>

        {/* AI Recommendations Section */}
        <SiteSection>
          <div className="mb-6 flex flex-col gap-2">
            <SiteHeading variant="section">
              What are you working on?
            </SiteHeading>
            <SiteText>
              Describe your task to see matching skills.
            </SiteText>
          </div>
          <TaskInput value={taskQuery} onChange={handleTaskChange} />
          <SkillRecommendations
            recommendations={recommendations}
            isVisible={showRecommendations}
            isLoading={isLoadingRecommendations}
            onClose={handleClearRecommendations}
          />
        </SiteSection>

        <FeaturedSkills />

        <StatsRow />

        <InstallSection />

        <SkillOfTheDay />
      </SiteContainer>

      <Footer />
      <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <ComparisonBar />
    </div>
  )
}

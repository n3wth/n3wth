'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import type { Skill } from '../data/skills'
import { filterAndSortSkills } from '../lib/skillSearch'

export type { SortOption } from '../lib/skillSearch'

/**
 * Hook for filtering, sorting, and searching skills.
 * Uses filterAndSortSkills for pure logic; hook handles state and side effects.
 */
export function useSkillSearch(skills: Skill[]) {
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150)
    return () => clearTimeout(timer)
  }, [query])

  const results = useMemo(
    () => filterAndSortSkills(skills, { category, query: debouncedQuery, sort: 'name-asc' }),
    [skills, category, debouncedQuery]
  )

  const clearSearch = useCallback(() => setQuery(''), [])

  return {
    category,
    query,
    results,
    setCategory,
    setQuery,
    clearSearch,
  }
}

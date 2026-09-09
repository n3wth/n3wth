import Link from 'next/link'
import { PageHeader, SiteContainer, SiteSection, SiteText } from '@n3wth/ui/site'
import { skills } from '@/src/data/skills'
import { IslandNav } from '@/src/components/IslandNav'
import { Footer } from '@/src/components/Footer'
import { SkillCard } from '@/src/components/SkillCard'

const suggestedSkills = skills.filter(s => s.featured).slice(0, 4)

export default function NotFound() {
  return (
    <div className="min-h-screen relative content-loaded">
      <div className="mesh-gradient" />
      <div className="noise-overlay" />

      <IslandNav />

      <SiteContainer as="main" className="n3wth-site-main">
        <PageHeader title="Page not found" description="The page you're looking for doesn't exist or has been moved." actions={<Link href="/">Back to home</Link>} />
        <SiteSection>
          <SiteText className="mb-6">Maybe try one of these skills</SiteText>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestedSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </SiteSection>
      </SiteContainer>

      <Footer />
    </div>
  )
}

import { withTheme } from '../components/withTheme'
import { sections } from '../data/content'
import { Button } from '@n3wth/ui/primitives'
import { SectionHeader } from '../components/Frame'
import { Experience } from '../components/sections/Experience'
import './work.css'

function Work() {

  return (
    <>
      <SectionHeader
        as="h1"
        story="work"
        title={sections.work.name}
        lede={sections.work.description}
        action={
          <Button
            label="Open resume"
            variant="primary"
            size="md"
            href="https://r2.n3wth.com/resume/oliver-newth-resume.pdf"
          />
        }
      />
      <Experience />
    </>
  )
}

export default withTheme(Work)

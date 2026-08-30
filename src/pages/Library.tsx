import { SectionHeader } from '../components/Frame'
import { usePageMeta } from '../hooks/usePageMeta'
import { KitShelf } from '../components/library/KitShelf'
import { AssembleBand } from '../components/library/AssembleBand'
import { UiShelf } from '../components/library/UiShelf'
import { GardenShelf } from '../components/library/GardenShelf'
import { SkillsShelf } from '../components/library/SkillsShelf'
import { EcosystemStrip } from '../components/library/EcosystemStrip'

/**
 * /library — the one page here that exists to be taken from rather than
 * read. Four shelves, each ending somewhere you can install, copy, or
 * click through to the real thing, and one of them (the essay kit) has no
 * other home on the internet.
 *
 * No hero. The page opens the way /work does: a heading, a lede, and then
 * straight into the material. The decorative band lands after the kit
 * shelf instead of at the top, where it would read as exactly the hero
 * this page is refusing to have.
 *
 * Every shelf and every kit primitive carries a stable id with
 * scroll-mt-24 on it, so the command palette can deep-link into any of
 * them and clear the fixed nav on the way.
 */
export default function Library() {
  usePageMeta(
    'Library — Oliver Newth',
    "The essay kit behind every piece here, the @n3wth/ui component library, 248 garden notes, and a catalogue of agent skills. What each one's for, and how to start."
  )

  return (
    <>
      <SectionHeader
        as="h1"
        title="Help yourself"
        lede="The components, notes, and agent skills behind this site."
      />

      <KitShelf />
      <AssembleBand />
      <UiShelf />
      <GardenShelf />
      <SkillsShelf />
      <EcosystemStrip />
    </>
  )
}

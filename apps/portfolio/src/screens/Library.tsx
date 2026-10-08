import { withTheme } from '../components/withTheme'
import { sections } from '../data/content'
import { SectionHeader } from '../components/Frame'
import { KitShelf } from '../components/library/KitShelf'
import { AssembleBand } from '../components/library/AssembleBand'
import { UiShelf } from '../components/library/UiShelf'
import { GardenShelf } from '../components/library/GardenShelf'
import { EcosystemStrip } from '../components/library/EcosystemStrip'

/**
 * /library — the one page here that exists to be taken from rather than
 * read. Three shelves, each ending somewhere you can install, copy, or
 * click through to the real thing, and one of them (the essay kit) has no
 * other home on the internet.
 *
 * Every shelf and every kit primitive carries a stable id with
 * scroll-mt-24 on it, so the command palette can deep-link into any of
 * them and clear the fixed nav on the way.
 */
function Library() {

  return (
    <>
      <SectionHeader
        as="h1"
        story="library"
        title={sections.library.name}
        lede={sections.library.description}
      />

      <KitShelf />
      <AssembleBand />
      <UiShelf />
      <GardenShelf />
      <EcosystemStrip />
    </>
  )
}

export default withTheme(Library)

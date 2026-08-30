import { Shelf } from './Shelf'
import gardenIndex from '../../data/garden-index.json'

/**
 * The garden shelf. Note count comes from src/data/garden-index.json,
 * which scripts/fetch-garden-index.mjs pulls from the live site at build
 * time; link and grove totals are from the same source's llms.txt.
 *
 * The grove list is a multi-column index rather than a grid of tag chips:
 * fifteen topics with counts is a table of contents, and a table of
 * contents wants to be scanned down a column, not read across a grid.
 */

const TOPICS = [...gardenIndex.topics].sort((a, b) => b.count - a.count)

export function GardenShelf() {
  return (
    <Shelf
      id="garden"
      meta={`${gardenIndex.noteCount} notes · 1,056 links · 210 groves`}
      title="The garden"
      intro={
        <>
          Notes go in unfinished. Each one carries a growth stage, seedling through budding to
          evergreen, so a half-formed thought can sit in public without having to pretend it's a
          conclusion. Filing is by link rather than folder. There are 1,056 of those links across{' '}
          {gardenIndex.noteCount} notes, collected into 210 groves and drawn as a graph where a
          note's size is the number of things pointing at it.
        </>
      }
    >
      <div data-reveal className="mt-11">
        <p className="index">Groves, largest first</p>
        <ul className="mt-5 columns-2 gap-x-10 sm:columns-3">
          {TOPICS.map((topic) => (
            <li
              key={topic.name}
              className="flex break-inside-avoid items-baseline justify-between gap-4 border-t py-2.5"
              style={{ borderColor: 'var(--rail)' }}
            >
              <a href={topic.href} target="_blank" rel="noreferrer" className="link-underline text-sm">
                {topic.name}
              <span className="sr-only"> (opens in new tab)</span>
              </a>
              <span className="mono">{topic.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div data-reveal className="mt-11 md:grid md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] md:gap-12">
        <p className="max-w-[62ch] text-base leading-relaxed" style={{ color: 'var(--ink)' }}>
          Every one of those notes is in this site's search. Open Search from any page of n3wth.com
          and you're querying the garden, every essay, and every entry on this page from one input.
          That's the whole reason this page exists.
        </p>
        <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm md:mt-0">
          <a
            href="https://garden.n3wth.com"
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            Read it
          <span className="sr-only"> (opens in new tab)</span>
          </a>
          <a
            href="https://garden.n3wth.com/feed.xml"
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            RSS
          <span className="sr-only"> (opens in new tab)</span>
          </a>
          <a
            href="https://garden.n3wth.com/llms.txt"
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            llms.txt
          <span className="sr-only"> (opens in new tab)</span>
          </a>
        </p>
      </div>
    </Shelf>
  )
}

import { Shelf } from './Shelf'

/**
 * The shortest shelf, on purpose. skills.n3wth.com has one honest thing
 * to say about itself and no verified count to put next to it, so this is
 * a category list and a link rather than a padded section pretending to
 * have more.
 */

const CATEGORIES = ['Development', 'Documents', 'Creative', 'Productivity', 'Business']

export function SkillsShelf() {
  return (
    <Shelf
      id="skills"
      meta="skills.n3wth.com"
      title="Agent skills"
      intro="Skills for coding agents, organised by task."
    >
      <div data-reveal className="mt-10 md:grid md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] md:gap-12">
        <div>
          <p className="max-w-[62ch] text-base leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
            Install skills locally. The catalogue includes a separate set for Cursor.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5">
            {CATEGORIES.map((category) => (
              <li key={category} className="text-sm" style={{ color: 'var(--ink)' }}>
                {category}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 text-sm md:mt-0">
          <a
            href="https://skills.n3wth.com"
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            Browse the catalogue
          <span className="sr-only"> (opens in new tab)</span>
          </a>
        </p>
      </div>
    </Shelf>
  )
}

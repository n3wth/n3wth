import { SectionHeader } from '../Frame'
import { BeamsMark } from '../marks'
import { installations } from '../../data/content'

/** "burning-man" -> "Burning man" (sentence case, hyphens to spaces). */
function sentenceCase(type: string) {
  const label = type.replace(/-/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function Creative() {
  return (
    <section id="creative" aria-label="Creative">
      <SectionHeader
        index="05"
        eyebrow="After hours"
        title="I build things that glow"
        lede="Large-scale LED installations for Burning Man and public memorials. I spoke at Robot Heart about where art and technology meet."
        mark={<BeamsMark size={56} />}
      />

      <div className="section-pad pad-tight !pt-0">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ background: 'var(--rail)' }}
        >
          {installations.map((inst) => (
            <article key={inst.id} className="cell group flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden" style={{ background: 'var(--bg)' }}>
                <img
                  src={inst.image}
                  alt={inst.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="led" aria-hidden="true" />
                  <span className="eyebrow" style={{ color: 'var(--accent)' }}>
                    {sentenceCase(inst.type)}
                  </span>
                </div>

                <h3 className="display text-2xl sm:text-3xl !tracking-tight mb-3">
                  {inst.title}
                </h3>

                <p
                  className="text-sm md:text-base leading-relaxed mb-5"
                  style={{ color: 'var(--ink-dim)' }}
                >
                  {inst.tagline}
                </p>

                <div className="flex items-center gap-3 meta">
                  <span style={{ color: 'var(--ink)' }}>{inst.year}</span>
                  <span style={{ color: 'var(--rail-strong)' }}>/</span>
                  <span>{inst.location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

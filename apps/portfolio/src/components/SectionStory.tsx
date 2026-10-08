import { useId, useRef, type CSSProperties } from 'react'
import { useStoryInteractions } from './storyInteractions'
import './sectionStory.css'

const phase = (index: number): CSSProperties => ({ '--story-phase': index } as CSSProperties)

export type SectionStoryKind = 'work' | 'art' | 'thinking' | 'projects' | 'library' | 'contact'

function StoryPulse({ d, seed }: { d: string; seed: number }) {
  const id = useId()
  const colors = ['cyan', 'green', 'yellow', 'red']
  return <>
    <defs>
      <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor={`var(--color-icon-${colors[seed % 4]})`} />
        <stop offset="1" stopColor={`var(--color-icon-${colors[(seed + 1) % 4]})`} />
      </linearGradient>
    </defs>
    <path className="section-story__pulse" d={d} pathLength="1" stroke={`url(#${id})`} style={{
      '--pulse-length': .06 + (seed % 5) * .018,
    } as CSSProperties} />
  </>
}

function LitStoryLine({ d, seed }: { d: string; seed: number }) {
  return <><path d={d} /><StoryPulse d={d} seed={seed} /></>
}

function WorkStory() {
  return <>
    {Array.from({ length: 7 }, (_, i) => <LitStoryLine key={i} seed={i + 10}
      d={`M -100 ${170 + i * 28} C 280 ${170 + i * 28}, 480 ${475 + i * 20}, 790 ${370 + i * 20} S 1150 ${180 + i * 28}, 1500 ${220 + i * 28}`} />)}
    {Array.from({ length: 5 }, (_, i) => <g key={i} className="section-story__plane" style={phase(i)}>
      <LitStoryLine seed={i + 3} d={`M ${690 + i * 40} ${580 - i * 10} V ${190 + i * 24} L ${950 + i * 32} ${105 + i * 26} V ${480 + i * 8} Z`} />
    </g>)}
  </>
}

function ArtStory() {
  return <>
    <g className="section-story__quiet">
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${410 + i * 30} ${690 - i * 18} Q ${870 + i * 20} ${490 - i * 10} 1540 ${620 - i * 11}`} />)}
    </g>
    <g className="section-story__breath">
      {Array.from({ length: 9 }, (_, i) => {
        const x = 580 + i * 46
        const y = 545 - i * 15
        const height = 415 - i * 29
        const arch = `M ${x} ${y} V ${y - height * .62} C ${x} ${y - height * 1.14}, ${x + 220 - i * 9} ${y - height * 1.14}, ${x + 220 - i * 9} ${y - height * .62} V ${y}`
        return <g key={i} style={phase(i)}>
          <path d={arch} />
          <StoryPulse seed={i + 8} d={arch} />
          <path d={arch} transform={`translate(0 ${y * 1.45}) scale(1 -.45)`} />
          <g transform={`translate(0 ${y * 1.45}) scale(1 -.45)`}><StoryPulse seed={i + 8} d={arch} /></g>
        </g>
      })}
    </g>
  </>
}

function ThinkingStory() {
  return <g className="section-story__canopy">
    {Array.from({ length: 23 }, (_, i) => {
      const angle = -Math.PI + i / 22 * Math.PI
      const x = 890 + Math.cos(angle) * 360
      const y = 370 + Math.sin(angle) * 300 + Math.sin(i * .8) * 20
      const root = 890 + (i - 11) * 2.5
      const jointX = 890 + (i - 11) * 3
      const jointY = 420 - Math.abs(i - 11) * 6
      const d = `M ${root} 740 C ${root + 55} 590, ${jointX - Math.cos(angle) * 45} ${jointY + 85}, ${jointX} ${jointY} C ${jointX + Math.cos(angle) * 70} ${jointY - 130}, ${x} ${y + 115}, ${x} ${y}`
      return <g key={i} className="section-story__branch" style={{
        transformOrigin: `${root}px 740px`,
        '--branch-duration': `${11 + ((i * 7) % 13) * 1.13}s`,
        '--branch-delay': `${-i * 2.37}s`,
        '--branch-angle': `${.7 + (i % 5) * .18}deg`,
      } as CSSProperties}>
        <LitStoryLine d={d} seed={i + 16} />
      </g>
    })}
  </g>
}

function ProjectsStory() {
  return <>
    {Array.from({ length: 9 }, (_, i) => {
      const x = 120 + Math.sin(i * .7) * 70
      const y = 100 + i * 48
      return <g key={i}>
        <LitStoryLine seed={i + 4} d={`M ${x} ${y} l 260 -95 l 240 120 l -260 95 Z`} />
        <path className="section-story__quiet" d={`M ${x} ${y} v 28 l 240 120 v -28 M ${x + 240} ${y + 148} l 260 -95 v -28`} />
      </g>
    })}
    <LitStoryLine seed={19} d="M 380 5 C 425 140 305 270 360 365 S 465 460 430 650" />
  </>
}

function LibraryStory() {
  return <g transform="translate(850 390) rotate(-22)">
    {Array.from({ length: 15 }, (_, i) => <g key={i} transform={`rotate(${(i - 7) * 5.5} 0 235)`}>
      <g className="section-story__page" style={phase(i)}>
      <LitStoryLine seed={i + 25} d="M 0 235 C -143 125 -219 -5 -192 -205 C -77 -185 57 -151 142 -74 C 128 73 79 183 0 235 Z" />
      <path className="section-story__quiet" d="M 0 235 C -30 57 -107 -90 -192 -205" />
      </g>
    </g>)}
  </g>
}

function ContactStory() {
  const spectrum = useId()
  const colors = ['cyan', 'green', 'yellow', 'red']
  return <>
    <defs>
      {colors.map((color, i) => <linearGradient key={color} id={`${spectrum}-${i}`} gradientUnits="userSpaceOnUse" x1="924" y1="350" x2="660" y2="100">
        <stop offset="0" stopColor={`var(--color-icon-${color})`} />
        <stop offset="1" stopColor={`var(--color-icon-${colors[(i + 1) % colors.length]})`} />
      </linearGradient>)}
    </defs>
    {[0, 180].map((rotation, side) => <g key={rotation} transform={`rotate(${rotation} 924 350)`}>
        {Array.from({ length: 11 }, (_, i) => {
          const d = `M 924 350 C ${730 + i * 12} ${410 - i * 10}, ${540 + i * 15} ${210 + i * 6}, ${660 + i * 12} ${100 + i * 15} C ${780 + i * 8} ${-10 + i * 21}, ${1010 - i * 7} ${120 + i * 10}, 924 350`
          return <g key={i}>
            <path d={d} />
              <path className="section-story__contact-spectrum" d={d} pathLength="1" stroke={`url(#${spectrum}-${(i * 3 + side) % colors.length})`} style={{
                '--pulse-length': .06 + (i % 5) * .018,
              } as CSSProperties} />
          </g>
        })}
    </g>)}
  </>
}

const stories = { work: WorkStory, art: ArtStory, thinking: ThinkingStory, projects: ProjectsStory, library: LibraryStory, contact: ContactStory }
const storyBounds: Record<SectionStoryKind, string> = {
  work: '575 15 620 620',
  art: '458 50 760 760',
  thinking: '460 -25 860 860',
  projects: '-20 -55 760 760',
  library: '465 55 690 690',
  contact: '594 20 660 660',
}

export function SectionStory({ kind }: { kind: SectionStoryKind }) {
  const scene = useRef<SVGSVGElement>(null)
  useStoryInteractions(scene, kind)
  const Story = stories[kind]
  return <div className={`section-story section-story--${kind}`} aria-hidden="true">
    <svg ref={scene} viewBox={storyBounds[kind]} fill="none" preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true">
      <Story />
    </svg>
  </div>
}

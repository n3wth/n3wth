import './sectionStory.css'

export type SectionStoryKind = 'work' | 'art' | 'thinking' | 'projects' | 'library' | 'contact'

function WorkStory() {
  return <>
    <g className="section-story__quiet">
      {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M ${-100 + i * 18} ${60 + i * 28} C ${390 + i * 9} ${-140 + i * 35}, ${420 + i * 16} ${600 - i * 22}, 810 ${470 - i * 17} S 1040 ${230 + i * 8}, 1500 ${290 + i * 18}`} />)}
    </g>
    <g className="section-story__breath">
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${690 + i * 28} 580 V ${190 + i * 18} L ${950 + i * 22} ${105 + i * 20} V ${480 + i * 8} L ${690 + i * 28} 580`} />)}
      <path d="M 690 190 L 1082 225 M 690 580 L 1082 528 M 950 105 L 1082 225" className="section-story__quiet" />
    </g>
    <path className="section-story__trace" pathLength="1" d="M -80 85 C 390 -80 492 557 810 368 S 1040 278 1500 398" />
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
        return <path key={i} opacity={1 - i * .075} d={`M ${x} ${y} V ${y - height * .62} C ${x} ${y - height * 1.14}, ${x + 220 - i * 9} ${y - height * 1.14}, ${x + 220 - i * 9} ${y - height * .62} V ${y + 50 - i * 6}`} />
      })}
    </g>
    <path className="section-story__trace" pathLength="1" d="M 580 545 V 288 C 580 72 800 72 800 288 V 595" />
  </>
}

const branches = [
  'M 863 690 C 898 577 856 448 886 302 S 1010 112 1044 -40',
  'M 887 449 C 796 375 805 306 716 260 S 566 263 470 175',
  'M 878 390 C 929 339 1034 363 1101 276 S 1160 201 1280 158',
  'M 886 302 C 820 228 848 168 760 111 S 691 62 688 -20',
  'M 881 525 C 980 466 1041 503 1125 461 S 1260 381 1460 415',
  'M 716 260 C 730 180 664 169 638 106',
  'M 805 338 C 708 332 677 396 576 352',
  'M 990 358 C 993 276 940 261 964 195',
  'M 1101 276 C 1078 217 1114 133 1111 52',
  'M 1154 448 C 1224 484 1265 450 1344 485',
  'M 867 615 C 777 552 797 492 688 481',
]

function ThinkingStory() {
  return <>
    <g className="section-story__canopy">
      {branches.map((d, i) => <path key={d} d={d} opacity={i < 5 ? .85 : .45} />)}
      <g className="section-story__quiet" transform="translate(9 2)">{branches.slice(0, 5).map(d => <path key={d} d={d} />)}</g>
      <path className="section-story__quiet" d="M 688 481 C 650 452 615 470 584 439 M 638 106 Q 597 113 563 81 M 964 195 Q 1000 169 987 133 M 760 111 Q 789 55 766 12 M 1280 158 Q 1329 100 1413 110" />
    </g>
    <g className="section-story__quiet">
      <path d="M 863 690 C 839 736 760 729 720 797 M 863 690 C 900 734 970 739 998 811 M 863 690 C 871 760 850 779 870 870" />
    </g>
  </>
}

function ProjectsStory() {
  return <g transform="translate(675 110) scale(.8)">
    <g className="section-story__quiet">
      <path d="M -100 280 H 660 M 280 -100 V 660" />
      <circle cx="280" cy="280" r="360" strokeDasharray="2 12" />
    </g>
    <g className="section-story__assemble section-story__assemble--one">
      <path d="M113.7 1.60007C48.4 11.7001 0 67.9001 0 133.5C0 192.5 40.5 246 97.2 261.9C174.8 283.7 253.4 232.6 265.5 152.5C266.7 144.3 267 129.5 267 71.2001V6.92644e-05L194.8 0.100069C138.8 0.200069 120.5 0.500069 113.7 1.60007Z" />
    </g>
    <g className="section-story__assemble section-story__assemble--two">
      <path d="M407.7 1.6C342.4 11.7 294 67.9 294 133.5C294 192.5 334.5 246 391.2 261.9C408.2 266.7 413.9 267 489.8 267H561V195.7C561 119.9 560.7 114.2 555.9 97.2C538 33.2 473.1 -8.6 407.7 1.6Z" />
    </g>
    <g className="section-story__assemble section-story__assemble--three">
      <path d="M0 365.2C0 441.1 0.3 446.8 5.1 463.8C17.4 507.5 53.5 543.6 97.2 555.9C174.8 577.7 253.4 526.6 265.5 446.5C275.3 381.3 233.6 317 169.8 299.1C152.8 294.3 147.1 294 71.3 294H0V365.2Z" />
    </g>
    <g className="section-story__assemble section-story__assemble--four">
      <path d="M407.7 295.6C356 303.6 313.1 341.4 299.1 391.2C294.3 408.2 294 413.9 294 489.7V561H365.3C441.1 561 446.8 560.7 463.8 555.9C520.5 540 561 486.5 561 427.5C561 346.5 487.4 283.2 407.7 295.6Z" />
    </g>
  </g>
}

function LibraryStory() {
  return <g className="section-story__breath" transform="translate(920 330) rotate(-22)">
    {Array.from({ length: 15 }, (_, i) => <g key={i} transform={`rotate(${(i - 7) * 5.5} 0 235)`} opacity={.25 + (i / 14) * .65}>
      <path d="M 0 235 C -143 125 -219 -5 -192 -205 C -77 -185 57 -151 142 -74 C 128 73 79 183 0 235 Z" />
      <path className="section-story__quiet" d="M 0 235 C -30 57 -107 -90 -192 -205" />
    </g>)}
  </g>
}

function ContactStory() {
  return <>
    <g className="section-story__contact-left">
      {Array.from({ length: 8 }, (_, i) => <path key={i} opacity={.25 + i * .08} d={`M ${520 - i * 22} ${-100 - i * 12} C ${185 - i * 5} ${220 + i * 13}, ${590 + i * 19} ${675 - i * 15}, 924 350`} />)}
    </g>
    <g className="section-story__contact-right">
      {Array.from({ length: 8 }, (_, i) => <path key={i} opacity={.25 + i * .08} d={`M ${1400 + i * 22} ${800 + i * 12} C ${1740 + i * 5} ${480 - i * 13}, ${1258 - i * 19} ${25 + i * 15}, 924 350`} />)}
    </g>
    <circle className="section-story__breath" cx="924" cy="350" r="7" />
  </>
}

const stories = { work: WorkStory, art: ArtStory, thinking: ThinkingStory, projects: ProjectsStory, library: LibraryStory, contact: ContactStory }

export function SectionStory({ kind }: { kind: SectionStoryKind }) {
  const Story = stories[kind]
  return <div className={`section-story section-story--${kind}`} aria-hidden="true">
    <svg viewBox="0 0 1400 900" fill="none" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">
      <Story />
    </svg>
  </div>
}

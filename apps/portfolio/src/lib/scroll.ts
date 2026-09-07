/**
 * Scroll-story GSAP setup — ScrollTrigger and SplitText register here,
 * not in lib/gsap.ts, so they ship only with the lazy-loaded pieces that
 * scroll-drive their animation (vite.config.ts splits them into a
 * separate `gsap-scroll` chunk; lib/gsap.ts stays in the eager bundle).
 *
 * Import { gsap, useGSAP, ScrollTrigger, SplitText } from this file in
 * scroll-driven components. Everything else keeps importing lib/gsap.ts.
 * Never register these plugins anywhere else.
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { SplitText } from 'gsap/SplitText'
import { gsap, useGSAP } from './gsap'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText)

export { gsap, useGSAP, ScrollTrigger, SplitText }

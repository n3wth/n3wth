/**
 * Centralized GSAP configuration
 *
 * Import gsap and useGSAP from this file to keep import statements
 * consistent across components. This eager module carries load-time and
 * hover animations only (Hero entrance, magnetic/tilt). Scroll-driven
 * pieces import from lib/scroll.ts instead, which layers ScrollTrigger +
 * SplitText on top of this same gsap instance in a lazy chunk.
 */

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export { gsap, useGSAP }

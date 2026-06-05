/**
 * Centralized GSAP configuration
 *
 * Import gsap and useGSAP from this file to keep import statements
 * consistent across components. Only load-time and hover animations
 * remain (Hero entrance, magnetic/tilt) — no ScrollTrigger.
 */

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export { gsap, useGSAP }

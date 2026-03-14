/**
 * Centralized GSAP configuration
 *
 * Import gsap and plugins from this file to ensure:
 * 1. Plugins are registered only once
 * 2. Better tree-shaking via consistent imports
 * 3. Cleaner import statements across components
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// Register plugins once globally
gsap.registerPlugin(ScrollTrigger, SplitText)

// Re-export everything components need
export { gsap, ScrollTrigger, SplitText, useGSAP }

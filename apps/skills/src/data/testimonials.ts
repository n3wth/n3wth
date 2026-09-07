export interface Testimonial {
  id: string
  skillId: string
  author: string
  role: string
  company?: string
  avatar?: string
  quote: string
  impact: string
  source: 'user-submitted' | 'twitter' | 'github' | 'verified'
}

export const testimonials: Testimonial[] = []

export function getSkillTestimonials(skillId: string): Testimonial[] {
  return testimonials.filter(t => t.skillId === skillId)
}

export function getTestimonialsBySource(source: Testimonial['source']): Testimonial[] {
  return testimonials.filter(t => t.source === source)
}

export function getFeaturedTestimonials(limit: number = 3): Testimonial[] {
  return testimonials
    .filter(t => t.source === 'verified')
    .slice(0, limit)
}

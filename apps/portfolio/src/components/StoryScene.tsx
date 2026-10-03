import { SectionStory, type SectionStoryKind } from './SectionStory'
import './storyScene.css'

/** A content-sized continuation of the page's opening artwork. */
export function StoryScene({ kind }: { kind: SectionStoryKind }) {
  return <div className="story-scene" aria-hidden="true"><SectionStory kind={kind} /></div>
}

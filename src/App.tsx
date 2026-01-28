import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { NoiseOverlay } from './components/NoiseOverlay'
import { BackgroundElements } from './components/BackgroundElements'
import { SmoothScroll } from './components/SmoothScroll'
import { ScrollProgress } from './components/ScrollProgress'
import { Hero, Experience, Frameworks, Creative, Contact } from './components/sections'

function App() {
  return (
    <SmoothScroll>
      <BackgroundElements />
      <NoiseOverlay />
      <Nav />
      <ScrollProgress />
      <main>
        <Hero />
        <Experience />
        <Frameworks />
        <Creative />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  )
}

export default App

import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Cursor } from './components/Cursor'
import { Hero, Experience, Frameworks, Creative, Contact } from './components/sections'

function App() {
  return (
    <>
      <Cursor />
      <Header />
      <main>
        <Hero />
        <Experience />
        <Frameworks />
        <Creative />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App

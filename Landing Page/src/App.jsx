import React from 'react'
import Navbar from './components/Navbar'
import Background3D from './components/Background3D'
import Hero from './components/Hero'
import './index.css'

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050505] text-white">
      <Background3D />
      <Navbar />
      <Hero />
    </div>
  )
}

export default App

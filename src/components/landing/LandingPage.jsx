import { useState } from 'react'
import { motion } from 'framer-motion'
import Background3D from './Background3D'
import Hero from './Hero'
import Navbar from './Navbar'
import Welcome from './Welcome'

export default function LandingPage() {
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Welcome splash screen */}
      {showWelcome && <Welcome onComplete={() => setShowWelcome(false)} />}

      {/* Fixed background with heart - stays in place while page scrolls */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Background3D />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-black/75" />
      </div>

      {/* Fixed navbar */}
      <motion.div
        className="relative z-20"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: showWelcome ? 0 : 1, y: showWelcome ? -6 : 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Navbar />
      </motion.div>

      {/* Scrollable content on top of fixed background */}
      <motion.div
        className="relative z-10 overflow-y-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: showWelcome ? 0 : 1, y: showWelcome ? 10 : 0 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      >
        <Hero />
      </motion.div>
    </div>
  )
}

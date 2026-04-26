import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Welcome({ onComplete }) {
  const [showText, setShowText] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const userName = localStorage.getItem('clinix_user_name') || 'Guest'

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 900)

    const exitTimer = setTimeout(() => {
      setIsExiting(true)
    }, 4200)

    return () => {
      clearTimeout(textTimer)
      clearTimeout(exitTimer)
    }
  }, [])

  useEffect(() => {
    if (!isExiting) return

    const finishTimer = setTimeout(() => {
      onComplete()
    }, 900)

    return () => clearTimeout(finishTimer)
  }, [isExiting, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1, filter: isExiting ? 'blur(8px)' : 'blur(0px)' }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 via-black/65 to-black/85" />

      {/* Welcome content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{
            opacity: isExiting ? 0 : (showText ? 1 : 0),
            scale: isExiting ? 1.08 : 1,
            y: isExiting ? -14 : 0,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 16 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="font-display text-sm font-semibold uppercase tracking-[0.35em] text-white/75 md:text-base"
          >
            Welcome {userName} to
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 22 }}
            transition={{ duration: 0.85, ease: 'easeOut', delay: showText ? 0.12 : 0 }}
            className="font-display text-6xl font-bold leading-none md:text-8xl"
            style={{
              transform: 'perspective(900px) rotateX(8deg)',
              textShadow:
                '0 1px 0 rgba(255,255,255,0.2), 0 2px 0 rgba(230,72,122,0.75), 0 6px 14px rgba(230,72,122,0.35), 0 12px 34px rgba(0,0,0,0.65)',
            }}
          >
            <span className="text-white">Clinix</span>
            <span className="text-primary">One</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 8 }}
            transition={{ duration: 0.7, delay: showText ? 0.34 : 0 }}
            className="mt-4 text-lg text-white/60 md:text-xl"
          >
            The Future of Healthcare
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showText ? 1 : 0 }}
            transition={{ duration: 0.7, delay: showText ? 0.5 : 0 }}
            className="mt-6"
          >
            <div className="flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { CalendarCheck2, Users, Stethoscope, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <main className="relative z-20 min-h-screen pt-20 md:pt-24">
      {/* Hero Section - Full Height */}
      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 text-center md:min-h-[calc(100vh-6rem)] md:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/55 bg-primary/10 px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-rosePink backdrop-blur-sm"
          >
            <CalendarCheck2 className="h-3.5 w-3.5" />
            ClinixOne Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.85, ease: 'easeOut' }}
            className="mx-auto mt-6 max-w-5xl font-display text-5xl leading-[0.98] text-white md:text-7xl lg:text-8xl"
          >
            ADVANCED CARE,
            <br />
            <span className="bg-gradient-to-r from-rosePink via-primary to-[#ffd2e1] bg-clip-text text-transparent">
              READY FOR YOU
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="mx-auto mt-6 max-w-3xl text-lg text-white/60 md:text-[33px]"
          >
            Next-generation appointment scheduling with secure patient journeys, doctor-friendly workflows,
            and a modern care experience designed for real outcomes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.55, ease: 'easeOut' }}
            className="mt-10"
            id="specialties"
          >
            <Link
              to="/register"
              className="inline-flex rounded-lg bg-primary px-9 py-4 text-base font-semibold uppercase tracking-wide text-white shadow-[0_0_30px_rgba(244,91,140,0.55)] transition hover:bg-deepPink"
            >
              Schedule Appointment
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="scroll-mt-28 px-6 py-20 md:scroll-mt-32 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: '-100px' }}
            className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg md:p-12"
          >
            <div className="flex items-start gap-4">
              <Users className="h-8 w-8 flex-shrink-0 text-rosePink md:h-10 md:w-10" />
              <div>
                <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">About ClinixOne</h2>
                <p className="mt-4 text-base text-white/70 md:text-lg">
                  ClinixOne is a next-generation healthcare platform designed to streamline patient care, modernize appointment scheduling, and empower doctors with intuitive tools. Built with security, accessibility, and real outcomes in mind.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties-full" className="scroll-mt-28 px-6 py-20 md:scroll-mt-32 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-10 font-display text-3xl font-semibold text-white md:text-4xl"
          >
            Medical Specialties
          </motion.h2>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'General Practice', desc: 'Comprehensive primary care for all ages' },
              { title: 'Cardiology', desc: 'Heart and cardiovascular health specialists' },
              { title: 'Orthopedics', desc: 'Bone, joint, and musculoskeletal care' },
              { title: 'Pediatrics', desc: 'Expert care for infants and children' },
              { title: 'Dermatology', desc: 'Skin health and aesthetic treatments' },
              { title: 'Neurology', desc: 'Neurological and brain disorders' },
            ].map((specialty, idx) => (
              <motion.div
                key={specialty.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true, margin: '-100px' }}
                className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg transition hover:bg-white/15"
              >
                <Stethoscope className="h-6 w-6 text-rosePink" />
                <h3 className="mt-3 font-semibold text-white">{specialty.title}</h3>
                <p className="mt-2 text-sm text-white/60">{specialty.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="scroll-mt-28 px-6 py-20 md:scroll-mt-32 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: '-100px' }}
            className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg md:p-12"
          >
            <div className="flex items-start gap-4">
              <Mail className="h-8 w-8 flex-shrink-0 text-rosePink md:h-10 md:w-10" />
              <div className="w-full">
                <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">Get In Touch</h2>
                <p className="mt-4 text-base text-white/70 md:text-lg">
                  Have questions or need assistance? Our team is ready to help you experience the future of healthcare.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/register"
                    className="inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-deepPink md:text-base"
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex rounded-lg border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/10 md:text-base"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/40 md:px-10">
        © {new Date().getFullYear()} ClinixOne. Designed for modern, compassionate care.
      </footer>
    </main>
  )
}
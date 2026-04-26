import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
      
      {/* Small Badge / Top Label */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="border border-blue-500/50 rounded-full px-4 py-1 mb-6 text-xs uppercase tracking-[0.2em] text-blue-300 bg-blue-900/10 backdrop-blur-sm"
      >
        ClinixOne Platform
      </motion.div>

      {/* Main Heading Main text: "ADVANCED CARE, READY FOR YOU" */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-4 max-w-4xl"
      >
        ADVANCED CARE,<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
          READY FOR YOU
        </span>
      </motion.h1>

      {/* Subheading text: "Next-generation medical appointments." */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-gray-400 max-w-xl text-lg mb-10"
      >
        Next-generation medical appointments. High-quality care scheduling optimized for the future of healthcare.
      </motion.p>

      {/* CTA Button */}
      <motion.button 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
        className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-4 rounded pointer-events-auto transition-colors shadow-[0_0_20px_rgba(0,17,255,0.4)] hover:shadow-[0_0_30px_rgba(0,17,255,0.6)]"
      >
        SCHEDULE AN APPOINTMENT
      </motion.button>
    </div>
  );
};

export default Hero;

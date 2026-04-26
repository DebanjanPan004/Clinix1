import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react'; // Generic medical icon

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center text-white bg-transparent">
      {/* Brand / Logo */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <Stethoscope className="w-8 h-8 text-white group-hover:text-blue-400 transition-colors" />
        <span className="text-2xl font-bold tracking-tight">ClinixOne</span>
      </motion.div>

      {/* Navigation Links */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="hidden md:flex gap-8 text-sm uppercase tracking-widest text-gray-300"
      >
        <a href="#about" className="hover:text-white transition-colors">About</a>
        <a href="#specialties" className="hover:text-white transition-colors">Specialties</a>
        <a href="#contact" className="hover:text-white transition-colors">Contact</a>
      </motion.div>
    </nav>
  );
};

export default Navbar;

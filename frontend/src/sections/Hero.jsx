import React from 'react';
import { motion } from 'framer-motion';

const Hero = ({ onStart }) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop" 
          alt="Cinematic Landscape"
          className="w-full h-full object-cover grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/20 to-dark" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-7xl md:text-[140px] font-heading font-bold mb-12 leading-[1.0] tracking-tighter text-white/90">
            Journey <span className="text-white drop-shadow-2xl">Beyond</span> <br /> 
            Intelligence
          </h1>
          
          <p className="text-xl md:text-2xl text-white/40 max-w-2xl mx-auto mb-20 font-body font-light tracking-wide leading-relaxed">
            Elite travel planning powered by AI, tailored <br className="hidden md:block"/> to your most discerning preferences.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <button className="primary-btn" onClick={onStart}>
              Start Planning →
            </button>
            <button className="outline-btn" onClick={() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Destinations
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
    </section>
  );
};

export default Hero;

'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function FabricPreloader({ finishLoading }) {
  const [percent, setPercent] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Exit sequence when 100% is reached
  useEffect(() => {
    if (percent === 100) {
      setTimeout(() => finishLoading(), 600);
    }
  }, [percent, finishLoading]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="preloader-container"
    >
      <div className="string-wrapper">
        {/* The Base Thread */}
        <div className="thread-base" />
        
        {/* The Loading Progress (Coloring the thread) */}
        <motion.div 
          className="thread-progress"
          style={{ width: `${percent}%` }}
        />

        {/* The Interactive "Pluckable" String */}
        <motion.div
          className="pluckable-string"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.6}
          whileTap={{ scaleY: 1.5 }}
          style={{ width: `${percent}%` }}
        >
          {/* Subtle vibration animation */}
          <motion.div 
            animate={{ y: [0, -1, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="thread-glow"
          />
        </motion.div>
      </div>

      <div className="loader-text">
        <span className="brand-name">Lemonlilt</span>
        <span className="percentage">{percent}%</span>
      </div>
    </motion.div>
  );
}
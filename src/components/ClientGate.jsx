// src/components/ClientGate.jsx
'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FabricPreloader from './FabricPreloader';

export default function ClientGate({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <FabricPreloader key="loader" finishLoading={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {/* We keep children in the DOM but hidden until loaded for SEO/Speed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </>
  );
}
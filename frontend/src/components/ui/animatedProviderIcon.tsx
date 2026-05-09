"use client"
import { PROVIDER_CONFIG } from '@/lib/utils/provider';
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "framer-motion";


const AnimatedProviderIcon = () => {
  const providers = Object.entries(PROVIDER_CONFIG);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % providers.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [providers.length]);

  const [key, provider] = providers[currentIndex];
  const Icon = provider.icon;

  return (
    <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 6, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.85 }}
          transition={{
            duration: 0.22,
            ease: "easeOut",
          }}
          className="absolute flex items-center justify-center"
        >
          <Icon className="w-4 h-4" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedProviderIcon
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import "./RouteLoader.css";

const RouteLoader = () => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 800); // adjust delay here
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="orbit-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="orbit-loader"
            initial={{ scale: 0.8 }}
            animate={{ rotate: 360, scale: 1 }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 2,
            }}
          >
            <motion.div
              className="orbit-center"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="orbit-ring"
              animate={{
                rotate: 360,
              }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 3,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RouteLoader;

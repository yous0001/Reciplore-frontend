import React from 'react'
import { motion } from 'framer-motion';

export default function FloatingShape({ color, size, top, left, delay }) {
  return (
    <motion.div
      className={`${color} ${size} absolute delay-${delay} rounded-full opacity-20 blur-xl`} 
      style={{ top, left }}
      animate={{
          y: ["0%", "100%", "0%"],
          x: ["0%", "100%", "0%"],
          rotate: [0, 360],
      }}
      transition={{
          duration: 20,
          repeat: Infinity,
          delay,
          ease: "linear"
      }} 
      aria-hidden="true"
    />
  )
}
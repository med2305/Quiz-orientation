'use client';

import { motion } from 'framer-motion';

const FloatingShape = ({ className, animate, transition }) => (
  <motion.div
    className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-30 ${className}`}
    animate={animate}
    transition={transition}
  />
);

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      <FloatingShape
        className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] bg-primary-300"
        animate={{
          x: ['-20vw', '20vw'],
          y: ['-10vh', '10vh'],
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 20,
          ease: 'easeInOut',
        }}
      />
      <FloatingShape
        className="absolute top-[20%] right-[15%] w-[35vw] h-[35vw] bg-secondary-300"
        animate={{
          x: ['20vw', '-20vw'],
          y: ['10vh', '-10vh'],
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 23,
          ease: 'easeInOut',
        }}
      />
      <FloatingShape
        className="absolute bottom-[15%] left-[15%] w-[45vw] h-[45vw] bg-primary-400"
        animate={{
          x: ['-15vw', '15vw'],
          y: ['10vh', '-10vh'],
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 18,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

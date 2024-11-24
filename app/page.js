'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedBackground from './components/AnimatedBackground';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  return (
    <div className="h-full pt-20">
      <AnimatedBackground />
      <div className="relative z-10 h-full flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            className="text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.h1 
              className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
              variants={fadeIn}
            >
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                Trouvez Votre
              </span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
                Parcours Idéal
              </span>
            </motion.h1>
            <motion.p 
              className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
              variants={fadeIn}
            >
              Découvrez les formations et universités qui correspondent le mieux à vos aspirations grâce à notre plateforme d'orientation intelligente.
            </motion.p>
            <motion.div 
              className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
              variants={fadeIn}
            >
              <div className="rounded-md shadow-lg hover:shadow-2xl transition-all duration-300">
                <Link href="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 transform hover:scale-105 transition-all duration-300 md:py-4 md:text-lg md:px-10">
                  Commencer le Quiz
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <section className="h-full bg-white/80 backdrop-blur-sm">
          <div className="h-full flex items-center">
            <motion.div 
              className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {[
                  {
                    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                    title: "Quiz Personnalisé",
                    description: "Répondez à notre quiz interactif pour découvrir les formations qui correspondent à votre profil."
                  },
                  {
                    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                    title: "Universités Recommandées",
                    description: "Explorez les universités qui offrent les formations adaptées à vos objectifs."
                  },
                  {
                    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                    title: "Formations Spécialisées",
                    description: "Découvrez des formations spécialisées qui correspondent à vos centres d'intérêt."
                  }
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white mx-auto">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-600">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
}

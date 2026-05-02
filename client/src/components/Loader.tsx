import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Loader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0, x: "50%", y: "50%" }}
            animate={{ 
              scale: [0, 1.5, 0], 
              opacity: [0, 1, 0],
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`]
            }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8 p-6 rounded-full bg-gradient-to-tr from-primary to-secondary text-white shadow-[0_0_50px_rgba(248,198,61,0.35)] mx-auto w-fit"
        >
          <Sparkles className="w-12 h-12" />
        </motion.div>
        
        <motion.h2 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-2xl font-black text-white tracking-widest uppercase px-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Garuda Fireworks
        </motion.h2>
        <p className="text-primary-foreground/70 mt-2 font-bold tracking-tight px-4">Lighting Up Your Celebrations...</p>
      </div>
    </div>
  );
}

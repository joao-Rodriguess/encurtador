import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: 'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Central Tech Element */}
      <div className="relative">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -inset-8 border border-amber-500/20 rounded-full"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -inset-16 border border-amber-500/10 rounded-full"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 p-6 bg-amber-500/10 rounded-3xl border border-amber-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(245,158,11,0.2)]"
        >
          <Cpu className="text-amber-500" size={48} />
        </motion.div>
      </div>

      {/* Progress & Text */}
      <div className="mt-12 text-center z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            <h2 className="text-amber-500 font-bold tracking-[0.3em] uppercase text-xs">Iniciando Sistemas Reais</h2>
          </div>
          
          {/* Scanning Bar */}
          <div className="w-48 h-[2px] bg-white/5 rounded-full mt-4 relative overflow-hidden">
            <motion.div 
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
            />
          </div>

          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[10px] text-gray-500 mt-6 font-mono uppercase tracking-widest"
          >
            Autenticando protocolos de segurança...
          </motion.p>
        </motion.div>
      </div>

      {/* Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
    </div>
  );
};

export default LoadingScreen;

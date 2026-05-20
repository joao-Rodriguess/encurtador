import React, { useState, useEffect } from 'react';
import { subscribeToAnnouncements } from '../firebase/firestore';
import { X, ArrowRight, Sparkles, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementBanner = () => {
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAnnouncements((data) => {
      const active = data.find(ann => ann.isActive === true);
      setActiveAnnouncement(active || null);
      
      // Resetar o estado de fechamento se o banner ativo mudar
      if (active) {
        const dismissed = sessionStorage.getItem(`dismissed_banner_${active.id}`);
        setIsDismissed(dismissed === 'true');
      } else {
        setIsDismissed(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = () => {
    if (activeAnnouncement) {
      sessionStorage.setItem(`dismissed_banner_${activeAnnouncement.id}`, 'true');
      setIsDismissed(true);
    }
  };

  if (!activeAnnouncement || isDismissed) {
    return null;
  }

  const getThemeClasses = (theme) => {
    switch (theme) {
      case 'sunset-horizon':
        return {
          banner: 'bg-gradient-to-r from-purple-700 via-pink-600 to-orange-500 text-white shadow-pink-500/10',
          btn: 'bg-white text-pink-700 hover:bg-gray-100 hover:shadow-lg hover:shadow-white/20',
          closeBtn: 'text-white/80 hover:text-white hover:bg-white/10'
        };
      case 'neon-emerald':
        return {
          banner: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-emerald-500/10',
          btn: 'bg-[#062016] text-emerald-400 border border-emerald-500/30 hover:bg-[#093021] hover:text-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10',
          closeBtn: 'text-white/80 hover:text-white hover:bg-white/10'
        };
      case 'electric-indigo':
        return {
          banner: 'bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 text-white shadow-indigo-500/10',
          btn: 'bg-white text-indigo-700 hover:bg-gray-100 hover:shadow-lg hover:shadow-white/20',
          closeBtn: 'text-white/80 hover:text-white hover:bg-white/10'
        };
      case 'cyberpunk-amber':
      default:
        return {
          banner: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-gray-950 shadow-amber-500/10 font-bold',
          btn: 'bg-[#0a0a0f] text-amber-400 hover:bg-[#12121a] hover:text-amber-300 hover:shadow-lg hover:shadow-black/35',
          closeBtn: 'text-gray-900/80 hover:text-gray-950 hover:bg-black/5'
        };
    }
  };

  const theme = getThemeClasses(activeAnnouncement.theme);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`w-full py-2.5 md:py-3.5 px-4 md:px-6 relative z-50 flex items-center justify-center shadow-lg border-b border-white/5 ${theme.banner}`}
      >
        <div className="max-w-6xl w-full flex flex-col sm:flex-row items-center justify-between gap-3 pr-8">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <div className="p-1.5 bg-black/10 rounded-lg shrink-0 hidden md:block">
              <Megaphone size={16} className="animate-bounce" />
            </div>
            <div className="font-sans">
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded-full mr-2">
                <Sparkles size={8} /> NOVIDADE
              </span>
              <strong className="text-xs md:text-sm font-black uppercase tracking-tight">{activeAnnouncement.title}</strong>
              <span className="mx-2 hidden sm:inline opacity-60">|</span>
              <span className="text-[11px] md:text-xs font-medium opacity-90 block sm:inline mt-0.5 sm:mt-0">{activeAnnouncement.description}</span>
            </div>
          </div>

          {(activeAnnouncement.ctaText && activeAnnouncement.ctaUrl) && (
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href={activeAnnouncement.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 shadow shrink-0 ${theme.btn}`}
            >
              <span>{activeAnnouncement.ctaText}</span>
              <ArrowRight size={12} />
            </motion.a>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${theme.closeBtn}`}
          title="Fechar anúncio"
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementBanner;

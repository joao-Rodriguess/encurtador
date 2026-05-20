import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Header';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';
import ProfileForm from '../components/ProfileForm';
import AnnouncementManager from '../components/AnnouncementManager';
import AnalyticsAndChat from '../components/AnalyticsAndChat';
import { motion } from 'framer-motion';
import { LayoutGrid, Settings, Crown, Megaphone, BarChart3 } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useOutletContext();
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'announcements', 'analytics', or 'settings'


  return (
    <div className="admin-bg min-h-screen bg-[#0a0a0f]">
      <Header user={user} />
      
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-10 md:mb-12">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="p-2.5 md:p-3 bg-amber-500/10 rounded-2xl hidden sm:block">
              <Crown className="text-amber-500" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Aposentos Reais</h1>
              <p className="text-gray-500 text-xs md:text-sm mt-1">Gestão soberana de vosso acervo digital</p>
            </div>
          </div>

          <div className="tabs flex w-full sm:w-auto bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto">
            <button 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'projects' 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('projects')}
            >
              <LayoutGrid size={16} />
              <span>Projetos</span>
            </button>
            <button 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'announcements' 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('announcements')}
            >
              <Megaphone size={16} />
              <span>Anúncios</span>
            </button>
            <button 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'analytics' 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 size={16} />
              <span>Visitas & Chat</span>
            </button>
            <button 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'settings' 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} />
              <span>Ajustes</span>
            </button>
          </div>
        </div>

        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-8"
        >
          {activeTab === 'projects' ? (
            <div className="grid grid-cols-1 gap-8 md:gap-10">
              <div className="glass-panel p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/10">
                <h2 className="text-lg md:text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
                  <Crown size={18} />
                  Forjar Nova Obra
                </h2>
                <ProjectForm userId={user.uid} />
              </div>
              
              <div className="space-y-6">
                <h2 className="text-lg md:text-xl font-bold text-white px-1">Seu Acervo Atual</h2>
                <ProjectList userId={user.uid} />
              </div>
            </div>
          ) : activeTab === 'announcements' ? (
            <AnnouncementManager />
          ) : activeTab === 'analytics' ? (
            <AnalyticsAndChat />
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="glass-panel p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/10">
                <h2 className="text-lg md:text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
                  <Settings size={18} />
                  Personalização Real
                </h2>
                <ProfileForm userId={user.uid} />
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;

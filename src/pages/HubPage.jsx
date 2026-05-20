import React, { useEffect, useState } from 'react';
import { subscribeToProjects, getHubSettings, logVisitor, toggleProjectLike } from '../firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Code2, Cpu, Heart, MessageSquare, Github, Linkedin, FileText, Phone, Palette, Star, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import LoadingScreen from '../components/LoadingScreen';
import AnnouncementBanner from '../components/AnnouncementBanner';
import AnonymousChat from '../components/AnonymousChat';
import ProjectCommentsModal from '../components/ProjectCommentsModal';

const HubPage = () => {
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState({ bgImageUrl: '', githubLink: '', linkedinLink: '', resumeLink: '', whatsappLink: '' });
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [visitorIp, setVisitorIp] = useState('');
  
  // Seletor de Temas
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'gold');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Filtros e Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Estados para Curtidas e Comentários Individuais
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [likedProjects, setLikedProjects] = useState([]);

  useEffect(() => {
    // Aplicar e persistir tema
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Carregar do localStorage quais projetos já foram curtidos
    const loadedLikes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('liked_project_')) {
        loadedLikes.push(key.replace('liked_project_', ''));
      }
    }
    setLikedProjects(loadedLikes);
  }, []);

  const handleLikeToggle = async (projectId) => {
    const isLiked = likedProjects.includes(projectId);
    
    // Atualização otimista
    if (isLiked) {
      setLikedProjects(prev => prev.filter(id => id !== projectId));
      localStorage.removeItem(`liked_project_${projectId}`);
    } else {
      setLikedProjects(prev => [...prev, projectId]);
      localStorage.setItem(`liked_project_${projectId}`, 'true');
    }
    
    try {
      await toggleProjectLike(projectId, isLiked);
    } catch (err) {
      // Reversão em caso de falha
      if (isLiked) {
        setLikedProjects(prev => [...prev, projectId]);
        localStorage.setItem(`liked_project_${projectId}`, 'true');
      } else {
        setLikedProjects(prev => prev.filter(id => id !== projectId));
        localStorage.removeItem(`liked_project_${projectId}`);
      }
      console.error("Falha ao salvar curtida no Firestore:", err);
    }
  };

  const handleOpenComments = (project) => {
    setSelectedProject(project);
    setIsCommentsOpen(true);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const s = await getHubSettings();
      if (s) {
        setSettings(s);
      }
    };
    fetchSettings();

    const unsubscribe = subscribeToProjects((data) => {
      setProjects(data);
      // Simular um carregamento mínimo para a animação brilhar
      setTimeout(() => setLoading(false), 1500);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const logAccess = async () => {
      const hasLogged = sessionStorage.getItem('logged_visit');
      if (hasLogged) {
        const cachedIp = sessionStorage.getItem('visitor_ip');
        if (cachedIp) setVisitorIp(cachedIp);
        return;
      }

      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('Falha ao obter geolocalização do IP');
        const data = await res.json();
        
        const visitorData = {
          ip: data.ip || 'Desconhecido',
          country: data.country_name || 'Desconhecido',
          countryCode: data.country_code || '??',
          city: data.city || 'Desconhecido',
          region: data.region || 'Desconhecido',
          org: data.org || 'Desconhecido',
          userAgent: navigator.userAgent
        };

        setVisitorIp(visitorData.ip);
        sessionStorage.setItem('logged_visit', 'true');
        sessionStorage.setItem('visitor_ip', visitorData.ip);

        await logVisitor(visitorData);
      } catch (err) {
        console.warn('Erro ao obter IP detalhado, tentando fallback simples...', err);
        try {
          const resFallback = await fetch('https://api.ipify.org?format=json');
          const dataFallback = await resFallback.json();
          const simpleVisitor = {
            ip: dataFallback.ip || 'Desconhecido',
            country: 'Desconhecido',
            countryCode: '??',
            city: 'Desconhecido',
            region: 'Desconhecido',
            org: 'Desconhecido',
            userAgent: navigator.userAgent
          };
          setVisitorIp(simpleVisitor.ip);
          sessionStorage.setItem('logged_visit', 'true');
          sessionStorage.setItem('visitor_ip', simpleVisitor.ip);
          await logVisitor(simpleVisitor);
        } catch (fallbackErr) {
          console.error('Falha geral no rastreamento de IP do visitante:', fallbackErr);
          const anonymousVisitor = {
            ip: 'Anônimo',
            country: 'Desconhecido',
            countryCode: '??',
            city: 'Desconhecido',
            region: 'Desconhecido',
            org: 'Desconhecido',
            userAgent: navigator.userAgent
          };
          await logVisitor(anonymousVisitor);
        }
      }
    };
    logAccess();
  }, []);

  // Manipuladores de mouse para o efeito 3D Tilt
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    card.style.setProperty('--glare-x', `${glareX}%`);
    card.style.setProperty('--glare-y', `${glareY}%`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
  };

  // Filtragem de Projetos
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === '' || 
                       (p.technologies && p.technologies.split(',').map(t => t.trim().toLowerCase()).includes(selectedTag.toLowerCase()));
    return matchesSearch && matchesTag;
  });

  // Identificar projeto em Destaque Real
  const featuredProject = projects.find(p => p.isFeatured);
  
  // Projetos regulares (exclui o destaque quando não há filtros aplicados)
  const isFiltering = searchTerm !== '' || selectedTag !== '';
  const regularProjects = isFiltering 
    ? filteredProjects 
    : filteredProjects.filter(p => p.id !== featuredProject?.id);

  // Extrair todas as tags exclusivas
  const allTags = Array.from(new Set(
    projects
      .flatMap(p => p.technologies ? p.technologies.split(',').map(t => t.trim()) : [])
      .filter(t => t !== '')
  ));

  if (loading) {
    return <LoadingScreen />;
  }

  const backgroundStyle = settings.bgImageUrl 
    ? { 
      backgroundImage: `linear-gradient(to bottom, rgba(var(--bg-color), 0.85), var(--bg-color)), url(${settings.bgImageUrl})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundAttachment: 'fixed' 
    }
    : {};

  const themesList = [
    { id: 'gold', name: 'Obsidian Gold', color: 'text-amber-500 bg-amber-500/10' },
    { id: 'emerald', name: 'Emerald Empire', color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'amethyst', name: 'Royal Amethyst', color: 'text-fuchsia-500 bg-fuchsia-500/10' },
  ];

  return (
    <div className="hub-container min-h-screen text-[var(--text-main)] flex flex-col transition-colors duration-500" style={backgroundStyle}>
      <AnnouncementBanner />
      
      <header className="w-full py-4 md:py-6 px-4 md:px-6 max-w-6xl mx-auto flex justify-between items-center z-20">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Cpu className="text-[var(--accent-color)]" size={20} />
          <h1 className="text-base md:text-lg font-bold tracking-tight uppercase">
            MEU <span className="text-[var(--accent-color)]">HUB</span>
          </h1>
        </motion.div>
        
        <div className="flex items-center gap-4">
          {/* Seletor de Temas Imperial */}
          <div className="relative">
            <button 
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="p-2 bg-white/5 border border-white/10 hover:border-[var(--accent-color)]/30 rounded-xl transition-all flex items-center gap-2"
              title="Mudar Tema Imperial"
            >
              <Palette className="text-[var(--accent-color)]" size={16} />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Aura Real</span>
            </button>
            <AnimatePresence>
              {isThemeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsThemeMenuOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-[#0f0f16] border border-white/10 rounded-2xl shadow-2xl p-2 z-40"
                  >
                    <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold px-3 py-1.5 border-b border-white/5 mb-1.5">Aura do Império</p>
                    {themesList.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                          theme === t.id 
                            ? `${t.color} border border-white/10` 
                            : 'hover:bg-white/5 text-gray-400'
                        }`}
                      >
                        <span>{t.name}</span>
                        {theme === t.id && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="text-[10px] md:text-xs text-gray-500 hover:text-[var(--accent-color)] transition-colors uppercase tracking-widest font-bold"
          >
            Área Restrita
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 md:px-6 py-4 md:py-8">
        
        {/* Banner de Boas Vindas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-3xl md:text-6xl font-black mb-3 text-white tracking-tight">
            Portfólio de Projetos
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-xs md:text-base leading-relaxed mb-6 font-medium">
            Uma coleção de criações sofisticadas e sistemas integrados do portfólio.
          </p>

          {/* Linktree Premium (Social Bar) */}
          {(settings.githubLink || settings.linkedinLink || settings.resumeLink || settings.whatsappLink) && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex flex-wrap items-center justify-center gap-3 p-2 px-4 glass-panel bg-white/5 border border-white/10 rounded-2xl shadow-xl shadow-black/30"
            >
              {settings.githubLink && (
                <a href={settings.githubLink} target="_blank" rel="noopener noreferrer" 
                   className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-[var(--accent-color)] hover:scale-110 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Github size={16} />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              )}
              {settings.linkedinLink && (
                <a href={settings.linkedinLink} target="_blank" rel="noopener noreferrer" 
                   className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-[var(--accent-color)] hover:scale-110 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Linkedin size={16} />
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              )}
              {settings.resumeLink && (
                <a href={settings.resumeLink} target="_blank" rel="noopener noreferrer" 
                   className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-[var(--accent-color)] hover:scale-110 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <FileText size={16} />
                  <span className="hidden sm:inline">Currículo</span>
                </a>
              )}
              {settings.whatsappLink && (
                <a href={settings.whatsappLink} target="_blank" rel="noopener noreferrer" 
                   className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-[var(--accent-color)] hover:scale-110 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Phone size={16} />
                  <span className="hidden sm:inline">Contato</span>
                </a>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* 🌟 Projeto Destaque Real (Featured Project) */}
        {featuredProject && !isFiltering && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-12 tilt-card-wrapper"
          >
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="tilt-card relative overflow-hidden glass-panel border border-[var(--accent-color)]/30 bg-gradient-to-r from-white/[0.02] to-white/[0.04] p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-6 md:gap-8 items-center"
            >
              <div className="tilt-card-glare" />
              
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20 shadow-lg">
                  <Star size={12} className="fill-[var(--accent-color)] animate-pulse" />
                  Destaque Imperial
                </span>
              </div>

              {/* Imagem do Destaque */}
              <div className="w-full md:w-2/5 aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 relative group-hover:border-white/10 transition-all duration-300">
                {featuredProject.imageUrl ? (
                  <img src={featuredProject.imageUrl} alt={featuredProject.title} className="w-full h-full object-cover transition-transform duration-500 scale-100 hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gray-900/50 flex items-center justify-center">
                    <Code2 size={48} className="text-gray-800" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10">
                  {featuredProject.liveUrl && (
                    <a href={featuredProject.liveUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-[var(--accent-color)] text-black rounded-full hover:scale-110 transition-transform shadow-lg shadow-[var(--accent-glow)]">
                      <ExternalLink size={22} />
                    </a>
                  )}
                  {featuredProject.githubUrl && (
                    <a href={featuredProject.githubUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 hover:scale-110 transition-transform border border-white/10">
                      <Code2 size={22} />
                    </a>
                  )}
                </div>
              </div>

              {/* Informações do Destaque */}
              <div className="w-full md:w-3/5 flex flex-col justify-between h-full py-2">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-widest text-[var(--accent-color)]">
                    <Sparkles size={14} />
                    <span>Criação Premium</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 hover:text-[var(--accent-color)] transition-colors">
                    {featuredProject.title}
                  </h3>
                  
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6">
                    {featuredProject.description}
                  </p>
                </div>

                <div>
                  {featuredProject.technologies && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredProject.technologies.split(',').map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 bg-[var(--accent-color)]/5 text-[var(--accent-color)] text-[10px] md:text-xs font-bold rounded-lg uppercase tracking-wider border border-[var(--accent-color)]/10">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Interação do Destaque */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 text-gray-500">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLikeToggle(featuredProject.id)}
                        className={`flex items-center gap-2 text-xs font-bold transition-all duration-200 hover:scale-105 ${
                          likedProjects.includes(featuredProject.id)
                            ? 'text-rose-500'
                            : 'hover:text-rose-400'
                        }`}
                      >
                        <Heart 
                          size={16} 
                          className={`transition-transform duration-200 ${likedProjects.includes(featuredProject.id) ? 'fill-rose-500 scale-110' : ''}`} 
                        />
                        <span>{featuredProject.likesCount || 0} Curtidas</span>
                      </button>

                      <button
                        onClick={() => handleOpenComments(featuredProject)}
                        className="flex items-center gap-2 text-xs font-bold hover:text-[var(--accent-color)] transition-colors duration-200 hover:scale-105"
                      >
                        <MessageSquare size={16} />
                        <span>{featuredProject.commentsCount || 0} Comentários</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {featuredProject.liveUrl && (
                        <a href={featuredProject.liveUrl} target="_blank" rel="noopener noreferrer" 
                           className="text-xs font-bold uppercase tracking-wider text-[var(--accent-color)] hover:underline flex items-center gap-1">
                          Visitar <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🔍 Seção de Busca e Filtros por Tags */}
        <div className="mb-8 md:mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Campo de Busca */}
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar obras no acervo..." 
                className="input-field pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Carrossel de Badges (Tags) */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 py-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-2">Tags:</span>
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedTag === '' 
                    ? 'bg-[var(--accent-color)] text-black border border-[var(--accent-color)]' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                }`}
              >
                Todas
              </button>
              {allTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    tag.toLowerCase() === selectedTag.toLowerCase()
                      ? 'bg-[var(--accent-color)] text-black border border-[var(--accent-color)]' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grade de Obras Regulares */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {regularProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              className="group relative tilt-card-wrapper"
            >
              <div 
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="tilt-card glass-panel relative overflow-hidden border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-2xl"
              >
                <div className="tilt-card-glare" />

                <div className="relative h-40 md:h-44 overflow-hidden">
                  {/* Status do Projeto */}
                  {project.status && project.status !== 'none' && (
                    <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                      {project.status === 'testing' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[#1a1202] text-yellow-400 border border-yellow-500/20 shadow-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse mr-1" />
                          Em Testes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[#021c10] text-emerald-400 border border-emerald-500/20 shadow-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
                          Pronto
                        </span>
                      )}
                    </div>
                  )}

                  {/* Destaque Tag (caso apareça nos filtros) */}
                  {project.isFeatured && (
                    <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[var(--accent-color)]/20 text-[var(--accent-color)] border border-[var(--accent-color)]/20 shadow-md">
                        <Star size={8} className="fill-[var(--accent-color)] mr-1" />
                        Destaque
                      </span>
                    </div>
                  )}

                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gray-900/50 flex items-center justify-center">
                      <Code2 size={40} className="text-gray-800" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10">
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[var(--accent-color)] text-black rounded-full hover:scale-110 transition-transform shadow-lg shadow-[var(--accent-glow)]">
                        <ExternalLink size={20} />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 text-white rounded-full hover:bg-white/20 hover:scale-110 transition-transform border border-white/10">
                        <Code2 size={20} />
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="p-5 relative z-10">
                  <h3 className="text-base md:text-lg font-bold text-[var(--accent-color)] mb-2 truncate">{project.title}</h3>
                  <p className="text-gray-400 text-[11px] md:text-xs line-clamp-2 mb-4 leading-relaxed">{project.description}</p>
                  
                  {project.technologies && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.split(',').map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[var(--accent-color)]/5 text-[var(--accent-color)]/80 text-[9px] md:text-[10px] font-bold rounded uppercase tracking-tighter border border-[var(--accent-color)]/10">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Interaction bar (likes and comments) */}
                  <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/5 text-gray-500">
                    <button
                      onClick={() => handleLikeToggle(project.id)}
                      className={`flex items-center gap-1.5 text-[10px] md:text-xs font-bold transition-all duration-200 hover:scale-105 ${
                        likedProjects.includes(project.id)
                          ? 'text-rose-500'
                          : 'hover:text-rose-400'
                      }`}
                    >
                      <Heart 
                        size={13} 
                        className={`transition-transform duration-200 ${likedProjects.includes(project.id) ? 'fill-rose-500 scale-110' : ''}`} 
                      />
                      <span>{project.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() => handleOpenComments(project)}
                      className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold hover:text-[var(--accent-color)] transition-colors duration-200 hover:scale-105"
                    >
                      <MessageSquare size={13} />
                      <span>{project.commentsCount || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {regularProjects.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-gray-600"
          >
            <p className="text-sm">Nenhuma obra no acervo corresponde aos filtros de busca.</p>
          </motion.div>
        )}
      </main>

      <footer className="w-full py-4 text-center text-xs text-gray-600 border-t border-white/5 max-w-6xl mx-auto px-4 md:px-6">
        <p>&copy; {new Date().getFullYear()} Hub de Projetos. Todos os direitos reservados ao Imperador.</p>
      </footer>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      <AnonymousChat visitorIp={visitorIp} />

      <ProjectCommentsModal
        isOpen={isCommentsOpen}
        onClose={() => {
          setIsCommentsOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />
    </div>
  );
};

export default HubPage;

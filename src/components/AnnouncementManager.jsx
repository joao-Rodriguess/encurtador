import React, { useState, useEffect } from 'react';
import { 
  createAnnouncement, 
  deleteAnnouncement, 
  subscribeToAnnouncements, 
  activateAnnouncement, 
  deactivateAnnouncement 
} from '../firebase/firestore';
import { 
  Megaphone, 
  PlusCircle, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  ExternalLink, 
  Sparkles,
  Loader2,
  CheckCircle,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ctaText: '',
    ctaUrl: '',
    theme: 'cyberpunk-amber'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToAnnouncements((data) => {
      setAnnouncements(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    setSubmitting(true);
    setError('');
    setSuccess(false);
    
    try {
      await createAnnouncement({
        ...formData,
        isActive: false // Sempre inicia inativo para o usuário escolher ativar
      });
      
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        ctaText: '',
        ctaUrl: '',
        theme: 'cyberpunk-amber'
      });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Erro ao criar o anúncio.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await deactivateAnnouncement(id);
      } else {
        await activateAnnouncement(id);
      }
    } catch (err) {
      console.error("Erro ao alterar status do anúncio:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja apagar este anúncio permanentemente?')) {
      await deleteAnnouncement(id);
    }
  };

  const getThemePreviewClass = (theme) => {
    switch(theme) {
      case 'sunset-horizon':
        return 'bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 border-pink-500/20';
      case 'neon-emerald':
        return 'bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-500/20';
      case 'electric-indigo':
        return 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 border-indigo-500/20';
      case 'cyberpunk-amber':
      default:
        return 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 border-amber-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
      {/* Formulário de Criação */}
      <div className="lg:col-span-1 glass-panel p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 h-fit">
        <h2 className="text-lg md:text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
          <Megaphone size={18} />
          Proclamar Nova Ideia
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Título do Anúncio</label>
            <input 
              type="text" 
              name="title"
              placeholder="Ex: NOVO SITE EM CONSTRUÇÃO!" 
              required 
              className="input-field"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Mensagem / Ideia</label>
            <textarea 
              name="description"
              placeholder="Descreva a sua ideia inovadora ou novo projeto para engajar seus visitantes..." 
              required 
              className="input-field min-h-[80px]"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Texto do Botão (CTA)</label>
              <input 
                type="text" 
                name="ctaText"
                placeholder="Ex: Ver Código" 
                className="input-field"
                value={formData.ctaText}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Link do Botão</label>
              <input 
                type="url" 
                name="ctaUrl"
                placeholder="https://github.com/..." 
                className="input-field"
                value={formData.ctaUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Tema Visual do Banner</label>
            <select 
              name="theme"
              className="input-field bg-[#06060a] border-white/10 font-bold"
              value={formData.theme}
              onChange={handleChange}
            >
              <option value="cyberpunk-amber">Cyberpunk Amber (Âmbar e Ouro)</option>
              <option value="sunset-horizon">Sunset Horizon (Violeta, Rosa e Laranja)</option>
              <option value="neon-emerald">Neon Emerald (Esmeralda e Teal)</option>
              <option value="electric-indigo">Electric Indigo (Azul e Violeta)</option>
            </select>
          </div>

          {/* Preview Rápido */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider block mb-2">Amostra Visual do Banner</span>
            <div className={`p-4 rounded-lg text-white font-sans ${getThemePreviewClass(formData.theme)} shadow-lg`}>
              <h4 className="text-xs font-black tracking-wide uppercase">{formData.title || 'Seu Título Aqui'}</h4>
              <p className="text-[10px] text-white/90 line-clamp-1 mt-1 leading-relaxed">{formData.description || 'Sua mensagem explicativa de novidade aparecerá nesta área...'}</p>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-sm font-bold mt-2">
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
            <span>{submitting ? 'Divulgando...' : 'Lançar Anúncio'}</span>
          </button>
          
          {success && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 text-center text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <CheckCircle size={14} /> Anúncio registrado nos pergaminhos!
            </motion.p>
          )}
        </form>
      </div>

      {/* Lista de Anúncios */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-lg md:text-xl font-bold text-white px-1 flex items-center gap-2">
          <Eye size={18} className="text-gray-400" />
          Seus Decretos e Novidades
        </h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Megaphone className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Nenhum anúncio criado até o momento. Proclame sua primeira ideia ao lado!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {announcements.map((ann, index) => (
                <motion.div 
                  key={ann.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`group relative border rounded-2xl p-5 bg-white/5 transition-all duration-300 ${
                    ann.isActive 
                    ? 'border-amber-500/50 bg-[#12121a] shadow-lg shadow-amber-500/5' 
                    : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest text-black ${
                          ann.theme === 'sunset-horizon' ? 'bg-pink-500' :
                          ann.theme === 'neon-emerald' ? 'bg-emerald-500' :
                          ann.theme === 'electric-indigo' ? 'bg-indigo-500' :
                          'bg-amber-500'
                        }`}>
                          {ann.theme.replace('-', ' ')}
                        </span>
                        
                        {ann.isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 shadow shadow-amber-500/10">
                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                            ATIVO NO TOPO
                          </span>
                        )}
                      </div>
                      <h3 className="text-base md:text-lg font-black text-white mt-2 leading-tight">
                        {ann.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleActive(ann.id, ann.isActive)}
                        className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                          ann.isActive 
                          ? 'text-amber-500 hover:text-amber-400 bg-amber-500/10' 
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                        title={ann.isActive ? 'Desativar anúncio' : 'Ativar no topo da tela'}
                      >
                        {ann.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(ann.id)} 
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Expurgar Anúncio"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-4">
                    {ann.description}
                  </p>

                  {(ann.ctaText || ann.ctaUrl) && (
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5 text-[11px] font-bold text-gray-500">
                      <span>Chamada para Ação:</span>
                      {ann.ctaUrl ? (
                        <a 
                          href={ann.ctaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1 text-amber-500 hover:underline hover:text-amber-400"
                        >
                          {ann.ctaText || 'Ver Link'}
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-gray-600">{ann.ctaText || 'Sem texto cta'}</span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementManager;

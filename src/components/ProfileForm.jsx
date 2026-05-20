import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile } from '../firebase/firestore';
import { uploadImage } from '../firebase/storage';
import { Save, Loader2, Image as ImageIcon, CheckCircle, Upload, Github, Linkedin, FileText, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileForm = ({ userId }) => {
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [bgFile, setBgFile] = useState(null);
  const [githubLink, setGithubLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile(userId);
        if (profile) {
          if (profile.bgImageUrl) setBgImageUrl(profile.bgImageUrl);
          if (profile.githubLink) setGithubLink(profile.githubLink);
          if (profile.linkedinLink) setLinkedinLink(profile.linkedinLink);
          if (profile.resumeLink) setResumeLink(profile.resumeLink);
          if (profile.whatsappLink) setWhatsappLink(profile.whatsappLink);
        }
      } catch (error) {
        console.error("Erro ao buscar perfil", error);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      let finalUrl = bgImageUrl;
      
      if (bgFile) {
        finalUrl = await uploadImage(bgFile, 'backgrounds');
      }

      await updateProfile(userId, { 
        bgImageUrl: finalUrl,
        githubLink,
        linkedinLink,
        resumeLink,
        whatsappLink
      });
      setBgImageUrl(finalUrl);
      setBgFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar as configurações. Verifique os campos e o arquivo de imagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("O arquivo não pode exceder 2MB para preservar o Firebase Storage!");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setBgFile(file);
    }
  };

  if (fetching) return (
    <div className="flex justify-center py-10">
      <div className="spinner"></div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seção Imagem de Fundo */}
      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">
          Imagem de Fundo do Hub
        </label>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="relative group">
            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={18} />
            <input 
              type="url" 
              name="bgImageUrl"
              placeholder="URL da Imagem..." 
              className="input-field pl-12"
              value={bgImageUrl}
              onChange={(e) => setBgImageUrl(e.target.value)}
              disabled={!!bgFile}
            />
          </div>

          <div className="relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed transition-all ${
                bgFile 
                ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]' 
                : 'border-white/10 hover:border-[var(--accent-color)]/30 text-gray-400'
              }`}
            >
              <Upload size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {bgFile ? bgFile.name : 'Carregar Imagem do PC (Max 2MB)'}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {(bgFile || bgImageUrl) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden border border-white/5 aspect-video shadow-2xl shadow-black/50"
        >
          <img 
            src={bgFile ? URL.createObjectURL(bgFile) : bgImageUrl} 
            alt="Preview" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white text-xs font-bold uppercase tracking-[0.2em] bg-black/50 px-4 py-2 rounded-full border border-white/10">
              Pré-visualização Real
            </span>
          </div>
        </motion.div>
      )}

      {/* Seção Redes Sociais / Linktree Premium */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">
          Links Rápidos (Linktree Premium)
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GitHub */}
          <div className="relative group">
            <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={18} />
            <input 
              type="url" 
              placeholder="Link do GitHub..." 
              className="input-field pl-12"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
            />
          </div>

          {/* LinkedIn */}
          <div className="relative group">
            <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={18} />
            <input 
              type="url" 
              placeholder="Link do LinkedIn..." 
              className="input-field pl-12"
              value={linkedinLink}
              onChange={(e) => setLinkedinLink(e.target.value)}
            />
          </div>

          {/* Currículo PDF */}
          <div className="relative group">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={18} />
            <input 
              type="url" 
              placeholder="Link do Currículo (PDF online)..." 
              className="input-field pl-12"
              value={resumeLink}
              onChange={(e) => setResumeLink(e.target.value)}
            />
          </div>

          {/* WhatsApp */}
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={18} />
            <input 
              type="url" 
              placeholder="Link do WhatsApp (ex: https://wa.me/55...)..." 
              className="input-field pl-12"
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          <span>{loading ? 'Sincronizando...' : 'Salvar Alterações'}</span>
        </button>
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mt-4 text-green-400 font-medium"
          >
            <CheckCircle size={18} />
            <span>Configurações atualizadas com sucesso!</span>
          </motion.div>
        )}
      </div>
    </form>
  );
};

export default ProfileForm;

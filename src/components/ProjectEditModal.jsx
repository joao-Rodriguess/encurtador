import React, { useState, useRef } from 'react';
import { X, Save, Type, Laptop, Info, Link as LinkIcon, Code2, Image as ImageIcon, Upload, Loader2, Sparkles, Star } from 'lucide-react';
import { updateProject } from '../firebase/firestore';
import { uploadImage } from '../firebase/storage';
import { motion } from 'framer-motion';

const ProjectEditModal = ({ project, onClose }) => {
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    technologies: project.technologies || '',
    liveUrl: project.liveUrl || '',
    githubUrl: project.githubUrl || '',
    imageUrl: project.imageUrl || '',
    status: project.status || '',
    isFeatured: project.isFeatured || false
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("O arquivo de imagem não pode exceder 2MB para preservar o Firebase Storage!");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setImageFile(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Título e Descrição são campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalImageUrl = formData.imageUrl;
      
      // Se houver nova imagem selecionada
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, 'projects');
      }

      await updateProject(project.id, {
        ...formData,
        imageUrl: finalImageUrl
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar alterações da obra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0e0e14] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h2 className="text-lg md:text-xl font-bold text-[var(--accent-color)] flex items-center gap-2">
            <Sparkles size={20} />
            Reforjar Obra
          </h2>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Type className="text-[var(--accent-color)]" size={16} />
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Título do Projeto</label>
              </div>
              <input 
                type="text" 
                name="title"
                required 
                className="input-field"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Laptop className="text-[var(--accent-color)]" size={16} />
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tecnologias</label>
              </div>
              <input 
                type="text" 
                name="technologies"
                className="input-field"
                value={formData.technologies}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Sparkles className="text-[var(--accent-color)]" size={16} />
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status do Projeto</label>
              </div>
              <select 
                name="status"
                className="input-field bg-[#06060a] border-white/10"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="">Nenhum (Sem Tag)</option>
                <option value="testing">Fase de Testes (Amarelo)</option>
                <option value="ready">Pronto para Uso (Verde)</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <ImageIcon className="text-[var(--accent-color)]" size={16} />
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Imagem de Capa</label>
              </div>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  name="imageUrl"
                  placeholder="URL da Imagem..." 
                  className="input-field"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  disabled={!!imageFile}
                />
                
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
                  className={`flex items-center justify-center p-3 rounded-lg border-2 border-dashed transition-all whitespace-nowrap ${
                    imageFile 
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]' 
                    : 'border-white/10 hover:border-[var(--accent-color)]/30 text-gray-400'
                  }`}
                  title="Carregar Imagem"
                >
                  <Upload size={18} />
                </button>
              </div>
              {imageFile && (
                <span className="text-[10px] text-[var(--accent-color)] block truncate font-medium">
                  Novo arquivo: {imageFile.name} (Max 2MB)
                </span>
              )}
            </div>
          </div>

          {/* Checkbox Destaque Real */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                <Star size={20} className={formData.isFeatured ? "fill-[var(--accent-color)]" : ""} />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-wider uppercase">Destaque Real (Featured Project)</h4>
                <p className="text-xs text-gray-400">Exiba este projeto no topo do acervo em um painel Hero majestoso.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="isFeatured"
                className="sr-only peer"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Info className="text-[var(--accent-color)]" size={16} />
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Descrição da Obra</label>
            </div>
            <textarea 
              name="description"
              required 
              className="input-field min-h-[100px]"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <LinkIcon className="text-[var(--accent-color)]" size={16} />
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Link de Produção</label>
              </div>
              <input 
                type="url" 
                name="liveUrl"
                className="input-field"
                value={formData.liveUrl}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Code2 className="text-[var(--accent-color)]" size={16} />
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Repositório GitHub</label>
              </div>
              <input 
                type="url" 
                name="githubUrl"
                className="input-field"
                value={formData.githubUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="btn-secondary flex-1 py-3"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary flex-1 py-3 text-sm font-bold"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProjectEditModal;

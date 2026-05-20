import React, { useState, useRef } from 'react';
import { createProject } from '../firebase/firestore';
import { uploadImage } from '../firebase/storage';
import { PlusCircle, Loader2, Type, Laptop, Info, Link as LinkIcon, Code2, Image as ImageIcon, Upload, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectForm = ({ userId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    liveUrl: '',
    githubUrl: '',
    imageUrl: '',
    status: '',
    isFeatured: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    setLoading(true);
    setSuccess(false);
    
    try {
      let finalImageUrl = formData.imageUrl;
      
      // Se houver arquivo selecionado, faz upload primeiro
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, 'projects');
      }

      await createProject(userId, {
        ...formData,
        imageUrl: finalImageUrl
      });

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        technologies: '',
        liveUrl: '',
        githubUrl: '',
        imageUrl: '',
        status: '',
        isFeatured: false
      });

      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert('Erro ao criar projeto. Verifique se o arquivo é uma imagem válida.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Type className="text-[var(--accent-color)]" size={16} />
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Título do Projeto</label>
          </div>
          <input 
            type="text" 
            name="title"
            placeholder="Ex: Meu App Incrível" 
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
            placeholder="Ex: React, Node, Tailwind" 
            className="input-field"
            value={formData.technologies}
            onChange={handleChange}
          />
        </div>

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
          placeholder="Conte os detalhes desta criação..." 
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
            placeholder="https://meuapp.com" 
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
            placeholder="https://github.com/usuario/repo" 
            className="input-field"
            value={formData.githubUrl}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <ImageIcon className="text-[var(--accent-color)]" size={16} />
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Imagem de Capa</label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input 
              type="url" 
              name="imageUrl"
              placeholder="URL da Imagem..." 
              className="input-field pr-10"
              value={formData.imageUrl}
              onChange={handleChange}
              disabled={!!imageFile}
            />
            {formData.imageUrl && <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--accent-color)]/50" size={16} />}
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
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-dashed transition-all ${
                imageFile 
                ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]' 
                : 'border-white/10 hover:border-[var(--accent-color)]/30 text-gray-400'
              }`}
            >
              <Upload size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {imageFile ? imageFile.name : 'Carregar do PC (Max 2MB)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg font-bold mt-2">
        {loading ? <Loader2 className="animate-spin" size={24} /> : <PlusCircle size={24} />}
        <span>{loading ? 'Sincronizando...' : 'Adicionar ao Hub'}</span>
      </button>
      
      {success && (
        <motion.p 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-400 text-center text-sm font-medium"
        >
          Obra imortalizada com sucesso!
        </motion.p>
      )}
    </form>
  );
};

export default ProjectForm;

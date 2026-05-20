import React, { useEffect, useState } from 'react';
import { subscribeToProjects, deleteProject } from '../firebase/firestore';
import { Trash2, Edit3, ExternalLink, Code2, Layers, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectEditModal from './ProjectEditModal';

const ProjectList = ({ userId }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToProjects((data) => {
      const myProjects = data.filter(p => p.userId === userId);
      setProjects(myProjects);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [userId]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja apagar esta obra?')) {
      await deleteProject(id);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="spinner"></div>
    </div>
  );

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white/5 rounded-3xl border border-dashed border-white/10">
        <Layers className="mx-auto text-gray-700 mb-4" size={48} />
        <p className="text-gray-500 font-medium">Vosso acervo ainda aguarda a primeira grande obra.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnimatePresence>
        {projects.map((project, index) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="group relative glass-panel p-5 border border-white/5 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 rounded-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base md:text-lg font-bold text-amber-500 truncate group-hover:text-amber-400 transition-colors">
                    {project.title}
                  </h3>
                  {project.status === 'testing' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                      Testes
                    </span>
                  )}
                  {project.status === 'ready' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      Pronto
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                  {project.technologies || 'Sem tecnologias listadas'}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => setEditingProject(project)} 
                  className="p-2 text-gray-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                  title="Reforjar Obra"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(project.id)} 
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Expurgar Obra"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed">
              {project.description}
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              {project.liveUrl && (
                <a 
                  href={project.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
                >
                  <ExternalLink size={14} />
                  VISUALIZAR
                </a>
              )}
              {project.githubUrl && (
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  <Code2 size={14} />
                  CÓDIGO
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {editingProject && (
          <ProjectEditModal 
            project={editingProject} 
            onClose={() => setEditingProject(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectList;

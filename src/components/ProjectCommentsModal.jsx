import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, MessageSquare } from 'lucide-react';
import { sendProjectComment, subscribeToProjectComments } from '../firebase/firestore';

const ProjectCommentsModal = ({ isOpen, onClose, project }) => {
  const [comments, setComments] = useState([]);
  const [authorName, setAuthorName] = useState('');
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const commentsEndRef = useRef(null);

  // Carregar ou definir apelido salvo localmente
  useEffect(() => {
    const savedName = localStorage.getItem('anonymous_username');
    if (savedName) {
      setAuthorName(savedName);
    }
  }, []);

  // Escutar comentários específicos deste projeto em tempo real
  useEffect(() => {
    if (!isOpen || !project?.id) return;

    const unsubscribe = subscribeToProjectComments(project.id, (data) => {
      setComments(data);
    });

    return () => unsubscribe();
  }, [isOpen, project]);

  // Rolar para o final do feed sempre que carregar comentários
  useEffect(() => {
    if (comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !text.trim() || isSending) return;

    setIsSending(true);
    // Salvar o apelido localmente para o futuro
    localStorage.setItem('anonymous_username', authorName.trim());

    const commentData = {
      authorName: authorName.trim(),
      text: text.trim(),
    };

    const success = await sendProjectComment(project.id, project.title, commentData);
    setIsSending(false);

    if (success) {
      setText('');
    }
  };

  // Cores procedurais para o avatar do usuário com base no apelido
  const getAvatarBg = (name) => {
    const colors = [
      'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop / Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-lg h-[550px] flex flex-col glass-panel rounded-2xl border border-white/10 bg-[#0c0c12]/95 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white leading-tight">
                  Comentários
                </h3>
                <p className="text-[10px] md:text-xs text-amber-500 font-medium truncate max-w-[280px] sm:max-w-sm">
                  {project.title}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Comments List (Scrollable Area) */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {comments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-6">
                <MessageSquare size={36} className="text-gray-700 mb-3 animate-bounce" />
                <p className="text-xs">Nenhum comentário ainda nesta obra.</p>
                <p className="text-[10px] text-gray-600 mt-1">Seja o primeiro a deixar vosso palpite imperial!</p>
              </div>
            ) : (
              comments.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  {/* Procedural Avatar */}
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 ${getAvatarBg(c.authorName)}`}>
                    {c.authorName.charAt(0)}
                  </div>
                  
                  {/* Comment Bubble */}
                  <div className="flex-grow bg-white/5 rounded-xl px-3.5 py-2.5 border border-white/5 max-w-[85%]">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                        {c.authorName}
                      </span>
                      <span className="text-[9px] text-gray-500">
                        {c.timestamp?.toMillis ? new Date(c.timestamp.toMillis()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Recém-enviado'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
                      {c.text}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Form input at the bottom */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-[#0e0e15]/98 flex flex-col gap-3">
            {/* Nickname input (only if they don't have a saved one or they want to edit it) */}
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <User size={13} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Seu Apelido Anônimo"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Message input */}
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Escreva um comentário real..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-grow text-xs px-3.5 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={isSending || !authorName.trim() || !text.trim()}
                className="px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:shadow-none text-black rounded-lg transition-all duration-200 shadow-md shadow-amber-500/10 flex items-center justify-center font-bold text-xs"
              >
                {isSending ? (
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={13} />
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProjectCommentsModal;

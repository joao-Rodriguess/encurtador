import React, { useState, useEffect, useRef } from 'react';
import { subscribeToComments, sendComment } from '../firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, ChevronDown } from 'lucide-react';

const AnonymousChat = ({ visitorIp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [clientId, setClientId] = useState('');
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Inicializar o identificador único local para destacar as próprias mensagens
  useEffect(() => {
    let id = localStorage.getItem('chat_client_id');
    if (!id) {
      id = `client_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('chat_client_id', id);
    }
    setClientId(id);

    // Carregar nome salvo anteriormente para conveniência
    const savedName = localStorage.getItem('chat_visitor_name');
    if (savedName) {
      setName(savedName);
    }
  }, []);

  // Escutar comentários em tempo real
  useEffect(() => {
    const unsubscribe = subscribeToComments((data) => {
      setComments(data);
      
      // Se o chat estiver fechado, alertar o usuário de novas mensagens
      if (!isOpen && data.length > 0) {
        setHasNewMessages(true);
      }
    });

    return () => unsubscribe();
  }, [isOpen]);

  // Autoscroll ao receber novas mensagens
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    const finalName = name.trim() || `Visitante Anônimo #${clientId.slice(-4).toUpperCase()}`;

    // Salvar o nome preferido localmente
    if (name.trim()) {
      localStorage.setItem('chat_visitor_name', name.trim());
    }

    const commentData = {
      name: finalName,
      message: message.trim(),
      clientId,
      ip: visitorIp || 'Desconhecido',
      userAgent: navigator.userAgent
    };

    const success = await sendComment(commentData);
    if (success) {
      setMessage('');
    }
    setIsSending(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Agora';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {/* Painel do Chat Aberto */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="glass-panel w-[340px] sm:w-[380px] h-[500px] rounded-2xl border border-white/10 bg-[#0d0d15]/95 shadow-2xl flex flex-col overflow-hidden mb-4 backdrop-blur-xl"
          >
            {/* Cabeçalho */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h4 className="text-sm font-black tracking-wide text-white uppercase">Chat do Acervo</h4>
                  <p className="text-[10px] text-gray-500">Deixe seu comentário em tempo real</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors border border-white/5"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mensagens */}
            <div 
              ref={messagesContainerRef}
              className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="p-3 bg-amber-500/5 rounded-full border border-amber-500/10">
                    <MessageSquare className="text-amber-500/50" size={24} />
                  </div>
                  <p className="text-xs font-bold text-gray-400">Silêncio Imperial...</p>
                  <p className="text-[10px] text-gray-600 max-w-[200px]">
                    Ninguém comentou ainda. Seja o primeiro a saudar as obras!
                  </p>
                </div>
              ) : (
                comments.map((comment) => {
                  const isMine = comment.clientId === clientId;
                  return (
                    <div
                      key={comment.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`flex items-center gap-1.5 mb-1 text-[10px] text-gray-500 ${isMine ? 'flex-row-reverse' : ''}`}>
                        <span className="font-bold text-gray-400">{comment.name}</span>
                        <span>•</span>
                        <span>{formatTime(comment.timestamp)}</span>
                      </div>
                      
                      <div
                        className={`px-3.5 py-2 rounded-2xl text-xs max-w-[85%] break-words leading-relaxed border ${
                          isMine
                            ? 'bg-amber-500/15 border-amber-500/20 text-amber-200 rounded-tr-none'
                            : 'bg-white/5 border-white/5 text-gray-200 rounded-tl-none'
                        }`}
                      >
                        {comment.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Formulário de Envio */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-[#0a0a0f]/50 space-y-3">
              {/* Apelido Opcional */}
              <div className="relative">
                <User className="absolute left-2.5 top-2 text-gray-500" size={12} />
                <input
                  type="text"
                  placeholder="Seu nome (opcional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={25}
                  className="w-full text-[11px] bg-white/5 border border-white/5 rounded-lg py-1.5 pl-7 pr-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/30 transition-colors"
                />
              </div>

              {/* Mensagem */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escreva sua mensagem real..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={150}
                  className="flex-grow text-xs bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/30 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isSending}
                  className="p-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-800 disabled:text-gray-600 text-black rounded-lg transition-all flex items-center justify-center shadow-lg shadow-amber-500/10 hover:scale-105 active:scale-95"
                >
                  <Send size={14} className={isSending ? 'animate-pulse' : ''} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Flutuante (Bolinha do Chat) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewMessages(false);
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center relative shadow-2xl transition-all border ${
          isOpen 
            ? 'bg-[#0d0d15] text-amber-500 border-white/10' 
            : 'bg-amber-500 text-black hover:bg-amber-600 border-amber-500/10'
        }`}
      >
        {isOpen ? <ChevronDown size={24} /> : <MessageSquare size={24} />}
        
        {/* Sinalizador de Nova Mensagem */}
        {!isOpen && hasNewMessages && (
          <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border border-white/20"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default AnonymousChat;

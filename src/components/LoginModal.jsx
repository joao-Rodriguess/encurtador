import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, loginWithGoogle } from '../firebase/auth';
import { db } from '../firebase/firestore'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Globe, UserPlus, AlertCircle, Cpu, X, ShieldCheck, Send } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = (await loginWithEmail(email, password)).user;
        const ADMIN_EMAILS = ['pj.pompeia.11@gmail.com', 'imperador@gmail.com'];
        const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || user.email === 'imperador@gmail.com');

        if (isAdmin) {
          navigate('/admin');
        } else {
          setError('Apenas Vossa Majestade tem permissão de acesso.');
        }
      } else {
        try {
          await addDoc(collection(db, 'access_requests'), {
            email,
            password, 
            requestedAt: serverTimestamp(),
            status: 'pending'
          });

          const formData = new FormData();
          formData.append('email', email);
          formData.append('password', password);
          formData.append('_subject', '👑 NOVA SOLICITAÇÃO DE ACESSO AO HUB');
          formData.append('_captcha', 'false');
          formData.append('_template', 'table');

          await fetch('https://formsubmit.co/ajax/pj.pompeia.11@gmail.com', {
            method: 'POST',
            body: formData
          });
          
          alert('Vossa petição foi enviada aos ouvidos do Imperador. Aguarde o veredito real.');
          setIsLogin(true);
          setEmail('');
          setPassword('');
        } catch (mailErr) {
          console.error("Erro no envio:", mailErr);
          alert('Petição registrada no acervo real. O Imperador analisará vosso pedido em breve.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email ou senha inválidos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está cadastrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro na câmara de autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const user = (await loginWithGoogle()).user;
      const ADMIN_EMAILS = ['pj.pompeia.11@gmail.com', 'imperador@gmail.com'];
      const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || user.email === 'imperador@gmail.com');

      if (isAdmin) {
        navigate('/admin');
      } else {
        setError('Identidade não reconhecida pelo conselho real.');
      }
    } catch (err) {
      setError(`Erro no portal Google: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl z-10"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <motion.div
                key={isLogin ? 'login-icon' : 'request-icon'}
                initial={{ rotate: -20, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="inline-flex p-4 bg-amber-500/10 rounded-2xl mb-4"
              >
                {isLogin ? <ShieldCheck className="text-amber-500" size={32} /> : <Send className="text-amber-500" size={32} />}
              </motion.div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isLogin ? 'Aposentos Reais' : 'Petição de Acesso'}
              </h2>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Mail className="text-amber-500" size={16} />
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">E-mail Real</label>
                </div>
                <input
                  type="email"
                  placeholder="Seu e-mail oficial"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Lock className="text-amber-500" size={16} />
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Senha Secreta</label>
                </div>
                <input
                  type="password"
                  placeholder="Sua chave de acesso"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary w-full py-4 text-lg font-bold mt-4" disabled={loading}>
                {loading ? (
                  <div className="spinner h-5 w-5 border-2"></div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {isLogin ? <LogIn size={20} /> : <Send size={20} />}
                    <span>{isLogin ? 'Acessar' : 'Enviar Petição'}</span>
                  </div>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0e0e14] px-4 text-gray-500 tracking-widest font-semibold">ou</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleAuth} 
              className="btn-secondary w-full py-3.5 flex items-center justify-center gap-3 font-bold" 
              disabled={loading}
            >
              <Globe size={18} className="text-amber-500" />
              <span>Entrar com Google</span>
            </button>

            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-gray-500 hover:text-amber-500 text-sm font-bold transition-all uppercase tracking-wider"
              >
                {isLogin ? 'Solicitar Acesso Real' : 'Voltar ao Login'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;

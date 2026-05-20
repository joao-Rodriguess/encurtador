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

          // Disparo de e-mail imperial seguro via extensão Trigger Email do Firebase (Coleção 'mail')
          await addDoc(collection(db, 'mail'), {
            to: 'pj.pompeia.11@gmail.com',
            message: {
              subject: '👑 NOVA SOLICITAÇÃO DE ACESSO AO HUB',
              text: `Saudações, Soberano. Uma nova petição de acesso foi apresentada aos portões do reino.\n\nE-mail do Requerente: ${email}\nSenha Proposta: ${password}\n\nQue a vossa sabedoria prevaleça.`,
              html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0d12; color: #f3f4f6; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #d97706; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                  <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid rgba(217, 119, 6, 0.2); padding-bottom: 20px;">
                    <span style="font-size: 40px;">👑</span>
                    <h1 style="color: #f59e0b; margin: 10px 0 0 0; font-size: 26px; letter-spacing: 2px; text-transform: uppercase;">Petição Imperial</h1>
                    <p style="color: #9ca3af; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Solicitação de Ingresso aos Aposentos Reais</p>
                  </div>
                  
                  <div style="background-color: rgba(217, 119, 6, 0.05); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Mensagem do Guarda da Muralha:</p>
                    <p style="margin: 0; font-size: 16px; font-style: italic; line-height: 1.6; color: #e5e7eb;">"Saudações, Soberano. Um novo viajante bateu aos portões do vosso santuário privado, suplicando por permissão para adentrar os aposentos da realeza."</p>
                  </div>
                  
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                      <tr>
                        <th colspan="2" style="text-align: left; padding: 10px; background-color: #1a1b23; color: #f59e0b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px 6px 0 0;">Detalhes da Credencial</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 15px; color: #9ca3af; font-size: 14px; width: 35%;">E-mail do Requerente:</td>
                        <td style="padding: 15px; color: #ffffff; font-size: 15px; font-weight: bold; word-break: break-all;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 15px; color: #9ca3af; font-size: 14px;">Chave Fornecida:</td>
                        <td style="padding: 15px; color: #ffffff; font-size: 15px; font-family: monospace; background-color: rgba(0,0,0,0.2); border-radius: 4px;">${password}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
                    <p style="font-size: 13px; color: #6b7280; margin: 0;">Esta mensagem foi enviada de forma segura e direta através da extensão Trigger Email do Firebase do vosso império digital.</p>
                    <p style="font-size: 12px; color: #d97706; margin-top: 5px; font-weight: bold;">© Encurtador Imperial - Todos os Direitos Reservados à Coroa</p>
                  </div>
                </div>
              `
            }
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

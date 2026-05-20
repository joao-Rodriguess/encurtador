import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../firebase/auth';
import { Mail, Lock, LogIn, Globe, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
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
      let user;
      if (isLogin) {
        user = (await loginWithEmail(email, password)).user;
      } else {
        user = (await registerWithEmail(email, password)).user;
      }
      
      const ADMIN_EMAILS = ['pj.pompeia.11@gmail.com', 'imperador@gmail.com'];
      const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || user.email === 'imperador@gmail.com');

      if (isAdmin) {
        navigate('/admin');
      } else {
        setError('Apenas Vossa Majestade tem permissão de acesso.');
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
        setError('Acesso negado. Apenas o Imperador possui a chave dos aposentos.');
      }
    } catch (err) {
      setError(`Erro ao autenticar com o Google: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card glass-panel p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl max-w-md w-full text-center"
      >
        <div className="inline-flex p-4 bg-amber-500/10 rounded-2xl mb-4">
          <ShieldCheck className="text-amber-500" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Aposentos Reais</h1>
        <p className="text-gray-400 text-sm mb-8">Apenas pessoas autorizadas (Vossa Majestade).</p>
        
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
        
        <form onSubmit={handleAuth} className="space-y-6 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Mail className="text-amber-500" size={16} />
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">E-mail</label>
            </div>
            <input
              type="email"
              placeholder="Seu e-mail"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Lock className="text-amber-500" size={16} />
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Senha</label>
            </div>
            <input
              type="password"
              placeholder="Sua senha"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="btn-primary w-full py-4 text-lg font-bold mt-4" disabled={loading}>
            {loading ? (
              <div className="spinner h-5 w-5 border-2"></div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <LogIn size={20} />
                <span>{isLogin ? 'Entrar' : 'Cadastrar'}</span>
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
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

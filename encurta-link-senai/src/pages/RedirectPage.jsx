import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLinkByCode, incrementClicks } from '../firebase/firestore';

const RedirectPage = () => {
  const { code } = useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const linkDoc = await getLinkByCode(code);
        
        if (linkDoc) {
          // Tenta incrementar os cliques, mas não bloqueia o redirecionamento se falhar
          try {
            await incrementClicks(linkDoc.id);
          } catch (incrementErr) {
            console.error('Erro ao incrementar cliques:', incrementErr);
          }
          // Redireciona imediatamente
          window.location.href = linkDoc.originalUrl;
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error redirecting:', err);
        setError(true);
      }
    };

    handleRedirect();
  }, [code]);

  if (error) {
    return (
      <div className="redirect-container" style={{backgroundColor: '#0a0a0f', color: '#e2e8f0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <h1 className="error-title">Link não encontrado</h1>
        <p className="error-desc">O link que você está tentando acessar não existe ou foi removido.</p>
        <Link to="/" className="btn-primary">Voltar para o Início</Link>
      </div>
    );
  }

  return (
    <div className="redirect-container" style={{backgroundColor: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div className="spinner" style={{width: 50, height: 50, borderWidth: 4}}></div>
    </div>
  );
};

export default RedirectPage;

import React, { useState } from 'react';
import { Link } from 'lucide-react';
import { createShortLink } from '../firebase/firestore';

const LinkForm = ({ userId }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!url) return;

    if (!isValidUrl(url)) {
      setError('Por favor, insira uma URL válida (ex: https://site.com)');
      return;
    }

    setLoading(true);
    try {
      await createShortLink(userId, url);
      setSuccess(true);
      setUrl('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Erro detalhado ao salvar no Firebase:", err);
      setError(`Erro do Firebase: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="link-form-container">
      <form onSubmit={handleSubmit} className="link-form">
        <input
          type="text"
          className="input-field"
          placeholder="Cole seu link longo aqui..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading || !url}>
          {loading ? <div className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></div> : <Link size={18} />}
          Encurtar
        </button>
      </form>
      {error && <div className="error-message" style={{marginTop: '0.5rem', textAlign: 'left'}}>{error}</div>}
      {success && <div className="success-message">Link encurtado com sucesso!</div>}
    </div>
  );
};

export default LinkForm;

import React, { useState } from 'react';
import { Link } from 'lucide-react';
import { createShortLink } from '../firebase/firestore';

const LinkForm = ({ userId }) => {
  const [url, setUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
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
    
    // Process tags: split by comma, trim spaces, remove empty and duplicate tags
    const tagsArray = Array.from(
      new Set(
        tagsInput
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      )
    );

    try {
      await createShortLink(userId, url, tagsArray);
      setSuccess(true);
      setUrl('');
      setTagsInput('');
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
      <form onSubmit={handleSubmit} className="link-form" style={{ flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Cole seu link longo aqui..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            style={{ flex: '1 1 300px' }}
          />
          <button type="submit" className="btn-primary" disabled={loading || !url} style={{ flex: '0 0 auto' }}>
            {loading ? <div className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></div> : <Link size={18} />}
            Encurtar
          </button>
        </div>
        
        <input
          type="text"
          className="input-field"
          placeholder="Tags (separadas por vírgula, ex: React, Firebase, Portfolio)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          disabled={loading}
          style={{ width: '100%' }}
        />
      </form>
      {error && <div className="error-message" style={{marginTop: '0.5rem', textAlign: 'left'}}>{error}</div>}
      {success && <div className="success-message">Link encurtado com sucesso!</div>}
    </div>
  );
};

export default LinkForm;

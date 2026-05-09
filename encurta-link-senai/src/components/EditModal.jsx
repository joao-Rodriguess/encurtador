import React, { useState } from 'react';
import { X, Save, Globe, Link as LinkIcon } from 'lucide-react';
import { updateFullLink } from '../firebase/firestore';

const EditModal = ({ link, onClose }) => {
  const [url, setUrl] = useState(link.originalUrl);
  const [shortCode, setShortCode] = useState(link.shortCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!url || !shortCode) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      new URL(url);
    } catch (_) {
      setError('Insira uma URL válida (ex: https://site.com)');
      return;
    }

    setLoading(true);
    try {
      await updateFullLink(link.id, url, shortCode, link.shortCode);
      onClose();
    } catch (err) {
      console.error('DETALHES DO ERRO FIREBASE:', err);
      setError(`Erro: ${err.code || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-pop">
        <div className="modal-header">
          <h2>Editar Link</h2>
          <button onClick={onClose} className="btn-icon" disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          <div className="input-group">
            <label><Globe size={16} /> URL Original</label>
            <input
              type="text"
              className="input-field"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemplo.com"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label><LinkIcon size={16} /> Código Encurtado (Customizado)</label>
            <input
              type="text"
              className="input-field"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              placeholder="meu-link"
              disabled={loading}
              maxLength={20}
            />
            <small>Apenas letras, números, - e _ (máx 20 caracteres)</small>
          </div>

          {error && <div className="error-message" style={{marginTop: '1rem'}}>{error}</div>}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <div className="spinner" style={{width: 18, height: 18, borderWidth: 2}}></div> : <Save size={18} />}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;

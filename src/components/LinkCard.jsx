import React, { useState } from 'react';
import { Copy, Trash2, BarChart2, Edit2 } from 'lucide-react';
import { deleteLink } from '../firebase/firestore';
import EditModal from './EditModal';

const LinkCard = ({ link }) => {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const shortUrl = `${window.location.origin}/r/${link.shortCode}`;
  
  // Format date in pt-BR
  const formattedDate = link.createdAt 
    ? new Date(link.createdAt.seconds * 1000).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'Agora mesmo';

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este link?')) {
      setDeleting(true);
      try {
        await deleteLink(link.id);
      } catch (err) {
        console.error('Erro ao deletar:', err);
        setDeleting(false);
      }
    }
  };

  if (deleting) return null;

  return (
    <>
      <div className="link-card">
        <div className="card-header">
          <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="original-url" title={link.originalUrl}>
            {link.originalUrl}
          </a>
          
          <div className="card-actions">
            <button onClick={() => setShowEditModal(true)} className="btn-icon" title="Editar Link">
              <Edit2 size={18} />
            </button>
            <button onClick={handleCopy} className="btn-icon" title="Copiar Link">
              {copied ? <span style={{fontSize: '0.875rem', color: '#10b981'}}>Copiado!</span> : <Copy size={18} />}
            </button>
            <button onClick={handleDelete} className="btn-danger" title="Excluir">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="short-url">
          {shortUrl.replace(/^https?:\/\//, '')}
        </a>
        
        <div className="card-footer">
          <div className="card-stats">
            <div className="stat-item" title="Cliques">
              <BarChart2 size={16} />
              <span>{link.clicks} cliques</span>
            </div>
          </div>
          <div className="card-stats">
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditModal 
          link={link} 
          onClose={() => setShowEditModal(false)} 
        />
      )}
    </>
  );
};

export default LinkCard;

import React, { useEffect, useState } from 'react';
import { subscribeToUserLinks } from '../firebase/firestore';
import LinkCard from './LinkCard';
import { Link2Off } from 'lucide-react';

const LinkList = ({ userId }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = subscribeToUserLinks(userId, (updatedLinks) => {
      setLinks(updatedLinks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Se os links atualizarem, garantimos que se a tag selecionada não existir mais, ela é resetada
  useEffect(() => {
    if (selectedTag) {
      const tagExists = links.some(link => link.tags && link.tags.includes(selectedTag));
      if (!tagExists) {
        setSelectedTag(null);
      }
    }
  }, [links, selectedTag]);

  if (loading) {
    return <div className="flex-center" style={{padding: '2rem'}}><div className="spinner"></div></div>;
  }

  if (links.length === 0) {
    return (
      <div className="empty-state">
        <Link2Off size={48} className="empty-icon" />
        <h3>Nenhum link encontrado</h3>
        <p>Você ainda não encurtou nenhum link. Comece agora preenchendo o formulário acima!</p>
      </div>
    );
  }

  // Extrair todas as tags únicas de todos os links para a barra de filtros (sem tags repetidas)
  const allTags = Array.from(
    new Set(
      links.flatMap(link => link.tags || [])
    )
  )
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .sort((a, b) => a.localeCompare(b)); // Ordenar alfabeticamente para melhor UX

  const hasTags = allTags.length > 0;

  // Filtrar links correspondentes (se dois projetos compartilharem a tag, ambos são exibidos)
  const filteredLinks = selectedTag
    ? links.filter(link => link.tags && link.tags.includes(selectedTag))
    : links;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {hasTags && (
        <div className="filters-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
          <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>Filtrar por Tags</h4>
          <div className="filter-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedTag(null)}
              style={{
                backgroundColor: selectedTag === null ? 'var(--accent-color)' : 'var(--surface-color)',
                color: selectedTag === null ? '#ffffff' : 'var(--text-main)',
                border: `1px solid ${selectedTag === null ? 'var(--accent-color)' : 'var(--border-color)'}`,
                fontSize: '0.875rem',
                padding: '0.375rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              Todos ({links.length})
            </button>
            {allTags.map((tag, idx) => {
              const count = links.filter(link => link.tags && link.tags.includes(tag)).length;
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--surface-color)',
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    fontSize: '0.875rem',
                    padding: '0.375rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  {tag} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filteredLinks.length === 0 ? (
        <div className="empty-state">
          <Link2Off size={48} className="empty-icon" />
          <h3>Nenhum link encontrado para esta tag</h3>
          <p>Tente selecionar outro filtro ou adicione novos links com esta tag.</p>
        </div>
      ) : (
        <div className="link-list">
          {filteredLinks.map(link => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkList;

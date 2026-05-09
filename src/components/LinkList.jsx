import React, { useEffect, useState } from 'react';
import { subscribeToUserLinks } from '../firebase/firestore';
import LinkCard from './LinkCard';
import { Link2Off } from 'lucide-react';

const LinkList = ({ userId }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = subscribeToUserLinks(userId, (updatedLinks) => {
      setLinks(updatedLinks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

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

  return (
    <div className="link-list">
      {links.map(link => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  );
};

export default LinkList;

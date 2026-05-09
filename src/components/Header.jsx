import React from 'react';
import { LogOut } from 'lucide-react';
import { logout } from '../firebase/auth';

const Header = ({ user }) => {
  return (
    <header className="header">
      <div className="container header-content">
        <h1 className="header-title">Encurta Link Senai</h1>
        <div className="header-user">
          <span className="header-email">{user?.email}</span>
          <button onClick={logout} className="btn-secondary" title="Sair">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

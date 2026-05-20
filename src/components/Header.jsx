import React from 'react';
import { LogOut, LayoutGrid, User } from 'lucide-react';
import { logout } from '../firebase/auth';

const Header = ({ user }) => {
  return (
    <header className="header bg-[#0e0e14]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LayoutGrid className="text-amber-500" size={20} />
          <h1 className="text-sm md:text-base font-bold text-white tracking-widest uppercase hidden sm:block">Admin Real</h1>
          <h1 className="text-xs font-bold text-white tracking-widest uppercase sm:hidden">Admin</h1>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <a href="/" className="text-[10px] md:text-xs text-gray-500 hover:text-amber-500 font-bold uppercase transition-colors">Portfólio</a>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 max-w-[120px] md:max-w-none">
            <User size={14} className="text-amber-500 shrink-0" />
            <span className="text-[10px] md:text-xs text-gray-400 truncate hidden md:block">{user?.email}</span>
            <span className="text-[10px] text-gray-400 truncate md:hidden">Vossa Majestade</span>
          </div>

          <button 
            onClick={logout} 
            className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon, Bell, Search } from 'lucide-react';

export function TopBar() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search financial data streams..."
            className="w-full bg-card/40 border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button className="p-2 text-slate-500 hover:text-primary hover:bg-white/5 rounded-lg transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-background" />
        </button>
        
        <div className="h-8 w-px bg-border mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-none">{user?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{user?.email}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30 shadow-lg shadow-primary/10">
            {user?.email?.[0].toUpperCase()}
          </div>
          <button 
            onClick={signOut}
            className="p-2 text-slate-500 hover:text-error hover:bg-error/10 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

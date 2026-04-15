import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon, Bell, Search } from 'lucide-react';

export function TopBar() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative group">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-all duration-300 group-focus-within:text-primary group-focus-within:drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" 
            size={18} 
          />
          <input 
            type="text"
            placeholder="Search financial data streams..."
            className="w-full bg-card/40 border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button 
          type="button"
          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 active:scale-90 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] relative group"
        >
          <Bell size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-background shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        </button>
        
        <div className="h-8 w-px bg-border mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-none">{user?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{user?.email}</p>
          </div>
          <button 
            type="button"
            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30 shadow-lg shadow-primary/10 hover:shadow-primary/30 hover:border-primary/50 transition-all duration-300 active:scale-90 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">{user?.email?.[0].toUpperCase()}</span>
          </button>
          <button 
            type="button"
            onClick={signOut}
            className="p-2 text-slate-500 hover:text-error hover:bg-error/10 rounded-xl transition-all duration-300 active:scale-90 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] group"
            title="Logout"
          >
            <LogOut size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </button>
        </div>
      </div>
    </header>
  );
}

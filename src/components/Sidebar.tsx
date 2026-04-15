import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  PieChart, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  BarChart3,
  Receipt,
  Menu,
  X,
  Calendar,
  Zap,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';

export type Section = 'dashboard' | 'net-worth' | 'transactions' | 'budgets' | 'goals' | 'investments' | 'ai-advisor' | 'reports' | 'receipts' | 'financial-calendar' | 'budget-autopilot' | 'credit-score';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onSignOut: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'financial-calendar', label: 'Calendar', icon: Calendar },
  { id: 'net-worth', label: 'Net Worth', icon: Wallet },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: PieChart },
  { id: 'budget-autopilot', label: 'Autopilot', icon: Zap },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'credit-score', label: 'Credit Score', icon: ShieldCheck },
  { id: 'receipts', label: 'Receipts', icon: Receipt },
  { id: 'ai-advisor', label: 'AI Advisor', icon: MessageSquare },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
] as const;

export function Sidebar({ activeSection, onSectionChange, onSignOut, isOpen, setIsOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile Toggle */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "lg:hidden fixed top-4 left-4 z-[60] p-2.5 rounded-xl transition-all duration-300 shadow-lg",
          isOpen 
            ? "bg-background border border-primary/50 text-primary shadow-primary/20" 
            : "bg-card/60 backdrop-blur-xl border border-border text-slate-400 hover:text-primary hover:border-primary/30"
        )}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <button 
            onClick={() => {
              onSectionChange('dashboard');
              setIsOpen(false);
            }}
            className="flex items-center gap-3 mb-10 px-2 group w-full text-left transition-transform active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <TrendingUp size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight group-hover:text-primary transition-colors">
              Matt Financials
            </h1>
          </button>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSectionChange(item.id as Section);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden active:scale-[0.98]",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  )}
                >
                  <Icon size={20} className={cn(
                    "transition-all duration-300",
                    isActive ? "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "group-hover:text-slate-200"
                  )} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-6 mt-6 border-t border-border">
            <button
              type="button"
              onClick={() => {
                onSignOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-error hover:bg-error/10 transition-all duration-200 group relative overflow-hidden active:scale-[0.98] hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:border hover:border-error/20"
            >
              <LogOut size={20} className="group-hover:text-error group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-all duration-300" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <button 
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden cursor-default transition-all duration-500 animate-in fade-in"
        />
      )}
    </>
  );
}

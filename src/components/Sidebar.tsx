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
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

export type Section = 'dashboard' | 'net-worth' | 'transactions' | 'budgets' | 'goals' | 'investments' | 'ai-advisor' | 'reports' | 'receipts' | 'financial-calendar' | 'budget-autopilot' | 'credit-score';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onSignOut: () => void;
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

export function Sidebar({ activeSection, onSectionChange, onSignOut }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card/60 backdrop-blur-xl border border-border rounded-lg text-slate-400 hover:text-primary transition-colors shadow-xl"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Matt Financials
            </h1>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id as Section);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  )}
                >
                  <Icon size={20} className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "group-hover:text-slate-200"
                  )} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}

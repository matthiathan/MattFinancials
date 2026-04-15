import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Sidebar, Section } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/sections/Dashboard';
import { NetWorth } from './components/sections/NetWorth';
import { Transactions } from './components/sections/Transactions';
import { Budgets } from './components/sections/Budgets';
import { Goals } from './components/sections/Goals';
import { Investments } from './components/sections/Investments';
import { AIAdvisor } from './components/sections/AIAdvisor';
import { Reports } from './components/sections/Reports';
import { Receipts } from './components/sections/Receipts';
import { FinancialCalendar } from './components/sections/FinancialCalendar';
import { BudgetAutopilot } from './components/sections/BudgetAutopilot';
import { CreditScore } from './components/sections/CreditScore';

function MainContent() {
  const { user, loading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'net-worth': return <NetWorth />;
      case 'transactions': return <Transactions />;
      case 'budgets': return <Budgets />;
      case 'goals': return <Goals />;
      case 'investments': return <Investments />;
      case 'ai-advisor': return <AIAdvisor />;
      case 'reports': return <Reports />;
      case 'receipts': return <Receipts />;
      case 'financial-calendar': return <FinancialCalendar />;
      case 'budget-autopilot': return <BudgetAutopilot />;
      case 'credit-score': return <CreditScore />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-primary">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        onSignOut={signOut} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

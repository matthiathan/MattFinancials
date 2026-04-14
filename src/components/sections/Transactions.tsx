import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  MoreVertical,
  Loader2,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { cn, formatCurrency } from '../../lib/utils';
import { categorizeTransaction } from '../../services/aiService';

export function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ category: 'All', type: 'All' });
  const [search, setSearch] = useState('');
  const [isCategorizing, setIsCategorizing] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (data) setTransactions(data);
    setLoading(false);
  }

  const handleAutoCategorize = async () => {
    if (!formData.description) return;
    setIsCategorizing(true);
    const category = await categorizeTransaction(formData.description);
    setFormData(prev => ({ ...prev, category }));
    setIsCategorizing(false);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      date: formData.date
    });

    if (!error) {
      setShowModal(false);
      fetchTransactions();
      setFormData({
        amount: '',
        type: 'expense',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesCategory = filter.category === 'All' || filter.category === 'All Categories' || tx.category === filter.category;
    const matchesType = filter.type === 'All' || tx.type === filter.type;
    const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Transactions</h2>
          <p className="text-slate-400">View and manage your full transaction history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-card/40 border border-border rounded-xl text-sm font-medium text-slate-300 hover:bg-card/60 transition-all backdrop-blur-xl flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Plus size={18} />
            New Transaction
          </button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-border/50">
        <div className="p-6 border-b border-border bg-card/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="bg-background/50 border border-border rounded-xl py-2 px-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option>All Categories</option>
              <option>Food</option>
              <option>Housing</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Shopping</option>
              <option>Income</option>
            </select>
            <select 
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="bg-background/50 border border-border rounded-xl py-2 px-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="All">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="savings">Savings</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-border bg-card/10">
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Date</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Description</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Category</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Type</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right">Amount</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-2" /> Processing...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-500">No data streams found.</td></tr>
              ) : filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6 text-sm text-slate-500 font-mono">
                    {new Date(tx.date).toLocaleDateString('en-ZA')}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-200">{tx.description}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.category}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                      tx.type === 'income' ? "bg-success/10 text-success border-success/20" : 
                      tx.type === 'expense' ? "bg-error/10 text-error border-error/20" : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={cn(
                    "py-4 px-6 text-right font-black font-mono",
                    tx.type === 'income' ? "text-success" : "text-white"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-1 text-slate-600 hover:text-slate-400 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8 relative shadow-2xl neon-border">
            <h3 className="text-2xl font-bold text-white mb-6">New Transaction</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    onBlur={handleAutoCategorize}
                    className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="e.g. Woolworths"
                  />
                  {isCategorizing && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-bold text-primary animate-pulse">
                      <Sparkles size={12} />
                      AI Categorizing...
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount (R)</label>
                  <input 
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option>Food</option>
                    <option>Housing</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                    <option>Shopping</option>
                    <option>Income</option>
                    <option>Utilities</option>
                    <option>Subscriptions</option>
                    <option>Healthcare</option>
                    <option>Savings</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-card border border-border text-slate-400 rounded-xl font-bold hover:bg-card/80 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

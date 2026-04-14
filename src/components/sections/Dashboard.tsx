import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart as PieChartIcon, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Activity,
  Zap,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { Transaction, FinancialEvent } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { getFinancialInsights } from '../../services/aiService';
import { cn, formatCurrency } from '../../lib/utils';

const barData = [
  { name: 'Jan', income: 45000, expenses: 28000 },
  { name: 'Feb', income: 42000, expenses: 31000 },
  { name: 'Mar', income: 48000, expenses: 29000 },
  { name: 'Apr', income: 46000, expenses: 32000 },
  { name: 'May', income: 51000, expenses: 30000 },
  { name: 'Jun', income: 49000, expenses: 33000 },
];

const pieData = [
  { name: 'Housing', value: 12000 },
  { name: 'Food', value: 5500 },
  { name: 'Transport', value: 3200 },
  { name: 'Entertainment', value: 2800 },
];

const COLORS = ['#6366F1', '#22D3EE', '#10B981', '#F59E0B'];

export function Dashboard() {
  const { user } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<FinancialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);
      
      const { data: eventData } = await supabase
        .from('financial_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(3);

      if (txData) {
        setRecentTransactions(txData);
        const insight = await getFinancialInsights(txData);
        setAiInsight(insight);
      }
      if (eventData) setUpcomingEvents(eventData);
      
      setLoadingInsight(false);
      setLoading(false);
    }
    fetchData();
  }, []);

  const getEventTimeLabel = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return `in ${diffDays} days`;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Financial Command Center</h2>
          <p className="text-slate-400">Real-time analytics and AI-driven insights for your wealth.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-card/40 border border-border rounded-xl text-sm font-medium text-slate-300 hover:bg-card/60 transition-all backdrop-blur-xl">
            Export Data
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
            <Zap size={16} />
            Quick Action
          </button>
        </div>
      </div>

      {/* Top Row: AI Insight & Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-card/40 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 relative overflow-hidden group shadow-2xl neon-border"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={64} className="text-primary" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
              <Sparkles size={24} className="text-primary" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">AI Financial Intelligence</h4>
              {loadingInsight ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
                  <Loader2 size={14} className="animate-spin" />
                  Synthesizing data streams...
                </div>
              ) : (
                <p className="text-slate-200 leading-relaxed font-medium text-lg">
                  "{aiInsight}"
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <Card glow className="flex flex-col justify-center items-center text-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="65.6" className="text-primary" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">82</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Health Score</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest">Excellent</span>
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Net Worth', value: 1250000, change: '+2.4%', icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Monthly Income', value: 52000, change: '+5.1%', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Monthly Expenses', value: 31500, change: '-1.2%', icon: TrendingDown, color: 'text-error', bg: 'bg-error/10' },
          { label: 'Savings Rate', value: '39.4%', change: '+3.2%', icon: PieChartIcon, color: 'text-secondary', bg: 'bg-secondary/10' },
        ].map((stat, i) => (
          <Card key={i} className="hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2 rounded-lg border border-transparent group-hover:border-current/20 transition-all", stat.bg, stat.color)}>
                <stat.icon size={20} />
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                stat.change.startsWith('+') ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
              )}>
                {stat.change}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-white mt-1">
              {typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}
            </h3>
          </Card>
        ))}
      </div>

      {/* Charts & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Cash Flow Analytics</CardTitle>
              <CardDescription>Income vs Expenses trajectory</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-primary" /> Income
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-secondary" /> Expenses
              </div>
            </div>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R${value/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#F3F4F6', fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Bar dataKey="income" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#22D3EE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} className="text-primary" />
              <CardTitle>Upcoming Events</CardTitle>
            </div>
            <CardDescription>Scheduled financial activity</CardDescription>
          </CardHeader>
          <div className="flex-1 space-y-4">
            {upcomingEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                No upcoming events
              </div>
            ) : upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-background/40 rounded-xl border border-border group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <Zap size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{event.title}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{getEventTimeLabel(event.event_date)}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-white font-mono">{formatCurrency(event.amount)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-secondary" />
              <CardTitle>Spending Forecast</CardTitle>
            </div>
            <CardDescription>Predictive end-of-month analysis</CardDescription>
          </CardHeader>
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-background/40 rounded-xl border border-border">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Expected Expenses</p>
                <p className="text-xl font-black text-white">{formatCurrency(34500)}</p>
              </div>
              <div className="p-4 bg-background/40 rounded-xl border border-border">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Projected Savings</p>
                <p className="text-xl font-black text-success">{formatCurrency(17500)}</p>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-start gap-3">
                <Activity size={16} className="text-primary mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Based on your last 3 months, you are on track to save <span className="text-primary font-bold">R 2,400 more</span> than your average.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest data points from your accounts</CardDescription>
          </div>
          <button className="text-xs text-primary hover:text-primary/80 font-bold transition-colors uppercase tracking-widest">
            View Ledger
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="pb-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest px-2">Description</th>
                <th className="pb-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest px-2">Category</th>
                <th className="pb-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest px-2">Timestamp</th>
                <th className="pb-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest px-2 text-right">Magnitude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-2" /> Processing...</td></tr>
              ) : recentTransactions.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-slate-500">No data streams detected.</td></tr>
              ) : recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                        tx.type === 'income' ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
                      )}>
                        {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <span className="font-bold text-slate-200">{tx.description}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.category}</span>
                  </td>
                  <td className="py-4 px-2 text-xs text-slate-500 font-mono">
                    {new Date(tx.date).toLocaleDateString('en-ZA')}
                  </td>
                  <td className={cn(
                    "py-4 px-2 text-right font-black font-mono",
                    tx.type === 'income' ? "text-success" : "text-white"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
